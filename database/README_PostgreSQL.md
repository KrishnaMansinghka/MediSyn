# MediSyn PostgreSQL Database Setup

This directory contains the PostgreSQL database configuration and utilities for the MediSyn application.

## 🗂️ Files Overview

- `script.txt` - SQL script that creates all required tables
- `test_postgres_connection.py` - Comprehensive test script for database functionality
- `postgres_utils.py` - Python utility class for database operations
- `README.md` - This documentation file
- `schema.ts` - TypeScript interfaces (legacy from local storage)
- `db-utils.ts` - TypeScript utilities (legacy from local storage)  
- `medisyn_db.json` - Sample data (legacy from local storage)

## 🏗️ Database Schema

The PostgreSQL database consists of 5 main tables:

### 1. Patient
- `patientID` (SERIAL PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `DOB` (DATE NOT NULL) 
- `email` (TEXT UNIQUE NOT NULL)
- `address` (TEXT)
- `password` (TEXT NOT NULL)

### 2. Doctors
- `docID` (SERIAL PRIMARY KEY)
- `clinic_name` (TEXT NOT NULL)
- `doctor_name` (TEXT NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `password` (TEXT NOT NULL)

### 3. Appointments
- `appointmentID` (SERIAL PRIMARY KEY)
- `status` (INT CHECK status IN (0,1,2))
- `gender` (TEXT)
- `height` (NUMERIC)
- `weight` (NUMERIC)
- `emergency_contact_number` (TEXT)
- `insurance_provider` (TEXT)
- `insurance_plan` (TEXT)
- `known_allergies` (TEXT)
- `current_medication` (TEXT)
- `medical_history` (TEXT)
- `initial_screening_report_name` (TEXT)
- `discharge_report_name` (TEXT)
- `pre_authorization_report_name` (TEXT)

### 4. DoctorPatient (Many-to-Many Relationship)
- `docID` (INT REFERENCES Doctors(docID))
- `patientID` (INT REFERENCES Patient(patientID))
- `patient_status` (INT DEFAULT 0 CHECK status IN (0,1,2))
- Primary Key: (docID, patientID)

### 5. PatientAppointment (Many-to-Many Relationship)
- `patientID` (INT REFERENCES Patient(patientID))
- `appointmentID` (INT REFERENCES Appointments(appointmentID))
- Primary Key: (patientID, appointmentID)

## 🔧 Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the root directory with your database credentials:

```env
DB_HOST="your-postgres-host"
DB_NAME="your-database-name"
DB_USER="your-username"
DB_PASSWORD="your-password"
DB_PORT="5432"
```

### 2. Install Python Dependencies
```bash
pip install psycopg2-binary python-dotenv
```

### 3. Create Database Tables
Run the SQL script on your PostgreSQL server:
```bash
psql -h your-host -U your-user -d your-database -f database/script.txt
```

### 4. Test Connection
Run the comprehensive test suite:
```bash
python database/test_postgres_connection.py
```

## 🧪 Testing

The test script (`test_postgres_connection.py`) performs the following checks:

1. **Connection Test** - Verifies database connectivity
2. **Table Existence** - Confirms all required tables exist
3. **Table Structure** - Validates column definitions and types
4. **Basic Operations** - Tests CRUD operations on all tables
5. **Constraints** - Verifies foreign keys, unique constraints, and check constraints

### Expected Output
```
🚀 MediSyn PostgreSQL Database Test Suite
==================================================
🔌 Testing database connection...
✅ Connection successful!
📊 PostgreSQL version: PostgreSQL 17.4...

📋 Checking if tables exist...
✅ Table 'patient' exists
✅ Table 'doctors' exists
✅ Table 'appointments' exists
✅ Table 'doctorpatient' exists
✅ Table 'patientappointment' exists

... (additional tests)

📊 FINAL TEST REPORT
==================================================
📈 Tests Passed: 5/5
📊 Success Rate: 100.0%

🎉 ALL TESTS PASSED! Your PostgreSQL database is ready to use.
```

## 🐍 Using the Python Utility

The `postgres_utils.py` provides a convenient Python class for database operations:

```python
from database.postgres_utils import MediSynDB

# Initialize database connection
db = MediSynDB()
db.connect()

# Create a new patient
patient_id = db.create_patient(
    name="John Doe",
    dob="1990-01-01", 
    email="john@example.com",
    address="123 Main St",
    password="hashed_password"
)

# Create a new doctor
doctor_id = db.create_doctor(
    clinic_name="Downtown Clinic",
    doctor_name="Dr. Smith",
    email="dr.smith@clinic.com",
    password="hashed_password"
)

# Assign patient to doctor
db.assign_patient_to_doctor(doctor_id, patient_id)

# Create appointment
appointment_id = db.create_appointment(
    status=0,
    gender="M",
    height=175.5,
    weight=70.2
)

# Assign appointment to patient
db.assign_appointment_to_patient(patient_id, appointment_id)

# Get all patients
patients = db.get_all_patients()

# Close connection
db.disconnect()
```

## 🔒 Security Notes

1. **Passwords**: Always hash passwords before storing them in the database
2. **Environment Variables**: Keep your `.env` file secure and never commit it to version control
3. **SQL Injection**: The utility class uses parameterized queries to prevent SQL injection
4. **Connection Security**: Use SSL connections in production environments

## 🚀 Migration from Local Storage

If you're migrating from the previous local storage system:

1. The TypeScript files (`schema.ts`, `db-utils.ts`, `medisyn_db.json`) are kept for reference
2. Update your application code to use the new PostgreSQL utility
3. Consider creating a migration script to transfer existing local data

## 📊 Status Codes

The system uses integer status codes:

**Patient Status (in DoctorPatient table):**
- 0: New/Pending
- 1: Active
- 2: Inactive/Discharged

**Appointment Status:**
- 0: Scheduled
- 1: In Progress  
- 2: Completed

## 🐛 Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Check your `.env` file configuration
   - Verify network connectivity to the database server
   - Ensure the database server is running

2. **Tables Missing**
   - Run the `script.txt` SQL file to create tables
   - Check database permissions

3. **Import Errors**
   - Install required packages: `pip install psycopg2-binary python-dotenv`
   - Ensure you're using the correct Python environment

### Getting Help

Run the test script for detailed diagnostics:
```bash
python database/test_postgres_connection.py
```

The test script will provide specific error messages and suggestions for fixing issues.