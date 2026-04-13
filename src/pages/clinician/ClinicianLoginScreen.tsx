import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, User, Mail, Lock, Key } from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";
import { useAuth } from "@/context/AuthContext";
import { ClinicianLoginForm } from "@/types/clinician";

const ClinicianLoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<ClinicianLoginForm>({
    email: "",
    password: "",
    medical_license_number: "",
    two_factor_code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specialty, setSpecialty] = useState<string>("");
  const [centerInfo, setCenterInfo] = useState<any>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    
    if (!show2FA && !formData.medical_license_number.trim()) {
      newErrors.medical_license_number = "Medical License Number is required";
    }
    
    if (show2FA && !formData.two_factor_code.trim()) {
      newErrors.two_factor_code = "2FA code is required";
    } else if (show2FA && !/^\d{6}$/.test(formData.two_factor_code)) {
      newErrors.two_factor_code = "2FA code must be 6 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ClinicianLoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleLoginStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await clinicianAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      if (response.data.user.role !== 'clinician') {
        setErrors({ general: "Your account does not have clinician access. Go to patient login?" });
        return;
      }
      
      // Check if email is verified
      if (!response.data.user.is_email_verified) {
        navigate('/verify-email');
        return;
      }
      
      // Check if center is verified
      if (!response.data.user.center_info?.is_verified) {
        navigate('/clinician/pending-verification');
        return;
      }
      
      // Check if password change is required
      if (response.data.user.must_change_password) {
        await login(response.data);
        navigate('/change-password');
        return;
      }
      
      // Store tokens and user data
      await login(response.data);
      
      // Show 2FA screen
      setShow2FA(true);
      
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.message?.toLowerCase() || '';
      const responseMsg = error.response?.data?.message?.toLowerCase() || '';
      
      if (responseMsg.includes('invalid') || msg.includes('invalid') || responseMsg.includes('credentials') || msg.includes('credentials')) {
        setErrors({ general: "Incorrect email or password. Please check your credentials and try again." });
      } else if (responseMsg.includes('email not verified') || msg.includes('email not verified') || responseMsg.includes('verify') || msg.includes('verify')) {
        setErrors({ general: "Email not verified. Please check your inbox for the verification link." });
      } else if (responseMsg.includes('locked') || msg.includes('locked') || responseMsg.includes('too many')) {
        setErrors({ general: "Account locked. Please wait 15 minutes before trying again." });
      } else if (responseMsg.includes('not found') || msg.includes('not found')) {
        setErrors({ general: "Account not found. Please check if you have a clinician account." });
      } else if (error.status === 401) {
        setErrors({ general: "Login failed. Incorrect email or password." });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await clinicianAPI.verify2FA(formData.two_factor_code!, localStorage.getItem('access_token')!);
      
      // Check if user needs to change password
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.must_change_password) {
          navigate('/change-password');
          return;
        }
      }
      
      // 2FA verified, navigate to dashboard
      navigate('/clinician/dashboard');
      
    } catch (error: any) {
      console.error('2FA error:', error);
      setErrors({ two_factor_code: "Invalid 2FA code" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (email: string) => {
    try {
      // This would be an API call to get user details for specialty display
      // For now, we'll simulate it
      if (email.includes('hospital')) {
        setSpecialty('Gynaecologist — Lagos University Teaching Hospital');
        setCenterInfo({
          center_type: 'fhc',
          center_name: 'Lagos University Teaching Hospital',
          is_verified: true
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      fetchUserDetails(formData.email);
    }
  }, [formData.email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A5276] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AI-MSHM</span>
          </div>
          <Badge className="bg-[#1A5276] text-white mb-4">
            Clinician / Doctor
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">Clinician Portal</h1>
          <p className="text-gray-600 mt-2">Secure access for medical professionals</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              {show2FA ? "Two-Factor Authentication" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {!show2FA ? (
              <form onSubmit={handleLoginStep1} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="dr.user@example.com"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Medical License Number */}
                <div className="space-y-2">
                  <Label htmlFor="medical_license_number">Medical License Number</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="medical_license_number"
                      type="text"
                      placeholder="e.g., MDCN/12345"
                      value={formData.medical_license_number}
                      onChange={handleInputChange('medical_license_number')}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.medical_license_number && <p className="text-sm text-red-600">{errors.medical_license_number}</p>}
                </div>

                {/* Specialty Display */}
                {specialty && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Specialty:</strong> {specialty}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#1A5276] hover:bg-[#2A6286]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Credentials...
                    </>
                  ) : (
                    "Access Clinician Portal"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLoginStep2} className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800">
                    Credentials verified. Please enter your 2FA code.
                  </p>
                </div>

                {/* 2FA Code */}
                <div className="space-y-2">
                  <Label htmlFor="two_factor_code">Two-Factor Authentication Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="two_factor_code"
                      type="text"
                      placeholder="123456"
                      value={formData.two_factor_code}
                      onChange={handleInputChange('two_factor_code')}
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.two_factor_code && <p className="text-sm text-red-600">{errors.two_factor_code}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1A5276] hover:bg-[#2A6286]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </form>
            )}

            {/* Links */}
            <div className="text-center space-y-2 pt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#1A5276] hover:underline"
              >
                Forgot Password?
              </button>
              <div className="text-sm text-gray-600">
                Patient instead?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#1A5276] hover:underline font-medium"
                >
                  Sign in here
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            AI-MSHM Clinician Portal v1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClinicianLoginScreen;
