import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Briefcase, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";
import aimherLogo from "@/assets/AIMHER trademark  only.png";
import healthLogo from "@/assets/Health  Trademark only-1.png";

const openPositions = [
  {
    id: 1,
    title: "Senior AI/ML Engineer",
    department: "Engineering",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Build and improve our AI diagnostic models for hormonal health analysis.",
  },
  {
    id: 2,
    title: "Medical Data Scientist",
    department: "Research",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Analyze clinical data to improve diagnostic accuracy and patient outcomes.",
  },
  {
    id: 3,
    title: "Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Create beautiful, accessible user interfaces for our health platform.",
  },
  {
    id: 4,
    title: "Product Designer",
    department: "Design",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Design intuitive user experiences for patients and healthcare providers.",
  },
  {
    id: 5,
    title: "Clinical Research Coordinator",
    department: "Research",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Coordinate clinical studies and validate AI diagnostic performance.",
  },
  {
    id: 6,
    title: "Customer Success Manager",
    department: "Operations",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Support healthcare facilities in implementing AIMHER solutions.",
  },
];

const values = [
  { icon: Heart, title: "Make an Impact", desc: "Your work will directly improve lives and healthcare outcomes." },
  { icon: Users, title: "Collaborative Culture", desc: "Work with passionate professionals dedicated to health innovation." },
  { icon: Briefcase, title: "Growth Opportunities", desc: "Develop your career with mentorship and learning programs." },
];

const CareersScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
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
      <section className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-20">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-gray-900 mb-4">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Help us transform hormonal health diagnostics and improve lives across Africa
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>50+ Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Work With Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Open Positions</h2>
          <p className="text-gray-600 text-center mb-12">Join us in making healthcare more accessible</p>
          
          <div className="space-y-4">
            {openPositions.map((position, i) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{position.title}</h3>
                      <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                        {position.department}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{position.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{position.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{position.type}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                    Apply Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
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

export default CareersScreen;