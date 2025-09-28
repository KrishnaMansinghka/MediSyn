#!/usr/bin/env python3
"""
PostgreSQL Database Utility for MediSyn
A simple utility class for database operations
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MediSynDB:
    """PostgreSQL Database utility class for MediSyn"""
    
    def __init__(self):
        """Initialize database connection"""
        self.load_config()
        self.connection = None
    
    def load_config(self):
        """Load database configuration from environment"""
        env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
        load_dotenv(env_path)
        
        self.config = {
            'host': os.getenv('DB_HOST'),
            'database': os.getenv('DB_NAME'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'port': os.getenv('DB_PORT', '5432')
        }
        
        if not all(self.config.values()):
            raise ValueError("Missing database configuration in .env file")
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(
                host=self.config['host'],
                database=self.config['database'],
                user=self.config['user'],
                password=self.config['password'],
                port=self.config['port'],
                cursor_factory=RealDictCursor
            )
            logger.info("Database connection established")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        if not self.connection:
            if not self.connect():
                return []
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            return []
    
    def execute_update(self, query: str, params: tuple = None) -> bool:
        """Execute an INSERT, UPDATE, or DELETE query"""
        if not self.connection:
            if not self.connect():
                return False
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                logger.info(f"Update executed successfully, {cursor.rowcount} rows affected")
                return True
        except Exception as e:
            logger.error(f"Update execution failed: {e}")
            self.connection.rollback()
            return False
    
    # Patient operations
    def create_patient(self, name: str, dob: str, email: str, address: str, password: str) -> Optional[int]:
        """Create a new patient"""
        query = """
            INSERT INTO Patient (name, DOB, email, address, password)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING patientID;
        """
        
        if not self.connection:
            if not self.connect():
                return None
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, (name, dob, email, address, password))
                patient_id = cursor.fetchone()['patientid']
                self.connection.commit()
                logger.info(f"Patient created with ID: {patient_id}")
                return patient_id
        except Exception as e:
            logger.error(f"Failed to create patient: {e}")
            self.connection.rollback()
            return None
    
    def get_patient_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get patient by email"""
        query = "SELECT * FROM Patient WHERE email = %s;"
        results = self.execute_query(query, (email,))
        return results[0] if results else None
    
    def get_all_patients(self) -> List[Dict[str, Any]]:
        """Get all patients"""
        query = "SELECT * FROM Patient ORDER BY name;"
        return self.execute_query(query)
    
    # Doctor operations
    def create_doctor(self, clinic_name: str, doctor_name: str, email: str, password: str) -> Optional[int]:
        """Create a new doctor"""
        query = """
            INSERT INTO Doctors (clinic_name, doctor_name, email, password)
            VALUES (%s, %s, %s, %s)
            RETURNING docID;
        """
        
        if not self.connection:
            if not self.connect():
                return None
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, (clinic_name, doctor_name, email, password))
                doctor_id = cursor.fetchone()['docid']
                self.connection.commit()
                logger.info(f"Doctor created with ID: {doctor_id}")
                return doctor_id
        except Exception as e:
            logger.error(f"Failed to create doctor: {e}")
            self.connection.rollback()
            return None
    
    def get_doctor_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get doctor by email"""
        query = "SELECT * FROM Doctors WHERE email = %s;"
        results = self.execute_query(query, (email,))
        return results[0] if results else None
    
    def get_all_doctors(self) -> List[Dict[str, Any]]:
        """Get all doctors"""
        query = "SELECT * FROM Doctors ORDER BY doctor_name;"
        return self.execute_query(query)
    
    # Appointment operations
    def create_appointment(self, status: int = 0, **kwargs) -> Optional[int]:
        """Create a new appointment"""
        fields = ['status']
        values = [status]
        placeholders = ['%s']
        
        # Add optional fields
        for field, value in kwargs.items():
            if value is not None:
                fields.append(field)
                values.append(value)
                placeholders.append('%s')
        
        query = f"""
            INSERT INTO Appointments ({', '.join(fields)})
            VALUES ({', '.join(placeholders)})
            RETURNING appointmentID;
        """
        
        if not self.connection:
            if not self.connect():
                return None
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, tuple(values))
                appointment_id = cursor.fetchone()['appointmentid']
                self.connection.commit()
                logger.info(f"Appointment created with ID: {appointment_id}")
                return appointment_id
        except Exception as e:
            logger.error(f"Failed to create appointment: {e}")
            self.connection.rollback()
            return None
    
    def get_patient_appointments(self, patient_id: int) -> List[Dict[str, Any]]:
        """Get all appointments for a patient"""
        query = """
            SELECT a.*, p.name as patient_name
            FROM Appointments a
            JOIN PatientAppointment pa ON a.appointmentID = pa.appointmentID
            JOIN Patient p ON pa.patientID = p.patientID
            WHERE pa.patientID = %s
            ORDER BY a.appointmentID DESC;
        """
        return self.execute_query(query, (patient_id,))
    
    def assign_patient_to_doctor(self, doctor_id: int, patient_id: int, status: int = 0) -> bool:
        """Assign a patient to a doctor"""
        query = """
            INSERT INTO DoctorPatient (docID, patientID, patient_status)
            VALUES (%s, %s, %s)
            ON CONFLICT (docID, patientID) DO UPDATE SET patient_status = EXCLUDED.patient_status;
        """
        return self.execute_update(query, (doctor_id, patient_id, status))
    
    def assign_appointment_to_patient(self, patient_id: int, appointment_id: int) -> bool:
        """Assign an appointment to a patient"""
        query = """
            INSERT INTO PatientAppointment (patientID, appointmentID)
            VALUES (%s, %s);
        """
        return self.execute_update(query, (patient_id, appointment_id))

# Example usage
if __name__ == "__main__":
    # Example of how to use the utility class
    db = MediSynDB()
    
    if db.connect():
        print("✅ Connected to database")
        
        # Example: Get all patients
        patients = db.get_all_patients()
        print(f"📊 Found {len(patients)} patients")
        
        # Example: Get all doctors
        doctors = db.get_all_doctors()
        print(f"👩‍⚕️ Found {len(doctors)} doctors")
        
        db.disconnect()
    else:
        print("❌ Failed to connect to database")