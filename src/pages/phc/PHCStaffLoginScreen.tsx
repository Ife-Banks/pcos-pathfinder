import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Key, 
  Hospital,
  AlertTriangle 
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { useAuth } from "@/context/AuthContext";
import { PHCLoginForm } from "@/types/phc";

const PHCStaffLoginScreen = () => {
  const navigate = useNavigate();
  // ✅ CORRECT
const { loginWithTokens, routeAfterLogin } = useAuth();
  const [formData, setFormData] = useState<PHCLoginForm>({
    email: "",
    password: "",
    staff_id: "",
    two_factor_code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [facilityInfo, setFacilityInfo] = useState<any>(null);

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
    
    // Staff ID is REQUIRED for all PHC staff logins
    if (!formData.staff_id?.trim()) {
      newErrors.staff_id = "Staff ID / Employee Number is required";
    }
    
    if (show2FA && !formData.two_factor_code.trim()) {
      newErrors.two_factor_code = "2FA code is required";
    } else if (show2FA && !/^\d{6}$/.test(formData.two_factor_code)) {
      newErrors.two_factor_code = "2FA code must be 6 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PHCLoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const response = await phcAPI.login({
    email: formData.email,
    password: formData.password,
    staff_id: formData.staff_id || undefined,
  });

  console.log('RAW LOGIN RESPONSE:', JSON.stringify(response));

  // Check if 2FA is required
  if (response.data?.requires_2fa) {
    // User has 2FA enabled, need to verify OTP
    const user = response.data.user;
    
    if (!['hcc_admin', 'hcc_staff'].includes(user.role)) {
      setErrors({ general: "Your account does not have PHC staff access." });
      return;
    }

    // Store tokens temporarily and show 2FA screen
    localStorage.setItem('phc_pending_token', JSON.stringify({
      access: response.data.access,
      refresh: response.data.refresh,
      user: user,
    }));
    
    setFacilityInfo(user.center_info);
    setShow2FA(true);
    setIsLoading(false);
    return;
  }

  const { access, refresh, user } = response.data;

  if (!['hcc_admin', 'hcc_staff'].includes(user.role)) {
    setErrors({ general: "Your account does not have PHC staff access." });
    return;
  }

  if (!user.is_email_verified) {
    navigate('/verify-email');
    return;
  }

localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);

loginWithTokens(user, access);
setFacilityInfo(user.center_info);
navigate('/phc/dashboard');

} catch (error: any) {
  console.error('Login error:', error);
  const msg = error.message?.toLowerCase() || '';
  if (msg.includes('invalid') || msg.includes('credentials')) {
    setErrors({ general: "Incorrect email or password." });
  } else if (error.code === 'email_not_verified') {
    setErrors({ general: "Please verify your email before logging in." });
  } else {
    setErrors({ general: error.message || "An error occurred. Please try again." });
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
      // Get pending token data
      const pendingDataStr = localStorage.getItem('phc_pending_token');
      if (!pendingDataStr) {
        setErrors({ general: "Session expired. Please login again." });
        setShow2FA(false);
        setIsLoading(false);
        return;
      }

      // Verify OTP and get final tokens
      const response = await phcAPI.verify2FA(formData.two_factor_code!, formData.email);
      const { access, refresh, user } = response.data;

      // Clear pending token
      localStorage.removeItem('phc_pending_token');

      // Store final tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      loginWithTokens(user, access);
      navigate('/phc/dashboard');
      
    } catch (error: any) {
      console.error('2FA error:', error);
      setErrors({ two_factor_code: "Invalid 2FA code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchUserDetails = async (email: string) => {
  //   try {
  //     // Simulate fetching facility info based on email domain
  //     if (email.includes('ibadan')) {
  //       setFacilityInfo({
  //         center_type: 'hcc',
  //         center_name: 'Ibadan Central Primary Health Centre',
  //         department: 'General Practice'
  //       });
  //     } else if (email.includes('lagos')) {
  //       setFacilityInfo({
  //         center_type: 'hcc',
  //         center_name: 'Lagos Island Primary Health Centre',
  //         department: 'Maternal & Child Health'
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching facility info:', error);
  //   }
  // };

  // useEffect(() => {
  //   if (formData.email && formData.email.includes('@')) {
  //     fetchUserDetails(formData.email);
  //   }
  // }, [formData.email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2E8B57] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AI-MSHM</span>
          </div>
          <Badge className="bg-[#2E8B57] text-white mb-4">
            Primary Health Centre Staff
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">PHC Portal</h1>
          <p className="text-gray-600 mt-2">Secure access for PHC staff</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              {show2FA ? "Two-Factor Authentication" : "Staff Login"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
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
                      placeholder="staff@ibadanphc.gov.ng"
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

                {/* Staff ID - REQUIRED */}
                <div className="space-y-2">
                  <Label htmlFor="staff_id">
                    Staff ID / Employee Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="staff_id"
                      type="text"
                      placeholder="e.g., PHC-IBD-2024-012"
                      value={formData.staff_id}
                      onChange={handleInputChange('staff_id')}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.staff_id && <p className="text-sm text-red-600">{errors.staff_id}</p>}
                </div>

                {/* Facility Display */}
                {facilityInfo && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Facility:</strong> {facilityInfo.center_name}
                    </p>
                    {facilityInfo.department && (
                      <p className="text-sm text-green-700">
                        <strong>Department:</strong> {facilityInfo.department}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#2E8B57] hover:bg-[#236F47]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Credentials...
                    </>
                  ) : (
                    "Access PHC Portal"
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
                  className="w-full bg-[#2E8B57] hover:bg-[#236F47]"
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
                className="text-sm text-[#2E8B57] hover:underline"
              >
                Wrong portal? Switch role
              </button>
              <div className="text-sm text-gray-600">
                FMC staff instead?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/fmc/login')}
                  className="text-[#2E8B57] hover:underline font-medium"
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
            AI-MSHM PHC Portal v1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PHCStaffLoginScreen;
