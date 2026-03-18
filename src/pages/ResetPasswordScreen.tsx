import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "@/services/authService";

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      navigate("/forgot-password");
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirm_password = "Passwords do not match";
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
      const data = await authAPI.resetPassword({ 
        token, 
        password, 
        confirm_password: confirmPassword 
      });
      
      console.log('✅ Password reset successful:', data);
      setSuccess(true);
      
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      console.log('❌ Error details:', { 
        status: error?.status, 
        message: error?.message, 
        errors: error?.errors 
      });
      
      if (error?.status === 400) {
        if (error?.errors?.token) {
          setErrors({ general: 'This reset link is invalid or has expired. Please request a new one.' });
        } else if (error?.errors?.password) {
          setErrors({ password: error.errors.password[0] });
        } else if (error?.errors?.confirm_password) {
          setErrors({ confirm_password: error.errors.confirm_password[0] });
        } else {
          setErrors({ general: 'Invalid request. Please try again.' });
        }
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col gradient-surface">
        <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 rounded-2xl bg-card border border-border"
          >
            <div className="h-16 w-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="font-display font-semibold text-foreground mb-2">Password Reset Successful!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button variant="clinical" onClick={() => navigate("/login")} className="w-full">
              Back to Sign In
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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
            Enter your new password below.
          </p>

          {errors.general && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input 
                id="confirm_password" 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
              {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password}</p>}
            </div>

            <Button 
              variant="clinical" 
              size="xl" 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          {errors.general?.includes('expired') && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Need a new reset link?{' '}
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-primary hover:underline font-medium"
                >
                  Request a new one
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
