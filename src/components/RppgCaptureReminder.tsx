import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

const RPPG_KEY = 'nextRppgCaptureAt';

export const RppgCaptureReminder = () => {
  const navigate = useNavigate();
  const notifiedRef = useRef(false);

  useEffect(() => {
    const check = setInterval(() => {
      const raw = localStorage.getItem(RPPG_KEY);
      if (!raw) {
        notifiedRef.current = false;
        return;
      }
      const nextAt = parseInt(raw, 10);
      if (isNaN(nextAt)) return;

      if (Date.now() >= nextAt && !notifiedRef.current) {
        notifiedRef.current = true;
        localStorage.removeItem(RPPG_KEY);
        toast({
          title: 'rPPG Capture Due',
          description: 'Time for your next 2-minute heart rate variability check-in.',
          action: (
            <ToastAction altText="Start rPPG capture" onClick={() => navigate('/rppg-capture')}>
              Start
            </ToastAction>
          ),
        });
      }
    }, 15000);

    return () => clearInterval(check);
  }, [navigate]);

  return null;
};
