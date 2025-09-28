#!/usr/bin/env python3
"""
Quick test for plain text password authentication
"""

import requests
import json

API_BASE_URL = "http://localhost:8001"

def test_plain_text_auth():
    """Test signup and login with plain text passwords"""
    print("🧪 Testing Plain Text Password Authentication")
    print("=" * 50)
    
    # Test data
    doctor_data = {
        "email": "plaintext.doctor@test.com",
        "password": "myplainpassword123",
        "role": "doctor",
        "clinic_name": "Plain Text Clinic",
        "doctor_name": "Dr. Plain Text"
    }
    
    try:
        # 1. Test signup
        print("1️⃣ Testing doctor signup with plain text password...")
        signup_response = requests.post(f"{API_BASE_URL}/auth/signup", json=doctor_data)
        
        if signup_response.status_code == 200:
            print("✅ Signup successful!")
            print(f"   Response: {signup_response.json()}")
        else:
            print(f"❌ Signup failed: {signup_response.status_code} - {signup_response.text}")
            return False
        
        # 2. Test login
        print("\n2️⃣ Testing login with plain text password...")
        login_data = {
            "email": doctor_data["email"],
            "password": doctor_data["password"]
        }
        
        login_response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        
        if login_response.status_code == 200:
            result = login_response.json()
            print("✅ Login successful!")
            print(f"   User: {result['user_name']}")
            print(f"   Token: {result['access_token'][:50]}...")
            return True
        else:
            print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    test_plain_text_auth()