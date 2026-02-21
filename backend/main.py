"""
=============================================================================
HACK HUNTERS - Smart Document Assistant Backend
=============================================================================
Main FastAPI application entry point.

Initializes all services, registers routes, configures CORS and logging,
and provides a health check endpoint.

Usage:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
=============================================================================
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings

# --- Load Settings ---
settings = get_settings()

# --- Configure Logging ---
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)-30s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

# --- Global Service Instances ---
# These are initialized during app startup and accessed by route modules
embedding_service = None
pinecone_service = None
document_processor = None
rag_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    
    Initializes all services on startup and performs cleanup on shutdown.
    This ensures services are ready before handling requests and
    resources are properly released when the app stops.
    """
    global embedding_service, pinecone_service, document_processor, rag_service

    logger.info("=" * 60)
    logger.info("HACK HUNTERS - Smart Document Assistant Backend")
    logger.info("=" * 60)
    logger.info("Initializing services...")

    try:
        # --- Initialize Services ---
        from services.embedding_service import EmbeddingService
        from services.pinecone_service import PineconeService
        from services.document_processor import DocumentProcessor
        from services.rag_service import RAGService

        embedding_service = EmbeddingService()
        logger.info("[OK] EmbeddingService initialized")

        pinecone_service = PineconeService()
        logger.info("[OK] PineconeService initialized")

        document_processor = DocumentProcessor(
            embedding_service=embedding_service,
            pinecone_service=pinecone_service,
        )
        logger.info("[OK] DocumentProcessor initialized")

        rag_service = RAGService(
            embedding_service=embedding_service,
            pinecone_service=pinecone_service,
        )
        logger.info("[OK] RAGService initialized")

        logger.info("=" * 60)
        logger.info("All services initialized. Server is ready!")
        logger.info(f"API docs: http://localhost:{settings.APP_PORT}/docs")
        logger.info("=" * 60)

    except Exception as e:
        logger.critical(f"Failed to initialize services: {e}", exc_info=True)
        raise RuntimeError(
            f"Service initialization failed: {str(e)}. "
            "Check your .env configuration and API keys."
        )

    yield  # Application runs here

    # --- Shutdown ---
    logger.info("Shutting down services...")
    logger.info("Shutdown complete.")


# --- Create FastAPI Application ---
app = FastAPI(
    title="HACK HUNTERS - Smart Document Assistant API",
    description=(
        "A production-ready RAG-powered document Q&A backend. "
        "Upload documents (PDF, DOCX, TXT), and ask questions that are "
        "answered strictly from the document content using Google Gemini "
        "and Pinecone vector search."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Health",
            "description": "Health check and status endpoints.",
        },
        {
            "name": "Upload",
            "description": "Document upload and processing.",
        },
        {
            "name": "Query",
            "description": "Ask questions about uploaded documents.",
        },
        {
            "name": "Documents",
            "description": "List and manage uploaded documents.",
        },
    ],
)

# --- CORS Middleware ---
# Allows the React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",  # Allow all origins in development; restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Routes ---
from routes.upload import router as upload_router
from routes.query import router as query_router
from routes.document import router as document_router

app.include_router(upload_router)
app.include_router(query_router)
app.include_router(document_router)


# --- Health Check ---
@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Returns the health status of the API and its services.",
)
async def health_check():
    """
    Check if the API and all services are operational.
    
    **Response (200):**
    ```json
    {
        "status": "healthy",
        "services": {
            "embedding_service": true,
            "pinecone_service": true,
            "document_processor": true,
            "rag_service": true
        },
        "version": "1.0.0"
    }
    ```
    """
    return {
        "status": "healthy",
        "services": {
            "embedding_service": embedding_service is not None,
            "pinecone_service": pinecone_service is not None,
            "document_processor": document_processor is not None,
            "rag_service": rag_service is not None,
        },
        "version": "1.0.0",
    }


@app.get(
    "/",
    tags=["Health"],
    summary="Root",
    description="API welcome message.",
)
async def root():
    """Root endpoint with API information."""
    return {
        "app": "HACK HUNTERS - Smart Document Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


# --- Run with Uvicorn ---
if __name__ == "__main__":
    import uvicorn

    logger.info(
        f"Starting server on {settings.APP_HOST}:{settings.APP_PORT}"
    )
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
