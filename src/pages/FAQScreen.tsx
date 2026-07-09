import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";
import aimherLogo from "@/assets/AIMHER trademark  only.png";
import healthLogo from "@/assets/Health  Trademark only-1.png";

const faqData = [
  {
    category: "General",
    questions: [
      {
        q: "What is AIMHER Health?",
        a: "AIMHER Health is an AI-driven multi-source health measurement system (AI-MSHM) designed to provide early detection, risk stratification, and digital triage for Polyendocrine Metabolic Ovarian Syndrome (PMOS) and Metabolic-Associated Male Hypogonadism (MAMH)."
      },
      {
        q: "What is AI-MSHM?",
        a: "AI-MSHM (Artificial Intelligence Multi-Source Health Measurement) is our clinical-grade, software-as-a-medical-device (SaMD) diagnostic platform that uses advanced algorithms to analyze multiple health data sources for accurate diagnosis."
      },
      {
        q: "Is AIMHER Health a replacement for doctor visits?",
        a: "No, AIMHER Health is designed to support and enhance healthcare delivery, not replace professional medical advice. Always consult with a healthcare provider for medical decisions."
      },
    ]
  },
  {
    category: "PMOS (Women)",
    questions: [
      {
        q: "What is PMOS?",
        a: "Polyendocrine Metabolic Ovarian Syndrome (PMOS) is a complex hormonal disorder affecting women, often characterized by irregular menstrual cycles, metabolic dysfunction, and reproductive challenges."
      },
      {
        q: "How does AIMHER help with PMOS diagnosis?",
        a: "Our AI analyzes various health indicators including physical measurements, skin changes, menstrual history, and other clinical data to provide risk assessment and early detection of PMOS."
      },
      {
        q: "What symptoms should I look out for?",
        a: "Common symptoms include irregular periods, weight changes, acne, hirsutism, difficulty conceiving, and metabolic changes. However, many women may not experience all symptoms."
      },
    ]
  },
  {
    category: "MAMH (Men)",
    questions: [
      {
        q: "What is MAMH?",
        a: "Metabolic-Associated Male Hypogonadism (MAMH) is a condition affecting men characterized by low testosterone levels combined with metabolic dysfunction."
      },
      {
        q: "Who is at risk for MAMH?",
        a: "Men with obesity, type-2 diabetes, metabolic syndrome, or those experiencing fatigue, reduced libido, and mood changes may be at risk."
      },
    ]
  },
  {
    category: "Data & Privacy",
    questions: [
      {
        q: "Is my health data secure?",
        a: "Yes, we take data security seriously. All health data is encrypted and handled in compliance with healthcare privacy regulations. We never share your personal health information without consent."
      },
      {
        q: "What data does AIMHER collect?",
        a: "We collect health metrics you provide during onboarding and check-ins, including physical measurements, symptom information, and wearable data if connected. You control what you share."
      },
    ]
  },
  {
    category: "Using AIMHER",
    questions: [
      {
        q: "How do I get started?",
        a: "Download the app, create an account, and complete the onboarding process. The onboarding takes about 10-15 minutes and includes basic health assessments."
      },
      {
        q: "Do I need a wearable device?",
        a: "No, you can use AIMHER Health without any wearable device. While wearables can provide additional data, they are optional for core functionality."
      },
      {
        q: "Is there a cost to use AIMHER?",
        a: "AIMHER Health offers both free and premium tiers. Basic features are free, with advanced features available through our subscription plans."
      },
    ]
  },
];

const FAQScreen = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenItems(newOpen);
  };

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="logo" className="h-8 w-auto" />
            <img src={aimherLogo} alt="AIMHER" className="h-6 w-auto" />
            <img src={healthLogo} alt="Health" className="h-6 w-auto" />
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/welcome")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-16">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions about AIMHER Health
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-[900px] mx-auto px-6">
          {filteredFaq.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, i) => {
                  const itemId = `${category.category}-${i}`;
                  const isOpen = openItems.has(itemId);
                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                        <div className={`flex-shrink-0 p-1 rounded-full transition-colors ${isOpen ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 pt-0 text-gray-600 leading-relaxed">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFaq.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-teal-600 hover:underline mt-2"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-teal-50">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <Button
            onClick={() => navigate("/contact")}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Contact Us
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-900 text-white py-8">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logoImage} alt="logo" className="h-6 w-auto" />
            <img src={aimherLogo} alt="AIMHER" className="h-4 w-auto" />
            <img src={healthLogo} alt="Health" className="h-4 w-auto" />
          </div>
          <p className="text-teal-400 text-sm">
            © 2025 AIMHER Health. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FAQScreen;