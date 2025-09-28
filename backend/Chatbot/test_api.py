#!/usr/bin/env python3
"""
Test script to verify report generation functionality
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_full_flow():
    """Test the complete chatbot flow including report generation"""
    print("🧪 Testing MediSyn Chatbot API Flow...")
    
    try:
        # Step 1: Start a session
        print("\n📋 Step 1: Starting session...")
        response = requests.post(f"{BASE_URL}/api/chatbot/start-session", 
                               json={"patient_name": "Test Patient", "patient_id": "test_123"})
        
        if response.status_code != 200:
            print(f"❌ Failed to start session: {response.status_code}")
            return
            
        session_data = response.json()
        session_id = session_data["session_id"]
        print(f"✅ Session started: {session_id}")
        print(f"Initial message: {session_data['initial_message']}")
        
        # Step 2: Send some messages to simulate a conversation
        test_messages = [
            "I've been having headaches for the past week",
            "They started gradually last Monday",
            "The pain lasts about 2-3 hours each time",
            "I'd rate the pain as a 7 out of 10",
            "It happens about twice a day, morning and evening", 
            "It feels like a throbbing pain",
            "The pain is mostly on the right side of my head",
            "Bright lights make it worse, dark rooms help",
            "I also feel nauseous when it happens",
            "I've never had headaches like this before",
            "No family history of migraines",
            "I've been more stressed at work lately"
        ]
        
        print(f"\n💬 Step 2: Sending {len(test_messages)} messages...")
        
        for i, message in enumerate(test_messages):
            print(f"   Sending message {i+1}: {message[:30]}...")
            
            response = requests.post(f"{BASE_URL}/api/chatbot/send-message",
                                   json={"session_id": session_id, "message": message})
            
            if response.status_code != 200:
                print(f"❌ Failed to send message {i+1}: {response.status_code}")
                continue
                
            result = response.json()
            print(f"   AI Response: {result['response'][:50]}...")
            
            if result.get('is_complete'):
                print(f"✅ Session completed after message {i+1}")
                break
                
            time.sleep(1)  # Small delay between messages
        
        # Step 3: Generate report 
        print(f"\n📊 Step 3: Generating report...")
        response = requests.post(f"{BASE_URL}/api/chatbot/generate-report",
                               json={"session_id": session_id})
        
        if response.status_code == 200:
            report_data = response.json()
            print("✅ Report generated successfully!")
            print(f"PDF Path: {report_data.get('report_path', 'Not provided')}")
            print(f"Report Summary: {report_data.get('report_data', {}).get('summary', 'Not available')[:100]}...")
        else:
            print(f"❌ Report generation failed: {response.status_code}")
            print(f"Error: {response.text}")
            
            # Try the test endpoint as backup
            print("\n🔧 Trying test endpoint...")
            test_response = requests.post(f"{BASE_URL}/api/chatbot/test-report/{session_id}")
            if test_response.status_code == 200:
                test_data = test_response.json()
                print(f"Test result: {test_data}")
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")

if __name__ == "__main__":
    test_full_flow()