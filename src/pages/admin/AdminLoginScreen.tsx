import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Mail, Lock, Shield, ArrowLeft } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { adminAPI } from "@/services/adminService";

const AdminLoginScreen = () => {
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
      const response = await adminAPI.login({ email: identifier, password });
      
      const responseData = response.data?.data || response.data;
      
      if (responseData?.access && responseData?.refresh) {
        // Store tokens and user directly from login response
        const userData = responseData.user || { email: identifier, is_staff: true, role: 'admin' };
        localStorage.setItem('access_token', responseData.access);
        localStorage.setItem('refresh_token', responseData.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        await loginWithTokens(userData, responseData.access, responseData.refresh);
        navigate("/system-admin/dashboard", { replace: true });
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo & Title Section */}
          <div className="text-center mb-6">
            <Link to="/welcome" className="inline-block">
              <img src={logoImage} alt="AIMHER" className="w-28 h-auto mx-auto mb-3" />
            </Link>
            <Badge className="bg-slate-700 text-white mb-3">
              <Shield className="w-3 h-3 mr-1" />
              System Admin
            </Badge>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-gray-400 text-sm mt-1">Secure access for system administrators</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg text-white">Administrator Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-gray-300">Admin ID or Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Enter your admin ID or email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10 h-11 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-600 hover:bg-slate-500 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Credentials...
                    </>
                  ) : (
                    "Access Admin Portal"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              AI-MSHM Admin Portal v1.0.0
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginScreen;