import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import { authAPI } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    }
    
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
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
      const result = await login({ email: form.email, password: form.password });

      // Check if password change is required
      if (result.data.user.must_change_password) {
        navigate('/change-password');
        return;
      }

      // Route based on user profile:
      if (!result.data.user.onboarding_completed) {
        // Route to NEXT incomplete step
        // onboarding_step = furthest step COMPLETED
        // So step 0 means nothing done → go to step 1
        // Step 1 done → go to step 2, etc.
        const nextStep = Math.min((result.data.user.onboarding_step || 0) + 1, 6);
        navigate(`/onboarding/step/${nextStep}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Axios error structure: err.response.data contains the API response body
      const errorData = err?.response?.data;
      const statusCode = err?.response?.status;
      
      const newErrors: Record<string, string> = {};
      
      // Check for email_not_verified code in errors object
      if (errorData?.errors?.code === 'email_not_verified') {
        newErrors.general = 'Please verify your email first.';
      } else if (errorData?.errors?.email) {
        newErrors.email = Array.isArray(errorData.errors.email) 
          ? errorData.errors.email[0] 
          : errorData.errors.email;
      } else if (errorData?.errors?.password) {
        newErrors.password = Array.isArray(errorData.errors.password)
          ? errorData.errors.password[0]
          : errorData.errors.password;
      } else if (errorData?.message) {
        if (statusCode === 401 || errorData?.message?.toLowerCase().includes("credentials")) {
          newErrors.general = "Incorrect email or password";
        } else if (statusCode === 429 || errorData?.message?.toLowerCase().includes("throttled")) {
          newErrors.general = "Too many attempts. Try again later";
        } else {
          newErrors.general = errorData.message;
        }
      } else if (errorData?.detail) {
        if (errorData.detail.includes("401") || errorData.detail.includes("credentials")) {
          newErrors.general = "Incorrect email or password";
        } else {
          newErrors.general = errorData.detail;
        }
      } else {
        newErrors.general = "Login failed. Please try again.";
      }
      
      setErrors(newErrors);
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
          onClick={() => navigate("/welcome")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <img src={logo} alt="AI-MSHM" className="h-10 w-10 mb-4" />
          <h1 className="text-2xl font-bold font-display text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to continue monitoring your health</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4 flex-1"
        >
          {errors.general && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button 
                type="button" 
                onClick={() => navigate("/forgot-password")} 
                className="text-xs text-primary font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="pt-4">
            <Button 
              variant="clinical" 
              size="xl" 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="text-primary font-semibold hover:underline">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
