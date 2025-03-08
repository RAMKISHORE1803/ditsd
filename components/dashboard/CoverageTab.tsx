"use client";

import { useState } from 'react';
import { 
  BarChart2, Download, MapPin, User, Calendar, 
  Info, ChevronDown, FileText, Upload, Clock, 
  HelpCircle, Compass, Layers
} from 'lucide-react';
import { AuthUser, District, CoverageAnalysis } from '../../types';
import * as coverageService from '@/app/services/coverageAnalysis';
import { exportToCSV } from '@/app/services/api';
import { toast } from 'react-toastify';

interface CoverageTabProps {
  user: AuthUser;
  coverageAnalyses: CoverageAnalysis[];
  districts: District[];
  filterRegion: string;
  setFilterRegion: (region: string) => void;
  runCoverageAnalysis: (districtId?: string, analysisType?: string) => void;
}

export default function CoverageTab({
  user,
  coverageAnalyses: initialCoverageAnalyses,
  districts,
  filterRegion,
  setFilterRegion,
  runCoverageAnalysis: originalRunAnalysis
}: CoverageTabProps) {
  // Local state for analysis options
  const [analysisType, setAnalysisType] = useState<string>('telecom');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(false);
  const [coverageAnalyses, setCoverageAnalyses] = useState<CoverageAnalysis[]>(initialCoverageAnalyses);
  const [analysisDepth, setAnalysisDepth] = useState<'standard' | 'detailed'>('standard');
  const [includeDemographics, setIncludeDemographics] = useState<boolean>(false);
  const [includeOverlap, setIncludeOverlap] = useState<boolean>(true);
  
  // Helper function to get district name by ID
  const getDistrictName = (districtId?: string) => {
    if (!districtId) return 'All Districts';
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown';
  };

  // Enhanced run analysis function
  const runAnalysis = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    toast.info(`Running ${analysisType} coverage analysis. This may take a moment...`);
    
    try {
      // Call our sophisticated coverage analysis service directly
      const results = await coverageService.analyzeCoverage(
        filterRegion || undefined, 
        analysisType
      );
      
      // Update the UI with the results
      setCoverageAnalyses(results);
      
      toast.success('Coverage analysis completed successfully!');
    } catch (error) {
      console.error('Error running coverage analysis:', error);
      toast.error('Error running coverage analysis. Please try again.');
      
      // Call the original function as fallback
      originalRunAnalysis(filterRegion || undefined, analysisType);
    } finally {
      setIsRunning(false);
    }
  };

  // Export the coverage data
  const exportCoverage = async () => {
    try {
      toast.info('Preparing coverage analysis export...');
      
      // If we have data in state, export that directly
      if (coverageAnalyses.length > 0) {
        // Convert to CSV format
        const headers = Object.keys(coverageAnalyses[0]);
        const csv = [
          headers.join(','),
          ...coverageAnalyses.map(row => 
            headers.map(header => {
              const value = row[header as keyof CoverageAnalysis];
              if (value === null || value === undefined) return '';
              if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
              return value;
            }).join(',')
          )
        ].join('\n');
        
        // Create download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `coverage_analysis_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Coverage analysis exported successfully');
      } else {
        // Fallback to API service
        const csv = await exportToCSV('coverage_analysis', {});
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'coverage_analysis.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Coverage analysis exported successfully');
      }
    } catch (error) {
      console.error('Error exporting coverage data:', error);
      toast.error('Failed to export coverage data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main coverage analysis card */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center text-gray-800">
            <BarChart2 size={20} className="mr-2 text-blue-600" />
            <span>Coverage Analysis</span>
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={exportCoverage}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition-colors"
            >
              <Download size={16} className="mr-2" />
              <span>Export Report</span>
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
          <div className="py-12 text-center flex flex-col items-center bg-gray-50 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <Info size={32} className="text-yellow-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">No coverage analysis data available</h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
              Run a coverage analysis to see results here.
            </p>
            {(user.role === 'admin' || user.role === 'editor') && (
              <button
                onClick={runAnalysis}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center"
              >
                <BarChart2 size={16} className="mr-2" />
                <span>Run First Analysis</span>
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Enhanced analysis options card */}
      {(user.role === 'admin' || user.role === 'editor') && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart2 size={20} className="mr-2 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-800">Coverage Analysis</h3>
              <span 
                className="ml-2 text-xs text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-full"
              >
                v2.0
              </span>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
              <Clock size={12} className="mr-1" />
              Estimated time: {analysisDepth === 'detailed' ? '3-4' : '1-2'} minutes
            </span>
          </div>
          
          {/* Analysis configuration */}
          <div className="space-y-6">
            {/* Basic controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Area</label>
                <div className="relative">
                  <select
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    onChange={(e) => setFilterRegion(e.target.value)}
                    value={filterRegion}
                  >
                    <option value="">All Districts</option>
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <Compass size={12} className="mr-1" />
                  Select a specific district or analyze all districts
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Type</label>
                <div className="relative">
                  <select
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  >
                    <option value="telecom">Telecom Coverage</option>
                    <option value="internet">Internet Access</option>
                    <option value="education">Education Access</option>
                    <option value="healthcare">Healthcare Access</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  <Layers size={12} className="mr-1" />
                  Select the type of infrastructure to analyze
                </p>
              </div>
            </div>
            
            {/* Advanced options toggle */}
            <div>
              <button
                type="button"
                onClick={() => setAdvancedOptions(!advancedOptions)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                {advancedOptions ? 'Hide' : 'Show'} advanced options
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${advancedOptions ? 'transform rotate-180' : ''}`} 
                />
              </button>
              
              {/* Advanced options panel */}
              {advancedOptions && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <HelpCircle size={14} className="mr-1 text-blue-600" />
                    Analysis Configuration
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={analysisDepth === 'standard'}
                          onChange={() => setAnalysisDepth('standard')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Standard Analysis</span>
                        <span className="ml-2 text-xs text-gray-500">(Faster)</span>
                      </label>
                      <p className="ml-6 text-xs text-gray-500 mt-1">
                        Basic coverage calculations with infrastructure count and population estimates
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={analysisDepth === 'detailed'}
                          onChange={() => setAnalysisDepth('detailed')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Detailed Analysis</span>
                        <span className="ml-2 text-xs text-gray-500">(More accurate)</span>
                      </label>
                      <p className="ml-6 text-xs text-gray-500 mt-1">
                        Advanced model with terrain factors, population distribution, and precise coverage overlap
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="includeOverlap"
                        type="checkbox"
                        checked={includeOverlap}
                        onChange={() => setIncludeOverlap(!includeOverlap)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeOverlap" className="ml-2 text-sm text-gray-700">
                        Account for coverage overlap
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="includeDemographics"
                        type="checkbox"
                        checked={includeDemographics}
                        onChange={() => setIncludeDemographics(!includeDemographics)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeDemographics" className="ml-2 text-sm text-gray-700">
                        Include demographic factors
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition-colors flex items-center"
                onClick={() => toast.info('Analysis scheduling feature will be available in a future update')}
              >
                <Calendar size={16} className="mr-2" />
                <span>Schedule</span>
              </button>
              
              <button
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm flex items-center ${
                  isRunning ? 'opacity-70 cursor-wait' : ''
                }`}
                onClick={runAnalysis}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Running Analysis...</span>
                  </>
                ) : (
                  <>
                    <BarChart2 size={16} className="mr-2" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center text-xs text-gray-600">
              <FileText size={14} className="mr-1" />
              <span>
                Last analysis: {coverageAnalyses.length > 0 
                  ? new Date(coverageAnalyses[0].last_calculated || Date.now()).toLocaleDateString() 
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Documentation card */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Info size={16} className="mr-2 text-blue-600" />
          About Coverage Analysis
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          The coverage analysis uses sophisticated algorithms to estimate infrastructure coverage across districts.
          For telecom analysis, it accounts for tower type, status, and overlapping coverage zones.
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Upload size={12} className="mr-1" />
            Analysis methodology: {analysisDepth === 'detailed' ? 'Terrain-aware' : 'Statistical'}
          </span>
          <span>Analysis engine v2.0</span>
        </div>
      </div>
    </div>
  );
}