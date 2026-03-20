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
// Clinician screens
import ClinicianLoginScreen from "./pages/clinician/ClinicianLoginScreen";
import ClinicianRegistrationScreen from "./pages/clinician/ClinicianRegistrationScreen";
import ClinicianPendingVerificationScreen from "./pages/clinician/ClinicianPendingVerificationScreen";
import ClinicianDashboardScreen from "./pages/clinician/ClinicianDashboardScreen";
import ClinicianPatientDetailScreen from "./pages/clinician/ClinicianPatientDetailScreen";
import ClinicianTreatmentPlansScreen from "./pages/clinician/ClinicianTreatmentPlansScreen";
import ClinicianPrescriptionsScreen from "./pages/clinician/ClinicianPrescriptionsScreen";
import ClinicianCommunicationScreen from "./pages/clinician/ClinicianCommunicationScreen";
import ClinicianAnalyticsScreen from "./pages/clinician/ClinicianAnalyticsScreen";
import ClinicianProfileSettingsScreen from "./pages/clinician/ClinicianProfileSettingsScreen";
// FMC screens
import FMCStaffLoginScreen from "./pages/fmc/FMCStaffLoginScreen";
import FMCMajorRiskDashboardScreen from "./pages/fmc/FMCMajorRiskDashboardScreen";
import FMCProfileSettingsScreen from "./pages/fmc/FMCProfileSettingsScreen";
// PHC screens
import PHCStaffLoginScreen from "./pages/phc/PHCStaffLoginScreen";
import PHCMinorRiskDashboardScreen from "./pages/phc/PHCMinorRiskDashboardScreen";
import PHCPatientDetailScreen from "./pages/phc/PHCPatientDetailScreen";
import PHCWalkInRegistrationScreen from "./pages/phc/PHCWalkInRegistrationScreen";
import PHCAdviceInterventionScreen from "./pages/phc/PHCAdviceInterventionScreen";
import PHCEscalationScreen from "./pages/phc/PHCEscalationScreen";
import PHCAnalyticsScreen from "./pages/phc/PHCAnalyticsScreen";
import PHCNotificationsScreen from "./pages/phc/PHCNotificationsScreen";
import PHCProfileSettingsScreen from "./pages/phc/PHCProfileSettingsScreen";
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
import Step7HealthCentre from "./pages/onboarding/Step7HealthCentre";
import MorningCheckIn from "./pages/MorningCheckIn";
import EveningCheckIn from "./pages/EveningCheckIn";
import PeriodLogging from "./pages/PeriodLogging";
import CycleHistory from "./pages/CycleHistory";
import HirsutismScoring from "./pages/HirsutismScoring";
import PHQ4Assessment from "./pages/PHQ4Assessment";
import WeeklyToolsScreen from "./pages/WeeklyToolsScreen";
import MentalWellness from "./pages/weekly-tools/MentalWellness";
import MoodCheck from "./pages/weekly-tools/MoodCheck";
import FocusMemory from "./pages/weekly-tools/FocusMemory";
import SleepQuality from "./pages/weekly-tools/SleepQuality";
import CombinedResults from "./pages/weekly-tools/CombinedResults";
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
import PatientPanelScreen from "./pages/PatientPanelScreen";
import PatientDetailScreen from "./pages/PatientDetailScreen";
import ClinicianExportScreen from "./pages/ClinicianExportScreen";
// PHC Portal
import PHCLoginScreen from "./pages/phc/PHCLoginScreen";
import PHCDashboardScreen from "./pages/phc/PHCDashboardScreen";
import PHCRegisterScreen from "./pages/phc/PHCRegisterScreen";
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
                    {/* Clinician Routes */}
                    <Route path="/clinician/login" element={<ClinicianLoginScreen />} />
                    <Route path="/clinician/register" element={<ClinicianRegistrationScreen />} />
                    <Route path="/clinician/pending-verification" element={<ClinicianPendingVerificationScreen />} />
                    <Route path="/clinician/dashboard" element={<ClinicianDashboardScreen />} />
                    <Route path="/clinician/patient/:id" element={<ClinicianPatientDetailScreen />} />
                    <Route path="/clinician/treatment-plans" element={<ClinicianTreatmentPlansScreen />} />
                    <Route path="/clinician/prescriptions" element={<ClinicianPrescriptionsScreen />} />
                    <Route path="/clinician/communication" element={<ClinicianCommunicationScreen />} />
                    <Route path="/clinician/analytics" element={<ClinicianAnalyticsScreen />} />
                    <Route path="/clinician/profile" element={<ClinicianProfileSettingsScreen />} />
                    {/* FMC Routes */}
                    <Route path="/fmc/login" element={<FMCStaffLoginScreen />} />
                    <Route path="/fmc/dashboard" element={<FMCMajorRiskDashboardScreen />} />
                    <Route path="/fmc/profile" element={<FMCProfileSettingsScreen />} />
                    {/* PHC Routes */}
                    <Route path="/phc/login" element={<PHCStaffLoginScreen />} />
                    <Route path="/phc/dashboard" element={<PHCMinorRiskDashboardScreen />} />
                    <Route path="/phc/patient/:id" element={<PHCPatientDetailScreen />} />
                    <Route path="/phc/register" element={<PHCWalkInRegistrationScreen />} />
                    <Route path="/phc/advice" element={<PHCAdviceInterventionScreen />} />
                    <Route path="/phc/escalation" element={<PHCEscalationScreen />} />
                    <Route path="/phc/analytics" element={<PHCAnalyticsScreen />} />
                    <Route path="/phc/notifications" element={<PHCNotificationsScreen />} />
                    <Route path="/phc/profile" element={<PHCProfileSettingsScreen />} />
                    {/* Patient Routes */}
                    <Route path="/onboarding" element={<OnboardingScreen />} />
                    <Route path="/onboarding/step/1" element={<Step1PersonalInfo />} />
                    <Route path="/onboarding/step/2" element={<Step2PhysicalMeasurements />} />
                    <Route path="/onboarding/step/3" element={<Step3SkinChanges />} />
                    <Route path="/onboarding/step/4" element={<Step4MenstrualHistory />} />
                    <Route path="/onboarding/step/5" element={<Step5WearableSetup />} />
                    <Route path="/onboarding/step/6" element={<Step6rPPG />} />
                    <Route path="/onboarding/step/7" element={<Step7HealthCentre />} />
                    <Route path="/onboarding-complete" element={<OnboardingComplete />} />
                    <Route path="/dashboard" element={<DashboardScreen />} />
                    <Route path="/checkin/morning" element={<MorningCheckIn />} />
                    <Route path="/checkin/evening" element={<EveningCheckIn />} />
                    <Route path="/period-logging" element={<PeriodLogging />} />
                    <Route path="/cycle-history" element={<CycleHistory />} />
                    <Route path="/weekly-tools/hirsutism" element={<HirsutismScoring />} />
                    <Route path="/phq4" element={<PHQ4Assessment />} />
                    <Route path="/weekly-tools" element={<WeeklyToolsScreen />} />
                    <Route path="/weekly-tools/mental-wellness" element={<MentalWellness />} />
                    <Route path="/weekly-tools/mood-check" element={<MoodCheck />} />
                    <Route path="/weekly-tools/focus-memory" element={<FocusMemory />} />
                    <Route path="/weekly-tools/sleep-quality" element={<SleepQuality />} />
                    <Route path="/weekly-tools/results" element={<CombinedResults />} />
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
