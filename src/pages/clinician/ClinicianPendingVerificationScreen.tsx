import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Clock, Mail, Phone, LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/services/authService";

const ClinicianPendingVerificationScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkVerificationStatus = async () => {
    if (!user?.email) return;
    
    setCheckingStatus(true);
    try {
      const response = await authAPI.getMe(localStorage.getItem('access_token')!);
      
      if (response.data.center_info?.is_verified) {
        // Center has verified the clinician
        navigate('/clinician/dashboard');
      } else {
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate('/clinician/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check status every 5 minutes
    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A5276] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AI-MSHM</span>
          </div>
          <Badge className="bg-amber-500 text-white mb-4">
            Account Under Review
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">Pending Verification</h1>
          <p className="text-gray-600 mt-2">Your clinician account is being reviewed</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Review in Progress</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Your clinician account has been created and your email is verified. 
                    Your affiliated health center needs to verify your credentials before you can access the portal. 
                    This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Account Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{user?.full_name || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user?.email || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Verified:</span>
                  <span className="font-medium text-green-600">
                    {user?.is_email_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Center Verified:</span>
                  <span className="font-medium text-amber-600">
                    {user?.center_info?.is_verified ? 'Yes' : 'Pending'}
                  </span>
                </div>
                {user?.center_info?.center_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health Center:</span>
                    <span className="font-medium">{user.center_info.center_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Last Checked */}
            {lastChecked && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={checkVerificationStatus}
                disabled={checkingStatus}
                className="w-full bg-[#1A5276] hover:bg-[#2A6286]"
              >
                {checkingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Check Verification Status
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@ai-mshm.com'}
                  className="text-sm"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Log Out
                </Button>
              </div>
            </div>

            {/* Help Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Contact your health center administrator</li>
                <li>• Email: support@ai-mshm.com</li>
                <li>• Phone: +234-800-000-0000</li>
                <li>• Include your full name and email in all communications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh notice */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            This page automatically checks your verification status every 5 minutes
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClinicianPendingVerificationScreen;
