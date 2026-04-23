import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
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



const PTTHLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/ptth/dashboard', key: 'dashboard' },
    { label: 'Patients', icon: Users, path: '/ptth/patients', key: 'patients' },
    { label: 'Referrals', icon: Building2, path: '/ptth/referrals', key: 'referrals' },
    { label: 'Referrals', icon: Building2, path: '/ptth/referrals', key: 'referrals' },
    { label: 'Consultation', icon: FileText, path: '/ptth/consultation', key: 'consultation' },
    { label: 'Treatments', icon: Pill, path: '/ptth/treatments', key: 'treatments' },
    { label: 'Diagnostics', icon: Activity, path: '/ptth/diagnostics', key: 'diagnostics' },
    { label: 'Analytics', icon: BarChart2, path: '/ptth/analytics', key: 'analytics' },
    { label: 'Alerts', icon: Bell, path: '/ptth/alerts', key: 'alerts' },
    { label: 'Staff', icon: Shield, path: '/ptth/staff', key: 'staff' },
    { label: 'Clinicians', icon: Stethoscope, path: '/ptth/clinicians', key: 'clinicians' },
    { label: 'Settings', icon: Settings, path: '/ptth/profile', key: 'settings' },
  ];

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    logout();
    navigate('/ptth/login');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PT';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI-MSHM</p>
              <p className="text-xs text-gray-500">Private Teaching Hospital</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.key === 'dashboard' && location.pathname.startsWith('/ptth/patient'));
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
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
            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{getInitials('')}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">PTTH Staff</p>
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

      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
};

export default PTTHLayout;