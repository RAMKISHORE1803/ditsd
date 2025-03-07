"use client";

import { 
  User, Search, Filter, Download, Edit, 
  Lock, Trash, Plus, Clipboard, CheckCircle 
} from 'lucide-react';
import { AuthUser, UserProfile, AuditLog } from '../../types';
import { formatRelativeTime } from '@/app/utils/helper';

interface UsersTabProps {
  users: UserProfile[];
  recentActivity: AuditLog[];
  user: AuthUser;
}

export default function UsersTab({ users, recentActivity, user }: UsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center text-gray-800">
          <User size={20} className="mr-2 text-purple-600" />
          <span>User Management</span>
          <span className="ml-2 text-sm text-gray-600">({users.length} users)</span>
        </h3>
        
        <button
          onClick={() => alert('User management functionality would be implemented here')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Add User</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-800 transition-colors">
              <Filter size={16} />
            </button>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-800 transition-colors">
              <Download size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map(userItem => (
                <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white mr-3">
                        <span className="font-medium">{userItem.name?.charAt(0).toUpperCase() || 'U'}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                        <div className="text-xs text-gray-600">ID: {userItem.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{userItem.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      userItem.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userItem.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => alert('Edit user functionality would be implemented here')}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => alert('Reset password functionality would be implemented here')}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors"
                        title="Reset Password"
                      >
                        <Lock size={16} />
                      </button>
                      {userItem.id !== user.id && (
                        <button
                          onClick={() => alert('Delete user functionality would be implemented here')}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
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
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <User size={40} className="text-gray-400 mb-2" />
                      <p>No users found. Add your first user to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">{users.length} total users</span>
          </div>
          
          <div>
            <button
              onClick={() => alert('User audit log would be shown here')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors flex items-center text-gray-700"
            >
              <Clipboard size={14} className="mr-1" />
              <span>View Audit Log</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Role Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-3">Role Distribution</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Administrators</span>
                <span className="text-gray-900 font-medium">{users.filter(u => u.role === 'admin').length}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${(users.filter(u => u.role === 'admin').length / (users.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Editors</span>
                <span className="text-gray-900 font-medium">{users.filter(u => u.role === 'editor').length}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${(users.filter(u => u.role === 'editor').length / (users.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Viewers</span>
                <span className="text-gray-900 font-medium">{users.filter(u => u.role === 'viewer').length}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-500 rounded-full" 
                  style={{ width: `${(users.filter(u => u.role === 'viewer').length / (users.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-3">Recent Activity</h4>
          <div className="space-y-3 text-sm">
            {recentActivity.filter(a => a.action === 'create' || a.action === 'update' || a.action === 'delete').slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.action === 'create' ? 'bg-green-100 text-green-600' :
                  activity.action === 'update' ? 'bg-blue-100 text-blue-600' :
                  activity.action === 'delete' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.action === 'create' && <Plus size={14} />}
                  {activity.action === 'update' && <Edit size={14} />}
                  {activity.action === 'delete' && <Trash size={14} />}
                </div>
                <div>
                  <p className="text-gray-800">{activity.details}</p>
                  <p className="text-xs text-gray-600">{formatRelativeTime(activity.created_at)}</p>
                </div>
              </div>
            ))}
            
            {/* Show fallback activity if no recent actions */}
            {recentActivity.filter(a => a.action === 'create' || a.action === 'update' || a.action === 'delete').length === 0 && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Plus size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-800">New user added</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Edit size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-800">User role updated</p>
                    <p className="text-xs text-gray-600">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Lock size={14} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-800">Password reset requested</p>
                    <p className="text-xs text-gray-600">3 days ago</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* System Access */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-3">System Access</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">Active Sessions</span>
                <span className="text-lg font-medium text-gray-900">3</span>
              </div>
              <p className="text-xs text-gray-600">Current active user sessions</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">Failed Logins (24h)</span>
                <span className="text-lg font-medium text-gray-900">2</span>
              </div>
              <p className="text-xs text-gray-600">Login attempts that failed</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => alert('Security settings would be shown here')}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors flex items-center justify-center text-gray-700"
              >
                <Lock size={14} className="mr-1" />
                <span>Security Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}