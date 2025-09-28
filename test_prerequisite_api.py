#!/usr/bin/env python3

import requests
import json

def test_prerequisite_api():
    """Test the prerequisite API endpoint"""
    
    # First, login to get a token
    login_data = {
        "email": "patient@example.com", 
        "password": "testpass123"
    }
    
    try:
        print("🔐 Logging in...")
        login_response = requests.post("http://localhost:8001/auth/login", json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('token')
            
            print(f"✅ Login successful!")
            
            # Test prerequisite data update
            prerequisite_data = {
                "gender": "Male",
                "height": "180",
                "weight": "75",
                "insuranceProvider": "Test Insurance",
                "insurancePlan": "Premium Plan",
                "emergencyContactPhone": "1234567890",
                "allergies": "None",
                "medications": "None",
                "medicalHistory": "Healthy"
            }
            
            # Test with appointment ID 1
            appointment_id = 1
            headers = {"Authorization": f"Bearer {token}"}
            
            print(f"📋 Updating prerequisite info for appointment {appointment_id}...")
            prereq_response = requests.put(
                f"http://localhost:8001/api/appointment/{appointment_id}/prerequisite", 
                json=prerequisite_data,
                headers=headers
            )
            
            print(f"Response status: {prereq_response.status_code}")
            print(f"Response: {prereq_response.text}")
            
            if prereq_response.status_code == 200:
                print("✅ Prerequisite information updated successfully!")
            else:
                print(f"❌ Failed to update prerequisite information")
                
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_prerequisite_api()