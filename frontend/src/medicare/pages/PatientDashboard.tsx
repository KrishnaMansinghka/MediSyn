import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  FileText, 
  Clock, 
  User,
  ChevronRight,
  Heart,
  MessageSquare,
  ClipboardList,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  getPatientAppointments, 
  formatAppointmentDate, 
  formatAppointmentTime,
  getAppointmentButtonText,
  type AppointmentData 
} from "@/lib/appointment-service";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user info from localStorage
  const getCurrentUser = () => {
    const sessionData = localStorage.getItem('medisyn_session');
    return sessionData ? JSON.parse(sessionData) : null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser || currentUser.userType !== 'patient') {
        setError('Please log in as a patient to view appointments');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const appointmentData = await getPatientAppointments(currentUser.userId);
        setAppointments(appointmentData);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentUser?.userId]);

  // Separate upcoming and past appointments
  const upcomingAppointments = appointments.filter(apt => apt.time_status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.time_status === 'past');
  const upcomingAppointment = upcomingAppointments[0]; // Get the next upcoming appointment

  const handleStartScreening = () => {
    navigate('/medicare/initial-screening');
  };

  const handlePrerequisiteInfo = () => {
    navigate('/medicare/prerequisite-information');
  };

  const handleViewReport = (appointmentId: string) => {
    navigate(`/medicare/patient-report/${appointmentId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome back, {currentUser?.userName || 'User'}</h1>
                <p className="text-muted-foreground">Manage your appointments and health records</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Patient ID</p>
              <p className="font-mono text-sm text-foreground">PT-2024-001</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Upcoming Appointment Section */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Upcoming Appointment</span>
            </CardTitle>
          </CardHeader>
                    <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : upcomingAppointment ? (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        {upcomingAppointment.doctor_name} (Status: {upcomingAppointment.appointment_status})
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatAppointmentDate(upcomingAppointment.appointment_date)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatAppointmentTime(upcomingAppointment.appointment_time)}
                      </span>
                    </div>
                    <Badge className="bg-primary/10 text-primary">{upcomingAppointment.clinic_name}</Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {upcomingAppointment.appointment_status === 0 && (
                      <Button 
                        onClick={handlePrerequisiteInfo}
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/5"
                      >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        {getAppointmentButtonText(upcomingAppointment.appointment_status)}
                      </Button>
                    )}
                    
                    {upcomingAppointment.appointment_status === 1 && (
                      <Button 
                        onClick={handleStartScreening}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {getAppointmentButtonText(upcomingAppointment.appointment_status)}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    
                    {upcomingAppointment.appointment_status === 2 && (
                      <Button 
                        onClick={() => handleViewReport(upcomingAppointment.appointmentid.toString())}
                        className="bg-secondary hover:bg-secondary-dark"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {getAppointmentButtonText(upcomingAppointment.appointment_status)}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Past Appointments Section */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <FileText className="w-5 h-5 text-secondary" />
              <span>Past Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <p>{error}</p>
                </div>
              ) : pastAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No past appointments found</p>
                </div>
              ) : (
                pastAppointments.map((appointment) => (
                  <div key={appointment.appointmentid} className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{appointment.doctor_name}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatAppointmentDate(appointment.appointment_date)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatAppointmentTime(appointment.appointment_time)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">{appointment.clinic_name}</Badge>
                      </div>

                      <Button 
                        variant="outline" 
                        onClick={() => handleViewReport(appointment.appointmentid.toString())}
                        className="border-secondary/20 text-secondary hover:bg-secondary/5"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {getAppointmentButtonText(appointment.appointment_status)}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PatientDashboard;