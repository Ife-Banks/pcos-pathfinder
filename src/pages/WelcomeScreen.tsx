import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Building2, ArrowRight, Stethoscope,
  HeartPulse, Shield, User, Sparkles, Menu, X, ArrowUpRight, Phone, MapPin,
  Linkedin, Facebook, Instagram, Dna, Zap, Droplets, Brain, Heart, Wind, AlertTriangle
} from "lucide-react";
import { PORTAL_OPTIONS, SubSector } from "@/config/portals";
import logoImage from "@/assets/logo.png";
import aimherLogo from "@/assets/AIMHER trademark  only.png";
import healthLogo from "@/assets/Health  Trademark only-1.png";
import HeroHeartbeat from "@/components/HeroHeartbeat";
import heroHealthImage from "@/assets/hero-health.png";
import monitoringImage from "@/assets/monitoring.png";
import aiAnalysisImage from "@/assets/ai-analysis.png";
import labImage from "@/assets/lab.png";
import wellnessImage from "@/assets/wellness.png";
import endometrialCancerImage from "@/assets/endomentral cancer.png";
import diagnosticPathwayImage from "@/assets/Diagnostic pathway.jpg";
import structuredClinicalImage from "@/assets/Structured clinical summaries.webp";
import passiveActiveImage from "@/assets/Passive, active & clinical data streams unified in one platform.jpg";

