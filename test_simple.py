#!/usr/bin/env python3
"""
Test simplified query without complex calculations
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def test_simple_query():
    """Test a simple query first"""
    db = MediSynDB()
    
    if not db.connect():
        print("❌ Failed to connect to database")
        return
    
    print("🧪 Testing Simple Queries...")
    print("=" * 30)
    
    # Test 1: Very simple query without parameters
    print("\n1️⃣ Testing simple query without parameters:")
    try:
        query1 = "SELECT COUNT(*) as count FROM Appointments;"
        with db.connection.cursor() as cursor:
            cursor.execute(query1)
            result = cursor.fetchall()
            print(f"✅ Found {result[0]['count']} appointments total")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Simple query with parameter
    print("\n2️⃣ Testing simple query with parameter:")
    try:
        query2 = "SELECT * FROM PatientAppointment WHERE patientID = %s;"
        with db.connection.cursor() as cursor:
            cursor.execute(query2, (1,))
            results = cursor.fetchall()
            print(f"✅ Found {len(results)} patient appointments")
            for row in results:
                print(f"  Patient {row['patientid']} -> Appointment {row['appointmentid']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Join without complex calculations
    print("\n3️⃣ Testing simple join:")
    try:
        query3 = """
            SELECT 
                a.appointmentID,
                a.status,
                d.doctor_name,
                d.clinic_name
            FROM Appointments a
            JOIN PatientAppointment pa ON a.appointmentID = pa.appointmentID
            JOIN DoctorPatient dp ON pa.patientID = dp.patientID
            JOIN Doctors d ON dp.docID = d.docID
            WHERE pa.patientID = %s;
        """
        with db.connection.cursor() as cursor:
            cursor.execute(query3, (1,))
            results = cursor.fetchall()
            print(f"✅ Found {len(results)} joined results")
            for row in results:
                print(f"  Appointment {row['appointmentid']}: {row['doctor_name']} (status: {row['status']})")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    db.disconnect()
    print("\n✅ Test complete")

if __name__ == "__main__":
    test_simple_query()