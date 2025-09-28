import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import ViewReport from "./pages/ViewReport";
import StartMeeting from "./pages/StartMeeting";
import PreAuthScreen from "./pages/PreAuthScreen";
import InitialScreening from "./pages/InitialScreening";
import ChartPrepIntake from "./pages/ChartPrepIntake";
import PreEncounterView from "./pages/PreEncounterView";
import PrerequisiteInformation from "./pages/PrerequisiteInformation";
import DatabaseTestPage from "./pages/DatabaseTestPage";
import { PatientQueueProvider } from "./hooks/usePatientQueue";

const MediCareApp = () => {
  return (
    <PatientQueueProvider>
      <div className="min-h-screen">
        <Routes>
          {/* Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/database-test" element={<DatabaseTestPage />} />
          
          {/* Doctor Flow */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/view-report/:patientId" element={<ViewReport />} />
          <Route path="/start-meeting/:patientId" element={<StartMeeting />} />
          <Route path="/pre-auth/:patientId" element={<PreAuthScreen />} />
          
          {/* Patient Flow */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/prerequisite-information" element={<PrerequisiteInformation />} />
          <Route path="/initial-screening" element={<InitialScreening />} />
          <Route path="/patient-report/:reportId" element={<ViewReport />} />
          <Route path="/intake/:appointmentId" element={<ChartPrepIntake />} />
          
          {/* Legacy redirects */}
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-portal" element={<PatientDashboard />} />
          <Route path="/pre-encounter/:patientId" element={<PreEncounterView />} />
          <Route path="/encounter/:patientId" element={<StartMeeting />} />
        </Routes>
      </div>
    </PatientQueueProvider>
  );
};

export default MediCareApp;