"""
=============================================================================
HACK HUNTERS - Document Processor Service (Production-Ready)
=============================================================================
Orchestrates the full document processing pipeline:
    1. Validate uploaded file (type, corruption, password)
    2. Save uploaded file to local storage
    3. Extract text from the document (multi-stage for PDFs)
    4. Validate extracted text is non-empty
    5. Split text into chunks
    6. Generate embeddings for each chunk
    7. Store embeddings + metadata in Pinecone

CRITICAL RULE:
    If extracted text is empty after stripping whitespace, the pipeline
    MUST stop immediately.  Empty text is NEVER sent to the embedding
    model or inserted into Pinecone.
=============================================================================
"""

import logging
import os
import uuid
import shutil
from pathlib import Path

from config import get_settings
from utils.file_loader import (
    FileLoader,
    FileLoadError,
    UnsupportedFileTypeError,
    CorruptedFileError,
    PasswordProtectedError,
    EmptyDocumentError,
)
from utils.text_splitter import TextSplitter
from services.embedding_service import EmbeddingService
from services.pinecone_service import PineconeService

logger = logging.getLogger(__name__)

settings = get_settings()


# ═══════════════════════════════════════════════════════════════════════════════
#  Exception Classes
# ═══════════════════════════════════════════════════════════════════════════════

class DocumentProcessingError(Exception):
    """
    Raised when the document processing pipeline fails.

    Attributes:
        user_message:  A safe, user-facing description of the problem.
        error_code:    Machine-readable error category for the frontend.
    """

    def __init__(
        self,
        user_message: str,
        error_code: str = "PROCESSING_FAILED",
    ):
        self.user_message = user_message
        self.error_code = error_code
        super().__init__(user_message)


# ═══════════════════════════════════════════════════════════════════════════════
#  DocumentProcessor
# ═══════════════════════════════════════════════════════════════════════════════

