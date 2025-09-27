const fs = require('fs');
const path = require('path');

class MedicalReportSystem {
    constructor() {
        this.currentReport = this.initializeReport();
        this.patientRecords = [];
        this.medicalKeywords = this.initializeMedicalKeywords();
        this.confidenceScores = new Map();
        this.dataSources = new Map();
    }

    initializeReport() {
        return {
            sessionId: this.generateSessionId(),
            timestamp: new Date().toISOString(),
            patient: {
                demographics: {},
                presentingComplaint: "",
                symptoms: [],
                medicalHistory: [],
                currentMedications: [],
                allergies: [],
                vitalSigns: {},
                familyHistory: {
                    hereditaryDiseases: [],
                    familyMembers: [],
                    relationships: []
                },
                socialHistory: {
                    exercise: {
                        frequency: 'unknown',
                        activities: [],
                        duration: null
                    },
                    diet: {
                        type: 'unknown',
                        restrictions: [],
                        preferences: []
                    },
                    occupation: {
                        job: 'unknown',
                        industry: 'unknown',
                        status: 'unknown'
                    },
                    substanceUse: {
                        substances: [],
                        status: 'unknown',
                        details: []
                    }
                }
            },
            clinical: {
                examination: {},
                investigations: [],
                diagnosis: [],
                treatment: [],
                procedures: []
            },
            conversation: {
                doctorNotes: [],
                patientStatements: [],
                keyDecisions: [],
                followUpPlans: []
            },
            discharge: {
                condition: "",
                medications: [],
                instructions: [],
                followUp: [],
                restrictions: []
            }
        };
    }

