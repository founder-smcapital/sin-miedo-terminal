"""
Sin Miedo Capital - Institutional Market Data FastAPI Application
Entrypoint for OpenBB v5+, SEC EDGAR, FRED, CFTC, and FINRA terminal backend services.
"""
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.exceptions import InstitutionalDataError
from backend.core.openbb_client import get_openbb
from backend.core.cache import market_data_cache
from backend.api.v1.router import api_v1_router

# Setup institutional logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("sinmiedo.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes quant infrastructure and verifies provider connectivity on startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    
    # Warm up or probe OpenBB SDK in background
    try:
        obb = get_openbb()
        if obb:
            logger.info("OpenBB Platform SDK active and ready for quantitative routing.")
        else:
            logger.info("Operating in Resilient Native Mode with direct regulatory fallbacks (FRED/SEC/CFTC/FINRA).")
    except Exception as e:
        logger.warning(f"Provider probe warning: {e}")

    yield

    # Clean shutdown
    logger.info("Shutting down Sin Miedo Capital Market Data API. Clearing memory caches.")
    await market_data_cache.clear()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=(
        "Institutional-grade market data backend delivering production JSON payloads "
        "powered by OpenBB Platform SDK v5+, SEC EDGAR API, FRED, CFTC, and FINRA datasets."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration for Terminal Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "Content-Length"]
)

# Global Institutional Exception Handler
@app.exception_handler(InstitutionalDataError)
async def institutional_data_exception_handler(request: Request, exc: InstitutionalDataError):
    logger.error(f"[{exc.provider}] Error on {request.url.path}: {exc.message} (HTTP {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.message,
                "provider": exc.provider,
                "status_code": exc.status_code,
                "details": exc.details,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": request.url.path
            }
        }
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception processing {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "message": "Internal market data processing exception.",
                "provider": "sinmiedo-internal-engine",
                "status_code": 500,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": request.url.path
            }
        }
    )

# Register v1 API Router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["System"])
async def root_status() -> Dict[str, Any]:
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "OPERATIONAL",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "documentation": "/docs",
        "endpoints": {
            "macro_yield_curve": f"{settings.API_V1_PREFIX}/macro/yield-curve",
            "equity_insiders": f"{settings.API_V1_PREFIX}/equity/insider-filings?symbol=AAPL",
            "derivatives_cot": f"{settings.API_V1_PREFIX}/derivatives/cot?market=SP500",
            "equity_short_flow": f"{settings.API_V1_PREFIX}/equity/short-flow?symbol=AAPL"
        }
    }

@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_PREFIX}/health", tags=["System"])
async def health_check() -> Dict[str, Any]:
    obb_ready = get_openbb() is not None
    return {
        "status": "HEALTHY",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "openbb_loaded": obb_ready,
        "cache_active": True,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1
    )
