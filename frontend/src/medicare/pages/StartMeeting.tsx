import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Square,
  Mic,
  MicOff,
  User,
  Users,
  BookOpen,
  ArrowLeft
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MedicalHeader from "../components/MedicalHeader";
import { usePatientQueue } from "../hooks/usePatientQueue";

interface TranscriptSegment {
  id: string;
  speaker: 'doctor' | 'patient';
  content: string;
  timestamp: Date;
}

interface SimilarPatient {
  name: string;
  age: number;
  condition: string;
  similarity: number;
}

interface ResearchUpdate {
  title: string;
  source: string;
  summary: string;
  date: Date;
}

const StartMeeting = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { updatePatientStatus } = usePatientQueue();
  const [isRecording, setIsRecording] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([
    {
      id: "1",
      speaker: "doctor",
      content: "Good morning, Sarah. I see from your intake that you've been experiencing some chest pain. Can you tell me more about what you've been feeling?",
      timestamp: new Date()
    },
    {
      id: "2",
      speaker: "patient", 
      content: "Yes, it started about a week ago. It's this dull aching feeling right in the center of my chest. It comes and goes, usually lasts about 10-15 minutes at a time.",
      timestamp: new Date()
    }
  ]);

  const similarPatients: SimilarPatient[] = [
    {
      name: "Emily R.",
      age: 42,
      condition: "Chest pain - Musculoskeletal",
      similarity: 94
    },
    {
      name: "Michael T.",
      age: 48,
      condition: "Atypical chest pain",
      similarity: 87
    },
    {
      name: "Lisa M.",
      age: 44,
      condition: "Stress-related chest pain",
      similarity: 82
    }
  ];

  const researchUpdates: ResearchUpdate[] = [
    {
      title: "Non-cardiac Chest Pain: Updated Guidelines 2024",
      source: "Journal of Internal Medicine",
      summary: "New diagnostic criteria for musculoskeletal chest pain in middle-aged patients...",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Stress-Induced Chest Pain: Recognition and Management",
      source: "American Heart Journal", 
      summary: "Study shows correlation between work stress and atypical chest pain presentations...",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    }
  ];

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const user = {
    name: "Dr. Sarah Mitchell",
    role: "physician"
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Simulate live transcript updates
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      const sampleUpdates = [
        { speaker: "patient" as const, content: "The pain doesn't go down my arms or anything like that. It's just right here in the center." },
        { speaker: "doctor" as const, content: "Good to know. Let me listen to your heart and lungs now." },
        { speaker: "patient" as const, content: "I've been worried because my dad had a heart attack when he was 62." },
        { speaker: "doctor" as const, content: "I understand your concern given the family history. Your heart sounds normal." }
      ];

      if (transcript.length < 8) {
        const randomUpdate = sampleUpdates[Math.floor(Math.random() * sampleUpdates.length)];
        setTranscript(prev => [...prev, {
          id: Date.now().toString(),
          ...randomUpdate,
          timestamp: new Date()
        }]);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isRecording, transcript.length]);

  const handleEndMeeting = () => {
    setIsRecording(false);
    
    // Update patient encounter status to completed
    if (patientId) {
      updatePatientStatus(patientId, { 
        encounterStatus: 'completed' 
      });
    }
    
    // Show success notification
    toast.success("Encounter completed successfully!", {
      description: "SOAP note and clinical summary have been generated. Patient status updated.",
      duration: 3000,
    });
    
    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      navigate('/medicare/doctor-dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      
      
      <MedicalHeader 
        user={user} 
        clinicName="MediSyn Health"
        notifications={3}
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Meeting Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h1 className="text-2xl font-bold text-foreground">Live Meeting - Krishna</h1>
              </div>
              <Badge className={isRecording ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                {isRecording ? "Recording" : "Stopped"}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsRecording(!isRecording)}
                className={isRecording ? "text-red-600 border-red-600 hover:bg-red-50" : ""}
              >
                {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecording ? "Pause" : "Resume"}
              </Button>
              
              <Button 
                onClick={handleEndMeeting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                End Meeting
              </Button>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Column 1: Chat Transcript */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span>Live Transcript</span>
                  {isRecording && <Badge className="bg-red-100 text-red-800 text-xs">Live</Badge>}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="h-96 overflow-y-auto space-y-4">
                  {transcript.map((segment) => (
                    <div key={segment.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          segment.speaker === 'doctor' 
                            ? 'bg-primary text-white' 
                            : 'bg-secondary text-white'
                        }`}>
                          {segment.speaker === 'doctor' ? 'DR' : 'PT'}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium uppercase">
                          {segment.speaker}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {segment.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="ml-10 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-foreground">{segment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Column 2: Similar Patients */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <span>Similar Patients</span>
                  <Badge className="bg-secondary/10 text-secondary text-xs">AI Match</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {similarPatients.map((patient, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-secondary/10 text-secondary text-xs">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">Age {patient.age}</p>
                        </div>
                      </div>
                      <Badge 
                        className={`text-xs ${
                          patient.similarity > 90 
                            ? 'bg-secondary/10 text-secondary' 
                            : 'bg-accent/10 text-accent-foreground'
                        }`}
                      >
                        {patient.similarity}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{patient.condition}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Column 3: Research Updates */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-accent-foreground" />
                  <span>Research Updates</span>
                  <Badge className="bg-accent/10 text-accent-foreground text-xs">Latest</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {researchUpdates.map((update, index) => (
                  <div key={index} className="space-y-3">
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <h4 className="font-medium text-sm text-foreground mb-2">{update.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{update.source}</p>
                      <p className="text-xs text-muted-foreground">{update.summary}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {update.date.toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          Read More
                        </Button>
                      </div>
                    </div>
                    {index < researchUpdates.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMeeting;