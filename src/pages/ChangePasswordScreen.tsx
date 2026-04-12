import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Shield, Loader2 } from "lucide-react";
import { authAPI } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const ChangePasswordScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.new_password) {
      setError("New password is required");
      return;
    }

    if (form.new_password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.changePassword({
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      });
      setSuccess(true);
      setTimeout(() => {
        if (user?.role === 'fhc_staff' || user?.role === 'fhc_admin') {
          navigate('/fmc/dashboard');
        } else if (user?.role === 'hcc_staff' || user?.role === 'hcc_admin') {
          navigate('/phc/dashboard');
        } else if (user?.role === 'clinician') {
          navigate('/clinician/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C0392B] to-[#922B21] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">AI-MSHM</h1>
          <p className="text-white/80">Polycystic Ovary Syndrome Management</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#C0392B] rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Change Password</CardTitle>
            <CardDescription>
              You must change your password before continuing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 text-center">
                  Password changed successfully! Redirecting...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={form.new_password}
                      onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#C0392B] hover:bg-[#922B21]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => logout()}
                    className="text-gray-500"
                  >
                    Log out
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;