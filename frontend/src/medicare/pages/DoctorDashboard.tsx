import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MedicalHeader from "../components/MedicalHeader";
import InitialReportModal from "./InitialReportModal";
import { usePatientQueue, PatientQueueItem } from "../hooks/usePatientQueue";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { patientQueue } = usePatientQueue();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const getIntakeStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-accent/10 text-accent border-accent/20">✓ Ready for Review</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getEncounterStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20">✓ Encounter Complete</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary/10 text-primary border-primary/20">● In Session</Badge>;
      default:
        return <Badge variant="outline">Waiting</Badge>;
    }
  };

  const handleViewInitialReport = (patientId: string) => {
    setSelectedPatientForReport(patientId);
    setIsReportModalOpen(true);
  };

  const getActionButton = (patient: PatientQueueItem) => {
    // Post-encounter actions
    if (patient.encounterStatus === 'completed') {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/medicare/pre-auth/${patient.id}`)}
            className="border-accent/20 text-accent-foreground hover:bg-accent/5"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Pre-Auth Report
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/medicare/view-report/${patient.id}`)}
            className="border-secondary/20 text-secondary hover:bg-secondary/5"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Discharge Report
          </Button>
        </div>
      );
    }
    
    // Pre-encounter actions  
    if (patient.intakeStatus === 'completed' && patient.encounterStatus === 'waiting') {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => handleViewInitialReport(patient.id)}
            className="border-primary/20 text-primary hover:bg-primary/5"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Initial Report
          </Button>
          <Button 
            className="bg-gradient-medical hover:opacity-90 shadow-medical"
            onClick={() => navigate(`/medicare/pre-encounter/${patient.id}`)}
          >
            Start Encounter
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      );
    }
    
    return (
      <Button variant="outline" disabled>
        <Clock className="mr-2 w-4 h-4" />
        Waiting for Intake
      </Button>
    );
  };

  const user = {
    name: "Dr. Sarah Mitchell",
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
                {patientQueue.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="flex items-center justify-between p-4 bg-background rounded-lg border hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-foreground">{patient.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {patient.time}
                          </Badge>
                        </div>
                        
                        {patient.chiefComplaint && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Chief Complaint: {patient.chiefComplaint}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-muted-foreground">Intake:</span>
                            {getIntakeStatusBadge(patient.intakeStatus)}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-muted-foreground">Encounter:</span>
                            {getEncounterStatusBadge(patient.encounterStatus)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getActionButton(patient)}
                    </div>
                  </div>
                ))}
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
        patientName={patientQueue.find(p => p.id === selectedPatientForReport)?.name}
      />
    </div>
  );
};

export default DoctorDashboard;