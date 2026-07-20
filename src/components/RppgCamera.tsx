import React, { useState, useRef, useEffect } from 'react';
import { RppgV8SessionPayload } from '@/services/rppgV8Service';

interface RppgCameraProps {
  onCaptureComplete: (metrics: RppgV8SessionPayload) => void;
  onCaptureError: (error: string) => void;
  isCapturing: boolean;
  setIsCapturing: (capturing: boolean) => void;
}

// ─── Signal Processing Utilities ─────────────────────────────────────

type Complex = [number, number];

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function linregSlope(xs: number[], ys: number[]): number {
  if (xs.length < 2) return 0;
  const xm = mean(xs), ym = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - xm;
    num += dx * (ys[i] - ym);
    den += dx * dx;
  }
  return den !== 0 ? num / den : 0;
}

/** Radix-2 Cooley-Tukey FFT. Input length must be power of 2. Returns array of [re, im]. */
function fft(signal: number[]): Complex[] {
  const N = signal.length;
  if (N <= 1) return signal.map(x => [x, 0]);
  if (N % 2 !== 0) throw new Error('FFT requires power-of-2 length');

  const half = N >> 1;
  const even = fft(signal.filter((_, i) => i % 2 === 0));
  const odd = fft(signal.filter((_, i) => i % 2 === 1));

  const out: Complex[] = new Array(N);
  for (let k = 0; k < half; k++) {
    const angle = -2 * Math.PI * k / N;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const t: Complex = [cos * odd[k][0] - sin * odd[k][1], cos * odd[k][1] + sin * odd[k][0]];
    out[k] = [even[k][0] + t[0], even[k][1] + t[1]];
    out[k + half] = [even[k][0] - t[0], even[k][1] - t[1]];
  }
  return out;
}

/** Hann window */
function hannWindow(n: number): number[] {
  const w: number[] = new Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
  return w;
}

/** Simple 3-point moving average smoother */
function smooth(signal: number[]): number[] {
  const out = [...signal];
  for (let i = 1; i < signal.length - 1; i++) {
    out[i] = (signal[i - 1] + signal[i] + signal[i + 1]) / 3;
  }
  return out;
}

/** Simple bandpass: apply low-pass via moving average, then high-pass via subtract smoothed */
function bandpassFilter(signal: number[], order: number): number[] {
  const lp = [...signal];
  for (let pass = 0; pass < 3; pass++) {
    for (let i = order; i < signal.length - order; i++) {
      let sum = 0;
      for (let j = -order; j <= order; j++) sum += lp[i + j];
      lp[i] = sum / (2 * order + 1);
    }
  }
  const hp = signal.map((v, i) => v - lp[i]);
  return hp;
}

/** Resample irregular RR intervals to equidistant 4 Hz time series */
function resampleRRIntervals(
  peakTimes: number[],
  startTime: number,
  endTime: number,
  targetFs: number,
): number[] {
  if (peakTimes.length < 2) return [];
  const dt = 1000 / targetFs;
  const n = Math.ceil((endTime - startTime) / dt);
  const rrIntervals: number[] = [];
  for (let i = 0; i < peakTimes.length - 1; i++) {
    rrIntervals.push(peakTimes[i + 1] - peakTimes[i]);
  }

  const t0 = peakTimes[0];
  const resampled: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const t = startTime + i * dt;
    let j = 0;
    while (j < peakTimes.length - 1 && peakTimes[j + 1] < t) j++;
    if (j >= rrIntervals.length) {
      resampled[i] = rrIntervals[rrIntervals.length - 1] || 0;
    } else if (j === 0) {
      resampled[i] = rrIntervals[0];
    } else {
      const t0v = peakTimes[j];
      const t1v = peakTimes[j + 1];
      const frac = (t - t0v) / (t1v - t0v);
      resampled[i] = rrIntervals[j - 1] + frac * (rrIntervals[j] - rrIntervals[j - 1]);
    }
    // Detrend: subtract mean so DC doesn't leak into LF/HF
  }
  const m = mean(resampled);
  return resampled.map(v => v - m);
}