    initializeMedicalKeywords() {
        return {
            symptoms: [
                'pain', 'ache', 'hurt', 'sore', 'burning', 'sharp', 'dull', 'throbbing',
                'cough', 'breathing', 'shortness', 'wheezing', 'chest tightness', 'difficulty breathing',
                'nausea', 'vomiting', 'diarrhea', 'constipation', 'stomach', 'abdomen', 'belly',
                'headache', 'dizziness', 'confusion', 'memory', 'seizure', 'fainting',
                'joint', 'muscle', 'stiffness', 'swelling', 'mobility', 'weakness',
                'fever', 'temperature', 'hot', 'cold', 'chills', 'sweating',
                'fatigue', 'tired', 'exhausted', 'weak', 'lethargic'
            ],
            conditions: [
                'diabetes', 'hypertension', 'asthma', 'arthritis', 'depression', 'anxiety',
                'infection', 'injury', 'fracture', 'allergic reaction', 'inflammation',
                'heart attack', 'stroke', 'pneumonia', 'bronchitis', 'gastritis',
                'migraine', 'seizure', 'epilepsy', 'cancer', 'tumor'
            ],
            medications: [
                'aspirin', 'ibuprofen', 'penicillin', 'metformin', 'insulin', 'morphine',
                'antibiotic', 'painkiller', 'antihistamine', 'steroid', 'inhaler',
                'tablet', 'capsule', 'injection', 'cream', 'ointment'
            ],
            severity: [
                'severe', 'acute', 'emergency', 'critical', 'unbearable', 'intense',
                'moderate', 'manageable', 'intermittent', 'occasional',
                'mild', 'slight', 'minor', 'tolerable'
            ],
            bodyParts: [
                'head', 'chest', 'heart', 'lung', 'stomach', 'abdomen', 'back', 'neck',
                'arm', 'leg', 'hand', 'foot', 'knee', 'shoulder', 'hip', 'wrist', 'ankle'
            ],
            familyHistory: [
                'family history', 'hereditary', 'genetic', 'inherited', 'runs in family',
                'mother', 'father', 'parent', 'grandmother', 'grandfather', 'grandparent',
                'sister', 'brother', 'sibling', 'aunt', 'uncle', 'cousin', 'relative'
            ],
            hereditaryDiseases: [
                'diabetes', 'hypertension', 'heart disease', 'cancer', 'breast cancer',
                'colon cancer', 'lung cancer', 'prostate cancer', 'ovarian cancer',
                'alzheimer', 'dementia', 'parkinson', 'huntington', 'cystic fibrosis',
                'sickle cell', 'hemophilia', 'thalassemia', 'muscular dystrophy',
                'down syndrome', 'trisomy', 'fragile x', 'tay sachs', 'g6pd deficiency'
            ],
            socialHistory: [
                'exercise', 'physical activity', 'workout', 'gym', 'running', 'walking',
                'diet', 'eating', 'nutrition', 'vegetarian', 'vegan', 'fast food',
                'drug use', 'substance abuse', 'marijuana', 'cocaine', 'heroin',
                'occupation', 'job', 'work', 'employment', 'retired', 'unemployed'
            ]
        };
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async loadPatientRecords() {
        try {
            const data = await fs.promises.readFile(
                path.join(__dirname, '../patient_records_visit_200.json'), 
                'utf8'
            );
            this.patientRecords = JSON.parse(data);
            console.log(`Loaded ${this.patientRecords.length} patient records`);
        } catch (error) {
            console.error('Error loading patient records:', error);
            this.patientRecords = [];
        }
    }

    updateReport(transcription, speaker, timestamp) {
        const analysis = this.analyzeTranscription(transcription);
        
        // Track data source
        this.trackDataSource(analysis, speaker, timestamp);
        
        // Update report based on speaker
        if (speaker === 'doctor' || speaker === 'Speaker 1') {
            this.updateDoctorNotes(analysis, timestamp);
            this.extractClinicalData(analysis);
        } else if (speaker === 'patient' || speaker === 'Speaker 2') {
            this.updatePatientStatements(analysis, timestamp);
            this.extractPatientData(analysis);
        }
        
        // Update relevant fields
        this.updateRelevantFields(analysis);
        
        // Calculate confidence scores
        this.updateConfidenceScores(analysis);
        
        return this.currentReport;
    }

    analyzeTranscription(text) {
        const analysis = {
            symptoms: this.extractSymptoms(text),
            conditions: this.extractConditions(text),
            medications: this.extractMedications(text),
            severity: this.extractSeverity(text),
            bodyParts: this.extractBodyParts(text),
            demographics: this.extractDemographics(text),
            vitalSigns: this.extractVitalSigns(text),
            procedures: this.extractProcedures(text),
            investigations: this.extractInvestigations(text),
            familyHistory: this.extractFamilyHistory(text),
            socialHistory: this.extractSocialHistory(text)
        };
        
        return analysis;
    }

    extractSymptoms(text) {
        const symptoms = [];
        const lowerText = text.toLowerCase();
        
        this.medicalKeywords.symptoms.forEach(symptom => {
            if (lowerText.includes(symptom)) {
                symptoms.push(symptom);
            }
        });
        
        // Look for symptom patterns
        const symptomPatterns = [
            /pain in \w+/gi,
            /ache in \w+/gi,
            /hurts in \w+/gi,
            /sore \w+/gi,
            /burning \w+/gi
        ];
        
        symptomPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                symptoms.push(...matches);
            }
        });
        
        return [...new Set(symptoms)]; // Remove duplicates
    }

    extractConditions(text) {
        const conditions = [];
        const lowerText = text.toLowerCase();
        
        this.medicalKeywords.conditions.forEach(condition => {
            if (lowerText.includes(condition)) {
                conditions.push(condition);
            }
        });
        
        return [...new Set(conditions)];
    }

    extractMedications(text) {
        const medications = [];
        const lowerText = text.toLowerCase();
        
        this.medicalKeywords.medications.forEach(medication => {
            if (lowerText.includes(medication)) {
                medications.push(medication);
            }
        });
        
        // Look for medication patterns
        const medicationPatterns = [
            /taking \w+/gi,
            /prescribed \w+/gi,
            /medication \w+/gi,
            /drug \w+/gi,
            /tablet \w+/gi,
            /\d+mg \w+/gi
        ];
        
        medicationPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                medications.push(...matches);
            }
        });
        
        return [...new Set(medications)];
    }

    extractSeverity(text) {
        const severity = [];
        const lowerText = text.toLowerCase();
        
        this.medicalKeywords.severity.forEach(sev => {
            if (lowerText.includes(sev)) {
                severity.push(sev);
            }
        });
        
        return [...new Set(severity)];
    }

    extractBodyParts(text) {
        const bodyParts = [];
        const lowerText = text.toLowerCase();
        
        this.medicalKeywords.bodyParts.forEach(part => {
            if (lowerText.includes(part)) {
                bodyParts.push(part);
            }
        });
        
        return [...new Set(bodyParts)];
    }

    extractDemographics(text) {
        const demographics = {};
        
        // Extract age
        const ageMatch = text.match(/(\d+)\s*(?:years?\s*old|y\.?o\.?)/i);
        if (ageMatch) {
            demographics.age = parseInt(ageMatch[1]);
        }
        
        // Extract gender
        if (text.match(/\b(male|man|he|him)\b/i)) {
            demographics.gender = 'male';
        } else if (text.match(/\b(female|woman|she|her)\b/i)) {
            demographics.gender = 'female';
        }
        
        return demographics;
    }

    extractVitalSigns(text) {
        const vitalSigns = {};
        
        // Extract blood pressure
        const bpMatch = text.match(/(\d+)\/(\d+)\s*(?:mmhg|blood pressure)/i);
        if (bpMatch) {
            vitalSigns.bloodPressure = `${bpMatch[1]}/${bpMatch[2]} mmHg`;
        }
        
        // Extract heart rate
        const hrMatch = text.match(/(\d+)\s*(?:bpm|heart rate|pulse)/i);
        if (hrMatch) {
            vitalSigns.heartRate = `${hrMatch[1]} bpm`;
        }
        
        // Extract temperature
        const tempMatch = text.match(/(\d+\.?\d*)\s*(?:°f|°c|degrees?|fever)/i);
        if (tempMatch) {
            vitalSigns.temperature = `${tempMatch[1]}°F`;
        }
        
        return vitalSigns;
    }

    extractProcedures(text) {
        const procedures = [];
        const procedureKeywords = [
            'surgery', 'operation', 'procedure', 'biopsy', 'scan', 'x-ray', 'mri', 'ct',
            'blood test', 'urine test', 'injection', 'vaccination', 'suture', 'cast'
        ];
        
        const lowerText = text.toLowerCase();
        procedureKeywords.forEach(procedure => {
            if (lowerText.includes(procedure)) {
                procedures.push(procedure);
            }
        });
        
        return [...new Set(procedures)];
    }

    extractInvestigations(text) {
        const investigations = [];
        const investigationKeywords = [
            'blood test', 'urine test', 'x-ray', 'mri', 'ct scan', 'ultrasound',
            'ecg', 'ekg', 'endoscopy', 'colonoscopy', 'biopsy', 'culture'
        ];
        
        const lowerText = text.toLowerCase();
        investigationKeywords.forEach(investigation => {
            if (lowerText.includes(investigation)) {
                investigations.push(investigation);
            }
        });
        
        return [...new Set(investigations)];
    }

    extractFamilyHistory(text) {
        const familyHistory = {
            hereditaryDiseases: [],
            familyMembers: [],
            relationships: []
        };
        
        const lowerText = text.toLowerCase();
        
        // Extract hereditary diseases
        this.medicalKeywords.hereditaryDiseases.forEach(disease => {
            if (lowerText.includes(disease)) {
                familyHistory.hereditaryDiseases.push(disease);
            }
        });
        
        // Extract family member references
        this.medicalKeywords.familyHistory.forEach(term => {
            if (lowerText.includes(term)) {
                familyHistory.familyMembers.push(term);
            }
        });
        
        // Look for specific patterns like "mother has diabetes", "father died of cancer"
        const familyPatterns = [
            /(mother|father|parent|grandmother|grandfather|sister|brother|aunt|uncle|cousin)\s+(?:has|had|died of|suffers from|diagnosed with)\s+(\w+)/gi,
            /(mother|father|parent|grandmother|grandfather|sister|brother|aunt|uncle|cousin)\s+(\w+)/gi
        ];
        
        familyPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const parts = match.split(/\s+/);
                    if (parts.length >= 3) {
                        familyHistory.relationships.push({
                            member: parts[0],
                            condition: parts.slice(2).join(' ')
                        });
                    }
                });
            }
        });
        
        return familyHistory;
    }

    extractSocialHistory(text) {
        const socialHistory = {
            exercise: this.extractExerciseHabits(text),
            diet: this.extractDietHabits(text),
            occupation: this.extractOccupation(text),
            substanceUse: this.extractSubstanceUse(text)
        };
        
        return socialHistory;
    }

    extractExerciseHabits(text) {
        const exerciseInfo = {
            frequency: 'unknown',
            activities: [],
            duration: null
        };
        
        const lowerText = text.toLowerCase();
        
        // Determine exercise frequency
        if (lowerText.includes('daily') || lowerText.includes('every day')) {
            exerciseInfo.frequency = 'daily';
        } else if (lowerText.includes('weekly') || lowerText.includes('per week')) {
            exerciseInfo.frequency = 'weekly';
        } else if (lowerText.includes('occasional') || lowerText.includes('sometimes')) {
            exerciseInfo.frequency = 'occasional';
        } else if (lowerText.includes('never') || lowerText.includes('sedentary')) {
            exerciseInfo.frequency = 'never';
        }
        
        // Extract specific activities
        const exerciseKeywords = ['running', 'walking', 'cycling', 'swimming', 'gym', 'workout', 'yoga', 'pilates', 'weight lifting'];
        exerciseKeywords.forEach(activity => {
            if (lowerText.includes(activity)) {
                exerciseInfo.activities.push(activity);
            }
        });
        
        // Extract duration
        const durationMatch = text.match(/(\d+)\s*(?:minutes?|hours?|mins?|hrs?)\s*(?:per\s*day|daily|per\s*week|weekly)/i);
        if (durationMatch) {
            exerciseInfo.duration = durationMatch[0];
        }
        
        return exerciseInfo;
    }

    extractDietHabits(text) {
        const dietInfo = {
            type: 'unknown',
            restrictions: [],
            preferences: []
        };
        
        const lowerText = text.toLowerCase();
        
        // Determine diet type
        if (lowerText.includes('vegetarian') || lowerText.includes('vegan')) {
            dietInfo.type = 'vegetarian';
        } else if (lowerText.includes('keto') || lowerText.includes('ketogenic')) {
            dietInfo.type = 'ketogenic';
        } else if (lowerText.includes('paleo')) {
            dietInfo.type = 'paleo';
        } else if (lowerText.includes('mediterranean')) {
            dietInfo.type = 'mediterranean';
        }
        
        // Extract dietary restrictions
        const restrictionKeywords = ['gluten-free', 'dairy-free', 'nut allergy', 'shellfish allergy', 'lactose intolerant'];
        restrictionKeywords.forEach(restriction => {
            if (lowerText.includes(restriction)) {
                dietInfo.restrictions.push(restriction);
            }
        });
        
        // Extract dietary preferences
        const preferenceKeywords = ['organic', 'fresh', 'processed', 'fast food', 'home cooked'];
        preferenceKeywords.forEach(preference => {
            if (lowerText.includes(preference)) {
                dietInfo.preferences.push(preference);
            }
        });
        
        return dietInfo;
    }

    extractOccupation(text) {
        const occupationInfo = {
            job: 'unknown',
            industry: 'unknown',
            status: 'unknown'
        };
        
        const lowerText = text.toLowerCase();
        
        // Determine employment status
        if (lowerText.includes('retired') || lowerText.includes('retirement')) {
            occupationInfo.status = 'retired';
        } else if (lowerText.includes('unemployed') || lowerText.includes('jobless')) {
            occupationInfo.status = 'unemployed';
        } else if (lowerText.includes('employed') || lowerText.includes('working')) {
            occupationInfo.status = 'employed';
        }
        
        // Extract specific occupations
        const occupationKeywords = [
            'teacher', 'doctor', 'nurse', 'engineer', 'lawyer', 'accountant', 'manager',
            'sales', 'construction', 'factory', 'office', 'hospital', 'school', 'government'
        ];
        
        occupationKeywords.forEach(job => {
            if (lowerText.includes(job)) {
                occupationInfo.job = job;
            }
        });
        
        return occupationInfo;
    }

    extractSubstanceUse(text) {
        const substanceInfo = {
            substances: [],
            status: 'unknown',
            details: []
        };
        
        const lowerText = text.toLowerCase();
        
        // Extract specific substances
        const substanceKeywords = ['marijuana', 'cannabis', 'cocaine', 'heroin', 'methamphetamine', 'opioids', 'prescription drugs'];
        substanceKeywords.forEach(substance => {
            if (lowerText.includes(substance)) {
                substanceInfo.substances.push(substance);
            }
        });
        
        // Determine use status
        if (lowerText.includes('current use') || lowerText.includes('actively using')) {
            substanceInfo.status = 'current';
        } else if (lowerText.includes('former use') || lowerText.includes('past use') || lowerText.includes('used to')) {
            substanceInfo.status = 'former';
        } else if (lowerText.includes('never used') || lowerText.includes('no history')) {
            substanceInfo.status = 'never';
        }
        
        return substanceInfo;
    }

    updateDoctorNotes(analysis, timestamp) {
        const note = {
            timestamp,
            content: analysis,
            type: 'doctor_note'
        };
        
        this.currentReport.conversation.doctorNotes.push(note);
        
        // Extract clinical data from doctor's notes
        if (analysis.diagnosis && analysis.diagnosis.length > 0) {
            this.currentReport.clinical.diagnosis = [
                ...new Set([...this.currentReport.clinical.diagnosis, ...analysis.diagnosis])
            ];
        }
        
        if (analysis.treatment && analysis.treatment.length > 0) {
            this.currentReport.clinical.treatment = [
                ...new Set([...this.currentReport.clinical.treatment, ...analysis.treatment])
            ];
        }
    }

    updatePatientStatements(analysis, timestamp) {
        const statement = {
            timestamp,
            content: analysis,
            type: 'patient_statement'
        };
        
        this.currentReport.conversation.patientStatements.push(statement);
        
        // Extract patient data
        if (analysis.symptoms && analysis.symptoms.length > 0) {
            this.currentReport.patient.symptoms = [
                ...new Set([...this.currentReport.patient.symptoms, ...analysis.symptoms])
            ];
        }
        
        if (analysis.medications && analysis.medications.length > 0) {
            this.currentReport.patient.currentMedications = [
                ...new Set([...this.currentReport.patient.currentMedications, ...analysis.medications])
            ];
        }
    }

    extractClinicalData(analysis) {
        // Update clinical examination
        if (analysis.examination) {
            Object.assign(this.currentReport.clinical.examination, analysis.examination);
        }
        
        // Update investigations
        if (analysis.investigations && analysis.investigations.length > 0) {
            this.currentReport.clinical.investigations = [
                ...new Set([...this.currentReport.clinical.investigations, ...analysis.investigations])
            ];
        }
        
        // Update procedures
        if (analysis.procedures && analysis.procedures.length > 0) {
            this.currentReport.clinical.procedures = [
                ...new Set([...this.currentReport.clinical.procedures, ...analysis.procedures])
            ];
        }
    }

    extractPatientData(analysis) {
        // Update demographics
        if (analysis.demographics && Object.keys(analysis.demographics).length > 0) {
            Object.assign(this.currentReport.patient.demographics, analysis.demographics);
        }
        
        // Update vital signs
        if (analysis.vitalSigns && Object.keys(analysis.vitalSigns).length > 0) {
            Object.assign(this.currentReport.patient.vitalSigns, analysis.vitalSigns);
        }
    }

    updateRelevantFields(analysis) {
        // Update presenting complaint if this is early in conversation
        if (this.currentReport.patient.presentingComplaint === "" && analysis.symptoms.length > 0) {
            this.currentReport.patient.presentingComplaint = analysis.symptoms.join(", ");
        }
        
        // Update discharge condition
        if (analysis.conditions && analysis.conditions.length > 0) {
            this.currentReport.discharge.condition = analysis.conditions.join(", ");
        }
        
        // Update treatment plan with any mentioned treatments
        if (analysis.medications && analysis.medications.length > 0) {
            this.currentReport.clinical.treatment = [
                ...new Set([...this.currentReport.clinical.treatment, ...analysis.medications])
            ];
        }
        
        // Update procedures
        if (analysis.procedures && analysis.procedures.length > 0) {
            this.currentReport.clinical.procedures = [
                ...new Set([...this.currentReport.clinical.procedures, ...analysis.procedures])
            ];
        }
        
        // Update investigations
        if (analysis.investigations && analysis.investigations.length > 0) {
            this.currentReport.clinical.investigations = [
                ...new Set([...this.currentReport.clinical.investigations, ...analysis.investigations])
            ];
        }
        
        // Update family history
        if (analysis.familyHistory) {
            if (analysis.familyHistory.hereditaryDiseases && analysis.familyHistory.hereditaryDiseases.length > 0) {
                this.currentReport.patient.familyHistory.hereditaryDiseases = [
                    ...new Set([...this.currentReport.patient.familyHistory.hereditaryDiseases, ...analysis.familyHistory.hereditaryDiseases])
                ];
            }
            if (analysis.familyHistory.familyMembers && analysis.familyHistory.familyMembers.length > 0) {
                this.currentReport.patient.familyHistory.familyMembers = [
                    ...new Set([...this.currentReport.patient.familyHistory.familyMembers, ...analysis.familyHistory.familyMembers])
                ];
            }
            if (analysis.familyHistory.relationships && analysis.familyHistory.relationships.length > 0) {
                this.currentReport.patient.familyHistory.relationships = [
                    ...this.currentReport.patient.familyHistory.relationships, ...analysis.familyHistory.relationships
                ];
            }
        }
        
        // Update social history
        if (analysis.socialHistory) {
            // Update exercise habits
            if (analysis.socialHistory.exercise && analysis.socialHistory.exercise.frequency !== 'unknown') {
                this.currentReport.patient.socialHistory.exercise = {
                    ...this.currentReport.patient.socialHistory.exercise,
                    ...analysis.socialHistory.exercise
                };
            }
            
            // Update diet habits
            if (analysis.socialHistory.diet && analysis.socialHistory.diet.type !== 'unknown') {
                this.currentReport.patient.socialHistory.diet = {
                    ...this.currentReport.patient.socialHistory.diet,
                    ...analysis.socialHistory.diet
                };
            }
            
            // Update occupation
            if (analysis.socialHistory.occupation && analysis.socialHistory.occupation.status !== 'unknown') {
                this.currentReport.patient.socialHistory.occupation = {
                    ...this.currentReport.patient.socialHistory.occupation,
                    ...analysis.socialHistory.occupation
                };
            }
            
            // Update substance use
            if (analysis.socialHistory.substanceUse && analysis.socialHistory.substanceUse.status !== 'unknown') {
                this.currentReport.patient.socialHistory.substanceUse = {
                    ...this.currentReport.patient.socialHistory.substanceUse,
                    ...analysis.socialHistory.substanceUse
                };
            }
        }
    }

    trackDataSource(field, value, source) {
        const sourceKey = `${field}_${Date.now()}`;
        this.dataSources.set(sourceKey, {
            field,
            value,
            source: {
                speaker: source.speaker,
                timestamp: source.timestamp,
                confidence: source.confidence || 0.8,
                context: source.context
            }
        });
    }

    updateConfidenceScores(analysis) {
        Object.keys(analysis).forEach(field => {
            if (analysis[field] && analysis[field].length > 0) {
                const confidence = this.calculateFieldConfidence(field, analysis[field]);
                this.confidenceScores.set(field, confidence);
            }
        });
    }

    calculateFieldConfidence(field, data) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence based on data quality
        if (Array.isArray(data) && data.length > 0) {
            confidence += 0.2;
        }
        
        if (typeof data === 'object' && Object.keys(data).length > 0) {
            confidence += 0.2;
        }
        
        // Increase confidence for medical terminology
        if (this.isMedicalTerminology(field, data)) {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }

    isMedicalTerminology(field, data) {
        const medicalFields = ['symptoms', 'conditions', 'medications', 'procedures'];
        return medicalFields.includes(field);
    }

    generateFinalReport() {
        const finalReport = {
            // Patient Information
            patient_id: this.generatePatientId(),
            demographics: {
                age: this.currentReport.patient.demographics.age || null,
                sex: this.currentReport.patient.demographics.gender || null,
                race: null, // Not typically mentioned in conversation
                ethnicity: null, // Not typically mentioned in conversation
                height_cm: null, // Not typically mentioned in conversation
                weight_kg: null, // Not typically mentioned in conversation
                bmi: null // Calculated from height/weight
            },
            
            // Medical Information
            encounters: [{
                encounter_id: this.generateEncounterId(),
                date: new Date().toISOString().split('T')[0],
                chief_complaint: this.currentReport.patient.presentingComplaint,
                encounter_type: "outpatient", // Default assumption
                diagnoses: this.currentReport.clinical.diagnosis,
                procedures: this.currentReport.clinical.procedures,
                medications: this.formatMedications(this.currentReport.patient.currentMedications),
                lab_results: this.formatLabResults(this.currentReport.clinical.investigations),
                vital_signs: this.currentReport.patient.vitalSigns,
                symptoms: this.currentReport.patient.symptoms,
                treatment_plan: this.currentReport.clinical.treatment,
                follow_up: this.currentReport.discharge.followUp,
                discharge_instructions: this.currentReport.discharge.instructions
            }],
            
            // Quality & Validation
            confidence_scores: Object.fromEntries(this.confidenceScores),
            data_sources: Array.from(this.dataSources.entries()).map(([key, value]) => value),
            last_updated: new Date().toISOString(),
            session_id: this.currentReport.sessionId
        };
        
        return finalReport;
    }

    generatePatientId() {
        return 'P' + Date.now().toString().slice(-6);
    }

    generateEncounterId() {
        return 'E' + Date.now().toString().slice(-6);
    }

    formatMedications(medications) {
        return medications.map(med => ({
            name: med,
            dose: "Unknown", // Not typically specified in conversation
            route: "Unknown",
            frequency: "Unknown",
            start_date: new Date().toISOString().split('T')[0],
            end_date: null
        }));
    }

    formatLabResults(investigations) {
        return investigations.map(inv => ({
            loinc_code: "Unknown",
            name: inv,
            value: "Pending",
            units: "Unknown",
            date: new Date().toISOString().split('T')[0]
        }));
    }

    findSimilarCases(currentAnalysis, topK = 5) {
        if (this.patientRecords.length === 0) {
            return [];
        }
        
        const similarities = [];
        
        this.patientRecords.forEach((record, index) => {
            let score = 0;
            
            // Symptom matching
            if (currentAnalysis.symptoms && currentAnalysis.symptoms.length > 0) {
                const symptomMatches = this.calculateMatches(
                    currentAnalysis.symptoms, 
                    this.extractRecordSymptoms(record)
                );
                score += symptomMatches * 0.4;
            }
            
            // Age similarity
            if (currentAnalysis.demographics && currentAnalysis.demographics.age) {
                const ageScore = this.calculateAgeSimilarity(
                    currentAnalysis.demographics.age,
                    record.demographics?.age
                );
                score += ageScore * 0.2;
            }
            
            // Condition matching
            if (currentAnalysis.conditions && currentAnalysis.conditions.length > 0) {
                const conditionMatches = this.calculateMatches(
                    currentAnalysis.conditions,
                    this.extractRecordConditions(record)
                );
                score += conditionMatches * 0.3;
            }
            
            // Medication matching
            if (currentAnalysis.medications && currentAnalysis.medications.length > 0) {
                const medicationMatches = this.calculateMatches(
                    currentAnalysis.medications,
                    this.extractRecordMedications(record)
                );
                score += medicationMatches * 0.1;
            }
            
            if (score > 0.1) {
                similarities.push({
                    case: record,
                    score,
                    reasons: this.getMatchReasons(currentAnalysis, record)
                });
            }
        });
        
        return similarities
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    extractRecordSymptoms(record) {
        const symptoms = [];
        if (record.encounters && record.encounters.length > 0) {
            record.encounters.forEach(encounter => {
                // Extract from chief complaint
                if (encounter.chief_complaint) {
                    symptoms.push(encounter.chief_complaint);
                }
                // Extract from notes text
                if (encounter.notes_text) {
                    // Split notes text into words and look for symptom keywords
                    const words = encounter.notes_text.toLowerCase().split(/\s+/);
                    const symptomKeywords = this.medicalKeywords.symptoms;
                    words.forEach(word => {
                        if (symptomKeywords.some(keyword => word.includes(keyword))) {
                            symptoms.push(word);
                        }
                    });
                }
            });
        }
        return [...new Set(symptoms)]; // Remove duplicates
    }

    extractRecordConditions(record) {
        const conditions = [];
        if (record.encounters && record.encounters.length > 0) {
            record.encounters.forEach(encounter => {
                if (encounter.diagnoses) {
                    conditions.push(...encounter.diagnoses);
                }
            });
        }
        return conditions;
    }

    extractRecordMedications(record) {
        const medications = [];
        if (record.encounters && record.encounters.length > 0) {
            record.encounters.forEach(encounter => {
                if (encounter.medications) {
                    encounter.medications.forEach(med => {
                        medications.push(med.name);
                    });
                }
            });
        }
        return medications;
    }

    calculateMatches(array1, array2) {
        if (!array1 || !array2 || array1.length === 0 || array2.length === 0) {
            return 0;
        }
        
        const matches = array1.filter(item => 
            array2.some(item2 => 
                item2.toLowerCase().includes(item.toLowerCase()) ||
                item.toLowerCase().includes(item2.toLowerCase())
            )
        );
        
        return matches.length / Math.max(array1.length, array2.length);
    }

    calculateAgeSimilarity(age1, age2) {
        if (!age1 || !age2) return 0;
        
        const diff = Math.abs(age1 - age2);
        if (diff <= 5) return 1.0;
        if (diff <= 10) return 0.8;
        if (diff <= 20) return 0.5;
        return 0.2;
    }

    getMatchReasons(currentAnalysis, record) {
        const reasons = [];
        
        if (currentAnalysis.symptoms && currentAnalysis.symptoms.length > 0) {
            const recordSymptoms = this.extractRecordSymptoms(record);
            const commonSymptoms = currentAnalysis.symptoms.filter(symptom =>
                recordSymptoms.some(rs => 
                    rs.toLowerCase().includes(symptom.toLowerCase()) ||
                    symptom.toLowerCase().includes(rs.toLowerCase())
                )
            );
            if (commonSymptoms.length > 0) {
                reasons.push(`Common symptoms: ${commonSymptoms.join(', ')}`);
            }
        }
        
        if (currentAnalysis.demographics && currentAnalysis.demographics.age) {
            const recordAge = record.demographics?.age;
            if (recordAge && Math.abs(currentAnalysis.demographics.age - recordAge) <= 10) {
                reasons.push(`Similar age: ${recordAge} vs ${currentAnalysis.demographics.age}`);
            }
        }
        
        return reasons;
    }

    getCurrentReport() {
        return this.currentReport;
    }

    getConfidenceScores() {
        return Object.fromEntries(this.confidenceScores);
    }

    resetReport() {
        this.currentReport = this.initializeReport();
        this.confidenceScores.clear();
        this.dataSources.clear();
    }
}

module.exports = MedicalReportSystem;
