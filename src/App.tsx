import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "./pages/SplashScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import SignUpScreen from "./pages/SignUpScreen";
import LoginScreen from "./pages/LoginScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import VerifyEmailScreen from "./pages/VerifyEmailScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import OnboardingComplete from "./pages/OnboardingComplete";
import DashboardScreen from "./pages/DashboardScreen";
import MorningCheckIn from "./pages/MorningCheckIn";
import EveningCheckIn from "./pages/EveningCheckIn";
import PeriodLogging from "./pages/PeriodLogging";
import CycleHistory from "./pages/CycleHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/verify-email" element={<VerifyEmailScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/onboarding-complete" element={<OnboardingComplete />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/check-in/morning" element={<MorningCheckIn />} />
          <Route path="/check-in/evening" element={<EveningCheckIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
