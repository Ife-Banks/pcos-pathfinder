import { useState } from "react";
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
  Building2,
  ArrowLeft
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { phcAPI } from "@/services/phcService";
import { useAuth } from "@/context/AuthContext";

const PHCStaffLoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password.trim()) {
      setError("ID and password are required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await phcAPI.login({
        email: identifier,
        password,
      });

      console.log('[PHC Login] Response:', response);
      // Support both response.data and response
      const data = response?.data ?? response;
const access = data?.access;
      const refresh = data?.refresh;
      const user = data?.user;

      if (!user || !['hcc_admin', 'hcc_staff'].includes(user.role)) {
        setError("Your account does not have PHC staff access.");
        setIsLoading(false);
        return;
      }

      await loginWithTokens(access, refresh);
      navigate('/phc/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-green-100 to-emerald-100">
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
            <h1 className="text-4xl font-bold text-gray-900">PHC Portal</h1>
            <p className="text-gray-600 text-sm mt-1">Sign in to manage patients</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg">Staff Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{error}</AlertDescription>
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
                      placeholder="PHC/2024/000001 or staff@phc.gov.ng"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10 h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#2E8B57] hover:bg-[#236F47] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Links */}
              <div className="space-y-3 pt-2">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-[#2E8B57] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Not PHC staff?{' '}
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

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              AI-MSHM PHC Portal v1.0.0
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PHCStaffLoginScreen;