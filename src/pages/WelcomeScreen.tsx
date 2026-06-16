import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Building2, ArrowRight, Stethoscope,
  HeartPulse, Users, Shield, User, Activity, Brain, Heart, AlertTriangle,
  Droplet, Sparkles, Menu, X, ArrowUpRight
} from "lucide-react";
import { PORTAL_OPTIONS, SubSector } from "@/config/portals";
import logoImage from "@/assets/logo.png";
import HeroHeartbeat from "@/components/HeroHeartbeat";

const features = [
  { title: "Smart Monitoring", desc: "Daily health tracking with AI-powered insights", image: "📊" },
  { title: "AI Risk Analysis", desc: "Personalized PMOS & MAMH risk assessment", image: "🧠" },
  { title: "Clinically Validated", desc: "Evidence-based screening tools", image: "✅" },
];

const conditions = [
  { name: "Infertility", description: "Reproductive challenges affecting conception", icon: "🧬" },
  { name: "Dysmenorrhea", description: "Severe menstrual pain and cramping", icon: "🔴" },
  { name: "Type-2 Diabetes", description: "Metabolic complications and insulin resistance", icon: "💉" },
  { name: "PMDD", description: "Premenstrual dysphoric disorder and mood changes", icon: "🧠" },
  { name: "Cardiovascular Disease", description: "Heart health risks and circulation issues", icon: "❤️" },
  { name: "Chronic Stress & Anxiety", description: "Mental health impacts of hormonal imbalance", icon: "😰" },
  { name: "Endometrial Cancer", description: "Uterine health monitoring and cancer prevention", icon: "⚠️" },
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
  const [currentCondition, setCurrentCondition] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const { scrollY } = useScroll();

  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.95)"]
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCondition((prev) => (prev + 1) % conditions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextCondition = () => setCurrentCondition((prev) => (prev + 1) % conditions.length);
  const prevCondition = () => setCurrentCondition((prev) => (prev - 1 + conditions.length) % conditions.length);
  const handlePortalSelect = (portal: SubSector) => {
    navigate(portal.path);
  };

  const toggleSector = (sectorKey: string) => {
    setExpandedSector(expandedSector === sectorKey ? null : sectorKey);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const getConditionIcon = (icon: string) => {
    switch (icon) {
      case "🧬": return <Activity className="w-7 h-7 text-blue-600" />;
      case "🔴": return <Heart className="w-7 h-7 text-red-500" />;
      case "💉": return <Droplet className="w-7 h-7 text-purple-500" />;
      case "🧠": return <Brain className="w-7 h-7 text-pink-500" />;
      case "❤️": return <Heart className="w-7 h-7 text-red-600" />;
      case "😰": return <AlertTriangle className="w-7 h-7 text-amber-500" />;
      case "⚠️": return <AlertTriangle className="w-7 h-7 text-orange-500" />;
      default: return <Sparkles className="w-7 h-7 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Section 1: Sticky Navigation Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isNavVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{
          backgroundColor: navBackground,
          boxShadow: navShadow,
        }}
      >
        <nav className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <img src={logoImage} alt="AIMHER" className="h-8 w-auto" />
            <span className="font-bold text-lg text-primary">AIMHER Health</span>
          </motion.div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", id: "features" },
              { label: "Conditions", id: "conditions" },
              { label: "Portals", id: "portals" },
              { label: "About", id: "about" },
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ y: -1 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                  { label: "About", id: "about" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-border space-y-3">
                  <button
                    onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground"
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
        <section className="bg-white py-16 lg:py-24">
          <div className="max-w-[1100px] mx-auto px-6">
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
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  PMHRS
                </span>
                <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  MAMH (Men)
                </span>
                <span className="px-4 py-1.5 bg-pink-100 text-pink-700 text-sm font-medium rounded-full">
                  PMOS (Women)
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Artificial Intelligence for{" "}
                <span className="text-gradient-primary">Monitoring Hormonal,</span>
                <br />
                Endocrine & Reproductive Health
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-muted-foreground leading-relaxed text-base sm:text-lg max-w-3xl mx-auto mb-8"
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
                  className="min-w-[200px]"
                >
                  Sign in or already have an account
                </Button>
              </motion.div>

              {/* Hero Heartbeat Animation */}
              <motion.div
                className="max-w-[800px] mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <HeroHeartbeat compact />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: Conditions Carousel */}
        <section id="conditions" className="bg-[#F8F9FA] py-14">
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mb-6 text-center">
                Conditions We Monitor
              </p>

              {/* Carousel Navigation */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={prevCondition}
                  className="p-2 rounded-full bg-white hover:bg-muted transition-colors shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </button>

                <div className="flex gap-3 overflow-hidden">
                  {conditions.slice(currentCondition, currentCondition + 4).map((condition, idx) => (
                    <motion.div
                      key={condition.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex-shrink-0 w-[220px] bg-white rounded-xl p-5 border border-l-4 border-l-primary border-border shadow-sm"
                    >
                      <div className="mb-3">{getConditionIcon(condition.icon)}</div>
                      <h3 className="font-semibold text-foreground mb-1">{condition.name}</h3>
                      <p className="text-xs text-muted-foreground">{condition.description}</p>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={nextCondition}
                  className="p-2 rounded-full bg-white hover:bg-muted transition-colors shadow-sm"
                >
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Carousel Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {conditions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentCondition(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentCondition ? 'bg-primary w-6' : 'bg-muted w-2 hover:bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
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
              <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 text-center">
                Platform Capabilities
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground mb-10 text-center">
                Why AIMHER Health
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl p-6 border-t-4 border-t-primary border border-border shadow-sm"
                  >
                    <div className="text-5xl mb-4">{feature.image}</div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
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
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">
                  Healthcare Portals
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold font-display text-foreground mb-3">
                  Choose Your Portal
                </h2>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">
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
                              <div className={`w-10 h-10 ${sectorIconBg[sector.sectorKey]} rounded-full flex items-center justify-center flex-shrink-0 text-white`}>
                                {sectorIcons[sector.sectorKey]}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground text-sm">{sector.description}</p>
                              </div>
                              <button
                                onClick={() => toggleSector(sector.sectorKey)}
                                className="p-1 hover:bg-black/5 rounded transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
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
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <div>
                                  <p className="font-medium text-foreground text-sm">{portal.name}</p>
                                  <p className="text-xs text-muted-foreground">{portal.description}</p>
                                </div>
                                <motion.button
                                  whileHover={{ x: 3 }}
                                  onClick={() => handlePortalSelect(portal)}
                                  className="text-sm text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Login
                                  <ArrowRight className="w-3 h-3" />
                                </motion.button>
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
                              <p className="font-medium text-foreground">{sector.sector}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{sector.description}</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
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
        <section id="about" className="bg-primary py-20">
          <motion.div
            className="max-w-[1100px] mx-auto px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold font-display text-white mb-4">
              Start monitoring your health with AI today
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-lg mx-auto">
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
        <footer className="bg-white border-t border-border/50 py-8">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="AIMHER" className="h-6 w-auto" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">AIMHER Health</span> — AI-MSHM Clinical Decision Support System
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center md:text-right">
                Early detection of PMHRS (PMOS & MAMH) and associated cardiometabolic risks
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                © 2025 AIMHER Health. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;