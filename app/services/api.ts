"use client";

import { supabase } from './supabase';
import { 
  AuthUser, District, Tower, School, Hospital, WaterBody, 
  UserProfile, AuditLog, CoverageAnalysis 
} from '@/types/index';
import { parseWKBPoint } from '@/app/utils/helper';

// Authentication service functions
export const getSession = async () => {
  return await supabase.auth.getSession();
};

// Create a new record
export const createRecord = async (tableName: string, data: { created_by: string; }) => {
  return await addInfrastructureItem(tableName, data, data.created_by);
};

// Update an existing record
export const updateRecord = async (tableName: string, id: string, data: { updated_by: any; created_by: any; }) => {
  return await updateInfrastructureItem(tableName, id, data, data.updated_by || data.created_by);
};

// Delete a record
// Delete a record
export const deleteRecord = async (tableName: string, id: string, userId: string) => {
  const { data: item } = await supabase
    .from(tableName)
    .select('name')
    .eq('id', id)
    .single();
    
  const itemName = item?.name || 'Unknown';
  
  return await deleteInfrastructureItem(tableName, id, itemName, userId);
};
export const exportToCSV = async (tableName: string, params: any) => {
  const { searchTerm = '', districtId = '' } = params;
  
  try {
    // Determine which query to use based on the table name
    let query = supabase.from(tableName).select('*');
    
    // Apply filters if they exist
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    
    if (districtId) {
      query = query.eq('district_id', districtId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    
    // Process data for CSV format - handle special fields
    const processedData = data.map(item => {
      const newItem = { ...item };
      
      // Handle location data
      if (newItem.location) {
        try {
          const coordinates = parseWKBPoint(newItem.location);
          newItem.longitude = coordinates[0];
          newItem.latitude = coordinates[1];
          // Remove the original location field which is not CSV-friendly
          delete newItem.location;
        } catch (e) {
          console.error('Error parsing location:', e);
        }
      }
      
      // Handle PostGIS geometry
      if (newItem.geometry) {
        delete newItem.geometry; // Remove complex geometry data for CSV
      }
      
      // Handle dates - format them nicely
      if (newItem.created_at) {
        newItem.created_at = new Date(newItem.created_at).toLocaleString();
      }
      
      if (newItem.updated_at) {
        newItem.updated_at = new Date(newItem.updated_at).toLocaleString();
      }
      
      // Handle JSON fields
      if (newItem.services && typeof newItem.services === 'object') {
        newItem.services = JSON.stringify(newItem.services);
      } else if (newItem.services && typeof newItem.services === 'string') {
        try {
          // Try to parse and re-stringify to ensure valid JSON format
          newItem.services = JSON.stringify(JSON.parse(newItem.services));
        } catch (e) {
          // If it fails, keep as is
          console.error('Error processing services JSON:', e);
        }
      }
      
      return newItem;
    });
    
    // Get district names for better readability
    const { data: districts } = await supabase.from('districts').select('id,name');
    
    // Replace district_id with district name if available
    const districtMap: Record<string, string> = {};
    if (districts) {
      districts.forEach(district => {
        districtMap[district.id] = district.name;
      });
      
      processedData.forEach(item => {
        if (item.district_id && districtMap[item.district_id]) {
          item.district_name = districtMap[item.district_id];
        }
      });
    }
    
    // Convert to CSV
    const headers = Object.keys(processedData[0]);
    const csv = [
      headers.join(','),
      ...processedData.map(row => 
        headers.map(header => {
          // Format the value for CSV
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'boolean') return value ? 'true' : 'false';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csv;
  } catch (error) {
    console.error(`Error exporting ${tableName} to CSV:`, error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Districts service functions
// Districts service functions with better error handling
export const getDistricts = async () => {
  try {
    // First check if the table exists by running a simple query
    const { data: tableCheck, error: tableError } = await supabase
      .from('districts')
      .select('count')
      .limit(1)
      .single();
    
    // If we get a specific error about the table not existing
    if (tableError && 
        (tableError.message.includes('does not exist') || 
         tableError.code === '42P01')) {
      console.error('Districts table does not exist:', tableError);
      // Return empty array as fallback
      return [];
    }
    
    // If the table exists, run the actual query
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching districts:', error);
      // Return empty array as fallback instead of throwing
      return [];
    }
    
    // Return the data or empty array if null
    return (data as District[]) || [];
  } catch (error) {
    console.error('Unexpected error in getDistricts:', error);
    // Return empty array as fallback
    return [];
  }
};

// Infrastructure data fetching
export const getTowers = async (params: any) => {
  const { 
    page = 1, 
    perPage = 10, 
    searchTerm = '', 
    districtId = '',
    sortField = 'name',
    sortDirection = 'asc'
  } = params;
  
  let query = supabase.from('telecom_towers')
    .select('*')
    .limit(perPage)
    .range((page - 1) * perPage, page * perPage - 1)
    .order(sortField, { ascending: sortDirection === 'asc' });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Process tower data - extract coordinates
  const processedTowers = data?.map(tower => {
    const newTower = { ...tower } as Tower;
    
    if (newTower.location) {
      try {
        const coordinates = parseWKBPoint(newTower.location);
        newTower.longitude = coordinates[0];
        newTower.latitude = coordinates[1];
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    return newTower;
  }) || [];
  
  return processedTowers;
};

// Fixing the typo in getTowersCount function

export const getTowersCount = async (params: any) => {
  const { searchTerm = '', districtId = '' } = params;
  
  let query = supabase.from('telecom_towers')
    .select('id', { count: 'exact', head: true });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { count, error } = await query;
  
  if (error) throw error;
  
  return count || 0; // Fixed typo: "a0" -> "0"
};

// Schools data fetching
export const getSchools = async (params: any) => {
  const { 
    page = 1, 
    perPage = 10, 
    searchTerm = '', 
    districtId = '',
    sortField = 'name',
    sortDirection = 'asc'
  } = params;
  
  let query = supabase.from('schools')
    .select('*')
    .limit(perPage)
    .range((page - 1) * perPage, page * perPage - 1)
    .order(sortField, { ascending: sortDirection === 'asc' });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Process school data - extract coordinates
  const processedSchools = data?.map(school => {
    const newSchool = { ...school } as School;
    
    if (newSchool.location) {
      try {
        const coordinates = parseWKBPoint(newSchool.location);
        newSchool.longitude = coordinates[0];
        newSchool.latitude = coordinates[1];
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    return newSchool;
  }) || [];
  
  return processedSchools;
};

export const getSchoolsCount = async (params: any) => {
  const { searchTerm = '', districtId = '' } = params;
  
  let query = supabase.from('schools')
    .select('id', { count: 'exact', head: true });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { count, error } = await query;
  
  if (error) throw error;
  
  return count || 0;
};

// Hospitals data fetching
export const getHospitals = async (params: any) => {
  const { 
    page = 1, 
    perPage = 10, 
    searchTerm = '', 
    districtId = '',
    sortField = 'name',
    sortDirection = 'asc'
  } = params;
  
  let query = supabase.from('hospitals')
    .select('*')
    .limit(perPage)
    .range((page - 1) * perPage, page * perPage - 1)
    .order(sortField, { ascending: sortDirection === 'asc' });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Process hospital data - extract coordinates
  const processedHospitals = data?.map(hospital => {
    const newHospital = { ...hospital } as Hospital;
    
    if (newHospital.location) {
      try {
        const coordinates = parseWKBPoint(newHospital.location);
        newHospital.longitude = coordinates[0];
        newHospital.latitude = coordinates[1];
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    // Parse services JSON if present
    if (typeof newHospital.services === 'string') {
      try {
        newHospital.services = JSON.parse(newHospital.services);
      } catch (e) {
        console.error('Error parsing services JSON:', e);
        newHospital.services = {};
      }
    }
    
    return newHospital;
  }) || [];
  
  return processedHospitals;
};

export const getHospitalsCount = async (params: any) => {
  const { searchTerm = '', districtId = '' } = params;
  
  let query = supabase.from('hospitals')
    .select('id', { count: 'exact', head: true });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { count, error } = await query;
  
  if (error) throw error;
  
  return count || 0;
};

// Water Bodies data fetching
export const getWaterBodies = async (params: any) => {
  const { 
    page = 1, 
    perPage = 10, 
    searchTerm = '', 
    districtId = '',
    sortField = 'name',
    sortDirection = 'asc'
  } = params;
  
  let query = supabase.from('water_bodies')
    .select('*')
    .limit(perPage)
    .range((page - 1) * perPage, page * perPage - 1)
    .order(sortField, { ascending: sortDirection === 'asc' });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Process water body data - extract coordinates
  const processedWaterBodies = data?.map(waterBody => {
    const newWaterBody = { ...waterBody } as WaterBody;
    
    // For water bodies, we might have coordinates in either location or geometry fields
    if (newWaterBody.location) {
      try {
        const coordinates = parseWKBPoint(newWaterBody.location);
        newWaterBody.longitude = coordinates[0];
        newWaterBody.latitude = coordinates[1];
      } catch (e) {
        console.error('Error parsing location coordinates:', e);
      }
    } else if (newWaterBody.geometry) {
      try {
        const coordinates = parseWKBPoint(newWaterBody.geometry);
        newWaterBody.longitude = coordinates[0];
        newWaterBody.latitude = coordinates[1];
      } catch (e) {
        console.error('Error parsing geometry:', e);
      }
    }
    
    return newWaterBody;
  }) || [];
  
  return processedWaterBodies;
};

export const getWaterBodiesCount = async (params: any) => {
  const { searchTerm = '', districtId = '' } = params;
  
  let query = supabase.from('water_bodies')
    .select('id', { count: 'exact', head: true });
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (districtId) {
    query = query.eq('district_id', districtId);
  }
  
  const { count, error } = await query;
  
  if (error) throw error;
  
  return count || 0;
};

// User management
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return data as UserProfile[];
};

// Statistics and summary data
export const getSummaryStatistics = async () => {
  try {
    let districts: any[] = [];
    try {
      districts = await getDistricts();
    } catch (error) {
      console.error('Error in districts lookup during statistics:', error);
      districts = [];
    }
    
    // Calculate total population with safe fallback
    const totalPopulation = districts.reduce(
      (sum, district) => sum + (district.population || 0), 
      0
    );
    
    // Initialize counts with default values
    let towersTotalCount = 0;
    let towersActiveCount = 0;
    let schoolsTotalCount = 0;
    let schoolsWithInternetCount = 0;
    let hospitalsTotalCount = 0;
    let hospitalsWithInternetCount = 0;
    let waterBodiesCount = 0;
    let populationCovered = 0;
    
    // Try to get counts with error handling for each
    try {
      const { count: towersTotal } = await supabase
        .from('telecom_towers')
        .select('id', { count: 'exact', head: true });
      
      towersTotalCount = towersTotal || 0;
    } catch (error) {
      console.error('Error counting towers:', error);
    }
    
    try {
      const { count: towersActive } = await supabase
        .from('telecom_towers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      
      towersActiveCount = towersActive || 0;
    } catch (error) {
      console.error('Error counting active towers:', error);
    }
    
    try {
      const { count: schoolsTotal } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true });
      
      schoolsTotalCount = schoolsTotal || 0;
    } catch (error) {
      console.error('Error counting schools:', error);
    }
    
    try {
      const { count: schoolsWithInternet } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .eq('has_internet', true);
      
      schoolsWithInternetCount = schoolsWithInternet || 0;
    } catch (error) {
      console.error('Error counting schools with internet:', error);
    }
    
    try {
      const { count: hospitalsTotal } = await supabase
        .from('hospitals')
        .select('id', { count: 'exact', head: true });
      
      hospitalsTotalCount = hospitalsTotal || 0;
    } catch (error) {
      console.error('Error counting hospitals:', error);
    }
    
    try {
      const { count: hospitalsWithInternet } = await supabase
        .from('hospitals')
        .select('id', { count: 'exact', head: true })
        .eq('has_internet', true);
      
      hospitalsWithInternetCount = hospitalsWithInternet || 0;
    } catch (error) {
      console.error('Error counting hospitals with internet:', error);
    }
    
    try {
      const { count: waterBodiesTotal } = await supabase
        .from('water_bodies')
        .select('id', { count: 'exact', head: true });
      
      waterBodiesCount = waterBodiesTotal || 0;
    } catch (error) {
      console.error('Error counting water bodies:', error);
    }
    
    // Try to get coverage analysis data
    try {
      const { data: coverageData } = await supabase
        .from('coverage_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Calculate population covered if data exists
      if (coverageData && coverageData.length > 0) {
        populationCovered = coverageData.reduce((sum, coverage) => {
          return sum + (coverage.population_covered || 0);
        }, 0);
      } else {
        // Estimate based on active towers
        populationCovered = Math.min(totalPopulation, (towersActiveCount * 5000));
      }
    } catch (error) {
      console.error('Error getting coverage analysis:', error);
      // Estimate based on active towers
      populationCovered = Math.min(totalPopulation, (towersActiveCount * 5000));
    }
    
    // Return the complete statistics object
    return {
      totalTowers: towersTotalCount,
      activeTowers: towersActiveCount,
      totalSchools: schoolsTotalCount,
      schoolsWithInternet: schoolsWithInternetCount,
      totalHospitals: hospitalsTotalCount,
      hospitalsWithInternet: hospitalsWithInternetCount,
      totalWaterBodies: waterBodiesCount,
      totalDistricts: districts.length || 0,
      populationCovered,
      populationTotal: totalPopulation
    };
  } catch (error) {
    console.error('Error getting summary statistics:', error);
    // Return default values instead of throwing
    return {
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
    };
  }
};

// Get recent activity
export const getRecentActivity = async (limit = 5) => {
  const { data, error } = await supabase.from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return data as AuditLog[];
};

// The rest of the API service would remain the same
// ...

// CRUD operations for infrastructure items
export const addInfrastructureItem = async (
  tableName: string, 
  itemData: any, 
  userId: string
) => {
  // Process the data - convert coordinates to PostGIS format
  const processedData = processInfrastructureData(itemData, tableName);
  processedData.created_by = userId;
  
  const { data, error } = await supabase
    .from(tableName)
    .insert(processedData);
  
  if (error) throw error;
  
  // Log the action
  await logAction({
    user_id: userId,
    action: 'create',
    table_name: tableName,
    details: `Added new ${getItemTypeName(tableName)} "${itemData.name}"`
  });
  
  return data;
};

// Add this function to your api.ts file
export const getInfrastructureItemById = async (
  tableName: string, 
  itemId: string
) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${tableName} item:`, error);
    throw error;
  }
};
export const updateInfrastructureItem = async (
  tableName: string, 
  itemId: string, 
  itemData: any, 
  userId: string
) => {
  // Process the data - convert coordinates to PostGIS format
  const processedData = processInfrastructureData(itemData, tableName);
  
  const { data, error } = await supabase
    .from(tableName)
    .update(processedData)
    .eq('id', itemId);
  
  if (error) throw error;
  
  // Log the action
  await logAction({
    user_id: userId,
    action: 'update',
    table_name: tableName,
    record_id: itemId,
    details: `Updated ${getItemTypeName(tableName)} "${itemData.name}"`
  });
  
  return data;
};

export const deleteInfrastructureItem = async (
  tableName: string, 
  itemId: string, 
  itemName: string, 
  userId: string
) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', itemId);
  
  if (error) throw error;
  
  // Log the action
  await logAction({
    user_id: userId,
    action: 'delete',
    table_name: tableName,
    record_id: itemId,
    details: `Deleted ${getItemTypeName(tableName)} "${itemName}"`
  });
  
  return true;
};

// Helper functions for API service
// In api.js - Fix the processInfrastructureData function

// Find this function:
function processInfrastructureData(data: any, tableName: string) {
  const processedData = { ...data };
  
  // Convert location coordinates to proper format for PostGIS
  if (processedData.latitude && processedData.longitude) {
    // Convert to PostGIS point format
    processedData.location = `POINT(${processedData.longitude} ${processedData.latitude})`;
    
    // For water bodies, also set up geometry if needed
    if (tableName === 'water_bodies') {
      // Basic geometry for point - in a real app, this would be more complex
      processedData.geometry = `POINT(${processedData.longitude} ${processedData.latitude})`;
    }
  }
  
  // Remove UI-only fields that don't exist in the database
  delete processedData.latitude;
  delete processedData.longitude;
  
  // Fix field names based on the database schema
  if (tableName === 'telecom_towers') {
    // Rename height_m to height
    if ('height_m' in processedData) {
      processedData.height = processedData.height_m;
      delete processedData.height_m;
    }
    
    // Rename coverage_radius_km to coverage_radius
    if ('coverage_radius_km' in processedData) {
      processedData.coverage_radius = processedData.coverage_radius_km;
      delete processedData.coverage_radius_km;
    }
  }
  
  return processedData;
}

// This function is correct, but make sure it's being called properly in the API functions
// and that the form data has consistent field names before being passed to the API
function getItemTypeName(tableName: string): string {
  switch (tableName) {
    case 'telecom_towers':
      return 'tower';
    case 'schools':
      return 'school';
    case 'hospitals':
      return 'hospital';
    case 'water_bodies':
      return 'water body';
    default:
      return 'item';
  }
}

// Log an action to the audit log
export async function logAction(logData: Partial<AuditLog>) {
  return await supabase.from('audit_logs').insert(logData);
}

// Run coverage analysis
export async function runCoverageAnalysis(
  districtId: string | undefined, 
  analysisType: string, 
  userId: string
) {
  try {
    // In a real implementation, this would call a server-side function
    // For demo purposes, we'll simulate it with direct database calls
    
    // Simulated results object
    return simulateCoverageAnalysis(districtId, analysisType, userId);
  } catch (error) {
    console.error('Error running coverage analysis:', error);
    throw error;
  }
}

// This is a simplified simulation - in a real app, this would be a server-side function
async function simulateCoverageAnalysis(
  districtId: string | undefined, 
  analysisType: string, 
  userId: string
) {
  try {
    // Get districts to analyze
    const { data: allDistricts } = await supabase
      .from('districts')
      .select('*');
    
    const districts = districtId 
      ? allDistricts?.filter(d => d.id === districtId) 
      : allDistricts;
    
    if (!districts) return null;
    
    const analysisResults = [];
    
    for (const district of districts) {
      // Calculate random coverage data for this district
      const coverageLevel = Math.random() > 0.6 ? 'High' : (Math.random() > 0.3 ? 'Medium' : 'Low');
      const percentageCovered = coverageLevel === 'High'
        ? 70 + Math.random() * 30
        : (coverageLevel === 'Medium' ? 40 + Math.random() * 30 : 10 + Math.random() * 30);
        
      const populationCovered = Math.round((percentageCovered / 100) * (district.population || 100000));
      
      // Create analysis record
      analysisResults.push({
        district_id: district.id,
        coverage_level: coverageLevel,
        percentage_covered: Math.round(percentageCovered * 10) / 10,
        population_covered: populationCovered,
        coverage_type: analysisType,
        created_by: userId,
        last_calculated: new Date().toISOString()
      });
    }
    
    // Store the results
    const { error } = await supabase
      .from('coverage_analysis')
      .insert(analysisResults);
    
    if (error) throw error;
    
    // Log the analysis run
    await logAction({
      user_id: userId,
      action: 'analysis',
      details: `Ran ${analysisType} coverage analysis${districtId ? ` for district ${districts[0]?.name || districtId}` : ' for all districts'}`
    });
    
    return analysisResults;
  } catch (error) {
    console.error('Error simulating coverage analysis:', error);
    throw error;
  }
}