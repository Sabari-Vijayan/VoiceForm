#!/bin/bash

# Navigate to the server directory if not already there
cd "$(dirname "$0")"

# Activate the virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment 'venv' not found. Please create it first."
    exit 1
fi

# Load environment variables if .env exists (optional, uvicorn/fastapi also handle this)
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Run the FastAPI server
echo "Starting VoiceForm API on http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
