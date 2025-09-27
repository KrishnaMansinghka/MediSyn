# Audio Transcription App

A modern web application that records audio from users and transcribes it using Google Cloud Speech-to-Text API.

## Features

- 🎤 **Audio Recording**: High-quality audio recording with real-time visualization
- 📁 **File Management**: Save and download recorded audio files
- 🤖 **AI Transcription**: Powered by Google Cloud Speech-to-Text API
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
- ⚡ **Real-time Feedback**: Live audio visualization and recording status

## Prerequisites

- Node.js (version 14 or higher)
- Google Cloud Platform account
- Google Cloud Speech-to-Text API enabled

## Setup Instructions

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Google Cloud Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Speech-to-Text API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Speech-to-Text API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and description
   - Grant "Cloud Speech Client" role
   - Create and download the JSON key file

4. **Set Up Authentication**
   
   **Option A: Environment Variable (Recommended)**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
   ```
   
   **Option B: Place key file in project**
   - Place the downloaded JSON key file in the project directory
   - The app will automatically detect it

### 3. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. **Start Recording**: Click the "Start Recording" button and allow microphone access
2. **Stop Recording**: Click "Stop Recording" when finished
3. **Play Back**: Use "Play Recording" to listen to your audio
4. **Transcribe**: Click "Transcribe Audio" to convert speech to text
5. **Download**: Save your audio file using the download button

## API Endpoints

- `POST /api/transcribe` - Transcribe audio using Google Cloud Speech-to-Text
- `GET /api/health` - Health check endpoint
- `GET /` - Serve the main application

## Configuration

The app supports various configuration options for the Speech-to-Text API:

- **Encoding**: WEBM_OPUS (default)
- **Sample Rate**: 44100 Hz (default)
- **Language**: en-US (default)
- **Model**: latest_long (default)
- **Enhanced Model**: Enabled by default

## Browser Compatibility

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

## Security Notes

- The application requires HTTPS in production for microphone access
- API keys should never be exposed in client-side code
- Consider implementing rate limiting for production use

## Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Ensure the site has microphone permissions
   - Check browser settings for microphone access

2. **Google Cloud API Errors**
   - Verify your service account has the correct permissions
   - Check that the Speech-to-Text API is enabled
   - Ensure your API key is valid and not expired

3. **Audio Recording Issues**
   - Try using a different browser
   - Check if other applications are using the microphone
   - Ensure your microphone is working properly

### Error Messages

- "Failed to start recording" - Check microphone permissions
- "Transcription failed" - Verify Google Cloud API setup
- "No speech detected" - The audio may be too quiet or contain no speech

## Development

### Project Structure

```
app/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Backend Express server
├── package.json        # Node.js dependencies
└── README.md          # This file
```

### Adding Features

To extend the application:

1. **Frontend**: Modify `script.js` and `styles.css`
2. **Backend**: Update `server.js` for new API endpoints
3. **Dependencies**: Add new packages to `package.json`

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review Google Cloud Speech-to-Text documentation
- Open an issue on the project repository
