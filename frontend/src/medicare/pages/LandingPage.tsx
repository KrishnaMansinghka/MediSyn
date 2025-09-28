import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Brain, Shield, Clock, Users, FileText, Star, ChevronRight, CheckCircle, FileCheck, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
const LandingPage = () => {
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">MediSyn</span>
              
            </div>
            

            <div className="flex items-center space-x-4">
              <Link to="/medicare/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/medicare/signup">
                <Button className="bg-gradient-medical hover:opacity-90 shadow-medical">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                AI-Powered Clinical Intelligence
              </Badge>
              
              <h1 className="text-6xl font-bold text-foreground leading-tight">
                MediSyn<br/>
                <span className="text-transparent bg-gradient-medical bg-clip-text">Before. During. Beyond.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                MediSyn's AI-powered platform transforms every stage of patient care with intelligent automation, 
                real-time insights, and seamless documentation that adapts to your workflow.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/medicare/login">
                  <Button size="lg" className="bg-gradient-medical hover:opacity-90 shadow-medical">
                    Login
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/medicare/signup">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>EHR Integration</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>30-Day Trial</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-elevated p-8 border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Live Patient Encounter</h3>
                    <Badge className="bg-accent/10 text-accent">Recording</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-primary font-medium mb-1">PATIENT</div>
                      <div className="text-sm">"I've been having chest pain for about a week now..."</div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-primary font-medium mb-1">DOCTOR</div>
                      <div className="text-sm">"Can you describe the pain? Is it sharp or dull?"</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">AI GENERATING SOAP NOTE</div>
                    <div className="text-sm space-y-1">
                      <div><strong>Chief Complaint:</strong> Chest pain, 1 week duration</div>
                      <div><strong>HPI:</strong> Patient reports chest pain...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Complete Clinical AI Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three powerful modules working together to transform your practice workflow
            </p>
          </div>

          {/* First row - 3 features */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card className="group hover:shadow-elevated transition-all duration-300 border-0 shadow-card">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-medical rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">ChartPrep AI Intake</h3>
                <p className="text-muted-foreground mb-6">
                  Intelligent pre-visit patient conversations that generate preliminary SOAP notes 
                  before appointments even begin.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Automated chief complaint capture</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>History of present illness extraction</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Pre-visit preparation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-elevated transition-all duration-300 border-0 shadow-card">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Aura Live Scribe</h3>
                <p className="text-muted-foreground mb-6">
                  Real-time ambient listening that creates complete documentation while you 
                  focus entirely on patient care.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Real-time transcription</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Live SOAP note generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Differential diagnosis suggestions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-elevated transition-all duration-300 border-0 shadow-card">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Synapse Nudge Engine</h3>
                <p className="text-muted-foreground mb-6">
                  Clinical decision support that provides real-time insights, safety alerts, 
                  and evidence-based recommendations.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Drug interaction alerts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Cost-effective alternatives</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Literature-based insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Second row - 2 features */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="group hover:shadow-elevated transition-all duration-300 border-0 shadow-card">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Pre Authorization Report</h3>
                <p className="text-muted-foreground mb-6">
                  Automated insurance pre-authorization documentation that streamlines approval 
                  processes and reduces administrative burden.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Automated form completion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Insurance compliance checks</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Fast approval processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-elevated transition-all duration-300 border-0 shadow-card">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Discharge Report</h3>
                <p className="text-muted-foreground mb-6">
                  Simplified, patient-friendly discharge summaries with clear instructions, 
                  medication lists, and follow-up care guidelines.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Patient-friendly language</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Clear medication instructions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Follow-up care checklists</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


    </div>;
};
export default LandingPage;