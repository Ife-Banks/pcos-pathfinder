import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Brain } from "lucide-react";
import heroImage from "@/assets/hero-health.png";

const features = [
  { icon: Activity, title: "Smart Monitoring", desc: "Daily health tracking with AI insights" },
  { icon: Brain, title: "AI Risk Analysis", desc: "Personalized PCOS risk assessment" },
  { icon: Shield, title: "Clinically Validated", desc: "Evidence-based screening tools" },
];

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.img
            src={heroImage}
            alt="Health monitoring visualization"
            className="w-56 h-56 mx-auto mb-6 object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <h1 className="text-3xl font-bold font-display text-foreground mb-3">
            Take Control of Your{" "}
            <span className="text-gradient-primary">Metabolic Health</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            AI-powered PCOS screening that combines your daily symptoms, biometrics,
            and clinical data into a personalized risk assessment.
          </p>
        </motion.div>

        <motion.div
          className="w-full space-y-3 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border"
            >
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold font-display text-sm text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button variant="clinical" size="xl" className="w-full" onClick={() => navigate("/signup")}>
            Get Started
          </Button>
          <Button variant="outline-clinical" size="lg" className="w-full" onClick={() => navigate("/login")}>
            I already have an account
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
