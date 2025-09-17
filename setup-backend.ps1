# Backend Setup Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "=== AI Task Manager Backend Setup ===" -ForegroundColor Green

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Write-Host "✗ Python not found. Please install Python 3.11+ from:" -ForegroundColor Red
    Write-Host "  https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Read-Host "Press Enter after installing Python to continue"
    exit 1
}

# Navigate to backend directory
Set-Location -Path "backend"

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
python -m venv .venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    
    Write-Host "⚠️  IMPORTANT: Please update the .env file with your settings:" -ForegroundColor Red
    Write-Host "  1. Get Gemini API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
    Write-Host "  2. Update GEMINI_API_KEY in .env file" -ForegroundColor Yellow
    Write-Host "  3. Ensure PostgreSQL is running (see instructions below)" -ForegroundColor Yellow
}

# Check PostgreSQL connection
Write-Host "Checking database connection..." -ForegroundColor Yellow
Write-Host "To start PostgreSQL with Docker, run:" -ForegroundColor Yellow
Write-Host "  docker run --name taskdb -e POSTGRES_PASSWORD=password -e POSTGRES_DB=taskdb -p 5432:5432 -d postgres:15" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "To start the backend server, run:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor Cyan
Write-Host "  .venv\Scripts\Activate.ps1" -ForegroundColor Cyan
Write-Host "  uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host ""
Write-Host "The API will be available at:" -ForegroundColor Yellow
Write-Host "  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  http://localhost:8000/docs (API documentation)" -ForegroundColor Cyan