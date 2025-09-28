#!/usr/bin/env python3
"""
Test script to run the MediSyn Chatbot
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the chatbot
from chatbot import run_chatbot

if __name__ == "__main__":
    print("🏥 MediSyn Medical Assistant Chatbot")
    print("=" * 50)
    print("📁 Reports will be saved in: backend/Chatbot/")
    print("📄 Both TXT and PDF formats will be generated")
    print("=" * 50)
    
    try:
        run_chatbot()
    except KeyboardInterrupt:
        print("\n\n👋 Chatbot session ended by user.")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        print("Please check your API key and internet connection.")