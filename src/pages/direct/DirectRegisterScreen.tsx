import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/authService';

const DirectRegisterScreen = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user && accessToken) {
      const dashboardRoute = '/dashboard';
      navigate(dashboardRoute);
    }
  }, [user, accessToken, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (/^\d+$/.test(form.password)) {
      newErrors.password = 'Password cannot be entirely numbers';
    }

    if (form.password !== form.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});

      console.log('📤 Attempting direct register with:', {
        full_name: form.full_name,
        email: form.email,
        role: 'direct_patient',
      });

      const result = await authAPI.directRegister({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: 'direct_patient',
      });

      console.log('✅ Direct register success:', result);

      // Navigate to verify email page or dashboard
      navigate('/verify-email', { state: { email: form.email } });

    } catch (err: any) {
      console.error('❌ Direct register error:', err);

      const errorData = err?.response?.data;
      const backendErrors: Record<string, string> = {};

      if (errorData?.errors) {
        const errors = errorData.errors;
        if (errors.full_name) backendErrors.full_name = Array.isArray(errors.full_name) ? errors.full_name[0] : errors.full_name;
        if (errors.email) backendErrors.email = Array.isArray(errors.email) ? errors.email[0] : errors.email;
        if (errors.password) backendErrors.password = Array.isArray(errors.password) ? errors.password[0] : errors.password;
        if (errors.confirm_password) backendErrors.confirm_password = Array.isArray(errors.confirm_password) ? errors.confirm_password[0] : errors.confirm_password;
      } else if (errorData?.message) {
        backendErrors.general = errorData.message;
      } else if (typeof errorData === 'string') {
        backendErrors.general = errorData;
      }

      if (Object.keys(backendErrors).length === 0) {
        backendErrors.general = 'Direct registration failed. Please check your details and try again.';
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
          onClick={() => navigate('/welcome')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            Direct Register
          </h1>
          <p className="text-muted-foreground mt-1">
            Quick registration to start your health journey
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
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="Your full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
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
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm({ ...form, confirm_password: e.target.value })
              }
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">
                {errors.confirm_password}
              </p>
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

export default DirectRegisterScreen;