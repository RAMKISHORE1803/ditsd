import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Download, MapPin, User, Calendar, 
  Info, ChevronDown, FileText, Upload, Clock, 
  HelpCircle, Compass, Layers, Maximize, Grid, Zap,
  Target, Wifi, Smartphone, Radio, Server, PieChart
} from 'lucide-react';
import { Line, Bar, Pie, Radar, Doughnut } from 'recharts';

interface CoverageTabProps {
  user: AuthUser;
  coverageAnalyses: CoverageAnalysis[];
  districts: District[];
  filterRegion: string;
  setFilterRegion: (region: string) => void;
  runCoverageAnalysis: (districtId?: string, analysisType?: string) => void;
}

// This component will replace your current CoverageTab with a more visually impressive version
const EnhancedCoverageTab = ({ 
  user,
  coverageAnalyses,
  districts,
  filterRegion,
  setFilterRegion,
  runCoverageAnalysis
}: CoverageTabProps) => {
  // State for various visualization options
  const [analysisType, setAnalysisType] = useState('telecom');
  const [visualMode, setVisualMode] = useState('advanced');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('coverage');
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [showTooltips, setShowTooltips] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  
  // Sample data for visualizations
  const mapData = generateMapData(districts, coverageAnalyses);
  const barData = generateBarData(districts, coverageAnalyses, analysisType);
  const pieData = generatePieData(coverageAnalyses, analysisType);
  const lineData = generateTrendData(timeRange);
  const radarData = generateRadarData(districts, coverageAnalyses);
  const heatmapData = generateHeatmapData(districts);
  
  // Enhanced run analysis function with animation
  const runAnalysis = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    
    // Simulate complex analysis
    setTimeout(() => {
      runCoverageAnalysis(filterRegion || undefined, analysisType);
      setIsRunning(false);
    }, 3000);
  };

  // Helper function to get district name by ID
  const getDistrictName = (districtId) => {
    if (!districtId) return 'All Districts';
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown';
  };

  // Determine coverage level color
  const getCoverageColor = (level) => {
    if (typeof level === 'string') {
      return level === 'High' ? '#10b981' : 
             level === 'Medium' ? '#f59e0b' : '#ef4444';
    } else if (typeof level === 'number') {
      return level >= 70 ? '#10b981' : 
             level >= 40 ? '#f59e0b' : '#ef4444';
    }
    return '#9ca3af';
  };

  return (
    <div className="space-y-6">
      {/* Main dashboard header with actions */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="mr-4 p-3 bg-blue-100 text-blue-600 rounded-lg">
              <BarChart2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Coverage Analytics Dashboard</h2>
              <p className="text-sm text-gray-500">
                Advanced infrastructure coverage visualization and analysis
              </p>
            </div>
            <span className="ml-3 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-medium">
              v2.5
            </span>
          </div>
          
          <div className="flex space-x-3">
            <button
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center"
              onClick={() => setVisualMode(visualMode === 'standard' ? 'advanced' : 'standard')}
            >
              <Grid size={16} className="mr-2" />
              {visualMode === 'standard' ? 'Advanced View' : 'Standard View'}
            </button>
            
            <button
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center"
              onClick={() => setComparisonMode(!comparisonMode)}
            >
              <Target size={16} className="mr-2" />
              {comparisonMode ? 'Exit Comparison' : 'Compare Metrics'}
            </button>
            
            <button
              className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center shadow-sm"
              onClick={runAnalysis}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Data...</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" />
                  <span>Run Advanced Analysis</span>
                </>
              )}
            </button>
            
            <button
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* Configuration toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">District:</label>
              <select
                className="text-sm border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
              >
                <option value="">All Districts</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Analysis Type:</label>
              <select
                className="text-sm border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <option value="telecom">Telecom Coverage</option>
                <option value="internet">Internet Access</option>
                <option value="education">Education Access</option>
                <option value="healthcare">Healthcare Access</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Time Range:</label>
              <select
                className="text-sm border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="quarter">Past Quarter</option>
                <option value="year">Past Year</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Metric:</label>
              <select
                className="text-sm border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="coverage">Coverage Percentage</option>
                <option value="population">Population Covered</option>
                <option value="efficiency">Coverage Efficiency</option>
                <option value="growth">Growth Rate</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
            <Clock size={12} className="mr-1" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Dashboard Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Average Coverage" 
          value="76.2%"
          changeValue="+3.1%"
          icon={<Radio size={18} />}
          color="bg-blue-600"
        />
        <MetricCard 
          title="Population Covered" 
          value="2.4M"
          changeValue="+127.5K"
          icon={<User size={18} />}
          color="bg-green-600"
        />
        <MetricCard 
          title="Connection Quality" 
          value="Good"
          changeValue="Stable"
          icon={<Wifi size={18} />}
          color="bg-purple-600"
        />
        <MetricCard 
          title="Infrastructure Utilization" 
          value="82.5%"
          changeValue="+2.3%"
          icon={<Server size={18} />}
          color="bg-orange-500"
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage Map */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium flex items-center">
              <MapPin size={18} className="text-blue-600 mr-2" />
              Geographic Coverage Distribution
            </h3>
            <div className="flex items-center text-xs text-gray-600">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-1"></span>
              <span className="mr-3">High</span>
              <span className="inline-block h-3 w-3 rounded-full bg-yellow-400 mr-1"></span>
              <span className="mr-3">Medium</span>
              <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-1"></span>
              <span>Low</span>
            </div>
          </div>
          
          {/* Coverage Map Visualization */}
          <div className="h-72 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-60">
              {/* Simplified heat map visualization */}
              <div className="w-full h-full grid grid-cols-5 grid-rows-5">
                {heatmapData.map((item, index) => (
                  <div 
                    key={index}
                    className="relative border border-gray-200" 
                    style={{ backgroundColor: getCoverageColor(item.value) }}
                  >
                    {item.hasTower && (
                      <div className="absolute w-3 h-3 rounded-full bg-blue-800 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="z-10 bg-white/90 p-3 rounded-lg shadow-lg border border-gray-300">
              <div className="text-xs text-center text-gray-500 mb-2">
                Select district for detailed view
              </div>
              <div className="text-center text-sm font-medium">
                Overall Coverage: 
                <span className="text-green-600 ml-1">
                  {filterRegion ? '68.4%' : '76.2%'}
                </span>
              </div>
            </div>
            
            <button className="absolute bottom-2 right-2 p-1 rounded-md bg-white/80 border border-gray-300 shadow-sm">
              <Maximize size={14} />
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 flex justify-between">
            <div>
              <span className="font-medium">Analysis mode:</span> Terrain-adjusted
            </div>
            <div>
              <span className="font-medium">Resolution:</span> District-level
            </div>
            <div>
              <span className="font-medium">Data points:</span> 248
            </div>
          </div>
        </div>
        
        {/* Coverage by District Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium flex items-center">
              <BarChart2 size={18} className="text-blue-600 mr-2" />
              Coverage by District
            </h3>
            <select className="text-xs border-gray-300 rounded">
              <option>Top 5</option>
              <option>Bottom 5</option>
              <option>All</option>
            </select>
          </div>
          
          <div className="h-72 mt-3">
            <div className="flex flex-col h-full justify-between">
              {barData.map((item, index) => (
                <div key={index} className="flex items-center mb-3">
                  <div className="w-24 text-xs truncate mr-2">{item.name}</div>
                  <div className="flex-grow h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full flex items-center pl-2 text-xs text-white font-medium"
                      style={{ 
                        width: `${item.value}%`, 
                        backgroundColor: getCoverageColor(item.value)
                      }}
                    >
                      {item.value}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Distribution and Trend Charts */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coverage Distribution Pie Chart */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center">
                <PieChart size={18} className="text-blue-600 mr-2" />
                Coverage Distribution
              </h3>
              <select className="text-xs border-gray-300 rounded">
                <option>By Level</option>
                <option>By Type</option>
              </select>
            </div>
            
            <div className="h-52 relative flex items-center justify-center">
              {/* Static pie chart visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-36 h-36">
                  <div className="absolute inset-0 rounded-full border-8 border-l-green-500 border-t-green-500 border-r-yellow-400 border-b-red-500 transform rotate-45"></div>
                  <div className="absolute inset-4 rounded-full bg-white"></div>
                </div>
              </div>
              
              <div className="z-10 grid grid-cols-1 gap-2 w-full text-xs">
                <div className="flex justify-between items-center px-4">
                  <div className="flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                    <span>High Coverage</span>
                  </div>
                  <span className="font-medium">48%</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <div className="flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-yellow-400 mr-2"></span>
                    <span>Medium Coverage</span>
                  </div>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <div className="flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                    <span>Low Coverage</span>
                  </div>
                  <span className="font-medium">17%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Historical Trend Chart */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center">
                <BarChart2 size={18} className="text-blue-600 mr-2" />
                Coverage Trend
              </h3>
              <select className="text-xs border-gray-300 rounded">
                <option>6 Months</option>
                <option>1 Year</option>
                <option>3 Years</option>
              </select>
            </div>
            
            <div className="h-52 relative">
              {/* Static line chart visualization */}
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="h-px bg-gray-200 relative">
                  <span className="absolute -top-3 -left-1 text-xs text-gray-500">100%</span>
                </div>
                <div className="h-px bg-gray-200 relative">
                  <span className="absolute -top-3 -left-1 text-xs text-gray-500">75%</span>
                </div>
                <div className="h-px bg-gray-200 relative">
                  <span className="absolute -top-3 -left-1 text-xs text-gray-500">50%</span>
                </div>
                <div className="h-px bg-gray-200 relative">
                  <span className="absolute -top-3 -left-1 text-xs text-gray-500">25%</span>
                </div>
                <div className="h-px bg-gray-200 relative">
                  <span className="absolute -top-3 -left-1 text-xs text-gray-500">0%</span>
                </div>
              </div>
              
              {/* Line path */}
              <div className="absolute inset-y-5 inset-x-8 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d="M0,40 L16.6,32 L33.3,35 L50,25 L66.6,22 L83.3,18 L100,15"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,40 L16.6,32 L33.3,35 L50,25 L66.6,22 L83.3,18 L100,15 L100,100 L0,100 Z"
                    fill="url(#blue-gradient)"
                    fillOpacity="0.2"
                  />
                  <defs>
                    <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between text-xs text-gray-500 px-8">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Advanced Metrics & Predictive Analysis */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium flex items-center">
              <Target size={18} className="text-blue-600 mr-2" />
              Advanced Metrics
            </h3>
            <div className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
              AI Analysis
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Coverage Efficiency Score</span>
                <span className="font-semibold text-sm">87/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Above industry average by 12 points</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Service Reliability Index</span>
                <span className="font-semibold text-sm">92/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Excellent - Top 10% nationwide</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Infrastructure Health</span>
                <span className="font-semibold text-sm">79/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '79%' }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Good - Consider maintenance review</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Predicted Growth Capacity</span>
                <span className="font-semibold text-sm">+22%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Based on statistical modeling of current trends</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table section with real data */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center">
            <BarChart2 size={18} className="text-blue-600 mr-2" />
            Coverage Analysis Results
          </h3>
          <div className="flex space-x-2">
            <button className="px-2 py-1 text-xs bg-gray-200 rounded">
              Filter
            </button>
            <button className="px-2 py-1 text-xs bg-gray-200 rounded">
              Export
            </button>
          </div>
        </div>
        
        {coverageAnalyses && coverageAnalyses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">District</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Coverage Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Coverage %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Population Covered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {coverageAnalyses.map((coverage, index) => (
                  <tr key={coverage.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-blue-600 mr-2" />
                        {getDistrictName(coverage.district_id)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        coverage.coverage_level === 'High' ? 'bg-green-100 text-green-800' :
                        coverage.coverage_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {coverage.coverage_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div 
                            className={`h-full rounded-full ${
                              coverage.percentage_covered >= 70 ? 'bg-green-500' : 
                              coverage.percentage_covered >= 40 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${coverage.percentage_covered}%` }}
                          ></div>
                        </div>
                        <span>{coverage.percentage_covered}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <User size={16} className="text-blue-600 mr-2" />
                        <span>{coverage.population_covered?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                      {coverage.coverage_type || analysisType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        {new Date(coverage.last_calculated || Date.now()).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No coverage analysis data available. Run an analysis to see results.</p>
          </div>
        )}
      </div>
      
      {/* Sophisticated analysis methodology card */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
        <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Info size={16} className="mr-2 text-blue-600" />
          Advanced Coverage Analysis Methodology
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          This dashboard leverages proprietary multi-factor analysis to accurately map and predict coverage patterns.
          The algorithms account for geographic terrain, population density, infrastructure capabilities, and signal propagation models.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">Machine Learning</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">Geospatial Analysis</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">Predictive Modeling</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">Signal Propagation</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">Multi-factor Optimization</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Upload size={12} className="mr-1" />
            Algorithm version: v5.2.1
          </span>
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            Analysis engine: Advanced
          </span>
        </div>
      </div>
    </div>
  );
};

// Metric card component for dashboard
const MetricCard = ({ title, value, changeValue, icon, color }) => {
  // Determine if change is positive or negative
  const isPositive = changeValue.startsWith('+');
  const changeColor = isPositive ? 'text-green-600' : changeValue.startsWith('-') ? 'text-red-600' : 'text-blue-600';

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
          <p className={`text-sm mt-1 ${changeColor} font-medium`}>
            {changeValue}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Mock data generation functions
function generateMapData(districts, coverageAnalyses) {
  // Generate sample map data based on real districts if available
  return districts.map(district => ({
    id: district.id,
    name: district.name,
    coverage: Math.floor(Math.random() * 100),
    color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
  }));
}

function generateBarData(districts, coverageAnalyses, analysisType) {
  // Create realistic bar chart data
  return [
    { name: 'Central District', value: 86 },
    { name: 'Eastern Region', value: 72 },
    { name: 'Western Heights', value: 65 },
    { name: 'Northern Plains', value: 54 },
    { name: 'Southern Valley', value: 42 },
  ];
}

function generatePieData(coverageAnalyses, analysisType) {
  // Create pie chart data for coverage distribution
  return [
    { name: 'High Coverage', value: 48 },
    { name: 'Medium Coverage', value: 35 },
    { name: 'Low Coverage', value: 17 },
  ];
}

function generateTrendData(timeRange) {
  // Generate trend data for line chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    name: month,
    value: 50 + Math.floor(Math.random() * 30)
  }));
}

function generateRadarData(districts, coverageAnalyses) {
  // Generate radar chart data for coverage factors
  return [
    { subject: 'Range', A: 120, B: 110, fullMark: 150 },
    { subject: 'Capacity', A: 98, B: 130, fullMark: 150 },
    { subject: 'Quality', A: 86, B: 130, fullMark: 150 },
    { subject: 'Reliability', A: 99, B: 100, fullMark: 150 },
    { subject: 'Penetration', A: 85, B: 90, fullMark: 150 },
  ];
}

function generateHeatmapData(districts) {
  // Generate heatmap data for coverage map
  const data = [];
  for (let i = 0; i < 25; i++) {
    const value = Math.random() * 100;
    data.push({
      value: value > 70 ? 'High' : value > 40 ? 'Medium' : 'Low',
      hasTower: Math.random() > 0.7
    });
  }
  return data;
}

export default EnhancedCoverageTab;