import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { checkinService, CheckinTodayResponse } from '@/services/checkinService';

export type CheckinPeriod = 'morning' | 'evening';

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
    mastalgia_side: string | null;
    mastalgia_quality: string | null;
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
  completeSession: () => Promise<{ predictions_triggered: boolean }>;
  autosave: (payload: Record<string, unknown>) => Promise<void>;
}

export function useCheckinSession(period: CheckinPeriod): UseCheckinSessionReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayStatus, setTodayStatus] = useState<CheckinTodayResponse['data'] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAlreadyComplete, setIsAlreadyComplete] = useState(false);
  const mountedRef = useRef(true);
  const retryKeyRef = useRef(0);

  const fetchTodayStatus = useCallback(async () => {
    try {
      const response = await checkinService.getTodayStatus();
      if (mountedRef.current) {
        setTodayStatus(response.data);
        return response.data;
      }
    } catch (err: any) {
      console.error('Error fetching today status:', err);
      if (mountedRef.current) {
        setError(err?.message || 'Failed to load check-in status');
      }
      throw err;
    }
    return null;
  }, []);

  const startSession = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const status = await fetchTodayStatus();

      const statusKey = period === 'morning' ? 'morning_status' : 'evening_status';
      const sessionKey = period === 'morning' ? 'morning_session_id' : 'evening_session_id';
      const currentStatus = status?.[statusKey];
      const existingSessionId = status?.[sessionKey] ?? null;

      if (currentStatus === 'complete') {
        if (mountedRef.current) {
          setSessionId(existingSessionId);
          setIsAlreadyComplete(true);
          setLoading(false);
        }
        return;
      }

      if (currentStatus === 'in_progress' && existingSessionId) {
        if (mountedRef.current) {
          setSessionId(existingSessionId);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await checkinService.startSession(period);
        if (mountedRef.current) {
          setSessionId(response.data.id);
          setLoading(false);
        }
      } catch (startErr: any) {
        if (startErr?.status === 429) {
          const message = startErr?.message || '';
          const match = message.match(/(\d+)\s*second/);
          const waitMs = match ? parseInt(match[1], 10) * 1000 : 5000;
          await new Promise(r => setTimeout(r, waitMs));
          const response = await checkinService.startSession(period);
          if (mountedRef.current) {
            setSessionId(response.data.id);
            setLoading(false);
          }
        } else {
          throw startErr;
        }
      }
    } catch (err: any) {
      console.error('Error starting session:', err);
      if (mountedRef.current) {
        setError(err?.message || 'Failed to start session');
        setLoading(false);
      }
    }
  }, [period, fetchTodayStatus]);

  const retrySession = useCallback(() => {
    retryKeyRef.current += 1;
    setError(null);
    setIsAlreadyComplete(false);
    setLoading(true);
    startSession();
  }, [startSession]);

  useEffect(() => {
    mountedRef.current = true;
    startSession();
    return () => {
      mountedRef.current = false;
    };
  }, [startSession, retryKeyRef.current]);

  const submitMorningData = async (data: {
    fatigue_vas: number;
    pelvic_pressure_vas: number;
    psq_skin_sensitivity: number;
    psq_muscle_pressure_pain: number;
    psq_body_tenderness: number;
  }) => {
    if (!sessionId) throw new Error('No session ID');
    await checkinService.submitMorningCheckin(sessionId, data);
  };

  const submitEveningData = async (data: {
    breast_left_vas: number;
    breast_right_vas: number;
    mastalgia_side: string | null;
    mastalgia_quality: string | null;
    acne_forehead: number;
    acne_right_cheek: number;
    acne_left_cheek: number;
    acne_nose: number;
    acne_chin: number;
    acne_chest_back: number;
    bloating_delta_cm: number | null;
    unusual_bleeding: boolean;
  }) => {
    if (!sessionId) throw new Error('No session ID');
    await checkinService.submitEveningCheckin(sessionId, data);
  };

  const submitHRV = async (hrv: { hrv_sdnn_ms?: number; hrv_rmssd_ms?: number } | null) => {
    if (!sessionId) throw new Error('No session ID');
    try {
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
    } catch (err) {
      console.warn('HRV submission failed (non-blocking):', err);
    }
  };

  const completeSession = async (): Promise<{ predictions_triggered: boolean }> => {
    if (!sessionId) throw new Error('No session ID');
    const result = await checkinService.submitSession(sessionId);
    return { predictions_triggered: result.data.predictions_triggered ?? false };
  };

  const autosave = async (payload: Record<string, unknown>) => {
    if (!sessionId) return;
    try {
      await checkinService.autosave(sessionId, payload);
    } catch {
      // Silently fail autosave
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
    autosave,
  };
}
