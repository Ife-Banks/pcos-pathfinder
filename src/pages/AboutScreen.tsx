import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Target, Heart, Award, Globe, Shield, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";
import aimherLogo from "@/assets/AIMHER trademark  only.png";
import healthLogo from "@/assets/Health  Trademark only-1.png";

const teamMembers = [
  {
    name: "Dr. Adaeze Okonkwo",
    role: "Chief Medical Officer",
    bio: "Leading our clinical strategy with over 15 years of experience in endocrinology and women's health.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
  },
  {
    name: "Dr. Emeka Nwosu",
    role: "Chief Technology Officer",
    bio: "Driving AI innovation with expertise in machine learning and health technology solutions.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop"
  },
  {
    name: "Dr. Fatimah Al-Hassan",
    role: "Head of Research",
    bio: "Pioneering PCOS and MAMH research with published work in leading medical journals.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop"
  },
  {
    name: "Mr. Chidi Okafor",
    role: "Chief Executive Officer",
    bio: "Building the future of digital health with a focus on accessible healthcare for all.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"
  },
];

const milestones = [
  { year: "2022", title: "Company Founded", desc: "AIMHER Health was established to address critical gaps in hormonal health diagnostics." },
  { year: "2023", title: "AI-MSHM Launch", desc: "Our core AI diagnostic platform received clinical validation and first major partnership." },
  { year: "2024", title: "PHC Network", desc: "Expanded to Primary Healthcare Centres across Nigeria, reaching underserved communities." },
  { year: "2025", title: "National Expansion", desc: "Growing our network to serve more healthcare facilities and patients nationwide." },
];

const values = [
  { icon: Heart, title: "Patient-Centered", desc: "Every decision we make prioritizes the health and well-being of patients." },
  { icon: Shield, title: "Clinical Excellence", desc: "We maintain the highest standards of medical accuracy and safety." },
  { icon: Globe, title: "Accessibility", desc: "Bringing quality healthcare to everyone, regardless of location." },
  { icon: Award, title: "Innovation", desc: "Continuously advancing our AI technology to improve diagnosis accuracy." },
];

const AboutScreen = () => {
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-20">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-gray-900 mb-6">
              About AIMHER Health
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Empowering healthcare providers and patients with AI-driven diagnostics for hormonal, endocrine, and reproductive health.
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We are dedicated to improving the lives of individuals affected by Polyendocrine Metabolic Ovarian Syndrome (PMOS) and Metabolic-Associated Male Hypogonadism (MAMH) through innovative technology and clinical excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-teal-50 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To provide accessible, accurate, and early diagnosis of hormonal and metabolic disorders through AI-powered clinical decision support systems, empowering healthcare providers to deliver better patient outcomes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-emerald-50 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A world where every individual has access to early detection and proper management of hormonal disorders, particularly PMOS and MAMH, reducing the burden of these conditions on families and healthcare systems.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-3xl font-bold font-display text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm text-center"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-3xl font-bold font-display text-gray-900 text-center mb-12">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, i) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-6"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{milestone.year}</span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-3xl font-bold font-display text-gray-900 text-center mb-4">Meet Our Team</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Dedicated professionals working together to transform hormonal health diagnostics
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-teal-600 mb-2">{member.role}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-teal-900 text-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-3xl font-bold font-display text-center mb-12">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-teal-200">hello@aimherhealth.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-teal-200">+234 812 345 6789</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Visit Us</h3>
                <p className="text-teal-200">Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-950 text-white py-8">
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

export default AboutScreen;