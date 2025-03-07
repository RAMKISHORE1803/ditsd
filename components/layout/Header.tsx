"use client";

import { MapPin, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  exportCSV?: () => void;
}

export default function Header({ activeTab, exportCSV }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 p-5 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {activeTab === 'overview' && 'Dashboard Overview'}
          {activeTab === 'towers' && 'Telecom Towers Management'}
          {activeTab === 'schools' && 'Schools Management'}
          {activeTab === 'hospitals' && 'Hospitals Management'}
          {activeTab === 'waterBodies' && 'Water Bodies Management'}
          {activeTab === 'coverage' && 'Coverage Analysis'}
          {activeTab === 'users' && 'User Management'}
        </h2>
        
        <div className="flex items-center space-x-3">
          {(activeTab === 'towers' || activeTab === 'schools' || 
            activeTab === 'hospitals' || activeTab === 'waterBodies' || 
            activeTab === 'coverage') && (
            <button
              onClick={exportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          )}
          
          <button
            onClick={() => router.push('/map')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <MapPin size={16} />
            <span>View Map</span>
          </button>
        </div>
      </div>
    </header>
  );
}