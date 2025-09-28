import requests
import json
import time
import os
import sys
from datetime import datetime
import asyncio
from typing import Dict, List, Optional, Any

# Add the database directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'database'))

try:
    from postgres_utils import MediSynDB
    DATABASE_AVAILABLE = True
except ImportError:
    print("Warning: Database utilities not available. Prerequisite data integration disabled.")
    DATABASE_AVAILABLE = False

# --- Configuration ---
# NOTE: You MUST replace "YOUR_GEMINI_API_KEY_HERE" with your actual Gemini API Key.
# Get your key from Google AI Studio.
API_KEY = "AIzaSyBPcnllCQfx44SljP2cIT6gfjwr7Rnl0r0" 
MODEL_NAME = "gemini-2.5-flash-preview-05-20"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"
REPORT_COMPLETE_TOKEN = "<<REPORT_COMPLETE>>"

# --- Database Integration Functions ---
def get_prerequisite_data(appointment_id: Optional[str] = None, patient_id: Optional[str] = None) -> Dict[str, Any]:
    """Fetch prerequisite data from appointments table"""
    if not DATABASE_AVAILABLE:
        return {}
    
    try:
        db = MediSynDB()
        if not db.connect():
            print("Failed to connect to database")
            return {}
        
        # Query to get prerequisite data including patient name and date of birth
        if appointment_id:
            # Get data by appointment ID
            query = """
                SELECT 
                    p.name as patient_name, p.dateofbirth as date_of_birth,
                    a.gender, a.height, a.weight, a.emergency_contact_number,
                    a.insurance_provider, a.insurance_plan, a.known_allergies,
                    a.current_medication, a.medical_history
                FROM appointments a
                JOIN patientappointment pa ON a.appointmentid = pa.appointmentid
                JOIN patients p ON pa.patientid = p.id
                WHERE a.appointmentid = %s
            """
            results = db.execute_query(query, (int(appointment_id),))
        elif patient_id:
            # Get most recent appointment data for patient
            query = """
                SELECT 
                    p.name as patient_name, p.dateofbirth as date_of_birth,
                    a.gender, a.height, a.weight, a.emergency_contact_number,
                    a.insurance_provider, a.insurance_plan, a.known_allergies,
                    a.current_medication, a.medical_history
                FROM appointments a
                JOIN patientappointment pa ON a.appointmentid = pa.appointmentid
                JOIN patients p ON pa.patientid = p.id
                WHERE pa.patientid = %s
                ORDER BY a.appointmentid DESC
                LIMIT 1
            """
            results = db.execute_query(query, (int(patient_id),))
        else:
            return {}
        
        if results and len(results) > 0:
            data = results[0]
            return {
                'patient_name': data.get('patient_name', ''),
                'date_of_birth': data.get('date_of_birth', ''),
                'gender': data.get('gender', ''),
                'height': data.get('height', ''),
                'weight': data.get('weight', ''),
                'emergency_contact': data.get('emergency_contact_number', ''),
                'insurance_provider': data.get('insurance_provider', ''),
                'insurance_plan': data.get('insurance_plan', ''),
                'known_allergies': data.get('known_allergies', ''),
                'current_medications': data.get('current_medication', ''),
                'previous_medical_history': data.get('medical_history', '')
            }
        
        return {}
        
    except Exception as e:
        print(f"Error fetching prerequisite data: {e}")
        return {}

# --- System Prompt (The core logic for the Medical Assistant) ---
SYSTEM_PROMPT = """
You are a medical assistant. Your role is to ask clarifying questions about a patient's symptoms. Your responses should be brief, direct, and often in the form of incomplete sentences. Focus on asking one to two questions at a time. Do not provide a diagnosis, medical advice, or treatment recommendations. Your only job is to ask questions to gather more information for a doctor.

You can respond in other languages or rephrase questions if the user requests it. Always maintain your persona and return to the core questioning process afterward.

When a user provides information not directly related to your last question, acknowledge the new information and ask relevant follow-up questions about it first. You can ask the original question again later if it has not been addressed. The ultimate goal is to get a comprehensive report covering all aspects of the patient's condition, medical history, family history, and lifestyle.

Questioning structure (must cover all these areas before completion):
1.  Main symptoms.
2.  Onset (When did this begin? How did it start?).
3.  Duration (How long does it last?).
4.  Severity (On a scale of 1-10, how bad is it?).
5.  Frequency (How often does it occur?).
6.  Character (What does it feel like: sharp, dull, achy, etc.?).
7.  Location (Where exactly is the symptom located?).
8.  Triggers/Relief (What makes it better or worse?).
9.  Associated symptoms (Are there any other symptoms happening at the same time?).
10. Medical History (Have you had this before? Do you have any other relevant medical conditions?).
11. Family History (Does anyone in your family have a history of specific conditions like heart disease, diabetes, or cancer?).
12. Lifestyle/Context (Any recent changes in diet, activity, or environment?).

If the patient's response doesn't directly answer your last question, ask the same question again to get clarification. If they state they don't know, move on to the next logical question in your structure. Your goal is to fill out a complete symptom report. Do not analyze, explain, or suggest treatment.

When you have exhausted all lines of questioning and feel the medical report is comprehensive, respond with the final message followed by the token. Example final message: "Thank you. The medical information is complete. The report is being generated. <<REPORT_COMPLETE>>"
"""

