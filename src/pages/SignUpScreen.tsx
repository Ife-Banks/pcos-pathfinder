import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import { authAPI } from "@/services/authService";

const SignUpScreen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FIXED: Uses form state, React Router navigate, and correct API field names
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ← Prevents page reload

    if (!validateForm()) return; // ← Run client-side validation first

    try {
      setIsLoading(true);
      setErrors({}); // Clear previous errors

      const result = await authAPI.register({
        full_name: form.name,          // field is full_name not name
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,   // field is confirm_password
        role: 'patient',
      });

      console.log("✅ Registration success:", result);

      // Navigate to verify email page
      navigate("/verify-email", { state: { email: form.email } });

    } catch (err: any) {
      console.error("❌ Registration error:", err);

      // Map backend field errors to form error state
      const backendErrors: Record<string, string> = {};

      if (err?.errors?.full_name) {
        backendErrors.name = Array.isArray(err.errors.full_name)
          ? err.errors.full_name[0]
          : err.errors.full_name;
      }

      if (err?.errors?.email) {
        backendErrors.email = Array.isArray(err.errors.email)
          ? err.errors.email[0]
          : err.errors.email;
      }

      if (err?.errors?.password) {
        backendErrors.password = Array.isArray(err.errors.password)
          ? err.errors.password[0]
          : err.errors.password;
      }

      if (err?.errors?.confirm_password) {
        backendErrors.confirmPassword = Array.isArray(err.errors.confirm_password)
          ? err.errors.confirm_password[0]
          : err.errors.confirm_password;
      }

      // If no specific field errors, show a general message
      if (Object.keys(backendErrors).length === 0) {
        backendErrors.general =
          err?.message || "Registration failed. Please try again.";
      }

      setErrors(backendErrors);
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
          <h1 className="text-2xl font-bold font-display text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-1">
            Start your personalized health journey
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4 flex-1"
        >
          {/* General error banner */}
          {errors.general && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={form.termsAccepted}
                onChange={(e) =>
                  setForm({ ...form, termsAccepted: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            {errors.terms && (
              <p className="text-sm text-destructive">{errors.terms}</p>
            )}
          </div>

          <div className="pt-4">
            <Button
              variant="clinical"
              size="xl"
              className="w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpScreen;