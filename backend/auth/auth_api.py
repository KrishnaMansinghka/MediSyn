#!/usr/bin/env python3
"""
MediSyn Authentication API Service
FastAPI backend for user authentication with PostgreSQL database
"""

import os
import sys
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
import uvicorn
from dotenv import load_dotenv

# Add the database directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'database'))
from postgres_utils import MediSynDB

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# JWT Configuration
SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

app = FastAPI(
    title="MediSyn Authentication API",
    description="Authentication service for MediSyn application",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    role: str
    
    # Doctor-specific fields
    clinic_name: Optional[str] = None
    doctor_name: Optional[str] = None
    
    # Patient-specific fields
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['doctor', 'patient']:
            raise ValueError('Role must be either "doctor" or "patient"')
        return v
    
    @validator('clinic_name', 'doctor_name')
    def validate_doctor_fields(cls, v, values):
        if values.get('role') == 'doctor' and not v:
            raise ValueError('Clinic name and doctor name are required for doctors')
        return v
    
    @validator('name', 'date_of_birth', 'address')
    def validate_patient_fields(cls, v, values):
        if values.get('role') == 'patient' and not v:
            raise ValueError('Name, date of birth, and address are required for patients')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_type: str
    user_name: str
    email: str

class UserResponse(BaseModel):
    user_id: int
    email: str
    user_type: str
    user_name: str
    is_active: bool

class PrerequisiteData(BaseModel):
    gender: str
    height: str
    weight: str
    insuranceProvider: str
    insurancePlan: str
    emergencyContactPhone: str
    allergies: Optional[str] = ""
    medications: Optional[str] = ""
    medicalHistory: Optional[str] = ""

# Database instance
db = MediSynDB()

# Utility Functions
def verify_password(plain_password: str, stored_password: str) -> bool:
    """Verify password - direct comparison (no hashing)"""
    return plain_password == stored_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        user_type: str = payload.get("user_type")
        
        if user_id_str is None or user_type is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Convert user_id back to integer
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {"user_id": user_id, "user_type": user_type}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.PyJWTError, jwt.InvalidTokenError, jwt.DecodeError, jwt.InvalidSignatureError, jwt.InvalidSubjectError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "MediSyn Authentication API is running", "status": "healthy"}

