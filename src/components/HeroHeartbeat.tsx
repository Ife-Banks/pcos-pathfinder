import { useEffect, useRef, useState } from "react";

const FS = 250;
const SPEED_PPS = 120;
const ERASE_W = 18;

function makeBeat(fs: number): Float32Array {
  const dur = 60 / 72;
  const n = Math.round(dur * fs);
  const y = new Float32Array(n);
  const t = (i: number) => i / fs;
  const gauss = (i: number, center: number, sigma: number, amp: number) =>
    amp * Math.exp(-0.5 * Math.pow((t(i) - center) / sigma, 2));
  for (let i = 0; i < n; i++) {
    y[i] += gauss(i, 0.10, 0.025, 0.15);
    y[i] += gauss(i, 0.22, 0.010, -0.08);
    y[i] += gauss(i, 0.24, 0.013, 1.6);
    y[i] += gauss(i, 0.265, 0.013, -0.25);
    y[i] += gauss(i, 0.38, 0.045, 0.28);
    y[i] += gauss(i, 0.50, 0.022, 0.04);
  }
  return y;
}

const beat = makeBeat(FS);
const REPEATS = 14;
const signal = new Float32Array(beat.length * REPEATS);
for (let r = 0; r < REPEATS; r++) {
  for (let i = 0; i < beat.length; i++) {
    signal[r * beat.length + i] = beat[i] + (Math.random() - 0.5) * 0.012;
  }
}

interface HeroHeartbeatProps {
  compact?: boolean;
}

export default function HeroHeartbeat({ compact = false }: HeroHeartbeatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ drawX: 0, sigHead: 0, pixBuf: null as Float32Array | null, lastTs: null as number | null });
  const [hr, setHr] = useState(72);
  const [rmssd, setRmssd] = useState("38.2");

  useEffect(() => {
    const iv = setInterval(() => {
      setHr(70 + Math.floor(Math.random() * 5));
      setRmssd((35 + Math.random() * 8).toFixed(1));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const DPR = window.devicePixelRatio || 1;
    let raf: number;
    const s = stateRef.current;

    function resize() {
      canvas.width = canvas.offsetWidth * DPR;
      canvas.height = (compact ? 120 : 200) * DPR;
      s.pixBuf = new Float32Array(Math.ceil(canvas.offsetWidth)).fill(NaN);
    }
    resize();

    const mvToY = (mv: number) => {
      const MID = canvas.height * 0.55;
      const SCALE = canvas.height * 0.22;
      return MID - mv * SCALE;
    };

    function drawGrid(ctx: CanvasRenderingContext2D) {
      const { width: W, height: H } = canvas;
      const minor = 20 * DPR, major = 100 * DPR;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += minor) {
        ctx.strokeStyle = Math.abs(x % major) < 1 ? "rgba(0,180,80,0.13)" : "rgba(0,180,80,0.06)";
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += minor) {
        ctx.strokeStyle = Math.abs(y % major) < 1 ? "rgba(0,180,80,0.13)" : "rgba(0,180,80,0.06)";
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    function drawTrace(ctx: CanvasRenderingContext2D) {
      if (!s.pixBuf) return;
      const n = s.pixBuf.length;
      const startCol = Math.ceil(s.drawX + ERASE_W) % n;
      ctx.beginPath();
      let inLine = false;
      for (let i = 0; i < n; i++) {
        const col = (startCol + i) % n;
        const yCSS = s.pixBuf[col];
        if (isNaN(yCSS)) { inLine = false; continue; }
        const x = col * DPR, y = yCSS * DPR;
        if (!inLine) { ctx.moveTo(x, y); inLine = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function frame(ts: number) {
      if (!s.lastTs) s.lastTs = ts;
      const dt = Math.min((ts - s.lastTs) / 1000, 0.05);
      s.lastTs = ts;

      const W_css = canvas.offsetWidth;
      const advance = SPEED_PPS * dt;
      const spp = FS / SPEED_PPS;
      const newSamples = Math.round(advance * spp);

      if (s.pixBuf && s.pixBuf.length !== Math.ceil(W_css)) {
        s.pixBuf = new Float32Array(Math.ceil(W_css)).fill(NaN);
      }

      if (s.pixBuf) {
        for (let col = Math.floor(s.drawX); col <= Math.ceil(s.drawX + ERASE_W); col++) {
          s.pixBuf[((col % s.pixBuf.length) + s.pixBuf.length) % s.pixBuf.length] = NaN;
        }
      }

      for (let i = 0; i < newSamples; i++) {
        const mv = signal[s.sigHead % signal.length];
        const col = Math.floor(s.drawX) % (s.pixBuf?.length || 1);
        if (s.pixBuf) {
          s.pixBuf[col] = mvToY(mv) / DPR;
          s.drawX = (s.drawX + 1 / spp);
          if (s.drawX >= W_css) s.drawX -= W_css;
          s.sigHead++;
        }
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { width: W, height: H } = canvas;

      ctx.fillStyle = "#060d09";
      ctx.fillRect(0, 0, W, H);
      drawGrid(ctx);
      ctx.fillStyle = "#060d09";
      ctx.fillRect(Math.floor(s.drawX) * DPR, 0, ERASE_W * DPR, H);

      ctx.save();
      ctx.strokeStyle = "rgba(0,232,122,0.18)";
      ctx.lineWidth = 7 * DPR;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      drawTrace(ctx);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "#00e87a";
      ctx.lineWidth = 1.5 * DPR;
      ctx.shadowBlur = 4 * DPR;
      ctx.shadowColor = "#00e87a";
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      drawTrace(ctx);
      ctx.restore();

      const lastMv = signal[(s.sigHead - 1 + signal.length) % signal.length];
      ctx.beginPath();
      ctx.arc(s.drawX * DPR, mvToY(lastMv), 3 * DPR, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 8 * DPR; ctx.shadowColor = "#00e87a";
      ctx.fill(); ctx.shadowBlur = 0;

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    const onResize = () => { resize(); s.drawX = 0; s.sigHead = 0; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [compact]);

  const metrics = [
    { label: "Heart Rate", val: hr, unit: "bpm", sub: "Normal sinus" },
    { label: "RMSSD", val: rmssd, unit: "ms", sub: "HRV index" },
    { label: "SpO₂", val: 98, unit: "%", sub: "rPPG derived" },
    { label: "QRS", val: 94, unit: "ms", sub: "Within limits" },
  ];

  if (compact) {
    return (
      <div className="w-full" style={{ background: "#0a0f0d", borderRadius: 14, overflow: "hidden", border: "1px solid #1a2e22", fontFamily: "'Courier New', monospace" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: compact ? 120 : 200, background: "#060d09" }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", background: "#0a0f0d", borderRadius: 14, overflow: "hidden", border: "1px solid #1a2e22", fontFamily: "'Courier New', monospace" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 8px", borderBottom: "1px solid #0f1f17" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {["AI-MSHM", "Lead II", "25mm/s", "10mm/mV"].map((label, i) => (
            <span key={label} style={{ fontSize: i === 0 ? 11 : 10, color: i === 0 ? "#2a6644" : "#7dffb8", background: "#051a0f", border: "1px solid #0d3320", borderRadius: 4, padding: "2px 7px", letterSpacing: "0.08em", fontWeight: i === 0 ? 700 : 400 }}>{label}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1aff8c", boxShadow: "0 0 6px #1aff8c" }} />
          <span style={{ fontSize: 10, color: "#1aff8c", letterSpacing: "0.1em" }}>RECORDING</span>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: 200, background: "#060d09" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid #0f1f17" }}>
        {metrics.map(({ label, val, unit, sub }, i) => (
          <div key={label} style={{ padding: "10px 14px", borderRight: i < 3 ? "1px solid #0f1f17" : "none" }}>
            <div style={{ fontSize: 9, color: "#2a6644", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 20, color: "#1aff8c", fontWeight: 700 }}>{val}</span>
              <span style={{ fontSize: 10, color: "#2a6644" }}>{unit}</span>
            </div>
            <div style={{ fontSize: 9, color: "#1a5433", marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}