import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, User, Mail, Lock, Key, Stethoscope, ArrowLeft } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { clinicianAPI } from "@/services/clinicianService";
import { useAuth } from "@/context/AuthContext";
import { ClinicianLoginForm } from "@/types/clinician";

const ClinicianLoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [formData, setFormData] = useState<ClinicianLoginForm>({
    identifier: "",
    password: "",
    two_factor_code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specialty, setSpecialty] = useState<string>("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = "ID or Email is required";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
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
      const response = await clinicianAPI.login(formData);
      
      const accessToken = response.data?.access;
      const refreshToken = response.data?.refresh;
      const userData = response.data?.user;
      
      if (accessToken && refreshToken) {
        await loginWithTokens(userData, accessToken, refreshToken);
        
        if (userData?.must_change_password) {
          navigate('/change-password');
          return;
        }
        navigate('/clinician/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.message?.toLowerCase() || '';
      const responseMsg = error.response?.data?.message?.toLowerCase() || '';
      
      if (responseMsg.includes('invalid') || msg.includes('invalid') || responseMsg.includes('credentials') || msg.includes('credentials')) {
        setErrors({ general: "Incorrect ID or password. Please check your credentials and try again." });
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
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.must_change_password) {
          navigate('/change-password');
          return;
        }
      }
      
      navigate('/clinician/dashboard');
      
    } catch (error: any) {
      console.error('2FA error:', error);
      setErrors({ two_factor_code: "Invalid 2FA code" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData.identifier && formData.identifier.includes('@')) {
      if (formData.identifier.includes('hospital')) {
        setSpecialty('Gynaecologist — Lagos University Teaching Hospital');
      } else if (formData.identifier.includes('clinic')) {
        setSpecialty('General Practitioner — Private Clinic');
      } else {
        setSpecialty('');
      }
    }
  }, [formData.identifier]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-slate-100 to-slate-200">
      {/* Header */}
      <header className="border-b border-white/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link to="/welcome">
            <img src={logoImage} alt="AIMHER" className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo & Title Section */}
          <div className="text-center mb-6">
            {/* <Link to="/welcome" className="inline-block">
              <img src={logoImage} alt="AIMHER" className="w-28 h-auto mx-auto mb-3" />
            </Link> */}
            <h1 className="text-4xl font-bold text-gray-900">Clinician Portal</h1>
            <p className="text-gray-600 text-sm mt-1">Secure access for medical professionals</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg">
                {show2FA ? "Two-Factor Authentication" : "Sign In"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {errors.general && (
                <Alert variant="destructive" className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800">{errors.general}</AlertDescription>
                </Alert>
              )}

              {!show2FA ? (
                <form onSubmit={handleLoginStep1} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Clinician ID or Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="CLN/2024/000001 or dr.user@example.com"
                        value={formData.identifier}
                        onChange={handleInputChange('identifier')}
                        className="pl-10 h-11"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.identifier && <p className="text-sm text-red-600">{errors.identifier}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        className="pl-10 pr-10 h-11"
                        disabled={isLoading}
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

                  {specialty && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium">
                        <strong>Specialty:</strong> {specialty}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#1A5276] hover:bg-[#2A6286] transition-colors"
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
                <form onSubmit={handleLoginStep2} className="space-y-5">
                  <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800">
                      Credentials verified. Please enter your 2FA code.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="two_factor_code">Two-Factor Authentication Code</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="two_factor_code"
                        type="text"
                        placeholder="123456"
                        value={formData.two_factor_code}
                        onChange={handleInputChange('two_factor_code')}
                        className="pl-10 h-11 text-center text-lg tracking-widest"
                        maxLength={6}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.two_factor_code && <p className="text-sm text-red-600">{errors.two_factor_code}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#1A5276] hover:bg-[#2A6286] transition-colors"
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
              <div className="space-y-3 pt-2">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-[#1A5276] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Not a clinician?{' '}
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

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              AI-MSHM Clinician Portal v1.0.0
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicianLoginScreen;