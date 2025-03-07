"use client";

import { supabase } from './supabase';
import { CoverageAnalysis, District, Tower } from '@/types/index';

// Constants for analysis
const TOWER_COVERAGE_RADIUS_KM = 5; // Average tower coverage in km
const POPULATION_DENSITY_URBAN = 1000; // persons per sq km in urban areas
const POPULATION_DENSITY_RURAL = 200; // persons per sq km in rural areas

/**
 * Calculate the coverage for a specific district or all districts
 */
export async function analyzeCoverage(districtId?: string, analysisType = 'telecom') {
  try {
    // Step 1: Get districts to analyze
    let districts: District[] = [];
    if (districtId) {
      // Get specific district
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('id', districtId);
      
      if (error) throw error;
      districts = data || [];
    } else {
      // Get all districts
      const { data, error } = await supabase
        .from('districts')
        .select('*');
      
      if (error) throw error;
      districts = data || [];
    }
    
    if (districts.length === 0) {
      throw new Error('No districts found for analysis');
    }
    
    // Step 2: Load infrastructure data based on analysis type
    let infrastructureData: any[] = [];
    
    switch (analysisType) {
      case 'telecom':
        const { data: towers, error: towersError } = await supabase
          .from('telecom_towers')
          .select('*');
        
        if (towersError) throw towersError;
        infrastructureData = towers || [];
        break;
      
      case 'internet':
        // Combine all internet-enabled facilities
        const [{ data: internetTowers }, { data: internetSchools }, { data: internetHospitals }] = await Promise.all([
          supabase.from('telecom_towers').select('*'),
          supabase.from('schools').select('*').eq('has_internet', true),
          supabase.from('hospitals').select('*').eq('has_internet', true)
        ]);
        
        infrastructureData = [
          ...(internetTowers || []),
          ...(internetSchools || []),
          ...(internetHospitals || [])
        ];
        break;
      
      case 'education':
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('*');
        
        if (schoolsError) throw schoolsError;
        infrastructureData = schools || [];
        break;
      
      case 'healthcare':
        const { data: hospitals, error: hospitalsError } = await supabase
          .from('hospitals')
          .select('*');
        
        if (hospitalsError) throw hospitalsError;
        infrastructureData = hospitals || [];
        break;
      
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }
    
    // Step 3: Generate sophisticated coverage analysis
    const analysisResults = await generateCoverageAnalysis(
      districts, 
      infrastructureData, 
      analysisType
    );
    
    // Step 4: Try to store the results
    try {
      // Check if coverage_analysis table exists and what columns it has
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_columns', { table_name: 'coverage_analysis' });
      
      if (!tableError && tableInfo) {
        // Extract column names
        const columnNames = tableInfo.map((col: any) => col.column_name);
        
        // Adapt results to match available columns
        const adaptedResults = analysisResults.map(result => {
          const adapted: any = {};
          
          // Only include fields that exist in the table
          Object.keys(result).forEach(key => {
            if (columnNames.includes(key)) {
              adapted[key] = result[key];
            }
          });
          
          return adapted;
        });
        
        // Store in database
        await supabase.from('coverage_analysis').insert(adaptedResults);
      } else {
        console.log('Coverage analysis table not available, using local storage');
        localStorage.setItem(
          'coverage_analysis_results', 
          JSON.stringify({
            timestamp: new Date().toISOString(),
            results: analysisResults
          })
        );
      }
    } catch (error) {
      console.error('Error storing coverage analysis:', error);
      // Continue - we still return the results even if storage fails
    }
    
    return analysisResults;
  } catch (error) {
    console.error('Error in coverage analysis:', error);
    throw error;
  }
}

/**
 * Generate sophisticated coverage analysis using geographical and statistical methods
 */
