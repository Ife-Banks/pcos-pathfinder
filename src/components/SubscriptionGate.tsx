import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  require: 'active' | 'premium';
  children: ReactNode;
}

export const SubscriptionGate = ({ require, children }: Props) => {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  if (!subscription) return null;

  const blocked =
    require === 'active' ? !subscription.is_active :
    require === 'premium' ? !subscription.has_premium_access : false;

  if (!blocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full p-8 text-center">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-teal-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {subscription.status === 'expired' && subscription.is_trial
            ? 'Your free trial has ended'
            : 'Premium feature'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {subscription.status === 'expired' && subscription.is_trial
            ? 'Your 2-month free trial has expired. Upgrade to keep monitoring your health.'
            : 'This feature is available on the Premium plan. Upgrade to unlock it.'}
        </p>
        <Button
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
          onClick={() => navigate('/subscription/upgrade')}
        >
          View Plans
        </Button>
        <button
          className="mt-3 text-sm text-gray-400 hover:text-gray-600"
          onClick={() => navigate('/dashboard')}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
};