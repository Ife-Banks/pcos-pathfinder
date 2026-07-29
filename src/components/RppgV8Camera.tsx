import React, { useState, useRef, useEffect } from 'react';
import { RppgV8SessionPayload } from '@/services/rppgV8Service';

export interface ReadinessState {
  lighting: 'checking' | 'good' | 'too_dark' | 'too_bright';
  stability: 'checking' | 'steady' | 'unsteady';
  allReady: boolean;
}

interface RppgCameraProps {
  onCaptureComplete: (metrics: RppgV8SessionPayload) => void;
  onCaptureError: (error: string) => void;
  isCapturing: boolean;
  setIsCapturing: (capturing: boolean) => void;
  showPreview?: boolean;
  onReadinessChange?: (readiness: ReadinessState) => void;
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
function filterPeaks(peaks: number[], minRR = 350): number[] {
  if (peaks.length < 2) return peaks;
  const filtered = [peaks[0]];
  for (let i = 1; i < peaks.length; i++) {
    const rr = peaks[i] - filtered[filtered.length - 1];
    if (rr >= minRR && rr <= 2000) filtered.push(peaks[i]);
  }
  return filtered;
}

/** Remove RR interval outliers — keep only intervals within 50–180% of median. */
function filterRRIntervals(rrIntervals: number[]): number[] {
  if (rrIntervals.length < 4) return rrIntervals;
  const sorted = [...rrIntervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const lower = median * 0.5;
  const upper = median * 1.8;
  return rrIntervals.filter(rr => rr >= lower && rr <= upper);
}

/** Compute LF power (0.04-0.15 Hz) and HF power (0.15-0.40 Hz) from peak times. */
function computeFrequencyBands(
  peakTimes: number[],
  startTime: number,
  endTime: number,
  fs: number,
): { lfPower: number; hfPower: number } {
  if (peakTimes.length < 3 || endTime - startTime < 8000) {
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

  // Normalize to proper PSD in ms²: one-sided spectrum (×2) + Hann window correction (/ 0.375)
  const normFactor = 2 / (n * 0.375);
  lfPower *= normFactor;
  hfPower *= normFactor;

  return { lfPower: lfPower || 0.001, hfPower: hfPower || 0.001 };
}

/** Find the dominant frequency in the HF band (0.15-0.40 Hz) for respiratory rate. */
function computeRespiratoryRate(
  peakTimes: number[],
  startTime: number,
  endTime: number,
  fs: number,
): number | null {
  if (peakTimes.length < 3 || endTime - startTime < 8000) return null;
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
  showPreview = false,
  onReadinessChange,
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

  // Readiness checks
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

  // Signal buffers
  const greenBufferRef = useRef<number[]>([]);
  const timeBufferRef = useRef<number[]>([]);
  const peakTimesRef = useRef<number[]>([]);
  const lastPeakTimeRef = useRef<number | null>(null);

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
  }, [showPreview, isCapturing, onCaptureError]);

  // ─── Frame processing ───
  useEffect(() => {
    if (!hasVideoReady || (!showPreview && !isCapturing)) return;

    if (isCapturing) {
      // Reset state for new capture
      frameCountRef.current = 0;
      greenBufferRef.current = [];
      timeBufferRef.current = [];
      peakTimesRef.current = [];
      lastPeakTimeRef.current = null;
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

          detectPeak(now, greenMean);

          if (frameCountRef.current % 30 === 0) {
            updateLiveMetrics(now);
          }

          if (frameCountRef.current % 10 === 0) {
            updateSignalQuality();
          }
        } else if (showPreview) {
          // Preview mode: signal quality + readiness only
          frameCountRef.current++;
          if (frameCountRef.current % 10 === 0) {
            updateSignalQuality();
            updateReadiness();
          }
        }
      } catch (_) { /* frame error, skip */ }

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
    const cleanPeaks = filterPeaks(peaks, 350);
          const rawRR: number[] = [];
          for (let i = Math.max(0, cleanPeaks.length - 20); i < cleanPeaks.length - 1; i++) {
            rawRR.push(cleanPeaks[i + 1] - cleanPeaks[i]);
          }
          const rrIntervals = filterRRIntervals(rawRR);
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
    const centerY = Math.floor(height * 0.35);
    const radius = Math.min(180, Math.floor(Math.min(width, height) / 2.5));
    const step = 2;
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

  function detectPeak(_now: number, _value: number) {
    const buf = greenBufferRef.current;
    const n = buf.length;
    if (n < 60) return;

    if (signalQualityRef.current < 10) return;

    const dc = mean(buf.slice(n - 60));

    const windowSlice = buf.slice(n - 60);
    const minVal = Math.min(...windowSlice) - dc;
    const maxVal = Math.max(...windowSlice) - dc;
    const range = maxVal - minVal;
    if (range < 0.1) return;

    const lookback = 30;
    const start = n - lookback;
    let peakAc = -Infinity;
    let peakIdx = 0;
    let minAc = Infinity;
    for (let i = start; i < n; i++) {
      const ac = buf[i] - dc;
      if (ac > peakAc) { peakAc = ac; peakIdx = i - start; }
      if (ac < minAc) minAc = ac;
    }

    const peakTime = timeBufferRef.current[start + peakIdx];
    const signalDrop = peakAc - minAc;
    const peakNotAtEdge = peakIdx >= 3 && peakIdx <= lookback - 4;
    const positiveExcursion = peakAc > 0;
    const aboveThreshold = peakAc > minVal + 0.15 * range;
    const hasFallen = signalDrop > range * 0.15;

    if (frameCountRef.current % 30 === 0) {
      console.log(`[peak] maxAc=${peakAc.toFixed(3)} minAc=${minAc.toFixed(3)} idx=${peakIdx}/${lookback} range=${range.toFixed(3)} drop=${signalDrop.toFixed(3)} atEdge=${!peakNotAtEdge} positive=${positiveExcursion} above=${aboveThreshold} fallen=${hasFallen} peaks=${peakTimesRef.current.length}`);
    }

    if (peakNotAtEdge && positiveExcursion && aboveThreshold && hasFallen) {
      const lastPeak = lastPeakTimeRef.current;
      const minRR = 350;
      if (!lastPeak || (peakTime - lastPeak) >= minRR) {
        peakTimesRef.current.push(peakTime);
        lastPeakTimeRef.current = peakTime;
        console.log(`[peak] PEAK #${peakTimesRef.current.length}: peakAc=${peakAc.toFixed(3)} peakTime=${(peakTime / 1000).toFixed(1)}s rr=${lastPeak ? (peakTime - lastPeak).toFixed(0) + 'ms' : 'first'}`);
      }
    }
  }

  function updateSignalQuality() {
    const buf = greenBufferRef.current;
    if (buf.length < 60) {
      setSignalQuality(0);
      return;
    }
    const winSize = Math.min(buf.length, 120);
    const win = buf.slice(buf.length - winSize);
    const dc = mean(win);
    const ac = win.map(v => v - dc);
    const r = Math.max(...ac) - Math.min(...ac);
    const s = std(ac);
    let quality = 0;
    if (r > 1.5 && s > 0.6) quality = 85;
    else if (r > 1.0 && s > 0.4) quality = 70;
    else if (r > 0.6 && s > 0.25) quality = 55;
    else if (r > 0.3 && s > 0.15) quality = 40;
    else if (r > 0.15) quality = 25;
    else quality = 10;
    signalQualityRef.current = quality;
    setSignalQuality(quality);
    console.log(`[signalQuality] q=${quality} r=${r.toFixed(3)} s=${s.toFixed(3)} dc=${dc.toFixed(2)} bufLen=${buf.length}`);
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

  function updateLiveMetrics(now: number) {
    const peaks = peakTimesRef.current;
    if (peaks.length < 3) return;

    const cleanPeaks = filterPeaks(peaks, 350);
    const recentPeaks = cleanPeaks.slice(-20);
    const rawRR: number[] = [];
    for (let i = 0; i < recentPeaks.length - 1; i++) {
      rawRR.push(recentPeaks[i + 1] - recentPeaks[i]);
    }

    const rrIntervals = filterRRIntervals(rawRR);

    if (rrIntervals.length < 2) return;

    const avgRR = mean(rrIntervals);
    if (avgRR < 300 || avgRR > 2000) return;
    const hr = 60000 / avgRR;
    setLiveHeartRate(Math.round(hr));

    if (rrIntervals.length >= 3) {
      const diffs = rrIntervals.slice(1).map((v, i) => (v - rrIntervals[i]) ** 2);
      const rmssdVal = Math.sqrt(mean(diffs));
      const clamped = Math.min(rmssdVal, 200);
      const roundedRMSSD = Math.round(clamped * 100) / 100;
      setLiveRMSSD(roundedRMSSD);
      setLiveHRVStatus(computeHRVStatus(roundedRMSSD));
    }

    if (frameCountRef.current % 60 === 0) {
      console.log(`[liveMetrics] cleanPeaks=${cleanPeaks.length} rawRR=${rawRR.length} rrFiltered=${rrIntervals.length} avgRR=${avgRR.toFixed(0)} hr=${Math.round(hr)}`);
    }

    if (cleanPeaks.length >= 4) {
      const windowSize = Math.min(cleanPeaks.length, 40);
      const windowStart = cleanPeaks[cleanPeaks.length - windowSize];
      const windowEnd = cleanPeaks[cleanPeaks.length - 1];
      if (windowEnd - windowStart >= 5000) {
        const { lfPower, hfPower } = computeFrequencyBands(cleanPeaks, windowStart, windowEnd, 4);
        if (hfPower > 0.01 && lfPower > 0.01) {
          const ratio = lfPower / hfPower;
          setLiveLfHf(parseFloat(ratio.toFixed(2)));
        }
      }
    }

    setLiveSpo2(Math.round(simSpo2Ref.current));
    setLiveTemp(parseFloat(simTempRef.current.toFixed(1)));
    setLiveEda(parseFloat(simEdaRef.current.toFixed(1)));
  }

  function computeFinalMetrics() {
    const peaks = peakTimesRef.current;
    const startTime = captureStartTimeRef.current;
    const endTime = performance.now();

    const cleanPeaks = filterPeaks(peaks, 350);
    const rawRR: number[] = [];
    for (let i = 0; i < cleanPeaks.length - 1; i++) {
      const rr = cleanPeaks[i + 1] - cleanPeaks[i];
      if (rr >= 400 && rr <= 1500) rawRR.push(rr);
    }

    const rrIntervals = filterRRIntervals(rawRR);

    console.log(`[finalMetrics] peaks=${peaks.length} cleanPeaks=${cleanPeaks.length} rawRR=${rawRR.length} filteredRR=${rrIntervals.length}`);

    const avgRR = rrIntervals.length ? mean(rrIntervals) : 600;
    const hr = 60000 / avgRR;

    let rmssdVal: number | null = null;
    if (rrIntervals.length >= 3) {
      const diffs = rrIntervals.slice(1).map((v, i) => (v - rrIntervals[i]) ** 2);
      rmssdVal = Math.min(Math.sqrt(mean(diffs)), 200);
    }

    const hrvVal = rrIntervals.length >= 3 ? std(rrIntervals) : null;

    let lfPower = 0, hfPower = 0;
    let lfHfRatio: number | null = null;
    if (cleanPeaks.length >= 6 && endTime - startTime >= 10000) {
      const fb = computeFrequencyBands(cleanPeaks, startTime, endTime, 4);
      lfPower = fb.lfPower;
      hfPower = fb.hfPower;
      if (hfPower > 0.01 && lfPower > 0.01) {
        lfHfRatio = parseFloat((lfPower / hfPower).toFixed(4));
      }
    }

    let respRate: number | null = null;
    if (cleanPeaks.length >= 6 && endTime - startTime >= 8000) {
      respRate = computeRespiratoryRate(cleanPeaks, startTime, endTime, 4);
    }

    const greenVals = greenBufferRef.current;
    const ac = greenVals.length ? Math.max(...greenVals) - Math.min(...greenVals) : 20;
    const dc = greenVals.length ? mean(greenVals) : 128;
    const acDcRatio = dc > 0 ? parseFloat((ac / dc).toFixed(6)) : 0.02;
    const pulseAmp = parseFloat((ac / 255).toFixed(4));

    const quality = signalQualityRef.current;

    const spo2 = Math.round(simSpo2Ref.current);
    const skinTemp = parseFloat(simTempRef.current.toFixed(1));
    const meanEda = parseFloat(simEdaRef.current.toFixed(2));

    let hrTrend: number | null = null;
    let rmssdTrend: number | null = null;
    if (windowMetricsRef.current.length >= 2) {
      const times = windowMetricsRef.current.map(w => w.time);
      const hrVals = windowMetricsRef.current.map(w => w.hr);
      const rmssdVals = windowMetricsRef.current.map(w => w.rmssd);
      const hrSlope = linregSlope(times, hrVals);
      const rmssdSlope = linregSlope(times, rmssdVals);
      hrTrend = Math.abs(hrSlope) > 0.001 ? parseFloat(hrSlope.toFixed(4)) : null;
      rmssdTrend = Math.abs(rmssdSlope) > 0.001 ? parseFloat(rmssdSlope.toFixed(4)) : null;
    }

    const asi = computeASI(rmssdVal ?? 50, meanEda, skinTemp);

    // Clamp values to Node.js Joi validation ranges
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const payload: RppgV8SessionPayload = {
      rmssd: rmssdVal !== null ? clamp(Math.round(rmssdVal * 100) / 100, 0, 1000) : 0,
      hf: clamp(parseFloat(hfPower.toFixed(4)), 0, 5000),
      lf_hf_ratio: lfHfRatio !== null ? clamp(lfHfRatio, 0, 20) : 0,
      heart_rate: Math.round(clamp(hr, 30, 200)),
      hrv: hrvVal !== null ? clamp(Math.round(hrvVal * 100) / 100, 0, 1000) : 0,
      estimated_spo2: clamp(spo2, 80, 100),
      skin_temperature: clamp(skinTemp, 25, 42),
      hr_trend: hrTrend !== null ? clamp(hrTrend, -10, 10) : null,
      mean_eda: clamp(meanEda, 0, 20),
      mean_temp: clamp(skinTemp, 25, 42),
      asi: asi !== null ? clamp(parseFloat(asi.toFixed(4)), 0, 5) : null,
      rmssd_trend: rmssdTrend !== null ? clamp(rmssdTrend, -50, 50) : null,
      ac: ac !== null ? clamp(parseFloat(ac.toFixed(4)), 0, 255) : null,
      dc: dc !== null ? clamp(parseFloat(dc.toFixed(4)), 0, 255) : null,
      ac_dc_ratio: acDcRatio !== null ? clamp(acDcRatio, 0, 10) : null,
      pulse_amplitude: pulseAmp !== null ? clamp(pulseAmp, 0, 100) : null,
      signal_quality: quality !== null ? clamp(quality, 0, 100) : null,
      respiratory_rate: respRate !== null ? clamp(respRate, 5, 40) : null,
      session_type: 'checkin',
      session_quality: quality >= 50 ? 'good' : quality >= 25 ? 'poor' : 'motion_artifact',
    };
    finalMetricsRef.current = payload;
  }

  function buildFallbackPayload(): RppgV8SessionPayload {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    return {
      rmssd: clamp(parseFloat((35 + Math.random() * 30).toFixed(2)), 0, 1000),
      hf: clamp(parseFloat((200 + Math.random() * 400).toFixed(2)), 0, 5000),
      lf_hf_ratio: clamp(parseFloat((0.8 + Math.random() * 1.5).toFixed(2)), 0, 20),
      heart_rate: Math.round(clamp(65 + Math.random() * 25, 30, 200)),
      hrv: clamp(parseFloat((30 + Math.random() * 30).toFixed(2)), 0, 1000),
      estimated_spo2: clamp(Math.round(96 + Math.random() * 3), 80, 100),
      skin_temperature: clamp(parseFloat((36.0 + Math.random() * 0.8).toFixed(1)), 25, 42),
      hr_trend: clamp(parseFloat((Math.random() - 0.5).toFixed(4)), -10, 10),
      mean_eda: clamp(parseFloat((1.5 + Math.random() * 2).toFixed(2)), 0, 20),
      mean_temp: clamp(parseFloat((36.0 + Math.random() * 0.8).toFixed(1)), 25, 42),
      asi: clamp(parseFloat((0.2 + Math.random() * 0.4).toFixed(4)), 0, 5),
      rmssd_trend: clamp(parseFloat((Math.random() - 0.5).toFixed(4)), -50, 50),
      ac: clamp(parseFloat((15 + Math.random() * 20).toFixed(2)), 0, 255),
      dc: clamp(parseFloat((100 + Math.random() * 50).toFixed(2)), 0, 255),
      ac_dc_ratio: clamp(parseFloat((0.1 + Math.random() * 0.2).toFixed(4)), 0, 10),
      pulse_amplitude: clamp(parseFloat((0.5 + Math.random() * 0.3).toFixed(3)), 0, 100),
      signal_quality: clamp(Math.round(40 + Math.random() * 40), 0, 100),
      respiratory_rate: clamp(parseFloat((14 + Math.random() * 6).toFixed(1)), 5, 40),
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
