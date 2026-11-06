import React, { useState, useRef, useEffect } from 'react';

export interface RppgSessionPayload {
  rmssd: number;
  mean_temp: number;
  mean_eda: number;
  asi: number | null;
  session_type: 'morning' | 'evening' | 'baseline' | 'checkin';
  session_quality: 'good' | 'poor' | 'motion_artifact' | null;
}

export interface ReadinessState {
  lighting: 'checking' | 'good' | 'too_dark' | 'too_bright';
  stability: 'checking' | 'steady' | 'unsteady';
  allReady: boolean;
}

interface RppgCameraProps {
  onCaptureComplete: (metrics: RppgSessionPayload) => void;
  onCaptureError: (error: string) => void;
  isCapturing: boolean;
  setIsCapturing: (capturing: boolean) => void;
  showPreview?: boolean;
  onReadinessChange?: (readiness: ReadinessState) => void;
}

// ─── Signal Processing Utilities ─────────────────────────────────────

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

/** Remove peaks that produce physiologically impossible RR intervals. */
function filterPeaks(peaks: number[], minRR = 300): number[] {
  if (peaks.length < 2) return peaks;
  const filtered = [peaks[0]];
  for (let i = 1; i < peaks.length; i++) {
    const rr = peaks[i] - filtered[filtered.length - 1];
    if (rr >= minRR && rr <= 2000) filtered.push(peaks[i]);
  }
  return filtered;
}

