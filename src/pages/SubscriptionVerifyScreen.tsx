import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { subscriptionAPI } from '@/services/subscriptionService';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionVerifyScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setState('error');
      setErrorMsg('No payment reference found.');
      return;
    }
    subscriptionAPI.verifyPayment(reference)
      .then(async () => {
        await refreshSubscription();
        setState('success');
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.detail || 'Payment verification failed.');
        setState('error');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full p-8 text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Verifying payment...</h2>
            <p className="text-gray-500 text-sm mt-2">Please wait, do not close this page.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-teal-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-gray-500 text-sm mb-6">Your subscription is now active. Enjoy full access.</p>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
              onClick={() => navigate('/subscription/upgrade')}
            >
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
