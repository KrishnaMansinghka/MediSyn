#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def test_patient_appointments():
    """Test the patient appointments query directly"""
    db = MediSynDB()
    
    print("🔍 Testing patient appointments query...")
    
    # Test for a few different patient IDs
    for patient_id in [1, 2, 3]:
        print(f"\n👤 Patient ID {patient_id}:")
        appointments = db.get_patient_appointments_with_doctor(patient_id)
        
        if appointments:
            print(f"  Found {len(appointments)} appointments:")
            for apt in appointments:
                print(f"    - Appointment {apt['appointmentid']}: Status {apt['appointment_status']} ({apt['time_status']})")
                print(f"      Doctor: {apt['doctor_name']} at {apt['clinic_name']}")
        else:
            print("  No appointments found")
    
    # Also check the raw table connections
    print(f"\n🔗 Checking table relationships...")
    
    # Check PatientAppointment table
    patient_appointments = db.execute_query('SELECT * FROM "PatientAppointment" ORDER BY patientID, appointmentID')
    print(f"PatientAppointment records: {len(patient_appointments)}")
    for pa in patient_appointments[:5]:  # Show first 5
        print(f"  Patient {pa['patientid']} -> Appointment {pa['appointmentid']}")
    
    # Check DoctorPatient table
    doctor_patients = db.execute_query('SELECT * FROM "DoctorPatient" ORDER BY docID, patientID')
    print(f"DoctorPatient records: {len(doctor_patients)}")
    for dp in doctor_patients[:5]:  # Show first 5
        print(f"  Doctor {dp['docid']} -> Patient {dp['patientid']} (status: {dp['patient_status']})")

if __name__ == "__main__":
    test_patient_appointments()