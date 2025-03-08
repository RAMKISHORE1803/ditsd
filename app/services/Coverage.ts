"use client";

import { v4 as uuidv4 } from 'uuid';
import { District, Tower, School, Hospital, CoverageAnalysis } from '@/types';

// Constants for coverage calculations
const COVERAGE_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// Interface for heatmap cell data
interface HeatmapCell {
  value: number;
  hasTower: boolean;
}

// Interface for coverage result
interface CoverageResult {
  percentage: number;
  coverageGeometry: string | null;
}

// Interface for metrics result
interface CoverageMetrics {
  averageCoverage: number;
  populationCovered: number;
  totalPopulation: number;
  connectionQuality: string;
  infrastructureUtilization: number;
  coverageDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  districtRankings: Array<{name: string, value: number}>;
  growthTrend: Array<{name: string, value: number}>;
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Extract coordinates from PostGIS location object
function getCoordinates(locationObj: any): { latitude: number; longitude: number } | null {
  if (!locationObj) {
    return null;
  }
  
  try {
    // Handle GeoJSON-like format (common in PostGIS JSON responses)
    if (locationObj.type === 'Point' && Array.isArray(locationObj.coordinates)) {
      return {
        longitude: locationObj.coordinates[0],
        latitude: locationObj.coordinates[1]
      };
    }
    
    // Handle PostGIS raw format where location is a custom object with x/y or lon/lat
    if (typeof locationObj === 'object' && (locationObj.x !== undefined || locationObj.lon !== undefined)) {
      return {
        longitude: locationObj.x !== undefined ? locationObj.x : locationObj.lon,
        latitude: locationObj.y !== undefined ? locationObj.y : locationObj.lat
      };
    }
    
    // Handle situation where locationObj might be serialized as a string
    if (typeof locationObj === 'string') {
      // Try to parse EWKT format: "SRID=4326;POINT(longitude latitude)"
      const ewktMatch = locationObj.match(/SRID=\d+;POINT\(([^ ]+) ([^)]+)\)/i);
      if (ewktMatch) {
        return {
          longitude: parseFloat(ewktMatch[1]),
          latitude: parseFloat(ewktMatch[2])
        };
      }
      
      // Try to parse WKT format: "POINT(longitude latitude)"
      const wktMatch = locationObj.match(/POINT\(([^ ]+) ([^)]+)\)/i);
      if (wktMatch) {
        return {
          longitude: parseFloat(wktMatch[1]),
          latitude: parseFloat(wktMatch[2])
        };
      }
      
      // Try to parse as JSON string
      try {
        const parsed = JSON.parse(locationObj);
        if (parsed.type === 'Point' && Array.isArray(parsed.coordinates)) {
          return {
            longitude: parsed.coordinates[0],
            latitude: parsed.coordinates[1]
          };
        }
      } catch (e) {
        // Not a JSON string, continue to other formats
      }
    }
    
    // Handle direct lat/lng properties
    if (locationObj.latitude !== undefined && locationObj.longitude !== undefined) {
      return {
        latitude: locationObj.latitude,
        longitude: locationObj.longitude
      };
    }
    
    // Last resort - try to find any properties that might be coordinates
    const candidateProps = ['latitude', 'lat', 'y', 'longitude', 'lon', 'lng', 'x'];
    let coords: {latitude?: number, longitude?: number} = {};
    for (const prop of candidateProps) {
      if (locationObj[prop] !== undefined) {
        if (prop === 'latitude' || prop === 'lat' || prop === 'y') {
          coords.latitude = locationObj[prop];
        }
        if (prop === 'longitude' || prop === 'lon' || prop === 'lng' || prop === 'x') {
          coords.longitude = locationObj[prop];
        }
      }
    }
    
    if (coords.latitude !== undefined && coords.longitude !== undefined) {
      return coords as {latitude: number, longitude: number};
    }
  } catch (error) {
    console.error('Error extracting coordinates:', error);
  }
  
  // If we can't determine the format, return null
  console.warn('Unable to extract coordinates from location object:', locationObj);
  return null;
}

// Create a PostGIS-compatible geometry for coverage area
function createCirclePolygon(centerLat: number, centerLon: number, radiusKm: number, numPoints: number = 32): string {
  // Generate a simplified WKT polygon that approximates a circle
  // In production, you would use ST_Buffer in PostGIS directly
  
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    
    // Convert dx/dy to longitude/latitude offsets
    // This is a simplified approach - PostGIS would handle this better
    const latOffset = (dy / 6371) * (180 / Math.PI);
    const lonOffset = (dx / (6371 * Math.cos(centerLat * Math.PI / 180))) * (180 / Math.PI);
    
    points.push(`${centerLon + lonOffset} ${centerLat + latOffset}`);
  }
  
  // Close the polygon by repeating the first point
  points.push(points[0]);
  
  // Create WKT polygon
  return `POLYGON((${points.join(',')}))`;
}