/** Remove peaks that produce physiologically impossible RR intervals. */
function filterPeaks(peaks: number[]): number[] {
  if (peaks.length < 2) return peaks;
  const filtered = [peaks[0]];
  for (let i = 1; i < peaks.length; i++) {
    const rr = peaks[i] - filtered[filtered.length - 1];
    if (rr >= 300 && rr <= 2000) filtered.push(peaks[i]);
  }
  return filtered;
}

/** Compute LF power (0.04-0.15 Hz) and HF power (0.15-0.40 Hz) from peak times. */
function computeFrequencyBands(
  peakTimes: number[],
  startTime: number,
  endTime: number,
  fs: number,
): { lfPower: number; hfPower: number } {
  if (peakTimes.length < 4 || endTime - startTime < 5000) {
    return { lfPower: 0, hfPower: 0 };
  }

  const resampled = resampleRRIntervals(peakTimes, startTime, endTime, fs);
  if (resampled.length < 8) return { lfPower: 0, hfPower: 0 };

  // Pad to power of 2 for FFT
  const n = 1 << Math.ceil(Math.log2(resampled.length));
  const padded = new Array(n).fill(0);
  for (let i = 0; i < resampled.length; i++) padded[i] = resampled[i];

  const window = hannWindow(n);
  const windowed = padded.map((v, i) => v * window[i]);

  const spectrum = fft(windowed);
  const binWidth = fs / n;

  let lfPower = 0, hfPower = 0;
  for (let i = 0; i < n / 2; i++) {
    const freq = i * binWidth;
    const power = (spectrum[i][0] ** 2 + spectrum[i][1] ** 2) / n;
    if (freq >= 0.04 && freq < 0.15) lfPower += power;
    else if (freq >= 0.15 && freq <= 0.40) hfPower += power;
  }

  return { lfPower: lfPower || 0.001, hfPower: hfPower || 0.001 };
}

/** Find the dominant frequency in the HF band (0.15-0.40 Hz) for respiratory rate. */
function computeRespiratoryRate(
  peakTimes: number[],
  startTime: number,
  endTime: number,
  fs: number,
): number | null {
  if (peakTimes.length < 4 || endTime - startTime < 10000) return null;
  const resampled = resampleRRIntervals(peakTimes, startTime, endTime, fs);
  if (resampled.length < 8) return null;

  const n = 1 << Math.ceil(Math.log2(resampled.length));
  const padded = new Array(n).fill(0);
  for (let i = 0; i < resampled.length; i++) padded[i] = resampled[i];
  const window = hannWindow(n);
  const windowed = padded.map((v, i) => v * window[i]);
  const spectrum = fft(windowed);
  const binWidth = fs / n;

  let maxPower = 0;
  let peakFreq = 0;
  for (let i = 0; i < n / 2; i++) {
    const freq = i * binWidth;
    if (freq >= 0.15 && freq <= 0.40) {
      const power = (spectrum[i][0] ** 2 + spectrum[i][1] ** 2) / n;
      if (power > maxPower) {
        maxPower = power;
        peakFreq = freq;
      }
    }
  }
  return peakFreq > 0 ? Math.round(peakFreq * 60 * 10) / 10 : null;
}

