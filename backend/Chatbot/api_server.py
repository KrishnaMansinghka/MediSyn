#!/usr/bin/env python3
"""
MediSyn Chatbot API Server
FastAPI server that wraps chatbot.py functionality for the React frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
import json
import os
from datetime import datetime

# Import our chatbot functionality
from chatbot import ChatbotSession

# Initialize FastAPI app
app = FastAPI(
    title="MediSyn Chatbot API",
    description="Medical symptom interview chatbot API",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", "http://127.0.0.1:8080",  # Original frontend URLs
        "http://localhost:5173", "http://127.0.0.1:5173",  # Vite dev server
        "http://localhost:5174", "http://127.0.0.1:5174",  # Alternative Vite ports
        "http://localhost:5175", "http://127.0.0.1:5175"   # Alternative Vite ports
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global storage for active sessions (in production, use Redis/database)
active_sessions: Dict[str, ChatbotSession] = {}

# --- Request/Response Models ---

class StartSessionRequest(BaseModel):
    patient_name: Optional[str] = None
    patient_id: Optional[str] = None
    appointment_id: Optional[str] = None

class StartSessionResponse(BaseModel):
    session_id: str
    initial_message: str
    success: bool

class SendMessageRequest(BaseModel):
    session_id: str
    message: str

class SendMessageResponse(BaseModel):
    response: str
    is_complete: bool
    session_id: str
    success: bool
    error: Optional[str] = None

class GenerateReportRequest(BaseModel):
    session_id: str

class GenerateReportResponse(BaseModel):
    report_path: str
    report_data: Dict
    success: bool
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

# --- API Endpoints ---

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.post("/api/chatbot/start-session", response_model=StartSessionResponse)
async def start_session(request: StartSessionRequest):
    """Start a new chatbot session"""
    try:
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Create new chatbot session
        chatbot_session = ChatbotSession(
            session_id=session_id,
            patient_name=request.patient_name,
            patient_id=request.patient_id,
            appointment_id=request.appointment_id
        )
        
        # Store session
        active_sessions[session_id] = chatbot_session
        
        # Get initial message
        initial_message = chatbot_session.get_initial_message()
        
        return StartSessionResponse(
            session_id=session_id,
            initial_message=initial_message,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@app.post("/api/chatbot/send-message", response_model=SendMessageResponse)
async def send_message(request: SendMessageRequest):
    """Send a message to the chatbot and get response"""
    try:
        # Get session
        if request.session_id not in active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        chatbot_session = active_sessions[request.session_id]
        
        # Send message and get response
        response_data = await chatbot_session.send_message(request.message)
        
        # Clean up session if complete
        if response_data["is_complete"]:
            # Keep session for report generation, but mark as complete
            chatbot_session.mark_complete()
        
        return SendMessageResponse(
            response=response_data["response"],
            is_complete=response_data["is_complete"],
            session_id=request.session_id,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return SendMessageResponse(
            response="I'm sorry, I encountered an error. Please try again.",
            is_complete=False,
            session_id=request.session_id,
            success=False,
            error=str(e)
        )

@app.post("/api/chatbot/generate-report", response_model=GenerateReportResponse)
async def generate_report(request: GenerateReportRequest):
    """Generate final medical report from session"""
    print(f"🧾 Report generation requested for session: {request.session_id}")
    print(f"📊 Active sessions: {list(active_sessions.keys())}")
    
    try:
        # Get session
        if request.session_id not in active_sessions:
            print(f"❌ Session {request.session_id} not found in active sessions")
            raise HTTPException(status_code=404, detail="Session not found")
        
        chatbot_session = active_sessions[request.session_id]
        print(f"✅ Found session, conversation length: {len(chatbot_session.conversation_history)}")
        
        # Generate report
        print("🔄 Starting report generation...")
        report_data = await chatbot_session.generate_report()
        print(f"✅ Report generated successfully: {report_data.get('pdf_path', 'No path')}")
        
        # Cleanup session after report generation
        del active_sessions[request.session_id]
        
        return GenerateReportResponse(
            report_path=report_data.get("pdf_path", ""),
            report_data=report_data,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@app.get("/api/chatbot/sessions")
async def list_sessions():
    """List active sessions (for debugging)"""
    return {
        "active_sessions": len(active_sessions),
        "session_ids": list(active_sessions.keys())
    }

@app.delete("/api/chatbot/session/{session_id}")
async def end_session(session_id: str):
    """End a specific session"""
    if session_id in active_sessions:
        del active_sessions[session_id]
        return {"success": True, "message": "Session ended"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.post("/api/chatbot/test-report/{session_id}")
async def test_report_generation(session_id: str):
    """Test endpoint to manually generate report for debugging"""
    print(f"🧪 Testing report generation for session: {session_id}")
    
    if session_id not in active_sessions:
        return {"error": "Session not found", "active_sessions": list(active_sessions.keys())}
    
    try:
        chatbot_session = active_sessions[session_id]
        print(f"Session found, conversation history: {len(chatbot_session.conversation_history)} messages")
        
        # Force mark as complete for testing
        chatbot_session.mark_complete()
        
        # Generate report
        report_data = await chatbot_session.generate_report()
        
        return {
            "success": True,
            "report_generated": True,
            "pdf_path": report_data.get("pdf_path"),
            "txt_path": report_data.get("txt_path"),
            "conversation_length": len(chatbot_session.conversation_history)
        }
        
    except Exception as e:
        print(f"Test report generation failed: {e}")
        return {"error": str(e), "success": False}

if __name__ == "__main__":
    import uvicorn
    
    print("🏥 Starting MediSyn Chatbot API Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "api_server:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=False,  # Disable reload to avoid the warning
        log_level="info"
    )