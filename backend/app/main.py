from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.config import settings
from app.routers import history, indicators

app = FastAPI(
    title="Threat Intelligence Aggregator API",
    description="Cybersecurity platform investigating suspicious IPs, domains, URLs, and file hashes.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(indicators.router)
app.include_router(history.router)


@app.get("/", include_in_schema=False)
async def root_redirect():
    """Redirect root to Swagger documentation."""
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["System"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "Threat Intelligence Aggregator API",
        "version": "1.0.0"
    }