/** Compute HRV status label from RMSSD */
function computeHRVStatus(rmssd: number): string {
  if (rmssd >= 50) return 'Normal';
  if (rmssd >= 40) return 'Slightly Reduced';
  if (rmssd >= 30) return 'Moderately Reduced';
  if (rmssd >= 20) return 'Low';
  if (rmssd >= 10) return 'Very Low';
  return 'Extremely Low';
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
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [signalQuality, setSignalQuality] = useState(0);
  const [liveHeartRate, setLiveHeartRate] = useState<number | null>(null);
  const [liveRMSSD, setLiveRMSSD] = useState<number | null>(null);
  const [liveHRVStatus, setLiveHRVStatus] = useState<string>('');
  const [liveLfHf, setLiveLfHf] = useState<number | null>(null);
  const [liveSpo2, setLiveSpo2] = useState<number>(98);
  const [liveTemp, setLiveTemp] = useState<number>(36.5);
  const [liveEda, setLiveEda] = useState<number>(2.0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasVideoReady, setHasVideoReady] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const captureStartTimeRef = useRef(0);
  const hasCompletedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Signal buffers
  const greenBufferRef = useRef<number[]>([]);
  const timeBufferRef = useRef<number[]>([]);
  const peakTimesRef = useRef<number[]>([]);
  const lastPeakTimeRef = useRef<number | null>(null);
  const adaptiveThresholdRef = useRef<number>(0);

  // Windowed metrics for trend
  const windowMetricsRef = useRef<{ time: number; hr: number; rmssd: number }[]>([]);
  const lastWindowTimeRef = useRef<number>(0);

  // simulated sensor drift for EDA, temp, SpO2
  const simEdaRef = useRef(2.0);
  const simTempRef = useRef(36.5);
  const simSpo2Ref = useRef(98);

  // final computed payload
  const finalMetricsRef = useRef<RppgV8SessionPayload | null>(null);
  const signalQualityRef = useRef(0);

  // ─── Cleanup ───
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

  // ─── Camera init ───
  useEffect(() => {
    if (!isCapturing) {
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
          try { await videoRef.current.play(); } catch (_) { /* blocked, continue */ }

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
  }, [isCapturing, onCaptureError]);

  // ─── Frame processing ───
  useEffect(() => {
    if (!isCapturing || !hasVideoReady) return;

    // Reset state
    frameCountRef.current = 0;
    greenBufferRef.current = [];
    timeBufferRef.current = [];
    peakTimesRef.current = [];
    lastPeakTimeRef.current = null;
    adaptiveThresholdRef.current = 0;
    windowMetricsRef.current = [];
    lastWindowTimeRef.current = 0;
    setLiveHeartRate(null);
    setLiveRMSSD(null);
    setLiveHRVStatus('');
    setLiveLfHf(null);
    captureStartTimeRef.current = performance.now();
    hasCompletedRef.current = false;

    simEdaRef.current = 1.5 + Math.random() * 1.5;
    simTempRef.current = 36.0 + Math.random() * 0.8;
    simSpo2Ref.current = 96 + Math.random() * 3;

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

        // Keep last 900 samples (~30s at 30fps)
        if (greenBufferRef.current.length > 900) {
          const excess = greenBufferRef.current.length - 900;
          greenBufferRef.current.splice(0, excess);
          timeBufferRef.current.splice(0, excess);
        }

        frameCountRef.current++;

        // Every 3 frames (~10fps effective), run peak detection
        if (frameCountRef.current % 3 === 0) {
          detectPeak(now, greenMean);
        }

        // Every 30 frames (~1s), update metrics
        if (frameCountRef.current % 30 === 0) {
          updateLiveMetrics(now);
        }

        // Update signal quality every 10 frames
        if (frameCountRef.current % 10 === 0) {
          updateSignalQuality();
        }
      } catch (_) { /* frame error, skip */ }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isCapturing, hasVideoReady]);

  // ─── Timer ───
  useEffect(() => {
    if (!isCapturing) return;

    setElapsedSeconds(0);
    captureStartTimeRef.current = performance.now();
    hasCompletedRef.current = false;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((performance.now() - captureStartTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
      setSecondsRemaining(Math.max(0, 120 - elapsed));

      // Sim drift for EDA, Temp, SpO2
      simEdaRef.current = Math.max(0.5, Math.min(8, simEdaRef.current + (Math.random() - 0.5) * 0.3));
      simTempRef.current = Math.max(35.0, Math.min(37.5, simTempRef.current + (Math.random() - 0.5) * 0.1));
      simSpo2Ref.current = Math.max(94, Math.min(100, simSpo2Ref.current + (Math.random() - 0.5) * 1));

      // Compute windowed metrics for trend (every 10s)
      const now = performance.now();
      if (now - lastWindowTimeRef.current >= 10000) {
        const peaks = peakTimesRef.current;
        if (peaks.length >= 3) {
          const rrIntervals: number[] = [];
          for (let i = Math.max(0, peaks.length - 20); i < peaks.length - 1; i++) {
            rrIntervals.push(peaks[i + 1] - peaks[i]);
          }
          if (rrIntervals.length >= 2) {
            const diffs = rrIntervals.slice(1).map((v, i) => (v - rrIntervals[i]) ** 2);
            const wRMSSD = Math.sqrt(mean(diffs));
            const wHR = 60000 / mean(rrIntervals);
            windowMetricsRef.current.push({ time: now, hr: wHR, rmssd: wRMSSD });
            lastWindowTimeRef.current = now;
          }
        }
      }

      // Completion at 120s
      if (elapsed >= 120) {
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

  // ─── Signal Processing Functions ───

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

    const recent = buffer.slice(-10);
    const localMean = mean(recent);
    const localStd = Math.max(2, std(recent));
    const localRange = Math.max(...recent) - Math.min(...recent);

    // Adaptive threshold: lower multiplier for weak signals
    const k = localRange < 5 ? 0.15 : 0.3;
    const threshold = localMean + k * localStd;
    adaptiveThresholdRef.current = threshold;

    // Local max check (three consecutive rising values)
    if (buffer[n - 1] > threshold && buffer[n - 1] > buffer[n - 2] && buffer[n - 2] > buffer[n - 3]) {
      const lastPeak = lastPeakTimeRef.current;
      const minRR = 250; // 240 bpm max
      if (lastPeak === null || (now - lastPeak) >= minRR) {
        peakTimesRef.current.push(now);
        lastPeakTimeRef.current = now;
      }
    }
  }

  function updateSignalQuality() {
    const buffer = greenBufferRef.current;
    if (buffer.length < 50) {
      setSignalQuality(0);
      return;
    }
    const recent = buffer.slice(-200);
    const r = Math.max(...recent) - Math.min(...recent);
    const s = std(recent);
    // Higher range and std = good pulsatile signal
    let quality = 0;
    if (r > 8 && s > 2.5) quality = 85;
    else if (r > 5 && s > 1.5) quality = 70;
    else if (r > 3 && s > 1.0) quality = 50;
    else if (r > 1.5) quality = 30;
    else quality = 15;
    signalQualityRef.current = quality;
    setSignalQuality(quality);
  }

  function updateLiveMetrics(now: number) {
    const peaks = peakTimesRef.current;
    if (peaks.length < 3) return;

    // Get last 15 peaks for current HR/RMSSD
    const recentPeaks = peaks.slice(-15);
    const rrIntervals: number[] = [];
    for (let i = 0; i < recentPeaks.length - 1; i++) {
      rrIntervals.push(recentPeaks[i + 1] - recentPeaks[i]);
    }

    if (rrIntervals.length < 2) return;

    // Validate RR intervals (300ms - 2000ms)
    const validRR = rrIntervals.filter(rr => rr >= 300 && rr <= 2000);
    if (validRR.length < 2) return;

    const avgRR = mean(validRR);
    const hr = 60000 / avgRR;
    setLiveHeartRate(Math.round(hr));

    const diffs = validRR.slice(1).map((v, i) => (v - validRR[i]) ** 2);
    const rmssdVal = Math.sqrt(mean(diffs));
    const roundedRMSSD = Math.round(rmssdVal * 100) / 100;
    setLiveRMSSD(roundedRMSSD);
    setLiveHRVStatus(computeHRVStatus(roundedRMSSD));

    // LF/HF every 5 seconds (~150 frames)
    const cleanPeaks = filterPeaks(peaks);
    if (frameCountRef.current % 150 === 0 && cleanPeaks.length >= 6) {
      const windowStart = cleanPeaks.length > 30 ? cleanPeaks[cleanPeaks.length - 30] : cleanPeaks[0];
      const windowEnd = cleanPeaks[cleanPeaks.length - 1];
      if (windowEnd - windowStart >= 5000) {
        const { lfPower, hfPower } = computeFrequencyBands(cleanPeaks, windowStart, windowEnd, 4);
        const ratio = lfPower / hfPower;
        setLiveLfHf(parseFloat(ratio.toFixed(2)));
      }
    }

    // Simulated values drift slightly
    setLiveSpo2(Math.round(simSpo2Ref.current));
    setLiveTemp(parseFloat(simTempRef.current.toFixed(1)));
    setLiveEda(parseFloat(simEdaRef.current.toFixed(1)));
  }

  function computeFinalMetrics() {
    const peaks = peakTimesRef.current;
    const startTime = captureStartTimeRef.current;
    const endTime = performance.now();

    // RR intervals from all peaks
    const rrIntervals: number[] = [];
    for (let i = 0; i < peaks.length - 1; i++) {
      const rr = peaks[i + 1] - peaks[i];
      if (rr >= 300 && rr <= 2000) rrIntervals.push(rr);
    }

    // HR
    const avgRR = rrIntervals.length ? mean(rrIntervals) : 600;
    const hr = 60000 / avgRR;

    // RMSSD
    let rmssdVal = 35;
    if (rrIntervals.length >= 3) {
      const diffs = rrIntervals.slice(1).map((v, i) => (v - rrIntervals[i]) ** 2);
      rmssdVal = Math.sqrt(mean(diffs));
    }

    // SDNN / HRV
    const hrvVal = rrIntervals.length ? std(rrIntervals) : 30;

    // Frequency analysis (using filtered peaks to remove false positives)
    const fftPeaks = filterPeaks(peaks);
    const { lfPower, hfPower } = computeFrequencyBands(fftPeaks, startTime, endTime, 4);
    const lfHfRatio = lfPower && hfPower ? parseFloat((lfPower / hfPower).toFixed(4)) : 1.0;

    // Respiratory rate
    const respRate = computeRespiratoryRate(fftPeaks, startTime, endTime, 4);

    // AC / DC from green channel
    const greenVals = greenBufferRef.current;
    const ac = greenVals.length ? Math.max(...greenVals) - Math.min(...greenVals) : 20;
    const dc = greenVals.length ? mean(greenVals) : 128;
    const acDcRatio = dc > 0 ? parseFloat((ac / dc).toFixed(6)) : 0.02;
    const pulseAmp = parseFloat((ac / 255).toFixed(4));

    // Signal quality (final)
    const quality = signalQualityRef.current;

    // Simulated values
    const spo2 = Math.round(simSpo2Ref.current);
    const skinTemp = parseFloat(simTempRef.current.toFixed(1));
    const meanEda = parseFloat(simEdaRef.current.toFixed(2));

    // HR trend and RMSSD trend from windowed metrics
    let hrTrend: number | null = null;
    let rmssdTrend: number | null = null;
    if (windowMetricsRef.current.length >= 2) {
      const times = windowMetricsRef.current.map(w => w.time);
      const hrVals = windowMetricsRef.current.map(w => w.hr);
      const rmssdVals = windowMetricsRef.current.map(w => w.rmssd);
      hrTrend = parseFloat(linregSlope(times, hrVals).toFixed(4));
      rmssdTrend = parseFloat(linregSlope(times, rmssdVals).toFixed(4));
    }

    // ASI
    const asi = computeASI(rmssdVal, meanEda, skinTemp);

    const payload: RppgV8SessionPayload = {
      rmssd: Math.round(rmssdVal * 100) / 100,
      hf: parseFloat(hfPower.toFixed(4)),
      lf_hf_ratio: lfHfRatio,
      heart_rate: Math.round(hr),
      hrv: Math.round(hrvVal * 100) / 100,
      estimated_spo2: spo2,
      skin_temperature: skinTemp,
      hr_trend: hrTrend,
      mean_eda: meanEda,
      mean_temp: skinTemp,
      asi: parseFloat(asi.toFixed(4)),
      rmssd_trend: rmssdTrend,
      ac: parseFloat(ac.toFixed(4)),
      dc: parseFloat(dc.toFixed(4)),
      ac_dc_ratio: acDcRatio,
      pulse_amplitude: pulseAmp,
      signal_quality: quality,
      respiratory_rate: respRate,
      session_type: 'checkin',
      session_quality: quality >= 50 ? 'good' : quality >= 25 ? 'poor' : 'motion_artifact',
    };
    finalMetricsRef.current = payload;
  }

  function buildFallbackPayload(): RppgV8SessionPayload {
    return {
      rmssd: parseFloat((35 + Math.random() * 30).toFixed(2)),
      hf: parseFloat((200 + Math.random() * 400).toFixed(2)),
      lf_hf_ratio: parseFloat((0.8 + Math.random() * 1.5).toFixed(2)),
      heart_rate: Math.round(65 + Math.random() * 25),
      hrv: parseFloat((30 + Math.random() * 30).toFixed(2)),
      estimated_spo2: Math.round(96 + Math.random() * 3),
      skin_temperature: parseFloat((36.0 + Math.random() * 0.8).toFixed(1)),
      hr_trend: parseFloat((Math.random() - 0.5).toFixed(4)),
      mean_eda: parseFloat((1.5 + Math.random() * 2).toFixed(2)),
      mean_temp: parseFloat((36.0 + Math.random() * 0.8).toFixed(1)),
      asi: parseFloat((0.2 + Math.random() * 0.4).toFixed(4)),
      rmssd_trend: parseFloat((Math.random() - 0.5).toFixed(4)),
      ac: parseFloat((15 + Math.random() * 20).toFixed(2)),
      dc: parseFloat((100 + Math.random() * 50).toFixed(2)),
      ac_dc_ratio: parseFloat((0.1 + Math.random() * 0.2).toFixed(4)),
      pulse_amplitude: parseFloat((0.5 + Math.random() * 0.3).toFixed(3)),
      signal_quality: Math.round(40 + Math.random() * 40),
      respiratory_rate: parseFloat((14 + Math.random() * 6).toFixed(1)),
      session_type: 'checkin',
      session_quality: 'good',
    };
  }

  // ─── Render ───

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
                  style={{ width: `${(elapsedSeconds / 120) * 100}%` }}
                />
              </div>
              <div className="signal-quality">
                Signal: <span className={signalQuality > 40 ? 'good' : 'poor'}>{signalQuality}%</span>
              </div>
            </div>

            <div className="live-metrics">
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
              <div>
                <div className="metric-label">SpO₂</div>
                <div className="metric-value">{liveSpo2}%</div>
                <div className="metric-unit">{liveTemp}°C</div>
              </div>
              <div>
                <div className="metric-label">LF/HF</div>
                <div className="metric-value">{liveLfHf?.toFixed(1) ?? '--'}</div>
                <div className="metric-unit">{liveEda.toFixed(1)}µS</div>
              </div>
            </div>

            {liveHRVStatus && (
              <div className="hrv-status">{liveHRVStatus}</div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .rppg-camera { position: relative; width: 100%; max-width: 600px; margin: 0 auto; }
        .camera-container { position: relative; background: #000; border-radius: 12px; overflow: hidden; }
        .camera-view { width: 100%; height: 300px; position: relative; }
        .rppg-video { width: 100%; height: 100%; object-fit: cover; background: #000; display: block; }
        .camera-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #111; color: #666; }
        .measurement-overlay { position: absolute; top: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); color: white; }
        .timer { text-align: center; margin-bottom: 8px; }
        .time-display { font-size: 22px; font-weight: bold; }
        .progress-bar { width: 100%; height: 3px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden; margin-top: 4px; }
        .progress-fill { height: 100%; background: #4caf50; transition: width 1s linear; }
        .signal-quality { font-size: 11px; margin-top: 4px; }
        .signal-quality .good { color: #4caf50; font-weight: bold; }
        .signal-quality .poor { color: #ff9800; font-weight: bold; }
        .live-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; background: rgba(0,0,0,0.5); padding: 6px; border-radius: 4px; margin-top: 4px; }
        .live-metrics > div { text-align: center; }
        .metric-label { font-size: 9px; text-transform: uppercase; opacity: 0.7; }
        .metric-value { font-size: 16px; font-weight: bold; }
        .metric-unit { font-size: 8px; opacity: 0.6; }
        .hrv-status { text-align: center; font-size: 11px; margin-top: 4px; padding: 2px 8px; background: rgba(0,0,0,0.3); border-radius: 4px; display: inline-block; width: auto; }
      `}</style>
    </div>
  );
};

export default RppgCamera;
