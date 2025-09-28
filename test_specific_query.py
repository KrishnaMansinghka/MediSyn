#!/usr/bin/env python3
"""
Test the specific patient appointment query with detailed error handling
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def test_specific_query():
    """Test the specific patient appointment query"""
    db = MediSynDB()
    
    if not db.connect():
        print("❌ Failed to connect to database")
        return
    
    print("🧪 Testing Specific Patient Appointment Query...")
    print("=" * 50)
    
    # The exact query from get_patient_appointments_with_doctor
    query = """
        SELECT 
            a.appointmentID,
            a.status as appointment_status,
            d.doctor_name,
            d.clinic_name,
            -- Since no date/time fields exist, we'll simulate them for demo
            CURRENT_DATE - INTERVAL '1 day' * (a.appointmentID % 30) as appointment_date,
            '09:00:00'::TIME + INTERVAL '1 hour' * (a.appointmentID % 8) as appointment_time,
            CASE 
                WHEN a.appointmentID % 3 = 0 THEN 'upcoming'
                ELSE 'past'
            END as time_status
        FROM Appointments a
        JOIN PatientAppointment pa ON a.appointmentID = pa.appointmentID
        JOIN DoctorPatient dp ON pa.patientID = dp.patientID
        JOIN Doctors d ON dp.docID = d.docID
        WHERE pa.patientID = %s
        ORDER BY a.appointmentID DESC;
    """
    
    print("Query to execute:")
    print(query)
    print("\nParameters: (1,)")
    
    try:
        # Execute manually with detailed error handling
        with db.connection.cursor() as cursor:
            cursor.execute(query, (1,))
            results = cursor.fetchall()
            print(f"\n✅ Query successful! Found {len(results)} results:")
            
            for i, row in enumerate(results):
                print(f"\nResult {i+1}:")
                row_dict = dict(row)
                for key, value in row_dict.items():
                    print(f"  {key}: {value}")
    
    except Exception as e:
        print(f"\n❌ Query failed with error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
    
    db.disconnect()
    print("\n✅ Test complete")

if __name__ == "__main__":
    test_specific_query()