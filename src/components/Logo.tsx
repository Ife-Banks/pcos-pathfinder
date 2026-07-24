import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import logoImage from "@/assets/logo.png";
import aimherLogo from "@/assets/AIMHER trademark  only.png";
import healthLogo from "@/assets/Health  Trademark only-1.png";

export interface LogoProps {
  variant?: "full" | "compact" | "circle" | "login" | "staff";
  className?: string;
  onClick?: () => void;
}

const Logo = ({ variant = "full", className, onClick }: LogoProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/welcome");
    }
  };

  if (variant === "circle") {
    return (
      <button
        onClick={handleClick}
        className={cn("focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full", className)}
        aria-label="Go to home"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src={logoImage}
            alt="AI-MSHM"
            className="h-10 w-10 rounded-full object-cover"
          />
        </motion.div>
      </button>
    );
  }

  if (variant === "login" || variant === "staff") {
    return (
      <button
        onClick={handleClick}
        className={cn("focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg", className)}
        aria-label="Go to home"
      >
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="logo" className="h-10 w-auto" />
          <img src={aimherLogo} alt="AIMHER" className="h-8 w-auto" />
          <img src={healthLogo} alt="Health" className="h-8 w-auto" />
        </div>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={cn("focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg", className)}
        aria-label="Go to home"
      >
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="logo" className="h-8 w-auto" />
          <img src={aimherLogo} alt="AIMHER" className="h-5 w-auto" />
          <img src={healthLogo} alt="Health" className="h-5 w-auto" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn("focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg", className)}
      aria-label="Go to home"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2"
      >
        <img src={logoImage} alt="logo" className="h-8 w-auto" />
        <img src={aimherLogo} alt="AIMHER" className="h-6 w-auto" />
        <img src={healthLogo} alt="Health" className="h-6 w-auto" />
      </motion.div>
    </button>
  );
};

export { Logo };