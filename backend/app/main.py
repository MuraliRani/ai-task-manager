from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.db.session import create_tables
from app.utils.config import settings

# Create FastAPI app
app = FastAPI(
    title="AI Task Management API",
    description="An AI-driven task management application with chat interface",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1", tags=["tasks"])

@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    create_tables()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Task Management API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )