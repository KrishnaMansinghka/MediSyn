const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFReportService {
    constructor() {
        // Initialize Gemini AI - you'll need to set GEMINI_API_KEY environment variable
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        this.initialReportPath = path.join(__dirname, '../medical_assistant_report.pdf');
        this.initialReportText = null;
    }

    async initialize() {
        try {
            // Extract text from the initial PDF report
            const pdfBuffer = await fs.readFile(this.initialReportPath);
            const pdfData = await pdfParse(pdfBuffer);
            this.initialReportText = pdfData.text;
            console.log('Initial medical report loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading initial report:', error);
            return false;
        }
    }

    async updateReportWithTranscription(transcription, speaker = 'Unknown') {
        try {
            if (!this.initialReportText) {
                throw new Error('Initial report not loaded');
            }

            // Try Gemini AI first
            try {
                const prompt = `
You are a clinical documentation AI assistant.  
Your task is to **update an existing medical report** based on a new conversation transcription between a patient and a doctor.  
You must carefully integrate new findings while preserving existing information that is still accurate.

---

### Context Provided
1. **Existing Medical Report (PDF transcription):**
${this.initialReportText}

2. **New Patient–Doctor Conversation:**
Speaker: ${speaker}
Content: ${transcription}

---

### Instructions
- **Step 1: Extract Key Data from Conversation.**
  - Identify updated symptoms, complaints, diagnoses, medications, allergies, lab values, vitals, and treatment plans.  
  - Capture negations (e.g., "patient denies chest pain"), timelines, and follow-ups.  
  - Include the physician's rationale if mentioned.
  - **CRITICAL**: Extract specific details like "peanut allergy", "metformin 500mg", "chest pain 8/10"

- **Step 2: Update Report Fields.**
  - Modify only relevant sections.  
  - If the conversation contradicts existing content, replace outdated info.  
  - If it provides extra details, add them.  
  - Preserve all previously valid data.
  - **CRITICAL**: Update specific fields with extracted information (e.g., ALLERGIES: "peanut", MEDICATIONS: "metformin 500mg")

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
  - **CRITICAL**: Fill in specific extracted information, not generic placeholders  

---

### Output Requirements
- Output **only the updated report in text format** (no extra commentary).  
- Do not leave placeholders, nulls, or "N/A".  
- Ensure the text is **fully ready to render into a PDF**.
`;

                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const updatedReportText = response.text();

                return {
                    success: true,
                    updatedReport: updatedReportText,
                    timestamp: new Date().toISOString(),
                    method: 'gemini'
                };
            } catch (geminiError) {
                console.log('Gemini AI failed, using fallback method:', geminiError.message);
                
                // Fallback: Simple text combination
                const updatedReportText = this.createFallbackReport(transcription, speaker);
                
                return {
                    success: true,
                    updatedReport: updatedReportText,
                    timestamp: new Date().toISOString(),
                    method: 'fallback'
                };
            }

        } catch (error) {
            console.error('Error updating report:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    createFallbackReport(transcription, speaker) {
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        
        return `
MEDICAL REPORT

Date: ${currentDate}
Time: ${currentTime}
Generated by: Clinical Documentation System (Fallback Mode)

1. PATIENT DEMOGRAPHICS
   - Consultation Date: ${currentDate}
   - Speaker: ${speaker}
   - Report Type: Live Transcription Analysis

2. CHIEF COMPLAINT
   ${this.extractChiefComplaint(transcription)}

3. HISTORY OF PRESENT ILLNESS
   - Onset: ${this.extractOnset(transcription)}
   - Duration: ${this.extractDuration(transcription)}
   - Severity: ${this.extractSeverity(transcription)}
   - Frequency: ${this.extractFrequency(transcription)}
   - Character: ${this.extractCharacter(transcription)}
   - Location: ${this.extractLocation(transcription)}
   - Triggers/Relief: ${this.extractTriggers(transcription)}

4. PAST MEDICAL HISTORY
   ${this.extractMedicalHistory(transcription)}

5. FAMILY HISTORY
   ${this.extractFamilyHistory(transcription)}

6. SOCIAL HISTORY
   ${this.extractLifestyle(transcription)}

7. MEDICATIONS
   ${this.extractMedications(transcription)}

8. ALLERGIES
   ${this.extractAllergies(transcription)}

9. VITALS & LABS
   ${this.extractVitals(transcription)}

10. ASSESSMENT
    ${this.extractAssessment(transcription)}

11. PLAN
    ${this.extractPlan(transcription)}

12. PHYSICIAN NOTES
    - Full Transcription: ${transcription}
    - Analysis Method: Automated keyword extraction
    - Confidence: Moderate (fallback mode)
    - Timestamp: ${new Date().toISOString()}
    - Note: This report was generated using fallback analysis due to AI service unavailability

---
END OF REPORT
        `.trim();
    }

    extractChiefComplaint(text) {
        const symptoms = this.extractSymptoms(text);
        return symptoms !== 'Not specified' ? symptoms : 'See full transcription below';
    }

    extractMedications(text) {
        const medKeywords = ['medication', 'medicine', 'drug', 'prescription', 'tablet', 'capsule', 'injection', 'dose', 'mg', 'ml', 'taking', 'prescribed'];
        
        // Check if any medication keywords are present
        let hasMedication = false;
        for (const keyword of medKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                hasMedication = true;
                break;
            }
        }
        
        if (hasMedication) {
            // Extract specific medication information
            const medPatterns = [
                /(\w+)\s+(\d+)\s*mg/gi,
                /taking\s+(\w+)/gi,
                /prescribed\s+(\w+)/gi
            ];
            
            const foundMeds = [];
            for (const pattern of medPatterns) {
                const matches = text.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        // Extract just the medication name and dose
                        const medMatch = match.match(/(\w+)\s*(\d*)\s*mg?/i);
                        if (medMatch) {
                            const medName = medMatch[1];
                            const dose = medMatch[2] ? ` ${medMatch[2]}mg` : '';
                            const med = medName + dose;
                            if (med && !foundMeds.includes(med)) {
                                foundMeds.push(med);
                            }
                        }
                    });
                }
            }
            
            if (foundMeds.length > 0) {
                return foundMeds.join(', ');
            } else {
                return 'Medication mentioned - see transcription for details';
            }
        }
        
        return 'Not specified in transcription';
    }

    extractAllergies(text) {
        const allergyKeywords = ['allergy', 'allergic', 'reaction', 'intolerance', 'sensitive'];
        
        // Check if any allergy keywords are present
        let hasAllergy = false;
        for (const keyword of allergyKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                hasAllergy = true;
                break;
            }
        }
        
        if (hasAllergy) {
            // Extract specific allergy information
            const allergyPatterns = [
                /(\w+)\s+allergy/gi,
                /allergic\s+to\s+(\w+)/gi,
                /(\w+)\s+reaction/gi,
                /intolerant\s+to\s+(\w+)/gi
            ];
            
            const foundAllergies = [];
            for (const pattern of allergyPatterns) {
                const matches = text.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        const allergy = match.replace(/\b(allergy|allergic|reaction|intolerant)\b/gi, '').trim();
                        if (allergy && !foundAllergies.includes(allergy)) {
                            foundAllergies.push(allergy);
                        }
                    });
                }
            }
            
            if (foundAllergies.length > 0) {
                return foundAllergies.join(', ');
            } else {
                return 'Allergy mentioned - see transcription for details';
            }
        }
        
        return 'Not specified in transcription';
    }

    extractVitals(text) {
        const vitalKeywords = ['blood pressure', 'heart rate', 'temperature', 'pulse', 'respiratory rate', 'oxygen', 'saturation', 'weight', 'height', 'bmi'];
        
        for (const keyword of vitalKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return 'See transcription for vital signs';
            }
        }
        
        return 'Not specified in transcription';
    }

    extractAssessment(text) {
        const assessmentKeywords = ['diagnosis', 'condition', 'disease', 'syndrome', 'disorder', 'finding'];
        
        for (const keyword of assessmentKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return 'See transcription for clinical assessment';
            }
        }
        
        return 'Pending clinical assessment';
    }

    extractPlan(text) {
        const planKeywords = ['treatment', 'therapy', 'follow-up', 'appointment', 'referral', 'procedure', 'surgery', 'medication', 'lifestyle'];
        
        for (const keyword of planKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return 'See transcription for treatment plan';
            }
        }
        
        return 'Treatment plan to be determined';
    }

    extractSymptoms(text) {
        const symptoms = [];
        const symptomKeywords = [
            'pain', 'ache', 'hurt', 'sore', 'tender', 'swollen', 'numb', 'tingling', 
            'dizzy', 'nausea', 'fever', 'cough', 'headache', 'fatigue', 'weakness',
            'shortness of breath', 'chest pain', 'abdominal pain', 'back pain',
            'joint pain', 'muscle pain', 'stiffness', 'cramping', 'burning',
            'itching', 'rash', 'swelling', 'inflammation', 'bleeding', 'discharge'
        ];
        
        symptomKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                symptoms.push(keyword);
            }
        });
        
        return symptoms.length > 0 ? symptoms.join(', ') : 'Not specified';
    }

    extractOnset(text) {
        const onsetPatterns = [
            /(\d+)\s*(day|week|month|year)s?\s*ago/i,
            /started\s*(\d+)\s*(day|week|month|year)s?\s*ago/i,
            /began\s*(\d+)\s*(day|week|month|year)s?\s*ago/i
        ];
        
        for (const pattern of onsetPatterns) {
            const match = text.match(pattern);
            if (match) {
                return `${match[1]} ${match[2]}s ago`;
            }
        }
        
        return 'Not specified';
    }

    extractDuration(text) {
        const durationPatterns = [
            /lasts?\s*(\d+)\s*(minute|hour|day|week)s?/i,
            /for\s*(\d+)\s*(minute|hour|day|week)s?/i,
            /(\d+)\s*(minute|hour|day|week)s?\s*long/i
        ];
        
        for (const pattern of durationPatterns) {
            const match = text.match(pattern);
            if (match) {
                return `${match[1]} ${match[2]}s`;
            }
        }
        
        return 'Not specified';
    }

    extractSeverity(text) {
        const severityPatterns = [
            /(\d+)\s*out\s*of\s*10/i,
            /(\d+)\/10/i,
            /severity\s*(\d+)/i,
            /pain\s*level\s*(\d+)/i
        ];
        
        for (const pattern of severityPatterns) {
            const match = text.match(pattern);
            if (match) {
                return `${match[1]} out of 10`;
            }
        }
        
        return 'Not specified';
    }

    extractFrequency(text) {
        const frequencyPatterns = [
            /every\s*(\d+)\s*(day|week|month|hour)s?/i,
            /(\d+)\s*times?\s*(per|a)\s*(day|week|month)/i,
            /daily|weekly|monthly|hourly/i
        ];
        
        for (const pattern of frequencyPatterns) {
            const match = text.match(pattern);
            if (match) {
                if (match[0].toLowerCase().includes('daily')) return 'Daily';
                if (match[0].toLowerCase().includes('weekly')) return 'Weekly';
                if (match[0].toLowerCase().includes('monthly')) return 'Monthly';
                if (match[0].toLowerCase().includes('hourly')) return 'Hourly';
                return `${match[1]} times per ${match[3] || match[2]}`;
            }
        }
        
        return 'Not specified';
    }

    extractCharacter(text) {
        const characterKeywords = ['sharp', 'dull', 'burning', 'throbbing', 'stabbing', 'aching', 'cramping', 'pressure'];
        
        for (const keyword of characterKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return keyword;
            }
        }
        
        return 'Not specified';
    }

    extractLocation(text) {
        const locationKeywords = ['head', 'chest', 'back', 'stomach', 'leg', 'arm', 'neck', 'shoulder', 'knee', 'ankle', 'wrist'];
        
        for (const keyword of locationKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return keyword;
            }
        }
        
        return 'Not specified';
    }

    extractTriggers(text) {
        const triggerKeywords = ['when', 'after', 'during', 'triggered by', 'caused by', 'worse with', 'better with'];
        
        for (const keyword of triggerKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return 'See transcription for details';
            }
        }
        
        return 'Not specified';
    }

    extractAssociatedSymptoms(text) {
        const associatedKeywords = ['also', 'along with', 'accompanied by', 'in addition to'];
        
        for (const keyword of associatedKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return 'See transcription for details';
            }
        }
        
        return 'Not specified';
    }

    extractMedicalHistory(text) {
        const medicalKeywords = ['diabetes', 'hypertension', 'heart', 'lung', 'kidney', 'liver', 'cancer', 'surgery', 'medication', 'allergy'];
        
        const foundConditions = [];
        medicalKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                foundConditions.push(keyword);
            }
        });
        
        return foundConditions.length > 0 ? foundConditions.join(', ') : 'Not specified';
    }

    extractFamilyHistory(text) {
        const familyKeywords = ['family', 'mother', 'father', 'sibling', 'parent', 'grandparent', 'hereditary', 'genetic'];
        
        for (const keyword of familyKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return 'See transcription for details';
            }
        }
        
        return 'Not specified';
    }

    extractLifestyle(text) {
        const lifestyleKeywords = ['exercise', 'diet', 'smoking', 'alcohol', 'stress', 'work', 'sleep', 'activity'];
        
        for (const keyword of lifestyleKeywords) {
            if (text.toLowerCase().includes(keyword)) {
                return 'See transcription for details';
            }
        }
        
        return 'Not specified';
    }

    async generatePDFFromText(reportText, outputPath) {
        try {
            // Try Puppeteer first
            try {
                const browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                });

                const page = await browser.newPage();

                // Create HTML content for the report
                const htmlContent = this.createHTMLFromReport(reportText);

                await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

                // Generate PDF
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: {
                        top: '20mm',
                        right: '20mm',
                        bottom: '20mm',
                        left: '20mm'
                    }
                });

                await browser.close();

                // Save PDF to file
                await fs.writeFile(outputPath, pdfBuffer);

                return {
                    success: true,
                    pdfPath: outputPath,
                    buffer: pdfBuffer,
                    method: 'puppeteer'
                };
            } catch (puppeteerError) {
                console.log('Puppeteer failed, using text fallback:', puppeteerError.message);
                
                // Fallback: Create a simple text-based PDF-like content
                const textContent = this.createTextReport(reportText);
                const textBuffer = Buffer.from(textContent, 'utf8');
                
                // Save as text file (can be converted to PDF later)
                const textPath = outputPath.replace('.pdf', '.txt');
                await fs.writeFile(textPath, textBuffer);
                
                return {
                    success: true,
                    pdfPath: textPath,
                    buffer: textBuffer,
                    method: 'text-fallback'
                };
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    createTextReport(reportText) {
        const lines = reportText.split('\n').filter(line => line.trim());
        let textContent = '';
        
        textContent += '='.repeat(60) + '\n';
        textContent += 'MEDICAL ASSISTANT REPORT\n';
        textContent += '='.repeat(60) + '\n\n';
        
        for (const line of lines) {
            if (line.trim()) {
                textContent += line + '\n';
            }
        }
        
        textContent += '\n' + '='.repeat(60) + '\n';
        textContent += `Generated on: ${new Date().toLocaleString()}\n`;
        textContent += '='.repeat(60) + '\n';
        
        return textContent;
    }

    createHTMLFromReport(reportText) {
        // Parse the report text and create structured HTML
        const lines = reportText.split('\n').filter(line => line.trim());
        
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Medical Assistant Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #007bff;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #007bff;
                    margin: 0;
                    font-size: 24px;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section h2 {
                    color: #007bff;
                    font-size: 18px;
                    margin-bottom: 10px;
                    border-left: 4px solid #007bff;
                    padding-left: 10px;
                }
                .field {
                    margin-bottom: 8px;
                    display: flex;
                }
                .field-label {
                    font-weight: bold;
                    min-width: 150px;
                    color: #555;
                }
                .field-value {
                    flex: 1;
                }
                .summary {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .timestamp {
                    text-align: right;
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Medical Assistant Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
        `;

        // Parse the report text and structure it
        let currentSection = '';
        let inSummary = false;
        let summaryContent = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.toLowerCase().includes('summary:')) {
                inSummary = true;
                summaryContent = '';
                continue;
            }
            
            if (line.toLowerCase().includes('detailed information:')) {
                inSummary = false;
                if (summaryContent) {
                    html += `<div class="summary"><h2>Summary</h2><p>${summaryContent}</p></div>`;
                }
                currentSection = 'detailed';
                html += '<div class="section"><h2>Detailed Information</h2>';
                continue;
            }
            
            if (inSummary && line) {
                summaryContent += line + ' ';
                continue;
            }
            
            if (currentSection === 'detailed') {
                if (line.includes(':')) {
                    const [label, ...valueParts] = line.split(':');
                    const value = valueParts.join(':').trim();
                    if (value) {
                        html += `
                        <div class="field">
                            <div class="field-label">${label.trim()}:</div>
                            <div class="field-value">${value}</div>
                        </div>
                        `;
                    }
                }
            }
        }

        if (summaryContent) {
            html += `<div class="summary"><h2>Summary</h2><p>${summaryContent}</p></div>`;
        }

        html += `
            </div>
            <div class="timestamp">
                Report generated on ${new Date().toLocaleString()}
            </div>
        </body>
        </html>
        `;

        return html;
    }

    async processTranscriptionAndGeneratePDF(transcription, speaker = 'Unknown', dischargeSummary = null) {
        try {
            // Step 1: Update report with Gemini
            const updateResult = await this.updateReportWithTranscription(transcription, speaker);
            
            if (!updateResult.success) {
                throw new Error(`Failed to update report: ${updateResult.error}`);
            }

            // Step 2: Generate PDF from updated report
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputPath = path.join(__dirname, `../generated_reports/medical_report_${timestamp}.pdf`);
            
            // Ensure directory exists
            const reportsDir = path.dirname(outputPath);
            await fs.mkdir(reportsDir, { recursive: true });

            // Include discharge summary if provided
            let finalReportText = updateResult.updatedReport;
            if (dischargeSummary && dischargeSummary.trim()) {
                finalReportText += '\n\n---\n\nDISCHARGE SUMMARY\n\n';
                // Convert HTML to plain text for PDF
                const plainTextSummary = this.convertHtmlToPlainText(dischargeSummary);
                finalReportText += plainTextSummary;
            }
            
            const pdfResult = await this.generatePDFFromText(finalReportText, outputPath);
            
            if (!pdfResult.success) {
                throw new Error(`Failed to generate PDF: ${pdfResult.error}`);
            }

            return {
                success: true,
                updatedReport: finalReportText,
                pdfPath: pdfResult.pdfPath,
                pdfBuffer: pdfResult.buffer,
                timestamp: updateResult.timestamp
            };

        } catch (error) {
            console.error('Error processing transcription and generating PDF:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async generateReportFromMedicalData(medicalReport) {
        try {
            console.log('Generating report from medical data...');
            
            // Create a structured report from the medical data
            const reportText = this.createStructuredReportFromMedicalData(medicalReport);
            
            // Try to generate PDF using Puppeteer
            try {
                const outputPath = path.join(__dirname, `medical_report_${Date.now()}.pdf`);
                await this.generatePDFFromText(reportText, outputPath);
                
                const pdfBuffer = fs.readFileSync(outputPath);
                fs.unlinkSync(outputPath); // Clean up temp file
                
                return {
                    success: true,
                    pdfBuffer: pdfBuffer,
                    method: 'puppeteer',
                    timestamp: new Date().toISOString()
                };
            } catch (puppeteerError) {
                console.log('Puppeteer failed, using text fallback:', puppeteerError.message);
                
                // Fallback to text file
                const textBuffer = Buffer.from(reportText, 'utf8');
                
                return {
                    success: true,
                    pdfBuffer: textBuffer,
                    method: 'text',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('Error generating report from medical data:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    createStructuredReportFromMedicalData(medicalReport) {
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        
        let reportText = `MEDICAL REPORT\n\n`;
        reportText += `Date: ${currentDate}\n`;
        reportText += `Time: ${currentTime}\n`;
        reportText += `Generated by: Clinical Documentation System\n\n`;
        
        // Patient Demographics
        reportText += `1. PATIENT DEMOGRAPHICS\n`;
        if (medicalReport.patient.demographics && Object.keys(medicalReport.patient.demographics).length > 0) {
            Object.entries(medicalReport.patient.demographics).forEach(([key, value]) => {
                reportText += `   - ${key}: ${value}\n`;
            });
        } else {
            reportText += `   - Consultation Date: ${currentDate}\n`;
            reportText += `   - Report Type: Medical Data Analysis\n`;
        }
        reportText += `\n`;
        
        // Chief Complaint
        reportText += `2. CHIEF COMPLAINT\n`;
        if (medicalReport.patient.presentingComplaint) {
            reportText += `   ${medicalReport.patient.presentingComplaint}\n`;
        } else {
            reportText += `   Not specified\n`;
        }
        reportText += `\n`;
        
        // History of Present Illness
        reportText += `3. HISTORY OF PRESENT ILLNESS\n`;
        if (medicalReport.patient.symptoms && medicalReport.patient.symptoms.length > 0) {
            reportText += `   - Symptoms: ${medicalReport.patient.symptoms.join(', ')}\n`;
        } else {
            reportText += `   - Symptoms: Not specified\n`;
        }
        reportText += `\n`;
        
        // Past Medical History
        reportText += `4. PAST MEDICAL HISTORY\n`;
        if (medicalReport.patient.medicalHistory && medicalReport.patient.medicalHistory.length > 0) {
            reportText += `   ${medicalReport.patient.medicalHistory.join(', ')}\n`;
        } else {
            reportText += `   Not specified\n`;
        }
        reportText += `\n`;
        
        // Family History
        reportText += `5. FAMILY HISTORY\n`;
        if (medicalReport.patient.familyHistory.hereditaryDiseases.length > 0) {
            reportText += `   - Hereditary Diseases: ${medicalReport.patient.familyHistory.hereditaryDiseases.join(', ')}\n`;
        }
        if (medicalReport.patient.familyHistory.familyMembers.length > 0) {
            reportText += `   - Family Members: ${medicalReport.patient.familyHistory.familyMembers.join(', ')}\n`;
        }
        if (medicalReport.patient.familyHistory.relationships.length > 0) {
            reportText += `   - Relationships:\n`;
            medicalReport.patient.familyHistory.relationships.forEach(rel => {
                reportText += `     * ${rel.member}: ${rel.condition}\n`;
            });
        }
        if (medicalReport.patient.familyHistory.hereditaryDiseases.length === 0 && 
            medicalReport.patient.familyHistory.familyMembers.length === 0) {
            reportText += `   Not specified\n`;
        }
        reportText += `\n`;
        
        // Social History
        reportText += `6. SOCIAL HISTORY\n`;
        
        // Exercise
        if (medicalReport.patient.socialHistory.exercise.frequency !== 'unknown') {
            reportText += `   - Exercise: ${medicalReport.patient.socialHistory.exercise.frequency}`;
            if (medicalReport.patient.socialHistory.exercise.activities.length > 0) {
                reportText += ` (${medicalReport.patient.socialHistory.exercise.activities.join(', ')})`;
            }
            if (medicalReport.patient.socialHistory.exercise.duration) {
                reportText += ` - ${medicalReport.patient.socialHistory.exercise.duration}`;
            }
            reportText += `\n`;
        }
        
        // Diet
        if (medicalReport.patient.socialHistory.diet.type !== 'unknown') {
            reportText += `   - Diet: ${medicalReport.patient.socialHistory.diet.type}\n`;
        }
        if (medicalReport.patient.socialHistory.diet.restrictions.length > 0) {
            reportText += `   - Dietary Restrictions: ${medicalReport.patient.socialHistory.diet.restrictions.join(', ')}\n`;
        }
        
        // Occupation
        if (medicalReport.patient.socialHistory.occupation.job !== 'unknown') {
            reportText += `   - Occupation: ${medicalReport.patient.socialHistory.occupation.job}\n`;
        }
        if (medicalReport.patient.socialHistory.occupation.status !== 'unknown') {
            reportText += `   - Employment Status: ${medicalReport.patient.socialHistory.occupation.status}\n`;
        }
        
        // Substance Use
        if (medicalReport.patient.socialHistory.substanceUse.status !== 'unknown') {
            reportText += `   - Substance Use: ${medicalReport.patient.socialHistory.substanceUse.status}\n`;
        }
        if (medicalReport.patient.socialHistory.substanceUse.substances.length > 0) {
            reportText += `   - Substances: ${medicalReport.patient.socialHistory.substanceUse.substances.join(', ')}\n`;
        }
        
        if (medicalReport.patient.socialHistory.exercise.frequency === 'unknown' && 
            medicalReport.patient.socialHistory.diet.type === 'unknown' &&
            medicalReport.patient.socialHistory.occupation.job === 'unknown') {
            reportText += `   Not specified\n`;
        }
        reportText += `\n`;
        
        // Medications
        reportText += `7. MEDICATIONS\n`;
        if (medicalReport.patient.currentMedications && medicalReport.patient.currentMedications.length > 0) {
            reportText += `   ${medicalReport.patient.currentMedications.join(', ')}\n`;
        } else {
            reportText += `   Not specified\n`;
        }
        reportText += `\n`;
        
        // Allergies
        reportText += `8. ALLERGIES\n`;
        if (medicalReport.patient.allergies && medicalReport.patient.allergies.length > 0) {
            reportText += `   ${medicalReport.patient.allergies.join(', ')}\n`;
        } else {
            reportText += `   Not specified\n`;
        }
        reportText += `\n`;
        
        // Vitals & Labs
        reportText += `9. VITALS & LABS\n`;
        if (medicalReport.patient.vitalSigns && Object.keys(medicalReport.patient.vitalSigns).length > 0) {
            Object.entries(medicalReport.patient.vitalSigns).forEach(([key, value]) => {
                reportText += `   - ${key}: ${value}\n`;
            });
        } else {
            reportText += `   Not specified\n`;
        }
        reportText += `\n`;
        
        // Assessment
        reportText += `10. ASSESSMENT\n`;
        if (medicalReport.clinical.diagnosis && medicalReport.clinical.diagnosis.length > 0) {
            reportText += `   ${medicalReport.clinical.diagnosis.join(', ')}\n`;
        } else {
            reportText += `   Pending clinical assessment\n`;
        }
        reportText += `\n`;
        
        // Plan
        reportText += `11. PLAN\n`;
        if (medicalReport.clinical.treatment && medicalReport.clinical.treatment.length > 0) {
            reportText += `   ${medicalReport.clinical.treatment.join(', ')}\n`;
        } else {
            reportText += `   Treatment plan to be determined\n`;
        }
        reportText += `\n`;
        
        // Physician Notes
        reportText += `12. PHYSICIAN NOTES\n`;
        reportText += `   - Report Generated: ${currentDate} at ${currentTime}\n`;
        reportText += `   - Analysis Method: Medical data extraction\n`;
        reportText += `   - Confidence: High (structured data)\n`;
        reportText += `   - Timestamp: ${new Date().toISOString()}\n`;
        reportText += `   - Note: This report was generated from structured medical data\n`;
        
        reportText += `\n---\nEND OF REPORT`;
        
        return reportText;
    }

    async generateDischargeSummary(reportText) {
        try {
            // Try Gemini AI first
            try {
                const prompt = `
You are a medical discharge summary specialist. Your task is to create a patient-friendly discharge summary based on the provided medical report.

Please create a clear, concise discharge summary that includes:

1. **Disease/Condition Information**: What the patient has, in simple terms
2. **Medications**: What medications to take, dosages, and when
3. **Lifestyle Changes**: Important lifestyle modifications (diet, exercise, activities to avoid)
4. **Follow-up Instructions**: When to see the doctor next, what to watch for
5. **Emergency Instructions**: When to seek immediate medical attention

Make the language patient-friendly and easy to understand. Use bullet points and clear headings.

Medical Report:
${reportText}

Please format the discharge summary with clear sections and patient-friendly language.`;

                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const dischargeSummary = response.text();

                return this.formatDischargeSummary(dischargeSummary);
            } catch (geminiError) {
                console.log('Gemini AI failed for discharge summary, using fallback method:', geminiError.message);
                return this.createFallbackDischargeSummary(reportText);
            }
        } catch (error) {
            console.error('Error generating discharge summary:', error);
            return this.createFallbackDischargeSummary(reportText);
        }
    }

    formatDischargeSummary(dischargeText) {
        // Convert the text to HTML format for better display
        let html = '<div class="discharge-summary">';
        
        // Split by sections and format
        const sections = dischargeText.split(/\n(?=\d+\.|\*\*|#)/);
        
        sections.forEach(section => {
            const trimmedSection = section.trim();
            if (trimmedSection) {
                if (trimmedSection.includes('Disease') || trimmedSection.includes('Condition')) {
                    html += '<h4>🏥 Your Condition</h4>';
                    html += '<div class="section-content">' + this.formatSectionContent(trimmedSection) + '</div>';
                } else if (trimmedSection.includes('Medication')) {
                    html += '<h4>💊 Your Medications</h4>';
                    html += '<div class="section-content">' + this.formatSectionContent(trimmedSection) + '</div>';
                } else if (trimmedSection.includes('Lifestyle') || trimmedSection.includes('Diet') || trimmedSection.includes('Exercise')) {
                    html += '<h4>🏃 Lifestyle Changes</h4>';
                    html += '<div class="section-content">' + this.formatSectionContent(trimmedSection) + '</div>';
                } else if (trimmedSection.includes('Follow-up') || trimmedSection.includes('Next Visit')) {
                    html += '<h4>📅 Follow-up Instructions</h4>';
                    html += '<div class="section-content">' + this.formatSectionContent(trimmedSection) + '</div>';
                } else if (trimmedSection.includes('Emergency') || trimmedSection.includes('Seek')) {
                    html += '<h4>🚨 When to Seek Emergency Care</h4>';
                    html += '<div class="section-content">' + this.formatSectionContent(trimmedSection) + '</div>';
                } else {
                    html += '<div class="section-content">' + this.formatSectionContent(trimmedSection) + '</div>';
                }
            }
        });
        
        html += '</div>';
        return html;
    }

    formatSectionContent(content) {
        // Convert bullet points and lists to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/^[-•]\s*(.*)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        return formatted;
    }

    createFallbackDischargeSummary(reportText) {
        // Extract key information from the report text
        const lines = reportText.split('\n');
        let condition = 'Not specified';
        let medications = [];
        let allergies = [];
        let symptoms = [];
        let followUp = 'Please schedule a follow-up appointment as recommended by your doctor.';

        // Extract information using keyword matching
        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            
            if (lowerLine.includes('diagnosis') || lowerLine.includes('assessment')) {
                const match = line.match(/diagnosis[:\s]+(.*)|assessment[:\s]+(.*)/i);
                if (match) {
                    condition = match[1] || match[2] || 'Not specified';
                }
            }
            
            if (lowerLine.includes('medication') || lowerLine.includes('prescription')) {
                const medMatch = line.match(/([a-zA-Z]+(?:\s+\d+[a-zA-Z]*)*)/g);
                if (medMatch) {
                    medications.push(...medMatch);
                }
            }
            
            if (lowerLine.includes('allerg')) {
                const allergyMatch = line.match(/([a-zA-Z]+(?:\s+allergy)?)/g);
                if (allergyMatch) {
                    allergies.push(...allergyMatch);
                }
            }
            
            if (lowerLine.includes('symptom')) {
                const symptomMatch = line.match(/([a-zA-Z]+(?:\s+pain)?)/g);
                if (symptomMatch) {
                    symptoms.push(...symptomMatch);
                }
            }
        });

        // Create structured discharge summary
        let html = '<div class="discharge-summary">';
        
        html += '<h4>🏥 Your Condition</h4>';
        html += '<div class="section-content">';
        html += `<p><strong>Primary Condition:</strong> ${condition}</p>`;
        if (symptoms.length > 0) {
            html += `<p><strong>Key Symptoms:</strong> ${symptoms.join(', ')}</p>`;
        }
        html += '</div>';

        html += '<h4>💊 Your Medications</h4>';
        html += '<div class="section-content">';
        if (medications.length > 0) {
            html += '<ul>';
            medications.forEach(med => {
                html += `<li>${med} - Take as prescribed by your doctor</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>No specific medications mentioned. Please follow your doctor\'s prescription instructions.</p>';
        }
        html += '</div>';

        html += '<h4>🏃 Lifestyle Changes</h4>';
        html += '<div class="section-content">';
        html += '<ul>';
        html += '<li>Follow a balanced diet as recommended by your healthcare provider</li>';
        html += '<li>Engage in regular physical activity as tolerated</li>';
        html += '<li>Avoid activities that may worsen your condition</li>';
        html += '<li>Get adequate rest and sleep</li>';
        html += '</ul>';
        html += '</div>';

        html += '<h4>📅 Follow-up Instructions</h4>';
        html += '<div class="section-content">';
        html += `<p>${followUp}</p>`;
        html += '<ul>';
        html += '<li>Take all medications as prescribed</li>';
        html += '<li>Monitor your symptoms and report any changes</li>';
        html += '<li>Keep all scheduled appointments</li>';
        html += '</ul>';
        html += '</div>';

        html += '<h4>🚨 When to Seek Emergency Care</h4>';
        html += '<div class="section-content">';
        html += '<p>Seek immediate medical attention if you experience:</p>';
        html += '<ul>';
        html += '<li>Severe or worsening symptoms</li>';
        html += '<li>Difficulty breathing</li>';
        html += '<li>Chest pain</li>';
        html += '<li>Signs of allergic reaction to medications</li>';
        html += '<li>Any other concerning symptoms</li>';
        html += '</ul>';
        html += '</div>';

        html += '</div>';
        return html;
    }

    convertHtmlToPlainText(html) {
        // Convert HTML back to plain text for PDF generation
        let text = html;
        
        // Remove HTML tags but preserve structure
        text = text.replace(/<div class="discharge-summary">/g, '');
        text = text.replace(/<\/div>/g, '\n');
        text = text.replace(/<h4>/g, '\n');
        text = text.replace(/<\/h4>/g, '\n');
        text = text.replace(/<div class="section-content">/g, '');
        text = text.replace(/<p>/g, '');
        text = text.replace(/<\/p>/g, '\n');
        text = text.replace(/<strong>/g, '');
        text = text.replace(/<\/strong>/g, '');
        text = text.replace(/<li>/g, '• ');
        text = text.replace(/<\/li>/g, '\n');
        text = text.replace(/<ul>/g, '');
        text = text.replace(/<\/ul>/g, '\n');
        text = text.replace(/<br>/g, '\n');
        text = text.replace(/<br\/>/g, '\n');
        
        // Clean up extra whitespace and newlines
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
        text = text.replace(/^\s+|\s+$/g, '');
        
        return text;
    }
}

module.exports = PDFReportService;
