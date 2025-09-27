#!/bin/bash

# Audio Transcription App Startup Script

echo "🎤 Audio Transcription App"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check for Google Cloud credentials
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ] && [ ! -f "service-account-key.json" ]; then
    echo "⚠️  Google Cloud credentials not found"
    echo "   Please either:"
    echo "   1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable"
    echo "   2. Place service-account-key.json in the app directory"
    echo ""
    echo "   The app will run in demo mode without actual transcription."
    echo ""
fi

# Start the server
echo "🚀 Starting server..."
echo "   Open http://localhost:3000 in your browser"
echo "   Press Ctrl+C to stop the server"
echo ""

npm start
