import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { portalAPI } from '@/services/portalService';
import {
  LayoutDashboard,
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
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  Users,
  ClipboardList
} from 'lucide-react';

interface STHLayoutProps {
  children: React.ReactNode;
}

const STHLayout = ({ children }: STHLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/sth/dashboard', key: 'dashboard' },
    { label: 'Patients', icon: Users, path: '/sth/patients', key: 'patients' },
    { label: 'PHC Referrals', icon: Building2, path: '/sth/referrals', key: 'referrals' },
    { label: 'PHC Referrals', icon: Building2, path: '/sth/referrals', key: 'referrals' },
    { label: 'Consultation', icon: FileText, path: '/sth/consultation', key: 'consultation' },
    { label: 'Treatments', icon: Pill, path: '/sth/treatments', key: 'treatments' },
    { label: 'Diagnostics', icon: Activity, path: '/sth/diagnostics', key: 'diagnostics' },
    { label: 'Analytics', icon: BarChart2, path: '/sth/analytics', key: 'analytics' },
    { label: 'Escalations', icon: AlertTriangle, path: '/sth/escalations', key: 'escalations' },
    { label: 'Staff', icon: Shield, path: '/sth/staff', key: 'staff' },
    { label: 'Settings', icon: Settings, path: '/sth/profile', key: 'settings' },
  ];

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    const access = localStorage.getItem('access_token');
    try {
      await portalAPI.logout('sth', refresh || '', access || undefined);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      logout();
      navigate('/sth/login');
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'ST'
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI-MSHM</p>
              <p className="text-xs text-gray-500">
                State Hospital
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = (() => {
              const path = location.pathname;
              if (item.key === 'dashboard') {
                return path === '/sth/dashboard' || path.startsWith('/sth/patient');
              }
              return path === item.path;
            })();
            
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:bg-teal-50 hover:text-teal-600'
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
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {getInitials('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                STH Staff
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default STHLayout;