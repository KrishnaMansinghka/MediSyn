require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');
const { Server } = require('socket.io');
const http = require('http');
const MedicalReportSystem = require('./medical-report-system');
const PDFReportService = require('./pdf-report-service');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Configure multer for file uploads
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Google Cloud Speech client
// Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or use a service account key file
const speechClient = new SpeechClient();

// Store active streaming connections
const activeStreams = new Map();

// Initialize medical report system
const medicalReportSystem = new MedicalReportSystem();
medicalReportSystem.loadPatientRecords();

// Initialize PDF report service
const pdfReportService = new PDFReportService();
pdfReportService.initialize().then(success => {
    if (success) {
        console.log('PDF Report Service initialized successfully');
    } else {
        console.log('PDF Report Service initialization failed');
    }
});

// API endpoint for transcription
app.post('/api/transcribe', async (req, res) => {
    try {
        const { audio, config } = req.body;
        
        if (!audio) {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audio, 'base64');
        
        // Configure the request
        const request = {
            audio: {
                content: audioBuffer,
            },
            config: {
                encoding: config.encoding || 'WEBM_OPUS',
                sampleRateHertz: config.sampleRateHertz || 48000,
                languageCode: config.languageCode || 'en-US',
                enableAutomaticPunctuation: config.enableAutomaticPunctuation || true,
                model: config.model || 'latest_long',
                useEnhanced: true,
            },
        };

        // Perform the transcription
        const [response] = await speechClient.recognize(request);
        
        if (response.results && response.results.length > 0) {
            const transcript = response.results
                .map(result => result.alternatives[0].transcript)
                .join(' ');
            
            res.json({ 
                success: true, 
                transcript: transcript,
                confidence: response.results[0].alternatives[0].confidence || 0
            });
        } else {
            res.json({ 
                success: true, 
                transcript: 'No speech detected in the audio.',
                confidence: 0
            });
        }

    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ 
            error: 'Transcription failed', 
            details: error.message 
        });
    }
});

// WebSocket connection handling for live transcription
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Start streaming transcription
    socket.on('start-streaming', (config) => {
        console.log('Starting streaming for:', socket.id);
        
        const request = {
            config: {
                encoding: config.encoding || 'WEBM_OPUS',
                sampleRateHertz: config.sampleRateHertz || 48000,
                languageCode: config.languageCode || 'en-US',
                enableAutomaticPunctuation: config.enableAutomaticPunctuation || true,
                model: config.model || 'latest_long',
                useEnhanced: true,
                interimResults: true, // Enable interim results for live transcription
            },
            interimResults: true,
        };

        const recognizeStream = speechClient
            .streamingRecognize(request)
            .on('error', (error) => {
                console.error('Streaming error:', error);
                socket.emit('transcription-error', { error: error.message });
            })
            .on('data', (data) => {
                if (data.results && data.results.length > 0) {
                    const result = data.results[0];
                    const transcript = result.alternatives[0].transcript;
                    const confidence = result.alternatives[0].confidence || 0;
                    const isFinal = result.isFinal;
                    
                    // Extract speaker information
                    let speaker = 'Unknown';
                    if (result.words && result.words.length > 0) {
                        const speakerTag = result.words[0].speakerTag;
                        speaker = `Speaker ${speakerTag}`;
                    }

                    // Update medical report system
                    const updatedReport = medicalReportSystem.updateReport(transcript, speaker, new Date().toISOString());
                    
                    // Find similar cases
                    const analysis = medicalReportSystem.analyzeTranscription(transcript);
                    const similarCases = medicalReportSystem.findSimilarCases(analysis, 3);

                    socket.emit('transcription-result', {
                        transcript,
                        confidence,
                        isFinal,
                        speaker,
                        timestamp: new Date().toISOString(),
                        medicalReport: updatedReport,
                        similarCases: similarCases
                    });
                }
            });

        // Store the stream for this socket
        activeStreams.set(socket.id, recognizeStream);
    });

    // Handle incoming audio data
    socket.on('audio-data', (audioChunk) => {
        const stream = activeStreams.get(socket.id);
        if (stream) {
            stream.write(audioChunk);
        }
    });

    // Stop streaming
    socket.on('stop-streaming', () => {
        console.log('Stopping streaming for:', socket.id);
        const stream = activeStreams.get(socket.id);
        if (stream) {
            stream.end();
            activeStreams.delete(socket.id);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const stream = activeStreams.get(socket.id);
        if (stream) {
            stream.end();
            activeStreams.delete(socket.id);
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Medical report endpoints
app.get('/api/medical-report', (req, res) => {
    try {
        const currentReport = medicalReportSystem.getCurrentReport();
        const confidenceScores = medicalReportSystem.getConfidenceScores();
        
        res.json({
            success: true,
            report: currentReport,
            confidenceScores: confidenceScores
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/final-report', (req, res) => {
    try {
        const finalReport = medicalReportSystem.generateFinalReport();
        
        res.json({
            success: true,
            report: finalReport
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/reset-report', (req, res) => {
    try {
        medicalReportSystem.resetReport();
        
        res.json({
            success: true,
            message: 'Report reset successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// PDF report generation endpoints
app.post('/api/generate-pdf-report', async (req, res) => {
    try {
        const { transcription, speaker, dischargeSummary } = req.body;
        
        // If no transcription provided, use current medical report data
        if (!transcription) {
            const currentReport = medicalReportSystem.getCurrentReport();
            
            // Check if we have any data in the report
            const hasData = currentReport.patient.presentingComplaint || 
                           currentReport.patient.symptoms.length > 0 ||
                           currentReport.patient.familyHistory.hereditaryDiseases.length > 0 ||
                           currentReport.patient.socialHistory.exercise.frequency !== 'unknown';
            
            if (!hasData) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'No transcription provided and no medical report data available' 
                });
            }
            
            // Generate report from current medical report data
            const result = await pdfReportService.generateReportFromMedicalData(currentReport);
            
            if (result.success) {
                // Determine content type based on method
                if (result.method === 'puppeteer') {
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="medical_report_${Date.now()}.pdf"`);
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.setHeader('Content-Disposition', `attachment; filename="medical_report_${Date.now()}.txt"`);
                }
                res.send(result.pdfBuffer);
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
            return;
        }

            const result = await pdfReportService.processTranscriptionAndGeneratePDF(
                transcription,
                speaker || 'Unknown',
                dischargeSummary
            );

        if (result.success) {
            // Determine content type based on method
            if (result.method === 'puppeteer') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="medical_report_${Date.now()}.pdf"`);
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="medical_report_${Date.now()}.txt"`);
            }
            res.send(result.pdfBuffer);
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/update-pdf-report', async (req, res) => {
    try {
        const { transcription, speaker } = req.body;
        
        if (!transcription) {
            return res.status(400).json({ 
                success: false, 
                error: 'No transcription provided' 
            });
        }

        const result = await pdfReportService.updateReportWithTranscription(
            transcription, 
            speaker || 'Unknown'
        );

        res.json(result);

    } catch (error) {
        console.error('PDF update error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API endpoint for text input processing
app.post('/api/process-text', async (req, res) => {
    try {
        const { text, speaker } = req.body;
        
        if (!text) {
            return res.status(400).json({ 
                success: false, 
                error: 'No text provided' 
            });
        }

        // Update medical report system with the text input
        const updatedReport = medicalReportSystem.updateReport(text, speaker || 'Unknown', new Date().toISOString());
        
        // Analyze the text for similar cases
        const analysis = medicalReportSystem.analyzeTranscription(text);
        const similarCases = medicalReportSystem.findSimilarCases(analysis, 3);

        res.json({
            success: true,
            medicalReport: updatedReport,
            similarCases: similarCases,
            analysis: analysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing text:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process text: ' + error.message
        });
    }
});

app.post('/api/preview-pdf-report', async (req, res) => {
    try {
        const { transcription, speaker } = req.body;
        
        // If no transcription provided, use current medical report data
        if (!transcription) {
            const currentReport = medicalReportSystem.getCurrentReport();
            
            // Check if we have any data in the report
            const hasData = currentReport.patient.presentingComplaint || 
                           currentReport.patient.symptoms.length > 0 ||
                           currentReport.patient.familyHistory.hereditaryDiseases.length > 0 ||
                           currentReport.patient.socialHistory.exercise.frequency !== 'unknown';
            
            if (!hasData) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'No transcription provided and no medical report data available' 
                });
            }
            
            // Generate preview from current medical report data
            const reportText = pdfReportService.createStructuredReportFromMedicalData(currentReport);
            
            res.json({
                success: true,
                report: reportText,
                method: 'medical_data',
                timestamp: new Date().toISOString()
            });
            return;
        }

        const result = await pdfReportService.updateReportWithTranscription(
            transcription, 
            speaker || 'Unknown'
        );

        if (result.success) {
            res.json({
                success: true,
                report: result.updatedReport,
                method: result.method,
                timestamp: result.timestamp
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('PDF preview error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Serve generated PDF files
app.get('/api/pdf/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../generated_reports', filename);
        
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.sendFile(filePath);
        } else {
            res.status(404).json({ error: 'PDF file not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Generate discharge summary endpoint
app.post('/api/generate-discharge-summary', async (req, res) => {
    try {
        const { reportText } = req.body;

        if (!reportText) {
            return res.status(400).json({
                success: false,
                error: 'No report text provided'
            });
        }

        const dischargeSummary = await pdfReportService.generateDischargeSummary(reportText);

        res.json({
            success: true,
            dischargeSummary: dischargeSummary,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Discharge summary generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download discharge summary endpoint
app.post('/api/download-discharge-summary', async (req, res) => {
    try {
        const { dischargeText } = req.body;

        if (!dischargeText) {
            return res.status(400).json({
                success: false,
                error: 'No discharge text provided'
            });
        }

        // Set headers for text file download
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="discharge_summary_${Date.now()}.txt"`);
        
        res.send(dischargeText);
    } catch (error) {
        console.error('Discharge summary download error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Audio Transcription Server running on port ${port}`);
    console.log(`Open http://localhost:${port} to use the application`);
    console.log('\nTo use Google Cloud Speech-to-Text API:');
    console.log('1. Set up a Google Cloud project');
    console.log('2. Enable the Speech-to-Text API');
    console.log('3. Create a service account and download the key file');
    console.log('4. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    console.log('5. Or place the key file in the project directory');
    console.log('\nLive transcription is now enabled via WebSocket!');
});

module.exports = app;
