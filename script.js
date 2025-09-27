class AudioTranscriptionApp {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioUrl = null;
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.visualizerCanvas = null;
        this.visualizerCtx = null;
        this.animationId = null;
        
        // WebSocket and streaming
        this.socket = null;
        this.isStreaming = false;
        this.finalTranscript = '';
        this.interimTranscript = '';

        this.initializeElements();
        this.setupEventListeners();
        this.setupVisualizer();
        this.initializeSocket();
    }

    initializeElements() {
        this.recordBtn = document.getElementById('recordBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.playBtn = document.getElementById('playBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.recordingIndicator = document.getElementById('recordingIndicator');
        this.timer = document.getElementById('timer');
        this.transcriptionResult = document.getElementById('transcriptionResult');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.visualizerCanvas = document.getElementById('visualizer');
        this.visualizerCtx = this.visualizerCanvas.getContext('2d');
        
        // Medical report elements
        this.viewReportBtn = document.getElementById('viewReportBtn');
        this.finalReportBtn = document.getElementById('finalReportBtn');
        this.previewReportBtn = document.getElementById('previewReportBtn');
        this.generatePdfBtn = document.getElementById('generatePdfBtn');
        this.resetReportBtn = document.getElementById('resetReportBtn');
        this.reportDisplay = document.getElementById('reportDisplay');
        this.similarCasesDisplay = document.getElementById('similarCasesDisplay');
        
        // Text input elements
        this.textInput = document.getElementById('textInput');
        this.speakerSelect = document.getElementById('speakerSelect');
        this.processTextBtn = document.getElementById('processTextBtn');
        this.clearTextBtn = document.getElementById('clearTextBtn');
        
        // Modal elements
        this.reportPreviewModal = document.getElementById('reportPreviewModal');
        this.dischargeModal = document.getElementById('dischargeModal');
        this.reportPreviewContent = document.getElementById('reportPreviewContent');
        this.dischargeContent = document.getElementById('dischargeContent');
        this.dischargePrompt = document.querySelector('.discharge-prompt');
        this.yesDischargeBtn = document.getElementById('yesDischargeBtn');
        this.noDischargeBtn = document.getElementById('noDischargeBtn');
        this.downloadDischargeBtn = document.getElementById('downloadDischargeBtn');
        this.generateDischargeBtn = document.getElementById('generateDischargeBtn');
        this.editDischargeBtn = document.getElementById('editDischargeBtn');
        this.dischargeEditTextarea = document.getElementById('dischargeEditTextarea');
        this.saveDischargeBtn = document.getElementById('saveDischargeBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        
        // Debug: Check if edit elements are found
        console.log('Edit elements found:', {
            editDischargeBtn: !!this.editDischargeBtn,
            dischargeEditTextarea: !!this.dischargeEditTextarea,
            saveDischargeBtn: !!this.saveDischargeBtn,
            cancelEditBtn: !!this.cancelEditBtn,
            dischargeContent: !!this.dischargeContent
        });
        
        // Additional debug: Check if elements exist in DOM
        console.log('DOM elements check:', {
            editBtn: document.getElementById('editDischargeBtn'),
            textarea: document.getElementById('dischargeEditTextarea'),
            saveBtn: document.getElementById('saveDischargeBtn'),
            cancelBtn: document.getElementById('cancelEditBtn'),
            content: document.getElementById('dischargeContent')
        });
    }

    setupEventListeners() {
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.playBtn.addEventListener('click', () => this.playRecording());
        this.downloadBtn.addEventListener('click', () => this.downloadAudio());
        
        // Medical report event listeners
        this.viewReportBtn.addEventListener('click', () => this.viewCurrentReport());
        this.finalReportBtn.addEventListener('click', () => this.generateFinalReport());
        this.previewReportBtn.addEventListener('click', () => this.previewPdfReport());
        this.generatePdfBtn.addEventListener('click', () => this.generatePdfReport());
        this.resetReportBtn.addEventListener('click', () => this.resetReport());
        
        // Text input event listeners
        this.processTextBtn.addEventListener('click', () => this.processTextInput());
        this.clearTextBtn.addEventListener('click', () => this.clearTextInput());
        
        // Modal event listeners
        this.setupModalEventListeners();
        
        // Initialize report display on page load
        this.initializeReportDisplay();
    }

    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus('connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus('disconnected');
        });

        this.socket.on('transcription-result', (data) => {
            this.handleTranscriptionResult(data);
            
            // Update medical report and similar cases
            if (data.medicalReport) {
                this.updateMedicalReport(data.medicalReport);
            }
            if (data.similarCases) {
                this.updateSimilarCases(data.similarCases);
            }
        });

        this.socket.on('transcription-error', (error) => {
            console.error('Transcription error:', error);
            this.showError('Transcription error: ' + error.error);
        });
    }

    updateConnectionStatus(status) {
        this.connectionStatus.className = `status-indicator ${status}`;
        const statusText = {
            'connected': 'Connected',
            'disconnected': 'Disconnected',
            'connecting': 'Connecting...'
        };
        this.connectionStatus.querySelector('span').textContent = statusText[status];
    }

    setupVisualizer() {
        this.visualizerCanvas.width = 400;
        this.visualizerCanvas.height = 100;
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 48000
                } 
            });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            this.analyser.fftSize = 256;
            this.microphone.connect(this.analyser);

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
                
                // Send audio data to server for live transcription
                if (this.isStreaming && this.socket && this.socket.connected) {
                    this.socket.emit('audio-data', event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioUrl = URL.createObjectURL(this.audioBlob);
                this.updateUIAfterRecording();
            };

            // Start streaming transcription
            this.startStreaming();
            
            this.mediaRecorder.start(100); // Send data every 100ms for real-time processing
            this.isRecording = true;
            this.startTime = Date.now();
            
            this.updateRecordingUI();
            this.startTimer();
            this.startVisualizer();

        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Failed to start recording. Please check microphone permissions.');
        }
    }

    startStreaming() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('start-streaming', {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: 'en-US',
                enableAutomaticPunctuation: true,
                model: 'latest_long'
            });
            this.isStreaming = true;
            this.finalTranscript = '';
            this.interimTranscript = '';
            this.transcriptionResult.innerHTML = '<p class="placeholder">Listening for speech...</p>';
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop streaming
            this.stopStreaming();
            
            // Stop all tracks
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            
            this.stopTimer();
            this.stopVisualizer();
            this.updateRecordingUI();
        }
    }

    stopStreaming() {
        if (this.socket && this.socket.connected && this.isStreaming) {
            this.socket.emit('stop-streaming');
            this.isStreaming = false;
        }
    }

    playRecording() {
        if (this.audioUrl) {
            const audio = new Audio(this.audioUrl);
            audio.play();
        }
    }

    updateRecordingUI() {
        this.recordBtn.disabled = this.isRecording;
        this.stopBtn.disabled = !this.isRecording;
        this.playBtn.disabled = !this.audioUrl;
        this.downloadBtn.disabled = !this.audioBlob;

        if (this.isRecording) {
            this.recordingIndicator.classList.add('active');
        } else {
            this.recordingIndicator.classList.remove('active');
        }
    }

    updateUIAfterRecording() {
        this.updateRecordingUI();
        this.showSuccess('Recording completed successfully!');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    startVisualizer() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.isRecording) return;

            this.animationId = requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(dataArray);
            
            this.visualizerCtx.fillStyle = '#f8f9fa';
            this.visualizerCtx.fillRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);
            
            const barWidth = (this.visualizerCanvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * this.visualizerCanvas.height;
                
                const gradient = this.visualizerCtx.createLinearGradient(0, this.visualizerCanvas.height, 0, this.visualizerCanvas.height - barHeight);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                
                this.visualizerCtx.fillStyle = gradient;
                this.visualizerCtx.fillRect(x, this.visualizerCanvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };

        draw();
    }

    stopVisualizer() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear the canvas
        this.visualizerCtx.fillStyle = '#f8f9fa';
        this.visualizerCtx.fillRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);
    }

    handleTranscriptionResult(data) {
        if (data.isFinal) {
            // Final result - add to final transcript
            this.finalTranscript += data.transcript + ' ';
            this.interimTranscript = '';
        } else {
            // Interim result - update interim transcript
            this.interimTranscript = data.transcript;
        }
        
        this.displayLiveTranscription();
    }

    displayLiveTranscription() {
        let html = '';
        
        // Display final transcript
        if (this.finalTranscript.trim()) {
            html += `<div class="final-text">${this.finalTranscript.trim()}</div>`;
        }
        
        // Display interim transcript
        if (this.interimTranscript.trim()) {
            html += `<div class="interim-text">${this.interimTranscript.trim()}</div>`;
        }
        
        // Show placeholder if no content
        if (!html) {
            html = '<p class="placeholder">Start speaking to see live transcription...</p>';
        }
        
        this.transcriptionResult.innerHTML = html;
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Medical Report Functions
    async initializeReportDisplay() {
        try {
            const response = await fetch('/api/medical-report');
            const data = await response.json();
            
            if (data.success) {
                this.currentMedicalReport = data.report;
                this.displayMedicalReport(data.report);
            } else {
                this.displayEmptyReport();
            }
        } catch (error) {
            console.error('Error initializing report:', error);
            this.displayEmptyReport();
        }
    }

    updateMedicalReport(report) {
        this.currentMedicalReport = report;
        this.displayMedicalReport(report);
    }

    displayEmptyReport() {
        const html = `
            <div class="report-sections">
                <div class="report-section">
                    <h4><i class="fas fa-info-circle"></i> Report Status</h4>
                    <div class="report-field">
                        <span class="report-field-label">Status:</span>
                        <span class="report-field-value">Ready to capture medical information</span>
                    </div>
                    <div class="report-field">
                        <span class="report-field-label">Instructions:</span>
                        <span class="report-field-value">Start recording and speak naturally. The system will extract medical information automatically.</span>
                    </div>
                </div>
            </div>
        `;
        this.reportDisplay.innerHTML = html;
    }

    displayMedicalReport(report) {
        let html = '<div class="report-sections">';
        let hasContent = false;
        
        // Always show session info
        html += '<div class="report-section">';
        html += '<h4><i class="fas fa-info-circle"></i> Session Information</h4>';
        html += '<div class="report-field">';
        html += '<span class="report-field-label">Session ID:</span>';
        html += `<span class="report-field-value">${report.sessionId || 'N/A'}</span>`;
        html += '</div>';
        html += '<div class="report-field">';
        html += '<span class="report-field-label">Last Updated:</span>';
        html += `<span class="report-field-value">${new Date().toLocaleString()}</span>`;
        html += '</div>';
        html += '</div>';
        
        // Patient Information - show even if minimal
        if (report.patient) {
            const patientData = report.patient;
            const hasPatientInfo = patientData.symptoms.length > 0 || 
                                 patientData.currentMedications.length > 0 || 
                                 patientData.presentingComplaint || 
                                 Object.keys(patientData.demographics).length > 0 ||
                                 Object.keys(patientData.vitalSigns).length > 0;
            
            if (hasPatientInfo) {
                hasContent = true;
                html += '<div class="report-section">';
                html += '<h4><i class="fas fa-user"></i> Patient Information</h4>';
                
                if (patientData.demographics && Object.keys(patientData.demographics).length > 0) {
                    Object.entries(patientData.demographics).forEach(([key, value]) => {
                        if (value) {
                            html += '<div class="report-field">';
                            html += `<span class="report-field-label">${this.formatFieldName(key)}:</span>`;
                            html += `<span class="report-field-value">${value}</span>`;
                            html += '</div>';
                        }
                    });
                }
                
                if (patientData.vitalSigns && Object.keys(patientData.vitalSigns).length > 0) {
                    Object.entries(patientData.vitalSigns).forEach(([key, value]) => {
                        if (value) {
                            html += '<div class="report-field">';
                            html += `<span class="report-field-label">${this.formatFieldName(key)}:</span>`;
                            html += `<span class="report-field-value">${value}</span>`;
                            html += '</div>';
                        }
                    });
                }
                
                if (patientData.symptoms.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Symptoms:</span>';
                    html += `<span class="report-field-value">${patientData.symptoms.join(', ')}</span>`;
                    html += '</div>';
                }
                
                if (patientData.currentMedications.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Current Medications:</span>';
                    html += `<span class="report-field-value">${patientData.currentMedications.join(', ')}</span>`;
                    html += '</div>';
                }
                
                if (patientData.presentingComplaint) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Chief Complaint:</span>';
                    html += `<span class="report-field-value">${patientData.presentingComplaint}</span>`;
                    html += '</div>';
                }
                
                html += '</div>';
            }
        }
        
        // Clinical Information - show even if minimal
        if (report.clinical) {
            const clinicalData = report.clinical;
            const hasClinicalInfo = clinicalData.diagnosis.length > 0 || 
                                  clinicalData.treatment.length > 0 || 
                                  clinicalData.procedures.length > 0 ||
                                  clinicalData.investigations.length > 0 ||
                                  Object.keys(clinicalData.examination).length > 0;
            
            if (hasClinicalInfo) {
                hasContent = true;
                html += '<div class="report-section">';
                html += '<h4><i class="fas fa-stethoscope"></i> Clinical Information</h4>';
                
                if (clinicalData.examination && Object.keys(clinicalData.examination).length > 0) {
                    Object.entries(clinicalData.examination).forEach(([key, value]) => {
                        if (value) {
                            html += '<div class="report-field">';
                            html += `<span class="report-field-label">${this.formatFieldName(key)}:</span>`;
                            html += `<span class="report-field-value">${value}</span>`;
                            html += '</div>';
                        }
                    });
                }
                
                if (clinicalData.diagnosis.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Diagnosis:</span>';
                    html += `<span class="report-field-value">${clinicalData.diagnosis.join(', ')}</span>`;
                    html += '</div>';
                }
                
                if (clinicalData.treatment.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Treatment:</span>';
                    html += `<span class="report-field-value">${clinicalData.treatment.join(', ')}</span>`;
                    html += '</div>';
                }
                
                if (clinicalData.procedures.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Procedures:</span>';
                    html += `<span class="report-field-value">${clinicalData.procedures.join(', ')}</span>`;
                    html += '</div>';
                }
                
                if (clinicalData.investigations.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Investigations:</span>';
                    html += `<span class="report-field-value">${clinicalData.investigations.join(', ')}</span>`;
                    html += '</div>';
                }
                
                html += '</div>';
            }
        }
        
        // Discharge Information - show even if minimal
        if (report.discharge) {
            const dischargeData = report.discharge;
            const hasDischargeInfo = dischargeData.condition || 
                                   dischargeData.medications.length > 0 || 
                                   dischargeData.instructions.length > 0 ||
                                   dischargeData.followUp.length > 0;
            
            if (hasDischargeInfo) {
                hasContent = true;
                html += '<div class="report-section">';
                html += '<h4><i class="fas fa-sign-out-alt"></i> Discharge Information</h4>';
                
                if (dischargeData.condition) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Condition:</span>';
                    html += `<span class="report-field-value">${dischargeData.condition}</span>`;
                    html += '</div>';
                }
                
                if (dischargeData.medications.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Discharge Medications:</span>';
                    html += `<span class="report-field-value">${dischargeData.medications.join(', ')}</span>`;
                    html += '</div>';
                }
                
                if (dischargeData.instructions.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Instructions:</span>';
                    html += `<span class="report-field-value">${dischargeData.instructions.join(', ')}</span>`;
                    html += '</div>';
                }
                
                if (dischargeData.followUp.length > 0) {
                    html += '<div class="report-field">';
                    html += '<span class="report-field-label">Follow-up:</span>';
                    html += `<span class="report-field-value">${dischargeData.followUp.join(', ')}</span>`;
                    html += '</div>';
                }
                
                html += '</div>';
            }
        }
        
        // Conversation Summary
        if (report.conversation && (report.conversation.doctorNotes.length > 0 || report.conversation.patientStatements.length > 0)) {
            hasContent = true;
            html += '<div class="report-section">';
            html += '<h4><i class="fas fa-comments"></i> Conversation Summary</h4>';
            
            if (report.conversation.doctorNotes.length > 0) {
                html += '<div class="report-field">';
                html += '<span class="report-field-label">Doctor Notes:</span>';
                html += `<span class="report-field-value">${report.conversation.doctorNotes.length} entries</span>`;
                html += '</div>';
            }
            
            if (report.conversation.patientStatements.length > 0) {
                html += '<div class="report-field">';
                html += '<span class="report-field-label">Patient Statements:</span>';
                html += `<span class="report-field-value">${report.conversation.patientStatements.length} entries</span>`;
                html += '</div>';
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        
        if (!hasContent) {
            html = `
                <div class="report-sections">
                    <div class="report-section">
                        <h4><i class="fas fa-info-circle"></i> Report Status</h4>
                        <div class="report-field">
                            <span class="report-field-label">Status:</span>
                            <span class="report-field-value">Ready to capture medical information</span>
                        </div>
                        <div class="report-field">
                            <span class="report-field-label">Instructions:</span>
                            <span class="report-field-value">Start recording and speak naturally. Even minimal details will be captured and displayed.</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.reportDisplay.innerHTML = html;
    }

    formatFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ');
    }

    updateSimilarCases(similarCases) {
        if (!similarCases || similarCases.length === 0) {
            this.similarCasesDisplay.innerHTML = '<p class="placeholder">No similar cases found...</p>';
            return;
        }
        
        let html = '';
        similarCases.forEach((case_, index) => {
            html += '<div class="similar-case">';
            html += '<div class="similar-case-header">';
            html += `<span>Case #${index + 1}</span>`;
            html += `<span class="similarity-score">${Math.round(case_.score * 100)}% match</span>`;
            html += '</div>';
            
            html += '<div class="case-details">';
            
            // Patient demographics
            if (case_.case.demographics) {
                const demo = case_.case.demographics;
                if (demo.age) html += `<div><strong>Age:</strong> ${demo.age}</div>`;
                if (demo.sex) html += `<div><strong>Gender:</strong> ${demo.sex}</div>`;
            }
            
            // Symptoms and diagnosis
            if (case_.case.encounters && case_.case.encounters.length > 0) {
                const encounter = case_.case.encounters[0];
                if (encounter.chief_complaint) {
                    html += `<div><strong>Chief Complaint:</strong> ${encounter.chief_complaint}</div>`;
                }
                if (encounter.diagnoses && encounter.diagnoses.length > 0) {
                    html += `<div><strong>Diagnosis:</strong> ${encounter.diagnoses.join(', ')}</div>`;
                }
                if (encounter.symptoms && encounter.symptoms.length > 0) {
                    html += `<div><strong>Symptoms:</strong> ${encounter.symptoms.join(', ')}</div>`;
                }
            }
            
            html += '</div>';
            
            // Match reasons
            if (case_.reasons && case_.reasons.length > 0) {
                html += '<div class="match-reasons">';
                html += '<strong>Why this case matches:</strong><br>';
                html += case_.reasons.join('<br>');
                html += '</div>';
            }
            
            html += '</div>';
        });
        
        this.similarCasesDisplay.innerHTML = html;
    }

    async viewCurrentReport() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/medical-report');
            const data = await response.json();
            
            if (data.success) {
                this.currentMedicalReport = data.report;
                this.displayMedicalReport(data.report);
                this.showSuccess('Report updated successfully');
            } else {
                this.showError('Failed to load report');
            }
        } catch (error) {
            console.error('Error loading report:', error);
            this.showError('Failed to load report');
        } finally {
            this.showLoading(false);
        }
    }

    async generateFinalReport() {
        try {
            const response = await fetch('/api/final-report');
            const data = await response.json();
            
            if (data.success) {
                // Display final report in a modal or new window
                this.displayFinalReport(data.report);
                this.showSuccess('Final report generated successfully');
            } else {
                this.showError('Failed to generate final report');
            }
        } catch (error) {
            console.error('Error generating final report:', error);
            this.showError('Failed to generate final report');
        }
    }

    async previewPdfReport() {
        try {
            // Get the current transcription
            const transcription = this.finalTranscript || this.interimTranscript;
            
            if (!transcription || transcription.trim() === '') {
                this.showError('No transcription available to preview report');
                return;
            }

            // Show loading state
            this.previewReportBtn.disabled = true;
            this.previewReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Generating Preview...</span>';

            const response = await fetch('/api/preview-pdf-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcription: transcription,
                    speaker: 'Doctor/Patient'
                })
            });

            const data = await response.json();

            if (data.success) {
                // Display the exact PDF text in modal with discharge prompt
                this.displayReportPreviewWithDischargePrompt(data.report, data.method);
                this.showSuccess(`Report preview generated successfully (${data.method} method)`);
            } else {
                this.showError(`Failed to generate preview: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating report preview:', error);
            this.showError('Failed to generate report preview');
        } finally {
            // Reset button state
            this.previewReportBtn.disabled = false;
            this.previewReportBtn.innerHTML = '<i class="fas fa-eye"></i> <span>Preview Report</span>';
        }
    }

    displayReportPreview(reportText, method) {
        // Create a formatted preview of the report
        const lines = reportText.split('\n').filter(line => line.trim());
        
        let html = '<div class="report-preview">';
        html += '<div class="preview-header">';
        html += '<h2><i class="fas fa-file-medical"></i> Medical Report Preview</h2>';
        html += `<div class="preview-method">Generated using: <strong>${method}</strong></div>`;
        html += '</div>';
        
        html += '<div class="preview-content">';
        
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
                    html += `<div class="preview-section"><h3>Summary</h3><p>${summaryContent}</p></div>`;
                }
                currentSection = 'detailed';
                html += '<div class="preview-section"><h3>Detailed Information</h3>';
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
                        <div class="preview-field">
                            <div class="preview-label">${label.trim()}:</div>
                            <div class="preview-value">${value}</div>
                        </div>
                        `;
                    }
                }
            }
        }

        if (summaryContent) {
            html += `<div class="preview-section"><h3>Summary</h3><p>${summaryContent}</p></div>`;
        }

        html += '</div>';
        html += '</div>';
        html += '</div>';

        // Show in modal
        this.showModal('Medical Report Preview', html);
    }

    displayReportPreviewWithDischargePrompt(reportText, method) {
        // Display the exact PDF text in the modal
        this.reportPreviewContent.textContent = reportText;
        
        // Show the discharge prompt
        this.dischargePrompt.style.display = 'block';
        
        // Show the modal
        this.reportPreviewModal.style.display = 'block';
        
        // Store the report text for potential discharge summary generation
        this.currentReportText = reportText;
    }

    async generatePdfReport() {
        try {
            // Get the current transcription
            const transcription = this.finalTranscript || this.interimTranscript;
            
            if (!transcription || transcription.trim() === '') {
                this.showError('No transcription available to generate PDF report');
                return;
            }

            // Show loading state
            this.generatePdfBtn.disabled = true;
            this.generatePdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Generating PDF...</span>';

            // Include edited discharge summary if available
            const dischargeText = this.getFormattedDischargeText();
            
            const response = await fetch('/api/generate-pdf-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcription: transcription,
                    speaker: 'Doctor/Patient',
                    dischargeSummary: dischargeText
                })
            });

            if (response.ok) {
                // Create blob from response
                const blob = await response.blob();
                
                // Determine file extension based on content type
                const contentType = response.headers.get('content-type');
                const isPDF = contentType && contentType.includes('application/pdf');
                const extension = isPDF ? 'pdf' : 'txt';
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `medical_report_${new Date().toISOString().split('T')[0]}.${extension}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                const fileType = isPDF ? 'PDF' : 'text';
                this.showSuccess(`${fileType} report generated and downloaded successfully`);
            } else {
                const errorData = await response.json();
                this.showError(`Failed to generate PDF: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating PDF report:', error);
            this.showError('Failed to generate PDF report');
        } finally {
            // Reset button state
            this.generatePdfBtn.disabled = false;
            this.generatePdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> <span>Generate PDF</span>';
        }
    }

    displayFinalReport(report) {
        // Create a comprehensive final report display
        let html = '<div class="final-report">';
        html += '<h2>Final Medical Report</h2>';
        
        // Patient Information
        html += '<div class="report-section">';
        html += '<h3>Patient Information</h3>';
        html += `<div><strong>Patient ID:</strong> ${report.patient_id}</div>`;
        if (report.demographics.age) html += `<div><strong>Age:</strong> ${report.demographics.age}</div>`;
        if (report.demographics.sex) html += `<div><strong>Gender:</strong> ${report.demographics.sex}</div>`;
        html += '</div>';
        
        // Encounter Information
        if (report.encounters && report.encounters.length > 0) {
            const encounter = report.encounters[0];
            html += '<div class="report-section">';
            html += '<h3>Encounter Details</h3>';
            html += `<div><strong>Date:</strong> ${encounter.date}</div>`;
            html += `<div><strong>Chief Complaint:</strong> ${encounter.chief_complaint}</div>`;
            html += `<div><strong>Type:</strong> ${encounter.encounter_type}</div>`;
            
            if (encounter.diagnoses && encounter.diagnoses.length > 0) {
                html += `<div><strong>Diagnoses:</strong> ${encounter.diagnoses.join(', ')}</div>`;
            }
            
            if (encounter.symptoms && encounter.symptoms.length > 0) {
                html += `<div><strong>Symptoms:</strong> ${encounter.symptoms.join(', ')}</div>`;
            }
            
            html += '</div>';
        }
        
        // Quality Information
        html += '<div class="report-section">';
        html += '<h3>Report Quality</h3>';
        html += `<div><strong>Last Updated:</strong> ${new Date(report.last_updated).toLocaleString()}</div>`;
        html += `<div><strong>Session ID:</strong> ${report.session_id}</div>`;
        
        if (report.confidence_scores && Object.keys(report.confidence_scores).length > 0) {
            html += '<div><strong>Confidence Scores:</strong></div>';
            Object.entries(report.confidence_scores).forEach(([field, score]) => {
                html += `<div style="margin-left: 20px;">${field}: ${Math.round(score * 100)}%</div>`;
            });
        }
        
        html += '</div>';
        html += '</div>';
        
        // Show in a modal or new window
        this.showModal('Final Medical Report', html);
    }

    async resetReport() {
        try {
            const response = await fetch('/api/reset-report', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                this.reportDisplay.innerHTML = '<p class="placeholder">Medical report has been reset. Start a new conversation...</p>';
                this.similarCasesDisplay.innerHTML = '<p class="placeholder">Similar medical cases will appear here...</p>';
                this.showSuccess('Report reset successfully');
            } else {
                this.showError('Failed to reset report');
            }
        } catch (error) {
            console.error('Error resetting report:', error);
            this.showError('Failed to reset report');
        }
    }

    showModal(title, content) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">${title}</h2>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            ${content}
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    setupModalEventListeners() {
        // Close buttons
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close on overlay click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Discharge prompt buttons
        this.yesDischargeBtn.addEventListener('click', () => this.generateDischargeSummary());
        this.noDischargeBtn.addEventListener('click', () => {
            this.dischargePrompt.style.display = 'none';
        });

        // Download discharge button
        this.downloadDischargeBtn.addEventListener('click', () => this.downloadDischargeSummary());
        
        // Edit discharge buttons
        if (this.editDischargeBtn) {
            console.log('Setting up edit button listener');
            this.editDischargeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Edit button clicked');
                this.enterEditMode();
            });
        } else {
            console.error('Edit button not found!');
        }
        
        if (this.saveDischargeBtn) {
            console.log('Setting up save button listener');
            this.saveDischargeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Save button clicked');
                this.saveDischargeChanges();
            });
        } else {
            console.error('Save button not found!');
        }
        
        if (this.cancelEditBtn) {
            console.log('Setting up cancel button listener');
            this.cancelEditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Cancel button clicked');
                this.cancelEdit();
            });
        } else {
            console.error('Cancel button not found!');
        }
    }

    async generateDischargeSummary() {
        try {
            if (!this.currentReportText) {
                this.showError('No report text available for discharge summary');
                return;
            }

            // Show loading state
            this.yesDischargeBtn.disabled = true;
            this.yesDischargeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            const response = await fetch('/api/generate-discharge-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reportText: this.currentReportText
                })
            });

            const data = await response.json();

            if (data.success) {
                // Display discharge summary in modal
                this.displayDischargeSummary(data.dischargeSummary);
                this.showSuccess('Discharge summary generated successfully');
            } else {
                this.showError(`Failed to generate discharge summary: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating discharge summary:', error);
            this.showError('Failed to generate discharge summary');
        } finally {
            // Reset button state
            this.yesDischargeBtn.disabled = false;
            this.yesDischargeBtn.innerHTML = 'Yes, Generate Discharge Summary';
        }
    }

    displayDischargeSummary(dischargeText) {
        // Close the report preview modal
        this.reportPreviewModal.style.display = 'none';
        
        // Display discharge summary in discharge modal
        this.dischargeContent.innerHTML = dischargeText;
        this.dischargeModal.style.display = 'block';
        
        // Store discharge text for download and editing
        this.currentDischargeText = dischargeText;
        this.originalDischargeText = dischargeText; // Keep original for cancel functionality
        
        // Reset to preview mode
        this.exitEditMode();
    }

    enterEditMode() {
        try {
            console.log('Entering edit mode...');
            console.log('Current discharge text:', this.currentDischargeText);
            
            // Hide preview mode, show edit mode
            if (this.dischargeContent) {
                console.log('Hiding discharge content');
                this.dischargeContent.style.display = 'none';
            } else {
                console.error('dischargeContent not found!');
            }
            
            const editModeElement = document.querySelector('.discharge-edit-mode');
            if (editModeElement) {
                console.log('Showing edit mode element');
                editModeElement.style.display = 'block';
            } else {
                console.error('Edit mode element not found!');
            }
            
            // Populate textarea with current content (strip HTML tags for editing)
            if (this.dischargeEditTextarea && this.currentDischargeText) {
                const textContent = this.stripHtmlTags(this.currentDischargeText);
                console.log('Setting textarea content:', textContent);
                this.dischargeEditTextarea.value = textContent;
            } else {
                console.error('Textarea or current discharge text not available');
            }
            
            // Hide edit button, show save/cancel
            if (this.editDischargeBtn) {
                this.editDischargeBtn.style.display = 'none';
            }
            if (this.downloadDischargeBtn) {
                this.downloadDischargeBtn.style.display = 'none';
            }
            
            console.log('Edit mode entered successfully');
        } catch (error) {
            console.error('Error entering edit mode:', error);
            this.showError('Failed to enter edit mode');
        }
    }

    exitEditMode() {
        try {
            // Show preview mode, hide edit mode
            if (this.dischargeContent) {
                this.dischargeContent.style.display = 'block';
            }
            
            const editModeElement = document.querySelector('.discharge-edit-mode');
            if (editModeElement) {
                editModeElement.style.display = 'none';
            }
            
            // Show edit/download buttons
            if (this.editDischargeBtn) {
                this.editDischargeBtn.style.display = 'inline-block';
            }
            if (this.downloadDischargeBtn) {
                this.downloadDischargeBtn.style.display = 'inline-block';
            }
            
            console.log('Edit mode exited successfully');
        } catch (error) {
            console.error('Error exiting edit mode:', error);
        }
    }

    saveDischargeChanges() {
        // Get edited content from textarea
        const editedContent = this.dischargeEditTextarea.value;
        
        // Update the current discharge text
        this.currentDischargeText = editedContent;
        
        // Convert plain text back to HTML format for preview
        const formattedContent = this.formatTextToHtml(editedContent);
        
        // Update the preview display with formatted content
        this.dischargeContent.innerHTML = formattedContent;
        
        // Exit edit mode
        this.exitEditMode();
        
        // Show success message
        this.showSuccess('Discharge summary updated successfully');
    }

    cancelEdit() {
        // Restore original content
        this.currentDischargeText = this.originalDischargeText;
        this.dischargeContent.innerHTML = this.originalDischargeText;
        
        // Exit edit mode
        this.exitEditMode();
        
        // Show message
        this.showSuccess('Changes cancelled');
    }

    stripHtmlTags(html) {
        // Convert HTML to structured plain text for editing
        let text = html;
        
        // Replace HTML structure with plain text equivalents
        text = text.replace(/<div class="discharge-summary">/g, '');
        text = text.replace(/<\/div>/g, '\n');
        text = text.replace(/<h4>/g, '\n');
        text = text.replace(/<\/h4>/g, '\n');
        text = text.replace(/<div class="section-content">/g, '');
        text = text.replace(/<p>/g, '');
        text = text.replace(/<\/p>/g, '\n');
        text = text.replace(/<strong>/g, '');
        text = text.replace(/<\/strong>/g, '');
        text = text.replace(/<ul>/g, '');
        text = text.replace(/<\/ul>/g, '\n');
        text = text.replace(/<li>/g, '• ');
        text = text.replace(/<\/li>/g, '\n');
        text = text.replace(/<br>/g, '\n');
        text = text.replace(/<br\/>/g, '\n');
        
        // Clean up extra whitespace and newlines
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
        text = text.replace(/^\s+|\s+$/g, '');
        
        return text;
    }

    formatTextToHtml(text) {
        // Convert plain text back to HTML format for display
        let html = '<div class="discharge-summary">';
        
        // Split by lines and process
        const lines = text.split('\n');
        let currentSection = '';
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) {
                // Close any open list
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                continue;
            }
            
            // Check for section headers
            if (line.includes('Your Condition') || line.includes('🏥')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (currentSection) {
                    html += '</div>';
                }
                html += '<h4>🏥 Your Condition</h4>';
                html += '<div class="section-content">';
                currentSection = 'condition';
            } else if (line.includes('Your Medications') || line.includes('💊')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (currentSection) {
                    html += '</div>';
                }
                html += '<h4>💊 Your Medications</h4>';
                html += '<div class="section-content">';
                currentSection = 'medications';
            } else if (line.includes('Lifestyle Changes') || line.includes('🏃')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (currentSection) {
                    html += '</div>';
                }
                html += '<h4>🏃 Lifestyle Changes</h4>';
                html += '<div class="section-content">';
                currentSection = 'lifestyle';
            } else if (line.includes('Follow-up Instructions') || line.includes('📅')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (currentSection) {
                    html += '</div>';
                }
                html += '<h4>📅 Follow-up Instructions</h4>';
                html += '<div class="section-content">';
                currentSection = 'followup';
            } else if (line.includes('Emergency Care') || line.includes('🚨')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (currentSection) {
                    html += '</div>';
                }
                html += '<h4>🚨 When to Seek Emergency Care</h4>';
                html += '<div class="section-content">';
                currentSection = 'emergency';
            } else {
                // Regular content line
                if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
                    // List item
                    if (!inList) {
                        html += '<ul>';
                        inList = true;
                    }
                    const bulletText = line.replace(/^[-*•]\s*/, '');
                    html += `<li>${bulletText}</li>`;
                } else if (line.includes(':')) {
                    // Key-value pair
                    if (inList) {
                        html += '</ul>';
                        inList = false;
                    }
                    const [key, value] = line.split(':', 2);
                    html += `<p><strong>${key.trim()}:</strong> ${value.trim()}</p>`;
                } else {
                    // Regular paragraph
                    if (inList) {
                        html += '</ul>';
                        inList = false;
                    }
                    html += `<p>${line}</p>`;
                }
            }
        }
        
        // Close any open list
        if (inList) {
            html += '</ul>';
        }
        
        // Close any open section
        if (currentSection) {
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    async downloadDischargeSummary() {
        try {
            if (!this.currentDischargeText) {
                this.showError('No discharge summary available to download');
                return;
            }

            // Show loading state
            this.downloadDischargeBtn.disabled = true;
            this.downloadDischargeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';

            const response = await fetch('/api/download-discharge-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dischargeText: this.currentDischargeText
                })
            });

            if (response.ok) {
                // Create blob from response
                const blob = await response.blob();
                
                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `discharge_summary_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showSuccess('Discharge summary downloaded successfully');
            } else {
                this.showError('Failed to download discharge summary');
            }
        } catch (error) {
            console.error('Error downloading discharge summary:', error);
            this.showError('Failed to download discharge summary');
        } finally {
            // Reset button state
            this.downloadDischargeBtn.disabled = false;
            this.downloadDischargeBtn.innerHTML = '<i class="fas fa-download"></i> Download Discharge Summary';
        }
    }

    // Method to get the current edited discharge text for final report generation
    getCurrentDischargeText() {
        return this.currentDischargeText || '';
    }

    // Method to get formatted discharge text for PDF generation
    getFormattedDischargeText() {
        if (!this.currentDischargeText) return '';
        
        // Convert plain text to HTML format for PDF
        return this.formatTextToHtml(this.currentDischargeText);
    }

    downloadAudio() {
        if (this.audioBlob) {
            const url = URL.createObjectURL(this.audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.add('active');
        } else {
            this.loadingIndicator.classList.remove('active');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00b894' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Text Input Methods
    async processTextInput() {
        const text = this.textInput.value.trim();
        const speaker = this.speakerSelect.value;
        
        if (!text) {
            this.showNotification('Please enter some text to process', 'warning');
            return;
        }
        
        try {
            // Disable button and show loading
            this.processTextBtn.disabled = true;
            this.processTextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
            
            // Send text to server for processing
            const response = await fetch('/api/process-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    speaker: speaker
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Update transcription display
                this.updateTranscriptionDisplay(text, speaker);
                
                // Update medical report
                if (data.medicalReport) {
                    this.updateMedicalReport(data.medicalReport);
                }
                
                // Update similar cases
                if (data.similarCases) {
                    this.updateSimilarCases(data.similarCases);
                }
                
                this.showNotification('Text processed successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to process text');
            }
            
        } catch (error) {
            console.error('Error processing text:', error);
            this.showNotification('Error processing text: ' + error.message, 'error');
        } finally {
            // Re-enable button
            this.processTextBtn.disabled = false;
            this.processTextBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Process Text</span>';
        }
    }
    
    clearTextInput() {
        this.textInput.value = '';
        this.speakerSelect.value = 'Patient';
        this.textInput.focus();
    }
    
    updateTranscriptionDisplay(text, speaker) {
        const timestamp = new Date().toLocaleTimeString();
        const speakerClass = speaker.toLowerCase().replace(' ', '-');
        
        const transcriptionHTML = `
            <div class="transcription-item ${speakerClass}">
                <div class="transcription-header">
                    <span class="speaker">${speaker}</span>
                    <span class="timestamp">${timestamp}</span>
                </div>
                <div class="transcription-text">${text}</div>
            </div>
        `;
        
        // Add to transcription result
        if (this.transcriptionResult.querySelector('.placeholder')) {
            this.transcriptionResult.innerHTML = transcriptionHTML;
        } else {
            this.transcriptionResult.insertAdjacentHTML('beforeend', transcriptionHTML);
        }
        
        // Scroll to bottom
        this.transcriptionResult.scrollTop = this.transcriptionResult.scrollHeight;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioTranscriptionApp();
});
