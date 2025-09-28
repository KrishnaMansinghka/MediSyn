import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut,
  ArrowLeft,
  Printer
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import MedicalHeader from "../components/MedicalHeader";

const ViewReport = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(100);

  // Get user role from URL or context - for demo, determine from current route
  const isPatientView = window.location.pathname.includes('/patient-report/');
  
  const user = isPatientView 
    ? { name: "Krishna", role: "patient" }
    : { name: "Dr. Sarah Mitchell", role: "physician" };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    // Simulate PDF download
    console.log("Downloading report...");
  };

  const handleShare = () => {
    // Simulate sharing functionality
    console.log("Sharing report...");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      
      
      <MedicalHeader 
        user={user} 
        clinicName="MediSyn Health"
        notifications={isPatientView ? 0 : 3}
      />

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
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
                <h1 className="text-2xl font-bold text-foreground">Patient Report</h1>
                <p className="text-muted-foreground">Patient ID: {patientId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-12 text-center">{zoomLevel}%</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="border-secondary/20 text-secondary hover:bg-secondary/5"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button 
                onClick={handleShare}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* PDF Viewer Container */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>{isPatientView ? "My Medical Report" : "Medical Report - Krishna"}</span>
              <Badge className="bg-secondary/10 text-secondary">Discharge Summary</Badge>
            </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Mock PDF Viewer */}
              <div 
                className="bg-white border rounded-lg shadow-inner overflow-auto"
                style={{ 
                  height: '600px',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: `${100 * (100 / zoomLevel)}%`
                }}
              >
                <div className="p-8 space-y-6 max-w-3xl mx-auto">
                  {/* Document Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">MediSyn Health</h2>
                    <p className="text-gray-600">Discharge Summary Report</p>
                    <p className="text-sm text-gray-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                  </div>

                  {/* Patient Information */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Patient Information</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> Krishna</p>
                        <p><span className="font-medium">DOB:</span> 03/15/1979</p>
                        <p><span className="font-medium">Age:</span> 45 years</p>
                        <p><span className="font-medium">MRN:</span> MR-2024-001</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Visit Details</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Date of Service:</span> {new Date().toLocaleDateString()}</p>
                        <p><span className="font-medium">Provider:</span> Dr. Sarah Mitchell, MD</p>
                        <p><span className="font-medium">Visit Type:</span> Follow-up Consultation</p>
                      </div>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Chief Complaint</h3>
                    <p className="text-sm text-gray-700">
                      45-year-old female presents with chest pain that has been ongoing for approximately one week.
                    </p>
                  </div>

                  {/* Assessment */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Assessment & Plan</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>Primary Diagnosis:</strong> Musculoskeletal chest pain (ICD-10: M79.3)</p>
                      <p><strong>Clinical Findings:</strong> Physical examination revealed normal heart and lung sounds. Vital signs stable. No signs of acute cardiac distress.</p>
                      <p><strong>Treatment Plan:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Continue current NSAIDs as needed for pain management</li>
                        <li>Stress reduction techniques and ergonomic workplace assessment</li>
                        <li>Follow-up in 2 weeks if symptoms persist</li>
                        <li>Return immediately if chest pain worsens or new symptoms develop</li>
                      </ul>
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Medications</h3>
                    <div className="text-sm text-gray-700">
                      <p>Ibuprofen 400mg every 6-8 hours as needed for pain (current medication)</p>
                    </div>
                  </div>

                  {/* Follow-up Instructions */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Patient Instructions</h3>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      <li>Monitor chest pain intensity and frequency</li>
                      <li>Apply heat/cold therapy as tolerated</li>
                      <li>Maintain gentle activity, avoid heavy lifting</li>
                      <li>Schedule follow-up appointment in 2 weeks</li>
                    </ul>
                  </div>

                  {/* Provider Signature */}
                  <div className="border-t pt-4 mt-8">
                    <div className="text-right text-sm text-gray-600">
                      <p className="font-medium">Dr. Sarah Mitchell, MD</p>
                      <p>Internal Medicine</p>
                      <p>License: MD-12345</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewReport;