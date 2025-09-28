import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  ExternalLink,
  User,
  Calendar,
  Clock
} from "lucide-react";

interface InitialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName?: string;
}

const InitialReportModal = ({ isOpen, onClose, patientId, patientName = "Patient" }: InitialReportModalProps) => {
  
  const handleViewFullReport = () => {
    // Open PDF in new tab
    const pdfUrl = `/api/reports/initial/${patientId}`;
    window.open(pdfUrl, '_blank');
  };

  const handleDownload = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = `/api/reports/initial/${patientId}`;
    link.download = `initial-report-${patientName.replace(' ', '-').toLowerCase()}.pdf`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Initial Patient Report</span>
          </DialogTitle>
          <DialogDescription>
            Review the AI-generated initial assessment before starting the encounter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{patientName}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date().toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary ml-auto">
              AI Generated
            </Badge>
          </div>

          {/* Report Preview */}
          <div className="border rounded-lg p-4 bg-background">
            <h4 className="font-semibold text-foreground mb-3">Report Summary</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Chief Complaint:</span>
                <p className="text-muted-foreground mt-1">
                  45-year-old female presents with chest pain that has been ongoing for approximately one week.
                </p>
              </div>
              
              <div>
                <span className="font-medium text-foreground">Preliminary Assessment:</span>
                <p className="text-muted-foreground mt-1">
                  Based on AI analysis of intake responses, most likely diagnosis appears to be musculoskeletal chest pain. 
                  Family history of cardiac events noted. Requires physical examination for definitive assessment.
                </p>
              </div>

              <div>
                <span className="font-medium text-foreground">Risk Factors:</span>
                <p className="text-muted-foreground mt-1">
                  Family history of MI, work-related stress, sedentary lifestyle
                </p>
              </div>

              <div>
                <span className="font-medium text-foreground">Recommended Actions:</span>
                <p className="text-muted-foreground mt-1">
                  Physical examination, vital signs, ECG consideration, stress management discussion
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button 
              onClick={handleViewFullReport}
              className="flex-1 bg-primary hover:bg-primary-dark"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Full Report in New Tab
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownload}
              className="border-secondary/20 text-secondary hover:bg-secondary/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <strong>Note:</strong> This initial report is generated by AI based on patient intake responses. 
            It should be used as a starting point for clinical assessment and does not replace clinical judgment.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialReportModal;