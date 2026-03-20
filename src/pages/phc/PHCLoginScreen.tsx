import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import apiClient from "@/services/apiClient";

const PHCLoginScreen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    facilityName: "",
    staffId: "",
    email: "",
    password: "",
    twoFactorCode: "",
  });

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.facilityName.trim()) {
      newErrors.facilityName = "Facility ID or Name is required";
    }
    
    if (!form.staffId.trim()) {
      newErrors.staffId = "Staff ID is required";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!form.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.twoFactorCode.trim()) {
      newErrors.twoFactorCode = "2FA code is required";
    } else if (form.twoFactorCode.length !== 6 || !/^\d+$/.test(form.twoFactorCode)) {
      newErrors.twoFactorCode = "Please enter a valid 6-digit code";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const res = await apiClient.post('/auth/token/', {
        facility_name: form.facilityName,
        staff_id: form.staffId,
        email: form.email,
        password: form.password,
        role: "phc_staff"
      });
      const body = res.data;
      if (body.status && body.status !== 'success') {
        throw body;
      }
      setShow2FA(true);
    } catch (error: any) {
      setErrors({ general: error?.message || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const res = await apiClient.post('/auth/2fa/verify/', {
        email: form.email,
        two_factor_code: form.twoFactorCode,
      });
      const body = res.data;
      if (body.status && body.status !== 'success') {
        throw body;
      }
      const payload = body.data ?? body;
      const token = payload?.access_token || payload?.data?.access_token;
      if (token) {
        localStorage.setItem('phc_token', token);
      }
      navigate('/phc/dashboard');
    } catch (error: any) {
      setErrors({ twoFactorCode: error?.message || "Verification failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          {/* Green accent border at top */}
          <div className="h-1 bg-[#2E8B57] rounded-t-2xl -mx-8 -mt-8 mb-6"></div>
          
          {/* Logo and role badge */}
          <div className="text-center mb-8">
            <motion.img
              src={logo}
              alt="AI-MSHM"
              className="w-12 h-12 mx-auto mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              Primary Health Centre
            </div>
            <h1 className="text-2xl font-bold text-[#1E1E2E] mb-2">
              Staff Portal Access
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to access the PHC patient management system
            </p>
          </div>

          {/* Step 1: Credentials */}
          {!show2FA ? (
            <motion.form
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              onSubmit={handleStep1Submit}
              className="space-y-4"
            >
              {errors.general && (
                <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="facilityName" className="text-sm font-medium text-[#1E1E2E]">
                  Facility ID or Name
                </Label>
                <Input 
                  id="facilityName"
                  type="text" 
                  placeholder="Enter your facility ID or name"
                  value={form.facilityName}
                  onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                  required
                />
                {errors.facilityName && <p className="text-sm text-red-600">{errors.facilityName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staffId" className="text-sm font-medium text-[#1E1E2E]">
                  Staff ID / Employee Number
                </Label>
                <Input 
                  id="staffId"
                  type="text" 
                  placeholder="Enter your staff ID"
                  value={form.staffId}
                  onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                  required
                />
                {errors.staffId && <p className="text-sm text-red-600">{errors.staffId}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#1E1E2E]">
                  Email Address
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your.email@facility.gov"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                  required
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#1E1E2E]">
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-[#2E8B57]"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <Button 
                type="submit"
                className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Access PHC Portal"}
              </Button>
            </motion.form>
          ) : (
            /* Step 2: 2FA Verification */
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleStep2Submit}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-800">🔐</span>
                </div>
                <h2 className="text-lg font-semibold text-[#1E1E2E] mb-2">
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {errors.twoFactorCode && (
                <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                  {errors.twoFactorCode}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode" className="text-sm font-medium text-[#1E1E2E]">
                  Authentication Code
                </Label>
                <Input 
                  id="twoFactorCode"
                  type="text" 
                  placeholder="000000"
                  value={form.twoFactorCode}
                  onChange={(e) => setForm({ ...form, twoFactorCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-[#2E8B57]"
                  maxLength={6}
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
              
              <button
                type="button"
                onClick={() => setShow2FA(false)}
                className="w-full text-sm text-gray-600 hover:text-[#2E8B57] transition-colors"
              >
                ← Back to login
              </button>
            </motion.form>
          )}

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              onClick={() => navigate("/welcome")}
              className="text-sm text-gray-600 hover:text-[#2E8B57] transition-colors"
            >
              Wrong portal? Switch role
            </button>
            <p className="text-xs text-gray-500 mt-4">
              AI-MSHM v2.0 — Confidential Staff Access
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PHCLoginScreen;
