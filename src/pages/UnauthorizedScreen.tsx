import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldX } from 'lucide-react';
import logo from '@/assets/logo.png';

const UnauthorizedScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo */}
          <motion.img
            src={logo}
            alt="AI-MSHM"
            className="w-16 h-16 mx-auto mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />

          {/* Error Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShieldX className="h-10 w-10 text-red-600" />
          </motion.div>

          {/* Error Message */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-2xl font-bold text-[#1E1E2E] mb-4"
          >
            Access Restricted
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-600 mb-8 leading-relaxed"
          >
            This portal is for Primary Health Centre staff only.
            <br />
            Please contact your administrator if you believe this is an error.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-3"
          >
            <Button
              onClick={() => navigate("/welcome")}
              className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Role Selection
            </Button>
            
            <button
              onClick={() => navigate("/phc/login")}
              className="w-full text-sm text-gray-600 hover:text-[#2E8B57] transition-colors"
            >
              Try Different Login
            </button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-xs text-gray-500 mt-8"
          >
            AI-MSHM v2.0 — Secure Access Control
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default UnauthorizedScreen;
