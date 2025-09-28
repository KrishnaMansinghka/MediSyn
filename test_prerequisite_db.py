#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def test_prerequisite_update():
    """Test the prerequisite data update function directly"""
    db = MediSynDB()
    
    print("🔍 Testing prerequisite data update...")
    
    # Test data
    test_data = {
        'gender': 'Male',
        'height': '180',
        'weight': '75',
        'insuranceProvider': 'Test Insurance Co.',
        'insurancePlan': 'Premium Plan',
        'emergencyContactPhone': '+1234567890',
        'allergies': 'Peanuts, Shellfish',
        'medications': 'Aspirin 81mg daily',
        'medicalHistory': 'No significant medical history'
    }
    
    # Update appointment 1 with test data
    appointment_id = 1
    
    print(f"📋 Updating appointment {appointment_id} with prerequisite data...")
    success = db.update_appointment_prerequisite_data(appointment_id, test_data)
    
    if success:
        print("✅ Prerequisite data updated successfully!")
        
        # Verify the data was saved by querying the appointment
        appointment = db.execute_query('SELECT * FROM appointments WHERE appointmentid = %s', (appointment_id,))
        
        if appointment:
            apt = appointment[0]
            print(f"\n📊 Verification - Appointment {appointment_id} data:")
            print(f"  Gender: {apt.get('gender')}")
            print(f"  Height: {apt.get('height')}")
            print(f"  Weight: {apt.get('weight')}")
            print(f"  Insurance Provider: {apt.get('insurance_provider')}")
            print(f"  Insurance Plan: {apt.get('insurance_plan')}")
            print(f"  Emergency Contact: {apt.get('emergency_contact_number')}")
            print(f"  Allergies: {apt.get('known_allergies')}")
            print(f"  Medications: {apt.get('current_medication')}")
            print(f"  Medical History: {apt.get('medical_history')}")
        else:
            print("❌ Could not retrieve updated appointment data")
    else:
        print("❌ Failed to update prerequisite data")

if __name__ == "__main__":
    test_prerequisite_update()