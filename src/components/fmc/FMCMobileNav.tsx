import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Users, 
  UserPlus, 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  Settings,
  LogOut,
  FileText,
  Pill,
  Shield,
  Building2
} from 'lucide-react';

const FMCMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    await logout();
    navigate('/fmc/login');
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/fmc/dashboard" },
    { icon: Users, label: "Cases", href: "/fmc/dashboard" },
    { icon: Building2, label: "PHCs", href: "/fmc/network-phc" },
    { icon: UserPlus, label: "Assign", href: "/fmc/assignment" },
    { icon: FileText, label: "Notes", href: "/fmc/consultation" },
    { icon: Pill, label: "Treatments", href: "/fmc/treatment-plans" },
    { icon: BarChart3, label: "Analytics", href: "/fmc/analytics" },
    { icon: AlertTriangle, label: "Alerts", href: "/fmc/alerts" },
    { icon: Shield, label: "Staff", href: "/fmc/staff-management" },
    { icon: Settings, label: "Settings", href: "/fmc/profile" },
    { icon: LogOut, label: "Logout", href: "#", action: handleLogout },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => item.action ? item.action() : navigate(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[80px] transition-colors ${
                isActive 
                  ? "text-red-600" 
                  : item.label === 'Logout' ? "text-red-500" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FMCMobileNav;
