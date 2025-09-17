#!/usr/bin/env python3
"""
Startup script for the AI Task Management backend server.
This script properly sets up the Python path and starts the FastAPI server.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Now we can import and run the app
if __name__ == "__main__":
    import uvicorn
    from app.main import app
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )