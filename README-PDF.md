# Medical Assistant PDF Report Generation

This feature integrates Google Gemini AI to generate professional PDF medical reports based on audio transcriptions.

## Features

- **AI-Powered Report Updates**: Uses Gemini AI to intelligently update medical reports based on conversation transcriptions
- **Professional PDF Generation**: Creates formatted PDF reports with medical styling
- **Real-time Integration**: Works seamlessly with live transcription
- **Initial Report Template**: Uses the existing `medical_assistant_report.pdf` as a base template

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gemini API Key
```bash
npm run setup
```
This will prompt you for your Gemini API key and create a `.env` file.

**Manual Setup**: Create a `.env` file with:
```
GEMINI_API_KEY=your-gemini-api-key-here
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-cloud-credentials.json
PORT=3000
```

### 3. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 4. Start the Server
```bash
npm start
```

## How It Works

1. **Initial Report Loading**: The system loads the existing `medical_assistant_report.pdf` as a template
2. **Transcription Processing**: When audio is transcribed, the text is sent to Gemini AI
3. **AI Analysis**: Gemini analyzes the transcription and updates the medical report
4. **PDF Generation**: The updated report is converted to a professional PDF format
5. **Download**: Users can download the generated PDF report

## API Endpoints

- `POST /api/generate-pdf-report` - Generate PDF from transcription
- `POST /api/update-pdf-report` - Update report with transcription (text only)
- `GET /api/pdf/:filename` - Serve generated PDF files

## Usage

1. Start live transcription
2. Speak medical information
3. Click "Generate PDF" button
4. Download the AI-generated medical report

## File Structure

```
app/
├── pdf-report-service.js    # PDF generation service
├── medical_assistant_report.pdf  # Initial template
├── generated_reports/       # Generated PDF files
└── .env                     # Environment variables
```

## Troubleshooting

### Common Issues

1. **"Gemini API key not found"**
   - Run `npm run setup` to configure the API key
   - Check that `.env` file exists and contains `GEMINI_API_KEY`

2. **"PDF generation failed"**
   - Ensure Puppeteer dependencies are installed
   - Check server logs for detailed error messages

3. **"Initial report not loaded"**
   - Verify `medical_assistant_report.pdf` exists in the project root
   - Check file permissions

### Dependencies

- `@google/generative-ai` - Gemini AI integration
- `pdf-parse` - PDF text extraction
- `puppeteer` - PDF generation
- `dotenv` - Environment variable management

## Security Notes

- Keep your Gemini API key secure
- Don't commit `.env` files to version control
- Consider rate limiting for production use
- Validate all user inputs before sending to AI

## Support

For issues or questions:
1. Check the server console logs
2. Verify all dependencies are installed
3. Ensure API keys are correctly configured
4. Test with simple transcriptions first
