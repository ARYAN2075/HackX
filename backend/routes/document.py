"""
=============================================================================
HACK HUNTERS - Document Management Routes
=============================================================================
API endpoints for listing and deleting user documents.
=============================================================================
"""

import logging
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Documents"])


# --- Response Models ---

class DocumentInfo(BaseModel):
    """Information about an uploaded document."""

    document_id: str = Field(description="Unique document identifier.")
    file_name: str = Field(description="Original file name.")


class DocumentListResponse(BaseModel):
    """Response for listing user documents."""

    documents: list[DocumentInfo] = Field(
        description="List of user's documents."
    )
    count: int = Field(description="Total number of documents.")
    user_id: str = Field(description="The user ID queried.")


class DeleteResponse(BaseModel):
    """Response for document deletion."""

    message: str = Field(description="Status message.")
    document_id: str = Field(description="ID of the deleted document.")
    status: str = Field(description="Deletion status.")


def get_pinecone_service():
    """Lazy import to avoid circular dependencies."""
    from main import pinecone_service
    return pinecone_service


def get_document_processor():
    """Lazy import to avoid circular dependencies."""
    from main import document_processor
    return document_processor


@router.get(
    "/documents",
    response_model=DocumentListResponse,
    summary="List user's documents",
    description=(
        "Retrieve a list of all documents uploaded by a specific user."
    ),
    response_description="List of uploaded documents",
)
async def list_documents(
    user_id: str = Query(
        ...,
        description="The user's unique identifier.",
        min_length=1,
        max_length=128,
        examples=["user_12345"],
    ),
):
    """
    List all documents uploaded by a user.
    
    **Query Parameters:**
    - `user_id`: The user's unique identifier
    
    **Response (200):**
    ```json
    {
        "documents": [
            {
                "document_id": "550e8400-...",
                "file_name": "report.pdf"
            }
        ],
        "count": 1,
        "user_id": "user_12345"
    }
    ```
    """
    try:
        service = get_pinecone_service()
        documents = await service.list_documents_for_user(user_id)

        logger.info(
            f"Listed {len(documents)} documents for user '{user_id}'."
        )

        return DocumentListResponse(
            documents=[DocumentInfo(**doc) for doc in documents],
            count=len(documents),
            user_id=user_id,
        )

    except RuntimeError as e:
        logger.error(f"Failed to list documents: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents.",
        )
    except Exception as e:
        logger.error(f"Unexpected error listing documents: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.delete(
    "/documents/{document_id}",
    response_model=DeleteResponse,
    summary="Delete a document",
    description=(
        "Delete a document from both the vector database and local storage. "
        "This permanently removes all associated data."
    ),
    response_description="Deletion confirmation",
)
async def delete_document(
    document_id: str,
    user_id: str = Query(
        ...,
        description="The user's unique identifier.",
        min_length=1,
        max_length=128,
        examples=["user_12345"],
    ),
):
    """
    Delete a specific document.
    
    Removes the document from:
    1. Pinecone vector database (all associated chunk embeddings)
    2. Local file storage
    
    **Path Parameters:**
    - `document_id`: The document's unique identifier
    
    **Query Parameters:**
    - `user_id`: The user's unique identifier (for authorization)
    
    **Response (200):**
    ```json
    {
        "message": "Document deleted successfully.",
        "document_id": "550e8400-...",
        "status": "deleted"
    }
    ```
    """
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ID is required.",
        )

    try:
        processor = get_document_processor()
        result = await processor.delete_document(
            user_id=user_id,
            document_id=document_id,
        )

        logger.info(
            f"Document '{document_id}' deleted for user '{user_id}'."
        )

        return DeleteResponse(
            message="Document deleted successfully.",
            document_id=result["document_id"],
            status=result["status"],
        )

    except RuntimeError as e:
        logger.error(f"Failed to delete document: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete the document.",
        )
    except Exception as e:
        logger.error(
            f"Unexpected error deleting document: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )
