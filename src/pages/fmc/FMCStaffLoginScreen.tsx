import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
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
  HeartPulse,
  ArrowLeft
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { fmcAPI } from "@/services/fmcService";
import { useAuth } from "@/context/AuthContext";
import { FMCLoginForm } from "@/types/fmc";

const FMCLoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [formData, setFormData] = useState<FMCLoginForm>({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [facilityInfo, setFacilityInfo] = useState<any>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = "ID or Email is required";
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
    try {
      const response = await fmcAPI.login(formData);
      
      const responseData = response?.data || response;
      
      if (responseData.access && responseData.refresh) {
        const userData = responseData.user || { email: formData.email, role: 'fhc_staff' };
        await loginWithTokens(userData, responseData.access, responseData.refresh);
        navigate('/fmc/dashboard');
      } else {
        setErrors({ general: "Invalid credentials. Please try again." });
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || "Login failed";
      setErrors({ general: message });
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
    if (formData.identifier && formData.identifier.includes('@')) {
      fetchUserDetails(formData.identifier);
    }
  }, [formData.identifier]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-red-100 to-orange-100">
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
            <h1 className="text-4xl font-bold text-gray-900">FMC Portal</h1>
            <p className="text-gray-600 text-sm mt-1">Secure access for FMC staff</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg">Staff Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {errors.general && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Staff ID or Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="FMC/2024/000001 or staff@luth.gov.ng"
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

                {facilityInfo && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <p className="text-sm text-red-800 font-medium">
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
                  className="w-full h-11 bg-[#C0392B] hover:bg-[#922B21] transition-colors"
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

              {/* Links */}
              <div className="space-y-3 pt-2">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-[#C0392B] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Not FMC staff?{' '}
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

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              AI-MSHM FMC Portal v1.0.0
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FMCLoginScreen;