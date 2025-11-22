from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from routers import health_router, auth_router, onboarding_router, posts_router

# Initialize FastAPI app
app = FastAPI(
    title="Sparkle API",
    description="AI personal-branding copilot for LinkedIn",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint - API information"""
    return {
        "message": "Sparkle API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


# Health check router (no prefix, at root level)
app.include_router(health_router)

# API v1 routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(onboarding_router, prefix="/api/v1")
app.include_router(posts_router, prefix="/api/v1")


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("🚀 Sparkle API starting up...")
    print(f"📍 Environment: {settings.ENVIRONMENT}")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    print(f"🌐 CORS origins: {settings.cors_origins}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print("👋 Sparkle API shutting down...")