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
import HirsutismScoring from "./pages/HirsutismScoring";
import PHQ4Assessment from "./pages/PHQ4Assessment";
import WeeklyToolsScreen from "./pages/WeeklyToolsScreen";
import LabResultsUpload from "./pages/LabResultsUpload";
import UltrasoundUpload from "./pages/UltrasoundUpload";
import ClinicalDataStatus from "./pages/ClinicalDataStatus";
import PCOSRiskScore from "./pages/PCOSRiskScore";
import RiskScoreTrend from "./pages/RiskScoreTrend";
import SHAPExplanationDetail from "./pages/SHAPExplanationDetail";
import TriageWithoutLabs from "./pages/TriageWithoutLabs";
import NotFound from "./pages/NotFound";
// Profile & Settings
import MyProfileScreen from "./pages/MyProfileScreen";
import NotificationSettingsScreen from "./pages/NotificationSettingsScreen";
import DataPrivacyScreen from "./pages/DataPrivacyScreen";
import ConnectedDevicesScreen from "./pages/ConnectedDevicesScreen";
// Referral & Clinical
import ClinicalReferralScreen from "./pages/ClinicalReferralScreen";
import ClinicalSummaryScreen from "./pages/ClinicalSummaryScreen";
// Clinician Portal
import ClinicianLoginScreen from "./pages/ClinicianLoginScreen";
import PatientPanelScreen from "./pages/PatientPanelScreen";
import PatientDetailScreen from "./pages/PatientDetailScreen";
import ClinicianExportScreen from "./pages/ClinicianExportScreen";

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
          <Route path="/period-logging" element={<PeriodLogging />} />
          <Route path="/cycle-history" element={<CycleHistory />} />
          <Route path="/hirsutism" element={<HirsutismScoring />} />
          <Route path="/phq4" element={<PHQ4Assessment />} />
          <Route path="/weekly-tools" element={<WeeklyToolsScreen />} />
          <Route path="/lab-results" element={<LabResultsUpload />} />
          <Route path="/ultrasound-upload" element={<UltrasoundUpload />} />
          <Route path="/clinical-status" element={<ClinicalDataStatus />} />
          <Route path="/risk-score" element={<PCOSRiskScore />} />
          <Route path="/risk-trend" element={<RiskScoreTrend />} />
          <Route path="/shap-detail" element={<SHAPExplanationDetail />} />
          <Route path="/triage-no-labs" element={<TriageWithoutLabs />} />
          {/* Profile & Settings */}
          <Route path="/profile" element={<MyProfileScreen />} />
          <Route path="/settings/notifications" element={<NotificationSettingsScreen />} />
          <Route path="/settings/privacy" element={<DataPrivacyScreen />} />
          <Route path="/settings/devices" element={<ConnectedDevicesScreen />} />
          {/* Referral & Clinical */}
          <Route path="/referral" element={<ClinicalReferralScreen />} />
          <Route path="/clinical-summary" element={<ClinicalSummaryScreen />} />
          {/* Clinician Portal */}
          <Route path="/clinician/login" element={<ClinicianLoginScreen />} />
          <Route path="/clinician/patients" element={<PatientPanelScreen />} />
          <Route path="/clinician/patient/:id" element={<PatientDetailScreen />} />
          <Route path="/clinician/patient/:id/export" element={<ClinicianExportScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
