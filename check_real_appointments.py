#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def check_appointment_statuses():
    """Check appointment data and statuses"""
    db = MediSynDB()
    
    print("🔍 Checking appointment data...")
    
    # Get all appointments with their statuses
    appointments = db.execute_query('SELECT appointmentid, status FROM appointments ORDER BY appointmentid')
    
    print(f"\n📊 Found {len(appointments)} appointments:")
    print("AppointmentID | Status")
    print("-" * 25)
    
    for apt in appointments:
        print(f"{apt['appointmentid']:12} | {apt['status']}")
    
    # Count by status
    status_counts = db.execute_query('SELECT status, COUNT(*) as count FROM appointments GROUP BY status ORDER BY status')
    
    print(f"\n📈 Status distribution:")
    for status in status_counts:
        print(f"Status {status['status']}: {status['count']} appointments")
    
    # Check if any status 0 exists
    status_0_count = db.execute_query('SELECT COUNT(*) as count FROM appointments WHERE status = 0')
    print(f"\n🔍 Status 0 appointments: {status_0_count[0]['count']}")
    
    # Check what values actually exist
    all_statuses = db.execute_query('SELECT DISTINCT status FROM appointments ORDER BY status')
    print(f"\n🎯 All status values found: {[s['status'] for s in all_statuses]}")

if __name__ == "__main__":
    check_appointment_statuses()