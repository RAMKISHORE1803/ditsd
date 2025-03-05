"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Lock, ChevronDown, Eye, Edit, Trash, Plus,
  Save, X, LogOut, Search, FileText, MapPin, BarChart2, 
  Settings, Radio, School, Hospital, Droplet, AlertTriangle,
  Info, CheckCircle, XCircle, Filter, Calendar, Clipboard,
  Download, Upload, Zap, Monitor, Database, ArrowDown, ArrowUp
} from 'lucide-react';
import { parseWKBPoint } from '@/lib/wkb-helper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Role types for RBAC
type UserRole = 'admin' | 'editor' | 'viewer';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// Dashboard component
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'towers' | 'schools' | 'hospitals' | 'waterBodies' | 'users' | 'coverage'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDensity, setFilterDensity] = useState<'high' | 'medium' | 'low' | ''>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Infrastructure data states
  const [towers, setTowers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [waterBodies, setWaterBodies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coverageAnalyses, setCoverageAnalyses] = useState<any[]>([]);
  
  // Form data for adding/editing infrastructure
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Summary statistics
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get valid options for form fields based on database constraints
  const getSchoolLevelOptions = () => [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "university", label: "University" },
    { value: "vocational", label: "Vocational" }
  ];

  const getSchoolTypeOptions = () => [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "community", label: "Community" }
  ];

  const getHospitalTypeOptions = () => [
    { value: "national", label: "National Referral" },
    { value: "regional", label: "Regional Referral" },
    { value: "district", label: "District Hospital" },
    { value: "private", label: "Private Hospital" },
    { value: "clinic", label: "Clinic/Health Center" }
  ];

  const getTowerStatusOptions = () => [
    { value: "active", label: "Active" },
    { value: "maintenance", label: "Maintenance" },
    { value: "inactive", label: "Inactive" }
  ];

  const getTowerTypeOptions = () => [
    { value: "cellular", label: "Cellular" },
    { value: "microwave", label: "Microwave" },
    { value: "satellite", label: "Satellite" },
    { value: "fiber_node", label: "Fiber Node" }
  ];

  const getConnectionTypeOptions = () => [
    { value: "fiber", label: "Fiber" },
    { value: "4g", label: "4G" },
    { value: "5g", label: "5G" },
    { value: "satellite", label: "Satellite" },
    { value: "microwave", label: "Microwave" }
  ];

  const getWaterBodyTypeOptions = () => [
    { value: "lake", label: "Lake" },
    { value: "river", label: "River" },
    { value: "dam", label: "Dam" },
    { value: "wetland", label: "Wetland" }
  ];

  // Check authentication and load user data
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          // If no session, redirect to login
          router.push('/admin/login');
          return;
        }
        
        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Profile error:', profileError);
          toast.error('Failed to load user profile. Please log in again.');
          // Sign out and redirect to login if no profile
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }
        
        if (!profile) {
          console.error('No user profile found');
          toast.error('User profile not found. Please contact an administrator.');
          // Sign out and redirect to login if no profile
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }
        
        // Set authenticated user
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile.role as UserRole,
          name: profile.name || session.user.email || 'User'
        });
        
        // Load initial data
        await loadDashboardData();
        toast.success(`Welcome, ${profile.name || session.user.email}!`);
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('Authentication error. Please log in again.');
        // Redirect to login on error
        router.push('/admin/login');
      }
    };
    
    checkUser();
  }, [router]);
  
  // Load dashboard data based on user role
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch districts first as they're used for reference in other queries
      const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('*')
        .order('name', { ascending: true });
      
      if (districtsError) {
        toast.error(`Failed to load districts: ${districtsError.message}`);
        throw districtsError;
      }
      setDistricts(districtsData || []);
      
      // Calculate total population and covered population
      const totalPopulation = (districtsData || []).reduce(
        (sum, district) => sum + (district.population || 0), 
        0
      );
      
      // Get counts for summary statistics
      const [
        towersTotalRes,
        towersActiveRes,
        schoolsTotalRes, 
        schoolsWithInternetRes, 
        hospitalsTotalRes, 
        hospitalsWithInternetRes,
        waterBodiesCountRes
      ] = await Promise.all([
        supabase.from('telecom_towers').select('id', { count: 'exact', head: true }),
        supabase.from('telecom_towers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('schools').select('id', { count: 'exact', head: true }).eq('has_internet', true),
        supabase.from('hospitals').select('id', { count: 'exact', head: true }),
        supabase.from('hospitals').select('id', { count: 'exact', head: true }).eq('has_internet', true),
        supabase.from('water_bodies').select('id', { count: 'exact', head: true })
      ]);
      
      // Estimate covered population based on active towers
      // In a real implementation, this would use actual coverage analysis data
      const coveredPopulation = Math.min(
        totalPopulation,
        ((towersActiveRes.count || 0) * 5000) // Rough estimate
      );
      
      setSummaryStats({
        totalTowers: towersTotalRes.count || 0,
        activeTowers: towersActiveRes.count || 0,
        totalSchools: schoolsTotalRes.count || 0,
        schoolsWithInternet: schoolsWithInternetRes.count || 0,
        totalHospitals: hospitalsTotalRes.count || 0,
        hospitalsWithInternet: hospitalsWithInternetRes.count || 0,
        totalWaterBodies: waterBodiesCountRes.count || 0,
        totalDistricts: districtsData?.length || 0,
        populationCovered: coveredPopulation,
        populationTotal: totalPopulation
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try refreshing the page.');
      setLoading(false);
    }
  };
  
  // Update sort parameters
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Load data for the current active tab
  const loadDataForCurrentTab = useCallback(async () => {
    try {
      setLoading(true);
      
      let query;
      let countQuery;
      let tableName = '';
      
      switch (activeTab) {
        case 'towers':
          tableName = 'telecom_towers';
          break;
        case 'schools':
          tableName = 'schools';
          break;
        case 'hospitals':
          tableName = 'hospitals';
          break;
        case 'waterBodies':
          tableName = 'water_bodies';
          break;
        case 'users':
          if (user?.role === 'admin') {
            const { data: usersData, error: usersError } = await supabase
              .from('user_profiles')
              .select('*')
              .order(sortField, { ascending: sortDirection === 'asc' });
            
            if (usersError) {
              toast.error(`Failed to load users: ${usersError.message}`);
              throw usersError;
            }
            setUsers(usersData || []);
          }
          setLoading(false);
          return;
        case 'coverage':
          try {
            const { data: coverageData, error: coverageError } = await supabase
              .from('coverage_analysis')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(20);
            
            if (coverageError) {
              toast.error(`Failed to load coverage data: ${coverageError.message}`);
              throw coverageError;
            }
            
            if (coverageData) {
              setCoverageAnalyses(coverageData);
            }
          } catch (error) {
            console.log('Coverage data not available:', error);
          }
          setLoading(false);
          return;
        case 'overview':
          // No need to load specific data for overview tab
          setLoading(false);
          return;
      }
      
      // Prepare base query
      query = supabase.from(tableName)
        .select('*')
        .limit(itemsPerPage)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      // Count query for pagination
      countQuery = supabase.from(tableName).select('id', { count: 'exact', head: true });
      
      // Apply filters
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
        countQuery = countQuery.ilike('name', `%${searchTerm}%`);
      }
      
      if (filterRegion) {
        query = query.eq('district_id', filterRegion);
        countQuery = countQuery.eq('district_id', filterRegion);
      }
      
      const [dataResult, countResult] = await Promise.all([query, countQuery]);
      
      if (dataResult.error) {
        toast.error(`Failed to load data: ${dataResult.error.message}`);
        throw dataResult.error;
      }
      
      if (countResult.error) {
        toast.error(`Failed to count records: ${countResult.error.message}`);
        throw countResult.error;
      }
      
      // Update state based on active tab
      switch (activeTab) {
        case 'towers':
          setTowers(dataResult.data || []);
          break;
        case 'schools':
          setSchools(dataResult.data || []);
          break;
        case 'hospitals':
          setHospitals(dataResult.data || []);
          break;
        case 'waterBodies':
          setWaterBodies(dataResult.data || []);
          break;
      }
      
      setTotalCount(countResult.count || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data for tab:', error);
      toast.error('Failed to load data. Please try again.');
      setLoading(false);
    }
  }, [activeTab, currentPage, itemsPerPage, searchTerm, filterRegion, user, sortField, sortDirection]);
  
  // Update data when pagination or sorting changes
  useEffect(() => {
    if (user) {
      loadDataForCurrentTab();
    }
  }, [currentPage, itemsPerPage, loadDataForCurrentTab, user, sortField, sortDirection]);
  
  // Effect to load data when tab changes
  useEffect(() => {
    if (user) {
      // Reset pagination and sorting when tab changes
      setCurrentPage(1);
      setSortField('name');
      setSortDirection('asc');
      loadDataForCurrentTab();
    }
  }, [activeTab, loadDataForCurrentTab, user]);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.info('You have been signed out.');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
    }
  };
  
  // Update form data
  const updateFormData = (key: string, value: any) => {
    // Clear the error for this field when user updates it
    if (formErrors[key]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[key];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle search and filtering
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    loadDataForCurrentTab();
  };
  
  // Validate form data before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Common validations
    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.district_id) {
      errors.district_id = "District is required";
    }
    
    if (!formData.latitude || isNaN(Number(formData.latitude))) {
      errors.latitude = "Valid latitude is required";
    } else if (Number(formData.latitude) < -90 || Number(formData.latitude) > 90) {
      errors.latitude = "Latitude must be between -90 and 90";
    }
    
    if (!formData.longitude || isNaN(Number(formData.longitude))) {
      errors.longitude = "Valid longitude is required";
    } else if (Number(formData.longitude) < -180 || Number(formData.longitude) > 180) {
      errors.longitude = "Longitude must be between -180 and 180";
    }
    
    // Tab-specific validations
    switch (activeTab) {
      case 'schools':
        if (!formData.level) {
          errors.level = "School level is required";
        }
        if (!formData.type) {
          errors.type = "School type is required";
        }
        break;
        
      case 'hospitals':
        if (!formData.type) {
          errors.type = "Hospital type is required";
        }
        break;
        
      case 'towers':
        if (!formData.operator?.trim()) {
          errors.operator = "Operator is required";
        }
        if (!formData.status) {
          errors.status = "Status is required";
        }
        if (!formData.type) {
          errors.type = "Tower type is required";
        }
        break;
        
      case 'waterBodies':
        if (!formData.type) {
          errors.type = "Water body type is required";
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission for adding/editing infrastructure
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      toast.error('You do not have permission to modify data.');
      return;
    }
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }
    
    try {
      setLoading(true);
      
      let tableName = '';
      
      // Determine table name based on active tab
      switch (activeTab) {
        case 'towers':
          tableName = 'telecom_towers';
          break;
        case 'schools':
          tableName = 'schools';
          break;
        case 'hospitals':
          tableName = 'hospitals';
          break;
        case 'waterBodies':
          tableName = 'water_bodies';
          break;
        default:
          setLoading(false);
          return;
      }
      
      // Prepare the data
      const dataToSave = { ...formData };
      
      // Convert location coordinates to proper format using PostGIS function syntax
      if (dataToSave.latitude && dataToSave.longitude) {
        // Using "ST_SetSRID(ST_MakePoint(lon, lat), 4326)" format
        // The actual implementation would depend on how your database handles spatial data
        dataToSave.location = `POINT(${dataToSave.longitude} ${dataToSave.latitude})`;
        delete dataToSave.latitude;
        delete dataToSave.longitude;
      }
      
      // Create or update based on editingId
      let response;
      if (editingId) {
        // Update existing record
        response = await supabase
          .from(tableName)
          .update(dataToSave)
          .eq('id', editingId);
        
        if (response.error) throw response.error;
        toast.success('Record updated successfully');
      } else {
        // Insert new record
        dataToSave.created_by = user.id;
        response = await supabase
          .from(tableName)
          .insert(dataToSave);
        
        if (response.error) throw response.error;
        toast.success('New record added successfully');
      }
      
      // Reset form and reload data
      setFormData({});
      setEditingId(null);
      setShowAddForm(false);
      await loadDataForCurrentTab();
      await loadDashboardData(); // Refresh summary stats
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle database constraint errors
      if (error.code === '23514') { // Check constraint violation
        if (error.message.includes('_level_check')) {
          setFormErrors(prev => ({
            ...prev,
            level: "Invalid level. Please select from the dropdown options."
          }));
        } else if (error.message.includes('_type_check')) {
          setFormErrors(prev => ({
            ...prev,
            type: "Invalid type. Please select from the dropdown options."
          }));
        } else if (error.message.includes('_status_check')) {
          setFormErrors(prev => ({
            ...prev,
            status: "Invalid status. Please select from the dropdown options."
          }));
        }
        toast.error('Form contains invalid data. Please check highlighted fields.');
      } else {
        toast.error(`Error saving data: ${error.message || 'Unknown error'}`);
      }
      
      setLoading(false);
    }
  };
  
  // Handle editing a record
  const handleEditRecord = (record: any) => {
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      toast.error('You do not have permission to edit data.');
      return;
    }
    
    const recordToEdit = { ...record };
    
    // Extract latitude and longitude if location exists
    if (recordToEdit.location) {
      try {
        const coordinates = parseWKBPoint(recordToEdit.location);
        recordToEdit.longitude = coordinates[0];
        recordToEdit.latitude = coordinates[1];
      } catch (e) {
        console.error('Error parsing coordinates:', e);
        toast.warning('Could not parse location data. You may need to re-enter coordinates.');
      }
    }
    
    setFormData(recordToEdit);
    setEditingId(record.id);
    setFormErrors({});
    setShowAddForm(true);
  };
  
  // Handle deleting a record
  const handleDeleteRecord = async (id: string) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only administrators can delete records.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      let tableName = '';
      
      // Determine table name based on active tab
      switch (activeTab) {
        case 'towers':
          tableName = 'telecom_towers';
          break;
        case 'schools':
          tableName = 'schools';
          break;
        case 'hospitals':
          tableName = 'hospitals';
          break;
        case 'waterBodies':
          tableName = 'water_bodies';
          break;
        default:
          setLoading(false);
          return;
      }
      
      // Delete record
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Record deleted successfully');
      
      // Reload data and update counts
      await loadDataForCurrentTab();
      await loadDashboardData();
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error(`Error deleting record: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };
  
  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Function to get district name by ID
  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown';
  };
  
  // Export current data to CSV
  const exportToCSV = () => {
    let dataToExport: any[] = [];
    let filename = '';
    
    switch (activeTab) {
      case 'towers':
        dataToExport = towers;
        filename = 'telecom_towers.csv';
        break;
      case 'schools':
        dataToExport = schools;
        filename = 'schools.csv';
        break;
      case 'hospitals':
        dataToExport = hospitals;
        filename = 'hospitals.csv';
        break;
      case 'waterBodies':
        dataToExport = waterBodies;
        filename = 'water_bodies.csv';
        break;
      default:
        return;
    }
    
    if (dataToExport.length === 0) {
      toast.warning('No data to export');
      return;
    }
    
    // Process data for export (replace IDs with names, etc.)
    const processedData = dataToExport.map(item => {
      const newItem = {...item};
      
      // Replace district_id with district name
      if (newItem.district_id) {
        newItem.district = getDistrictName(newItem.district_id);
        delete newItem.district_id;
      }
      
      // Remove complex objects like location
      if (newItem.location) {
        delete newItem.location;
      }
      
      return newItem;
    });
    
    // Convert to CSV
    const headers = Object.keys(processedData[0]);
    const csvContent = [
      headers.join(','),
      ...processedData.map(row => 
        headers.map(header => {
          const value = row[header];
          
          // Handle special formatting
          if (typeof value === 'string') {
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          } else if (value === true) {
            return 'true';
          } else if (value === false) {
            return 'false';
          } else if (value === null) {
            return '';
          } else if (typeof value === 'object') {
            // Stringify objects
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Data exported to ${filename}`);
  };
  
  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center bg-slate-800 p-8 rounded-xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-6 text-white text-lg font-medium">Loading dashboard...</p>
          <p className="mt-2 text-slate-400 text-sm">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }
  
  // If no user, redirect to login (should never happen due to useEffect)
  if (!user) {
    router.push('/admin/login');
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-800/80 backdrop-blur-sm shadow-xl flex flex-col z-10">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Uganda Infrastructure</p>
        </div>
        
        {/* User info */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">
                <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                  user.role === 'admin' ? 'bg-purple-900/70 text-purple-300' :
                  user.role === 'editor' ? 'bg-blue-900/70 text-blue-300' :
                  'bg-slate-900/70 text-slate-300'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'overview' ? 
              'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30' : 
              'hover:bg-slate-700/70'
            }`}
          >
            <BarChart2 size={18} />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('towers')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'towers' ? 
              'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30' : 
              'hover:bg-slate-700/70'
            }`}
          >
            <Radio size={18} />
            <span>Telecom Towers</span>
          </button>
          
          <button
            onClick={() => setActiveTab('schools')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'schools' ? 
              'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30' : 
              'hover:bg-slate-700/70'
            }`}
          >
            <School size={18} />
            <span>Schools</span>
          </button>
          
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'hospitals' ? 
              'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30' : 
              'hover:bg-slate-700/70'
            }`}
          >
            <Hospital size={18} />
            <span>Hospitals</span>
          </button>
          
          <button
            onClick={() => setActiveTab('waterBodies')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'waterBodies' ? 
              'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30' : 
              'hover:bg-slate-700/70'
            }`}
          >
            <Droplet size={18} />
            <span>Water Bodies</span>
          </button>
          
          <button
            onClick={() => setActiveTab('coverage')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'coverage' ? 
              'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30' : 
              'hover:bg-slate-700/70'
            }`}
          >
            <MapPin size={18} />
            <span>Coverage Analysis</span>
          </button>
          
          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'users' ? 
                'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30' : 
                'hover:bg-slate-700/70'
              }`}
            >
              <Settings size={18} />
              <span>User Management</span>
            </button>
          )}
        </nav>
        
        {/* Sign out button */}
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-5 shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'towers' && 'Telecom Towers Management'}
              {activeTab === 'schools' && 'Schools Management'}
              {activeTab === 'hospitals' && 'Hospitals Management'}
              {activeTab === 'waterBodies' && 'Water Bodies Management'}
              {activeTab === 'coverage' && 'Coverage Analysis'}
              {activeTab === 'users' && 'User Management'}
            </h2>
            
            <div className="flex items-center space-x-3">
              {(activeTab === 'towers' || activeTab === 'schools' || activeTab === 'hospitals' || activeTab === 'waterBodies') && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
              )}
              
              <button
                onClick={() => router.push('/map')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <MapPin size={16} />
                <span>View Map</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Summary cards */}
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-900/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Total Towers</h3>
                      <p className="text-2xl font-bold mt-1">{summaryStats.totalTowers}</p>
                    </div>
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Radio size={20} className="text-indigo-400" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-400">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${((summaryStats.activeTowers / summaryStats.totalTowers) * 100) || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-green-400">{((summaryStats.activeTowers / summaryStats.totalTowers) * 100 || 0).toFixed(1)}%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{summaryStats.activeTowers} active towers</p>
                </div>
                
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-900/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Schools & Education</h3>
                      <p className="text-2xl font-bold mt-1">{summaryStats.totalSchools}</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <School size={20} className="text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-400">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${((summaryStats.schoolsWithInternet / summaryStats.totalSchools) * 100) || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-blue-400">{((summaryStats.schoolsWithInternet / summaryStats.totalSchools) * 100 || 0).toFixed(1)}%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{summaryStats.schoolsWithInternet} with internet</p>
                </div>
                
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-900/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Hospitals</h3>
                      <p className="text-2xl font-bold mt-1">{summaryStats.totalHospitals}</p>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Hospital size={20} className="text-red-400" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-400">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${((summaryStats.hospitalsWithInternet / summaryStats.totalHospitals) * 100) || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-red-400">{((summaryStats.hospitalsWithInternet / summaryStats.totalHospitals) * 100 || 0).toFixed(1)}%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{summaryStats.hospitalsWithInternet} with internet</p>
                </div>
                
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-900/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Population Coverage</h3>
                      <p className="text-2xl font-bold mt-1">{((summaryStats.populationCovered / summaryStats.populationTotal) * 100 || 0).toFixed(1)}%</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Zap size={20} className="text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-400">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                        style={{ width: `${((summaryStats.populationCovered / summaryStats.populationTotal) * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {summaryStats.populationCovered.toLocaleString()} of {summaryStats.populationTotal.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Infrastructure by District</h3>
                    <button className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors">
                      <Filter size={16} />
                    </button>
                  </div>
                  <div className="h-64 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead className="bg-slate-700/70 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">District</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Schools</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Hospitals</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Telecom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/70">
                        {districts.slice(0, 10).map(district => {
                          const districtSchools = schools.filter(s => s.district_id === district.id).length;
                          const districtHospitals = hospitals.filter(h => h.district_id === district.id).length;
                          const districtTowers = towers.filter(t => t.district_id === district.id).length;
                          
                          return (
                            <tr key={district.id} className="hover:bg-slate-700/30 transition-colors">
                              <td className="px-3 py-2 text-sm whitespace-nowrap">{district.name}</td>
                              <td className="px-3 py-2 text-sm">
                                <div className="flex items-center">
                                  <span className="mr-2">{districtSchools}</span>
                                  <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{width: `${(districtSchools/5)*100}%`}}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <div className="flex items-center">
                                  <span className="mr-2">{districtHospitals}</span>
                                  <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{width: `${(districtHospitals/5)*100}%`}}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <div className="flex items-center">
                                  <span className="mr-2">{districtTowers}</span>
                                  <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{width: `${(districtTowers/10)*100}%`}}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-center">
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                      View all districts
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Recent Activity</h3>
                    <button className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors">
                      <Calendar size={16} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* Display recent activities if available, otherwise show placeholders */}
                    <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-green-600/30 flex items-center justify-center flex-shrink-0">
                        <Plus size={18} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{towers[0]?.name ? `Tower "${towers[0].name}" added` : 'New tower added in Kampala'}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center">
                          <span className="mr-2">2 hours ago by Admin</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-300">
                            <CheckCircle size={12} className="mr-1" />
                            Successfully added
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                        <Edit size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{schools[0]?.name ? `School "${schools[0].name}" updated` : 'School information updated'}</p>
                        <p className="text-xs text-slate-400 mt-1">1 day ago by Editor</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-yellow-600/30 flex items-center justify-center flex-shrink-0">
                        <Settings size={18} className="text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Coverage analysis performed for {districts[0]?.name || 'Kampala'}</p>
                        <p className="text-xs text-slate-400 mt-1">2 days ago by System</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                        <Monitor size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">System backup completed</p>
                        <p className="text-xs text-slate-400 mt-1">3 days ago by System</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                      View all activity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Infrastructure management tabs (towers, schools, hospitals, water bodies) */}
          {(activeTab === 'towers' || activeTab === 'schools' || activeTab === 'hospitals' || activeTab === 'waterBodies') && (
            <div className="space-y-6">
              {/* Search and filter controls */}
              <div className="flex flex-wrap gap-4 bg-slate-800/80 backdrop-blur-sm p-5 rounded-xl shadow-md border border-slate-700/50">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-slate-400 mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-1">District</label>
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Districts</option>
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Population Density</label>
                  <select
                    value={filterDensity}
                    onChange={(e) => setFilterDensity(e.target.value as any)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All</option>
                    <option value="high">High Density</option>
                    <option value="medium">Medium Density</option>
                    <option value="low">Low Density</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center">
                  {activeTab === 'towers' && (
                    <>
                      <Radio size={20} className="mr-2 text-indigo-400" />
                      <span>Telecom Towers</span>
                    </>
                  )}
                  {activeTab === 'schools' && (
                    <>
                      <School size={20} className="mr-2 text-blue-400" />
                      <span>Schools</span>
                    </>
                  )}
                  {activeTab === 'hospitals' && (
                    <>
                      <Hospital size={20} className="mr-2 text-red-400" />
                      <span>Hospitals</span>
                    </>
                  )}
                  {activeTab === 'waterBodies' && (
                    <>
                      <Droplet size={20} className="mr-2 text-cyan-400" />
                      <span>Water Bodies</span>
                    </>
                  )}
                  <span className="ml-2 text-sm text-slate-400">({totalCount} total)</span>
                </h3>
                
                {(user.role === 'admin' || user.role === 'editor') && (
                  <button
                    onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({}); setFormErrors({}); }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-colors shadow-lg"
                  >
                    <Plus size={16} />
                    <span>Add New</span>
                  </button>
                )}
              </div>
              
              {/* Data table */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700/70">
                      <tr>
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Name</span>
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? 
                              <ArrowUp size={14} /> : 
                              <ArrowDown size={14} />
                            )}
                          </div>
                        </th>
                        
                        {activeTab === 'towers' && (
                          <>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('operator')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Operator</span>
                                {sortField === 'operator' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('status')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Status</span>
                                {sortField === 'status' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('type')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Type</span>
                                {sortField === 'type' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                          </>
                        )}
                        
                        {activeTab === 'schools' && (
                          <>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('level')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Level</span>
                                {sortField === 'level' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('type')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Type</span>
                                {sortField === 'type' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('has_internet')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Internet</span>
                                {sortField === 'has_internet' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                          </>
                        )}
                        
                        {activeTab === 'hospitals' && (
                          <>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('type')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Type</span>
                                {sortField === 'type' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('beds')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Beds</span>
                                {sortField === 'beds' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('has_internet')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Internet</span>
                                {sortField === 'has_internet' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                          </>
                        )}
                        
                        {activeTab === 'waterBodies' && (
                          <>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('type')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Type</span>
                                {sortField === 'type' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('area_sqkm')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Area (km²)</span>
                                {sortField === 'area_sqkm' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                              onClick={() => handleSort('is_protected')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Protected</span>
                                {sortField === 'is_protected' && (
                                  sortDirection === 'asc' ? 
                                  <ArrowUp size={14} /> : 
                                  <ArrowDown size={14} />
                                )}
                              </div>
                            </th>
                          </>
                        )}
                        
                        <th 
                          className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600/30"
                          onClick={() => handleSort('district_id')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>District</span>
                            {sortField === 'district_id' && (
                              sortDirection === 'asc' ? 
                              <ArrowUp size={14} /> : 
                              <ArrowDown size={14} />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/70">
                      {/* Towers */}
                      {activeTab === 'towers' && towers.map(tower => (
                        <tr key={tower.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{tower.name}</td>
                          <td className="px-4 py-3 text-sm">{tower.operator}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              tower.status === 'active' ? 'bg-green-900/70 text-green-300' :
                              tower.status === 'maintenance' ? 'bg-yellow-900/70 text-yellow-300' :
                              'bg-red-900/70 text-red-300'
                            }`}>
                              {tower.status?.charAt(0).toUpperCase() + tower.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{tower.type?.charAt(0).toUpperCase() + tower.type?.slice(1)}</td>
                          <td className="px-4 py-3 text-sm">{tower.district_id ? getDistrictName(tower.district_id) : 'N/A'}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditRecord(tower)}
                                className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-md transition-colors"
                                disabled={user.role === 'viewer'}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(tower.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                                disabled={user.role !== 'admin'}
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Schools */}
                      {activeTab === 'schools' && schools.map(school => (
                        <tr key={school.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{school.name}</td>
                          <td className="px-4 py-3 text-sm capitalize">{school.level}</td>
                          <td className="px-4 py-3 text-sm capitalize">{school.type}</td>
                          <td className="px-4 py-3 text-sm">
                            {school.has_internet ? 
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-300">
                                <CheckCircle size={12} className="mr-1" />
                                Yes
                              </span> : 
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-900/50 text-slate-300">
                                <XCircle size={12} className="mr-1" />
                                No
                              </span>
                            }
                          </td>
                          <td className="px-4 py-3 text-sm">{school.district_id ? getDistrictName(school.district_id) : 'N/A'}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditRecord(school)}
                                className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-md transition-colors"
                                disabled={user.role === 'viewer'}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(school.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                                disabled={user.role !== 'admin'}
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Hospitals */}
                      {activeTab === 'hospitals' && hospitals.map(hospital => (
                        <tr key={hospital.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{hospital.name}</td>
                          <td className="px-4 py-3 text-sm capitalize">{hospital.type}</td>
                          <td className="px-4 py-3 text-sm">{hospital.beds || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            {hospital.has_internet ? 
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-300">
                                <CheckCircle size={12} className="mr-1" />
                                Yes
                              </span> : 
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-900/50 text-slate-300">
                                <XCircle size={12} className="mr-1" />
                                No
                              </span>
                            }
                          </td>
                          <td className="px-4 py-3 text-sm">{hospital.district_id ? getDistrictName(hospital.district_id) : 'N/A'}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditRecord(hospital)}
                                className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-md transition-colors"
                                disabled={user.role === 'viewer'}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(hospital.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                                disabled={user.role !== 'admin'}
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Water Bodies */}
                      {activeTab === 'waterBodies' && waterBodies.map(waterBody => (
                        <tr key={waterBody.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{waterBody.name}</td>
                          <td className="px-4 py-3 text-sm capitalize">{waterBody.type}</td>
                          <td className="px-4 py-3 text-sm">{waterBody.area_sqkm?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            {waterBody.is_protected ? 
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-300">
                                <CheckCircle size={12} className="mr-1" />
                                Yes
                              </span> : 
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-900/50 text-slate-300">
                                <XCircle size={12} className="mr-1" />
                                No
                              </span>
                            }
                          </td>
                          <td className="px-4 py-3 text-sm">{waterBody.district_id ? getDistrictName(waterBody.district_id) : 'N/A'}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditRecord(waterBody)}
                                className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-md transition-colors"
                                disabled={user.role === 'viewer'}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(waterBody.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                                disabled={user.role !== 'admin'}
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Show message when no data available */}
                      {activeTab === 'towers' && towers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            <div className="flex flex-col items-center">
                              <Radio size={40} className="text-slate-500 mb-2" />
                              <p>No towers found. Try adjusting your filters or add a new tower.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {activeTab === 'schools' && schools.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            <div className="flex flex-col items-center">
                              <School size={40} className="text-slate-500 mb-2" />
                              <p>No schools found. Try adjusting your filters or add a new school.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {activeTab === 'hospitals' && hospitals.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            <div className="flex flex-col items-center">
                              <Hospital size={40} className="text-slate-500 mb-2" />
                              <p>No hospitals found. Try adjusting your filters or add a new hospital.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {activeTab === 'waterBodies' && waterBodies.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            <div className="flex flex-col items-center">
                              <Droplet size={40} className="text-slate-500 mb-2" />
                              <p>No water bodies found. Try adjusting your filters or add a new water body.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mr-2">Items per page:</label>
                    <select 
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-slate-400">
                    Showing {totalCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                        // Calculate page number to show (center current page)
                        let pageNum;
                        const totalPages = Math.ceil(totalCount / itemsPerPage);
                        
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        if (pageNum > 0 && pageNum <= totalPages) {
                          return (
                            <button
                              key={i}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                currentPage === pageNum ? 
                                'bg-indigo-600 text-white' : 
                                'bg-slate-700 text-white hover:bg-slate-600'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage * itemsPerPage >= totalCount}
                      className={`px-3 py-1 rounded-md ${
                        currentPage * itemsPerPage >= totalCount ? 
                        'bg-slate-700 text-slate-500 cursor-not-allowed' : 
                        'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </main>
        </div>
        
        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-medium">
                  {editingId ? 'Edit' : 'Add New'} {activeTab === 'towers' ? 'Tower' : 
                    activeTab === 'schools' ? 'School' : 
                    activeTab === 'hospitals' ? 'Hospital' : 
                    activeTab === 'waterBodies' ? 'Water Body' : ''}
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                {/* Form content would be here */}
                {/* This is just a basic placeholder structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className={`w-full bg-slate-700 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.name ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Enter name"
                    />
                    {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">District *</label>
                    <select
                      value={formData.district_id || ''}
                      onChange={(e) => updateFormData('district_id', e.target.value)}
                      className={`w-full bg-slate-700 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.district_id ? 'border-red-500' : 'border-slate-600'
                      }`}
                    >
                      <option value="">Select district</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))}
                    </select>
                    {formErrors.district_id && <p className="mt-1 text-xs text-red-400">{formErrors.district_id}</p>}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coverage Analysis Tab */}
{activeTab === 'coverage' && (
  <div className="space-y-6">
    <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <BarChart2 size={20} className="mr-2 text-indigo-400" />
          <span>Coverage Analysis</span>
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => alert('This would generate a coverage report in a real implementation')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors flex items-center"
          >
            <FileText size={16} className="mr-2" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
      
      {coverageAnalyses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">District</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Coverage Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Coverage %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Population Covered</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70">
              {coverageAnalyses.map(coverage => (
                <tr key={coverage.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-indigo-400 mr-2" />
                      {coverage.district_id ? getDistrictName(coverage.district_id) : 'All Districts'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      coverage.coverage_level === 'High' ? 'bg-green-900/70 text-green-300' :
                      coverage.coverage_level === 'Medium' ? 'bg-yellow-900/70 text-yellow-300' :
                      'bg-red-900/70 text-red-300'
                    }`}>
                      {coverage.coverage_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden mr-2">
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
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <User size={16} className="text-blue-400 mr-2" />
                      <span>{coverage.population_covered?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      {new Date(coverage.last_calculated).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center flex flex-col items-center bg-slate-700/20 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-yellow-500" />
          </div>
          <h4 className="text-lg font-medium text-slate-300 mb-2">No coverage analysis data available</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            Coverage analysis requires the coverage_analysis table to be set up in your database.
          </p>
          {(user.role === 'admin' || user.role === 'editor') && (
            <button
              onClick={() => alert('This would run a new coverage analysis in a real implementation')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors flex items-center"
            >
              <BarChart2 size={16} className="mr-2" />
              <span>Run First Analysis</span>
            </button>
          )}
        </div>
      )}
    </div>
    
    {(user.role === 'admin' || user.role === 'editor') && (
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <BarChart2 size={20} className="mr-2 text-indigo-400" />
            <span>Run Coverage Analysis</span>
          </h3>
          <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full inline-flex items-center">
            <Info size={12} className="mr-1" />
            Takes ~2 minutes
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select District</label>
            <div className="relative">
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">All Districts</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select a specific district or analyze all districts
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Analysis Type</label>
            <div className="relative">
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="telecom">Telecom Coverage</option>
                <option value="internet">Internet Access</option>
                <option value="education">Education Access</option>
                <option value="healthcare">Healthcare Access</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Choose the type of access to analyze
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center"
              onClick={() => alert('This would schedule an analysis for later')}
            >
              <Calendar size={16} className="mr-2" />
              <span>Schedule</span>
            </button>
            
            <button
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-lg text-sm transition-colors shadow-lg flex items-center"
              onClick={() => alert('This would run a new coverage analysis in a real implementation')}
            >
              <BarChart2 size={16} className="mr-2" />
              <span>Run Analysis</span>
            </button>
          </div>
          
          <div className="text-xs text-slate-400">
            Last analysis run: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    )}
  </div>
)}

{/* User management (admin only) */}
{activeTab === 'users' && user.role === 'admin' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium flex items-center">
        <Settings size={20} className="mr-2 text-purple-400" />
        <span>User Management</span>
        <span className="ml-2 text-sm text-slate-400">({users.length} users)</span>
      </h3>
      
      <button
        onClick={() => alert('User management functionality would be here')}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-colors shadow-lg"
      >
        <Plus size={16} />
        <span>Add User</span>
      </button>
    </div>
    
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        </div>
        
        <div className="flex space-x-2">
          <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors">
            <Filter size={16} />
          </button>
          <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors">
            <Download size={16} />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700/70">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Last Login</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/70">
            {users.map(userItem => (
              <tr key={userItem.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-3">
                      <span className="font-medium text-white">{userItem.name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{userItem.name}</div>
                      <div className="text-xs text-slate-400">ID: {userItem.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{userItem.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    userItem.role === 'admin' ? 'bg-purple-900/70 text-purple-300' :
                    userItem.role === 'editor' ? 'bg-blue-900/70 text-blue-300' :
                    'bg-slate-900/70 text-slate-300'
                  }`}>
                    {userItem.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {userItem.last_login ? new Date(userItem.last_login).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => alert('Edit user functionality would be here')}
                      className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-md transition-colors"
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => alert('Reset password functionality would be here')}
                      className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 rounded-md transition-colors"
                      title="Reset Password"
                    >
                      <Lock size={16} />
                    </button>
                    {userItem.id !== user.id && (
                      <button
                        onClick={() => alert('Delete user functionality would be here')}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                        title="Delete User"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <User size={40} className="text-slate-500 mb-2" />
                    <p>No users found. Add your first user to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-700 flex justify-between items-center">
        <div>
          <span className="text-sm text-slate-400">{users.length} total users</span>
        </div>
        
        <div>
          <button
            onClick={() => alert('User audit log would be shown here')}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors flex items-center"
          >
            <Clipboard size={14} className="mr-1" />
            <span>View Audit Log</span>
          </button>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700/50">
        <h4 className="text-md font-medium mb-3">Role Distribution</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Administrators</span>
              <span>{users.filter(u => u.role === 'admin').length}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full" 
                style={{ width: `${(users.filter(u => u.role === 'admin').length / users.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Editors</span>
              <span>{users.filter(u => u.role === 'editor').length}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(users.filter(u => u.role === 'editor').length / users.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Viewers</span>
              <span>{users.filter(u => u.role === 'viewer').length}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-500 rounded-full" 
                style={{ width: `${(users.filter(u => u.role === 'viewer').length / users.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700/50">
        <h4 className="text-md font-medium mb-3">Recent Activity</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-600/30 flex items-center justify-center flex-shrink-0">
              <Plus size={14} className="text-green-400" />
            </div>
            <div>
              <p>New user added</p>
              <p className="text-xs text-slate-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center flex-shrink-0">
              <Edit size={14} className="text-indigo-400" />
            </div>
            <div>
              <p>User role updated</p>
              <p className="text-xs text-slate-400">1 day ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-yellow-600/30 flex items-center justify-center flex-shrink-0">
              <Lock size={14} className="text-yellow-400" />
            </div>
            <div>
              <p>Password reset requested</p>
              <p className="text-xs text-slate-400">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-700/50">
        <h4 className="text-md font-medium mb-3">System Access</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Active Sessions</span>
              <span className="text-lg font-medium">3</span>
            </div>
            <p className="text-xs text-slate-400">Current active user sessions</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Failed Logins (24h)</span>
              <span className="text-lg font-medium">2</span>
            </div>
            <p className="text-xs text-slate-400">Login attempts that failed</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => alert('Security settings would be shown here')}
              className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors flex items-center justify-center"
            >
              <Lock size={14} className="mr-1" />
              <span>Security Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    );
}
        
        
