import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { phcAPI } from '@/services/phcService';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  ArrowUpRight,
  BarChart2,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

const FMCLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/fmc/dashboard' },
    { label: 'Patients', icon: Users, path: '/fmc/patients' },
    { label: 'Assignment', icon: UserPlus, path: '/fmc/assignment' },
    { label: 'Diagnostics', icon: MessageSquare, path: '/fmc/diagnostics' },
    { label: 'Analytics', icon: BarChart2, path: '/fmc/analytics' },
    { label: 'Alerts', icon: Bell, path: '/fmc/alerts' },
    { label: 'Settings', icon: Settings, path: '/fmc/settings' },
  ];

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      await phcAPI.logout(refresh || '', '');
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
            <div className="w-8 h-8 bg-[#C0392B] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AI-MSHM</p>
              <p className="text-xs text-gray-500">
                {user?.center_info?.center_name || 'FMC Portal'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-red-50 text-[#C0392B] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 bg-[#C0392B] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getInitials(user?.full_name || '')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'FMC Staff'}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default FMCLayout;
