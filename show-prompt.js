#!/usr/bin/env node

const PDFReportService = require('./pdf-report-service');
require('dotenv').config();

async function showPrompt() {
    const service = new PDFReportService();
    await service.initialize();
    
    const sampleTranscription = 'Patient complains of chest pain that started 2 days ago, lasts for 30 minutes, severity 8/10, occurs daily. Also has shortness of breath and fatigue. Patient has history of diabetes and hypertension. Taking metformin 500mg twice daily. No known allergies.';
    const sampleSpeaker = 'Patient';
    
    console.log('='.repeat(80));
    console.log('PROMPT BEING SENT TO GEMINI AI');
    console.log('='.repeat(80));
    console.log();
    
    const prompt = `
You are a clinical documentation AI assistant.  
Your task is to **update an existing medical report** based on a new conversation transcription between a patient and a doctor.  
You must carefully integrate new findings while preserving existing information that is still accurate.

---

### Context Provided
1. **Existing Medical Report (PDF transcription):**
${service.initialReportText}

2. **New Patient–Doctor Conversation:**
Speaker: ${sampleSpeaker}
Content: ${sampleTranscription}

---

### Instructions
- **Step 1: Extract Key Data from Conversation.**
  - Identify updated symptoms, complaints, diagnoses, medications, allergies, lab values, vitals, and treatment plans.  
  - Capture negations (e.g., "patient denies chest pain"), timelines, and follow-ups.  
  - Include the physician's rationale if mentioned.

- **Step 2: Update Report Fields.**
  - Modify only relevant sections.  
  - If the conversation contradicts existing content, replace outdated info.  
  - If it provides extra details, add them.  
  - Preserve all previously valid data.

- **Step 3: Output a PDF-Ready Structured Report.**
  - Organize the output into clearly labeled sections in the following order:  
    1. Patient Demographics  
    2. Chief Complaint  
    3. History of Present Illness  
    4. Past Medical History  
    5. Family History  
    6. Social History  
    7. Medications  
    8. Allergies  
    9. Vitals & Labs  
    10. Assessment  
    11. Plan  
    12. Physician Notes  
  - Write in a **professional clinical style**.  
  - Ensure formatting is **clean and structured** so it can be directly converted into a PDF.  

---

### Output Requirements
- Output **only the updated report in text format** (no extra commentary).  
- Do not leave placeholders, nulls, or "N/A".  
- Ensure the text is **fully ready to render into a PDF**.
`;
    
    console.log(prompt);
    console.log();
    console.log('='.repeat(80));
    console.log('END OF PROMPT');
    console.log('='.repeat(80));
}

showPrompt().catch(console.error);
