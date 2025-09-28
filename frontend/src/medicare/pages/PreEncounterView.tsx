import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  PlayCircle,
  Clock,
  User,
  FileText,
  AlertCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import MedicalHeader from "../components/MedicalHeader";

const PreEncounterView = () => {
  const { patientId } = useParams();
  
  const user = {
    name: "Dr. Sarah Mitchell",
    role: "physician"
  };

  // Mock patient data
  const patient = {
    name: "Krishna",
    age: 45,
    mrn: "MRN-001234",
    appointmentTime: "9:00 AM",
    chiefComplaint: "Chest pain, ongoing for 1 week"
  };

  // Mock preliminary SOAP note from ChartPrep AI
  const preliminarySOAP = {
    subjective: `Patient reports chest pain that began approximately one week ago. Describes the pain as a dull, aching sensation located in the center of her chest. Pain is intermittent, typically lasting 10-15 minutes at a time. She rates the intensity as 5-6/10 at its worst. Pain seems to occur more frequently in the evening and is sometimes associated with stress at work. Denies shortness of breath, nausea, or radiating pain to arms/jaw. No recent travel, prolonged immobility, or leg swelling. Patient has been taking ibuprofen occasionally which provides minimal relief.

Medical History: Hypertension (well-controlled), no prior cardiac issues
Current Medications: Lisinopril 10mg daily, Multivitamin
Allergies: NKDA
Social History: Non-smoker, occasional alcohol use (1-2 drinks/week), works as an accountant (sedentary job with recent increased stress)
Family History: Father had MI at age 62, mother with hypertension`,

    objective: `Patient appears comfortable and in no acute distress during intake conversation. Reports pain is not currently present. Vital signs from previous visit (1 month ago): BP 128/82, HR 74, normal BMI. No obvious respiratory distress noted during conversation.`,

    assessment: `45-year-old female presenting with intermittent chest pain of one week duration. Based on description and timing, differential considerations include:
• Musculoskeletal chest pain (most likely given stress-related pattern)
• Atypical cardiac chest pain (concerning given family history)
• GERD/esophageal spasm
• Anxiety-related chest pain

Risk factors to consider: Family history of CAD, hypertension, work-related stress`,

    plan: `Need to complete physical examination and obtain vitals
Consider ECG and basic metabolic panel
Discuss stress management and lifestyle factors
Based on examination findings, may need cardiac workup vs reassurance and conservative management`
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MedicalHeader 
        user={user} 
        clinicName="Family Medicine Associates"
        notifications={3}
      />

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/medicare/doctor-dashboard">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Queue
                </Button>
              </Link>
              
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-foreground">Pre-Encounter Review</h1>
                  
                </div>
                <p className="text-muted-foreground">Review ChartPrep AI intake before starting encounter</p>
              </div>
            </div>

            <Link to={`/medicare/start-meeting/${patientId}`}>
              <Button size="lg" className="bg-gradient-success hover:opacity-90 shadow-medical">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Encounter
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Patient Info Sidebar */}
            <div className="space-y-6">
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Patient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">Age: {patient.age} • MRN: {patient.mrn}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Scheduled: {patient.appointmentTime}</span>
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      ✓ Intake Completed
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Chief Complaint</h4>
                    <p className="text-sm text-muted-foreground">{patient.chiefComplaint}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span>Clinical Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Family History Alert</p>
                        <p className="text-xs text-amber-700">Father had MI at age 62</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Last Visit</p>
                        <p className="text-xs text-blue-700">1 month ago - BP 128/82</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preliminary SOAP Note */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Preliminary SOAP Note</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary">
                      Generated by ChartPrep AI
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-8 h-8 bg-gradient-medical text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">S</span>
                      Subjective
                    </h3>
                    <div className="bg-background p-4 rounded-lg border">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {preliminarySOAP.subjective}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-8 h-8 bg-gradient-success text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">O</span>
                      Objective
                    </h3>
                    <div className="bg-background p-4 rounded-lg border">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {preliminarySOAP.objective}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">A</span>
                      Assessment
                    </h3>
                    <div className="bg-background p-4 rounded-lg border">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {preliminarySOAP.assessment}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">P</span>
                      Plan
                    </h3>
                    <div className="bg-background p-4 rounded-lg border">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {preliminarySOAP.plan}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between p-6 bg-white border rounded-lg shadow-card">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Ready to Begin Encounter</h3>
                <p className="text-sm text-muted-foreground">ChartPrep AI has prepared a preliminary assessment. Click "Start Encounter" to begin live documentation with Aura Scribe.</p>
              </div>
            </div>

            <Link to={`/medicare/start-meeting/${patientId}`}>
              <Button size="lg" className="bg-gradient-success hover:opacity-90 shadow-medical">
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Live Encounter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreEncounterView;