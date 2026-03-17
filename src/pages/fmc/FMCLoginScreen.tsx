import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import logo from '@/assets/logo.png';

const FMCLoginScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [credentialsError, setCredentialsError] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  
  const [credentials, setCredentials] = useState({
    staffId: '',
    email: '',
    password: '',
    twoFACode: ''
  });

  const [facilityInfo, setFacilityInfo] = useState({
    name: '',
    department: ''
  });

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCredentialsError('');
    setRoleError('');

    // Simulate API call
    setTimeout(() => {
      // Mock validation
      if (credentials.staffId === 'FMC-001' && credentials.email === 'dr.johnson@fmc.gov.ng' && credentials.password === 'password123') {
        // Set facility info
        setFacilityInfo({
          name: 'Federal Medical Centre, Lagos',
          department: 'Gynaecology Department'
        });
        setStep(2);
      } else if (credentials.staffId === 'PHC-001') {
        setRoleError('Access denied: This portal is for Federal Medical Centre staff only. Please use the PHC Portal for Primary Health Centre access.');
      } else {
        setCredentialsError('Invalid credentials. Please check your Staff ID, email, and password.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTwoFAError('');

    // Simulate 2FA API call
    setTimeout(() => {
      if (credentials.twoFACode === '123456') {
        // Store mock JWT and redirect
        localStorage.setItem('fmc_token', 'mock_jwt_token');
        navigate('/fmc/dashboard');
      } else {
        setTwoFAError('Invalid 2FA code. Please check your authentication app and try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen gradient-surface">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <img src={logo} alt="AI-MSHM" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">AI-MSHM</h1>
            <p className="text-sm text-muted-foreground">Federal Medical Centre Portal</p>
          </motion.div>

          {/* Role Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 bg-fmc-primary-light text-fmc-primary rounded-full">
              <Shield className="h-4 w-4 mr-2" />
              Federal Medical Centre
            </div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-card rounded-2xl shadow-lg border-t-4 border-fmc-primary p-8"
          >
            {step === 1 ? (
              <form onSubmit={handleInitialLogin} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Staff Authentication</h2>
                  
                  {/* Facility Info (shown after Staff ID entry) */}
                  {facilityInfo.name && (
                    <div className="mb-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground">{facilityInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{facilityInfo.department}</p>
                    </div>
                  )}

                  {/* Role Error */}
                  {roleError && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Access Denied</p>
                        <p className="text-sm text-destructive/80 mt-1">{roleError}</p>
                      </div>
                    </div>
                  )}

                  {/* Credentials Error */}
                  {credentialsError && (
                    <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-sm text-warning">{credentialsError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground">Staff ID</Label>
                      <Input
                        type="text"
                        value={credentials.staffId}
                        onChange={(e) => setCredentials({...credentials, staffId: e.target.value})}
                        className="mt-1 border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-fmc-primary focus:border-fmc-primary"
                        placeholder="FMC-001"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground">Email Address</Label>
                      <Input
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        className="mt-1 border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-fmc-primary focus:border-fmc-primary"
                        placeholder="dr.johnson@fmc.gov.ng"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={credentials.password}
                          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                          className="border-input rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-fmc-primary focus:border-fmc-primary"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-fmc-primary text-primary-foreground rounded-lg px-4 py-3 hover:bg-fmc-primary/90 transition-colors font-medium"
                  >
                    {isLoading ? 'Authenticating...' : 'Access FMC Portal'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handle2FAVerification} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Two-Factor Authentication</h2>
                  <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit code from your authentication app</p>
                  
                  {/* 2FA Error */}
                  {twoFAError && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{twoFAError}</p>
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">{facilityInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{facilityInfo.department}</p>
                    <p className="text-sm text-muted-foreground mt-1">Staff ID: {credentials.staffId}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Authentication Code</Label>
                    <Input
                      type="text"
                      value={credentials.twoFACode}
                      onChange={(e) => setCredentials({...credentials, twoFACode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                      className="mt-1 border-input rounded-lg px-3 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-fmc-primary focus:border-fmc-primary"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2">Enter 6-digit code</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || credentials.twoFACode.length !== 6}
                    className="w-full bg-fmc-primary text-primary-foreground rounded-lg px-4 py-3 hover:bg-fmc-primary/90 transition-colors font-medium"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Access Portal'}
                  </Button>
                </div>
              </form>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                AI-MSHM v2.0 — Federal Medical Centre Secure Access
              </p>
              <button
                onClick={() => navigate('/welcome')}
                className="text-xs text-muted-foreground hover:text-fmc-primary transition-colors mt-2"
              >
                Wrong portal? Switch role
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FMCLoginScreen;
