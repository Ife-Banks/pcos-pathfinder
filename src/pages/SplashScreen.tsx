import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import logo from "@/assets/logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/welcome"), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full gradient-primary opacity-20 blur-2xl animate-pulse-ring" />
          <motion.img
            src={logo}
            alt="AI-MSHM Logo"
            className="h-24 w-24 relative z-10"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold font-display text-foreground">
            AI-MSHM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Metabolic & Syndromic Health Monitor
          </p>
        </div>
        <motion.div
          className="h-1 w-16 rounded-full gradient-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
