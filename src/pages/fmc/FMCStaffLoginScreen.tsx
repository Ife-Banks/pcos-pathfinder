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
import { fmcAPI } from "@/services/fmcService";
import { useAuth } from "@/context/AuthContext";
import { FMCLoginForm } from "@/types/fmc";

const FMCLoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FMCLoginForm>({
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
    
    if (!show2FA && !formData.staff_id.trim()) {
      newErrors.staff_id = "Staff ID is required";
    }
    
    if (show2FA && !formData.two_factor_code.trim()) {
      newErrors.two_factor_code = "2FA code is required";
    } else if (show2FA && !/^\d{6}$/.test(formData.two_factor_code)) {
      newErrors.two_factor_code = "2FA code must be 6 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FMCLoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await fmcAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Check FMC role
      if (!['fhc_staff', 'fhc_admin'].includes(response.data.user.role)) {
        setErrors({ general: "Your account does not have FMC staff access." });
        return;
      }
      
      // Check if email is verified
      if (!response.data.user.is_email_verified) {
        navigate('/verify-email');
        return;
      }
      
      // Store tokens and user data
      await login(response.data);
      
      // Set facility info
      setFacilityInfo(response.data.user.center_info);
      
      // Show 2FA screen
      setShow2FA(true);
      
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.status === 401) {
        setErrors({ general: "Incorrect email or password" });
      } else if (error.code === 'email_not_verified') {
        setErrors({ general: "Please verify your email first" });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
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
      await fmcAPI.verify2FA(formData.two_factor_code!, localStorage.getItem('access_token')!);
      
      // 2FA verified, navigate to dashboard
      navigate('/fmc/dashboard');
      
    } catch (error: any) {
      console.error('2FA error:', error);
      setErrors({ two_factor_code: "Invalid 2FA code" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (email: string) => {
    try {
      // Simulate fetching facility info based on email domain
      if (email.includes('luth')) {
        setFacilityInfo({
          center_type: 'fhc',
          center_name: 'Lagos University Teaching Hospital',
          department: 'Emergency & Critical Care'
        });
      } else if (email.includes('uch')) {
        setFacilityInfo({
          center_type: 'fhc',
          center_name: 'University College Hospital',
          department: 'Obstetrics & Gynaecology'
        });
      }
    } catch (error) {
      console.error('Error fetching facility info:', error);
    }
  };

  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      fetchUserDetails(formData.email);
    }
  }, [formData.email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#C0392B] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AI-MSHM</span>
          </div>
          <Badge className="bg-[#C0392B] text-white mb-4">
            Federal Medical Centre
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">FMC Portal</h1>
          <p className="text-gray-600 mt-2">Secure access for FMC staff</p>
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
                      placeholder="staff@luth.gov.ng"
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

                {/* Staff ID */}
                <div className="space-y-2">
                  <Label htmlFor="staff_id">Staff ID</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="staff_id"
                      type="text"
                      placeholder="e.g., LUTH-2024-089"
                      value={formData.staff_id}
                      onChange={handleInputChange('staff_id')}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.staff_id && <p className="text-sm text-red-600">{errors.staff_id}</p>}
                </div>

                {/* Facility Display */}
                {facilityInfo && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Facility:</strong> {facilityInfo.center_name}
                    </p>
                    {facilityInfo.department && (
                      <p className="text-sm text-red-700">
                        <strong>Department:</strong> {facilityInfo.department}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#C0392B] hover:bg-[#922B21]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Credentials...
                    </>
                  ) : (
                    "Access FMC Portal"
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
                  className="w-full bg-[#C0392B] hover:bg-[#922B21]"
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
                className="text-sm text-[#C0392B] hover:underline"
              >
                Staff ID forgotten?
              </button>
              <div className="text-sm text-gray-600">
                PHC staff instead?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/phc/login')}
                  className="text-[#C0392B] hover:underline font-medium"
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
            AI-MSHM FMC Portal v1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FMCLoginScreen;
