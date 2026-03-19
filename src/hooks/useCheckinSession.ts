import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { checkinService, CheckinTodayResponse } from '@/services/checkinService';

export type CheckinPeriod = 'morning' | 'evening';
export type CheckinStatus = 'complete' | 'pending' | 'in_progress';

interface UseCheckinSessionReturn {
  loading: boolean;
  error: string | null;
  todayStatus: CheckinTodayResponse['data'] | null;
  sessionId: string | null;
  isAlreadyComplete: boolean;
  retrySession: () => void;
  startSession: () => Promise<void>;
  submitMorningData: (data: {
    fatigue_vas: number;
    pelvic_pressure_vas: number;
    psq_skin_sensitivity: number;
    psq_muscle_pressure_pain: number;
    psq_body_tenderness: number;
  }) => Promise<void>;
  submitEveningData: (data: {
    breast_left_vas: number;
    breast_right_vas: number;
    mastalgia_side: string;
    mastalgia_quality: string;
    acne_forehead: number;
    acne_right_cheek: number;
    acne_left_cheek: number;
    acne_nose: number;
    acne_chin: number;
    acne_chest_back: number;
    bloating_delta_cm: number | null;
    unusual_bleeding: boolean;
  }) => Promise<void>;
  submitHRV: (hrv: { hrv_sdnn_ms?: number; hrv_rmssd_ms?: number } | null) => Promise<void>;
  completeSession: () => Promise<void>;
}

export function useCheckinSession(period: CheckinPeriod): UseCheckinSessionReturn {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayStatus, setTodayStatus] = useState<CheckinTodayResponse['data'] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAlreadyComplete, setIsAlreadyComplete] = useState(false);
  const hasStarted = useRef(false);

  const fetchTodayStatus = useCallback(async () => {
    try {
      const response = await checkinService.getTodayStatus();
      setTodayStatus(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching today status:', err);
      setError(err.message || 'Failed to load check-in status');
      throw err;
    }
  }, []);

  const startSession = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    setLoading(true);
    setError(null);

    try {
      const status = await fetchTodayStatus();
      
      const statusKey = period === 'morning' ? 'morning_status' : 'evening_status';
      const sessionKey = period === 'morning' ? 'morning_session_id' : 'evening_session_id';
      const currentStatus = status[statusKey];
      const currentSessionId = status[sessionKey];

      if (currentStatus === 'complete') {
        setSessionId(currentSessionId);
        setIsAlreadyComplete(true);
        setLoading(false);
        return;
      }

      if (currentStatus === 'in_progress' && currentSessionId) {
        setSessionId(currentSessionId);
        setLoading(false);
        return;
      }

      try {
        const response = await checkinService.startSession(period);
        setSessionId(response.data.session_id);
      } catch (startErr: any) {
        if (startErr.status === 429) {
          const message = startErr.message || '';
          const match = message.match(/(\d+)\s*second/);
          if (match) {
            const waitSeconds = parseInt(match[1], 10);
            await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
            const response = await checkinService.startSession(period);
            setSessionId(response.data.session_id);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
          const response = await checkinService.startSession(period);
          setSessionId(response.data.session_id);
          return;
        }
        throw startErr;
      }
    } catch (err: any) {
      console.error('Error starting session:', err);
      setError(err.message || 'Failed to start session');
      hasStarted.current = false;
    } finally {
      setLoading(false);
    }
  }, [period, fetchTodayStatus]);

  const retrySession = useCallback(() => {
    hasStarted.current = false;
    setError(null);
    startSession();
  }, [startSession]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const submitMorningData = async (data: {
    fatigue_vas: number;
    pelvic_pressure_vas: number;
    psq_skin_sensitivity: number;
    psq_muscle_pressure_pain: number;
    psq_body_tenderness: number;
  }) => {
    if (!sessionId) {
      throw new Error('No session ID');
    }
    await checkinService.submitMorningCheckin(sessionId, data);
  };

  const submitEveningData = async (data: {
    breast_left_vas: number;
    breast_right_vas: number;
    mastalgia_side: string;
    mastalgia_quality: string;
    acne_forehead: number;
    acne_right_cheek: number;
    acne_left_cheek: number;
    acne_nose: number;
    acne_chin: number;
    acne_chest_back: number;
    bloating_delta_cm: number | null;
    unusual_bleeding: boolean;
  }) => {
    if (!sessionId) {
      throw new Error('No session ID');
    }
    await checkinService.submitEveningCheckin(sessionId, data);
  };

  const submitHRV = async (hrv: { hrv_sdnn_ms?: number; hrv_rmssd_ms?: number } | null) => {
    if (!sessionId) {
      throw new Error('No session ID');
    }
    
    if (hrv) {
      await checkinService.submitHRV({
        session_id: sessionId,
        hrv_sdnn_ms: hrv.hrv_sdnn_ms,
        hrv_rmssd_ms: hrv.hrv_rmssd_ms,
        skipped: false,
      });
    } else {
      await checkinService.submitHRV({
        session_id: sessionId,
        skipped: true,
      });
    }
  };

  const completeSession = async () => {
    if (!sessionId) {
      throw new Error('No session ID');
    }
    
    setLoading(true);
    try {
      await checkinService.submitSession(sessionId);
      toast({
        title: 'Success',
        description: `${period === 'morning' ? 'Morning' : 'Evening'} check-in completed!`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error completing session:', err);
      setError(err.message || 'Failed to complete session');
      toast({
        title: 'Error',
        description: err.message || 'Failed to complete session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    todayStatus,
    sessionId,
    isAlreadyComplete,
    retrySession,
    startSession,
    submitMorningData,
    submitEveningData,
    submitHRV,
    completeSession,
  };
}