# MediSyn Medical Assistant Chatbot

This is an AI-powered medical assistant chatbot that conducts symptom interviews and generates comprehensive medical reports.

## Features

- 🤖 **AI-Powered**: Uses Google's Gemini 2.5 Flash model
- 📋 **Structured Interview**: Follows medical interview protocols
- 📄 **Dual Output**: Generates both TXT and PDF reports
- 🏥 **Professional Format**: Medical-grade report formatting
- 💾 **Auto-Save**: Reports saved with timestamps

## Files

- `chatbot.py` - Main chatbot logic and API integration
- `run_chatbot.py` - Simple script to run the chatbot
- `requirements.txt` - Python dependencies
- `README.md` - This documentation

## Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Verify API Key**: Make sure the Gemini API key is set in `chatbot.py`

## Usage

### Option 1: Run with the helper script
```bash
python run_chatbot.py
```

### Option 2: Run directly
```bash
python chatbot.py
```

## Sample Conversation Flow

```
Assistant: Hello. What's been going on with you?
You: I have a headache
Assistant: When did this headache start?
You: This morning
Assistant: How severe is it on a scale of 1-10?
...
```

## Report Generation

The chatbot will automatically generate reports when the interview is complete:

- **Text Report**: `medical_report_YYYYMMDD_HHMMSS.txt`
- **PDF Report**: `medical_report_YYYYMMDD_HHMMSS.pdf`

Both files are saved in the `backend/Chatbot/` directory.

## Report Structure

### Text Report
```
=================================================
MEDICAL ASSISTANT REPORT - 2025-09-27 15:30:45
=================================================

--- SUMMARY OF FINDINGS ---
Patient presents with acute headache symptoms...

--- DETAILED SYMPTOM DATA ---
Primary Symptoms        : Headache, mild nausea
Onset                   : This morning around 8 AM
Duration                : Approximately 7 hours
Severity (1-10)         : 6/10
...
```

### PDF Report
- Professional medical report layout
- Structured table format
- MediSyn branding
- Timestamp and metadata

## Interview Coverage

The chatbot ensures comprehensive data collection:

1. ✅ Main symptoms
2. ✅ Onset timing
3. ✅ Duration
4. ✅ Severity (1-10 scale)
5. ✅ Frequency
6. ✅ Character description
7. ✅ Location
8. ✅ Triggers/Relief factors
9. ✅ Associated symptoms
10. ✅ Medical history
11. ✅ Family history
12. ✅ Lifestyle/Context

## API Configuration

The chatbot uses Google's Gemini API. Make sure your API key is valid:

```python
API_KEY = "your_actual_api_key_here"
```

## Error Handling

- ✅ API rate limiting with retry logic
- ✅ Network error handling
- ✅ JSON parsing error recovery
- ✅ Graceful session termination

## Commands

During the conversation:
- Type `exit` or `quit` to end the session
- Press `Ctrl+C` to interrupt

## Troubleshooting

### Common Issues

1. **API Errors**: Check your internet connection and API key
2. **PDF Generation Fails**: Install reportlab: `pip install reportlab`
3. **Import Errors**: Run `pip install -r requirements.txt`

### Debug Mode

If issues persist, check the console output for detailed error messages.

## Security Notes

⚠️ **Important**: 
- Never commit API keys to version control
- Use environment variables in production
- Ensure HIPAA compliance for real medical data

## Version Info

- **Model**: Gemini 2.5 Flash Preview
- **Python**: 3.10+
- **Dependencies**: requests, reportlab