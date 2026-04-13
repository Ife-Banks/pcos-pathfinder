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
  Mail, 
  Lock, 
  Hospital,
  AlertTriangle 
} from "lucide-react";
import { fmcAPI } from "@/services/fmcService";
import { useAuth } from "@/context/AuthContext";
import { FMCLoginForm } from "@/types/fmc";

const FMCLoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [formData, setFormData] = useState<FMCLoginForm>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FMCLoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fmcAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login response:', response);
      console.log('response.data:', response.data);
      console.log('user:', response.data.user);
      console.log('must_change_password:', response.data.user.must_change_password);
      
      if (!['fhc_staff', 'fhc_admin'].includes(response.data.user.role)) {
        setErrors({ general: "Your account does not have FMC staff access." });
        return;
      }
      
      if (!response.data.user.is_email_verified) {
        navigate('/verify-email');
        return;
      }
      
      if (response.data.user.must_change_password) {
        const { access, refresh, user } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        loginWithTokens(user, access, refresh);
        navigate('/change-password');
        return;
      }
      
      const { access, refresh, user } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Extract FMC info from center_info and set proper user data
      const fmcInfo = user.center_info;
      const userWithFMC = {
        ...user,
        center_info: {
          ...user.center_info,
          fmc_name: fmcInfo?.center_type === 'fmc' ? fmcInfo?.center_name : fmcInfo?.fmc_name,
          fmc_type: fmcInfo?.center_type
        }
      };
      
      setFacilityInfo(userWithFMC.center_info);
      loginWithTokens(userWithFMC, access, refresh);
      navigate('/fmc/dashboard');
      
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
        setErrors({ general: "Account not found. Please check if you have an FMC staff account." });
      } else if (responseMsg.includes('forbidden') || msg.includes('forbidden')) {
        setErrors({ general: "Access denied. Your account does not have FMC staff permissions." });
      } else if (error.status === 401) {
        setErrors({ general: "Login failed. Incorrect email or password." });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (email: string) => {
    try {
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
            <CardTitle className="text-center">Staff Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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

            <div className="text-center space-y-2 pt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#C0392B] hover:underline"
              >
                Forgot password?
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