import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, User, Mail, Lock, Hospital } from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";
import { ClinicianRegistrationForm } from "@/types/clinician";

const ClinicianRegistrationScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ClinicianRegistrationForm>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "clinician",
    medical_license_number: "",
    specialty: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.length < 3) {
      newErrors.full_name = "Full name must be at least 3 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }
    
    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    
    if (!formData.medical_license_number.trim()) {
      newErrors.medical_license_number = "Medical license number is required";
    } else if (formData.medical_license_number.length < 5) {
      newErrors.medical_license_number = "License number appears invalid";
    }
    
    if (!formData.specialty.trim()) {
      newErrors.specialty = "Specialty is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ClinicianRegistrationForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await clinicianAPI.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: "clinician",
      });
      
      setSuccess(true);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.keys(error.errors).forEach(key => {
          fieldErrors[key] = error.errors[key][0];
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification email to <strong>{formData.email}</strong>. 
                Please click the link in the email to verify your account.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
                <ol className="text-sm text-blue-800 space-y-1 text-left">
                  <li>1. Verify your email using the link we sent</li>
                  <li>2. Wait for your health center to verify your credentials</li>
                  <li>3. Access the clinician portal once approved</li>
                </ol>
              </div>
              <Button
                onClick={() => navigate('/clinician/login')}
                className="w-full bg-[#1A5276] hover:bg-[#2A6286]"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A5276] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AI-MSHM</span>
          </div>
          <Badge className="bg-[#1A5276] text-white mb-4">
            Clinician Registration
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Register as a medical professional</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Clinician Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={formData.full_name}
                    onChange={handleInputChange('full_name')}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.full_name && <p className="text-sm text-red-600">{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="dr.smith@hospital.ng"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Medical License Number */}
              <div className="space-y-2">
                <Label htmlFor="medical_license_number">Medical License Number</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="medical_license_number"
                    type="text"
                    placeholder="MDCN/12345"
                    value={formData.medical_license_number}
                    onChange={handleInputChange('medical_license_number')}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.medical_license_number && <p className="text-sm text-red-600">{errors.medical_license_number}</p>}
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <Label htmlFor="specialty">Medical Specialty</Label>
                <div className="relative">
                  <Hospital className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="specialty"
                    type="text"
                    placeholder="e.g., Gynaecology, Internal Medicine"
                    value={formData.specialty}
                    onChange={handleInputChange('specialty')}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.specialty && <p className="text-sm text-red-600">{errors.specialty}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
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
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={handleInputChange('confirm_password')}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-sm text-red-600">{errors.confirm_password}</p>}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-1">Password Requirements:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1A5276] hover:bg-[#2A6286]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Clinician Account"
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/clinician/login')}
                  className="text-[#1A5276] hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Patient login instead
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            AI-MSHM Clinician Portal v1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClinicianRegistrationScreen;
