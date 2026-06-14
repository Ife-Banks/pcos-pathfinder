import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Pricing } from '@/components/ui/pricing';
import { subscriptionAPI } from '@/services/subscriptionService';

export default function SubscriptionUpgradeScreen() {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSelect = async (planId: 'basic' | 'premium') => {
    setError('');
    setLoading(planId);
    try {
      const callbackUrl = `${window.location.origin}/subscription/verify`;
      const { authorization_url, reference } = await subscriptionAPI.initiatePayment(planId, callbackUrl);
      sessionStorage.setItem('paystack_reference', reference);
      window.location.href = authorization_url;
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not initiate payment. Try again.');
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'BASIC',
      price: '2500',
      yearlyPrice: '2000',
      period: 'month',
      features: [
        'Daily check-ins (morning & evening)',
        'Period & cycle tracking',
        'Personal dashboard',
        'Health profile',
      ],
      description: 'Core health monitoring for individuals',
      buttonText: loading === 'basic' ? '...' : 'Choose Basic',
      href: '',
      isPopular: false,
      onSelect: () => handleSelect('basic'),
    },
    {
      name: 'PREMIUM',
      price: '5000',
      yearlyPrice: '4000',
      period: 'month',
      features: [
        'Everything in Basic',
        'Weekly tools (mood, sleep, focus)',
        'Lab results & ultrasound upload',
        'AI risk score & trend analysis',
        'SHAP explainability',
        'Triage & clinical summary',
      ],
      description: 'Full AI-powered health monitoring',
      buttonText: loading === 'premium' ? '...' : 'Choose Premium',
      href: '',
      isPopular: true,
      onSelect: () => handleSelect('premium'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {subscription?.is_trial && subscription?.is_active && (
          <div className="text-center mb-2">
            <p className="text-sm text-teal-600 font-medium">
              {subscription.days_remaining} days left in your free trial
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 max-w-lg mx-auto">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          </div>
        )}

        <Pricing
          plans={plans}
          title="Choose your plan"
          description="Unlock the full AI-MSHM experience. Cancel anytime."
        />
      </div>
    </div>
  );
}
