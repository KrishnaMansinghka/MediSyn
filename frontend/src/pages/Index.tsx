import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, ArrowRight, Shield, Clock, Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-medical rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold text-foreground ml-4">MediSyn</span>
          </div>

          <h1 className="text-6xl font-bold text-foreground mb-6 leading-tight">
            AI-Powered Healthcare
            <span className="text-transparent bg-gradient-medical bg-clip-text block">
              Management Platform
            </span>
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience healthcare intelligence at every stage with MediSyn's comprehensive platform 
            featuring intelligent patient intake, ambient scribing, and clinical decision support.
            <br /><strong>Before. During. Beyond.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link to="/medicare">
              <Button size="lg" className="bg-gradient-medical hover:opacity-90 shadow-medical text-lg px-8 py-4">
                Explore MediSyn Platform
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/medicare/demo">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4">
                Request Demo
              </Button>
            </Link>
          </div>

          {/* Key Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-card group hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-medical rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">ChartPrep AI Intake</h3>
                <p className="text-muted-foreground">
                  Intelligent pre-visit conversations that prepare comprehensive preliminary documentation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card group hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Aura Live Scribe</h3>
                <p className="text-muted-foreground">
                  Real-time ambient listening with live SOAP note generation and differential diagnosis
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card group hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Synapse Nudge Engine</h3>
                <p className="text-muted-foreground">
                  Clinical decision support with safety alerts, cost analysis, and evidence-based insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-hero py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the revolution in AI-powered clinical intelligence and documentation.
          </p>
          
          <Link to="/medicare">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elevated text-lg px-8 py-4">
              Enter MediSyn Platform
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
