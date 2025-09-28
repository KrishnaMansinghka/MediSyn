import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Save, 
  Send, 
  Download,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import MedicalHeader from "../components/MedicalHeader";

interface PreAuthData {
  patientName: string;
  patientDOB: string;
  insuranceId: string;
  treatmentRequested: string;
  diagnosis: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  clinicalNotes: string;
  priorTreatments: string;
}

const PreAuthScreen = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PreAuthData>({
    patientName: "Krishna",
    patientDOB: "03/15/1979",
    insuranceId: "INS-789456123",
    treatmentRequested: "Physical Therapy - 8 sessions",
    diagnosis: "Musculoskeletal chest pain (ICD-10: M79.3)",
    medicationName: "Ibuprofen",
    dosage: "400mg",
    frequency: "Every 6-8 hours",
    duration: "2 weeks",
    clinicalNotes: "Patient presents with chest pain x 1 week. Physical exam reveals normal heart/lung sounds. Muscle strain likely due to work stress and posture. Conservative treatment recommended.",
    priorTreatments: "Over-the-counter NSAIDs with minimal relief"
  });

  const user = {
    name: "Dr. Sarah Mitchell",
    role: "physician"
  };

  const handleInputChange = (field: keyof PreAuthData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...", formData);
    // Save functionality
  };

  const handleExportPDF = () => {
    console.log("Exporting PDF...", formData);
    // PDF export functionality
  };

  const handleSendToInsurance = () => {
    console.log("Sending to insurance...", formData);
    // Send functionality
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
          {/* Header */}
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pre-Authorization Request</h1>
                <p className="text-muted-foreground">Patient ID: {patientId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                className="border-secondary/20 text-secondary hover:bg-secondary/5"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                className="border-accent/20 text-accent-foreground hover:bg-accent/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              
              <Button 
                onClick={handleSendToInsurance}
                className="bg-primary hover:bg-primary-dark"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Insurance
              </Button>
            </div>
          </div>

          {/* Split View Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Side: Editable Form */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Pre-Authorization Form</span>
                  <Badge className="bg-primary/10 text-primary text-xs">Editable</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input 
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) => handleInputChange('patientName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientDOB">Date of Birth</Label>
                      <Input 
                        id="patientDOB"
                        value={formData.patientDOB}
                        onChange={(e) => handleInputChange('patientDOB', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceId">Insurance ID</Label>
                    <Input 
                      id="insuranceId"
                      value={formData.insuranceId}
                      onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                    />
                  </div>
                </div>

                {/* Treatment Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Treatment Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="treatmentRequested">Treatment Requested</Label>
                    <Input 
                      id="treatmentRequested"
                      value={formData.treatmentRequested}
                      onChange={(e) => handleInputChange('treatmentRequested', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea 
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Medication Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Medication Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicationName">Medication</Label>
                      <Input 
                        id="medicationName"
                        value={formData.medicationName}
                        onChange={(e) => handleInputChange('medicationName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input 
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => handleInputChange('dosage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input 
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => handleInputChange('frequency', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input 
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                    />
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Clinical Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                    <Textarea 
                      id="clinicalNotes"
                      value={formData.clinicalNotes}
                      onChange={(e) => handleInputChange('clinicalNotes', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priorTreatments">Prior Treatments</Label>
                    <Textarea 
                      id="priorTreatments"
                      value={formData.priorTreatments}
                      onChange={(e) => handleInputChange('priorTreatments', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Side: Live Preview */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-secondary" />
                  <span>Live Preview</span>
                  <Badge className="bg-secondary/10 text-secondary text-xs">Auto-Update</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {/* Letter Template Preview */}
                <div className="bg-white border rounded-lg p-6 shadow-inner space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">MediSyn Health</h2>
                    <p className="text-gray-600">Prior Authorization Request</p>
                    <p className="text-sm text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  {/* Insurance Information */}
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">To: Insurance Provider</p>
                    <p className="text-gray-600">RE: Prior Authorization Request</p>
                  </div>

                  {/* Patient Details */}
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-gray-800">Patient Information:</h3>
                    <p><span className="font-medium">Name:</span> {formData.patientName}</p>
                    <p><span className="font-medium">Date of Birth:</span> {formData.patientDOB}</p>
                    <p><span className="font-medium">Insurance ID:</span> {formData.insuranceId}</p>
                  </div>

                  {/* Treatment Request */}
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-gray-800">Treatment Request:</h3>
                    <p>{formData.treatmentRequested}</p>
                  </div>

                  {/* Clinical Information */}
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-gray-800">Clinical Justification:</h3>
                    <p><span className="font-medium">Diagnosis:</span> {formData.diagnosis}</p>
                    <p><span className="font-medium">Clinical Notes:</span> {formData.clinicalNotes}</p>
                    <p><span className="font-medium">Prior Treatments:</span> {formData.priorTreatments}</p>
                  </div>

                  {/* Medication Information */}
                  {formData.medicationName && (
                    <div className="space-y-2 text-sm">
                      <h3 className="font-semibold text-gray-800">Medication Details:</h3>
                      <p><span className="font-medium">Medication:</span> {formData.medicationName} {formData.dosage}</p>
                      <p><span className="font-medium">Frequency:</span> {formData.frequency}</p>
                      <p><span className="font-medium">Duration:</span> {formData.duration}</p>
                    </div>
                  )}

                  {/* Provider Signature */}
                  <div className="border-t pt-4 mt-6">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Dr. Sarah Mitchell, MD</p>
                      <p>Internal Medicine</p>
                      <p>MediSyn Health</p>
                      <p>License: MD-12345</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreAuthScreen;