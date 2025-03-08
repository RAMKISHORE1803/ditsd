"use client";

import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom hooks
import { useAuth } from '@/app/hooks/useAuth';
import { useInfrastructure } from '@/app/hooks/useInfrastructure';

// Components
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import LoadingScreen from '../../components/common/LoadingScreen';
import OverviewTab from '../../components/dashboard/OverviewTab';
import InfrastructureTab from '../../components/dashboard/InfrastructureTab';
import CoverageTab from '../../components/dashboard/CoverageTab';
import UsersTab from '../../components/dashboard/UsersTab';
import AddEditForm from '../../components/dashboard/AddEditForm';

export default function AdminDashboard() {
  // Get authentication state
  const { user, loading: authLoading, signOut } = useAuth();
  
  // Form state (for add/edit modal)
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [jsonFields, setJsonFields] = useState<any>({});
  const [formStep, setFormStep] = useState<number>(1);
  
  // Get infrastructure data and operations - ALWAYS call the hook, but pass in undefined if no user
  // This ensures the hook is called consistently in every render
  const infrastructure = useInfrastructure(user?.id);
  
  // While loading auth, show loading screen
  if (authLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }
  
  // If no user, the useAuth hook will redirect to login
  if (!user) {
    return null;
  }

  // Handle form submission
  // In AdminDashboard.js - Fix the form submission process

// Modify the handleFormSubmit function to ensure proper data processing

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate required fields based on current tab
  const requiredFields: Record<string, string[]> = {
    towers: ['name', 'district_id', 'operator', 'type', 'status', 'coverage_radius_km', 'latitude', 'longitude'],
    schools: ['name', 'district_id', 'level', 'type', 'latitude', 'longitude'],
    hospitals: ['name', 'district_id', 'type', 'latitude', 'longitude'],
    waterBodies: ['name', 'district_id', 'type', 'latitude', 'longitude']
  };
  
  const errors: Record<string, string> = {};
  
  // Check required fields
  if (infrastructure.activeTab in requiredFields) {
    for (const field of requiredFields[infrastructure.activeTab]) {
      if (!formData[field] && formData[field] !== 0) {
        errors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    }
  }
  
  // Check latitude/longitude ranges
  if (formData.latitude !== undefined) {
    if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
  }
  
  if (formData.longitude !== undefined) {
    if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
  }
  
  // If there are validation errors, show them and stop submission
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    
    // Check which step has errors
    const stepOneFields = ['name', 'district_id', 'operator', 'type', 'status'];
    const stepTwoFields = ['latitude', 'longitude'];
    
    const hasStepOneErrors = Object.keys(errors).some(key => stepOneFields.includes(key));
    const hasStepTwoErrors = Object.keys(errors).some(key => stepTwoFields.includes(key));
    
    if (hasStepOneErrors) {
      setFormStep(1);
    } else if (hasStepTwoErrors) {
      setFormStep(2);
    } else {
      setFormStep(3);
    }
    return;
  }
  
  const preparedData = JSON.parse(JSON.stringify(formData));
  
  // Ensure numeric fields are converted to numbers
  if (preparedData.latitude) preparedData.latitude = parseFloat(preparedData.latitude);
  if (preparedData.longitude) preparedData.longitude = parseFloat(preparedData.longitude);
  if (preparedData.coverage_radius_km) preparedData.coverage_radius_km = parseFloat(preparedData.coverage_radius_km);
  if (preparedData.height_m) preparedData.height_m = parseFloat(preparedData.height_m);
  
  // Add user ID
  preparedData.created_by = user.id;
  
  console.log('Submitting form data:', preparedData);
  
  try {
    // Determine which endpoint to use based on active tab
    let endpoint; 
    if (infrastructure.activeTab === 'towers') {
      endpoint = 'telecom_towers';
    } else if (infrastructure.activeTab === 'waterBodies') {
      endpoint = 'water_bodies';
    } else {
      endpoint = infrastructure.activeTab;
    }
    
    let result;
    
    if (editingId) {
      // Update existing record
      console.log(`Updating ${endpoint} with ID ${editingId}`);
      result = await infrastructure.updateItem(endpoint, editingId, preparedData);
      toast.success(`${infrastructure.activeTab.slice(0, -1)} updated successfully`);
    } else {
      // Create new record
      console.log(`Creating new ${endpoint}`);
      result = await infrastructure.addItem(endpoint, preparedData);
      toast.success(`${infrastructure.activeTab.slice(0, -1)} added successfully`);
    }
    
    // Reset form and close modal
    setShowAddForm(false);
    setEditingId(null);
    setFormData({});
    setJsonFields({});
    setFormStep(1);
    
    // Refresh data
    infrastructure.loadDataForCurrentTab();
    
  } catch (error) {
    console.error('Error saving form:', error);
    toast.error(`Error ${editingId ? 'updating' : 'adding'} ${infrastructure.activeTab.slice(0, -1)}`);
  }
};

  // Handle deletion of a record
  const handleDeleteRecord = async (id: string, type: string) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        const endpoint = type === 'towers' ? 'telecom_towers' : 
                        type === 'waterBodies' ? 'water_bodies' : 
                        type;
        
        await infrastructure.deleteItem(endpoint, id);
        toast.success(`${type.slice(0, -1)} deleted successfully`);
        
        // Refresh data
        infrastructure.loadDataForCurrentTab();
      } catch (error) {
        console.error('Error deleting record:', error);
        toast.error(`Error deleting ${type.slice(0, -1)}`);
      }
    }
  };

  // Handle opening the edit form
  const handleEditRecord = (record: any) => {
    const formattedData: any = { ...record };
    const type = infrastructure.activeTab; // Get the type from the active tab
    
    // Extract latitude and longitude from location
    if (record.location && record.location.coordinates) {
      formattedData.longitude = record.location.coordinates[0];
      formattedData.latitude = record.location.coordinates[1];
    }
    
    // Parse JSON fields
    if (record.services && typeof record.services === 'string') {
      try {
        const services = JSON.parse(record.services);
        setJsonFields({ services });
      } catch (e) {
        console.error('Error parsing services JSON:', e);
        setJsonFields({ services: {} });
      }
    } else if (record.services && typeof record.services === 'object') {
      setJsonFields({ services: record.services });
    }
    
    // Set form state
    setEditingId(record.id);
    setFormData(formattedData);
    setFormErrors({});
    setFormStep(1);
    setShowAddForm(true);
  };
  
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
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
      />
      
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        activeTab={infrastructure.activeTab} 
        setActiveTab={infrastructure.setActiveTab}
        signOut={signOut}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          activeTab={infrastructure.activeTab} 
          exportCSV={infrastructure.exportCSV}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {infrastructure.loading && !authLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview tab */}
              {infrastructure.activeTab === 'overview' && (
                <OverviewTab 
                  summaryStats={infrastructure.summaryStats}
                  districts={infrastructure.districts}
                  recentActivity={infrastructure.recentActivity}
                  schools={infrastructure.schools}
                  hospitals={infrastructure.hospitals}
                  towers={infrastructure.towers}
                />
              )}
              
              {/* Infrastructure management tabs */}
              {(infrastructure.activeTab === 'towers' || 
                infrastructure.activeTab === 'schools' || 
                infrastructure.activeTab === 'hospitals' || 
                infrastructure.activeTab === 'waterBodies') && (
                <InfrastructureTab
                  activeTab={infrastructure.activeTab}
                  searchTerm={infrastructure.searchTerm}
                  setSearchTerm={infrastructure.setSearchTerm}
                  filterRegion={infrastructure.filterRegion}
                  setFilterRegion={infrastructure.setFilterRegion}
                  filterDensity={infrastructure.filterDensity}
                  setFilterDensity={infrastructure.setFilterDensity}
                  handleSearch={infrastructure.handleSearch}
                  user={user}
                  districts={infrastructure.districts}
                  towers={infrastructure.towers}
                  schools={infrastructure.schools}
                  hospitals={infrastructure.hospitals}
                  waterBodies={infrastructure.waterBodies}
                  totalCount={infrastructure.totalCount}
                  currentPage={infrastructure.currentPage}
                  itemsPerPage={infrastructure.itemsPerPage}
                  setItemsPerPage={infrastructure.setItemsPerPage}
                  handlePageChange={infrastructure.handlePageChange}
                  sortField={infrastructure.sortField}
                  sortDirection={infrastructure.sortDirection}
                  handleSort={infrastructure.handleSort}
                  setShowAddForm={setShowAddForm}
                  setEditingId={setEditingId}
                  setFormData={setFormData}
                  setFormErrors={setFormErrors}
                  setJsonFields={setJsonFields}
                  handleEditRecord={handleEditRecord}
                  handleDeleteRecord={handleDeleteRecord}
                />
              )}
              
              {/* Coverage Analysis Tab */}
              {infrastructure.activeTab === 'coverage' && (
                <CoverageTab
                  user={user}
                  coverageAnalyses={infrastructure.coverageAnalyses}
                  districts={infrastructure.districts}
                  filterRegion={infrastructure.filterRegion}
                  setFilterRegion={infrastructure.setFilterRegion}
                  runCoverageAnalysis={infrastructure.runCoverageAnalysis}
                />
              )}
              
              {/* User Management Tab */}
              {infrastructure.activeTab === 'users' && user.role === 'admin' && (
                <UsersTab
                  users={infrastructure.users}
                  recentActivity={infrastructure.recentActivity}
                  user={user}
                />
              )}
            </>
          )}
        </main>
      </div>
      
      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <AddEditForm
          activeTab={infrastructure.activeTab}
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          jsonFields={jsonFields}
          setJsonFields={setJsonFields}
          formStep={formStep}
          setFormStep={setFormStep}
          districts={infrastructure.districts}
          user={user}
          onClose={() => {
            setShowAddForm(false);
            setEditingId(null);
            setFormData({});
            setFormErrors({});
            setJsonFields({});
            setFormStep(1);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}