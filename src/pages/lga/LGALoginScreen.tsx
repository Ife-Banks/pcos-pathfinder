import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Mail, Lock, Building2, ArrowLeft } from "lucide-react";
import logoImage from "@/assets/logo.png";
import aimherLogo from "@/assets/AIMHER trademark  only.png";
import healthLogo from "@/assets/Health  Trademark only-1.png";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/services/authService";

const LGALoginScreen = () => {
  const navigate = useNavigate();
  const { loginWithTokens, routeAfterLogin } = useAuth();
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
      const response = await authAPI.login({ email, password });
      const responseData = response.data?.data || response.data;

      if (responseData?.access && responseData?.refresh) {
        const userData = responseData.user;
        localStorage.setItem('access_token', responseData.access);
        localStorage.setItem('refresh_token', responseData.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        await loginWithTokens(userData, responseData.access, responseData.refresh);
        const redirectPath = routeAfterLogin(userData);
        navigate(redirectPath, { replace: true });
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link to="/welcome">
            <img src={logoImage} alt="AIMHER" className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6">
            <Link to="/welcome" className="inline-block mb-3">
              <div className="flex items-center justify-center gap-2">
                <img src={logoImage} alt="logo" className="h-8 w-auto" />
                <img src={aimherLogo} alt="AIMHER" className="h-6 w-auto" />
                <img src={healthLogo} alt="Health" className="h-6 w-auto" />
              </div>
            </Link>
            <Badge className="bg-blue-700 text-white mb-3">
              <Building2 className="w-3 h-3 mr-1" />
              LGA Admin
            </Badge>
            <h1 className="text-2xl font-bold text-white">LGA Portal</h1>
            <p className="text-blue-200 text-sm mt-1">Manage Primary Health Centers in your Local Government Area</p>
          </div>

          <Card className="shadow-xl border-0 bg-blue-800/50 border-blue-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg text-white">LGA Administrator Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-100">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-blue-700/50 border-blue-600 text-white placeholder-blue-300"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-100">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-blue-700/50 border-blue-600 text-white placeholder-blue-300"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Access LGA Portal"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-xs text-blue-300/60">
              AI-MSHM LGA Portal v1.0.0
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LGALoginScreen;