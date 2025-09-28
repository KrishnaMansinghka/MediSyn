#!/usr/bin/env python3
"""
PostgreSQL Database Connection Test Script for MediSyn
This script tests the connection to the PostgreSQL database and validates the schema.
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
from datetime import datetime, date
import json

def load_environment():
    """Load environment variables from .env file"""
    # Load from the parent directory
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(env_path)
    
    return {
        'host': os.getenv('DB_HOST'),
        'database': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'port': os.getenv('DB_PORT', '5432')
    }

def test_connection(db_config):
    """Test basic database connection"""
    print("🔌 Testing database connection...")
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password'],
            port=db_config['port']
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print(f"✅ Connection successful!")
        print(f"📊 PostgreSQL version: {version[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def check_tables_exist(db_config):
    """Check if all required tables exist"""
    print("\n📋 Checking if tables exist...")
    
    expected_tables = ['patient', 'doctors', 'appointments', 'doctorpatient', 'patientappointment']
    
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password'],
            port=db_config['port']
        )
        
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        existing_tables = [row[0].lower() for row in cursor.fetchall()]
        print(f"📊 Found tables: {existing_tables}")
        
        # Check each expected table
        missing_tables = []
        for table in expected_tables:
            if table.lower() in existing_tables:
                print(f"✅ Table '{table}' exists")
            else:
                print(f"❌ Table '{table}' is missing")
                missing_tables.append(table)
        
        cursor.close()
        conn.close()
        
        return len(missing_tables) == 0, missing_tables
        
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False, []

def check_table_structure(db_config):
    """Check the structure of each table"""
    print("\n🏗️ Checking table structures...")
    
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password'],
            port=db_config['port']
        )
        
        cursor = conn.cursor()
        
        tables_to_check = ['patient', 'doctors', 'appointments', 'doctorpatient', 'patientappointment']
        
        for table in tables_to_check:
            print(f"\n📊 Structure of table '{table}':")
            cursor.execute(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = '{table.lower()}' 
                ORDER BY ordinal_position;
            """)
            
            columns = cursor.fetchall()
            if columns:
                for col in columns:
                    nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
                    default = f"DEFAULT {col[3]}" if col[3] else ""
                    print(f"  • {col[0]}: {col[1]} {nullable} {default}")
            else:
                print(f"  ❌ Table '{table}' not found or has no columns")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error checking table structure: {e}")
        return False

def test_basic_operations(db_config):
    """Test basic CRUD operations"""
    print("\n🧪 Testing basic database operations...")
    
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password'],
            port=db_config['port']
        )
        
        cursor = conn.cursor()
        
        # Test 1: Insert a test patient
        print("1️⃣ Testing patient insertion...")
        test_patient_data = (
            'Test Patient',
            '1990-01-01',
            'test@example.com',
            '123 Test Street',
            'hashed_password_123'
        )
        
        cursor.execute("""
            INSERT INTO Patient (name, DOB, email, address, password)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING patientID;
        """, test_patient_data)
        
        patient_id = cursor.fetchone()[0]
        print(f"✅ Test patient created with ID: {patient_id}")
        
        # Test 2: Insert a test doctor
        print("2️⃣ Testing doctor insertion...")
        test_doctor_data = (
            'Test Clinic',
            'Dr. Test Doctor',
            'doctor@example.com',
            'hashed_password_456'
        )
        
        cursor.execute("""
            INSERT INTO Doctors (clinic_name, doctor_name, email, password)
            VALUES (%s, %s, %s, %s)
            RETURNING docID;
        """, test_doctor_data)
        
        doctor_id = cursor.fetchone()[0]
        print(f"✅ Test doctor created with ID: {doctor_id}")
        
        # Test 3: Create a doctor-patient relationship
        print("3️⃣ Testing doctor-patient mapping...")
        cursor.execute("""
            INSERT INTO DoctorPatient (docID, patientID, patient_status)
            VALUES (%s, %s, %s);
        """, (doctor_id, patient_id, 0))
        print("✅ Doctor-patient relationship created")
        
        # Test 4: Create an appointment
        print("4️⃣ Testing appointment creation...")
        cursor.execute("""
            INSERT INTO Appointments (status, gender, height, weight)
            VALUES (%s, %s, %s, %s)
            RETURNING appointmentID;
        """, (0, 'M', 175.5, 70.2))
        
        appointment_id = cursor.fetchone()[0]
        print(f"✅ Test appointment created with ID: {appointment_id}")
        
        # Test 5: Link patient to appointment
        print("5️⃣ Testing patient-appointment mapping...")
        cursor.execute("""
            INSERT INTO PatientAppointment (patientID, appointmentID)
            VALUES (%s, %s);
        """, (patient_id, appointment_id))
        print("✅ Patient-appointment relationship created")
        
        # Test 6: Query data with joins
        print("6️⃣ Testing complex query with joins...")
        cursor.execute("""
            SELECT 
                p.name as patient_name,
                d.doctor_name,
                d.clinic_name,
                a.status as appointment_status
            FROM Patient p
            JOIN DoctorPatient dp ON p.patientID = dp.patientID
            JOIN Doctors d ON dp.docID = d.docID
            JOIN PatientAppointment pa ON p.patientID = pa.patientID
            JOIN Appointments a ON pa.appointmentID = a.appointmentID
            WHERE p.patientID = %s;
        """, (patient_id,))
        
        result = cursor.fetchone()
        if result:
            print(f"✅ Query successful: {result[0]} -> {result[1]} at {result[2]}, Status: {result[3]}")
        
        # Cleanup: Remove test data
        print("🧹 Cleaning up test data...")
        cursor.execute("DELETE FROM PatientAppointment WHERE patientID = %s", (patient_id,))
        cursor.execute("DELETE FROM DoctorPatient WHERE patientID = %s", (patient_id,))
        cursor.execute("DELETE FROM Appointments WHERE appointmentID = %s", (appointment_id,))
        cursor.execute("DELETE FROM Patient WHERE patientID = %s", (patient_id,))
        cursor.execute("DELETE FROM Doctors WHERE docID = %s", (doctor_id,))
        
        conn.commit()
        print("✅ Test data cleaned up successfully")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error during operations test: {e}")
        try:
            conn.rollback()
        except:
            pass
        return False