// Create multi-polygon for multiple coverage areas
function createMultiPolygon(coveragePolygons: string[]): string | null {
  if (!coveragePolygons || coveragePolygons.length === 0) {
    return null;
  }
  
  // Strip the 'POLYGON' prefix from each polygon
  const polygonBodies = coveragePolygons.map(poly => {
    return poly.replace('POLYGON', '').trim();
  });
  
  // Create WKT multipolygon
  return `MULTIPOLYGON(${polygonBodies.join(',')})`;
}

// Main coverage analysis function optimized for PostGIS data
export async function analyzeCoverage(
  districtId: string | null = null,
  analysisType: string = 'telecom',
  towers: Tower[] = [],
  schools: School[] = [],
  hospitals: Hospital[] = [],
  districts: District[] = [],
  userId: string | null = null
): Promise<CoverageAnalysis[]> {
  console.log(`Starting ${analysisType} coverage analysis for district: ${districtId || 'All'}`);
  
  try {
    const results: CoverageAnalysis[] = [];
    
    // Filter districts if a specific one is requested
    const targetDistricts = districtId 
      ? districts.filter(d => d.id === districtId)
      : districts;
    
    // If no districts found, return empty results
    if (!targetDistricts.length) {
      console.error('No districts found for analysis');
      return [];
    }
    
    // Process each district
    for (const district of targetDistricts) {
      console.log(`Processing district: ${district.name}`);
      
      // Get towers in this district 
      let districtTowers = towers.filter(tower => tower.district_id === district.id);
      
      // Get active towers
      const activeTowers = districtTowers.filter(tower => {
        return tower.status === 'active' || tower.status === 'Active';
      });
      
      console.log(`Found ${activeTowers.length} active towers out of ${districtTowers.length} total in district ${district.name}`);
      
      // Get schools and hospitals in this district
      const districtSchools = schools.filter(s => s.district_id === district.id);
      const districtHospitals = hospitals.filter(h => h.district_id === district.id);
      
      // Calculate metrics based on analysis type
      let coveragePercentage = 0;
      let populationCovered = 0;
      let totalPopulation = district.population || 0;
      let coverageArea = null;
      
      if (analysisType === 'telecom' || analysisType === 'internet') {
        // Calculate telecom coverage based on tower coverage
        const coverageResult = calculateTelecomCoverage(activeTowers, district);
        coveragePercentage = coverageResult.percentage;
        coverageArea = coverageResult.coverageGeometry;
        
        // Estimate population covered based on coverage percentage
        populationCovered = Math.round(totalPopulation * (coveragePercentage / 100));
      } 
      else if (analysisType === 'education') {
        // Calculate education coverage based on schools with internet
        const schoolsWithInternet = districtSchools.filter(s => s.has_internet);
        coveragePercentage = districtSchools.length > 0 
          ? (schoolsWithInternet.length / districtSchools.length) * 100 
          : 0;
          
        // Estimate population coverage based on student counts
        const totalStudents = districtSchools.reduce((sum, school) => sum + (school.student_count || 0), 0);
        const studentsWithInternet = schoolsWithInternet.reduce((sum, school) => sum + (school.student_count || 0), 0);
        
        // Calculate student coverage
        const studentCoverage = totalStudents > 0 ? (studentsWithInternet / totalStudents) * 100 : 0;
        
        // Use average of school coverage and student coverage for final percentage
        coveragePercentage = (coveragePercentage + studentCoverage) / 2;
        
        // Estimate population covered
        populationCovered = Math.round(totalPopulation * (coveragePercentage / 100));
        
        // Generate coverage area for schools with internet
        if (schoolsWithInternet.length > 0) {
          const schoolPolygons: string[] = [];
          
          for (const school of schoolsWithInternet) {
            const coords = getCoordinates(school.location);
            if (coords) {
              // Use a standard 2km radius for school coverage
              schoolPolygons.push(createCirclePolygon(coords.latitude, coords.longitude, 2));
            }
          }
          
          if (schoolPolygons.length > 0) {
            coverageArea = createMultiPolygon(schoolPolygons);
          }
        }
      }
      else if (analysisType === 'healthcare') {
        // Calculate healthcare coverage based on hospitals with internet
        const hospitalsWithInternet = districtHospitals.filter(h => h.has_internet);
        coveragePercentage = districtHospitals.length > 0 
          ? (hospitalsWithInternet.length / districtHospitals.length) * 100 
          : 0;
        
        // Factor in hospital capacity (beds) for better estimate
        const totalBeds = districtHospitals.reduce((sum, hospital) => sum + (hospital.beds || 0), 0);
        const bedsWithInternet = hospitalsWithInternet.reduce((sum, hospital) => sum + (hospital.beds || 0), 0);
        
        // Calculate bed coverage
        const bedCoverage = totalBeds > 0 ? (bedsWithInternet / totalBeds) * 100 : 0;
        
        // Use average of hospital coverage and bed coverage for final percentage
        coveragePercentage = (coveragePercentage + bedCoverage) / 2;
        
        // Estimate population covered
        populationCovered = Math.round(totalPopulation * (coveragePercentage / 100));
        
        // Generate coverage area for hospitals with internet
        if (hospitalsWithInternet.length > 0) {
          const hospitalPolygons: string[] = [];
          
          for (const hospital of hospitalsWithInternet) {
            const coords = getCoordinates(hospital.location);
            if (coords) {
              // Use a standard 5km radius for hospital coverage
              hospitalPolygons.push(createCirclePolygon(coords.latitude, coords.longitude, 5));
            }
          }
          
          if (hospitalPolygons.length > 0) {
            coverageArea = createMultiPolygon(hospitalPolygons);
          }
        }
      }
      
      // Determine coverage level based on percentage
      const coverageLevel = 
        coveragePercentage >= 70 ? COVERAGE_LEVELS.HIGH :
        coveragePercentage >= 40 ? COVERAGE_LEVELS.MEDIUM :
        COVERAGE_LEVELS.LOW;
      
      // Create the coverage analysis result object matching the DB schema
      const analysisResult: CoverageAnalysis = {
        id: uuidv4(), // Generate a unique ID
        district_id: district.id,
        coverage_level: coverageLevel,
        coverage_area: coverageArea, // PostGIS geometry as WKT
        percentage_covered: parseFloat(coveragePercentage.toFixed(1)),
        population_covered: populationCovered,
        last_calculated: new Date().toISOString(),
      };
      
      console.log(`Analysis result for ${district.name}:`, {
        district: district.name,
        coverage_level: analysisResult.coverage_level,
        percentage_covered: analysisResult.percentage_covered,
        population_covered: analysisResult.population_covered
      });
      
      results.push(analysisResult);
    }
    
    console.log(`Analysis complete. Generated ${results.length} results.`);
    return results;
    
  } catch (error) {
    console.error('Error in coverage analysis:', error);
    throw new Error(`Coverage analysis failed: ${error}`);
  }
}

