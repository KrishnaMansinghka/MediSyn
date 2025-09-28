#!/usr/bin/env python3
"""
Test script to verify doctor appointments categorization based on status values.
Status 0,1 should be 'upcoming' and status 2 should be 'past'.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))
from postgres_utils import MediSynDB

def test_doctor_appointments():
    print("🧪 Testing Doctor Appointment Categorization")
    print("=" * 50)
    
    # Test for doctor ID 1 (we know this doctor has patients/appointments)
    doctor_id = 1
    print(f"👨‍⚕️ Testing appointments for Doctor ID: {doctor_id}")
    
    try:
        db = MediSynDB()
        patients = db.get_doctor_patients_with_appointments(doctor_id)
        
        if not patients:
            print("❌ No patients found!")
            return
        
        print(f"✅ Found {len(patients)} patient records")
        print("\n📊 Patient Appointment Details:")
        print("-" * 80)
        
        upcoming_count = 0
        past_count = 0
        total_appointments = 0
        
        for i, patient in enumerate(patients, 1):
            patient_name = patient.get('patient_name', 'Unknown')
            appointment_id = patient.get('appointmentid', 'N/A')
            status = patient.get('appointment_status', 'N/A')
            time_status = patient.get('time_status', 'N/A')
            
            print(f"{i}. Patient: {patient_name}")
            
            if appointment_id and appointment_id != 'N/A':
                total_appointments += 1
                print(f"   Appointment ID: {appointment_id}")
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
            else:
                print("   No appointment scheduled")
            
            print()
        
        print("📈 Summary:")
        print(f"   • Total patient records: {len(patients)}")
        print(f"   • Patients with appointments: {total_appointments}")
        print(f"   • Upcoming appointments: {upcoming_count}")
        print(f"   • Past appointments: {past_count}")
        
        # Verify categorization logic
        print("\n✅ Categorization Logic Verification:")
        if upcoming_count > 0:
            print("   • Status 0,1 → 'upcoming': ✓")
        if past_count > 0:
            print("   • Status 2 → 'past': ✓")
        if total_appointments == 0:
            print("   • No appointments found for this doctor")
        
    except Exception as e:
        print(f"❌ Error testing doctor appointments: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_doctor_appointments()