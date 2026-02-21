"""
=============================================================================
HACK HUNTERS - Upload Route (Production-Ready)
=============================================================================
API endpoint for document upload and processing.

Returns clean JSON responses for EVERY failure scenario.
No 500 errors for document processing issues.

Success response:
    {"success": true, "message": "...", "data": {...}}

Error response:
    {"success": false, "error": "...", "error_code": "..."}
=============================================================================
"""

import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
from config import get_settings
from services.document_processor import DocumentProcessor, DocumentProcessingError

logger = logging.getLogger(__name__)

settings = get_settings()

router = APIRouter(prefix="/api/v1", tags=["Upload"])


def get_document_processor() -> DocumentProcessor:
    """
    Lazy import to avoid circular dependencies.
    The processor is initialized in main.py and injected via app state.
    """
    from main import document_processor
    return document_processor


def _error_response(
    error_message: str,
    error_code: str = "UNKNOWN_ERROR",
    status_code: int = 400,
) -> JSONResponse:
    """
    Build a structured error JSON response.
    Always returns {"success": false, "error": "...", "error_code": "..."}
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": error_message,
            "error_code": error_code,
        },
    )


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document",
    description=(
        "Upload a PDF, DOCX, or TXT file for processing. "
        "The document will be parsed, chunked, embedded, and stored "
        "in the vector database for Q&A."
    ),
    response_description="Document processing results",
)
async def upload_document(
    file: UploadFile = File(
        ...,
        description="The document file to upload (PDF, DOCX, or TXT).",
    ),
    user_id: str = Form(
        ...,
        description="The unique identifier of the uploading user.",
        min_length=1,
        max_length=128,
    ),
):
    """
    Upload and process a document.

    Accepts PDF, DOCX, and TXT files up to the configured max size.
    The document goes through the full processing pipeline:
    text extraction -> chunking -> embedding -> vector storage.

    **Success Response (201):**
    ```json
    {
        "success": true,
        "message": "Document uploaded and processed successfully.",
        "data": {
            "document_id": "uuid-string",
            "file_name": "example.pdf",
            "num_chunks": 15,
            "total_characters": 12500,
            "status": "success"
        }
    }
    ```

    **Error Response (400):**
    ```json
    {
        "success": false,
        "error": "Password-protected PDFs are not supported.",
        "error_code": "PASSWORD_PROTECTED"
    }
    ```
    """

    # ── Validate file name ──────────────────────────────────────────────
    if not file.filename:
        return _error_response(
            "File must have a name.",
            error_code="INVALID_FILE",
        )

    # ── Validate file extension ─────────────────────────────────────────
    file_ext = (
        file.filename.rsplit(".", 1)[-1].lower()
        if "." in file.filename
        else ""
    )
    if file_ext not in settings.allowed_extensions_list:
        return _error_response(
            f"Unsupported file type: '.{file_ext}'. "
            f"Allowed types: {', '.join(settings.allowed_extensions_list)}",
            error_code="UNSUPPORTED_FILE_TYPE",
        )

    # ── Read file content ───────────────────────────────────────────────
    try:
        content = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        return _error_response(
            "Failed to read the uploaded file. The file may be corrupted.",
            error_code="READ_FAILED",
        )

    # ── Validate file is not empty ──────────────────────────────────────
    if len(content) == 0:
        return _error_response(
            "The uploaded file is empty (0 bytes).",
            error_code="EMPTY_FILE",
        )

    # ── Validate file size ──────────────────────────────────────────────
    if len(content) > settings.max_file_size_bytes:
        size_mb = len(content) / (1024 * 1024)
        return _error_response(
            f"File size ({size_mb:.1f} MB) exceeds the maximum "
            f"allowed size ({settings.MAX_FILE_SIZE_MB} MB).",
            error_code="FILE_TOO_LARGE",
            status_code=413,
        )

    # ── Process the document ────────────────────────────────────────────
    try:
        processor = get_document_processor()

        if processor is None:
            logger.error("DocumentProcessor is not initialized.")
            return _error_response(
                "Document processing service is not available. "
                "Please try again later.",
                error_code="SERVICE_UNAVAILABLE",
                status_code=503,
            )

        result = await processor.process_document(
            file_content=content,
            file_name=file.filename,
            user_id=user_id,
        )

        logger.info(
            f"Document uploaded successfully: {file.filename} "
            f"(user: {user_id}, doc_id: {result['document_id']})"
        )

        return JSONResponse(
            status_code=201,
            content={
                "success": True,
                "message": "Document uploaded and processed successfully.",
                "data": result,
            },
        )

    except DocumentProcessingError as e:
        logger.warning(
            f"Document processing error [{e.error_code}]: {e.user_message}"
        )
        return _error_response(
            error_message=e.user_message,
            error_code=e.error_code,
        )

    except Exception as e:
        # This should never happen because DocumentProcessor catches
        # everything internally, but just in case:
        logger.error(
            f"Unexpected error during upload: {e}", exc_info=True
        )
        return _error_response(
            "An unexpected error occurred while processing the document. "
            "Please try again.",
            error_code="UNKNOWN_ERROR",
        )
