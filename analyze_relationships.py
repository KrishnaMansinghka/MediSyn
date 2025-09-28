#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def analyze_table_relationships():
    """Analyze the relationships between tables"""
    db = MediSynDB()
    
    print("🔍 Analyzing table relationships...")
    
    # Check appointments table
    appointments = db.execute_query('SELECT appointmentid, status FROM appointments ORDER BY appointmentid LIMIT 5')
    print(f"\n📊 Appointments (first 5):")
    for apt in appointments:
        print(f"  Appointment {apt['appointmentid']}: Status {apt['status']}")
    
    # Check patientappointment table
    try:
        pa_records = db.execute_query('SELECT patientid, appointmentid FROM patientappointment ORDER BY patientid, appointmentid LIMIT 10')
        print(f"\n🔗 PatientAppointment relationships (first 10):")
        for pa in pa_records:
            print(f"  Patient {pa['patientid']} -> Appointment {pa['appointmentid']}")
    except Exception as e:
        print(f"❌ PatientAppointment table error: {e}")
    
    # Check doctorpatient table
    try:
        dp_records = db.execute_query('SELECT docid, patientid, patient_status FROM doctorpatient ORDER BY docid, patientid LIMIT 10')
        print(f"\n🔗 DoctorPatient relationships (first 10):")
        for dp in dp_records:
            print(f"  Doctor {dp['docid']} -> Patient {dp['patientid']} (status: {dp['patient_status']})")
    except Exception as e:
        print(f"❌ DoctorPatient table error: {e}")
    
    # Check doctors table
    try:
        doctors = db.execute_query('SELECT docid, doctor_name, clinic_name FROM doctors ORDER BY docid LIMIT 5')
        print(f"\n👨‍⚕️ Doctors (first 5):")
        for doc in doctors:
            print(f"  Doctor {doc['docid']}: {doc['doctor_name']} at {doc['clinic_name']}")
    except Exception as e:
        print(f"❌ Doctors table error: {e}")
    
    # Test the specific issue: count appointments per patient
    print(f"\n🎯 Testing appointment counts per patient:")
    for patient_id in [1, 2, 3]:
        # Count distinct appointments for this patient
        distinct_apts = db.execute_query('SELECT COUNT(DISTINCT pa.appointmentid) as count FROM patientappointment pa WHERE pa.patientid = %s', (patient_id,))
        
        # Count total join results (this shows duplicates)
        join_results = db.get_patient_appointments_with_doctor(patient_id)
        
        print(f"  Patient {patient_id}: {distinct_apts[0]['count']} distinct appointments, but {len(join_results)} join results")

if __name__ == "__main__":
    analyze_table_relationships()