/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Crown, Users, Settings, Shield, Activity, Database, UserPlus, UserMinus, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface SuperAdminDashboardProps {
  onNavigate?: (page: string) => void;
  language: Language;
}

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: 'citizen' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

interface UserManagementLog {
  id: string;
  action: string;
  previous_role: string;
  new_role: string;
  reason: string;
  created_at: string;
  super_admin_name: string;
  target_user_name: string;
}

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
  updated_at: string;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate, language }) => {
  const { user, profile, refreshProfile } = useAuth();
  const isMarathi = language === 'mr';
  const t = (en: string, mr: string) => (isMarathi ? mr : en);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'settings' | 'statistics'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<UserManagementLog[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<'promote' | 'demote' | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalCitizens: 0,
    totalCertificates: 0,
    totalComplaints: 0,
    pendingCertificates: 0,
    openComplaints: 0
  });

  useEffect(() => {
    // Force refresh profile when component loads to ensure we have latest role
    const initializeComponent = async () => {
      if (user && !profile) {
        console.log('No profile found, refreshing...');
        await refreshProfile();
      }
      
      if (user && profile?.role === 'super_admin') {
        loadData();
      }
    };
    
    initializeComponent();
  }, [user, profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadLogs(),
        loadSettings(),
        loadStatistics()
      ]);
    } catch (error) {
      console.error('Error loading super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as UserProfile[]);
    }
  };

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('user_management_logs')
      .select(`
        *,
        super_admin:super_admin_id(full_name),
        target_user:target_user_id(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data.map(log => ({
        ...log,
        super_admin_name: log.super_admin?.full_name || 'any',
        target_user_name: log.target_user?.full_name || 'any'
      })));
    }
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');

    if (!error && data) {
      setSettings(data);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get user counts
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role');

      // Get service request counts
      const { data: certificateData } = await supabase
        .from('service_requests')
        .select('status');

      // Get complaint counts
      const { data: complaintData } = await supabase
        .from('complaints')
        .select('status');

      if (profileData) {
        const totalUsers = profileData.length;
        const totalAdmins = profileData.filter(p => p.role === 'admin' || p.role === 'super_admin').length;
        const totalCitizens = profileData.filter(p => p.role === 'citizen').length;

        const totalCertificates = certificateData?.length || 0;
        const pendingCertificates = certificateData?.filter(c => c.status === 'Pending').length || 0;

        const totalComplaints = complaintData?.length || 0;
        const openComplaints = complaintData?.filter(c => c.status === 'Open').length || 0;

        setStats({
          totalUsers,
          totalAdmins,
          totalCitizens,
          totalCertificates,
          totalComplaints,
          pendingCertificates,
          openComplaints
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return;

    setProcessing(true);
    try {
      const functionName = actionType === 'promote' ? 'promote_user_to_admin' : 'demote_admin_to_citizen';
      
      const { error } = await supabase.rpc(functionName, {
        target_user_id: selectedUser.id,
        reason: reason || `${actionType === 'promote' ? 'Promoted' : 'Demoted'} by Super Admin`
      });

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert(`User ${actionType === 'promote' ? 'promoted' : 'demoted'} successfully!`);
        await loadUsers();
        await loadLogs();
        setSelectedUser(null);
        setActionType(null);
        setReason('');
      }
    } catch {
      alert('Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const updateSetting = async (settingKey: string, newValue: string) => {
    const { error } = await supabase
      .from('system_settings')
      .update({ 
        setting_value: newValue,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', settingKey);

    if (!error) {
      await loadSettings();
      alert('Setting updated successfully!');
    } else {
      alert('Failed to update setting');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-purple-600 bg-purple-100';
      case 'admin': return 'text-blue-600 bg-blue-100';
      case 'citizen': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'PROMOTE_TO_ADMIN': return 'text-green-600 bg-green-100';
      case 'DEMOTE_TO_CITIZEN': return 'text-red-600 bg-red-100';
      case 'DELETE_USER': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (profile?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Access Denied', 'प्रवेश नाकारला')}</h2>
          <p className="text-gray-600">{t('Only Super Admins can access this dashboard.', 'हे पान केवळ सुपर ॲडमिनसाठी आहे.')}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('Force Refresh Page', 'पृष्ठ रीफ्रेश करा')}
              </button>
              <button
                onClick={async () => {
                  console.log('Manual profile refresh triggered');
                  await refreshProfile();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {t('Refresh Profile', 'प्रोफाइल रीफ्रेश करा')}
              </button>
              {profile?.role === 'admin' && (
                <button
                  onClick={() => onNavigate?.('admin-dashboard')}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  {t('Go to Admin Dashboard', 'ॲडमिन डॅशबोर्डला जा')}
                </button>
              )}
              <button
                onClick={() => onNavigate?.('home')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {t('Go Home', 'मुख्यपृष्ठावर जा')}
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center min-w-0">
              <Crown className="h-8 w-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">{t('Super Admin Dashboard', 'सुपर ॲडमिन डॅशबोर्ड')}</h1>
                <p className="text-purple-100">{t('System Management & User Controls', 'सिस्टम व्यवस्थापन व वापरकर्ता नियंत्रण')}</p>
              </div>
            </div>
            <div className="text-white text-left sm:text-right">
              <p className="font-medium">{profile?.full_name}</p>
              <p className="text-sm text-purple-100">{t('Super Administrator', 'सुपर प्रशासक')}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('Total Users', 'एकूण वापरकर्ते')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('Admins', 'प्रशासक')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('Pending Certificates', 'प्रलंबित प्रमाणपत्रे')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingCertificates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Complaints</p>
                  <p className="text-sm font-medium text-gray-600">{t('Open Complaints', 'मुक्त तक्रारी')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openComplaints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Content Management</h3>
                <p className="text-green-100 text-sm">Manage all website content</p>
              </div>
              <Settings className="h-8 w-8 text-green-200" />
            </div>
            <button
              onClick={() => onNavigate && onNavigate('content-management')}
              className="mt-4 bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-50 font-medium text-sm"
            >
              Open CMS →
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">File Management</h3>
                <p className="text-blue-100 text-sm">Manage storage & uploads</p>
              </div>
              <Database className="h-8 w-8 text-blue-200" />
            </div>
            <a
              href="https://supabase.com/dashboard/project/_/storage"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 font-medium text-sm"
            >
              Open Supabase Storage →
            </a>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">System Monitor</h3>
                <p className="text-purple-100 text-sm">Monitor system health</p>
              </div>
              <Activity className="h-8 w-8 text-purple-200" />
            </div>
            <button
              onClick={() => setActiveTab('statistics')}
              className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-purple-50 font-medium text-sm"
            >
              View Stats →
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex min-w-max gap-6 overflow-x-auto px-4 sm:px-6" aria-label="Tabs">
              {[
                { id: 'users', name: t('User Management', 'वापरकर्ता व्यवस्थापन'), icon: Users },
                { id: 'logs', name: t('Activity Logs', 'क्रियाकलाप नोंदी'), icon: Activity },
                { id: 'settings', name: t('System Settings', 'सिस्टीम सेटिंग्ज'), icon: Settings },
                { id: 'statistics', name: t('Statistics', 'सांख्यिकी'), icon: Database }
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`${
                    activeTab === id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('User Management', 'वापरकर्ता व्यवस्थापन')}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {user.role === 'citizen' && (
                              <button
                                onClick={() => { setSelectedUser(user); setActionType('promote'); }}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                <UserPlus className="h-4 w-4 inline mr-1" />
                                Promote to Admin
                              </button>
                            )}
                            {user.role === 'admin' && (
                              <button
                                onClick={() => { setSelectedUser(user); setActionType('demote'); }}
                                className="text-red-600 hover:text-red-900 mr-4"
                              >
                                <UserMinus className="h-4 w-4 inline mr-1" />
                                Demote to Citizen
                              </button>
                            )}
                            {user.role !== 'super_admin' && (
                              <button className="text-gray-400" disabled>
                                <Eye className="h-4 w-4 inline mr-1" />
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Management Activity Logs</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.target_user_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.previous_role} → {log.new_role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.super_admin_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{setting.setting_key.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="text"
                            defaultValue={setting.setting_value}
                            onBlur={(e) => {
                              if (e.target.value !== setting.setting_value) {
                                updateSetting(setting.setting_key, e.target.value);
                              }
                            }}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Statistics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Users</span>
                        <span className="text-sm font-medium">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Citizens</span>
                        <span className="text-sm font-medium">{stats.totalCitizens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Admins</span>
                        <span className="text-sm font-medium">{stats.totalAdmins}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">System Activity</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Certificates</span>
                        <span className="text-sm font-medium">{stats.totalCertificates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending Certificates</span>
                        <span className="text-sm font-medium">{stats.pendingCertificates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Complaints</span>
                        <span className="text-sm font-medium">{stats.totalComplaints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Open Complaints</span>
                        <span className="text-sm font-medium">{stats.openComplaints}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Action Modal */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {actionType === 'promote' ? 'Promote User to Admin' : 'Demote Admin to Citizen'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">User: {selectedUser.full_name}</p>
              <p className="text-sm text-gray-600 mb-4">
                Current Role: <span className="font-medium">{selectedUser.role}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                rows={3}
                placeholder="Enter reason for role change..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setSelectedUser(null); setActionType(null); setReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleUserAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  actionType === 'promote'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
                disabled={processing}
              >
                {processing ? 'Processing...' : (actionType === 'promote' ? 'Promote' : 'Demote')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;