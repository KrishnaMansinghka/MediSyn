#!/usr/bin/env python3
"""
Test Updated Appointment Queries
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def test_appointment_queries():
    """Test the updated appointment queries"""
    db = MediSynDB()
    
    if not db.connect():
        print("❌ Failed to connect to database")
        return
    
    print("🧪 Testing Updated Appointment Queries...")
    print("=" * 50)
    
    # Test patient appointments (using patient ID 1 - Alice Smith)
    print("\n📅 Testing Patient Appointments (Patient ID 1):")
    print("-" * 45)
    try:
        appointments = db.get_patient_appointments_with_doctor(1)
        print(f"Found {len(appointments)} appointments for patient 1")
        for apt in appointments:
            print(f"  Appointment {apt['appointmentid']}: {apt['doctor_name']} at {apt['clinic_name']}")
            print(f"    Status: {apt['appointment_status']}, Time Status: {apt['time_status']}")
            print(f"    Date: {apt['appointment_date']}, Time: {apt['appointment_time']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test doctor patients (using doctor ID 1)
    print("\n👨‍⚕️ Testing Doctor Patients (Doctor ID 1):")
    print("-" * 42)
    try:
        patients = db.get_doctor_patients_with_appointments(1)
        print(f"Found {len(patients)} patients for doctor 1")
        for patient in patients:
            print(f"  Patient {patient['patientid']}: {patient['patient_name']}")
            print(f"    Email: {patient['patient_email']}")
            print(f"    Status: {patient['patient_status']}")
            if patient['appointmentid']:
                print(f"    Appointment {patient['appointmentid']}: Status {patient['appointment_status']}")
                print(f"    Display Time: {patient['display_time']}")
            else:
                print(f"    No appointment scheduled")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test appointment details
    print("\n🔍 Testing Appointment Details (Appointment ID 1):")
    print("-" * 48)
    try:
        details = db.get_appointment_details(1)
        if details:
            print(f"  Appointment {details['appointmentid']}")
            print(f"  Patient: {details['patient_name']}")
            print(f"  Doctor: {details['doctor_name']}")
            print(f"  Status: {details['status']}")
            print(f"  Date: {details['appointment_date']}")
            print(f"  Time: {details['appointment_time']}")
        else:
            print("  No appointment found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    db.disconnect()
    print("\n✅ Test complete")

if __name__ == "__main__":
    test_appointment_queries()