import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import logo from "@/assets/logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [activeTagline, setActiveTagline] = useState(0);
  const [progress, setProgress] = useState(0);

  const taglines = useMemo(
    () => [
      "Clinical-grade PCOS detection with explainable AI",
      "Personalized metabolic insights for every cycle",
      "Secure, scalable care pathways for patients and clinicians",
    ],
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => navigate("/welcome"), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveTagline((prev) => (prev + 1) % taglines.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, taglines.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + 20, 100);
      });
    }, 350);
    return () => clearInterval(interval);
  }, []);

  const animationProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center text-foreground gradient-surface sm:px-6">
      <motion.div
        className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-surface/80 px-6 py-10 shadow-xl shadow-purple-950/40 backdrop-blur"
        transition={{ duration: 0.8, ease: "easeOut" }}
        {...animationProps}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full gradient-primary opacity-30 blur-[40px]" />
          <motion.img
            src={logo}
            alt="AI-MSHM logo"
            className="h-24 w-24 rounded-2xl border border-white/30 bg-white/10 p-2 shadow-xl shadow-indigo-900/30"
            animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
            transition={
              prefersReducedMotion
                ? {}
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold font-display">AI-MSHM</h1>
          <p className="text-sm text-muted-foreground">
            Metabolic &amp; Syndromic Health Monitor
          </p>
        </div>

        <p className="max-w-sm text-base text-foreground/80" aria-live="polite">
          {taglines[activeTagline]}
        </p>

        <div className="w-full">
          <div
            role="status"
            aria-label="Loading AIMHER Health"
            className="mb-2 text-xs uppercase tracking-[0.3em] text-foreground/60"
          >
            Preparing your experience
          </div>
          <div className="h-2 w-full rounded-full bg-muted-foreground/30">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-400 via-indigo-500 to-rose-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
