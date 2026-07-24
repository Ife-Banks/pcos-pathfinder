// Gov Admin Portal — GovAdminLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { govAdminAPI } from '@/services/govAdminService';
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

const getNavItems = (role: string | undefined) => {
  if (role === 'state_admin' || role === 'sth_admin' || role === 'stth_admin') {
    return [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/gov-admin/dashboard', key: 'dashboard' },
      { label: 'State Facilities', icon: Building2, path: '/gov-admin/facilities', key: 'facilities' },
      { label: 'Staff', icon: Users, path: '/gov-admin/staff', key: 'staff' },
      { label: 'Admin Management', icon: Shield, path: '/gov-admin/admins', key: 'admins' },
    ];
  }
  return [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/gov-admin/dashboard', key: 'dashboard' },
    { label: 'Facilities (PHC)', icon: Building2, path: '/gov-admin/facilities', key: 'facilities' },
    { label: 'PHC Staff', icon: Users, path: '/gov-admin/staff', key: 'staff' },
    { label: 'Admin Management', icon: Shield, path: '/gov-admin/admins', key: 'admins' },
  ];
};

const GovAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const path = location.pathname;

  const NAV_ITEMS = getNavItems(user?.role);

  const isItemActive = (itemPath: string, itemKey: string) => {
    if (itemKey === 'dashboard')
      return path === '/gov-admin' || path === '/gov-admin/dashboard';
    const basePath = itemPath.split('?')[0];
    return path === basePath || path.startsWith(basePath + '/');
  };

  const handleLogout = async () => {
    try {
      await govAdminAPI.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      logout();
      navigate('/gov-admin/login');
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'GA'
    );
  };

  const u = user as Record<string, unknown> | null;
  const lgaName = (u?.lga_name as string) || (u?.lga as string) || '';
  const stateName = (u?.state_name as string) || (u?.state as string) || '';

  return (
    <div className="flex h-screen bg-gray-900">
      <aside
        className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 relative`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-bold text-white text-sm">AI-MSHM</p>
                <p className="text-xs text-teal-400">Gov Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-20 -right-3 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* LGA Info */}
        {!isCollapsed && (lgaName || stateName) && (
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-3 w-3 text-teal-400 flex-shrink-0" />
              <span className="truncate">
                {lgaName}
                {stateName ? ` · ${stateName}` : ''}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.path, item.key);
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-teal-600 text-white'
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
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">
                {getInitials(user?.full_name || '')}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name || 'Gov Admin'}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.role === 'state_admin' ? 'State Administrator' : user?.role === 'sth_admin' ? 'STH Administrator' : user?.role === 'stth_admin' ? 'STTH Administrator' : 'LGA Administrator'}
                </p>
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

export default GovAdminLayout;