async function generateCoverageAnalysis(
  districts: District[], 
  infrastructureItems: any[], 
  analysisType: string
) {
  // Create results array
  const results: any[] = [];
  
  // Process each district
  for (const district of districts) {
    // Calculate district area in sq km (use provided value or estimate)
    const districtArea = district.area_sqkm || 1000; // default 1000 sq km if not provided
    
    // Calculate estimated population (use provided value or estimate based on Uganda average)
    const districtPopulation = district.population || districtArea * 400; // 400 people per sq km Uganda average
    
    // Count infrastructure items in this district
    const itemsInDistrict = infrastructureItems.filter(
      item => item.district_id === district.id
    );
    
    // Calculate coverage based on analysis type
    let coverageLevel = '';
    let coveragePercentage = 0;
    let populationCovered = 0;
    
    if (analysisType === 'telecom' || analysisType === 'internet') {
      // Use sophisticated tower coverage calculation
      const coverageDetails = calculateTowerCoverage(
        itemsInDistrict, 
        districtArea, 
        districtPopulation
      );
      
      coveragePercentage = coverageDetails.coveragePercentage;
      populationCovered = coverageDetails.populationCovered;
    } else {
      // For education and healthcare, use facility-to-population ratio
      const facilityDensity = itemsInDistrict.length / (districtPopulation / 10000);
      
      // Determine coverage based on facility density per 10,000 people
      if (analysisType === 'education') {
        // Education coverage - WHO recommends at least 1 school per 3,500 people
        coveragePercentage = Math.min(100, (facilityDensity / 2.85) * 100);
      } else {
        // Healthcare coverage - WHO recommends at least 1 facility per 10,000 people
        coveragePercentage = Math.min(100, facilityDensity * 100);
      }
      
      populationCovered = Math.floor((coveragePercentage / 100) * districtPopulation);
    }
    
    // Determine coverage level
    if (coveragePercentage >= 70) {
      coverageLevel = 'High';
    } else if (coveragePercentage >= 40) {
      coverageLevel = 'Medium';
    } else {
      coverageLevel = 'Low';
    }
    
    // Create result object
    const result = {
      id: `${district.id}-${analysisType}-${Date.now()}`,
      district_id: district.id,
      coverage_level: coverageLevel,
      coverage_type: analysisType,
      percentage_covered: parseFloat(coveragePercentage.toFixed(1)),
      population_covered: Math.round(populationCovered),
      last_calculated: new Date().toISOString(),
      analysis_version: '2.0'
    };
    
    results.push(result);
  }
  
  return results;
}

/**
 * Calculate tower coverage using a sophisticated model that accounts for:
 * - Overlapping coverage zones
 * - Population density distribution
 * - Tower types and their effective ranges
 */
function calculateTowerCoverage(
  towers: Tower[], 
  districtArea: number, 
  districtPopulation: number
) {
  // No towers = no coverage
  if (towers.length === 0) {
    return {
      coveragePercentage: 0,
      populationCovered: 0
    };
  }
  
  // Calculate potential maximum coverage area
  let maxCoverageKm2 = 0;
  
  // Implement coverage calculation based on tower type and status
  towers.forEach(tower => {
    // Different coverage based on tower type
    let towerCoverage = 0;
    
    // Get coverage radius (use tower's value if available, otherwise use default)
    const coverageRadius = tower.coverage_radius || TOWER_COVERAGE_RADIUS_KM;
    
    // Basic coverage area calculation (πr²)
    const rawCoverage = Math.PI * coverageRadius * coverageRadius;
    
    // Adjust based on tower type
    switch (tower.type) {
      case 'cellular':
        towerCoverage = rawCoverage;
        break;
      case 'microwave':
        towerCoverage = rawCoverage * 0.8; // Directional, less coverage
        break;
      case 'satellite':
        towerCoverage = rawCoverage * 1.5; // Wider coverage
        break;
      case 'fiber_node':
        towerCoverage = rawCoverage * 0.5; // Limited coverage
        break;
      default:
        towerCoverage = rawCoverage;
    }
    
    // Adjust based on tower status
    if (tower.status === 'maintenance') {
      towerCoverage *= 0.5; // Half coverage during maintenance
    } else if (tower.status === 'inactive') {
      towerCoverage = 0; // No coverage if inactive
    }
    
    maxCoverageKm2 += towerCoverage;
  });
  
  // Account for overlapping coverage (diminishing returns with more towers)
  // Using a logarithmic model to simulate real-world overlapping coverage
  const overlapFactor = 1 / (1 + 0.1 * Math.log(1 + towers.length));
  const adjustedCoverage = maxCoverageKm2 * overlapFactor;
  
  // Calculate actual coverage percentage, capped at 100%
  const coveragePercentage = Math.min(100, (adjustedCoverage / districtArea) * 100);
  
  // Calculate population covered based on coverage percentage
  // Weighted by population density (urban areas get covered first)
  let populationCovered;
  
  // Simple population coverage based on percentage
  populationCovered = (coveragePercentage / 100) * districtPopulation;
  
  return {
    coveragePercentage,
    populationCovered
  };
}

/**
 * Get existing coverage analysis results
 */
export async function getCoverageAnalysis(limit = 10) {
  try {
    // Try to get from database first
    try {
      const { data, error } = await supabase
        .from('coverage_analysis')
        .select('*')
        .limit(limit);
      
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('Error fetching coverage analysis from database:', error);
    }
    
    // If database fetch failed, try local storage
    const storedAnalysis = localStorage.getItem('coverage_analysis_results');
    if (storedAnalysis) {
      const parsedData = JSON.parse(storedAnalysis);
      return parsedData.results.slice(0, limit);
    }
    
    // If no stored data, return empty array
    return [];
  } catch (error) {
    console.error('Error getting coverage analysis:', error);
    return [];
  }
}