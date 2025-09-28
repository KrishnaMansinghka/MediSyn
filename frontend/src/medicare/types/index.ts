// MediSyn AI - Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export type UserRole = 'patient' | 'doctor' | 'clinic_admin';

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: Date;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  licenseNumber: string;
  clinicId: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  specialty: string;
  adminId: string;
  providers: Doctor[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  scheduledTime: Date;
  duration: number;
  status: AppointmentStatus;
  intakeStatus: IntakeStatus;
  encounterStatus: EncounterStatus;
}

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';
export type IntakeStatus = 'not_started' | 'in_progress' | 'completed';
export type EncounterStatus = 'waiting' | 'in_progress' | 'documenting' | 'signed';

export interface ChartPrepIntake {
  id: string;
  appointmentId: string;
  patientId: string;
  messages: ChatMessage[];
  preliminarySOAP: SOAPNote;
  status: IntakeStatus;
  startedAt: Date;
  completedAt?: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'patient' | 'ai';
  timestamp: Date;
  type: 'text' | 'structured_data';
}

export interface SOAPNote {
  id: string;
  appointmentId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  doctorId: string;
  createdAt: Date;
  updatedAt: Date;
  signed: boolean;
  signedAt?: Date;
}

export interface EncounterTranscript {
  id: string;
  appointmentId: string;
  transcript: TranscriptSegment[];
  liveSOAP: SOAPNote;
  differential: DiagnosisOption[];
  status: 'recording' | 'completed';
}

export interface TranscriptSegment {
  id: string;
  speaker: 'doctor' | 'patient';
  content: string;
  timestamp: Date;
  confidence: number;
}

export interface DiagnosisOption {
  id: string;
  condition: string;
  icd10Code: string;
  probability: number;
  reasoning: string;
  supportingEvidence: string[];
}

export interface ClinicalNudge {
  id: string;
  type: NudgeType;
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'critical';
  actionRequired: boolean;
  relatedConditions: string[];
  citations?: string[];
}

export type NudgeType = 
  | 'case_similarity' 
  | 'literature_watch' 
  | 'cost_analysis' 
  | 'safety_alert' 
  | 'formulary_check';

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescriberId: string;
}