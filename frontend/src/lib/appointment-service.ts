/**
 * Appointment Service for MediSyn Frontend
 * Handles API calls for appointment management
 */

const API_BASE_URL = 'http://localhost:8001/api';

interface AppointmentData {
  appointmentid: number;
  appointment_date: string;
  appointment_time: string;
  appointment_status: number;
  doctor_name: string;
  clinic_name: string;
  time_status: 'upcoming' | 'past';
}

interface PatientData {
  patientid: number;
  patient_name: string;
  patient_email: string;
  patient_status: number;
  appointmentid?: number;
  appointment_date?: string;
  appointment_time?: string;
  appointment_status?: number;
  display_time?: string;
}

interface AppointmentDetails {
  appointmentid: number;
  appointment_date: string;
  appointment_time: string;
  status: number;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  clinic_name: string;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const sessionData = localStorage.getItem('medisyn_session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return session.token;
    }
  } catch (error) {
    console.error('Error reading session:', error);
  }
  return null;
}

/**
 * Get patient appointments
 */
export async function getPatientAppointments(patientId: number): Promise<AppointmentData[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/appointments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid session and redirect to login
        localStorage.removeItem('medisyn_session');
        window.location.href = '/medicare/login';
        throw new Error('Authentication failed - please log in again');
      } else if (response.status === 403) {
        throw new Error('Access denied');
      } else {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data.appointments || [];
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    throw error;
  }
}

/**
 * Get doctor's patients with appointment info
 */
export async function getDoctorPatients(doctorId: number): Promise<PatientData[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/doctor/${doctorId}/patients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid session and redirect to login
        localStorage.removeItem('medisyn_session');
        window.location.href = '/medicare/login';
        throw new Error('Authentication failed - please log in again');
      } else if (response.status === 403) {
        throw new Error('Access denied');
      } else {
        throw new Error(`Failed to fetch patients: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data.patients || [];
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    throw error;
  }
}

/**
 * Get appointment details
 */
export async function getAppointmentDetails(appointmentId: number): Promise<AppointmentDetails> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/appointment/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      } else if (response.status === 404) {
        throw new Error('Appointment not found');
      } else {
        throw new Error(`Failed to fetch appointment details: ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    throw error;
  }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(appointmentId: number, status: number): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  if (![0, 1, 2].includes(status)) {
    throw new Error('Invalid status: Must be 0 (prerequisite), 1 (initial screening), or 2 (report)');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/appointment/${appointmentId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      } else if (response.status === 403) {
        throw new Error('Access denied: Only doctors can update appointment status');
      } else if (response.status === 404) {
        throw new Error('Appointment not found');
      } else {
        throw new Error(`Failed to update appointment status: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}

/**
 * Format appointment time for display
 */
export function formatAppointmentTime(time: string): string {
  try {
    const timeObj = new Date(`1970-01-01T${time}`);
    return timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return time;
  }
}

/**
 * Format appointment date for display
 */
export function formatAppointmentDate(date: string): string {
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return date;
  }
}

/**
 * Get status label for appointment
 */
export function getAppointmentStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return 'Prerequisite Required';
    case 1:
      return 'Initial Screening';
    case 2:
      return 'Report Available';
    default:
      return 'Unknown Status';
  }
}

/**
 * Get button text based on appointment status
 */
export function getAppointmentButtonText(status: number): string {
  switch (status) {
    case 0:
      return 'Complete Prerequisite';
    case 1:
      return 'View Initial Screening';
    case 2:
      return 'View Report';
    default:
      return 'View Details';
  }
}

export type { AppointmentData, PatientData, AppointmentDetails };