@app.post("/auth/signup", response_model=dict)
async def signup(user_data: UserSignup):
    """User registration endpoint"""
    try:
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        # Check if user already exists
        existing_user = db.get_doctor_by_email(user_data.email) or db.get_patient_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Store password as plain text (no hashing)
        plain_password = user_data.password
        
        # Create user based on role
        if user_data.role == 'doctor':
            user_id = db.create_doctor(
                clinic_name=user_data.clinic_name,
                doctor_name=user_data.doctor_name,
                email=user_data.email,
                password=plain_password
            )
            user_name = user_data.doctor_name
        else:  # patient
            user_id = db.create_patient(
                name=user_data.name,
                dob=user_data.date_of_birth,
                email=user_data.email,
                address=user_data.address,
                password=plain_password
            )
            user_name = user_data.name
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
        
        return {
            "message": f"{user_data.role.title()} account created successfully",
            "user_id": user_id,
            "user_type": user_data.role,
            "user_name": user_name,
            "email": user_data.email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.post("/auth/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """User login endpoint"""
    try:
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        # Try to find user as doctor first, then patient
        user = db.get_doctor_by_email(user_credentials.email)
        user_type = "doctor"
        
        if not user:
            user = db.get_patient_by_email(user_credentials.email)
            user_type = "patient"
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(user_credentials.password, user['password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        user_id = user['docid'] if user_type == 'doctor' else user['patientid']
        access_token = create_access_token(
            data={
                "sub": str(user_id),  # Convert to string for JWT
                "user_type": user_type,
                "email": user['email']
            },
            expires_delta=access_token_expires
        )
        
        # Get user name based on type
        user_name = user['doctor_name'] if user_type == 'doctor' else user['name']
        user_id = user['docid'] if user_type == 'doctor' else user['patientid']
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user_id,
            user_type=user_type,
            user_name=user_name,
            email=user['email']
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(current_user: dict = Depends(verify_token)):
    """Get current authenticated user details"""
    try:
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        user_id = current_user["user_id"]
        user_type = current_user["user_type"]
        
        if user_type == "doctor":
            user_data = db.execute_query(
                "SELECT docid, doctor_name, email, clinic_name FROM Doctors WHERE docid = %s",
                (user_id,)
            )
            if not user_data:
                raise HTTPException(status_code=404, detail="User not found")
            
            user = user_data[0]
            return UserResponse(
                user_id=user['docid'],
                email=user['email'],
                user_type=user_type,
                user_name=user['doctor_name'],
                is_active=True
            )
        else:  # patient
            user_data = db.execute_query(
                "SELECT patientid, name, email FROM Patient WHERE patientid = %s",
                (user_id,)
            )
            if not user_data:
                raise HTTPException(status_code=404, detail="User not found")
            
            user = user_data[0]
            return UserResponse(
                user_id=user['patientid'],
                email=user['email'],
                user_type=user_type,
                user_name=user['name'],
                is_active=True
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.post("/auth/logout")
async def logout(current_user: dict = Depends(verify_token)):
    """Logout user (invalidate token)"""
    # In a real application, you might want to maintain a blacklist of tokens
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}

@app.get("/auth/users/doctors", response_model=List[dict])
async def get_all_doctors(current_user: dict = Depends(verify_token)):
    """Get all doctors (protected endpoint for testing)"""
    try:
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        doctors = db.get_all_doctors()
        # Remove password from response
        for doctor in doctors:
            doctor.pop('password', None)
        
        return doctors
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.get("/auth/users/patients", response_model=List[dict])
async def get_all_patients(current_user: dict = Depends(verify_token)):
    """Get all patients (protected endpoint for testing)"""
    try:
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        patients = db.get_all_patients()
        # Remove password from response
        for patient in patients:
            patient.pop('password', None)
        
        return patients
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

# Appointment endpoints
@app.get("/api/patient/{patient_id}/appointments")
async def get_patient_appointments(
    patient_id: int,
    current_user: dict = Depends(verify_token)
):
    """Get all appointments for a patient"""
    try:
        # Verify user is the patient or a doctor
        if current_user['user_type'] == 'patient' and current_user['user_id'] != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only view your own appointments"
            )
        
        db = MediSynDB()
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        appointments = db.get_patient_appointments_with_doctor(patient_id)
        return {
            "appointments": appointments,
            "total": len(appointments)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.get("/api/doctor/{doctor_id}/patients")
async def get_doctor_patients(
    doctor_id: int,
    current_user: dict = Depends(verify_token)
):
    """Get all patients assigned to a doctor with appointment info"""
    try:
        # Verify user is the doctor
        if current_user['user_type'] == 'doctor' and current_user['user_id'] != doctor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Can only view your own patients"
            )
        
        db = MediSynDB()
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        patients = db.get_doctor_patients_with_appointments(doctor_id)
        return {
            "patients": patients,
            "total": len(patients)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.get("/api/appointment/{appointment_id}")
async def get_appointment_details(
    appointment_id: int,
    current_user: dict = Depends(verify_token)
):
    """Get detailed information about a specific appointment"""
    try:
        db = MediSynDB()
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        appointment = db.get_appointment_details(appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        return appointment
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.put("/api/appointment/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    status: int,
    current_user: dict = Depends(verify_token)
):
    """Update appointment status (0=prerequisite, 1=initial screening, 2=report)"""
    try:
        if current_user['user_type'] != 'doctor':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only doctors can update appointment status"
            )
        
        if status not in [0, 1, 2]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status: Must be 0, 1, or 2"
            )
        
        db = MediSynDB()
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        success = db.update_appointment_status(appointment_id, status)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found or update failed"
            )
        
        return {"message": "Appointment status updated successfully"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

@app.put("/api/appointment/{appointment_id}/prerequisite")
async def update_appointment_prerequisite(
    appointment_id: int,
    prerequisite_data: PrerequisiteData,
    current_user: dict = Depends(verify_token)
):
    """Update appointment prerequisite information"""
    try:
        # Patients can update their own appointment prerequisites
        if current_user['user_type'] not in ['patient', 'doctor']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only patients and doctors can update prerequisite information"
            )
        
        db = MediSynDB()
        if not db.connect():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        # Convert Pydantic model to dictionary
        data_dict = prerequisite_data.dict()
        
        success = db.update_appointment_prerequisite_data(appointment_id, data_dict)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found or update failed"
            )
        
        return {"message": "Prerequisite information updated successfully"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    finally:
        db.disconnect()

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Endpoint not found"}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"error": "Internal server error"}

if __name__ == "__main__":
    print("🚀 Starting MediSyn Authentication API...")
    print(f"📊 Database: {os.getenv('DB_NAME')} on {os.getenv('DB_HOST')}")
    print("🔒 JWT Authentication enabled")
    print("🌐 CORS enabled for frontend")
    
    uvicorn.run(
        "auth_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )