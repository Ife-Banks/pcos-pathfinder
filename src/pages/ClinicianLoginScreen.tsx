import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Shield, Stethoscope, Lock, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png";

const ClinicianLoginScreen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", npiNumber: "" });
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    // Simulate NPI verification
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setTimeout(() => {
        navigate("/clinician/patients");
      }, 1000);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Clinical Banner */}
      <div className="gradient-clinical px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-2 text-primary-foreground">
          <Stethoscope className="h-4 w-4" />
          <span className="text-sm font-display font-semibold">Clinician Portal</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate("/welcome")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back to patient login
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="AI-MSHM" className="h-10 w-10" />
            <div className="h-10 w-px bg-border" />
            <div className="h-10 w-10 rounded-lg gradient-clinical flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">Clinician Login</h1>
          <p className="text-muted-foreground mt-1">Access your patient panel with verified credentials</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4 flex-1"
        >
          {/* Institution Info */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Verification Required</p>
                  <p className="text-sm font-display font-semibold text-foreground">
                    NPI credentials will be validated
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="email">Institutional Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="doctor@hospital.org" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npi">NPI Number</Label>
            <Input 
              id="npi" 
              type="text" 
              placeholder="10-digit NPI" 
              maxLength={10}
              value={form.npiNumber} 
              onChange={(e) => setForm({ ...form, npiNumber: e.target.value.replace(/\D/g, "") })} 
              required 
            />
            <p className="text-xs text-muted-foreground">
              Your National Provider Identifier for verification
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
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

          <div className="pt-4">
            <Button 
              variant="clinical" 
              size="xl" 
              className="w-full" 
              type="submit"
              disabled={verifying || verified}
            >
              {verifying ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="h-4 w-4" />
                  </motion.div>
                  Verifying Credentials...
                </span>
              ) : verified ? (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Verified - Redirecting...
                </span>
              ) : (
                "Sign In to Clinician Portal"
              )}
            </Button>
          </div>
        </motion.form>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-[hsl(var(--clinical-blue))]/5 border border-[hsl(var(--clinical-blue))]/20 rounded-xl"
        >
          <div className="flex gap-3">
            <Lock className="h-5 w-5 text-[hsl(var(--clinical-blue))] shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-foreground text-sm mb-1">HIPAA Compliant Access</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This portal provides access to Protected Health Information (PHI). 
                All sessions are logged and monitored. Access is restricted to verified 
                healthcare providers with valid NPI credentials.
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Need clinician access?{" "}
          <button className="text-primary font-semibold hover:underline">
            Request credentials
          </button>
        </p>
      </div>
    </div>
  );
};

export default ClinicianLoginScreen;
