#!/usr/bin/env python3
"""
Test script for MediSyn Authentication API
"""

import requests
import json

API_BASE_URL = "http://localhost:8001"

def test_health_check():
    """Test API health check"""
    print("🔍 Testing API health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ API is healthy:", response.json())
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_doctor_signup():
    """Test doctor signup"""
    print("\n👩‍⚕️ Testing doctor signup...")
    
    doctor_data = {
        "email": "test.doctor@example.com",
        "password": "testpassword123",
        "role": "doctor",
        "clinic_name": "Test Clinic",
        "doctor_name": "Dr. Test Doctor"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/signup", json=doctor_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Doctor signup successful: {result}")
            return True
        else:
            print(f"❌ Doctor signup failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Doctor signup error: {e}")
        return False

def test_patient_signup():
    """Test patient signup"""
    print("\n🤒 Testing patient signup...")
    
    patient_data = {
        "email": "test.patient@example.com",
        "password": "testpassword123",
        "role": "patient",
        "name": "Test Patient",
        "date_of_birth": "1990-01-01",
        "address": "123 Test Street, Test City"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/signup", json=patient_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Patient signup successful: {result}")
            return True
        else:
            print(f"❌ Patient signup failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Patient signup error: {e}")
        return False

def test_doctor_login():
    """Test doctor login"""
    print("\n🔐 Testing doctor login...")
    
    login_data = {
        "email": "test.doctor@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Doctor login successful")
            print(f"   User: {result['user_name']} ({result['user_type']})")
            print(f"   Token: {result['access_token'][:50]}...")
            return result['access_token']
        else:
            print(f"❌ Doctor login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Doctor login error: {e}")
        return None

def test_patient_login():
    """Test patient login"""
    print("\n🔐 Testing patient login...")
    
    login_data = {
        "email": "test.patient@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Patient login successful")
            print(f"   User: {result['user_name']} ({result['user_type']})")
            print(f"   Token: {result['access_token'][:50]}...")
            return result['access_token']
        else:
            print(f"❌ Patient login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Patient login error: {e}")
        return None

def test_protected_endpoint(token):
    """Test protected endpoint with token"""
    print("\n🔒 Testing protected endpoint...")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{API_BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Protected endpoint access successful: {result}")
            return True
        else:
            print(f"❌ Protected endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Protected endpoint error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 MediSyn Authentication API Test Suite")
    print("=" * 50)
    
    # Test health check
    if not test_health_check():
        print("❌ API is not running. Please start the server first.")
        return
    
    # Test signups
    doctor_signup_success = test_doctor_signup()
    patient_signup_success = test_patient_signup()
    
    # Test logins only if signups were successful
    doctor_token = None
    patient_token = None
    
    if doctor_signup_success:
        doctor_token = test_doctor_login()
    
    if patient_signup_success:
        patient_token = test_patient_login()
    
    # Test protected endpoints
    if doctor_token:
        test_protected_endpoint(doctor_token)
    
    if patient_token:
        test_protected_endpoint(patient_token)
    
    print("\n📊 Test Summary")
    print("=" * 20)
    print(f"Health Check: {'✅' if True else '❌'}")
    print(f"Doctor Signup: {'✅' if doctor_signup_success else '❌'}")
    print(f"Patient Signup: {'✅' if patient_signup_success else '❌'}")
    print(f"Doctor Login: {'✅' if doctor_token else '❌'}")
    print(f"Patient Login: {'✅' if patient_token else '❌'}")
    print(f"Protected Endpoint: {'✅' if (doctor_token or patient_token) else '❌'}")

if __name__ == "__main__":
    main()