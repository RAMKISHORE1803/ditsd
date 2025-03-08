"use client";

import { useState } from 'react';
import { X, Save, Check, MapPin, Info } from 'lucide-react';
import { 
  getSchoolLevelOptions, getSchoolTypeOptions,
  getHospitalTypeOptions, getTowerStatusOptions,
  getTowerTypeOptions, getConnectionTypeOptions,
  getPowerSourceOptions, getWaterBodyTypeOptions,
  getHospitalServicesOptions
} from '@/app/utils/helper';
// Import both types from types/index
import { AuthUser, ActiveTab, District } from '@/types/index';

interface AddEditFormProps {
  activeTab: ActiveTab;
  editingId: string | null;
  formData: any;
  setFormData: (data: any) => void;
  formErrors: Record<string, string>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  jsonFields: any;
  setJsonFields: (fields: any) => void;
  formStep: number;
  setFormStep: (step: number) => void;
  districts: District[];
  user: AuthUser;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddEditForm({
  activeTab,
  editingId,
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  jsonFields,
  setJsonFields,
  formStep,
  setFormStep,
  districts,
  user,
  onClose,
  onSubmit
}: AddEditFormProps) {
  // Update form data
  const updateFormData = (key: string, value: any) => {
    // Clear the error for this field when user updates it
    if (formErrors[key]) {
      setFormErrors((prev: any) => {
        const newErrors = {...prev};
        delete newErrors[key];
        return newErrors;
      });
    }
    
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle checkbox for service options
  const handleServiceCheckbox = (service: string, checked: boolean) => {
    setJsonFields((prev: any) => {
      const updatedServices = { ...prev };
      
      if (!updatedServices.services) {
        updatedServices.services = {};
      }
      
      updatedServices.services[service] = checked ? "yes" : "no";
      
      // Update the form data with the stringified JSON
      updateFormData('services', JSON.stringify(updatedServices.services));
      
      return updatedServices;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-medium text-gray-900">
            {editingId ? 'Edit' : 'Add New'} {activeTab === 'towers' ? 'Tower' : 
              activeTab === 'schools' ? 'School' : 
              activeTab === 'hospitals' ? 'Hospital' : 
              activeTab === 'waterBodies' ? 'Water Body' : ''}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form steps indicator */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex mb-4">
            <div className="flex-1">
              <div 
                className={`h-1 rounded-full ${formStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}
              ></div>
              <div className="mt-2 text-center">
                <div 
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                    formStep === 1 ? 'bg-blue-600 text-white' : 
                    formStep > 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {formStep > 1 ? <Check size={16} /> : 1}
                </div>
                <span className="text-xs mt-1 block">Basic Info</span>
              </div>
            </div>
            <div className="flex-1">
              <div 
                className={`h-1 rounded-full ${formStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}
              ></div>
              <div className="mt-2 text-center">
                <div 
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                    formStep === 2 ? 'bg-blue-600 text-white' : 
                    formStep > 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {formStep > 2 ? <Check size={16} /> : 2}
                </div>
                <span className="text-xs mt-1 block">Location</span>
              </div>
            </div>
            <div className="flex-1">
              <div 
                className={`h-1 rounded-full ${formStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}
              ></div>
              <div className="mt-2 text-center">
                <div 
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                    formStep === 3 ? 'bg-blue-600 text-white' : 
                    formStep > 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {formStep > 3 ? <Check size={16} /> : 3}
                </div>
                <span className="text-xs mt-1 block">Details</span>
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={onSubmit}>
          {/* Step 1: Basic Information */}
          {formStep === 1 && (
            <div className="p-6 space-y-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter name"
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <select
                    value={formData.district_id || ''}
                    onChange={(e) => updateFormData('district_id', e.target.value)}
                    className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.district_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select district</option>
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                  {formErrors.district_id && <p className="mt-1 text-xs text-red-600">{formErrors.district_id}</p>}
                </div>
              </div>
              
              {/* Type-specific fields for step 1 */}
              {activeTab === 'towers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operator *</label>
                    <input
                      type="text"
                      value={formData.operator || ''}
                      onChange={(e) => updateFormData('operator', e.target.value)}
                      className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.operator ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter operator name"
                    />
                    {formErrors.operator && <p className="mt-1 text-xs text-red-600">{formErrors.operator}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tower Type *</label>
                    <select
                      value={formData.type || ''}
                      onChange={(e) => updateFormData('type', e.target.value)}
                      className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select tower type</option>
                      {getTowerTypeOptions().map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.type && <p className="mt-1 text-xs text-red-600">{formErrors.type}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tower Status *</label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => updateFormData('status', e.target.value)}
                      className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.status ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select status</option>
                      {getTowerStatusOptions().map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.status && <p className="mt-1 text-xs text-red-600">{formErrors.status}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (meters)</label>
                    <input
                      type="number"
                      value={formData.height_m || ''}
                      onChange={(e) => updateFormData('height_m', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter height"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
              
              {/* Similar field sets for other infrastructure types */}
              {/* Would be implemented for schools, hospitals, and water bodies */}
            </div>
          )}
          
          {/* Step 2: Location Information */}
          {formStep === 2 && (
            <div className="p-6 space-y-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                  <input
                    type="number"
                    value={formData.latitude || ''}
                    onChange={(e) => updateFormData('latitude', parseFloat(e.target.value))}
                    className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.latitude ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g. 0.3136"
                    min="-90"
                    max="90"
                    step="0.000001"
                  />
                  {formErrors.latitude && <p className="mt-1 text-xs text-red-600">{formErrors.latitude}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                  <input
                    type="number"
                    value={formData.longitude || ''}
                    onChange={(e) => updateFormData('longitude', parseFloat(e.target.value))}
                    className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.longitude ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g. 32.5811"
                    min="-180"
                    max="180"
                    step="0.000001"
                  />
                  {formErrors.longitude && <p className="mt-1 text-xs text-red-600">{formErrors.longitude}</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-600 mb-2 flex items-center">
                <Info size={16} className="mr-2 flex-shrink-0 text-blue-500" />
                <span>Enter the latitude and longitude coordinates for the location.</span>
              </div>
              
              {/* Map placeholder */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center justify-center h-48">
                <div className="text-center">
                  <MapPin size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-600">Coordinates: {formData.latitude ? formData.latitude.toFixed(6) : '0.000000'}, {formData.longitude ? formData.longitude.toFixed(6) : '0.000000'}</p>
                  <p className="text-sm text-gray-500 mt-2">For accuracy, use the Google Maps coordinates or GPS device readings</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Additional Details */}
          {formStep === 3 && (
            <div className="p-6 space-y-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h4>
              
              {/* Type-specific fields for step 3 - would be expanded for each infrastructure type */}
              {activeTab === 'towers' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
                      <select
                        value={formData.connection_type || ''}
                        onChange={(e) => updateFormData('connection_type', e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select connection type</option>
                        {getConnectionTypeOptions().map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                   
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Radius (km) *</label>
  <input
    type="number"
    value={formData.coverage_radius_km || ''}
    onChange={(e) => updateFormData('coverage_radius_km', e.target.value)}
    className={`w-full bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      formErrors.coverage_radius_km ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="Enter coverage radius"
    min="0"
    step="0.1"
  />
  {formErrors.coverage_radius_km && <p className="mt-1 text-xs text-red-600">{formErrors.coverage_radius_km}</p>}
</div>
                    
                    {/* Additional tower fields would go here */}
                  </div>
                </div>
              )}
              
              {/* Similar blocks for schools, hospitals, and water bodies */}
              {/* Example of a service checkbox list for hospitals */}
              {activeTab === 'hospitals' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Services Offered</label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {getHospitalServicesOptions().map(service => (
                      <label key={service.value} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={jsonFields.services?.[service.value] === "yes"}
                          onChange={(e) => handleServiceCheckbox(service.value, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Form navigation buttons */}
          <div className="flex justify-between p-6 border-t border-gray-200">
            {formStep > 1 ? (
              <button
                type="button"
                onClick={() => setFormStep(formStep - 1)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
              >
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
              >
                Cancel
              </button>
            )}
            
            {formStep < 3 ? (
              <button
                type="button"
                onClick={() => setFormStep(formStep + 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center"
              >
                <Save size={16} className="mr-2" />
                <span>{editingId ? 'Update' : 'Save'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}