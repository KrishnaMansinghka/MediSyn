import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MedicalHeader from "../components/MedicalHeader";
import { z } from "zod";
import { updateAppointmentPrerequisite } from "../../lib/appointment-service";

const prerequisiteSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  insuranceProvider: z.string().min(1, "Insurance provider is required"),
  insurancePlan: z.string().min(1, "Insurance plan is required"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Valid phone number is required"),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PrerequisiteData = z.infer<typeof prerequisiteSchema>;

const PrerequisiteInformation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { appointmentId } = useParams();
  
  const user = { name: "Krishna", role: "patient" };
  
  // Get current user from localStorage 
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const sessionData = localStorage.getItem('medisyn_session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      setCurrentUser(session.user);
    }
  }, []);

  const [formData, setFormData] = useState<PrerequisiteData>({
    gender: "",
    height: "",
    weight: "",
    insuranceProvider: "",
    insurancePlan: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergies: "",
    medications: "",
    medicalHistory: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof PrerequisiteData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      prerequisiteSchema.parse(formData);
      
      // We need to get an appointment ID - for now, we'll use the most recent appointment
      // In a real app, this would be passed via URL params or context
      let targetAppointmentId = appointmentId ? parseInt(appointmentId) : null;
      
      if (!targetAppointmentId && currentUser) {
        // If no specific appointment ID, we could get the user's active appointment
        // For now, we'll use a placeholder - this should be improved
        toast({
          title: "Error",
          description: "No appointment ID specified. Please access this form from your appointment.",
          variant: "destructive"
        });
        return;
      }
      
      // Call the API to update prerequisite information
      await updateAppointmentPrerequisite(targetAppointmentId!, {
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        insuranceProvider: formData.insuranceProvider,
        insurancePlan: formData.insurancePlan,
        emergencyContactPhone: formData.emergencyContactPhone,
        allergies: formData.allergies,
        medications: formData.medications,
        medicalHistory: formData.medicalHistory,
      });
      
      toast({
        title: "Information saved successfully",
        description: "Your prerequisite information has been updated.",
      });
      
      navigate('/medicare/patient-dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Handle API errors
        toast({
          title: "Error saving information",
          description: error instanceof Error ? error.message : "Failed to save prerequisite information",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MedicalHeader 
        user={user} 
        clinicName="MediSyn Health"
        notifications={0}
      />

      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Complete Prerequisite Information</h1>
              <p className="text-muted-foreground">Please provide your basic information for your medical records</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Personal & Medical Information</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (ft/in or cm) *</Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      placeholder="e.g., 5'6&quot; or 168 cm"
                      className={errors.height ? "border-destructive" : ""}
                    />
                    {errors.height && <p className="text-sm text-destructive">{errors.height}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs or kg) *</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="e.g., 150 lbs or 68 kg"
                      className={errors.weight ? "border-destructive" : ""}
                    />
                    {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className={errors.emergencyContactPhone ? "border-destructive" : ""}
                    />
                    {errors.emergencyContactPhone && <p className="text-sm text-destructive">{errors.emergencyContactPhone}</p>}
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Insurance Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                      <Select value={formData.insuranceProvider} onValueChange={(value) => handleInputChange("insuranceProvider", value)}>
                        <SelectTrigger className={errors.insuranceProvider ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select insurance provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue-cross">Blue Cross Blue Shield</SelectItem>
                          <SelectItem value="aetna">Aetna</SelectItem>
                          <SelectItem value="cigna">Cigna</SelectItem>
                          <SelectItem value="humana">Humana</SelectItem>
                          <SelectItem value="united">United Healthcare</SelectItem>
                          <SelectItem value="medicare">Medicare</SelectItem>
                          <SelectItem value="medicaid">Medicaid</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.insuranceProvider && <p className="text-sm text-destructive">{errors.insuranceProvider}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurancePlan">Insurance Plan *</Label>
                      <Input
                        id="insurancePlan"
                        value={formData.insurancePlan}
                        onChange={(e) => handleInputChange("insurancePlan", e.target.value)}
                        placeholder="e.g., Gold Plan, PPO, HMO"
                        className={errors.insurancePlan ? "border-destructive" : ""}
                      />
                      {errors.insurancePlan && <p className="text-sm text-destructive">{errors.insurancePlan}</p>}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Emergency Contact</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                      placeholder="Full name of emergency contact"
                      className={errors.emergencyContactName ? "border-destructive" : ""}
                    />
                    {errors.emergencyContactName && <p className="text-sm text-destructive">{errors.emergencyContactName}</p>}
                  </div>
                </div>

                {/* Medical History (Optional) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Medical History (Optional)</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Known Allergies</Label>
                      <Textarea
                        id="allergies"
                        value={formData.allergies}
                        onChange={(e) => handleInputChange("allergies", e.target.value)}
                        placeholder="List any known allergies (food, medications, environmental)"
                        className="min-h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medications">Current Medications</Label>
                      <Textarea
                        id="medications"
                        value={formData.medications}
                        onChange={(e) => handleInputChange("medications", e.target.value)}
                        placeholder="List current medications and dosages"
                        className="min-h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalHistory">Medical History</Label>
                      <Textarea
                        id="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                        placeholder="Previous surgeries, chronic conditions, family history"
                        className="min-h-24"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Information"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrerequisiteInformation;