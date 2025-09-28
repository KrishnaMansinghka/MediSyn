import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Lock, Mail, User, Building, Calendar, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { mediSynDB } from "@/lib/database/db-utils";
import { SignUpFormData } from "@/lib/database/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [signupType, setSignupType] = useState<'doctor' | 'patient'>('doctor');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  // Set initial tab based on URL parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'patient' || type === 'doctor') {
      setSignupType(type);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      if (signupType === 'doctor') {
        const signupData: SignUpFormData = {
          clinicName: formData.get('clinic-name') as string,
          doctorName: formData.get('doctor-name') as string,
          email: formData.get('doctor-email') as string,
          password: formData.get('doctor-password') as string,
          role: 'doctor'
        };

        await mediSynDB.createDoctor(signupData);
        setSuccess('Doctor account created successfully!');
      } else {
        const signupData: SignUpFormData = {
          name: formData.get('patient-name') as string,
          dateOfBirth: formData.get('patient-dob') as string,
          address: formData.get('patient-address') as string,
          email: formData.get('patient-email') as string,
          password: formData.get('patient-password') as string,
          role: 'patient'
        };

        await mediSynDB.createPatient(signupData);
        setSuccess('Patient account created successfully!');
      }

      // Redirect to login after successful signup
      setTimeout(() => {
        navigate('/medicare/login');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">MediSyn</span>
          </div>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
            <CardDescription>
              Join MediSyn to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={signupType} onValueChange={(value) => setSignupType(value as 'doctor' | 'patient')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="doctor">Doctor / Clinic</TabsTrigger>
                <TabsTrigger value="patient">Patient</TabsTrigger>
              </TabsList>

              <TabsContent value="doctor" className="space-y-4 mt-0">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="clinic-name"
                        name="clinic-name"
                        type="text"
                        placeholder="Enter clinic name"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Doctor Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="doctor-name"
                        name="doctor-name"
                        type="text"
                        placeholder="Enter doctor name"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="doctor-email"
                        name="doctor-email"
                        type="email"
                        placeholder="doctor@clinic.com"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="doctor-password"
                        name="doctor-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-medical hover:opacity-90 shadow-medical"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Doctor Account"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/medicare/login" className="text-primary hover:underline">
                      Sign in here
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="patient" className="space-y-4 mt-0">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="patient-name"
                        name="patient-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="patient-dob"
                        name="patient-dob"
                        type="date"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="patient-address"
                        name="patient-address"
                        type="text"
                        placeholder="Enter your address"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="patient-email"
                        name="patient-email"
                        type="email"
                        placeholder="patient@email.com"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="patient-password"
                        name="patient-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-medical hover:opacity-90 shadow-medical"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Patient Account"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/medicare/login" className="text-primary hover:underline">
                      Sign in here
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Lock className="w-4 h-4" />
            <span>Secure & HIPAA Compliant</span>
          </div>
          <p>Your data is protected with enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;