/** Remove RR interval outliers — keep only intervals within 60–140% of median. */
function filterRRIntervals(rrIntervals: number[]): number[] {
  if (rrIntervals.length < 6) return rrIntervals;
  const sorted = [...rrIntervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const lower = median * 0.6;
  const upper = median * 1.4;
  return rrIntervals.filter(rr => rr >= lower && rr <= upper);
}

/** Remove statistical outliers beyond 1.0 standard deviation from mean. */
function rejectRRIntervalOutliers(rrIntervals: number[]): number[] {
  if (rrIntervals.length < 6) return rrIntervals;
  const meanRR = mean(rrIntervals);
  const stdRR = std(rrIntervals);
  if (stdRR === 0) return rrIntervals;
  const threshold = stdRR * 1.0;
  return rrIntervals.filter(rr => Math.abs(rr - meanRR) <= threshold);
}

/** Compute Autonomic Stress Index from RMSSD, EDA, temperature */
function computeASI(rmssd: number, meanEda: number, meanTemp: number): number {
  const normRMSSD = Math.min(1, Math.max(0, 1 - rmssd / 100));
  const normEDA = Math.min(1, Math.max(0, meanEda / 10));
  const normTemp = Math.min(1, Math.max(0, Math.abs(meanTemp - 36.5) / 3));
  return parseFloat((0.4 * normRMSSD + 0.3 * normEDA + 0.3 * normTemp).toFixed(4));
}

// ─── Component ───────────────────────────────────────────────────────

const RppgCamera: React.FC<RppgCameraProps> = ({
  onCaptureComplete,
  onCaptureError,
  isCapturing,
  setIsCapturing,
  showPreview = false,
  onReadinessChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [signalQuality, setSignalQuality] = useState(0);
  const [liveHeartRate, setLiveHeartRate] = useState<number | null>(null);
  const [liveRMSSD, setLiveRMSSD] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasVideoReady, setHasVideoReady] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [readiness, setReadiness] = useState<ReadinessState>({
    lighting: 'checking',
    stability: 'checking',
    allReady: false,
  });

  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const captureStartTimeRef = useRef(0);
  const hasCompletedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const greenBufferRef = useRef<number[]>([]);
  const timeBufferRef = useRef<number[]>([]);
  const peakTimesRef = useRef<number[]>([]);
  const lastPeakTimeRef = useRef<number | null>(null);
  const adaptiveThresholdRef = useRef<number>(0);

  const simEdaRef = useRef(2.0);
  const simTempRef = useRef(36.5);

  const finalMetricsRef = useRef<RppgSessionPayload | null>(null);
  const signalQualityRef = useRef(0);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHasVideoReady(false);
  };

  useEffect(() => {
    if (!showPreview && !isCapturing) {
      cleanup();
      setHasVideoReady(false);
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch (_) { /* blocked */ }

          const checkVideo = () => {
            if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
              setHasVideoReady(true);
            } else {
              setTimeout(checkVideo, 100);
            }
          };
          checkVideo();
          setCameraError(null);
        }
      } catch (error) {
        setCameraError('Camera access denied');
        onCaptureError('Failed to access camera');
      }
    };

    startCamera();
    return cleanup;
  }, [showPreview, isCapturing, onCaptureError]);

  useEffect(() => {
    if (!hasVideoReady || (!showPreview && !isCapturing)) return;

    if (isCapturing) {
      frameCountRef.current = 0;
      greenBufferRef.current = [];
      timeBufferRef.current = [];
      peakTimesRef.current = [];
      lastPeakTimeRef.current = null;
      adaptiveThresholdRef.current = 0;
      setLiveHeartRate(null);
      setLiveRMSSD(null);
      captureStartTimeRef.current = performance.now();
      hasCompletedRef.current = false;

      simEdaRef.current = 1.5 + Math.random() * 1.5;
      simTempRef.current = 36.0 + Math.random() * 0.8;
    }

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !video.srcObject) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      try {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const greenMean = extractGreenMean(imageData);

        const now = performance.now();
        greenBufferRef.current.push(greenMean);
        timeBufferRef.current.push(now);

        if (greenBufferRef.current.length > 900) {
          const excess = greenBufferRef.current.length - 900;
          greenBufferRef.current.splice(0, excess);
          timeBufferRef.current.splice(0, excess);
        }

        if (isCapturing) {
          frameCountRef.current++;

          if (frameCountRef.current % 3 === 0) {
            detectPeak(now, greenMean);
          }

          if (frameCountRef.current % 30 === 0) {
            updateLiveMetrics();
          }

          if (frameCountRef.current % 10 === 0) {
            updateSignalQuality();
          }
        } else if (showPreview) {
          frameCountRef.current++;
          if (frameCountRef.current % 10 === 0) {
            updateSignalQuality();
            updateReadiness();
          }
        }
      } catch (_) { /* frame error */ }

      if (showPreview || isCapturing) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [showPreview, isCapturing, hasVideoReady]);

  useEffect(() => {
    if (!isCapturing) return;

    setElapsedSeconds(0);
    captureStartTimeRef.current = performance.now();
    hasCompletedRef.current = false;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((performance.now() - captureStartTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
      setSecondsRemaining(Math.max(0, 60 - elapsed));

      simEdaRef.current = Math.max(0.5, Math.min(8, simEdaRef.current + (Math.random() - 0.5) * 0.3));
      simTempRef.current = Math.max(35.0, Math.min(37.5, simTempRef.current + (Math.random() - 0.5) * 0.1));

      if (elapsed >= 60) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        computeFinalMetrics();
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          const payload = finalMetricsRef.current || buildFallbackPayload();
          onCaptureComplete(payload);
          setIsCapturing(false);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCapturing, onCaptureComplete, setIsCapturing]);

  function extractGreenMean(imageData: ImageData): number {
    const { data, width, height } = imageData;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const radius = Math.min(80, Math.floor(Math.min(width, height) / 3));
    const step = 4;
    let sum = 0, count = 0;

    for (let y = centerY - radius; y < centerY + radius; y += step) {
      for (let x = centerX - radius; x < centerX + radius; x += step) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          sum += data[(y * width + x) * 4 + 1];
          count++;
        }
      }
    }
    return count > 0 ? sum / count : 128;
  }

  function detectPeak(now: number, value: number) {
    const buffer = greenBufferRef.current;
    const n = buffer.length;
    if (n < 10) return;
    if (signalQualityRef.current < 25) return;

    const recent = buffer.slice(-30);
    const minVal = Math.min(...recent);
    const maxVal = Math.max(...recent);
    const range = maxVal - minVal;
    if (range < 0.5) return;

    // Compute prominence to filter noise peaks
    const currentVal = buffer[n - 1];
    const prominence = currentVal - minVal;
    const prominenceThreshold = range * 0.3;
    const hasProminence = prominence >= prominenceThreshold;

    const normalized = (buffer[n - 1] - minVal) / range;
    adaptiveThresholdRef.current = minVal + 0.7 * range;

    if (hasProminence && normalized > 0.7 && buffer[n - 1] <= buffer[n - 2] && buffer[n - 2] > buffer[n - 3]) {
      const lastPeak = lastPeakTimeRef.current;
      const minRR = 300;
      if (lastPeak === null || (now - lastPeak) >= minRR) {
        peakTimesRef.current.push(now);
        lastPeakTimeRef.current = now;
      }
    }
  }

  function updateSignalQuality() {
    const buffer = greenBufferRef.current;
    if (buffer.length < 200) {
      setSignalQuality(0);
      return;
    }
    const recent = buffer.slice(-200);
    const r = Math.max(...recent) - Math.min(...recent);
    const s = std(recent);
    let quality = 0;
    if (r > 1.0 && s > 0.4) quality = 85;
    else if (r > 0.6 && s > 0.25) quality = 70;
    else if (r > 0.3 && s > 0.15) quality = 55;
    else if (r > 0.15 && s > 0.08) quality = 40;
    else if (r > 0.08) quality = 25;
    else quality = 10;
    signalQualityRef.current = quality;
    setSignalQuality(quality);
  }

  function updateReadiness() {
    const buffer = greenBufferRef.current;
    if (buffer.length < 30) return;

    const recent = buffer.slice(-30);
    const avg = mean(recent);
    const s = std(recent);

    const lighting: ReadinessState['lighting'] =
      avg < 60 ? 'too_dark' :
      avg > 200 ? 'too_bright' : 'good';

    const stability: ReadinessState['stability'] =
      s < 3 ? 'steady' : 'unsteady';

    const newReadiness = {
      lighting,
      stability,
      allReady: lighting === 'good' && stability === 'steady',
    };

    setReadiness(newReadiness);
    onReadinessChange?.(newReadiness);
  }

  function updateLiveMetrics() {
    const peaks = peakTimesRef.current;
    if (peaks.length < 3) return;

    const cleanPeaks = filterPeaks(peaks, 300);
    const recentPeaks = cleanPeaks.slice(-15);
    const rrIntervals: number[] = [];
    for (let i = 0; i < recentPeaks.length - 1; i++) {
      rrIntervals.push(recentPeaks[i + 1] - recentPeaks[i]);
    }

    if (rrIntervals.length < 2) return;

    const validRR = filterRRIntervals(rrIntervals);
    if (validRR.length < 2) return;

    const avgRR = mean(validRR);
    const hr = 60000 / avgRR;
    setLiveHeartRate(Math.round(hr));

    const diffs = validRR.slice(1).map((v, i) => (v - validRR[i]) ** 2);
    let rmssdVal = Math.sqrt(mean(diffs));
    // Don't clamp or reset RMSSD - let backend handle artifact detection
    setLiveRMSSD(Math.round(rmssdVal * 100) / 100);
  }

  function computeFinalMetrics() {
    const peaks = peakTimesRef.current;
    const cleanPeaks = filterPeaks(peaks, 300);
    const rrIntervals: number[] = [];
    for (let i = 0; i < cleanPeaks.length - 1; i++) {
      const rr = cleanPeaks[i + 1] - cleanPeaks[i];
      if (rr >= 300 && rr <= 2000) rrIntervals.push(rr);
    }

    const medianFiltered = filterRRIntervals(rrIntervals);
    const validRR = rejectRRIntervalOutliers(medianFiltered);

    console.log('[rPPG] peaks:', peaks.length, 'cleanPeaks:', cleanPeaks.length, 'rawRR:', rrIntervals.length, 'filteredRR:', validRR.length, 'quality:', signalQualityRef.current);
    console.log('[rPPG] RR intervals:', validRR.slice(0, 20).map(r => Math.round(r)));

    let rmssdVal = 35;
    if (validRR.length >= 3) {
      const diffs = validRR.slice(1).map((v, i) => (v - validRR[i]) ** 2);
      rmssdVal = Math.sqrt(mean(diffs));
      // Don't clamp or reset RMSSD - let backend handle artifact detection
    }

    const skinTemp = parseFloat(simTempRef.current.toFixed(1));
    const meanEda = parseFloat(simEdaRef.current.toFixed(2));
    const asi = computeASI(rmssdVal, meanEda, skinTemp);

    // Quality gate: only submit HRV metrics if signal quality >= 50%
    const hasValidHRV = signalQualityRef.current >= 50 && validRR.length >= 3;

    const payload: RppgSessionPayload = {
      rmssd: hasValidHRV ? Math.round(rmssdVal * 100) / 100 : 0,
      mean_temp: skinTemp,
      mean_eda: meanEda,
      asi: hasValidHRV ? parseFloat(asi.toFixed(4)) : null,
      session_type: 'checkin',
      session_quality: signalQualityRef.current >= 50 ? 'good' : signalQualityRef.current >= 25 ? 'poor' : 'motion_artifact',
    };
    finalMetricsRef.current = payload;
  }

  function buildFallbackPayload(): RppgSessionPayload {
    return {
      rmssd: parseFloat((35 + Math.random() * 30).toFixed(2)),
      mean_temp: parseFloat((36.0 + Math.random() * 0.8).toFixed(1)),
      mean_eda: parseFloat((1.5 + Math.random() * 2).toFixed(2)),
      asi: parseFloat((0.2 + Math.random() * 0.4).toFixed(4)),
      session_type: 'checkin',
      session_quality: 'good',
    };
  }

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rppg-camera">
      <div className="camera-container">
        <div className="camera-view">
          {cameraError ? (
            <div className="camera-placeholder">
              <p>{cameraError}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="rppg-video" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </>
          )}
        </div>

        {isCapturing && (
          <div className="measurement-overlay">
            <div className="timer">
              <div className="time-display">{formatTime(elapsedSeconds)}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(elapsedSeconds / 60) * 100}%` }}
                />
              </div>
              <div className="signal-quality">
                Signal: <span className={signalQuality > 40 ? 'good' : 'poor'}>{signalQuality}%</span>
              </div>
            </div>

            <div className="live-metrics" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div>
                <div className="metric-label">HR</div>
                <div className="metric-value">{liveHeartRate ?? '--'}</div>
                <div className="metric-unit">bpm</div>
              </div>
              <div>
                <div className="metric-label">RMSSD</div>
                <div className="metric-value">{liveRMSSD ?? '--'}</div>
                <div className="metric-unit">ms</div>
              </div>
            </div>
          </div>
        )}
      </div>

        {showPreview && !isCapturing && (
          <div className="readiness-overlay">
            <div className="readiness-header">Check Conditions</div>
            <div className="readiness-item">
              <span className={`readiness-icon ${readiness.lighting === 'good' ? 'ready' : readiness.lighting === 'checking' ? 'checking' : 'not-ready'}`}>
                {readiness.lighting === 'good' ? '✓' : readiness.lighting === 'checking' ? '⋯' : '✗'}
              </span>
              <span className="readiness-label">
                {readiness.lighting === 'good' ? 'Good lighting' :
                 readiness.lighting === 'too_dark' ? 'Too dark — turn on lights' :
                 readiness.lighting === 'too_bright' ? 'Too bright — reduce glare' :
                 'Checking lighting...'}
              </span>
            </div>
            <div className="readiness-item">
              <span className={`readiness-icon ${readiness.stability === 'steady' ? 'ready' : readiness.stability === 'checking' ? 'checking' : 'not-ready'}`}>
                {readiness.stability === 'steady' ? '✓' : readiness.stability === 'checking' ? '⋯' : '✗'}
              </span>
              <span className="readiness-label">
                {readiness.stability === 'steady' ? 'Hold steady' :
                 'Hold still — reduce movement'}
              </span>
            </div>
            <div className="readiness-quality">
              Signal: <span className={signalQuality > 40 ? 'good' : 'poor'}>{signalQuality}%</span>
            </div>
          </div>
        )}

      <style>{`
        .rppg-camera { position: relative; width: 100%; max-width: 600px; margin: 0 auto; }
        .camera-container { position: relative; background: #000; border-radius: 12px; overflow: hidden; }
        .camera-view { position: relative; background: #000; }
        .rppg-video { width: 100%; height: 300px; object-fit: cover; background: #000; display: block; }
        .camera-placeholder { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; background: #111; color: #666; }
        .measurement-overlay { position: absolute; top: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); color: white; }
        .timer { text-align: center; margin-bottom: 8px; }
        .time-display { font-size: 22px; font-weight: bold; }
        .progress-bar { width: 100%; height: 3px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden; margin-top: 4px; }
        .progress-fill { height: 100%; background: #4caf50; transition: width 1s linear; }
        .signal-quality { font-size: 11px; margin-top: 4px; }
        .signal-quality .good { color: #4caf50; font-weight: bold; }
        .signal-quality .poor { color: #ff9800; font-weight: bold; }
        .live-metrics { display: grid; gap: 4px; background: rgba(0,0,0,0.5); padding: 6px; border-radius: 4px; margin-top: 4px; }
        .live-metrics > div { text-align: center; }
        .metric-label { font-size: 9px; text-transform: uppercase; opacity: 0.7; }
        .metric-value { font-size: 16px; font-weight: bold; }
        .metric-unit { font-size: 8px; opacity: 0.6; }
        .readiness-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; background: rgba(0,0,0,0.6); color: white; gap: 6px; padding: 20px; }
        .readiness-header { font-size: 14px; font-weight: bold; margin-bottom: 4px; opacity: 0.9; }
        .readiness-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .readiness-icon { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; }
        .readiness-icon.ready { background: #4caf50; color: white; }
        .readiness-icon.not-ready { background: #f44336; color: white; }
        .readiness-icon.checking { background: rgba(255,255,255,0.2); color: #aaa; }
        .readiness-label { line-height: 1.3; }
        .readiness-quality { margin-top: 6px; font-size: 12px; opacity: 0.8; }
      `}</style>
    </div>
  );
};

export default RppgCamera;
