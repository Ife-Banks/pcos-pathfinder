import { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home, Users, UserPlus, MessageCircle, ArrowUpRight,
  BarChart3, Settings, Bell, LogOut, Menu, X
} from 'lucide-react';
import { phcAPI } from '@/services/phcService';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/phc/dashboard' },
  { label: 'Register', icon: UserPlus, path: '/phc/register' },
  { label: 'Advice', icon: MessageCircle, path: '/phc/advice' },
  { label: 'Escalation', icon: ArrowUpRight, path: '/phc/escalation' },
  { label: 'Analytics', icon: BarChart3, path: '/phc/analytics' },
  { label: 'Alerts', icon: Bell, path: '/phc/alerts' },
  { label: 'Settings', icon: Settings, path: '/phc/settings' },
];

const getInitials = (name?: string) => {
  return name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AI';
};

export default function PHCLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const data = await phcAPI.getUnreadCount();
      const count = typeof data === 'number' ? data : (data?.unread_count ?? 0);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }

  const facilityName = user?.center_info?.center_name;
  const facilityDisplayName = facilityName || 'Primary Health Centre';
  const logoSubtitle = facilityName || 'PHC Portal';
  const userFullName = user?.full_name || 'PHC Staff';
  const userInitials = getInitials(user?.full_name || '');

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      await phcAPI.logout(refresh!, '');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      logout();
      navigate('/phc/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Inter',sans-serif]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex-col z-40">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#2E8B57] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-[#1E1E2E] text-sm">AI-MSHM</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{logoSubtitle}</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-[#E8F5E9] text-[#2E8B57] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E8B57] font-semibold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1E1E2E] truncate">{userFullName}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E8B57] animate-pulse" />
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#2E8B57] flex items-center justify-center">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
          <span className="font-semibold text-[#1E1E2E] text-sm">AI-MSHM PHC</span>
        </div>
        <button onClick={() => navigate('/phc/alerts')} className="relative p-2">
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 bg-white h-full" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <p className="font-semibold text-[#1E1E2E] text-sm">AI-MSHM</p>
              <p className="text-xs text-gray-500">{facilityDisplayName}</p>
            </div>
            <nav className="py-4 px-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.path) ? 'bg-[#E8F5E9] text-[#2E8B57] font-medium' : 'text-gray-600'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:flex fixed top-0 left-64 right-0 bg-white border-b border-gray-100 z-30 h-14 items-center px-6 justify-between">
        <div />
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/phc/alerts')} className="relative p-2 hover:bg-gray-50 rounded-lg">
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 pt-14 pb-20 md:pb-6 min-h-screen">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex justify-around items-center h-16 px-1">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-[10px] min-w-0 ${
              isActive(item.path) ? 'text-[#2E8B57] font-semibold' : 'text-gray-400'
            }`}
          >
            <item.icon size={18} />
            <span className="mt-0.5 truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
