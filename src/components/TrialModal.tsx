import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface TrialModalProps {
  open: boolean;
  onStartTrial: () => Promise<void>;
}

const TrialModal = ({ open, onStartTrial }: TrialModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await onStartTrial();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Could not start your trial. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-title"
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-[#2E8B57]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#2E8B57]" />
          </div>
          <h2 id="trial-title" className="text-2xl font-bold text-gray-900 mb-2">
            Start your 1-month free trial
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Get full access for 30 days. You can review your plan before the trial ends.
          </p>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <Button
            onClick={handleClick}
            disabled={loading}
            className="w-full bg-[#2E8B57] hover:bg-[#247049] h-12 text-base font-medium"
          >
            {loading ? 'Starting trial...' : 'Continue with 1-month free trial'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialModal;