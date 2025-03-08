// components/map/InfoPanel.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Radio, School, Building2, MapPin, Wifi, Signal, AlertTriangle, Plus, ChevronRight } from 'lucide-react';
import { fetchInfrastructureDetails } from '@/lib/api';

// Feature Type Icons
const FeatureIcon = ({ type }: { type: 'tower' | 'school' | 'hospital' | 'district' | string }) => {
  switch (type) {
    case 'tower':
      return <Radio size={20} className="text-yellow-400" />;
    case 'school':
      return <School size={20} className="text-blue-400" />;
    case 'hospital':
      return <Building2 size={20} className="text-red-400" />;
    case 'district':
      return <MapPin size={20} className="text-indigo-400" />;
    default:
      return <MapPin size={20} className="text-gray-400" />;
  }
};

// Loading Skeleton
const InfoSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-700 rounded"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
      <div className="h-4 bg-slate-700 rounded w-4/6"></div>
    </div>
  </div>
);

// Feature Detail Row
const DetailRow = ({ label, value, icon }: { label: string, value: string | number | undefined, icon: React.ReactNode }) => (
  <div className="flex items-start py-2 border-b border-white/10 last:border-0">
    <div className="flex-shrink-0 w-5 mr-2 mt-0.5">
      {icon}
    </div>
    <div>
      <span className="block text-xs text-white/60">{label}</span>
      <span className="block text-sm text-white font-medium">{value || 'N/A'}</span>
    </div>
  </div>
);

// Tower Details Component
const TowerDetails = ({ details }: { details: any }) => (
  <>
    <DetailRow 
      label="Operator" 
      value={details?.operator} 
      icon={<Radio size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Type" 
      value={details?.type} 
      icon={<Signal size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Status" 
      value={details?.status} 
      icon={
        details?.status === 'active' 
          ? <Signal size={14} className="text-green-400" />
          : details?.status === 'maintenance'
            ? <AlertTriangle size={14} className="text-yellow-400" />
            : <AlertTriangle size={14} className="text-red-400" />
      } 
    />
    <DetailRow 
      label="Coverage Radius" 
      value={`${details?.coverage_radius} km`} 
      icon={<Radio size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Internet Connection" 
      value={details?.has_internet ? 'Yes' : 'No'} 
      icon={<Wifi size={14} className={details?.has_internet ? "text-green-400" : "text-white/60"} />} 
    />
    <DetailRow 
      label="Connection Type" 
      value={details?.connection_type} 
      icon={<Signal size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="District" 
      value={details?.district} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
  </>
);

// School Details Component
const SchoolDetails = ({ details }: { details: any }) => (
  <>
    <DetailRow 
      label="Level" 
      value={details?.level} 
      icon={<School size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Type" 
      value={details?.type} 
      icon={<School size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Internet Connection" 
      value={details?.has_internet ? 'Yes' : 'No'} 
      icon={<Wifi size={14} className={details?.has_internet ? "text-green-400" : "text-white/60"} />} 
    />
    <DetailRow 
      label="Connection Type" 
      value={details?.connection_type} 
      icon={<Signal size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Student Count" 
      value={details?.student_count?.toLocaleString()} 
      icon={<School size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Principal" 
      value={details?.principal_name} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="District" 
      value={details?.district} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
  </>
);

// Hospital Details Component
const HospitalDetails = ({ details }: { details: any }) => (
  <>
    <DetailRow 
      label="Type" 
      value={details?.type} 
      icon={<Building2 size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Beds" 
      value={details?.beds?.toLocaleString()} 
      icon={<Building2 size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Internet Connection" 
      value={details?.has_internet ? 'Yes' : 'No'} 
      icon={<Wifi size={14} className={details?.has_internet ? "text-green-400" : "text-white/60"} />} 
    />
    <DetailRow 
      label="Connection Type" 
      value={details?.connection_type} 
      icon={<Signal size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Emergency Services" 
      value={details?.emergency_services ? 'Yes' : 'No'} 
      icon={<AlertTriangle size={14} className={details?.emergency_services ? "text-green-400" : "text-white/60"} />} 
    />
    <DetailRow 
      label="Director" 
      value={details?.director_name} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="District" 
      value={details?.district} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
  </>
);

// District Details Component
const DistrictDetails = ({ details }: { details: any }) => (
  <>
    <DetailRow 
      label="Region" 
      value={details?.region} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Population" 
      value={details?.population?.toLocaleString()} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Area" 
      value={`${details?.area_sqkm?.toLocaleString()} km²`} 
      icon={<MapPin size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Tower Count" 
      value={details?.tower_count?.toLocaleString()} 
      icon={<Radio size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="School Count" 
      value={details?.school_count?.toLocaleString()} 
      icon={<School size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Hospital Count" 
      value={details?.hospital_count?.toLocaleString()} 
      icon={<Building2 size={14} className="text-white/60" />} 
    />
    <DetailRow 
      label="Coverage" 
      value={`${details?.coverage_percentage?.toFixed(1)}%`} 
      icon={<Signal size={14} className="text-white/60" />} 
    />
  </>
);

// Main Information Panel Component
const InfoPanel = ({ feature, onClose }: { feature: any, onClose: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!feature) return;
      
      setLoading(true);
      try {
        const data = await fetchInfrastructureDetails(feature.type, feature.id);
        setDetails(data);
      } catch (error) {
        console.error(`Error fetching ${feature.type} details:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [feature]);
  
  // Get Feature Details Component by type
  const renderFeatureDetails = () => {
    if (loading) return <InfoSkeleton />;
    
    if (!details) {
      return (
        <div className="py-4 text-center">
          <AlertTriangle size={24} className="text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-white/70">Could not load details</p>
        </div>
      );
    }
    
    switch (feature.type) {
      case 'tower':
        return <TowerDetails details={details} />;
      case 'school':
        return <SchoolDetails details={details} />;
      case 'hospital':
        return <HospitalDetails details={details} />;
      case 'district':
        return <DistrictDetails details={details} />;
      default:
        return <p className="text-sm text-white/70">Unknown feature type</p>;
    }
  };
  
  // Feature type label
  const getFeatureTypeLabel = () => {
    switch (feature.type) {
      case 'tower': return 'Telecom Tower';
      case 'school': return 'School';
      case 'hospital': return 'Hospital';
      case 'district': return 'District';
      default: return 'Feature';
    }
  };
  
  return (
    <motion.div 
      className="bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg overflow-hidden flex flex-col h-full max-h-[calc(100vh-120px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="p-3 bg-slate-700/50 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FeatureIcon type={feature.type} />
          <h2 className="text-white font-semibold">{getFeatureTypeLabel()}</h2>
        </div>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white transition p-1"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="px-4 py-3 bg-slate-700/30 border-b border-white/10">
        <h3 className="text-white font-medium">{feature.name}</h3>
        <p className="text-xs text-white/60">{feature.id}</p>
      </div>
      
      <div className="p-3 flex-grow overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {renderFeatureDetails()}
        </div>
      </div>
      
      <div className="p-3 bg-slate-700/50 border-t border-white/10 flex items-center justify-between">
        <button className="flex items-center text-xs text-white/60 hover:text-white transition">
          <Plus size={14} className="mr-1" />
          Add Note
        </button>
        <button className="flex items-center text-xs text-indigo-300 hover:text-indigo-200 transition">
          View Details
          <ChevronRight size={14} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

export default InfoPanel;