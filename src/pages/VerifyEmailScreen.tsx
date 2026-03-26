import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { authAPI } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { saveTokens } from "@/utils/tokenStorage";

const VerifyEmailScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginWithTokens } = useAuth(); // Use AuthContext to login with tokens directly
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  
  // Read token from URL query params
  const token = searchParams.get("token");
  // Read email and userId from React Router location.state (for initial registration flow)
  const { email, userId } = location.state || {};

  useEffect(() => {
    // If token is present in URL, auto-verify
    if (token) {
      verifyEmailWithToken(token);
    } else if (!email) {
      // If no token and no email in state, redirect to signup
      navigate('/signup');
    }

    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, [token, email, navigate]);

  const verifyEmailWithToken = async (token: string) => {
    try {
      setIsVerifying(true);
      setVerifyError(null);
      
      console.log('🔍 Verifying email with token:', token);
      
      const result = await authAPI.verifyEmail(token);
      console.log('✅ Verify success:', result);
      
      // Backend returns: { status: "success", data: { ...user_fields, tokens: {...} } }
      // result.data is the response body: { status, data, message }
      // result.data.data is the actual user data with tokens
      const responseData = result.data.data;
      const { tokens, ...user } = responseData;

      // Store tokens using the token storage utility
      await saveTokens(tokens.access, tokens.refresh);
      
      // Set isVerified to true BEFORE navigating
      setIsVerified(true);
      
      // Set user data in AuthContext
      loginWithTokens(user, tokens.access, tokens.refresh);
      
      // Route based on onboarding status
      if (!user.onboarding_completed) {
        const step = user.onboarding_step || 0;
        const stepRoutes: Record<number, string> = {
          0: '/onboarding/step/1',
          1: '/onboarding/step/2',
          2: '/onboarding/step/3',
          3: '/onboarding/step/4',
          4: '/onboarding/step/5',
          5: '/onboarding/step/6',
        };
        navigate(stepRoutes[step] || '/onboarding/step/1');
      } else {
        console.log('🏠 Navigating to dashboard - onboarding completed');
        navigate('/dashboard');
      }
      
    } catch (err: any) {
      // Axios error structure: err.response.data contains the API response
      const errorData = err?.response?.data;
      const statusCode = err?.response?.status;
      
      let errorMessage = 'Verification failed. The link may have expired.';
      
      // First priority: message from backend
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      // For validation errors, extract useful info from errors field
      if (errorData?.errors) {
        const errors = errorData.errors;
        // Handle { token: ["Error message"] } format
        if (errors.token && Array.isArray(errors.token)) {
          errorMessage = errors.token[0];
        }
        // Handle { non_field_errors: [...] } format  
        else if (errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
          errorMessage = errors.non_field_errors[0];
        }
      }
      
      console.error('❌ Verify failed:', {
        status: statusCode,
        data: errorData,
        message: errorMessage
      });
      
      setVerifyError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) {
      if (!email) {
        setError('Email address not found. Please go back and register again.');
        return;
      }
      
      setError('Please wait before resending verification email.');
      return;
    }
    
    setIsResending(true);
    setError(null);
    
    try {
      console.log('📤 Resending verification to:', email);
      await authAPI.resendVerification(email);
      
      setResendSuccess(true);
      
      // Start 60-second cooldown
      setResendCooldown(60);
      cooldownRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
            }
            setResendSuccess(false); // Clear success message after cooldown
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Resend error:', JSON.stringify(err));
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-surface px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="h-20 w-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-lg"
        >
          {isVerifying ? (
            <div className="animate-spin h-10 w-10 border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : isVerified ? (
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          ) : (
            <Mail className="h-10 w-10 text-primary-foreground" />
          )}
        </motion.div>

        {/* Token present - verifying/verified/error states */}
        {token ? (
          <>
            {isVerifying && (
              <>
                <h1 className="text-2xl font-bold font-display text-foreground mb-3">
                  Verifying your email...
                </h1>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Please wait while we verify your email address.
                </p>
              </>
            )}
            
            {isVerified && (
              <>
                <h1 className="text-2xl font-bold font-display text-foreground mb-3 text-green-600">
                  Email verified!
                </h1>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Redirecting you to login page...
                </p>
              </>
            )}
            
            {verifyError && (
              <>
                <div className="flex items-center justify-center mb-4 text-red-600">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <h1 className="text-2xl font-bold font-display text-foreground">
                    Verification Failed
                  </h1>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {verifyError}
                </p>
                <Button 
                  variant="clinical" 
                  size="xl" 
                  className="w-full" 
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </Button>
              </>
            )}
          </>
        ) : (
          /* No token - waiting screen after registration */
          <>
            <h1 className="text-2xl font-bold font-display text-foreground mb-3">
              Check Your Inbox
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We've sent a verification link to <strong>{email}</strong>. 
              Click it to activate your account.
            </p>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-6">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm mb-6">
                Verification email sent! Check your inbox and spam folder.
              </div>
            )}

            <div className="space-y-3">
              <Button 
                variant="clinical" 
                size="xl" 
                className="w-full" 
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || isResending}
              >
                {isResending 
                  ? "Sending..." 
                  : resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : "Resend verification email"
                }
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailScreen;
