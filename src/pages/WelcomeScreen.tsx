import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-health.png";

const features = [
  { icon: Activity, title: "Smart Monitoring", desc: "Daily health tracking with AI insights" },
  { icon: Brain, title: "AI Risk Analysis", desc: "Personalized PCOS risk assessment" },
  { icon: Shield, title: "Clinically Validated", desc: "Evidence-based screening tools" },
];

const conditions = [
  { name: "Infertility", description: "PCOS-related fertility challenges" },
  { name: "Type 2 Diabetes", description: "Metabolic complications and insulin resistance" },
  { name: "Depression", description: "Mental health impacts of hormonal imbalance" },
  { name: "Hirsutism", description: "Excess hair growth and skin conditions" },
];

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [currentCondition, setCurrentCondition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCondition((prev) => (prev + 1) % conditions.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const nextCondition = () => {
    setCurrentCondition((prev) => (prev + 1) % conditions.length);
  };

  const prevCondition = () => {
    setCurrentCondition((prev) => (prev - 1 + conditions.length) % conditions.length);
  };

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      {/* Mobile-optimized container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 w-full"
        >
          <motion.img
            src={heroImage}
            alt="Health monitoring visualization"
            className="w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-4 sm:mb-6 object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          
          <div className="px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-foreground mb-3 sm:mb-4 leading-tight">
              Take Control of Your{" "}
              <span className="text-gradient-primary">Reproductive Health</span>
              <br className="hidden sm:block" />
              <span className="text-lg sm:text-xl lg:text-2xl">Metabolic Health and Hormonal Imbalance</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg px-4 sm:px-0 max-w-3xl mx-auto">
              Artificial Intelligence-Powered PCOS risk assessment that combines your daily symptoms, biometrics, and clinical data into a personalized multi-signal health monitoring.
            </p>
          </div>
        </motion.div>

        {/* Conditions Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full mb-6 sm:mb-8 max-w-md mx-auto"
        >
          <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevCondition}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                disabled={conditions.length <= 1}
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              
              <div className="text-center flex-1 px-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                  {conditions[currentCondition].name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {conditions[currentCondition].description}
                </p>
              </div>
              
              <button
                onClick={nextCondition}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                disabled={conditions.length <= 1}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {conditions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCondition(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentCondition 
                      ? 'bg-primary' 
                      : 'bg-muted hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Grid - Responsive */}
        <motion.div
          className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="bg-card rounded-lg p-3 sm:p-4 border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">{f.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full space-y-3 sm:space-y-4"
        >
          <Button variant="clinical" size="xl" className="w-full text-sm sm:text-base" onClick={() => navigate("/signup")}>
            Get Started
          </Button>
          <Button variant="outline-clinical" size="lg" className="w-full text-sm sm:text-base" onClick={() => navigate("/login")}>
            I already have an account
          </Button>
          
          {/* Portal Links Section */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3 sm:mb-4">Staff Portals</p>
            <div className="space-y-2 sm:space-y-3">
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate("/clinician/login")}
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm sm:text-base group-hover:text-blue-700">Clinician Portal</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">For individual clinicians and doctors</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate("/phc/login")}
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:from-green-100 hover:to-emerald-100 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm sm:text-base group-hover:text-green-700">Primary Health Centre Portal</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">For PHC staff and community health workers</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate("/fmc/login")}
                className="w-full bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:border-red-300 hover:from-red-100 hover:to-orange-100 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm sm:text-base group-hover:text-red-700">Federal Medical Centre Portal</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">For FMC staff and major risk management</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
