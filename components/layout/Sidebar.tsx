"use client";

import { 
  User, LogOut, BarChart2, Radio, School, 
  Hospital, Droplet, MapPin, Settings
} from 'lucide-react';
import { AuthUser, ActiveTab } from '../../types';

interface SidebarProps {
  user: AuthUser;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  signOut: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, signOut }: SidebarProps) {
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col z-10">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Uganda Infrastructure</p>
      </div>
      
      {/* User info */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-600">
              <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
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
            'bg-blue-50 text-blue-700 font-medium' : 
            'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <BarChart2 size={18} />
          <span>Overview</span>
        </button>
        
        <button
          onClick={() => setActiveTab('towers')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'towers' ? 
            'bg-blue-50 text-blue-700 font-medium' : 
            'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Radio size={18} />
          <span>Telecom Towers</span>
        </button>
        
        <button
          onClick={() => setActiveTab('schools')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'schools' ? 
            'bg-blue-50 text-blue-700 font-medium' : 
            'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <School size={18} />
          <span>Schools</span>
        </button>
        
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'hospitals' ? 
            'bg-blue-50 text-blue-700 font-medium' : 
            'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Hospital size={18} />
          <span>Hospitals</span>
        </button>
        
        <button
          onClick={() => setActiveTab('waterBodies')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'waterBodies' ? 
            'bg-blue-50 text-blue-700 font-medium' : 
            'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Droplet size={18} />
          <span>Water Bodies</span>
        </button>
        
        <button
          onClick={() => setActiveTab('coverage')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'coverage' ? 
            'bg-blue-50 text-blue-700 font-medium' : 
            'hover:bg-gray-100 text-gray-700'
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
              'bg-blue-50 text-blue-700 font-medium' : 
              'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Settings size={18} />
            <span>User Management</span>
          </button>
        )}
      </nav>
      
      {/* Sign out button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}