# --- Report Generation Prompt (for the final summary) ---
REPORT_PROMPT_TEMPLATE = """
You are a medical scribe. Your task is to summarize the following patient conversation history and integrate it with existing patient prerequisite information.

1.  Provide a concise summary of the key findings in a brief paragraph.
2.  Then, extract the remaining details into a structured JSON object with the following keys and values: `summary`, `symptoms`, `onset`, `duration`, `severity`, `frequency`, `character`, `location`, `triggers_relief`, `associated_symptoms`, `medical_history`, `family_history`, `lifestyle_context`, `patient_demographics`, `insurance_information`, `emergency_contact`, `known_allergies`, `current_medications`.
3.  For each key, extract information from both the conversation history AND the prerequisite data below. If information appears in both sources, prioritize the conversation data as it's more recent.
4.  For keys not addressed in either source, set the value to 'Not provided' or 'Unknown'.
5.  The final output MUST be only the JSON object. Do not include any analysis, diagnosis, or advice outside of the JSON.

CONVERSATION HISTORY:
---
{}
---

PATIENT PREREQUISITE DATA:
---
{}
---
"""

def call_gemini_api(history, report_mode=False, prerequisite_data=None):
    """Handles the API call to the Gemini model with conversation history."""
    if API_KEY == "YOUR_GEMINI_API_KEY_HERE" or not API_KEY:
        print("\nERROR: Please replace 'YOUR_GEMINI_API_KEY_HERE' in the script with your actual Gemini API Key.")
        return "Chat functionality disabled due to missing API Key."

    # Format history for API call
    formatted_history = []
    for msg in history:
        # The AI's responses might contain the REPORT_COMPLETE_TOKEN, remove it for context
        text = msg['text'].replace(REPORT_COMPLETE_TOKEN, '').strip()
        formatted_history.append({
            "role": "user" if msg['sender'] == 'user' else "model",
            "parts": [{"text": text}]
        })

    # Set up system instructions and generation config based on mode
    payload = {
        "contents": formatted_history,
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "model": MODEL_NAME,
    }

    if report_mode:
        # For report generation, we override the system prompt
        # Convert history to a simple string format for the report
        conversation_text = ""
        for msg in history:
            role = "Patient" if msg['sender'] == 'user' else "Assistant"
            conversation_text += f"{role}: {msg['text']}\n"
        
        # Format prerequisite data (will be empty if not available)
        prerequisite_text = "No prerequisite data available"
        if prerequisite_data:
            prerequisite_lines = []
            for key, value in prerequisite_data.items():
                if value and str(value).strip():
                    prerequisite_lines.append(f"{key.replace('_', ' ').title()}: {value}")
            if prerequisite_lines:
                prerequisite_text = "\n".join(prerequisite_lines)
        
        report_system_instruction = REPORT_PROMPT_TEMPLATE.format(conversation_text, prerequisite_text)
        payload["systemInstruction"]["parts"][0]["text"] = report_system_instruction
        
        # Simplified generation config - request JSON but don't enforce strict schema
        payload["generationConfig"] = {
            "responseMimeType": "application/json"
        }

    attempts = 0
    max_attempts = 5
    while attempts < max_attempts:
        try:
            if report_mode:
                print(f"Attempting report generation (attempt {attempts + 1}/{max_attempts})...")
            
            response = requests.post(API_URL, headers={'Content-Type': 'application/json'}, data=json.dumps(payload))
            
            if response.status_code == 200:
                result = response.json()
                text = result['candidates'][0]['content']['parts'][0]['text']
                if report_mode:
                    print("Report generation successful!")
                return text
            elif response.status_code == 429:
                # Handle rate limiting with exponential backoff
                delay = 2 ** attempts
                print(f"Rate limited. Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                error_msg = f"API Error (Status: {response.status_code}): {response.text}"
                if report_mode:
                    print(f"Report generation failed: {error_msg}")
                return error_msg
        except Exception as e:
            error_msg = f"An unexpected error occurred: {e}"
            if attempts == max_attempts - 1:
                print(error_msg)
                return error_msg
            else:
                print(f"Attempt {attempts + 1} failed: {e}. Retrying...")
        
        attempts += 1
    
    return "Failed to get a response after multiple retries."

def create_pdf_report(report_data, detailed_fields, pdf_filename):
    """Creates a PDF version of the medical report."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
    except ImportError:
        raise ImportError("reportlab library is required for PDF generation")
    
    # Create the PDF document
    doc = SimpleDocTemplate(pdf_filename, pagesize=letter, topMargin=0.5*inch)
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=18,
        textColor=colors.darkblue,
        alignment=1,  # Center alignment
        spaceAfter=30
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.darkblue,
        spaceBefore=20,
        spaceAfter=10
    )
    
    # Title
    title = Paragraph(f"MEDICAL ASSISTANT REPORT<br/>{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", title_style)
    story.append(title)
    story.append(Spacer(1, 20))
    
    # Summary section
    summary_heading = Paragraph("SUMMARY OF FINDINGS", heading_style)
    story.append(summary_heading)
    
    summary_text = report_data.get('summary', 'Not provided.')
    summary_para = Paragraph(summary_text, styles['Normal'])
    story.append(summary_para)
    story.append(Spacer(1, 20))
    
    # Detailed information table
    details_heading = Paragraph("DETAILED SYMPTOM DATA", heading_style)
    story.append(details_heading)
    
    # Create table data
    table_data = [['Category', 'Information']]  # Header row
    for key, label in detailed_fields.items():
        value = report_data.get(key, 'Not provided.')
        # Wrap long text
        if len(value) > 60:
            value = value[:60] + "..."
        table_data.append([label, value])
    
    # Create and style the table
    table = Table(table_data, colWidths=[2.5*inch, 4*inch])
    table.setStyle(TableStyle([
        # Header row styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Data rows styling
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.beige, colors.lightgrey]),
    ]))
    
    story.append(table)
    
    # Footer
    story.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        alignment=1
    )
    footer = Paragraph("Generated by MediSyn Medical Assistant", footer_style)
    story.append(footer)
    
    # Build the PDF
    doc.build(story)

def format_and_save_report(raw_json_report, base_filename=None):
    """Formats the JSON report data into human-readable text and PDF files."""
    try:
        report_data = json.loads(raw_json_report)
    except json.JSONDecodeError:
        print("\n--- REPORT GENERATION FAILED ---")
        print("Could not parse the AI's response into valid JSON. Printing raw output.")
        print(raw_json_report)
        return

    # Get the current script directory (backend/Chatbot/)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Generate timestamp-based filename if not provided
    if base_filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_filename = f"medical_report_{timestamp}"
    
    txt_filename = os.path.join(script_dir, f"{base_filename}.txt")
    pdf_filename = os.path.join(script_dir, f"{base_filename}.pdf")

    # Prepare data for output
    detailed_fields = {
        "symptoms": "Primary Symptoms",
        "onset": "Onset",
        "duration": "Duration",
        "severity": "Severity (1-10)",
        "frequency": "Frequency",
        "character": "Character",
        "location": "Location",
        "triggers_relief": "Triggers/Relief",
        "associated_symptoms": "Associated Symptoms",
        "medical_history": "Medical History",
        "family_history": "Family History",
        "lifestyle_context": "Lifestyle/Context",
        "patient_demographics": "Patient Demographics", 
        "insurance_information": "Insurance Information",
        "emergency_contact": "Emergency Contact",
        "known_allergies": "Known Allergies",
        "current_medications": "Current Medications"
    }

    report_output = "=================================================\n"
    report_output += f"MEDICAL ASSISTANT REPORT - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    report_output += "=================================================\n\n"
    
    # 1. Summary
    report_output += "--- SUMMARY OF FINDINGS ---\n"
    report_output += f"{report_data.get('summary', 'Not provided.')}\n\n"
    
    # 2. Detailed Information
    report_output += "--- DETAILED SYMPTOM DATA ---\n"
    for key, label in detailed_fields.items():
        value = report_data.get(key, 'Not provided.')
        report_output += f"{label:<25}: {value}\n"
    
    # Save text file
    with open(txt_filename, "w", encoding="utf-8") as f:
        f.write(report_output)
    
    print(f"\n--- REPORT GENERATED ---")
    print(f"Text file saved: {txt_filename}")
    
    # Generate PDF
    try:
        create_pdf_report(report_data, detailed_fields, pdf_filename)
        print(f"PDF file saved: {pdf_filename}")
    except ImportError:
        print("PDF generation skipped - reportlab not installed")
        print("To install: pip install reportlab")
    except Exception as e:
        print(f"PDF generation failed: {e}")
    
    print("========================")

# --- Session-based Chatbot Class ---
class ChatbotSession:
    """Session-based chatbot for API integration"""
    
    def __init__(self, session_id: str, patient_name: Optional[str] = None, patient_id: Optional[str] = None, appointment_id: Optional[str] = None):
        self.session_id = session_id
        self.patient_name = patient_name or "Patient"
        self.patient_id = patient_id or session_id
        self.appointment_id = appointment_id
        self.conversation_history: List[Dict[str, str]] = []
        self.is_complete = False
        self.created_at = datetime.now()
        
        # Fetch prerequisite data on initialization
        self.prerequisite_data = get_prerequisite_data(appointment_id, patient_id)
        
    def get_initial_message(self) -> str:
        """Get the initial greeting message"""
        initial_message = "Hello. What's been going on with you?"
        self.conversation_history.append({'sender': 'assistant', 'text': initial_message})
        return initial_message
    
    async def send_message(self, user_message: str) -> Dict[str, Any]:
        """Send a message and get AI response"""
        if self.is_complete:
            return {
                "response": "This session has been completed. Please start a new session.",
                "is_complete": True
            }
        
        # Add user message to history
        self.conversation_history.append({'sender': 'user', 'text': user_message})
        
        try:
            # Get AI response (call_gemini_api is synchronous, so we run it in executor)
            loop = asyncio.get_event_loop()
            ai_response = await loop.run_in_executor(
                None, 
                call_gemini_api, 
                self.conversation_history, 
                False,
                None  # No prerequisite data needed for normal conversation
            )
            
            # Check for completion signal
            if REPORT_COMPLETE_TOKEN in ai_response:
                final_message = ai_response.replace(REPORT_COMPLETE_TOKEN, '').strip()
                self.conversation_history.append({'sender': 'assistant', 'text': ai_response})
                self.is_complete = True
                
                return {
                    "response": final_message,
                    "is_complete": True
                }
            
            # Normal conversation flow
            self.conversation_history.append({'sender': 'assistant', 'text': ai_response})
            
            return {
                "response": ai_response,
                "is_complete": False
            }
            
        except Exception as e:
            return {
                "response": "I'm sorry, I encountered an error. Please try again.",
                "is_complete": False,
                "error": str(e)
            }
    
    def mark_complete(self):
        """Mark session as complete"""
        self.is_complete = True
    
    async def generate_report(self) -> Dict[str, Any]:
        """Generate final medical report"""
        if not self.conversation_history:
            raise ValueError("No conversation history available for report generation")
        
        try:
            # Generate report using existing function
            loop = asyncio.get_event_loop()
            raw_json_report = await loop.run_in_executor(
                None,
                call_gemini_api,
                self.conversation_history,
                True,
                self.prerequisite_data  # Pass prerequisite data for report generation
            )
            
            # Parse the JSON report
            try:
                # Extract JSON from the response
                json_start = raw_json_report.find('{')
                json_end = raw_json_report.rfind('}') + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = raw_json_report[json_start:json_end]
                    report_data = json.loads(json_str)
                else:
                    # Fallback if JSON parsing fails
                    report_data = {
                        "summary": "Report generation completed but parsing failed",
                        "raw_response": raw_json_report
                    }
            except json.JSONDecodeError:
                report_data = {
                    "summary": "Report generation completed but JSON parsing failed",
                    "raw_response": raw_json_report
                }
            
            # Generate files using existing function
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_filename = f"medical_report_{self.patient_id}_{timestamp}"
            
            # Get script directory
            script_dir = os.path.dirname(os.path.abspath(__file__))
            txt_filename = os.path.join(script_dir, f"{base_filename}.txt")
            pdf_filename = os.path.join(script_dir, f"{base_filename}.pdf")
            
            # Generate files
            await loop.run_in_executor(
                None,
                self._save_report_files,
                report_data,
                txt_filename,
                pdf_filename
            )
            
            return {
                "report_data": report_data,
                "txt_path": txt_filename,
                "pdf_path": pdf_filename,
                "session_id": self.session_id,
                "patient_name": self.patient_name
            }
            
        except Exception as e:
            raise Exception(f"Report generation failed: {str(e)}")
    
    def _save_report_files(self, report_data: Dict, txt_filename: str, pdf_filename: str):
        """Save report files (synchronous helper)"""
        detailed_fields = {
            "symptoms": "Primary Symptoms",
            "onset": "Onset", 
            "duration": "Duration",
            "severity": "Severity (1-10)",
            "frequency": "Frequency",
            "character": "Character",
            "location": "Location",
            "triggers_relief": "Triggers/Relief",
            "associated_symptoms": "Associated Symptoms",
            "medical_history": "Medical History",
            "family_history": "Family History",
            "lifestyle_context": "Lifestyle/Context",
            "patient_demographics": "Patient Demographics",
            "insurance_information": "Insurance Information",
            "emergency_contact": "Emergency Contact",
            "known_allergies": "Known Allergies",
            "current_medications": "Current Medications"
        }
        
        # Generate text report with patient information from prerequisite data if available
        patient_display_name = self.prerequisite_data.get('patient_name', self.patient_name) if self.prerequisite_data else self.patient_name
        date_of_birth = self.prerequisite_data.get('date_of_birth', '') if self.prerequisite_data else ''
        
        report_output = "=================================================\n"
        report_output += f"MEDICAL ASSISTANT REPORT - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        report_output += f"Patient: {patient_display_name}\n"
        if date_of_birth:
            report_output += f"Date of Birth: {date_of_birth}\n"
        report_output += f"Session ID: {self.session_id}\n"
        report_output += "=================================================\n\n"
        
        # Summary
        report_output += "--- SUMMARY OF FINDINGS ---\n"
        report_output += f"{report_data.get('summary', 'Not provided.')}\n\n"
        
        # Detailed Information
        report_output += "--- DETAILED SYMPTOM DATA ---\n"
        for key, label in detailed_fields.items():
            value = report_data.get(key, 'Not provided.')
            report_output += f"{label:<25}: {value}\n"
        
        # Save text file
        with open(txt_filename, "w", encoding="utf-8") as f:
            f.write(report_output)
        
        # Generate PDF
        try:
            create_pdf_report(report_data, detailed_fields, pdf_filename)
        except ImportError:
            print("PDF generation skipped - reportlab not installed")
        except Exception as e:
            print(f"PDF generation failed: {e}")

def run_chatbot():
    """Main function to run the command-line chatbot."""
    conversation_history = []
    
    print("--- MediSyn Medical Assistant Chatbot ---")
    print("Start a conversation by describing your symptoms.")
    print("Type 'exit' or 'quit' to end the session.")
    print("Reports will be saved in: backend/Chatbot/")
    print("Both TXT and PDF formats will be generated.")
    print("---------------------------------------------")

    # Initial greeting
    initial_message = "Hello. What's been going on with you?"
    conversation_history.append({'sender': 'assistant', 'text': initial_message})
    print(f"\nAssistant: {initial_message}")

    while True:
        try:
            user_input = input("\nYou: ").strip()
        except EOFError:
            break
        
        if user_input.lower() in ['exit', 'quit']:
            break

        if not user_input:
            continue

        # Add user message to history
        conversation_history.append({'sender': 'user', 'text': user_input})
        
        print("Assistant: Thinking...", end='\r')
        
        # Get AI response
        ai_response = call_gemini_api(conversation_history, report_mode=False)
        
        # Check for report completion signal
        if REPORT_COMPLETE_TOKEN in ai_response:
            final_message = ai_response.replace(REPORT_COMPLETE_TOKEN, '').strip()
            print(f"Assistant: {final_message}")
            
            # Add final message to history
            conversation_history.append({'sender': 'assistant', 'text': ai_response})
            
            print("\n--- Generating Final Report... ---")
            raw_json_report = call_gemini_api(conversation_history, report_mode=True)
            format_and_save_report(raw_json_report)
            break
        
        # Normal conversation flow
        conversation_history.append({'sender': 'assistant', 'text': ai_response})
        print(f"Assistant: {ai_response}")

if __name__ == "__main__":
    # Ensure 'requests' library is installed before running: pip install requests
    run_chatbot()