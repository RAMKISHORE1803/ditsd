import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Layers, Info } from 'lucide-react';
interface District {
  // Primary fields
  id: string;                        // UUID primary key
  name: string;                      // District name
  code: string;                      // District code
  
  // Geographic information
  region?: string;                   // Region the district belongs to
  area_sqkm?: number;                // Area in square kilometers
  geometry?: any;                    // PostGIS geometry data (USER-DEFINED in PostgreSQL)
  
  // Demographics
  population?: number;               // Population count
  
  // Metadata
  created_at?: string;               // Creation timestamp
  updated_at?: string;               // Last update timestamp
  created_by?: string;               // User ID who created this record
}

/**
 * CoverageAnalysis entity representing infrastructure coverage analysis results
 */
 interface CoverageAnalysis {
  // Primary fields
  id?: string;                       // UUID primary key (optional as it may not be set for new records)
  district_id?: string;              // Foreign key to district
  
  // Coverage information
  coverage_level: string;            // Coverage level (High, Medium, Low)
  coverage_area?: any;               // PostGIS geometry data for coverage area (USER-DEFINED in PostgreSQL)
  population_covered?: number;       // Number of people covered
  percentage_covered?: number;       // Percentage of district covered
  
  // Analysis metadata
  coverage_type?: string;            // Type of coverage (telecom, internet, education, healthcare)
  last_calculated?: string;          // When the analysis was last run
  
  // For stylized representation or UI purposes
  color?: string;                    // Color representation based on coverage level
}

/**
 * AuthUser entity representing an authenticated user in the system
 */
 interface AuthUser {
  id: string;                        // UUID primary key
  name: string;                      // User name
  role: string;                      // Role (admin, editor, viewer)
  email?: string;                    // Email address
  created_at?: string;               // Creation timestamp
  updated_at?: string;               // Last update timestamp
}

/**
 * ActiveTab type for different infrastructure tabs
 */
 type ActiveTab = 'overview' | 'towers' | 'schools' | 'hospitals' | 'waterBodies' | 'coverage' | 'users';


// Color palette for coverage levels
const COVERAGE_COLORS: Record<string, string> = {
  High: '#4ade80', // green
  Medium: '#facc15', // yellow
  Low: '#f87171', // red
  'No Data': '#d1d5db' // gray
};

interface DistrictWithCoverage extends District {
  coverageLevel: string;
  percentage: number;
  population: number;
}

interface DistrictCoverageMapProps {
  coverageAnalyses: CoverageAnalysis[];
  districts: District[];
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
}

const DistrictCoverageMap: React.FC<DistrictCoverageMapProps> = ({ 
  coverageAnalyses, 
  districts, 
  selectedDistrictId, 
  onSelectDistrict 
}) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictWithCoverage | null>(null);
  const [mapData, setMapData] = useState<DistrictWithCoverage[]>([]);
  const [legendVisible, setLegendVisible] = useState<boolean>(true);
  
  // Process data for the map
  useEffect(() => {
    if (!districts || !coverageAnalyses) return;
    
    const districtMap: Record<string, { coverageLevel: string; percentage: number; population: number }> = {};
    
    // Create a lookup for coverage levels by district
    coverageAnalyses.forEach(analysis => {
      if (analysis.district_id) {
        districtMap[analysis.district_id] = {
          coverageLevel: analysis.coverage_level || 'No Data',
          percentage: analysis.percentage_covered || 0,
          population: analysis.population_covered || 0
        };
      }
    });
    
    // Map the district data with coverage information
    const data = districts.map(district => {
      const coverage = districtMap[district.id] || {
        coverageLevel: 'No Data',
        percentage: 0,
        population: 0
      };
      
      return {
        ...district,
        ...coverage
      };
    });
    
    setMapData(data);
  }, [districts, coverageAnalyses]);
  
  // Helper to get district scale based on population or area
  const getDistrictScale = (district: DistrictWithCoverage): number => {
    const baseSize = 1;
    const minScale = 0.8;
    const maxScale = 1.5;
    
    if (!district.population) return baseSize;
    
    // Normalize population on a scale from minScale to maxScale
    const maxPopulation = Math.max(...mapData.map(d => d.population || 0));
    if (maxPopulation === 0) return baseSize;
    
    const scale = minScale + ((district.population / maxPopulation) * (maxScale - minScale));
    
    return scale;
  };
  
  const handleDistrictHover = (district: DistrictWithCoverage | null): void => {
    setHoveredDistrict(district);
  };
  
  const handleDistrictClick = (districtId: string): void => {
    if (onSelectDistrict) {
      onSelectDistrict(districtId);
    }
  };
  
  // For simplicity, we'll create a stylized map instead of an actual geographic one
  // In a real application, this would be replaced with a proper map visualization
  // using a library like Mapbox, Leaflet, or react-simple-maps
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <Compass className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-800">Coverage by District</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setLegendVisible(!legendVisible)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
          >
            <Layers className="h-4 w-4 mr-1" />
            {legendVisible ? 'Hide Legend' : 'Show Legend'}
          </button>
        </div>
      </div>
      
      {/* Legend */}
      {legendVisible && (
        <div className="p-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            {Object.entries(COVERAGE_COLORS).map(([level, color]) => (
              <div key={level} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-1"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs text-gray-700">{level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Stylized Map */}
      <div className="relative p-4 h-96 bg-gray-50 overflow-hidden">
        {/* Simulated map grid */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`h-line-${i}`} className="border-t border-gray-400 col-span-12" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`v-line-${i}`} className="border-l border-gray-400 row-span-12" />
          ))}
        </div>
        
        {/* Districts visualization */}
        <div className="relative h-full flex flex-wrap justify-center items-center">
          {mapData.map((district, index) => {
            const isSelected = selectedDistrictId === district.id;
            const isHovered = hoveredDistrict?.id === district.id;
            const scale = getDistrictScale(district);
            
            // Calculate position using a grid-like layout
            // In a real app, use actual geolocation data
            const cols = Math.ceil(Math.sqrt(mapData.length));
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            const top = 10 + (row * (70 / cols)) + '%';
            const left = 10 + (col * (80 / cols)) + '%';
            
            return (
              <div
                key={district.id}
                className={`absolute rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${isSelected ? 'z-10 shadow-lg' : 'z-0'}
                  ${isHovered ? 'shadow-md' : ''}
                `}
                style={{
                  top,
                  left,
                  width: `${40 * scale}px`,
                  height: `${40 * scale}px`,
                  backgroundColor: COVERAGE_COLORS[district.coverageLevel] || COVERAGE_COLORS['No Data'],
                  borderColor: isSelected || isHovered ? '#3b82f6' : 'transparent',
                  opacity: district.percentage ? (0.3 + (district.percentage / 100) * 0.7) : 0.3
                }}
                onMouseEnter={() => handleDistrictHover(district)}
                onMouseLeave={() => handleDistrictHover(null)}
                onClick={() => handleDistrictClick(district.id)}
                title={district.name}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800 bg-white bg-opacity-70 px-1 rounded truncate max-w-full">
                    {district.name.length > 10 ? district.name.substring(0, 10) + '...' : district.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Hover information */}
        {hoveredDistrict && (
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border border-gray-200 max-w-xs">
            <div className="flex items-center mb-1">
              <MapPin className="h-4 w-4 mr-1 text-blue-600" />
              <h4 className="text-sm font-medium">{hoveredDistrict.name}</h4>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Coverage Level:</span>
                <span 
                  className="font-medium px-1.5 rounded"
                  style={{ color: COVERAGE_COLORS[hoveredDistrict.coverageLevel] }}
                >
                  {hoveredDistrict.coverageLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coverage:</span>
                <span className="font-medium">{hoveredDistrict.percentage}%</span>
              </div>
              {hoveredDistrict.population > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Population Covered:</span>
                  <span className="font-medium">{hoveredDistrict.population.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Note about visualization */}
        <div className="absolute bottom-2 right-2">
          <div className="flex items-center text-xs text-gray-400">
            <Info className="h-3 w-3 mr-1" />
            <span>Stylized representation. Size indicates relative population.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictCoverageMap;