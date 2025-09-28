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
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Appointment {
  id: string;
  doctorName: string;
  date: Date;
  time: string;
  type: string;
  status: 'upcoming' | 'completed';
}

const PatientDashboard = () => {
  const navigate = useNavigate();

  const upcomingAppointment: Appointment = {
    id: "1",
    doctorName: "Dr. Sarah Mitchell",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    time: "2:30 PM",
    type: "Follow-up Consultation",
    status: 'upcoming'
  };

  const pastAppointments: Appointment[] = [
    {
      id: "2",
      doctorName: "Dr. Sarah Mitchell", 
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      time: "10:30 AM",
      type: "Initial Consultation",
      status: 'completed'
    },
    {
      id: "3",
      doctorName: "Dr. Michael Chen",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      time: "3:00 PM", 
      type: "Annual Physical",
      status: 'completed'
    },
    {
      id: "4",
      doctorName: "Dr. Sarah Mitchell",
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      time: "11:15 AM",
      type: "Blood Work Review", 
      status: 'completed'
    }
  ];

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
                <h1 className="text-3xl font-bold text-foreground">Welcome back, Krishna</h1>
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
            {upcomingAppointment ? (
              <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 p-6 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">{upcomingAppointment.doctorName}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {upcomingAppointment.date.toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {upcomingAppointment.time}
                      </span>
                    </div>
                    <Badge className="bg-primary/10 text-primary">{upcomingAppointment.type}</Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handlePrerequisiteInfo}
                      variant="outline"
                      className="border-primary/20 text-primary hover:bg-primary/5"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Complete Prerequisite Information
                    </Button>
                    
                    <Button 
                      onClick={handleStartScreening}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Initial Screening
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
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
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{appointment.doctorName}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {appointment.date.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.time}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">{appointment.type}</Badge>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => handleViewReport(appointment.id)}
                      className="border-secondary/20 text-secondary hover:bg-secondary/5"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PatientDashboard;