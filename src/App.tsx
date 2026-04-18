import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
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
import ChangePasswordScreen from "./pages/ChangePasswordScreen";
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
import ClinicianOnboardingScreen from "./pages/clinician/ClinicianOnboardingScreen";
import ClinicianLayout from "./components/layout/ClinicianLayout";
// FMC screens
import FMCStaffLoginScreen from "./pages/fmc/FMCStaffLoginScreen";
import FMCMajorRiskDashboardScreen from "./pages/fmc/FMCMajorRiskDashboardScreen";
import FMCProfileSettingsScreen from "./pages/fmc/FMCProfileSettingsScreen";
import FMCAnalyticsScreen from "./pages/fmc/FMCAnalyticsScreen";
import FMCAlertsScreen from "./pages/fmc/FMCAlertsScreen";
import FMCDischargeScreen from "./pages/fmc/FMCDischargeScreen";
// PHC screens
import PHCStaffLoginScreen from "./pages/phc/PHCStaffLoginScreen";
// STH screens
import STHStaffLoginScreen from "./pages/sth/STHStaffLoginScreen";
// STTH screens
import STTHStaffLoginScreen from "./pages/stth/STTHStaffLoginScreen";
// FTH screens
import FTHStaffLoginScreen from "./pages/fth/FTHStaffLoginScreen";
// HMO screens
import HMOStaffLoginScreen from "./pages/hmo/HMOStaffLoginScreen";
// Clinic screens
import ClinicStaffLoginScreen from "./pages/clinic/ClinicStaffLoginScreen";
// Private Hospital screens
import PrivateHospitalLoginScreen from "./pages/pvt/PrivateHospitalLoginScreen";
// Private Teaching Hospital screens
import PrivateTeachingHospitalLoginScreen from "./pages/ptth/PrivateTeachingHospitalLoginScreen";
import PHCMinorRiskDashboardScreen from "./pages/phc/PHCMinorRiskDashboardScreen";
// Layouts
import STHLayout from "./components/layout/STHLayout";
import STTHLayout from "./components/layout/STTHLayout";
import FTHLayout from "./components/layout/FTHLayout";
import HmoLayout from "./components/layout/HMOLayout";
import ClinicLayout from "./components/layout/ClinicLayout";
import PVTLayout from "./components/layout/PVTLayout";
import PTTHLayout from "./components/layout/PTTHLayout";
// Dashboard screens
import STHDashboardScreen from "./pages/sth/STHDashboardScreen";
import STTHDashboardScreen from "./pages/stth/STTHDashboardScreen";
import FTHDashboardScreen from "./pages/fth/FTHDashboardScreen";
import HMODashboardScreen from "./pages/hmo/HMODashboardScreen";
import ClinicDashboardScreen from "./pages/clinic/ClinicDashboardScreen";
import PVTDashboardScreen from "./pages/pvt/PVTDashboardScreen";
import PTTHDashboardScreen from "./pages/ptth/PTTHDashboardScreen";
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
import PHCAdviceScreen from "./pages/phc/PHCAdviceScreen";
// FMC Portal
import FMCPatientDetailScreen from "./pages/fmc/FMCPatientDetailScreen";
import FMCAssignmentScreen from "./pages/fmc/FMCAssignmentScreen";
import FMCDiagnosticsScreen from "./pages/fmc/FMCDiagnosticsScreen";
import FMCConsultationNotesScreen from "./pages/fmc/FMCConsultationNotesScreen";
import FMCTreatmentPlansScreen from "./pages/fmc/FMCTreatmentPlansScreen";
import FMCStaffManagementScreen from "./pages/fmc/FMCStaffManagementScreen";
import FMCClinicianManagementScreen from "./pages/fmc/FMCClinicianManagementScreen";
import FMCNetworkPHCScreen from "./pages/fmc/FMCNetworkPHCScreen";
import RppgCaptureScreen from "./pages/RppgCaptureScreen";

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
                    <Route path="/change-password" element={<ChangePasswordScreen />} />
                    {/* Clinician Routes */}
                    <Route path="/clinician" element={<ClinicianLayout />}>
                      <Route path="dashboard" element={<ClinicianDashboardScreen />} />
                      <Route path="patient/:id" element={<ClinicianPatientDetailScreen />} />
                      <Route path="treatment-plans" element={<ClinicianTreatmentPlansScreen />} />
                      <Route path="prescriptions" element={<ClinicianPrescriptionsScreen />} />
                      <Route path="communication" element={<ClinicianCommunicationScreen />} />
                      <Route path="analytics" element={<ClinicianAnalyticsScreen />} />
                      <Route path="profile" element={<ClinicianProfileSettingsScreen />} />
                      <Route path="onboarding" element={<ClinicianOnboardingScreen />} />
                    </Route>
                    <Route path="/clinician/login" element={<ClinicianLoginScreen />} />
                    <Route path="/clinician/register" element={<ClinicianRegistrationScreen />} />
                    <Route path="/clinician/pending-verification" element={<ClinicianPendingVerificationScreen />} />
                    {/* FMC Routes */}
                    <Route path="/fmc/login" element={<FMCStaffLoginScreen />} />
                    <Route path="/fmc/dashboard" element={<FMCMajorRiskDashboardScreen />} />
                    <Route path="/fmc/patient-detail/:caseId" element={<FMCPatientDetailScreen />} />
                    <Route path="/fmc/assignment" element={<FMCAssignmentScreen />} />
                    <Route path="/fmc/diagnostics" element={<FMCDiagnosticsScreen />} />
                    <Route path="/fmc/analytics" element={<FMCAnalyticsScreen />} />
                    <Route path="/fmc/alerts" element={<FMCAlertsScreen />} />
                    <Route path="/fmc/discharge/:caseId" element={<FMCDischargeScreen />} />
                    <Route path="/fmc/profile" element={<FMCProfileSettingsScreen />} />
                    <Route path="/fmc/consultation" element={<FMCConsultationNotesScreen />} />
                    <Route path="/fmc/consultation/:caseId" element={<FMCConsultationNotesScreen />} />
                    <Route path="/fmc/treatment-plans" element={<FMCTreatmentPlansScreen />} />
                    <Route path="/fmc/staff-management" element={<FMCStaffManagementScreen />} />
                    <Route path="/fmc/clinician-management" element={<FMCClinicianManagementScreen />} />
                    <Route path="/fmc/network-phc" element={<FMCNetworkPHCScreen />} />
                    {/* PHC Routes */}
                    <Route path="/phc/login" element={<PHCStaffLoginScreen />} />
                    <Route path="/phc/dashboard" element={<PHCMinorRiskDashboardScreen />} />
                    <Route path="/phc/patients/:id" element={<PHCPatientDetailScreen />} />
                    <Route path="/phc/register" element={<PHCWalkInRegistrationScreen />} />
                    <Route path="/phc/advice" element={<PHCAdviceScreen />} />
                    <Route path="/phc/escalation" element={<PHCEscalationScreen />} />
                    <Route path="/phc/analytics" element={<PHCAnalyticsScreen />} />
                    <Route path="/phc/alerts" element={<PHCNotificationsScreen />} />
                    <Route path="/phc/settings" element={<PHCProfileSettingsScreen />} />
                    {/* STH Routes */}
                    <Route path="/sth/login" element={<STHStaffLoginScreen />} />
                    <Route path="/sth" element={<STHLayout />}>
                      <Route path="/sth/dashboard" element={<STHDashboardScreen />} />
                    </Route>
                    {/* STTH Routes */}
                    <Route path="/stth/login" element={<STTHStaffLoginScreen />} />
                    <Route path="/stth" element={<STTHLayout />}>
                      <Route path="/stth/dashboard" element={<STTHDashboardScreen />} />
                    </Route>
                    {/* FTH Routes */}
                    <Route path="/fth/login" element={<FTHStaffLoginScreen />} />
                    <Route path="/fth" element={<FTHLayout />}>
                      <Route path="/fth/dashboard" element={<FTHDashboardScreen />} />
                    </Route>
                    {/* HMO Routes */}
                    <Route path="/hmo/login" element={<HMOStaffLoginScreen />} />
                    <Route path="/hmo" element={<HmoLayout />}>
                      <Route path="/hmo/dashboard" element={<HMODashboardScreen />} />
                    </Route>
                    {/* Clinic Routes */}
                    <Route path="/clinic/login" element={<ClinicStaffLoginScreen />} />
                    <Route path="/clinic" element={<ClinicLayout />}>
                      <Route path="/clinic/dashboard" element={<ClinicDashboardScreen />} />
                    </Route>
                    {/* Private Hospital Routes */}
                    <Route path="/pvt/login" element={<PrivateHospitalLoginScreen />} />
                    <Route path="/pvt" element={<PVTLayout />}>
                      <Route path="/pvt/dashboard" element={<PVTDashboardScreen />} />
                    </Route>
                    {/* Private Teaching Hospital Routes */}
                    <Route path="/ptth/login" element={<PrivateTeachingHospitalLoginScreen />} />
                    <Route path="/ptth" element={<PTTHLayout />}>
                      <Route path="/ptth/dashboard" element={<PTTHDashboardScreen />} />
                    </Route>
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
                    {/* Catch-all */}
                    <Route path="/rppg-capture" element={<RppgCaptureScreen />} />
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
