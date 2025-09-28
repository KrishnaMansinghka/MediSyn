import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  Clock,
  User,
  FileText,
  Search,
  ChevronRight,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MedicalHeader from "../components/MedicalHeader";
import InitialReportModal from "./InitialReportModal";
import { 
  getDoctorPatients, 
  formatAppointmentTime,
  getAppointmentButtonText,
  type PatientData 
} from "@/lib/appointment-service";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [patientQueue, setPatientQueue] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Get current user info from localStorage
  const getCurrentUser = () => {
    const sessionData = localStorage.getItem('medisyn_session');
    return sessionData ? JSON.parse(sessionData) : null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser || currentUser.userType !== 'doctor') {
        setError('Please log in as a doctor to view patient queue');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const patientsData = await getDoctorPatients(currentUser.userId);
        setPatientQueue(patientsData);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentUser?.userId]);

  const getPatientStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge className="bg-red-100 text-red-800 border-red-200">Prerequisite Required</Badge>;
      case 1:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Initial Screening</Badge>;
      case 2:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Report Available</Badge>;
      default:
        return <Badge variant="outline">Unknown Status</Badge>;
    }
  };

  const getAppointmentStatusBadge = (status?: number) => {
    if (status === undefined) return <Badge variant="outline">No Appointment</Badge>;
    
    switch (status) {
      case 0:
        return <Badge className="bg-red-100 text-red-800 border-red-200">Prerequisite Required</Badge>;
      case 1:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Initial Screening</Badge>;
      case 2:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Report Available</Badge>;
      default:
        return <Badge variant="outline">Waiting</Badge>;
    }
  };

  const handleViewInitialReport = (patientId: string) => {
    setSelectedPatientForReport(patientId);
    setIsReportModalOpen(true);
  };

  const getActionButton = (patient: PatientData) => {
    // If patient has an appointment, show appointment-based actions
    if (patient.appointmentid && patient.appointment_status !== undefined) {
      switch (patient.appointment_status) {
        case 0:
          return (
            <Button 
              variant="outline"
              onClick={() => navigate(`/medicare/prerequisite-information`)}
              className="border-red-500/20 text-red-700 hover:bg-red-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Prerequisite Required
            </Button>
          );
        case 1:
          return (
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => handleViewInitialReport(patient.patientid.toString())}
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Initial Report
              </Button>
              <Button 
                className="bg-gradient-medical hover:opacity-90 shadow-medical"
                onClick={() => navigate(`/medicare/pre-encounter/${patient.patientid}`)}
              >
                Start Encounter
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          );
        case 2:
          return (
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/medicare/pre-auth/${patient.patientid}`)}
                className="border-accent/20 text-accent-foreground hover:bg-accent/5"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Pre-Auth Report
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/medicare/view-report/${patient.patientid}`)}
                className="border-secondary/20 text-secondary hover:bg-secondary/5"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </div>
          );
      }
    }
    
    // No appointment or unknown status
    return (
      <Button variant="outline" disabled>
        <Clock className="mr-2 w-4 h-4" />
        No Active Appointment
      </Button>
    );
  };

  const user = {
    name: currentUser?.userName || "Doctor",
    role: "physician",
    avatar: ""
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MedicalHeader 
        user={user} 
        clinicName="Family Medicine Associates"
        notifications={3}
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-foreground">Patient Queue</h1>
                
              </div>
              <p className="text-muted-foreground">Manage your daily appointments and encounters</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Appointments</p>
                    <p className="text-2xl font-bold text-foreground">5</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ready for Review</p>
                    <p className="text-2xl font-bold text-accent">2</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-amber-600">1</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold text-secondary">2</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Queue */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Patient Queue</span>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading patient queue...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    <p>{error}</p>
                  </div>
                ) : patientQueue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No patients in queue today</p>
                  </div>
                ) : (
                  patientQueue
                    .filter(patient => 
                      !searchQuery || 
                      patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      patient.patient_email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((patient) => (
                      <div 
                        key={patient.patientid} 
                        className="flex items-center justify-between p-4 bg-background rounded-lg border hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-foreground">{patient.patient_name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {patient.display_time || 'No Time'}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1">
                              {patient.patient_email}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-muted-foreground">Patient Status:</span>
                                {getPatientStatusBadge(patient.patient_status)}
                              </div>
                              
                              {patient.appointment_status !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-muted-foreground">Appointment:</span>
                                  {getAppointmentStatusBadge(patient.appointment_status)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getActionButton(patient)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-card group hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Patient Search</h3>
                    <p className="text-sm text-muted-foreground">Find and review patient histories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card group hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Clinical Analytics</h3>
                    <p className="text-sm text-muted-foreground">View practice insights and metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card group hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-medical rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Schedule Management</h3>
                    <p className="text-sm text-muted-foreground">Manage appointments and availability</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Initial Report Modal */}
      <InitialReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patientId={selectedPatientForReport || ''}
        patientName={patientQueue.find(p => p.patientid.toString() === selectedPatientForReport)?.patient_name}
      />
    </div>
  );
};

export default DoctorDashboard;