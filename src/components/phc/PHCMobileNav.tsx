import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  UserPlus, 
  MessageCircle, 
  ArrowUpRight, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const PHCMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/phc/dashboard" },
    { icon: Users, label: "Patients", href: "/phc/patients" },
    { icon: UserPlus, label: "Register", href: "/phc/register" },
    { icon: MessageCircle, label: "Advice", href: "/phc/advice" },
    { icon: ArrowUpRight, label: "Refer", href: "/phc/refer" },
    { icon: BarChart3, label: "Analytics", href: "/phc/analytics" },
    { icon: Settings, label: "Settings", href: "/phc/settings" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[80px] transition-colors ${
                isActive 
                  ? "text-[#2E8B57]" 
                  : "text-gray-600 hover:text-[#1E1E2E]"
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

export default PHCMobileNav;
