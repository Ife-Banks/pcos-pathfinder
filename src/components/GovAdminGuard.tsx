import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface GovAdminGuardProps {
  children: React.ReactNode;
}

export default function GovAdminGuard({ children }: GovAdminGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !['lga_admin', 'state_admin', 'sth_admin', 'stth_admin'].includes(user.role)) {
    return <Navigate to="/gov-admin/login" replace />;
  }

  return <>{children}</>;
}
