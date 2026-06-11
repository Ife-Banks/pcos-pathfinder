import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { subscriptionAPI } from '@/services/subscriptionService';

const TEAL = '#00897B';

const plans = [
  {
    id: 'basic' as const,
    name: 'Basic',
    price: '₦2,500',
    period: '/month',
    description: 'Core health monitoring',
    features: [
      'Daily check-ins (morning & evening)',
      'Period & cycle tracking',
      'Personal dashboard',
      'Health profile',
    ],
    cta: 'Choose Basic',
    highlight: false,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '₦5,000',
    period: '/month',
    description: 'Full AI-powered monitoring',
    features: [
      'Everything in Basic',
      'Weekly tools (mood, sleep, focus)',
      'Lab results & ultrasound upload',
      'AI risk score & trend analysis',
      'SHAP explainability',
      'Triage & clinical summary',
    ],
    cta: 'Choose Premium',
    highlight: true,
  },
];

export default function SubscriptionUpgradeScreen() {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSelect = async (planId: 'basic' | 'premium') => {
    setLoading(planId);
    setError('');
    try {
      const callbackUrl = `${window.location.origin}/subscription/verify`;
      const { authorization_url } = await subscriptionAPI.initiatePayment(planId, callbackUrl);
      window.location.href = authorization_url;
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose your plan</h1>
          {subscription?.is_trial && subscription?.is_active ? (
            <p className="text-sm text-teal-600 font-medium">
              {subscription.days_remaining} days left in your free trial
            </p>
          ) : (
            <p className="text-sm text-gray-500">Unlock the full AI-MSHM experience</p>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl border-2 p-6 ${
                plan.highlight ? 'border-teal-500 shadow-md' : 'border-gray-100'
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-teal-600 bg-teal-50 rounded-full px-3 py-1 inline-block mb-3">
                  Most Popular
                </div>
              )}
              <div className="flex items-end justify-between mb-1">
                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full rounded-xl text-white"
                style={{ background: plan.highlight ? TEAL : '#374151' }}
                onClick={() => handleSelect(plan.id)}
                disabled={loading !== null}
              >
                {loading === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  plan.cta
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}