// Calculate telecom coverage for a district with PostGIS considerations
function calculateTelecomCoverage(towers: Tower[], district: District): CoverageResult {
  // If no towers or district, return zero coverage
  if (!towers.length || !district) {
    return { 
      percentage: 0,
      coverageGeometry: null
    };
  }
  
  // Create coverage polygons for each tower
  const coveragePolygons: string[] = [];
  let totalCoverageArea = 0;
  
  for (const tower of towers) {
    // Get tower coordinates
    const towerLocation = getCoordinates(tower.location);
    if (!towerLocation) {
      console.warn(`Tower ${tower.id} has invalid location data, skipping...`);
      continue;
    }
    
    // Get coverage radius from tower data (in km)
    // Use coverage_radius field from schema
    const coverageRadius = tower.coverage_radius || 5; // Default 5km if not specified
    
    // Generate a circle polygon for this tower's coverage
    const circlePolygon = createCirclePolygon(
      towerLocation.latitude,
      towerLocation.longitude,
      coverageRadius
    );
    
    coveragePolygons.push(circlePolygon);
    
    // Calculate circular coverage area (πr²)
    const coverageArea = Math.PI * Math.pow(coverageRadius, 2);
    totalCoverageArea += coverageArea;
  }
  
  // Account for overlap (simplified estimation)
  // As tower count increases, overlap likely increases
  const overlapFactor = 1 - Math.min(0.7, 0.1 * Math.log(towers.length + 1));
  const adjustedCoverageArea = totalCoverageArea * overlapFactor;
  
  // Calculate percentage covered
  let percentageCovered = 0;
  
  if (district.area_sqkm) {
    percentageCovered = (adjustedCoverageArea / district.area_sqkm) * 100;
  } else {
    // If we don't have area information, use tower density as a proxy
    // Estimating 1 tower per 25 sq km for full coverage
    const estimatedAreaSqKm = district.population ? district.population / 100 : 1000;
    const idealTowerCount = estimatedAreaSqKm / 25;
    percentageCovered = Math.min(100, (towers.length / idealTowerCount) * 100);
  }
  
  // Cap at 100%
  percentageCovered = Math.min(100, percentageCovered);
  
  // Create a multi-polygon for all tower coverages
  const coverageGeometry = coveragePolygons.length > 0 
    ? createMultiPolygon(coveragePolygons)
    : null;
  
  return {
    percentage: percentageCovered,
    coverageGeometry: coverageGeometry
  };
}

