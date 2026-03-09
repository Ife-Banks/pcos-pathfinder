import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

const OnboardingComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-surface px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          className="relative mx-auto mb-8"
        >
          <div className="h-24 w-24 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-6 w-6 text-warning" />
          </motion.div>
        </motion.div>

        <h1 className="text-2xl font-bold font-display text-foreground mb-3">
          You're all set!
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Your baseline has been saved. Your AI-powered metabolic health monitoring begins now. Complete daily check-ins for the most accurate risk assessment.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Button variant="clinical" size="xl" className="w-full" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground">
            Your first morning check-in will be available tomorrow at 8 AM
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OnboardingComplete;
