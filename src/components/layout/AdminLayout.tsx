import React from 'react';
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
  Server
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/system-admin/dashboard', key: 'dashboard' },
    { label: 'Users', icon: Users, path: '/system-admin/users', key: 'users' },
    { label: 'Facilities', icon: Building2, path: '/system-admin/facilities', key: 'facilities' },
    { label: 'Staff Management', icon: Shield, path: '/system-admin/staff', key: 'staff' },
    { label: 'Database', icon: Database, path: '/system-admin/database', key: 'database' },
    { label: 'Analytics', icon: BarChart2, path: '/system-admin/analytics', key: 'analytics' },
    { label: 'Logs', icon: FileText, path: '/system-admin/logs', key: 'logs' },
    { label: 'System Health', icon: Server, path: '/system-admin/health', key: 'health' },
    { label: 'Alerts', icon: Bell, path: '/system-admin/alerts', key: 'alerts' },
    { label: 'Security', icon: Lock, path: '/system-admin/security', key: 'security' },
    { label: 'Settings', icon: Settings, path: '/system-admin/settings', key: 'settings' },
  ];

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
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">AI-MSHM</p>
              <p className="text-xs text-slate-400">System Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.key === 'dashboard' && location.pathname.includes('/system-admin'));
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-400">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-900/50 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log Out
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