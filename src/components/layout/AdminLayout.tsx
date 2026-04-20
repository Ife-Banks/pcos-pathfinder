import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/services/adminService';
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
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
  ChevronRight
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/system-admin/dashboard', key: 'dashboard' },
    { label: 'Users', icon: Users, path: '/system-admin/users', key: 'users' },
    { label: 'Facilities', icon: Building2, path: '/system-admin/facilities', key: 'facilities' },
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

  const isActive = (item: typeof navItems[0]) => {
    const path = location.pathname;
    // Exact match
    if (path === item.path) return true;
    // Child routes - /users/123, /facilities/new, /facilities/af01c5a8
    if (path.startsWith(item.path + '/')) return true;
    // Special case for dashboard index route
    if (item.key === 'dashboard' && path === '/system-admin') return true;
    return false;
  };

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
          {navItems.map(item => {
            const active = isActive(item);
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