def test_constraints(db_config):
    """Test database constraints"""
    print("\n🔒 Testing database constraints...")
    
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password'],
            port=db_config['port']
        )
        
        cursor = conn.cursor()
        
        # Test unique constraint on email
        print("1️⃣ Testing unique email constraint...")
        try:
            cursor.execute("""
                INSERT INTO Patient (name, DOB, email, address, password)
                VALUES ('Test1', '1990-01-01', 'duplicate@test.com', 'Address1', 'pass1');
            """)
            
            cursor.execute("""
                INSERT INTO Patient (name, DOB, email, address, password)
                VALUES ('Test2', '1990-01-01', 'duplicate@test.com', 'Address2', 'pass2');
            """)
            
            conn.commit()
            print("❌ Unique constraint failed - duplicates were allowed")
            
        except psycopg2.IntegrityError:
            print("✅ Unique constraint working - duplicate email rejected")
            conn.rollback()
        
        # Test foreign key constraints
        print("2️⃣ Testing foreign key constraints...")
        try:
            cursor.execute("""
                INSERT INTO DoctorPatient (docID, patientID, patient_status)
                VALUES (99999, 99999, 0);
            """)
            conn.commit()
            print("❌ Foreign key constraint failed - invalid references were allowed")
            
        except psycopg2.IntegrityError:
            print("✅ Foreign key constraint working - invalid references rejected")
            conn.rollback()
        
        # Test check constraints
        print("3️⃣ Testing check constraints...")
        try:
            cursor.execute("""
                INSERT INTO Appointments (status) VALUES (5);
            """)
            conn.commit()
            print("❌ Check constraint failed - invalid status was allowed")
            
        except psycopg2.IntegrityError:
            print("✅ Check constraint working - invalid status rejected")
            conn.rollback()
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error during constraint testing: {e}")
        return False

def generate_report(db_config, test_results):
    """Generate a comprehensive test report"""
    print("\n📊 FINAL TEST REPORT")
    print("=" * 50)
    
    total_tests = len(test_results)
    passed_tests = sum(test_results.values())
    
    print(f"📈 Tests Passed: {passed_tests}/{total_tests}")
    print(f"📊 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print("\nDetailed Results:")
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
    
    print(f"\nDatabase Configuration:")
    print(f"  Host: {db_config['host']}")
    print(f"  Database: {db_config['database']}")
    print(f"  User: {db_config['user']}")
    print(f"  Port: {db_config['port']}")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Your PostgreSQL database is ready to use.")
    else:
        print(f"\n⚠️ {total_tests - passed_tests} test(s) failed. Please check the issues above.")

def main():
    """Main test function"""
    print("🚀 MediSyn PostgreSQL Database Test Suite")
    print("=" * 50)
    
    # Load configuration
    db_config = load_environment()
    
    if not all(db_config.values()):
        print("❌ Missing database configuration. Please check your .env file.")
        sys.exit(1)
    
    test_results = {}
    
    # Run all tests
    test_results['Connection Test'] = test_connection(db_config)
    
    if test_results['Connection Test']:
        tables_exist, missing = check_tables_exist(db_config)
        test_results['Tables Exist'] = tables_exist
        
        if tables_exist:
            test_results['Table Structure'] = check_table_structure(db_config)
            test_results['Basic Operations'] = test_basic_operations(db_config)
            test_results['Constraints'] = test_constraints(db_config)
        else:
            print(f"\n❌ Cannot proceed with other tests. Missing tables: {missing}")
            test_results['Table Structure'] = False
            test_results['Basic Operations'] = False
            test_results['Constraints'] = False
    else:
        test_results['Tables Exist'] = False
        test_results['Table Structure'] = False
        test_results['Basic Operations'] = False
        test_results['Constraints'] = False
    
    # Generate final report
    generate_report(db_config, test_results)

if __name__ == "__main__":
    main()