import { useState } from "react";
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
  AlertTriangle,
  Building2
} from "lucide-react";
import { stthAPI } from "@/services/portalService";
import { useAuth } from "@/context/AuthContext";

const STTHStaffLoginScreen = () => {
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
      const response = await stthAPI.login({
        email: identifier,
        password,
      });

      const { access, refresh, user } = response.data;

      if (!['stth_admin', 'stth_staff'].includes(user.role)) {
        setError("Your account does not have State Teaching Hospital access.");
        return;
      }

      if (!user.is_email_verified) {
        navigate('/verify-email');
        return;
      }

      if (user.must_change_password) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        loginWithTokens(user, access);
        navigate('/change-password');
        return;
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      loginWithTokens(user, access, refresh);
      navigate('/stth/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message?.toLowerCase() || '';
      const responseMsg = err.response?.data?.message?.toLowerCase() || '';
      
      if (responseMsg.includes('invalid') || msg.includes('invalid') || responseMsg.includes('credentials') || msg.includes('credentials')) {
        setError("Incorrect ID or password. Please check your credentials and try again.");
      } else if (responseMsg.includes('email not verified') || msg.includes('email not verified') || responseMsg.includes('verify') || msg.includes('verify')) {
        setError("Email not verified. Please check your inbox for the verification link.");
      } else if (responseMsg.includes('locked') || msg.includes('locked') || responseMsg.includes('too many')) {
        setError("Account locked. Please wait 15 minutes before trying again.");
      } else if (responseMsg.includes('not found') || msg.includes('not found')) {
        setError("Account not found. Please check if you have a State Teaching Hospital staff account.");
      } else if (responseMsg.includes('forbidden') || msg.includes('forbidden')) {
        setError("Access denied. Your account does not have State Teaching Hospital permissions.");
      } else {
        setError("Login failed. Please verify your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-cyan-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0891B2] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AI-MSHM</span>
          </div>
          <Badge className="bg-[#0891B2] text-white mb-4">
            State Teaching Hospital
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">State Teaching Hospital Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to manage patients</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Staff Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Staff ID or Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="STTH/2024/000001 or staff@stth.gov.ng"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0891B2] hover:bg-[#0E7490]"
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

            <div className="text-center space-y-2 pt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#0891B2] hover:underline"
              >
                Forgot Password?
              </button>
              <div className="text-sm text-gray-600">
                FMC staff instead?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/fmc/login')}
                  className="text-[#0891B2] hover:underline font-medium"
                >
                  Sign in here
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            AI-MSHM State Teaching Hospital Portal v1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default STTHStaffLoginScreen;