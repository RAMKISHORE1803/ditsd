"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Tower, School, Hospital, WaterBody, District, UserProfile, AuditLog, CoverageAnalysis, ActiveTab } from '@/types/index';
import * as api from '../services/api';

export function useInfrastructure(userId?: string) {
  // Data states
  const [towers, setTowers] = useState<Tower[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [coverageAnalyses, setCoverageAnalyses] = useState<CoverageAnalysis[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterDensity, setFilterDensity] = useState<'high' | 'medium' | 'low' | ''>('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Summary statistics with default values
  const [summaryStats, setSummaryStats] = useState({
    totalTowers: 0,
    activeTowers: 0,
    totalSchools: 0,
    schoolsWithInternet: 0,
    totalHospitals: 0,
    hospitalsWithInternet: 0,
    totalWaterBodies: 0,
    totalDistricts: 0,
    populationCovered: 0,
    populationTotal: 0
  });

  const addItem = async (type: string, data: any) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      
      // Convert type to API endpoint if needed
      const endpoint = type === 'towers' ? 'telecom_towers' : 
                      type === 'waterBodies' ? 'water_bodies' : 
                      type;
      
      // Make sure user ID is included in the data
      const dataWithUser = {
        ...data,
        created_by: userId
      };
      
      // Use the existing API functions directly instead of createRecord
      const response = await api.addInfrastructureItem(endpoint, dataWithUser, userId);
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      console.error('Error creating record:', error);
      throw error;
    }
  };

  const updateItem = async (type: string, id: string, data: any) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      
      // Convert type to API endpoint if needed
      const endpoint = type === 'towers' ? 'telecom_towers' : 
                      type === 'waterBodies' ? 'water_bodies' : 
                      type;
      
      // Include user ID for audit tracking
      const dataWithUser = {
        ...data,
        updated_by: userId
      };
      
      // Use the existing API functions directly
      const response = await api.updateInfrastructureItem(endpoint, id, dataWithUser, userId);
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      console.error('Error updating record:', error);
      throw error;
    }
  };

  const deleteItem = async (type: string, id: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setLoading(true);
      
      // Convert type to API endpoint if needed
      const endpoint = type === 'towers' ? 'telecom_towers' : 
                      type === 'waterBodies' ? 'water_bodies' : 
                      type;
      
      // Get the item name first for the audit log
      let itemName = 'Unknown';
      try {
        // Use the new API function instead of direct supabase call
        const item = await api.getInfrastructureItemById(endpoint, id);
        
        if (item && item.name) {
          itemName = item.name;
        }
      } catch (e) {
        console.error('Error getting item name:', e);
      }
      
      // Use the existing API function
      const response = await api.deleteInfrastructureItem(endpoint, id, itemName, userId);
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      console.error('Error deleting record:', error);
      throw error;
    }
  };
  
  // Load initial data - only if userId exists
  const loadDashboardData = useCallback(async () => {
    if (!userId) return; // Early return if no userId
    
    try {
      setLoading(true);
      
      // Fetch districts with error handling
      try {
        const districtsData = await api.getDistricts();
        setDistricts(districtsData);
      } catch (error) {
        console.error('Error fetching districts:', error);
        // Set empty districts but continue loading other data
        setDistricts([]);
      }
      
      // Get summary statistics with error handling
      try {
        const stats = await api.getSummaryStatistics();
        setSummaryStats(stats);
      } catch (error) {
        console.error('Error fetching summary statistics:', error);
        // Keep default summary stats
      }
      
      // Load recent activity with error handling
      try {
        const activityData = await api.getRecentActivity(5);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Set empty activity but continue
        setRecentActivity([]);
      }
      
      // Fetch users if admin with error handling
      try {
        const usersData = await api.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.log('Error fetching users or not authorized');
        // Set empty users but continue
        setUsers([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try refreshing the page.');
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    console.log(`Current page changed to: ${currentPage}, itemsPerPage: ${itemsPerPage}, totalCount: ${totalCount}`);
  }, [currentPage, itemsPerPage, totalCount]);
  
  // Load data for current tab - only if userId exists
  const loadDataForCurrentTab = useCallback(async () => {
    if (!userId) return; // Early return if no userId
    
    try {
      setLoading(true);
      console.log(`Loading data for tab: ${activeTab}, page: ${currentPage}, items per page: ${itemsPerPage}`);
      
      // Modified to load data for overview tab too
      if (activeTab === 'overview') {
        // For overview tab, we need basic data for all infrastructure types without pagination
        try {
          // Load limited set of towers, schools, and hospitals for district breakdown
          const overviewQueryParams = {
            page: 1,
            perPage: 1000, // Get more items for aggregation purposes
            sortField: 'district_id',
            sortDirection: 'asc' as 'asc' | 'desc'
          };
          
          // Get all infrastructure data needed for the overview
          const [towersData, schoolsData, hospitalsData] = await Promise.all([
            api.getTowers(overviewQueryParams),
            api.getSchools(overviewQueryParams),
            api.getHospitals(overviewQueryParams)
          ]);
          
          setTowers(towersData as Tower[]);
          setSchools(schoolsData as School[]);
          setHospitals(hospitalsData as Hospital[]);
          
          console.log(`Loaded ${towersData.length} towers, ${schoolsData.length} schools, ${hospitalsData.length} hospitals for overview`);
        } catch (error) {
          console.error('Error loading overview infrastructure data:', error);
          setTowers([]);
          setSchools([]);
          setHospitals([]);
        }
        
        setLoading(false);
        return;
      }
      
      const queryParams = {
        page: currentPage,
        perPage: itemsPerPage,
        searchTerm,
        districtId: filterRegion,
        sortField,
        sortDirection
      };
      
      let dataPromise, countPromise;
      
      switch (activeTab) {
        case 'towers':
          try {
            dataPromise = api.getTowers(queryParams);
            countPromise = api.getTowersCount(queryParams);
          } catch (error) {
            console.error('Error preparing towers query:', error);
            setTowers([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
          break;
        case 'schools':
          try {
            dataPromise = api.getSchools(queryParams);
            countPromise = api.getSchoolsCount(queryParams);
          } catch (error) {
            console.error('Error preparing schools query:', error);
            setSchools([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
          break;
        case 'hospitals':
          try {
            dataPromise = api.getHospitals(queryParams);
            countPromise = api.getHospitalsCount(queryParams);
          } catch (error) {
            console.error('Error preparing hospitals query:', error);
            setHospitals([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
          break;
        case 'waterBodies':
          try {
            dataPromise = api.getWaterBodies(queryParams);
            countPromise = api.getWaterBodiesCount(queryParams);
          } catch (error) {
            console.error('Error preparing water bodies query:', error);
            setWaterBodies([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
          break;
        case 'users':
          // User management is handled separately
          setLoading(false);
          return;
        case 'coverage':
          // Load coverage analysis data
          if (userId) {
            try {
              const data = await api.runCoverageAnalysis(undefined, 'telecom', userId);
              // Add id property to each item to match CoverageAnalysis interface
              const formattedData = (data || []).map((item: any) => ({
                id: item.id || `${item.district_id}-${item.coverage_type}-${Date.now()}`,
                district_id: item.district_id,
                coverage_level: item.coverage_level,
                percentage_covered: item.percentage_covered,
                population_covered: item.population_covered,      
                coverage_type: item.coverage_type,
                last_calculated: item.last_calculated
              }));
              setCoverageAnalyses(formattedData);
            } catch (error) {
              console.error('Error loading coverage data:', error);
              setCoverageAnalyses([]);
            }
          }
          setLoading(false);
          return;
      }
      
      if (dataPromise && countPromise) {
        try {
          const [data, count] = await Promise.all([dataPromise, countPromise]);
          
          // Update state based on active tab
          switch (activeTab) {
            case 'towers':
              setTowers(data as Tower[]);
              break;
            case 'schools':
              setSchools(data as School[]);
              break;
            case 'hospitals':
              setHospitals(data as Hospital[]);
              break;
            case 'waterBodies':
              setWaterBodies(data as WaterBody[]);
              break;
          }
          
          setTotalCount(count);
        } catch (error) {
          console.error(`Error fetching ${activeTab} data:`, error);
          // Set empty data for the current tab
          switch (activeTab) {
            case 'towers':
              setTowers([]);
              break;
            case 'schools':
              setSchools([]);
              break;
            case 'hospitals':
              setHospitals([]);
              break;
            case 'waterBodies':
              setWaterBodies([]);
              break;
          }
          setTotalCount(0);
          toast.error(`Error loading ${activeTab} data. Some features may be limited.`);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data for tab:', error);
      toast.error('Failed to load data. Please try again.');
      setLoading(false);
    }
  }, [activeTab, currentPage, itemsPerPage, searchTerm, filterRegion, sortField, sortDirection, userId]);
  
  // Update sort parameters
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Effect to load dashboard data initially - only if userId exists
  useEffect(() => {
    if (userId) {
      loadDashboardData().catch(error => {
        console.error('Unhandled error in loadDashboardData:', error);
        toast.error('Something went wrong. Please refresh the page.');
      });
    }
  }, [userId, loadDashboardData]);
  
  // Effect to load data when tab changes - only if userId exists
  useEffect(() => {
    if (userId) {
      // Reset pagination and sorting when tab changes
      setCurrentPage(1);
      setSortField('name');
      setSortDirection('asc');
      
      loadDataForCurrentTab().catch(error => {
        console.error('Unhandled error in loadDataForCurrentTab:', error);
        toast.error('Error loading tab data. Please try again.');
      });
    }
  }, [activeTab, userId, loadDataForCurrentTab]);
  
  // Update data when pagination or sorting changes - only if userId exists
  useEffect(() => {
    if (userId && activeTab !== 'overview') {
      loadDataForCurrentTab().catch(error => {
        console.error('Unhandled error in pagination update:', error);
        toast.error('Error updating data. Please try again.');
      });
    }
  }, [currentPage, itemsPerPage, sortField, sortDirection, userId, activeTab, loadDataForCurrentTab]);
  
  // Handle search and filtering
  const handleSearch = () => {
    if (!userId) return; // Early return if no userId
    
    setCurrentPage(1); // Reset to first page on new search
    loadDataForCurrentTab().catch(error => {
      console.error('Unhandled error in search:', error);
      toast.error('Error searching data. Please try again.');
    });
  };
  
  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    // Ensure the new page is within valid bounds
    if (newPage < 1) {
      newPage = 1;
    }
    
    const maxPage = Math.ceil(totalCount / itemsPerPage) || 1;
    if (newPage > maxPage) {
      newPage = maxPage;
    }
    
    // Only update if the page has actually changed
    if (newPage !== currentPage) {
      console.log(`Changing page from ${currentPage} to ${newPage}`);
      setCurrentPage(newPage);
      // We don't call loadDataForCurrentTab here - the useEffect will handle it
    }
  };

  
  // Run coverage analysis - only if userId exists
  const runAnalysis = async (districtId?: string, analysisType: string = 'telecom') => {
    if (!userId) return; // Early return if no userId
    
    try {
      setLoading(true);
      toast.info('Running coverage analysis. This may take a moment...');
      
      await api.runCoverageAnalysis(districtId, analysisType, userId);
      
      toast.success('Coverage analysis completed successfully');
      
      // Reload coverage data
      try {
        const coverageData = await api.getRecentActivity(5);
        setCoverageAnalyses(coverageData as unknown as CoverageAnalysis[]);
      } catch (error) {
        console.error('Error reloading coverage data:', error);
      }
      
      // Refresh dashboard data to update coverage statistics
      await loadDashboardData();
      
      setLoading(false);
    } catch (error) {
      console.error('Error running coverage analysis:', error);
      toast.error('Error running coverage analysis');
      setLoading(false);
    }
  };

  // Export functionality
  const exportCSV = async () => {
    if (!userId) return; // Early return if no userId
    
    try {
      setLoading(true);
      toast.info('Preparing CSV export...');
      
      let tableName = '';
      let fileName = '';
      
      // Determine which table to export based on the active tab
      switch (activeTab) {
        case 'towers':
          tableName = 'telecom_towers';
          fileName = 'telecom_towers.csv';
          break;
        case 'schools':
          tableName = 'schools';
          fileName = 'schools.csv';
          break;
        case 'hospitals':
          tableName = 'hospitals';
          fileName = 'hospitals.csv';
          break;
        case 'waterBodies':
          tableName = 'water_bodies';
          fileName = 'water_bodies.csv';
          break;
        case 'coverage':
          tableName = 'coverage_analysis';
          fileName = 'coverage_analysis.csv';
          break;
        default:
          toast.error('Export not supported for this tab');
          setLoading(false);
          return;
      }
      
      const params = {
        searchTerm,
        districtId: filterRegion
      };
      
      const csv = await api.exportToCSV(tableName, params);
      
      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${fileName} successfully`);
      
      // Log the export action
      try {
        await api.logAction({
          user_id: userId,
          action: 'export',
          table_name: tableName,
          details: `Exported ${tableName} to CSV`
        });
      } catch (error) {
        console.error('Error logging export action:', error);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV. Please try again.');
      setLoading(false);
    }
  };

  return {
    // Data
    towers,
    schools,
    hospitals,
    waterBodies,
    districts,
    users,
    coverageAnalyses,
    recentActivity,
    summaryStats,
    
    // UI state
    activeTab,
    loading,
    totalCount,
    currentPage,
    itemsPerPage,
    searchTerm,
    filterRegion,
    filterDensity,
    sortField,
    sortDirection,
    
    // Actions
    setActiveTab,
    setSearchTerm,
    setFilterRegion,
    setFilterDensity,
    setItemsPerPage,
    handleSearch,
    handleSort,
    handlePageChange,
    loadDashboardData,
    loadDataForCurrentTab,
    runCoverageAnalysis: runAnalysis,
    exportCSV,
    
    // CRUD operations
    addItem,
    updateItem,
    deleteItem,
    
    refreshData: loadDashboardData
  };
}