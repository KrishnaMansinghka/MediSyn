#!/usr/bin/env python3
"""
Database Debug Script - Check what's actually in the database
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def debug_database():
    """Debug database contents and schema"""
    db = MediSynDB()
    
    if not db.connect():
        print("❌ Failed to connect to database")
        return
    
    print("🔍 Debugging Database Contents...")
    print("=" * 50)
    
    # Check all tables
    tables = ['Patient', 'Doctors', 'Appointments', 'DoctorPatient', 'PatientAppointment']
    
    for table in tables:
        print(f"\n📊 Table: {table}")
        print("-" * 30)
        
        # Get column information
        try:
            columns_query = f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table.lower()}' 
                ORDER BY ordinal_position;
            """
            columns = db.execute_query(columns_query)
            
            print("Columns:")
            for col in columns:
                print(f"  - {col['column_name']} ({col['data_type']})")
                
            # Get row count and sample data
            count_query = f"SELECT COUNT(*) as count FROM {table};"
            count_result = db.execute_query(count_query)
            row_count = count_result[0]['count'] if count_result else 0
            
            print(f"Row count: {row_count}")
            
            if row_count > 0:
                sample_query = f"SELECT * FROM {table} LIMIT 3;"
                sample_data = db.execute_query(sample_query)
                print("Sample data:")
                for i, row in enumerate(sample_data, 1):
                    print(f"  Row {i}: {dict(row)}")
                    
        except Exception as e:
            print(f"Error querying {table}: {e}")
    
    # Test specific appointment-related queries
    print("\n🎯 Testing Appointment Queries...")
    print("-" * 40)
    
    # Test patient appointments query (simplified)
    try:
        simple_query = """
            SELECT 
                a.appointmentID,
                a.status,
                p.name as patient_name
            FROM Appointments a
            JOIN PatientAppointment pa ON a.appointmentID = pa.appointmentID
            JOIN Patient p ON pa.patientID = p.patientID
            LIMIT 5;
        """
        results = db.execute_query(simple_query)
        print(f"Simple appointment query results: {len(results)} rows")
        for row in results:
            print(f"  {dict(row)}")
    except Exception as e:
        print(f"Error in simple appointment query: {e}")
    
    db.disconnect()
    print("\n✅ Database debug complete")

if __name__ == "__main__":
    debug_database()