#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def check_appointments():
    """Check appointment data and statuses"""
    db = MediSynDB()
    
    print("🔍 Checking appointment data...")
    
    # Get all appointments
    appointments = db.execute_query('SELECT appointmentid, patientid, doctorid, appointment_status FROM "Appointments" ORDER BY appointmentid')
    
    print(f"\n📊 Found {len(appointments)} appointments:")
    print("AppointmentID | PatientID | DoctorID | Status")
    print("-" * 50)
    
    for apt in appointments:
        print(f"{apt['appointmentid']:12} | {apt['patientid']:9} | {apt['doctorid']:8} | {apt['appointment_status']}")
    
    # Count by status
    status_counts = db.execute_query('SELECT appointment_status, COUNT(*) as count FROM "Appointments" GROUP BY appointment_status ORDER BY appointment_status')
    
    print(f"\n📈 Status distribution:")
    for status in status_counts:
        print(f"Status {status['appointment_status']}: {status['count']} appointments")
    
    # Check if any status 0 exists
    status_0 = db.execute_query('SELECT COUNT(*) as count FROM "Appointments" WHERE appointment_status = 0')
    print(f"\n🔍 Status 0 appointments: {status_0[0]['count']}")
    
    db.close()

if __name__ == "__main__":
    check_appointments()