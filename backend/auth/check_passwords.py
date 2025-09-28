#!/usr/bin/env python3
"""
Check current passwords in database
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'database'))

from postgres_utils import MediSynDB

def check_passwords():
    """Check current password storage in database"""
    print("🔍 Checking current password storage...")
    
    db = MediSynDB()
    if not db.connect():
        print("❌ Database connection failed")
        return
    
    try:
        # Get all doctors
        doctors = db.execute_query("SELECT email, password FROM Doctors LIMIT 5")
        print(f"\n👩‍⚕️ Found {len(doctors)} doctors:")
        for doctor in doctors:
            print(f"   Email: {doctor['email']}")
            print(f"   Password: {doctor['password']}")
            print(f"   Length: {len(doctor['password'])} chars")
            print("   ---")
        
        # Get all patients  
        patients = db.execute_query("SELECT email, password FROM Patient LIMIT 5")
        print(f"\n🤒 Found {len(patients)} patients:")
        for patient in patients:
            print(f"   Email: {patient['email']}")
            print(f"   Password: {patient['password']}")
            print(f"   Length: {len(patient['password'])} chars")
            print("   ---")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.disconnect()

if __name__ == "__main__":
    check_passwords()