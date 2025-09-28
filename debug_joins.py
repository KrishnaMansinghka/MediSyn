#!/usr/bin/env python3
"""
Debug Join Queries Step by Step
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def debug_joins():
    """Debug the JOIN conditions step by step"""
    db = MediSynDB()
    
    if not db.connect():
        print("❌ Failed to connect to database")
        return
    
    print("🔍 Debugging JOIN Conditions...")
    print("=" * 40)
    
    # Check PatientAppointment mappings for patient 1
    print("\n1️⃣ PatientAppointment mappings for patient 1:")
    try:
        query1 = "SELECT * FROM PatientAppointment WHERE patientID = %s;"
        result1 = db.execute_query(query1, (1,))
        print(f"Found {len(result1)} mappings:")
        for row in result1:
            print(f"  Patient {row['patientid']} -> Appointment {row['appointmentid']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check DoctorPatient mappings for patient 1
    print("\n2️⃣ DoctorPatient mappings for patient 1:")
    try:
        query2 = "SELECT * FROM DoctorPatient WHERE patientID = %s;"
        result2 = db.execute_query(query2, (1,))
        print(f"Found {len(result2)} mappings:")
        for row in result2:
            print(f"  Doctor {row['docid']} -> Patient {row['patientid']} (status: {row['patient_status']})")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check if we can join PatientAppointment and Appointments
    print("\n3️⃣ Join PatientAppointment + Appointments for patient 1:")
    try:
        query3 = """
            SELECT pa.patientID, pa.appointmentID, a.status
            FROM PatientAppointment pa
            JOIN Appointments a ON pa.appointmentID = a.appointmentID
            WHERE pa.patientID = %s;
        """
        result3 = db.execute_query(query3, (1,))
        print(f"Found {len(result3)} joined records:")
        for row in result3:
            print(f"  Patient {row['patientid']} -> Appointment {row['appointmentid']} (status: {row['status']})")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check the problematic triple join
    print("\n4️⃣ Triple join: PatientAppointment + DoctorPatient + Doctors for patient 1:")
    try:
        query4 = """
            SELECT 
                pa.patientID,
                pa.appointmentID,
                dp.docID,
                d.doctor_name
            FROM PatientAppointment pa
            JOIN DoctorPatient dp ON pa.patientID = dp.patientID
            JOIN Doctors d ON dp.docID = d.docID
            WHERE pa.patientID = %s;
        """
        result4 = db.execute_query(query4, (1,))
        print(f"Found {len(result4)} joined records:")
        for row in result4:
            print(f"  Patient {row['patientid']} -> Appointment {row['appointmentid']} via Doctor {row['docid']} ({row['doctor_name']})")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check all DoctorPatient relationships
    print("\n5️⃣ All DoctorPatient relationships:")
    try:
        query5 = "SELECT * FROM DoctorPatient ORDER BY docID, patientID;"
        result5 = db.execute_query(query5)
        print(f"Found {len(result5)} total relationships:")
        for row in result5[:10]:  # Show first 10
            print(f"  Doctor {row['docid']} -> Patient {row['patientid']} (status: {row['patient_status']})")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    db.disconnect()
    print("\n✅ Debug complete")

if __name__ == "__main__":
    debug_joins()