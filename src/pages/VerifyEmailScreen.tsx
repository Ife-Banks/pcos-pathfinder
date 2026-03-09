import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const VerifyEmailScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-surface px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="h-20 w-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-lg"
        >
          <Mail className="h-10 w-10 text-primary-foreground" />
        </motion.div>

        <h1 className="text-2xl font-bold font-display text-foreground mb-3">
          Verify your email
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          We've sent a verification link to your email address. Please check your inbox and click the link to continue.
        </p>

        <div className="space-y-3">
          <Button variant="clinical" size="xl" className="w-full" onClick={() => navigate("/onboarding")}>
            I've Verified My Email
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground">
            Resend verification email
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailScreen;
