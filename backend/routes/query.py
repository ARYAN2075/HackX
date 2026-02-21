"""
=============================================================================
HACK HUNTERS - Query Route (Production-Ready)
=============================================================================
API endpoint for asking questions about uploaded documents using RAG.

Returns clean JSON responses for every scenario.
=============================================================================
"""

import logging
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Query"])


# ── Request / Response Models ───────────────────────────────────────────────

class QueryRequest(BaseModel):
    """Request body for asking a question."""

    user_id: str = Field(
        ...,
        description="The user's unique identifier.",
        min_length=1,
        max_length=128,
        examples=["user_12345"],
    )
    document_id: str = Field(
        ...,
        description="The document ID to query against.",
        min_length=1,
        max_length=128,
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    question: str = Field(
        ...,
        description="The question to ask about the document.",
        min_length=1,
        max_length=2000,
        examples=["What are the main findings of this report?"],
    )


class SourceChunk(BaseModel):
    """A source chunk used in generating the answer."""

    chunk_index: int = Field(description="Index of the chunk in the document.")
    text: str = Field(description="The text content of the chunk.")
    relevance_score: float = Field(description="Similarity score (0-1).")
    file_name: str = Field(description="Source document file name.")


class QueryResponse(BaseModel):
    """Response body for a question answer."""

    success: bool = Field(default=True)
    answer: str = Field(description="The generated answer.")
    sources: list[SourceChunk] = Field(
        description="Source chunks used to generate the answer."
    )
    num_sources: int = Field(description="Number of source chunks used.")
    question: str = Field(description="The original question (echoed).")


def get_rag_service():
    """Lazy import to avoid circular dependencies."""
    from main import rag_service
    return rag_service


def _error_response(
    error_message: str,
    error_code: str = "QUERY_FAILED",
    status_code: int = 400,
) -> JSONResponse:
    """Build a structured error JSON response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": error_message,
            "error_code": error_code,
        },
    )


@router.post(
    "/query",
    response_model=QueryResponse,
    summary="Ask a question about a document",
    description=(
        "Submit a question about a previously uploaded document. "
        "The system uses RAG (Retrieval-Augmented Generation) to find "
        "relevant passages and generate an answer strictly from the "
        "document content."
    ),
    response_description="The generated answer with source citations",
)
async def ask_question(request: QueryRequest):
    """
    Ask a question about an uploaded document.

    The RAG pipeline:
    1. Embeds the question using Gemini Embeddings
    2. Retrieves top-5 most relevant chunks from Pinecone
    3. Sends context + question to Gemini LLM
    4. Returns the answer with source citations
    """
    try:
        service = get_rag_service()

        if service is None:
            return _error_response(
                "RAG service is not available. Please try again later.",
                error_code="SERVICE_UNAVAILABLE",
                status_code=503,
            )

        result = await service.ask_question(
            question=request.question,
            user_id=request.user_id,
            document_id=request.document_id,
        )

        logger.info(
            f"Query answered: user='{request.user_id}', "
            f"doc='{request.document_id}', "
            f"sources={result['num_sources']}"
        )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "answer": result["answer"],
                "sources": result["sources"],
                "num_sources": result["num_sources"],
                "question": result["question"],
            },
        )

    except ValueError as e:
        return _error_response(
            str(e),
            error_code="INVALID_REQUEST",
        )
    except RuntimeError as e:
        logger.error(f"RAG query failed: {e}", exc_info=True)
        return _error_response(
            "Failed to process your question. Please try again.",
            error_code="RAG_PIPELINE_FAILED",
        )
    except Exception as e:
        logger.error(f"Unexpected error during query: {e}", exc_info=True)
        return _error_response(
            "An unexpected error occurred while processing your question.",
            error_code="UNKNOWN_ERROR",
        )