// Calculate metrics for dashboard visualizations
export function calculateCoverageMetrics(
  coverageAnalyses: CoverageAnalysis[],
  districts: District[],
  towers: Tower[],
  schools: School[],
  hospitals: Hospital[]
): CoverageMetrics {
  // Initialize metrics object
  const metrics: CoverageMetrics = {
    averageCoverage: 0,
    populationCovered: 0,
    totalPopulation: 0,
    connectionQuality: 'Poor',
    infrastructureUtilization: 0,
    coverageDistribution: {
      high: 0,
      medium: 0,
      low: 0
    },
    districtRankings: [],
    growthTrend: []
  };
  
  // Skip calculations if no data
  if (!coverageAnalyses.length || !districts.length) {
    return metrics;
  }
  
  // Calculate average coverage and population metrics
  let totalCoveragePercent = 0;
  let highCoverageCount = 0;
  let mediumCoverageCount = 0;
  let lowCoverageCount = 0;
  
  for (const analysis of coverageAnalyses) {
    totalCoveragePercent += analysis.percentage_covered || 0;
    metrics.populationCovered += analysis.population_covered || 0;
    
    // Get district population
    const district = districts.find(d => d.id === analysis.district_id);
    if (district) {
      metrics.totalPopulation += district.population || 0;
    }
    
    // Count coverage levels for distribution
    if (analysis.coverage_level === COVERAGE_LEVELS.HIGH) highCoverageCount++;
    else if (analysis.coverage_level === COVERAGE_LEVELS.MEDIUM) mediumCoverageCount++;
    else if (analysis.coverage_level === COVERAGE_LEVELS.LOW) lowCoverageCount++;
  }
  
  // Calculate averages and percentages
  metrics.averageCoverage = parseFloat((totalCoveragePercent / coverageAnalyses.length).toFixed(1));
  
  // Determine connection quality based on average coverage
  metrics.connectionQuality = 
    metrics.averageCoverage >= 75 ? 'Excellent' :
    metrics.averageCoverage >= 60 ? 'Good' :
    metrics.averageCoverage >= 40 ? 'Fair' : 'Poor';
  
  // Calculate infrastructure utilization
  const activeTowers = towers.filter(t => t.status === 'active' || t.status === 'Active').length;
  metrics.infrastructureUtilization = parseFloat(((activeTowers / towers.length) * 100).toFixed(1)) || 0;
  
  // Calculate coverage distribution
  const totalAnalyses = coverageAnalyses.length;
  metrics.coverageDistribution = {
    high: parseFloat(((highCoverageCount / totalAnalyses) * 100).toFixed(0)),
    medium: parseFloat(((mediumCoverageCount / totalAnalyses) * 100).toFixed(0)),
    low: parseFloat(((lowCoverageCount / totalAnalyses) * 100).toFixed(0))
  };
  
  // Generate district rankings
  metrics.districtRankings = districts
    .filter(d => {
      // Find corresponding analysis
      const analysis = coverageAnalyses.find(a => a.district_id === d.id);
      return analysis !== undefined;
    })
    .map(d => {
      const analysis = coverageAnalyses.find(a => a.district_id === d.id);
      return {
        name: d.name,
        value: analysis && analysis.percentage_covered !== undefined ? analysis.percentage_covered : 0
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Generate growth trend (in production, you'd pull historical data)
  const baseValue = metrics.averageCoverage - (Math.random() * 10 + 5);
  metrics.growthTrend = [
    { name: 'Jan', value: Math.max(0, baseValue - 5 + Math.random() * 10) },
    { name: 'Feb', value: Math.max(0, baseValue - 3 + Math.random() * 10) },
    { name: 'Mar', value: Math.max(0, baseValue - 1 + Math.random() * 10) },
    { name: 'Apr', value: Math.max(0, baseValue + 1 + Math.random() * 10) },
    { name: 'May', value: Math.max(0, baseValue + 3 + Math.random() * 10) },
    { name: 'Jun', value: metrics.averageCoverage }
  ];
  
  return metrics;
}

// Calculate additional metrics for the advanced analytics section
export function calculateEfficiencyScore(coverage: number, towerCount: number, districtCount: number): number {
  if (!towerCount || !districtCount) return 0;
  
  // Base score on coverage percentage
  let score = coverage * 0.8;
  
  // Adjust based on tower density
  const density = towerCount / districtCount;
  
  // Higher score for achieving good coverage with fewer towers
  if (density > 0 && coverage > 0) {
    const efficiencyFactor = (coverage / density) / 50;
    score += Math.min(20, efficiencyFactor);
  }
  
  return Math.min(100, Math.round(score));
}

export function calculateReliabilityIndex(towers: Tower[], coverage: number): number {
  if (!towers.length) return 0;
  
  // Count active towers
  const activeTowers = towers.filter(t => t.status === 'active' || t.status === 'Active').length;
  const activeRatio = activeTowers / towers.length;
  
  // Base score on active ratio
  let score = activeRatio * 70;
  
  // Add points for coverage
  score += coverage * 0.3;
  
  return Math.min(100, Math.round(score));
}

export function calculateInfrastructureHealth(towers: Tower[]): number {
  if (!towers.length) return 0;
  
  // Count towers with recent maintenance
  const maintainedTowers = towers.filter(tower => {
    if (!tower.last_maintenance) return false;
    
    // Check if maintenance was within the last year
    const lastMaintenance = new Date(tower.last_maintenance);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return lastMaintenance >= oneYearAgo;
  }).length;
  
  // Base health score on percentage of maintained towers
  const maintenanceScore = (maintainedTowers / towers.length) * 60;
  
  // Add points for active status
  const activeTowers = towers.filter(t => t.status === 'active' || t.status === 'Active').length;
  const activeScore = (activeTowers / towers.length) * 40;
  
  return Math.round(maintenanceScore + activeScore);
}

export function calculateGrowthCapacity(coverage: number, utilization: number): number {
  // More room for growth when coverage is lower and utilization is lower
  const growthSpace = (100 - coverage) * 0.3;
  const utilizationSpace = (100 - utilization) * 0.2;
  
  // Add base growth factor
  const baseGrowth = 5;
  
  return Math.round(baseGrowth + growthSpace + utilizationSpace);
}

// Generate heatmap cells for visualization
export function generateHeatmapCells(
  coverageAnalyses: CoverageAnalysis[], 
  towers: Tower[], 
  districts: District[]
): HeatmapCell[] {
  const cellCount = 25; // 5x5 grid
  const cells: HeatmapCell[] = [];
  
  // If we have no data, generate placeholder
  if (!coverageAnalyses.length) {
    for (let i = 0; i < cellCount; i++) {
      cells.push({
        value: Math.random() * 100,
        hasTower: Math.random() > 0.7
      });
    }
    return cells;
  }
  
  // Use real coverage data to generate cells
  // Map districts to cells in the grid
  const districtMap: Record<string, number> = {};
  let cellIndex = 0;
  
  for (const district of districts.slice(0, cellCount)) {
    districtMap[district.id] = cellIndex++;
    
    // Find the coverage analysis for this district
    const analysis = coverageAnalyses.find(a => a.district_id === district.id);
    
    // Find towers in this district
    const districtTowers = towers.filter(t => t.district_id === district.id);
    
    cells.push({
      value: analysis ? (analysis.percentage_covered ?? 0) : Math.random() * 100,
      hasTower: districtTowers.length > 0
    });
  }
  
  // Fill remaining cells if needed
  while (cells.length < cellCount) {
    cells.push({
      value: Math.random() * 100,
      hasTower: Math.random() > 0.7
    });
  }
  
  return cells;
}

// Generate path for trend line from data points
export function generateTrendLinePath(data: Array<{name: string, value: number}>): string {
  if (!data || !data.length) {
    return "M0,50 L100,50";
  }
  
  // Map data points to SVG coordinates
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    // Scale value to fit within 0-100, flipped for y-axis (0 is top)
    const y = 100 - (point.value);
    return `${x},${y}`;
  });
  
  return "M" + points.join(" L");
}

// Generate path for trend area (adds bottom line to create filled area)
export function generateTrendAreaPath(data: Array<{name: string, value: number}>): string {
  if (!data || !data.length) {
    return "M0,50 L100,50 L100,100 L0,100 Z";
  }
  
  const linePath = generateTrendLinePath(data);
  return linePath + ` L100,100 L0,100 Z`;
}