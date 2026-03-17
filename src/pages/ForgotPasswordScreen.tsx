import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "@/services/authService";

const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (error: any) {
      // For security, show success message even if email doesn't exist
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-2">Reset password</h1>
          <p className="text-muted-foreground mb-8">
            {sent ? "If this email is registered, a reset link has been sent." : "Enter your email and we'll send you a reset link."}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <Button 
                variant="clinical" 
                size="xl" 
                className="w-full" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 rounded-2xl bg-card border border-border"
            >
              <div className="h-16 w-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✉️</span>
              </div>
              <p className="font-display font-semibold text-foreground mb-2">Email sent!</p>
              <p className="text-sm text-muted-foreground mb-6">
                If this email is registered, a reset link has been sent to <strong>{email}</strong>
              </p>
              <Button variant="outline-clinical" onClick={() => navigate("/login")} className="w-full">
                Back to Sign In
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
