# Start Backend Script
# Make sure Python is installed and PostgreSQL is running

Write-Host "=== Starting AI Task Manager Backend ===" -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "backend"

# Check if virtual environment exists
if (!(Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".venv\Scripts\Activate.ps1"

# Install/update dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check environment file
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found! Copying from .env.example" -ForegroundColor Red
    Copy-Item ".env.example" ".env"
    Write-Host "Please update GEMINI_API_KEY in .env file" -ForegroundColor Yellow
    exit 1
}

# Start the backend using the configured startup command
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "🚀 Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

# Use the exact startup command from project memory
uvicorn app.main:app --reload --host localhost --port 8000