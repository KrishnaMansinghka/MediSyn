/**
 * MediSyn Database Schema Definition
 * This file defines the TypeScript interfaces for the local database structure
 */

export interface DatabaseMetadata {
  version: string;
  created: string;
  description: string;
  lastModified: string;
}

export interface Doctor {
  id: string;
  clinicName: string;
  doctorName: string;
  email: string;
  password: string; // Should be hashed in production
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: 'doctor';
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date string
  address: string;
  email: string;
  password: string; // Should be hashed in production
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: 'patient';
}

export interface Session {
  sessionId: string;
  userId: string;
  userType: 'doctor' | 'patient';
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface MediSynDatabase {
  metadata: DatabaseMetadata;
  doctors: Doctor[];
  patients: Patient[];
  sessions: Session[];
}

export type User = Doctor | Patient;

export interface SignUpFormData {
  // Doctor fields
  clinicName?: string;
  doctorName?: string;
  
  // Patient fields
  name?: string;
  dateOfBirth?: string;
  address?: string;
  
  // Common fields
  email: string;
  password: string;
  role: 'doctor' | 'patient';
}

export interface LoginFormData {
  email: string;
  password: string;
}