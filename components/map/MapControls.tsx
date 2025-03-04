// components/map/MapControls.jsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Home, Plus, Minus, Compass, Share2, Download } from 'lucide-react';

const ControlButton = ({ icon, onClick, active, tooltip }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-2 rounded-md transition-colors relative group ${
        active 
          ? 'bg-indigo-600 text-white' 
          : 'bg-slate-800/90 hover:bg-slate-700/90 text-white/80 hover:text-white'
      }`}
      aria-label={tooltip}
    >
      {icon}
      
      {tooltip && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {tooltip}
        </div>
      )}
    </motion.button>
  );
};

const MapControls = ({ onLayersPanelToggle, isLayerPanelOpen, mapRef }) => {
  const [is3D, setIs3D] = useState(false);
  
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current._zoom;
      mapRef.current.setZoom(currentZoom + 1);
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current._zoom;
      mapRef.current.setZoom(currentZoom - 1);
    }
  };
  
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([1.3733, 32.2903], 7); // Reset to Uganda center
    }
  };
  
  const handleToggle3D = () => {
    setIs3D(!is3D);
    // Implementation would depend on the 3D map library integration
  };
  
  const handleShare = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      
      // Create a shareable URL with current map state
      const url = new URL(window.location.href);
      url.searchParams.set('lat', center.lat.toFixed(5));
      url.searchParams.set('lng', center.lng.toFixed(5));
      url.searchParams.set('zoom', zoom);
      
      // Copy to clipboard
      navigator.clipboard.writeText(url.toString())
        .then(() => {
          // Show toast notification
          alert('Map URL copied to clipboard');
        })
        .catch(err => {
          console.error('Could not copy URL: ', err);
        });
    }
  };
  
  const handleExport = () => {
    // Implementation would depend on export requirements
    // Could export as image, GeoJSON, etc.
    alert('Export map feature coming soon!');
  };
  
  return (
    <>
      {/* Left Controls */}
      <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-2">
        <ControlButton 
          icon={<Layers size={18} />}
          onClick={onLayersPanelToggle}
          active={isLayerPanelOpen}
          tooltip="Toggle Layers"
        />
        <ControlButton 
          icon={<Home size={18} />}
          onClick={handleResetView}
          tooltip="Reset View"
        />
      </div>
      
      {/* Right Controls */}
      <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2">
        <ControlButton 
          icon={<Plus size={18} />}
          onClick={handleZoomIn}
          tooltip="Zoom In"
        />
        <ControlButton 
          icon={<Minus size={18} />}
          onClick={handleZoomOut}
          tooltip="Zoom Out"
        />
        <ControlButton 
          icon={<Compass size={18} />}
          onClick={handleToggle3D}
          active={is3D}
          tooltip={is3D ? "2D View" : "3D View"}
        />
      </div>
      
      {/* Top-Right Controls */}
      <div className="absolute right-4 top-20 z-20 flex flex-col gap-2">
        <ControlButton 
          icon={<Share2 size={18} />}
          onClick={handleShare}
          tooltip="Share Map"
        />
        <ControlButton 
          icon={<Download size={18} />}
          onClick={handleExport}
          tooltip="Export Map"
        />
      </div>
      
      {/* Scale Indicator */}
      <div className="absolute left-4 bottom-36 z-10">
        <div className="bg-slate-800/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-white/80 relative">
              <div className="absolute -top-1 left-0 w-px h-3 bg-white/80"></div>
              <div className="absolute -top-1 right-0 w-px h-3 bg-white/80"></div>
            </div>
            <span>5 km</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapControls;