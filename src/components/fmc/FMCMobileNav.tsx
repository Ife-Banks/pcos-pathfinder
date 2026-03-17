import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  UserPlus, 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  Settings 
} from 'lucide-react';

const FMCMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/fmc/dashboard" },
    { icon: Users, label: "Patients", href: "/fmc/patients" },
    { icon: UserPlus, label: "Assignment", href: "/fmc/assignment" },
    { icon: Activity, label: "Diagnostics", href: "/fmc/diagnostics" },
    { icon: BarChart3, label: "Analytics", href: "/fmc/analytics" },
    { icon: AlertTriangle, label: "Alerts", href: "/fmc/alerts" },
    { icon: Settings, label: "Settings", href: "/fmc/settings" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[80px] transition-colors ${
                isActive 
                  ? "text-red-600" 
                  : "text-gray-600 hover:text-gray-900"
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
