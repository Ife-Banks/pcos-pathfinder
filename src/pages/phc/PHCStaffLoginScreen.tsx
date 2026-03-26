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
  AlertTriangle 
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { useAuth } from "@/context/AuthContext";

const PHCStaffLoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await phcAPI.login({
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      if (!['hcc_admin', 'hcc_staff'].includes(user.role)) {
        setError("Your account does not have PHC staff access.");
        return;
      }

      if (!user.is_email_verified) {
        navigate('/verify-email');
        return;
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      loginWithTokens(user, access);
      navigate('/phc/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('invalid') || msg.includes('credentials')) {
        setError("Incorrect email or password.");
      } else if (err.code === 'email_not_verified') {
        setError("Please verify your email before logging in.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-gray-600 mt-2">Sign in to manage patients</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Staff Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@surulerephc.gov.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
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
                className="w-full bg-[#2E8B57] hover:bg-[#236F47]"
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
            <div className="text-center space-y-2 pt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#2E8B57] hover:underline"
              >
                Forgot Password?
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