const featureSVGs: Record<string, ReactNode> = {
  triage: (
    <svg viewBox="0 0 80 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="#f0fdfa"/>
      <rect x="10" y="35" width="60" height="8" rx="4" fill="#0d9488"/>
      <rect x="20" y="22" width="40" height="8" rx="4" fill="#14b8a6"/>
      <rect x="28" y="48" width="24" height="8" rx="4" fill="#5eead4"/>
      <circle cx="40" cy="62" r="5" fill="#0f766e"/>
      <path d="M35 62 L40 57 L45 62" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  cdss: (
    <svg viewBox="0 0 80 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="#f0fdfa"/>
      <rect x="12" y="15" width="56" height="50" rx="6" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.5"/>
      <rect x="20" y="25" width="40" height="4" rx="2" fill="#0d9488"/>
      <rect x="20" y="33" width="30" height="3" rx="1.5" fill="#5eead4"/>
      <rect x="20" y="40" width="35" height="3" rx="1.5" fill="#5eead4"/>
      <rect x="20" y="47" width="25" height="3" rx="1.5" fill="#5eead4"/>
      <circle cx="58" cy="58" r="8" fill="#0f766e"/>
      <path d="M54 58 L57 61 L62 55" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  multisource: (
    <svg viewBox="0 0 80 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="#f0fdfa"/>
      <circle cx="40" cy="40" r="10" fill="#0d9488"/>
      <circle cx="15" cy="20" r="7" fill="#14b8a6"/>
      <circle cx="65" cy="20" r="7" fill="#14b8a6"/>
      <circle cx="15" cy="60" r="7" fill="#14b8a6"/>
      <circle cx="65" cy="60" r="7" fill="#14b8a6"/>
      <line x1="22" y1="24" x2="33" y2="33" stroke="#5eead4" strokeWidth="1.5"/>
      <line x1="58" y1="24" x2="47" y2="33" stroke="#5eead4" strokeWidth="1.5"/>
      <line x1="22" y1="56" x2="33" y2="47" stroke="#5eead4" strokeWidth="1.5"/>
      <line x1="58" y1="56" x2="47" y2="47" stroke="#5eead4" strokeWidth="1.5"/>
      <circle cx="15" cy="20" r="3" fill="#fff"/>
      <circle cx="65" cy="20" r="3" fill="#fff"/>
      <circle cx="15" cy="60" r="3" fill="#fff"/>
      <circle cx="65" cy="60" r="3" fill="#fff"/>
    </svg>
  ),
};

const features = [
  { title: "Smart Monitoring", desc: "Daily health tracking via wearables, smartphones & user inputs", image: monitoringImage, svg: null },
  { title: "AI Risk Analysis", desc: "Personalized PMOS & MAMH risk scoring with SHAP explainability", image: aiAnalysisImage, svg: null },
  { title: "Clinically Validated", desc: "Evidence-based screening with lab, ultrasound & EHR integration", image: labImage, svg: null },
  { title: "Digital Triage", desc: "Diagnostic pathway operative even without laboratory data", image: diagnosticPathwayImage, svg: null },
  { title: "Clinical Decision Support", desc: "Structured clinical summaries with HL7 FHIR-compatible exports", image: structuredClinicalImage, svg: null },
  { title: "Multi-Source Integration", desc: "Passive, active & clinical data streams unified in one platform", image: passiveActiveImage, svg: null },
];

const conditions = [
  { name: "Infertility", description: "Reproductive challenges affecting conception", icon: <Dna className="w-7 h-7 text-orange-500" /> },
  { name: "Dysmenorrhea", description: "Severe menstrual pain and cramping", icon: <Zap className="w-7 h-7 text-red-500" /> },
  { name: "Type-2 Diabetes", description: "Metabolic complications and insulin resistance", icon: <Droplets className="w-7 h-7 text-blue-500" /> },
  { name: "PMDD", description: "Premenstrual dysphoric disorder and mood changes", icon: <Brain className="w-7 h-7 text-purple-500" /> },
  { name: "Cardiovascular Disease", description: "Heart health risks and circulation issues", icon: <Heart className="w-7 h-7 text-red-600" /> },
  { name: "Chronic Stress & Anxiety", description: "Mental health impacts of hormonal imbalance", icon: <Wind className="w-7 h-7 text-amber-500" /> },
  { name: "Endometrial Cancer", description: "Uterine health monitoring and cancer prevention", icon: <img src={endometrialCancerImage} alt="Endometrial Cancer" className="w-11 h-11 object-contain bg-white rounded-full p-1" /> },
];


const sectorIcons: Record<string, ReactNode> = {
  admin: <Shield className="w-5 h-5" />,
  government: <Building2 className="w-5 h-5" />,
  hmo: <HeartPulse className="w-5 h-5" />,
  private: <Stethoscope className="w-5 h-5" />,
  patient: <User className="w-5 h-5" />,
};

const sectorColors: Record<string, string> = {
  admin: "from-slate-50 to-gray-50 border-slate-200 hover:border-slate-400",
  government: "from-green-50 to-emerald-50 border-green-200 hover:border-green-400",
  hmo: "from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400",
  private: "from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400",
  patient: "from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-400",
};

const sectorIconBg: Record<string, string> = {
  admin: "bg-slate-600",
  government: "bg-green-600",
  hmo: "bg-blue-600",
  private: "bg-orange-600",
  patient: "bg-teal-600",
};

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const savedScrollY = sessionStorage.getItem("welcomeScrollY");
      if (savedScrollY) {
        window.scrollTo(0, parseInt(savedScrollY, 10));
      }
      return;
    }
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.setItem("welcomeScrollY", window.scrollY.toString());
    };
  }, []);

  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]
  );

  const navShadow = useTransform(
    scrollY,
    [0, 100],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 20px rgba(0,0,0,0.1)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handlePortalSelect = (portal: SubSector) => {
    navigate(portal.path);
  };

  const toggleSector = (sectorKey: string) => {
    setExpandedSector(expandedSector === sectorKey ? null : sectorKey);
  };

  const scrollMarquee = (direction: "left" | "right") => {
    if (marqueeRef.current) {
      const scrollAmount = 240;
      marqueeRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Section 1: Sticky Navigation Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isNavVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl border-b border-white/50 shadow-sm"
        style={{
          boxShadow: navShadow,
          background: navBackground,
        }}
      >
        <nav className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <img src={logoImage} alt="logo" className="h-8 w-auto" />
            <img src={aimherLogo} alt="AIMHER" className="h-6 w-auto" />
            <img src={healthLogo} alt="Health" className="h-6 w-auto" />
          </motion.div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", id: "features" },
              { label: "Conditions", id: "conditions" },
              { label: "Portals", id: "portals" },
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-white hover:text-primary transition-colors"
                whileHover={{ y: -1 }}
              >
                {item.label}
              </motion.button>
            ))}
            <motion.button
              onClick={() => navigate("/about")}
              className="text-sm font-medium text-white hover:text-primary transition-colors"
              whileHover={{ y: -1 }}
            >
              About
            </motion.button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-white hover:text-primary transition-colors"
              whileHover={{ x: 2 }}
            >
              Sign In
            </motion.button>
            <Button
              size="sm"
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90"
            >
              Create Account
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg"
            >
              <div className="max-w-[1100px] mx-auto px-6 py-4 space-y-4">
                {[
                  { label: "Features", id: "features" },
                  { label: "Conditions", id: "conditions" },
                  { label: "Portals", id: "portals" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { scrollToSection(item.id); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { navigate("/about"); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-white"
                >
                  About
                </button>
                <div className="pt-4 border-t border-border space-y-3">
                  <button
                    onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left py-2 text-sm font-medium text-gray-700"
                  >
                    Sign In
                  </button>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => { navigate("/signup"); setIsMobileMenuOpen(false); }}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content - Scrollable sections */}
      <div className="pt-16">
        {/* Section 2: Hero Section */}
        <section className="relative bg-[#1a1a1a] -mt-16 pt-16 pb-20 lg:pt-16 lg:pb-32 overflow-hidden min-h-[500px] lg:min-h-[600px]">
          {/* Hero background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroHealthImage}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          
          {/* Content overlay */}
          <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-6 lg:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              {/* PMHRS Badges */}
              <motion.div
                className="flex flex-wrap justify-center gap-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="px-4 py-1.5 bg-primary/20 text-primary text-sm font-medium rounded-full backdrop-blur-sm">
                  PMHRS
                </span>
                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full backdrop-blur-sm">
                  MAMH (Men)
                </span>
                <span className="px-4 py-1.5 bg-pink-500/20 text-pink-300 text-sm font-medium rounded-full backdrop-blur-sm">
                  PMOS (Women)
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Artificial Intelligence for{" "}
                <br />
                <span className="text-[#1aff8c]">Monitoring Hormonal,</span>{" "}
                <br />      
                Endocrine & Reproductive Health
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-gray-300 leading-relaxed text-base sm:text-lg max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                The AI-Driven Multi-Source Health Measurement System (AI-MSHM) is a clinical-grade,
                software-as-a-medical-device (SaMD) diagnostic platform engineered to provide
                early detection, risk stratification, and digital triage for Polyendocrine Metabolic
                Ovarian Syndrome (PMOS) and Metabolic-Associated Male Hypogonadism (MAMH).
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="clinical"
                  size="xl"
                  onClick={() => navigate("/signup")}
                  className="min-w-[200px]"
                >
                  Create Patient Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline-clinical"
                  size="xl"
                  onClick={() => navigate("/login")}
                  className="min-w-[200px] border-white text-white hover:bg-white/10"
                >
                  Sign in or already have an account
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Heartbeat Section */}
        <section className="bg-white py-8">
          <div className="max-w-[1100px] mx-auto px-6">
            <HeroHeartbeat />
          </div>
        </section>

        {/* Trust Indicators: Conditions We Monitor - Marquee Animation */}
        <section id="conditions" className="bg-white py-10 border-y border-gray-200 overflow-hidden">
          <p className="text-xl uppercase tracking-[0.2em] text-black font-bold mb-8 text-center">
            Conditions We Monitor
          </p>
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => scrollMarquee("left")}
                className="flex-shrink-0 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div
                ref={marqueeRef}
                className="relative overflow-x-auto scrollbar-hide"
              >
                <div className="flex gap-6 animate-marquee">
                  {[...conditions, ...conditions].map((condition, idx) => (
                    <div
                      key={`${condition.name}-${idx}`}
                      className="flex-shrink-0 w-[220px] bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="mb-3">{condition.icon}</div>
                      <h3 className="font-extrabold text-black text-lg mb-1">{condition.name}</h3>
                      <p className="text-base text-gray-900 text-bold leading-relaxed">{condition.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => scrollMarquee("right")}
                className="flex-shrink-0 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </section>

        
        {/* Section 4: Three Feature Blocks */}
        <section id="features" className="bg-white py-14">
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-black font-bold mb-2 text-center">
                Platform Capabilities
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold font-display text-black mb-10 text-center">
                Why AIMHER Health
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl p-4 border-t-2 border-t-primary border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full max-w-[280px]"
                  >
                    <div className="w-full h-32 mb-2 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                      {feature.image ? (
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full">
                          {featureSVGs[feature.svg!]}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1">{feature.title}</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 5: Healthcare Portals Grid */}
        <section id="portals" className="bg-[#F8F9FA] py-14">
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-back font-bold mb-2">
                  Healthcare Portals
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold font-display text-black mb-3">
                  Choose Your Portal
                </h2>
                <p className="text-gray-700 text-sm max-w-2xl mx-auto text-center">
                  Access role-specific features and dashboards tailored to your healthcare setting
                </p>
              </div>

              <div className="space-y-4">
                {PORTAL_OPTIONS.map((sector, index) => (
                  <motion.div
                    key={sector.sectorKey}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <AnimatePresence mode="wait">
                      {expandedSector === sector.sectorKey ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div
                            className={`p-4 rounded-xl border-2 mb-2 bg-gradient-to-br ${sectorColors[sector.sectorKey]}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 ${sectorIconBg[sector.sectorKey]} rounded-full flex items-center justify-center flex-shrink-0 text-black`}>
                                {sectorIcons[sector.sectorKey]}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-black text-sm">{sector.description}</p>
                              </div>
                              <button
                                onClick={() => toggleSector(sector.sectorKey)}
                                className="p-1 hover:bg-black/5 rounded transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-black-400" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 pl-4 border-l-2 border-muted ml-5">
                            {sector.subSectors.map((portal) => (
                              <motion.div
                                key={portal.key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => handlePortalSelect(portal)}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <div>
                                  <p className="font-medium text-black text-sm">{portal.name}</p>
                                  <p className="text-xs text-black-400">{portal.description}</p>
                                </div>
                                <motion.div
                                  whileHover={{ x: 3 }}
                                  className="text-sm text-primary font-medium flex items-center gap-1"
                                >
                                  Login
                                  <ArrowRight className="w-3 h-3" />
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => toggleSector(sector.sectorKey)}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                          className={`w-full p-4 rounded-xl border-2 bg-gradient-to-br ${sectorColors[sector.sectorKey]} transition-all hover:shadow-md`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${sectorIconBg[sector.sectorKey]} rounded-full flex items-center justify-center flex-shrink-0 text-white`}>
                              {sectorIcons[sector.sectorKey]}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-black">{sector.sector}</p>
                              <p className="text-xs text-black-400 line-clamp-1">{sector.description}</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 6: Get Started CTA Band */}
        <section id="about" className="bg-primary py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={wellnessImage}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <motion.div
            className="relative z-10 max-w-[1100px] mx-auto px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold font-display text-white mb-4">
              Start monitoring your health with AI today
            </h2>
            <p className="text-white/80 text-base mb-8 whitespace-nowrap mx-auto">
              Create your patient account in minutes. No wearable required to get started.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="xl"
                onClick={() => navigate("/signup")}
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
              >
                Create Patient Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Section 7: Footer */}
        <footer className="bg-teal-900 text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Column 1: Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4 bg-white rounded-xl px-3 py-2 w-fit">
                  <img src={logoImage} alt="logo" className="h-8 w-auto" />
                  <img src={aimherLogo} alt="AIMHER" className="h-6 w-auto" />
                  <img src={healthLogo} alt="Health" className="h-6 w-auto" />
                </div>
                <p className="text-teal-200 text-base mb-6 leading-relaxed">
                  AI-MSHM Clinical Decision Support System for early detection of PMHRS (PMOS & MAMH) and associated cardiometabolic risks.
                </p>
                <div className="flex items-center gap-4">
                  <motion.a
                    href="#"
                    whileHover={{ y: -2 }}
                    className="p-2 bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ y: -2 }}
                    className="p-2 bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ y: -2 }}
                    className="p-2 bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ y: -2 }}
                    className="p-2 bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>

              {/* Column 2: Platform */}
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-teal-300">Platform</h4>
                <ul className="space-y-3">
                  {[
                    { label: "Features", action: () => scrollToSection("features") },
                    { label: "Conditions", action: () => scrollToSection("conditions") },
                    { label: "Portals", action: () => scrollToSection("portals") },
                    { label: "FAQ", action: () => navigate("/faq") },
                  ].map((link) => (
                    <li key={link.label}>
                      <motion.button
                        onClick={link.action}
                        whileHover={{ x: 4 }}
                        className="text-teal-100 hover:text-white text-base transition-colors flex items-center gap-2"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {link.label}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Company */}
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-teal-300">Company</h4>
                <ul className="space-y-3">
                  {[
                    { label: "About Us", action: () => navigate("/about") },
                    { label: "Blog", action: () => navigate("/blog") },
                    { label: "Careers", action: () => navigate("/careers") },
                    { label: "Contact Us", action: () => navigate("/contact") },
                  ].map((link) => (
                    <li key={link.label}>
                      <motion.button
                        onClick={link.action}
                        whileHover={{ x: 4 }}
                        className="text-teal-100 hover:text-white text-base transition-colors flex items-center gap-2"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {link.label}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Connect */}
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-teal-300">Stay Updated</h4>
                <p className="text-teal-200 text-base mb-4">
                  Get the latest AI health insights and updates
                </p>
                <div className="flex gap-2 mb-6">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-lg bg-teal-800 border border-teal-700 text-white placeholder-teal-400 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <Button size="sm" className="bg-white text-teal-900 hover:bg-teal-100">
                    Subscribe
                  </Button>
                </div>
                <div className="space-y-3 text-base text-teal-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>hello@aimherhealth.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+234 812 942 4692</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>Lagos, Nigeria</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-8 border-t border-teal-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-teal-400 text-base" >
                  &copy; 2025 AIMHER Health. All rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  {["Privacy Policy", "Terms of Use", "Cookie Notice"].map((link) => (
                    <motion.a
                      key={link}
                      href="#"
                      whileHover={{ y: -1 }}
                      className="text-teal-400 hover:text-white transition-colors"
                    >
                      {link}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;
