import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ToastProvider, ToastContainer } from "@/context/ToastContext";
import SplashScreen from "./pages/SplashScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import SignUpScreen from "./pages/SignUpScreen";
import LoginScreen from "./pages/LoginScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import ResetPasswordScreen from "./pages/ResetPasswordScreen";
import VerifyEmailScreen from "./pages/VerifyEmailScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import OnboardingComplete from "./pages/OnboardingComplete";
import DashboardScreen from "./pages/DashboardScreen";
// Onboarding step screens
import Step1PersonalInfo from "./pages/onboarding/Step1PersonalInfo";
import Step2PhysicalMeasurements from "./pages/onboarding/Step2PhysicalMeasurements";
import Step3SkinChanges from "./pages/onboarding/Step3SkinChanges";
import Step4MenstrualHistory from "./pages/onboarding/Step4MenstrualHistory";
import Step5WearableSetup from "./pages/onboarding/Step5WearableSetup";
import Step6rPPG from "./pages/onboarding/Step6rPPG";
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
import UnauthorizedScreen from "./pages/UnauthorizedScreen";
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
// PHC Portal
import PHCLoginScreen from "./pages/phc/PHCLoginScreen";
import PHCDashboardScreen from "./pages/phc/PHCDashboardScreen";
import PHCRegisterScreen from "./pages/phc/PHCRegisterScreen";
import PHCPatientDetailScreen from "./pages/phc/PHCPatientDetailScreen";
import PHCAdviceScreen from "./pages/phc/PHCAdviceScreen";
import PHCReferScreen from "./pages/phc/PHCReferScreen";
// FMC Portal
import FMCLoginScreen from "./pages/fmc/FMCLoginScreen";
import FMCDashboardScreen from "./pages/fmc/FMCDashboardScreen";
import FMCPatientDetailScreen from "./pages/fmc/FMCPatientDetailScreen";
import FMCAssignmentScreen from "./pages/fmc/FMCAssignmentScreen";
import FMCDiagnosticsScreen from "./pages/fmc/FMCDiagnosticsScreen";

const queryClient = new QueryClient();

const App = () => {
  // Handle toast events from axios interceptor
  React.useEffect(() => {
    const handleShowToast = (event: any) => {
      const { message, type } = event.detail;
      // Use the toast system when available
      console.log('Toast event:', { message, type });
    };

    window.addEventListener('show-toast', handleShowToast);
    
    return () => {
      window.removeEventListener('show-toast', handleShowToast);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <OnboardingProvider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <ToastContainer />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/welcome" element={<WelcomeScreen />} />
                    <Route path="/signup" element={<SignUpScreen />} />
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                    <Route path="/reset-password" element={<ResetPasswordScreen />} />
                    <Route path="/verify-email" element={<VerifyEmailScreen />} />
                    <Route path="/onboarding" element={<OnboardingScreen />} />
                    <Route path="/onboarding/step/1" element={<Step1PersonalInfo />} />
                    <Route path="/onboarding/step/2" element={<Step2PhysicalMeasurements />} />
                    <Route path="/onboarding/step/3" element={<Step3SkinChanges />} />
                    <Route path="/onboarding/step/4" element={<Step4MenstrualHistory />} />
                    <Route path="/onboarding/step/5" element={<Step5WearableSetup />} />
                    <Route path="/onboarding/step/6" element={<Step6rPPG />} />
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
                    {/* PHC Portal */}
                    <Route path="/phc/login" element={<PHCLoginScreen />} />
                    <Route path="/phc/dashboard" element={<PHCDashboardScreen />} />
                    <Route path="/phc/register" element={<PHCRegisterScreen />} />
                    <Route path="/phc/patients/:id" element={<PHCPatientDetailScreen />} />
                    <Route path="/phc/advice" element={<PHCAdviceScreen />} />
                    <Route path="/phc/refer" element={<PHCReferScreen />} />
                    <Route path="/phc/refer/:id" element={<PHCReferScreen />} />
                    {/* FMC Portal */}
                    <Route path="/fmc/login" element={<FMCLoginScreen />} />
                    <Route path="/fmc/dashboard" element={<FMCDashboardScreen />} />
                    <Route path="/fmc/patients/:id" element={<FMCPatientDetailScreen />} />
                    <Route path="/fmc/assignment" element={<FMCAssignmentScreen />} />
                    <Route path="/fmc/diagnostics" element={<FMCDiagnosticsScreen />} />
                    <Route path="/unauthorized" element={<UnauthorizedScreen />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
