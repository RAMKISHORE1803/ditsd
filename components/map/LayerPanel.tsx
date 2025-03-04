// components/map/LayerPanel.jsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Layers, Radio, School, Building2, Droplets, Signal } from 'lucide-react';

const LayerToggle = ({ label, active, onChange, icon, count }) => {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white text-sm">{label}</span>
        {count !== undefined && (
          <span className="text-xs text-white/60 ml-1">({count})</span>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          active ? 'bg-indigo-600' : 'bg-slate-700'
        }`}
      >
        <span
          className={`${
            active ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
    </div>
  );
};

const LayerCategory = ({ title, children, initialExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-white font-medium text-sm py-2 px-1 border-b border-white/10"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      
      <motion.div
        initial={{ height: initialExpanded ? 'auto' : 0, opacity: initialExpanded ? 1 : 0 }}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="py-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const LayerPanel = ({ activeLayers, onToggle, summary }) => {
  return (
    <motion.div 
      className="bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="p-3 bg-slate-700/50 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-indigo-400" />
          <h2 className="text-white font-semibold">Map Layers</h2>
        </div>
      </div>
      
      <div className="p-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        <LayerCategory title="Boundaries & Coverage">
          <LayerToggle
            label="District Boundaries"
            active={activeLayers.districts}
            onChange={() => onToggle('districts')}
            icon={<Radio size={16} className="text-indigo-400" />}
          />
          <LayerToggle
            label="Network Coverage"
            active={activeLayers.coverage}
            onChange={() => onToggle('coverage')}
            icon={<Signal size={16} className="text-indigo-400" />}
          />
        </LayerCategory>
        
        <LayerCategory title="Infrastructure">
          <LayerToggle
            label="Telecom Towers"
            active={activeLayers.towers}
            onChange={() => onToggle('towers')}
            icon={<Radio size={16} className="text-yellow-400" />}
            count={summary?.towers}
          />
          <LayerToggle
            label="Schools"
            active={activeLayers.schools}
            onChange={() => onToggle('schools')}
            icon={<School size={16} className="text-blue-400" />}
            count={summary?.schools}
          />
          <LayerToggle
            label="Hospitals"
            active={activeLayers.hospitals}
            onChange={() => onToggle('hospitals')}
            icon={<Building2 size={16} className="text-red-400" />}
            count={summary?.hospitals}
          />
          <LayerToggle
            label="Water Bodies"
            active={activeLayers.waterBodies}
            onChange={() => onToggle('waterBodies')}
            icon={<Droplets size={16} className="text-blue-400" />}
            count={summary?.waterBodies}
          />
        </LayerCategory>
        
        <div className="mt-4 p-3 bg-indigo-900/30 rounded-md border border-indigo-500/30">
          <div className="text-xs text-white/80">
            <h3 className="font-medium mb-1 text-indigo-300">Digital Infrastructure</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-white/60">Towers</p>
                <p className="font-medium text-white">{summary?.towers || 0}</p>
              </div>
              <div>
                <p className="text-white/60">Schools</p>
                <p className="font-medium text-white">{summary?.schools || 0}</p>
              </div>
              <div>
                <p className="text-white/60">Hospitals</p>
                <p className="font-medium text-white">{summary?.hospitals || 0}</p>
              </div>
              <div>
                <p className="text-white/60">Water Bodies</p>
                <p className="font-medium text-white">{summary?.waterBodies || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-slate-700/50 border-t border-white/10 text-center">
        <button className="text-xs text-indigo-300 hover:text-indigo-200 transition">
          Reset View
        </button>
      </div>
    </motion.div>
  );
};

export default LayerPanel;