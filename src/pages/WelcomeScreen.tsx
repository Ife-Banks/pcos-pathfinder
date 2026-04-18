import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Building2, X, ArrowRight, Stethoscope, HeartPulse } from "lucide-react";
import { PORTAL_OPTIONS, SubSector } from "@/config/portals";
import logoImage from "@/assets/logo.png";
import HeroHeartbeat from "@/components/HeroHeartbeat";

const features = [
  { title: "Smart Monitoring", desc: "Daily health tracking with AI-powered insights", image: "📊" },
  { title: "AI Risk Analysis", desc: "Personalized PCOS risk assessment", image: "🧠" },
  { title: "Clinically Validated", desc: "Evidence-based screening tools", image: "✅" },
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
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [showPortalSelector, setShowPortalSelector] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCondition((prev) => (prev + 1) % conditions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextCondition = () => setCurrentCondition((prev) => (prev + 1) % conditions.length);
  const prevCondition = () => setCurrentCondition((prev) => (prev - 1 + conditions.length) % conditions.length);
  const handlePortalSelect = (portal: SubSector) => {
    navigate(portal.path);
    setShowPortalSelector(false);
  };
  const handleSectorChange = (sectorKey: string) => {
    setSelectedSector(sectorKey);
  };

  const selectedSectorData = PORTAL_OPTIONS.find(s => s.sectorKey === selectedSector);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      "bg-green-600": "from-green-50 to-emerald-50 border-green-200 hover:border-green-300",
      "bg-teal-600": "from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-300",
      "bg-cyan-600": "from-cyan-50 to-blue-50 border-cyan-200 hover:border-cyan-300",
      "bg-red-600": "from-red-50 to-orange-50 border-red-200 hover:border-red-300",
      "bg-purple-600": "from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300",
      "bg-blue-600": "from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300",
      "bg-orange-600": "from-orange-50 to-amber-50 border-orange-200 hover:border-orange-300",
      "bg-amber-600": "from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300",
      "bg-yellow-600": "from-yellow-50 to-lime-50 border-yellow-200 hover:border-yellow-300",
    };
    return colorMap[color] || "from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300";
  };

  const getIconBgClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "bg-green-600": "bg-green-600", "bg-teal-600": "bg-teal-600", "bg-cyan-600": "bg-cyan-600",
      "bg-red-600": "bg-red-600", "bg-purple-600": "bg-purple-600", "bg-blue-600": "bg-blue-600",
      "bg-orange-600": "bg-orange-600", "bg-amber-600": "bg-amber-600", "bg-yellow-600": "bg-yellow-600",
    };
    return colorMap[color] || "bg-gray-600";
  };

  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
<div className="flex items-center gap-2">
            <img src={logoImage} alt="AIMHER" className="h-8 w-auto" />
            <span className="font-bold text-lg text-primary">AIMHER</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column - Hero & Features */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Hero Heartbeat Animation */}
              <div className="flex justify-center lg:justify-start mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-full max-w-md lg:max-w-full"
                >
                  <HeroHeartbeat compact />
                </motion.div>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-foreground mb-3 text-center lg:text-left leading-tight">
                Artificial Intelligence for{" "}
                <span className="text-gradient-primary">Monitoring Hormonal,</span>
                <br />
                <span className="text-xl sm:text-2xl lg:text-3xl">Endocrine & Reproductive Health</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base text-center lg:text-left">
                The AI-Driven Multi-Source Health Measurement System (AI-MSHM) is a clinical-grade, 
                software-as-a-medical-device (SaMD) diagnostic platform engineered to provide 
                early detection, risk stratification, and digital triage for Polycystic Ovary Syndrome (PCOS).
              </p>
            </motion.div>

            {/* Conditions Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevCondition} className="p-2 rounded-full hover:bg-muted transition-colors">
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
                <button onClick={nextCondition} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex justify-center gap-2">
                {conditions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentCondition(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === currentCondition ? 'bg-primary' : 'bg-muted'}`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col items-center text-center"
                >
                  <div className="text-4xl mb-3">{f.image}</div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Actions & Portals */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4"
            >
              <h2 className="text-lg font-semibold">Get Started</h2>
              
              <Button variant="clinical" size="xl" className="w-full" onClick={() => navigate("/signup")}>
                Create Patient Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
              </div>
              
              <Button variant="outline-clinical" size="lg" className="w-full" onClick={() => navigate("/login")}>
                I already have an account
              </Button>
            </motion.div>

            {/* Staff Portals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card rounded-xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Staff Portals</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => navigate("/clinician/login")} className="h-auto py-3">
                  <div className="flex flex-col items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium">Clinician</span>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => navigate("/phc/login")} className="h-auto py-3">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium">PHC</span>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => navigate("/fmc/login")} className="h-auto py-3">
                  <div className="flex flex-col items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-600" />
                    <span className="text-xs font-medium">FMC</span>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => setShowPortalSelector(true)} className="h-auto py-3 border-primary/50 bg-primary/5">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-medium">All Portals</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Portal Selector Modal */}
      <AnimatePresence>
        {showPortalSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPortalSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Select Healthcare Portal</h2>
                <button onClick={() => setShowPortalSelector(false)} className="p-2 hover:bg-muted rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="flex flex-wrap gap-2 mb-4">
                  {PORTAL_OPTIONS.map((sector) => (
                    <button
                      key={sector.sectorKey}
                      onClick={() => handleSectorChange(sector.sectorKey)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedSector === sector.sectorKey ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {sector.sector}
                    </button>
                  ))}
                </div>

                {selectedSector && selectedSectorData ? (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedSectorData.subSectors.map((portal) => (
                      <button
                        key={portal.key}
                        onClick={() => handlePortalSelect(portal)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${getColorClasses(portal.color)}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getIconBgClass(portal.color)} rounded-full flex items-center justify-center`}>
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{portal.name}</p>
                            <p className="text-xs text-muted-foreground">Click to login</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Select a sector to view available portals</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PORTAL_OPTIONS.slice(0, 3).map((sector) => (
                        <button
                          key={sector.sectorKey}
                          onClick={() => handleSectorChange(sector.sectorKey)}
                          className="p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
                        >
                          {sector.sector.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeScreen;