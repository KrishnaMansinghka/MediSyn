#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'database'))

from postgres_utils import MediSynDB

def check_tables():
    """Check what tables exist in the database"""
    db = MediSynDB()
    
    print("🔍 Checking database tables...")
    
    # Get all tables
    tables = db.execute_query("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    """)
    
    print(f"\n📊 Found {len(tables)} tables:")
    for table in tables:
        print(f"- {table['table_name']}")
    
    # Try different case variations for appointments
    for table_name in ['appointments', 'Appointments', 'APPOINTMENTS']:
        try:
            count = db.execute_query(f'SELECT COUNT(*) as count FROM "{table_name}"')
            print(f"\n✅ Table '{table_name}' exists with {count[0]['count']} records")
            
            # If we found the table, check its structure
            columns = db.execute_query(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table_name.lower()}' 
                ORDER BY ordinal_position
            """)
            
            print(f"Columns in {table_name}:")
            for col in columns:
                print(f"  - {col['column_name']}: {col['data_type']}")
                
            break
        except Exception as e:
            print(f"❌ Table '{table_name}' not found")
    
    db.close()

if __name__ == "__main__":
    check_tables()