import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/services/adminService';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart2,
  Settings,
  LogOut,
  Shield,
  Database,
  Bell,
  Lock,
  FileText,
  Server,
  ClipboardCheck,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PlusSquare,
} from 'lucide-react';

const FACILITY_SUB_ITEMS = [
  { label: 'All Facilities', icon: Building2, path: '/system-admin/facilities?tab=all', key: 'all-facilities' },
  { label: 'Create Facility', icon: PlusSquare, path: '/system-admin/facilities?tab=create', key: 'create-facility' },
  { label: 'Manage Admins', icon: Users, path: '/system-admin/facilities?tab=manage-admins', key: 'manage-admins' },
  { label: 'Create Admin', icon: UserPlus, path: '/system-admin/facilities?tab=create-admin', key: 'create-admin' },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/system-admin/dashboard', key: 'dashboard' },
  { label: 'Facilities', icon: Building2, path: '/system-admin/facilities?tab=all', key: 'facilities' },
  { label: 'Users', icon: Users, path: '/system-admin/users', key: 'users' },
  { label: 'Staff Management', icon: Shield, path: '/system-admin/staff', key: 'staff' },
  { label: 'Check-Ins', icon: ClipboardCheck, path: '/system-admin/checkins', key: 'checkins' },
  { label: 'Onboardings', icon: UserPlus, path: '/system-admin/onboardings', key: 'onboardings' },
  { label: 'Database', icon: Database, path: '/system-admin/database', key: 'database' },
  { label: 'Analytics', icon: BarChart2, path: '/system-admin/analytics', key: 'analytics' },
  { label: 'Logs', icon: FileText, path: '/system-admin/logs', key: 'logs' },
  { label: 'System Health', icon: Server, path: '/system-admin/health', key: 'health' },
  { label: 'Alerts', icon: Bell, path: '/system-admin/alerts', key: 'alerts' },
  { label: 'Security', icon: Lock, path: '/system-admin/security', key: 'security' },
  { label: 'Settings', icon: Settings, path: '/system-admin/settings', key: 'settings' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/system-admin/login" replace />;
  }

  const path = location.pathname;

  const isFacilitiesSection = path.startsWith('/system-admin/facilities');

  const isItemActive = (itemPath: string, itemKey: string) => {
    if (itemKey === 'dashboard') return path === '/system-admin' || path === '/system-admin/dashboard';
    return path === itemPath || path.startsWith(itemPath + '/');
  };

  const isFacilitiesSubActive = (subPath: string) => path === subPath;

  const handleLogout = async () => {
    try {
      await adminAPI.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      logout();
      navigate('/system-admin/login');
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SA';
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 relative`}>

        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-bold text-white text-sm">AI-MSHM</p>
                <p className="text-xs text-slate-400">System Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-20 -right-3 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors z-10"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = isItemActive(item.path, item.key);

            if (item.key === 'facilities') {
              return (
                <div key={item.key}>
                  {!isCollapsed ? (
                    <div>
                      <button
                        onClick={() => setFacilitiesOpen(v => !v)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isFacilitiesSection
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Building2 className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1 truncate text-left">Facilities</span>
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 transition-transform ${facilitiesOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {facilitiesOpen && (
                        <div className="ml-2 mt-1 space-y-0.5 border-l border-slate-600 pl-3">
                          {FACILITY_SUB_ITEMS.map(sub => {
                            const subActive = isFacilitiesSubActive(sub.path);
                            return (
                              <button
                                key={sub.key}
                                onClick={() => navigate(sub.path)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  subActive
                                    ? 'bg-blue-500/30 text-white font-medium'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                }`}
                              >
                                <sub.icon className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/system-admin/facilities?tab=all')}
                      title="Facilities"
                      className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isFacilitiesSection
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Building2 className="h-5 w-5 flex-shrink-0" />
                    </button>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">SA</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Log Out' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-900/50 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;