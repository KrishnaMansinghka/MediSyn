#!/usr/bin/env python3

import requests
import json

def test_appointments_api():
    """Test the appointments API directly"""
    
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
            user_data = login_result.get('user', {})
            patient_id = user_data.get('userid')
            
            print(f"✅ Login successful! Patient ID: {patient_id}")
            
            # Now get appointments
            headers = {"Authorization": f"Bearer {token}"}
            appointments_response = requests.get(f"http://localhost:8001/api/patient/{patient_id}/appointments", headers=headers)
            
            if appointments_response.status_code == 200:
                appointments = appointments_response.json()
                print(f"\n📊 API Response ({len(appointments)} appointments):")
                print(json.dumps(appointments, indent=2))
                
                # Analyze status distribution
                statuses = {}
                for apt in appointments:
                    status = apt.get('appointment_status')
                    statuses[status] = statuses.get(status, 0) + 1
                
                print(f"\n📈 Status distribution in API response:")
                for status, count in sorted(statuses.items()):
                    print(f"  Status {status}: {count} appointments")
                    
            else:
                print(f"❌ Failed to get appointments: {appointments_response.status_code}")
                print(appointments_response.text)
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_appointments_api()