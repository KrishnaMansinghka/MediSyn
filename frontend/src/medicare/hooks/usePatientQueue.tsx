import { useState, createContext, useContext, ReactNode } from 'react';

export interface PatientQueueItem {
  id: string;
  name: string;
  time: string;
  intakeStatus: 'not_started' | 'in_progress' | 'completed';
  encounterStatus: 'waiting' | 'in_progress' | 'completed';
  chiefComplaint?: string;
}

interface PatientQueueContextType {
  patientQueue: PatientQueueItem[];
  updatePatientStatus: (patientId: string, updates: Partial<PatientQueueItem>) => void;
}

const PatientQueueContext = createContext<PatientQueueContextType | undefined>(undefined);

export const usePatientQueue = () => {
  const context = useContext(PatientQueueContext);
  if (!context) {
    throw new Error('usePatientQueue must be used within a PatientQueueProvider');
  }
  return context;
};

interface PatientQueueProviderProps {
  children: ReactNode;
}

export const PatientQueueProvider = ({ children }: PatientQueueProviderProps) => {
  const [patientQueue, setPatientQueue] = useState<PatientQueueItem[]>([
    {
      id: "1",
      name: "Krishna",
      time: "9:00 AM",
      intakeStatus: "completed",
      encounterStatus: "waiting",
      chiefComplaint: "Chest pain, ongoing for 1 week"
    },
    {
      id: "2", 
      name: "Michael Chen",
      time: "9:30 AM",
      intakeStatus: "completed",
      encounterStatus: "completed",
      chiefComplaint: "Annual physical examination"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      time: "10:00 AM", 
      intakeStatus: "completed",
      encounterStatus: "waiting"
    },
    {
      id: "4",
      name: "David Wilson",
      time: "10:30 AM",
      intakeStatus: "in_progress",
      encounterStatus: "waiting"
    },
    {
      id: "5",
      name: "Lisa Park",
      time: "11:00 AM",
      intakeStatus: "completed",
      encounterStatus: "completed"
    }
  ]);

  const updatePatientStatus = (patientId: string, updates: Partial<PatientQueueItem>) => {
    setPatientQueue(prevQueue => 
      prevQueue.map(patient => 
        patient.id === patientId 
          ? { ...patient, ...updates }
          : patient
      )
    );
  };

  return (
    <PatientQueueContext.Provider value={{ patientQueue, updatePatientStatus }}>
      {children}
    </PatientQueueContext.Provider>
  );
};