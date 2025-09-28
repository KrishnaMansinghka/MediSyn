import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mediSynDB } from "@/lib/database/db-utils";
import { getCurrentSession, logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, Database, LogOut, UserCheck } from "lucide-react";

const DatabaseTestPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    setCurrentSession(getCurrentSession());
  }, []);

  const loadData = async () => {
    try {
      const [statsData, doctorsData, patientsData] = await Promise.all([
        mediSynDB.getStats(),
        mediSynDB.getAllDoctors(),
        mediSynDB.getAllPatients()
      ]);
      
      setStats(statsData);
      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = async () => {
    if (currentSession) {
      await mediSynDB.invalidateSession(currentSession.sessionId);
    }
    logout();
    navigate('/medicare/login');
  };

  const clearDatabase = () => {
    localStorage.removeItem('medisyn_database');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MediSyn Database Test</h1>
              <p className="text-gray-600">Local database integration demo</p>
            </div>
          </div>
          
          {currentSession && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{currentSession.userName}</p>
                <p className="text-sm text-gray-600">{currentSession.email}</p>
                <Badge variant={currentSession.userType === 'doctor' ? 'default' : 'secondary'}>
                  {currentSession.userType}
                </Badge>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDoctors}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSessions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Modified</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{stats.lastModified}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Doctors</span>
              </CardTitle>
              <CardDescription>
                All registered healthcare providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doctor.doctorName}</p>
                      <p className="text-sm text-gray-600">{doctor.clinicName}</p>
                      <p className="text-sm text-gray-500">{doctor.email}</p>
                    </div>
                    <Badge variant="default">Doctor</Badge>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && (
                <p className="text-gray-500 text-center py-4">No doctors registered</p>
              )}
            </CardContent>
          </Card>

          {/* Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Patients</span>
              </CardTitle>
              <CardDescription>
                All registered patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">DOB: {patient.dateOfBirth}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                    <Badge variant="secondary">Patient</Badge>
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <p className="text-gray-500 text-center py-4">No patients registered</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Database Actions</CardTitle>
            <CardDescription>
              Test and manage the local database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={loadData} variant="outline">
                Refresh Data
              </Button>
              <Button onClick={() => navigate('/medicare/signup')} variant="outline">
                Test Signup
              </Button>
              <Button onClick={() => navigate('/medicare/login')} variant="outline">
                Test Login
              </Button>
              <Button onClick={clearDatabase} variant="destructive">
                Clear Database
              </Button>
            </div>
            
            <Separator />
            
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Sample Login Credentials:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Doctor:</p>
                  <p>Email: sarah.johnson@downtownmedical.com</p>
                  <p>Password: password123</p>
                </div>
                <div>
                  <p className="font-medium">Patient:</p>
                  <p>Email: john.smith@email.com</p>
                  <p>Password: password123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTestPage;