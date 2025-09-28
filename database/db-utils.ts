import { MediSynDatabase, Doctor, Patient, User, SignUpFormData, Session } from './schema';

// For browser environment, we'll use localStorage as the storage mechanism
const DB_KEY = 'medisyn_database';

// Default database structure
const DEFAULT_DB: MediSynDatabase = {
  metadata: {
    version: "1.0.0",
    created: new Date().toISOString().split('T')[0],
    description: "MediSyn Local Database Storage",
    lastModified: new Date().toISOString().split('T')[0]
  },
  doctors: [],
  patients: [],
  sessions: []
};

/**
 * MediSyn Database Utility Class
 * Provides CRUD operations for the local browser storage database
 */
export class MediSynDB {
  private static instance: MediSynDB;

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): MediSynDB {
    if (!MediSynDB.instance) {
      MediSynDB.instance = new MediSynDB();
    }
    return MediSynDB.instance;
  }

  /**
   * Initialize database with default structure if it doesn't exist
   */
  private initializeDatabase(): void {
    const existingData = localStorage.getItem(DB_KEY);
    if (!existingData) {
      this.writeDatabase(DEFAULT_DB);
    }
  }

  /**
   * Read the database from localStorage
   */
  private readDatabase(): MediSynDatabase {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        return DEFAULT_DB;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      return DEFAULT_DB;
    }
  }

  /**
   * Write to the database in localStorage
   */
  private writeDatabase(data: MediSynDatabase): void {
    try {
      // Update metadata
      data.metadata.lastModified = new Date().toISOString().split('T')[0];
      localStorage.setItem(DB_KEY, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing to database:', error);
      throw new Error('Failed to write to database');
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}_${timestamp}_${random}`;
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Create a new doctor account
   */
  async createDoctor(signupData: SignUpFormData): Promise<Doctor> {
    const db = this.readDatabase();
    
    // Check if email already exists
    const existingDoctor = db.doctors.find(doc => doc.email === signupData.email);
    if (existingDoctor) {
      throw new Error('Email already exists');
    }

    const newDoctor: Doctor = {
      id: this.generateId('doc'),
      clinicName: signupData.clinicName!,
      doctorName: signupData.doctorName!,
      email: signupData.email,
      password: signupData.password, // In production, hash this password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      role: 'doctor'
    };

    db.doctors.push(newDoctor);
    this.writeDatabase(db);
    
    return newDoctor;
  }

  /**
   * Create a new patient account
   */
  async createPatient(signupData: SignUpFormData): Promise<Patient> {
    const db = this.readDatabase();
    
    // Check if email already exists
    const existingPatient = db.patients.find(pat => pat.email === signupData.email);
    if (existingPatient) {
      throw new Error('Email already exists');
    }

    const newPatient: Patient = {
      id: this.generateId('pat'),
      name: signupData.name!,
      dateOfBirth: signupData.dateOfBirth!,
      address: signupData.address!,
      email: signupData.email,
      password: signupData.password, // In production, hash this password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      role: 'patient'
    };

    db.patients.push(newPatient);
    this.writeDatabase(db);
    
    return newPatient;
  }

  /**
   * Find user by email (doctor or patient)
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const db = this.readDatabase();
    
    const doctor = db.doctors.find(doc => doc.email === email);
    if (doctor) return doctor;
    
    const patient = db.patients.find(pat => pat.email === email);
    if (patient) return patient;
    
    return null;
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    const db = this.readDatabase();
    
    if (id.startsWith('doc_')) {
      return db.doctors.find(doc => doc.id === id) || null;
    }
    
    if (id.startsWith('pat_')) {
      return db.patients.find(pat => pat.id === id) || null;
    }
    
    return null;
  }

  /**
   * Authenticate user login
   */
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    
    if (user && user.password === password && user.isActive) {
      // In production, use proper password hashing comparison
      return user;
    }
    
    return null;
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Create a new session
   */
  async createSession(userId: string, userType: 'doctor' | 'patient'): Promise<Session> {
    const db = this.readDatabase();
    
    const session: Session = {
      sessionId: this.generateId('sess'),
      userId,
      userType,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      isActive: true
    };

    db.sessions.push(session);
    this.writeDatabase(db);
    
    return session;
  }

  /**
   * Find active session
   */
  async findSession(sessionId: string): Promise<Session | null> {
    const db = this.readDatabase();
    const session = db.sessions.find(s => s.sessionId === sessionId && s.isActive);
    
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
    
    return null;
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    const db = this.readDatabase();
    const sessionIndex = db.sessions.findIndex(s => s.sessionId === sessionId);
    
    if (sessionIndex !== -1) {
      db.sessions[sessionIndex].isActive = false;
      this.writeDatabase(db);
      return true;
    }
    
    return false;
  }

  // ==================== DATA QUERIES ====================

  /**
   * Get all doctors
   */
  async getAllDoctors(): Promise<Doctor[]> {
    const db = this.readDatabase();
    return db.doctors.filter(doc => doc.isActive);
  }

  /**
   * Get all patients
   */
  async getAllPatients(): Promise<Patient[]> {
    const db = this.readDatabase();
    return db.patients.filter(pat => pat.isActive);
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalDoctors: number;
    totalPatients: number;
    activeSessions: number;
    lastModified: string;
  }> {
    const db = this.readDatabase();
    const activeSessions = db.sessions.filter(s => 
      s.isActive && new Date(s.expiresAt) > new Date()
    ).length;

    return {
      totalDoctors: db.doctors.filter(d => d.isActive).length,
      totalPatients: db.patients.filter(p => p.isActive).length,
      activeSessions,
      lastModified: db.metadata.lastModified
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Backup database to localStorage with timestamp
   */
  async backupDatabase(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `${DB_KEY}_backup_${timestamp}`;
    
    try {
      const currentData = localStorage.getItem(DB_KEY);
      if (currentData) {
        localStorage.setItem(backupKey, currentData);
        return backupKey;
      } else {
        throw new Error('No database found to backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<number> {
    const db = this.readDatabase();
    const now = new Date();
    const initialCount = db.sessions.length;
    
    db.sessions = db.sessions.filter(session => 
      session.isActive && new Date(session.expiresAt) > now
    );
    
    this.writeDatabase(db);
    return initialCount - db.sessions.length;
  }
}

// Export singleton instance
export const mediSynDB = MediSynDB.getInstance();