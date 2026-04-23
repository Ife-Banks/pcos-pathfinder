import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fmcAPI } from '@/services/fmcService';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Activity,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  Building2,
  Pill,
  FileText,
  Shield,
  Stethoscope
} from 'lucide-react';

const FMCLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/fmc/dashboard', key: 'dashboard' },
    { label: 'Patients', icon: Users, path: '/fmc/patients', key: 'patients' },
    { label: 'PHC Network', icon: Building2, path: '/fmc/network-phc', key: 'network' },
    { label: 'Assignment', icon: UserPlus, path: '/fmc/assignment', key: 'assignment' },
    { label: 'Consultation', icon: FileText, path: '/fmc/consultation', key: 'consultation' },
    { label: 'Treatments', icon: Pill, path: '/fmc/treatment-plans', key: 'treatments' },
    { label: 'Diagnostics', icon: Activity, path: '/fmc/diagnostics', key: 'diagnostics' },
    { label: 'Analytics', icon: BarChart2, path: '/fmc/analytics', key: 'analytics' },
    { label: 'Alerts', icon: Bell, path: '/fmc/alerts', key: 'alerts' },
    { label: 'Staff', icon: Shield, path: '/fmc/staff-management', key: 'staff' },
    { label: 'Clinicians', icon: Stethoscope, path: '/fmc/clinician-management', key: 'clinicians' },
    { label: 'Settings', icon: Settings, path: '/fmc/profile', key: 'settings' },
  ];

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    const access = localStorage.getItem('access_token');
    try {
      await fmcAPI.logout(refresh || '', access || undefined);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      logout();
      navigate('/fmc/login');
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'FM'
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C0392B] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI-MSHM</p>
              <p className="text-xs text-gray-500">
                {user?.center_info?.center_name || 'FMC Portal'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            // Define which routes are considered active for each tab
            const isActive = (() => {
              const path = location.pathname;
              
              // Dashboard is active for dashboard AND patient detail pages
              if (item.key === 'dashboard') {
                return path === '/fmc/dashboard' || path.startsWith('/fmc/patient-detail');
              }
              // Other tabs match exactly
              return path === item.path;
            })();
            
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#C0392B] text-white'
                    : 'text-gray-600 hover:bg-red-50 hover:text-[#C0392B]'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 bg-[#C0392B] rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {getInitials(user?.full_name || '')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'FMC Staff'}
              </p>
              {user?.unique_id && (
                <p className="text-xs text-[#C0392B] font-medium">{user.unique_id}</p>
              )}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default FMCLayout;