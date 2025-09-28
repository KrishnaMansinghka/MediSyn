#!/bin/bash
# MediSyn Quick Start Script

echo "🏥 MediSyn Quick Start"
echo "====================="

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Please run this script from the MediSyn project root directory"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv .venv
    
    echo "📦 Activating virtual environment..."
    source .venv/bin/activate
    
    echo "📦 Installing Python dependencies..."
    pip install --upgrade pip
    pip install fastapi uvicorn psycopg2-binary PyJWT python-dotenv pydantic email-validator requests
else
    echo "✅ Virtual environment found"
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "✅ Frontend dependencies found"
fi

echo ""
echo "🚀 Starting MediSyn application..."
echo "   This will start both backend and frontend services"
echo ""

# Run the main application
python3 main.py