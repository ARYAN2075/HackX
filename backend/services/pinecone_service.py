"""
=============================================================================
HACK HUNTERS - Pinecone Vector Database Service
=============================================================================
Manages all interactions with the Pinecone vector database, including
index creation, upserting embeddings, querying, and deletion.

Compatible with pinecone Python SDK v5.x
=============================================================================
"""

import logging
import time
from pinecone import Pinecone, ServerlessSpec
from config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class PineconeService:
    """
    Manages Pinecone vector database operations for document chunk storage
    and similarity search.

    Each document chunk is stored as a vector with metadata:
        - user_id: Owner of the document
        - document_id: Unique document identifier
        - file_name: Original file name
        - chunk_index: Position of the chunk in the document
        - text: The original chunk text (stored for retrieval)
    """

    def __init__(self):
        """Initialize the Pinecone client and ensure the index exists."""
        self._client = Pinecone(api_key=settings.PINECONE_API_KEY)
        self._index_name = settings.PINECONE_INDEX_NAME
        self._ensure_index_exists()
        self._index = self._client.Index(self._index_name)
        logger.info(f"PineconeService initialized with index: {self._index_name}")

    def _ensure_index_exists(self) -> None:
        """
        Create the Pinecone index if it does not already exist.

        Uses the serverless spec with the configured environment.
        Waits for the index to become ready before returning.
        """
        existing_indexes = [idx.name for idx in self._client.list_indexes()]

        if self._index_name in existing_indexes:
            logger.info(f"Pinecone index '{self._index_name}' already exists.")
            return

        logger.info(f"Creating Pinecone index '{self._index_name}'...")
        self._client.create_index(
            name=self._index_name,
            dimension=768,  # Gemini embedding-001 dimension
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region=settings.PINECONE_ENV,
            ),
        )

        # Wait for index to be ready
        max_wait = 120  # seconds
        waited = 0
        while waited < max_wait:
            desc = self._client.describe_index(self._index_name)
            # Pinecone v5: desc.status is an object with a .ready attribute
            if getattr(desc.status, "ready", False):
                logger.info(f"Index '{self._index_name}' is ready.")
                return
            time.sleep(2)
            waited += 2

        logger.warning(
            f"Index '{self._index_name}' creation timed out after {max_wait}s. "
            "It may still be initializing."
        )

    async def upsert_vectors(
        self,
        vectors: list[dict],
        namespace: str = "",
    ) -> int:
        """
        Upsert embedding vectors with metadata into Pinecone.

        Args:
            vectors: List of dicts, each with:
                - 'id': Unique vector ID
                - 'values': Embedding vector (list of floats)
                - 'metadata': Dict with user_id, document_id, file_name,
                              chunk_index, text
            namespace: Optional Pinecone namespace for multi-tenancy.

        Returns:
            Number of vectors successfully upserted.

        Raises:
            RuntimeError: If the upsert operation fails.
        """
        if not vectors:
            logger.warning("No vectors to upsert.")
            return 0

        try:
            # Pinecone upsert in batches of 100
            batch_size = 100
            total_upserted = 0

            for i in range(0, len(vectors), batch_size):
                batch = vectors[i : i + batch_size]
                upsert_data = [
                    (v["id"], v["values"], v["metadata"]) for v in batch
                ]
                self._index.upsert(vectors=upsert_data, namespace=namespace)
                total_upserted += len(batch)
                logger.debug(
                    f"Upserted batch {i // batch_size + 1}: "
                    f"{len(batch)} vectors."
                )

            logger.info(f"Successfully upserted {total_upserted} vectors.")
            return total_upserted

        except Exception as e:
            logger.error(f"Pinecone upsert failed: {e}")
            raise RuntimeError(f"Failed to upsert vectors: {str(e)}")

    async def query(
        self,
        query_vector: list[float],
        top_k: int | None = None,
        filter_dict: dict | None = None,
        namespace: str = "",
    ) -> list[dict]:
        """
        Query Pinecone for the most similar vectors.

        Args:
            query_vector: The query embedding vector.
            top_k: Number of results to return. Defaults to settings.TOP_K.
            filter_dict: Metadata filter (e.g., {"user_id": "abc", "document_id": "xyz"}).
            namespace: Optional Pinecone namespace.

        Returns:
            List of dicts with 'id', 'score', and 'metadata' for each match.

        Raises:
            RuntimeError: If the query operation fails.
        """
        top_k = top_k or settings.TOP_K

        try:
            results = self._index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict,
                namespace=namespace,
            )

            # Pinecone v5: results is a QueryResponse object with .matches attribute
            raw_matches = getattr(results, "matches", []) or []

            matches = []
            for match in raw_matches:
                matches.append({
                    "id": match.id,
                    "score": match.score,
                    "metadata": match.metadata or {},
                })

            logger.info(
                f"Query returned {len(matches)} matches (top_k={top_k})."
            )
            return matches

        except Exception as e:
            logger.error(f"Pinecone query failed: {e}")
            raise RuntimeError(f"Failed to query vectors: {str(e)}")

    async def delete_by_document(
        self,
        user_id: str,
        document_id: str,
        namespace: str = "",
    ) -> None:
        """
        Delete all vectors associated with a specific document.

        Uses metadata filtering to identify and remove all chunks
        belonging to the given document for the given user.

        Args:
            user_id: The document owner's user ID.
            document_id: The unique document identifier.
            namespace: Optional Pinecone namespace.

        Raises:
            RuntimeError: If the delete operation fails.
        """
        try:
            self._index.delete(
                filter={
                    "user_id": user_id,
                    "document_id": document_id,
                },
                namespace=namespace,
            )
            logger.info(
                f"Deleted all vectors for document '{document_id}' "
                f"(user: '{user_id}')."
            )
        except Exception as e:
            logger.error(
                f"Failed to delete vectors for document '{document_id}': {e}"
            )
            raise RuntimeError(
                f"Failed to delete document vectors: {str(e)}"
            )

    async def list_documents_for_user(
        self,
        user_id: str,
        namespace: str = "",
    ) -> list[dict]:
        """
        Retrieve distinct documents uploaded by a user.

        Queries Pinecone with a metadata filter for the user_id and
        deduplicates by document_id to return a list of documents.

        Note: Pinecone doesn't have a native "list distinct" operation,
        so we query a generous top_k and deduplicate client-side.

        Args:
            user_id: The user's unique identifier.
            namespace: Optional Pinecone namespace.

        Returns:
            List of dicts with 'document_id' and 'file_name'.
        """
        try:
            # Use a zero vector to just leverage the filter
            zero_vector = [0.0] * 768
            results = self._index.query(
                vector=zero_vector,
                top_k=10000,
                include_metadata=True,
                filter={"user_id": user_id},
                namespace=namespace,
            )

            # Pinecone v5: results is a QueryResponse object with .matches attribute
            raw_matches = getattr(results, "matches", []) or []

            seen = {}
            for match in raw_matches:
                meta = match.metadata or {}
                doc_id = meta.get("document_id")
                if doc_id and doc_id not in seen:
                    seen[doc_id] = {
                        "document_id": doc_id,
                        "file_name": meta.get("file_name", "Unknown"),
                    }

            documents = list(seen.values())
            logger.info(
                f"Found {len(documents)} documents for user '{user_id}'."
            )
            return documents

        except Exception as e:
            logger.error(
                f"Failed to list documents for user '{user_id}': {e}"
            )
            raise RuntimeError(
                f"Failed to list user documents: {str(e)}"
            )
