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
  AlertTriangle
} from 'lucide-react';

interface STTHLayoutProps {
  children: React.ReactNode;
}

const STTHLayout = ({ children }: STTHLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/stth/dashboard', key: 'dashboard' },
    { label: 'Patients', icon: Users, path: '/stth/patients', key: 'patients' },
    { label: 'Referrals', icon: Building2, path: '/stth/referrals', key: 'referrals' },
    { label: 'Referrals', icon: Building2, path: '/stth/referrals', key: 'referrals' },
    { label: 'Consultation', icon: FileText, path: '/stth/consultation', key: 'consultation' },
    { label: 'Treatments', icon: Pill, path: '/stth/treatments', key: 'treatments' },
    { label: 'Diagnostics', icon: Activity, path: '/stth/diagnostics', key: 'diagnostics' },
    { label: 'Analytics', icon: BarChart2, path: '/stth/analytics', key: 'analytics' },
    { label: 'Alerts', icon: Bell, path: '/stth/alerts', key: 'alerts' },
    { label: 'Staff', icon: Shield, path: '/stth/staff', key: 'staff' },
    { label: 'Settings', icon: Settings, path: '/stth/profile', key: 'settings' },
  ];

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    logout();
    navigate('/stth/login');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI-MSHM</p>
              <p className="text-xs text-gray-500">State Teaching Hospital</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.key === 'dashboard' && location.pathname.startsWith('/stth/patient'));
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
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
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{getInitials('')}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">STTH Staff</p>
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

export default STTHLayout;