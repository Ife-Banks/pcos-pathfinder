import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/authService';
import {
  LayoutDashboard,
  Pill,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  Stethoscope
} from 'lucide-react';

const ClinicianLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/clinician/dashboard', key: 'dashboard' },
    { label: 'Treatment Plans', icon: FileText, path: '/clinician/treatment-plans', key: 'treatments' },
    { label: 'Prescriptions', icon: Pill, path: '/clinician/prescriptions', key: 'prescriptions' },
    { label: 'Communication', icon: MessageSquare, path: '/clinician/communication', key: 'communication' },
    { label: 'Analytics', icon: BarChart3, path: '/clinician/analytics', key: 'analytics' },
    { label: 'Profile', icon: Settings, path: '/clinician/profile', key: 'profile' },
  ];

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    const access = localStorage.getItem('access_token');
    try {
      if (refresh && access) {
        await authAPI.logout(refresh);
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      logout();
      navigate('/clinician/login');
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'DR'
    );
  };

  const isActive = (item: typeof navItems[0]) => {
    const path = location.pathname;
    if (item.key === 'dashboard') {
      return path === '/clinician/dashboard' || path.startsWith('/clinician/patient/');
    }
    if (item.key === 'patients') {
      return path === '/clinician/dashboard' || path.startsWith('/clinician/patient/');
    }
    return path.startsWith(item.path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A5276] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI-MSHM</p>
              <p className="text-xs text-gray-500">
                {user?.center_info?.center_name || 'Clinician Portal'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item)
                  ? 'bg-[#1A5276] text-white'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-[#1A5276]'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 bg-[#1A5276] rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {getInitials(user?.full_name || '')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'Clinician'}
              </p>
              {user?.unique_id && (
                <p className="text-xs text-[#1A5276] font-medium">{user.unique_id}</p>
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
        <Outlet />
      </main>
    </div>
  );
};

export default ClinicianLayout;