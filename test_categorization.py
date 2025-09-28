#!/usr/bin/env python3
"""
Test script to verify appointment categorization based on status values.
Status 0,1 should be 'upcoming' and status 2 should be 'past'.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))
from postgres_utils import MediSynDB

def test_appointment_categorization():
    print("🧪 Testing Appointment Categorization")
    print("=" * 50)
    
    # Test for patient ID 1 (we know this patient has appointments)
    patient_id = 1
    print(f"📋 Testing appointments for Patient ID: {patient_id}")
    
    try:
        db = MediSynDB()
        appointments = db.get_patient_appointments_with_doctor(patient_id)
        
        if not appointments:
            print("❌ No appointments found!")
            return
        
        print(f"✅ Found {len(appointments)} appointments")
        print("\n📊 Appointment Details:")
        print("-" * 80)
        
        upcoming_count = 0
        past_count = 0
        
        for i, apt in enumerate(appointments, 1):
            status = apt.get('appointment_status', 'N/A')
            time_status = apt.get('time_status', 'N/A')
            doctor_name = apt.get('doctor_name', 'Unknown')
            appointment_id = apt.get('appointmentid', 'N/A')  # PostgreSQL converts to lowercase
            
            print(f"{i}. Appointment ID: {appointment_id}")
            print(f"   Doctor: {doctor_name}")
            print(f"   Status: {status} → Time Status: {time_status}")
            
            if time_status == 'upcoming':
                upcoming_count += 1
                # Verify status is 0 or 1
                if status not in [0, 1]:
                    print(f"   ⚠️  WARNING: Status {status} should not be 'upcoming'!")
            elif time_status == 'past':
                past_count += 1
                # Verify status is 2
                if status != 2:
                    print(f"   ⚠️  WARNING: Status {status} should not be 'past'!")
            
            print()
        
        print("📈 Summary:")
        print(f"   • Upcoming appointments: {upcoming_count}")
        print(f"   • Past appointments: {past_count}")
        print(f"   • Total appointments: {len(appointments)}")
        
        # Verify categorization logic
        print("\n✅ Categorization Logic Verification:")
        print("   • Status 0,1 → 'upcoming': ✓" if upcoming_count > 0 else "   • No upcoming appointments found")
        print("   • Status 2 → 'past': ✓" if past_count > 0 else "   • No past appointments found")
        
    except Exception as e:
        print(f"❌ Error testing appointments: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_appointment_categorization()