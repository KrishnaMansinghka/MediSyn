import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Lock, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { mediSynAuthService } from "@/lib/auth-service";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'doctor' | 'patient'>('doctor');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const email = formData.get(`${loginType}-email`) as string;
      const password = formData.get(`${loginType}-password`) as string;

      // Authenticate user using PostgreSQL backend
      const authResult = await mediSynAuthService.login({ email, password });

      setSuccess('Login successful! Redirecting...');

      // Redirect based on user type
      setTimeout(() => {
        if (authResult.user_type === 'doctor') {
          navigate('/medicare/doctor-dashboard');
        } else {
          navigate('/medicare/patient-dashboard');
        }
      }, 1500);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during login');
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
            <div className="flex items-center justify-between mb-2">
              <div></div>
              
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your MediSyn account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'doctor' | 'patient')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="doctor">Healthcare Provider</TabsTrigger>
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
                <form onSubmit={handleLogin} className="space-y-4">
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
                        placeholder="Enter your password"
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
                    {isLoading ? "Signing in..." : "Sign In to Provider Portal"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    New practice?{" "}
                    <Link to="/medicare/signup?type=doctor" className="text-primary hover:underline">
                      Register your clinic
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
                <form onSubmit={handleLogin} className="space-y-4">
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
                        placeholder="Enter your password"
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
                    {isLoading ? "Signing in..." : "Sign In to Patient Portal"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    First time here?{" "}
                    <Link to="/medicare/signup?type=patient" className="text-primary hover:underline">
                      Create account
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

export default LoginPage;