class DocumentProcessor:
    """
    Orchestrates end-to-end document processing: save, extract, chunk,
    embed, and store in vector database.
    """

    def __init__(
        self,
        embedding_service: EmbeddingService,
        pinecone_service: PineconeService,
    ):
        self._embedding_service = embedding_service
        self._pinecone_service = pinecone_service
        self._text_splitter = TextSplitter()
        self._upload_dir = Path(settings.UPLOAD_DIR)
        self._ensure_upload_dir()

    def _ensure_upload_dir(self) -> None:
        """Create the upload directory if it doesn't exist."""
        self._upload_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Upload directory: {self._upload_dir.resolve()}")

    @staticmethod
    def _generate_document_id() -> str:
        """Generate a unique document ID."""
        return str(uuid.uuid4())

    # ── Main Pipeline ───────────────────────────────────────────────────────

    async def process_document(
        self,
        file_content: bytes,
        file_name: str,
        user_id: str,
    ) -> dict:
        """
        Process an uploaded document through the full pipeline.

        Pipeline steps:
            1. Validate file type
            2. Save file to local storage
            3. Extract text from file (multi-stage for PDFs)
            4. Validate extracted text is non-empty
            5. Split text into chunks
            6. Generate embeddings
            7. Store in Pinecone with metadata

        Args:
            file_content: Raw file bytes.
            file_name:    Original file name (with extension).
            user_id:      The uploading user's ID.

        Returns:
            Dict with processing results (document_id, num_chunks, etc.)

        Raises:
            DocumentProcessingError: If any pipeline step fails.
        """
        document_id = self._generate_document_id()

        logger.info(
            f"[{document_id}] Processing document: file='{file_name}', "
            f"user='{user_id}', size={len(file_content)} bytes"
        )

        # ── Step 1: Validate file type ──────────────────────────────────
        try:
            FileLoader.validate_extension(file_name)
        except UnsupportedFileTypeError as e:
            raise DocumentProcessingError(
                user_message=str(e),
                error_code="UNSUPPORTED_FILE_TYPE",
            )

        # ── Step 2: Save file to local storage ──────────────────────────
        try:
            file_path = await self._save_file(file_content, file_name, document_id)
        except Exception as e:
            logger.error(f"[{document_id}] Failed to save file: {e}", exc_info=True)
            raise DocumentProcessingError(
                user_message="Failed to save the uploaded file. Please try again.",
                error_code="SAVE_FAILED",
            )

        try:
            # ── Step 3: Extract text ────────────────────────────────────
            logger.info(f"[{document_id}] Extracting text...")
            try:
                text = FileLoader.load(str(file_path))
            except PasswordProtectedError as e:
                raise DocumentProcessingError(
                    user_message=str(e),
                    error_code="PASSWORD_PROTECTED",
                )
            except CorruptedFileError as e:
                raise DocumentProcessingError(
                    user_message=str(e),
                    error_code="CORRUPTED_FILE",
                )
            except EmptyDocumentError as e:
                raise DocumentProcessingError(
                    user_message=str(e),
                    error_code="EMPTY_DOCUMENT",
                )
            except FileLoadError as e:
                raise DocumentProcessingError(
                    user_message=str(e),
                    error_code="EXTRACTION_FAILED",
                )

            # ── Step 4: Validate extracted text ─────────────────────────
            #    CRITICAL: Never send empty text to embeddings / Pinecone
            clean_text = text.strip() if text else ""
            if not clean_text:
                raise DocumentProcessingError(
                    user_message=(
                        "Text extraction completed but produced no readable content. "
                        "The document may be image-based or contain only graphics."
                    ),
                    error_code="EMPTY_DOCUMENT",
                )

            # Additional validation: minimum meaningful length (50 chars)
            if len(clean_text) < 50:
                raise DocumentProcessingError(
                    user_message=(
                        f"Text extraction produced only {len(clean_text)} characters, "
                        "which is insufficient for meaningful analysis. "
                        "Please upload a document with more textual content."
                    ),
                    error_code="INSUFFICIENT_CONTENT",
                )

            logger.info(
                f"[{document_id}] Extracted {len(clean_text)} characters."
            )

            # ── Step 5: Split into chunks ───────────────────────────────
            logger.info(f"[{document_id}] Splitting text into chunks...")
            try:
                chunks = self._text_splitter.split(clean_text)
            except ValueError as e:
                raise DocumentProcessingError(
                    user_message=(
                        "The extracted text was too short to create meaningful chunks. "
                        "Please upload a document with more content."
                    ),
                    error_code="INSUFFICIENT_CONTENT",
                )

            if not chunks:
                raise DocumentProcessingError(
                    user_message="Document produced no text chunks after splitting.",
                    error_code="EMPTY_CHUNKS",
                )

            # Filter out empty/whitespace-only chunks
            chunks = [c for c in chunks if c and c.strip()]
            if not chunks:
                raise DocumentProcessingError(
                    user_message="All extracted text chunks were empty after cleaning.",
                    error_code="EMPTY_CHUNKS",
                )

            logger.info(f"[{document_id}] Created {len(chunks)} chunks.")

            # ── Step 6: Generate embeddings ─────────────────────────────
            logger.info(f"[{document_id}] Generating embeddings...")
            try:
                embeddings = await self._embedding_service.embed_texts(chunks)
            except ValueError as e:
                raise DocumentProcessingError(
                    user_message="Failed to generate embeddings: extracted text may be invalid.",
                    error_code="EMBEDDING_FAILED",
                )
            except RuntimeError as e:
                raise DocumentProcessingError(
                    user_message="Embedding service is temporarily unavailable. Please try again.",
                    error_code="EMBEDDING_SERVICE_ERROR",
                )

            logger.info(
                f"[{document_id}] Generated {len(embeddings)} embeddings."
            )

            # ── Step 7: Store in Pinecone ───────────────────────────────
            logger.info(f"[{document_id}] Storing in Pinecone...")
            try:
                vectors = self._prepare_vectors(
                    chunks=chunks,
                    embeddings=embeddings,
                    user_id=user_id,
                    document_id=document_id,
                    file_name=file_name,
                )
                num_upserted = await self._pinecone_service.upsert_vectors(vectors)
            except RuntimeError as e:
                raise DocumentProcessingError(
                    user_message="Vector database is temporarily unavailable. Please try again.",
                    error_code="PINECONE_SERVICE_ERROR",
                )

            logger.info(
                f"[{document_id}] Stored {num_upserted} vectors in Pinecone."
            )

            result = {
                "document_id": document_id,
                "file_name": file_name,
                "num_chunks": len(chunks),
                "total_characters": len(clean_text),
                "status": "success",
            }

            logger.info(
                f"[{document_id}] Document processing complete: "
                f"{len(chunks)} chunks, {len(clean_text)} chars."
            )
            return result

        except DocumentProcessingError:
            # Clean up saved file on known failures
            await self._delete_file(document_id)
            raise
        except Exception as e:
            logger.error(
                f"[{document_id}] Unexpected processing failure: {e}",
                exc_info=True,
            )
            await self._delete_file(document_id)
            raise DocumentProcessingError(
                user_message="An unexpected error occurred while processing the document. Please try again.",
                error_code="UNKNOWN_ERROR",
            )

    # ── File I/O Helpers ────────────────────────────────────────────────────

    async def _save_file(
        self,
        content: bytes,
        file_name: str,
        document_id: str,
    ) -> Path:
        """
        Save uploaded file to local storage.
        Files are saved in a subdirectory named by document_id.
        """
        doc_dir = self._upload_dir / document_id
        doc_dir.mkdir(parents=True, exist_ok=True)

        # Sanitise filename: keep only the base name
        safe_name = Path(file_name).name
        file_path = doc_dir / safe_name
        file_path.write_bytes(content)

        logger.info(
            f"[{document_id}] File saved: {file_path} ({len(content)} bytes)."
        )
        return file_path

    async def _delete_file(self, document_id: str) -> None:
        """Delete a document's files from local storage."""
        doc_dir = self._upload_dir / document_id
        if doc_dir.exists():
            shutil.rmtree(doc_dir, ignore_errors=True)
            logger.info(f"[{document_id}] Local files deleted.")
        else:
            logger.debug(
                f"[{document_id}] No local files found for deletion."
            )

    async def delete_document(
        self,
        user_id: str,
        document_id: str,
    ) -> dict:
        """Delete a document from both Pinecone and local storage."""
        logger.info(
            f"Deleting document '{document_id}' for user '{user_id}'."
        )
        await self._pinecone_service.delete_by_document(user_id, document_id)
        await self._delete_file(document_id)
        return {
            "document_id": document_id,
            "status": "deleted",
        }

    # ── Vector Preparation ──────────────────────────────────────────────────

    def _prepare_vectors(
        self,
        chunks: list[str],
        embeddings: list[list[float]],
        user_id: str,
        document_id: str,
        file_name: str,
    ) -> list[dict]:
        """
        Prepare vector records for Pinecone upsert.
        Each vector gets a unique ID and metadata including the original
        text chunk for retrieval during RAG.
        """
        vectors = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            vector_id = f"{document_id}_chunk_{idx}"
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "user_id": user_id,
                    "document_id": document_id,
                    "file_name": file_name,
                    "chunk_index": idx,
                    "text": chunk,
                },
            })
        return vectors