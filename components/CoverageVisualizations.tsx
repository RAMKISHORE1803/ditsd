import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  MapPin, BarChart2, Activity, Users,
  Grid, ChevronDown, ChevronUp
} from 'lucide-react';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const COVERAGE_COLORS: Record<string, string> = {
  High: '#4ade80', // green
  Medium: '#facc15', // yellow
  Low: '#f87171', // red
};

interface CoverageVisualizationsProps {
  coverageAnalyses: CoverageAnalysis[];
  districts: District[];
  analysisType?: string;
  fullScreen?: boolean;
}

interface ChartData {
  coverageLevelData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  districtCoverageData: Array<{
    name: string;
    coverage: number;
    level: string;
    population: number;
  }>;
  populationData: Array<{
    name: string;
    covered: number;
    total: number;
    uncovered: number;
  }>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CoverageVisualizations: React.FC<CoverageVisualizationsProps> = ({ 
  coverageAnalyses, 
  districts, 
  analysisType = 'telecom',
  fullScreen = false
}) => {
  const [activeChart, setActiveChart] = useState<string>('coverage-map');
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // Process data for different chart types
  const chartData = useMemo<ChartData>(() => {
    // Filter analyses by the selected type
    const filteredAnalyses = coverageAnalyses.filter(
      analysis => !analysis.coverage_type || analysis.coverage_type === analysisType
    );
    
    // Get district names map for lookups
    const districtMap = districts.reduce<Record<string, string>>((acc, district) => {
      acc[district.id] = district.name;
      return acc;
    }, {});
    
    // Coverage distribution by level
    const coverageLevelData = ['High', 'Medium', 'Low'].map(level => {
      const count = filteredAnalyses.filter(a => a.coverage_level === level).length;
      return {
        name: level,
        value: count,
        color: COVERAGE_COLORS[level] || '#d1d5db'
      };
    }).filter(item => item.value > 0);
    
    // District coverage percentage
    const districtCoverageData = filteredAnalyses.map(analysis => {
      return {
        name: analysis.district_id ? districtMap[analysis.district_id] : 'Unknown',
        coverage: analysis.percentage_covered || 0,
        level: analysis.coverage_level || 'Low',
        population: analysis.population_covered || 0
      };
    }).sort((a, b) => b.coverage - a.coverage);
    
    // Population coverage data
    const populationData = filteredAnalyses.map(analysis => {
      const district = districts.find(d => d.id === analysis.district_id);
      const totalPopulation = district ? district.population : 0;
      
      return {
        name: analysis.district_id ? districtMap[analysis.district_id] : 'Unknown',
        covered: analysis.population_covered || 0,
        total: totalPopulation || 0,
        uncovered: (totalPopulation || 0) - (analysis.population_covered || 0)
      };
    }).sort((a, b) => b.covered - a.covered);
    
    return {
      coverageLevelData,
      districtCoverageData,
      populationData
    };
  }, [coverageAnalyses, districts, analysisType]);
  
  // Format the y-axis percentage
  const formatYAxis = (value: number): string => `${value}%`;
  
  // Custom tooltip to show both population and percentage
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-green-600">Coverage: {payload[0].value}%</p>
          {payload[0].payload.population && (
            <p className="text-blue-600">Population: {payload[0].payload.population.toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md text-xs">
          <p className="font-medium">{payload[0].name} Coverage</p>
          <p style={{ color: payload[0].payload.color }}>
            {payload[0].value} {payload[0].value === 1 ? 'district' : 'districts'}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Simplified district map (placeholder for actual map visualization)
  const DistrictCoverageMap: React.FC = () => (
    <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center justify-center">
      <div className="text-center mb-4">
        <h3 className="text-gray-700 font-medium text-sm mb-2">Coverage by District</h3>
        <p className="text-xs text-gray-500">Visual representation of coverage levels across districts</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
        {chartData.districtCoverageData.map((district, idx) => (
          <div 
            key={idx} 
            className="border rounded-md p-3 flex flex-col items-center relative overflow-hidden"
            style={{
              borderColor: COVERAGE_COLORS[district.level] || '#d1d5db'
            }}
          >
            <div 
              className="absolute bottom-0 left-0 right-0"
              style={{
                backgroundColor: COVERAGE_COLORS[district.level] || '#d1d5db',
                height: `${district.coverage}%`,
                opacity: 0.15
              }}
            ></div>
            <MapPin 
              size={16} 
              className="mb-1"
              style={{ color: COVERAGE_COLORS[district.level] || '#d1d5db' }}
            />
            <span className="text-xs font-medium text-gray-800 truncate max-w-full">
              {district.name}
            </span>
            <span className="text-xs font-bold" style={{ color: COVERAGE_COLORS[district.level] || '#d1d5db' }}>
              {district.coverage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
  
  const DistrictCoverageBarChart: React.FC = () => (
    <div className="bg-white p-4 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-gray-700 font-medium text-sm">Coverage Percentage by District</h3>
        <p className="text-xs text-gray-500">Comparing coverage levels across different districts</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData.districtCoverageData.slice(0, 10)} // Only show top 10 districts
            layout="vertical"
            margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={formatYAxis} />
            <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="coverage"
              barSize={12}
              radius={[0, 4, 4, 0]}
            >
              {chartData.districtCoverageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COVERAGE_COLORS[entry.level] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  
  const CoverageLevelPieChart: React.FC = () => (
    <div className="bg-white p-4 rounded-lg">
      <div className="text-center mb-2">
        <h3 className="text-gray-700 font-medium text-sm">Coverage Level Distribution</h3>
        <p className="text-xs text-gray-500">Number of districts at each coverage level</p>
      </div>
      
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.coverageLevelData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.coverageLevelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center space-x-4 mt-2">
        {chartData.coverageLevelData.map((level, idx) => (
          <div key={idx} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: level.color }}
            ></div>
            <span className="text-xs text-gray-700">{level.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
  
  const PopulationCoverageChart: React.FC = () => (
    <div className="bg-white p-4 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-gray-700 font-medium text-sm">Population Coverage</h3>
        <p className="text-xs text-gray-500">Number of people with access to services</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData.populationData.slice(0, 10)} // Only show top 10 districts
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={20}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" scale="point" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
            <YAxis tickFormatter={value => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value} />
            <Tooltip />
            <Legend />
            <Bar name="Covered Population" dataKey="covered" fill="#4ade80" />
            <Bar name="Uncovered" dataKey="uncovered" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  
  return (
    <div className={`${fullScreen ? 'h-screen fixed inset-0 z-50 p-6 bg-white overflow-auto' : 'w-full'}`}>
      {!fullScreen && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center text-gray-800">
            <BarChart2 size={20} className="mr-2 text-blue-600" />
            <span>Coverage Visualization</span>
          </h3>
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Show More
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Chart navigation */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button 
          className={`flex items-center px-3 py-2 rounded-lg text-sm ${activeChart === 'coverage-map' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveChart('coverage-map')}
        >
          <MapPin size={16} className="mr-2" />
          District Map
        </button>
        <button 
          className={`flex items-center px-3 py-2 rounded-lg text-sm ${activeChart === 'bar-chart' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveChart('bar-chart')}
        >
          <BarChart2 size={16} className="mr-2" />
          Coverage %
        </button>
        <button 
          className={`flex items-center px-3 py-2 rounded-lg text-sm ${activeChart === 'pie-chart' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveChart('pie-chart')}
        >
          <Activity size={16} className="mr-2" />
          Distribution
        </button>
        <button 
          className={`flex items-center px-3 py-2 rounded-lg text-sm ${activeChart === 'population-chart' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setActiveChart('population-chart')}
        >
          <Users size={16} className="mr-2" />
          Population
        </button>
      </div>
      
      {/* Chart view */}
      {(expanded || fullScreen) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DistrictCoverageMap />
          <DistrictCoverageBarChart />
          <CoverageLevelPieChart />
          <PopulationCoverageChart />
        </div>
      ) : (
        <div className="mb-6">
          {activeChart === 'coverage-map' && <DistrictCoverageMap />}
          {activeChart === 'bar-chart' && <DistrictCoverageBarChart />}
          {activeChart === 'pie-chart' && <CoverageLevelPieChart />}
          {activeChart === 'population-chart' && <PopulationCoverageChart />}
        </div>
      )}
    </div>
  );
};

export default CoverageVisualizations;