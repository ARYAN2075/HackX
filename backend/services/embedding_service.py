"""
=============================================================================
HACK HUNTERS - Embedding Service
=============================================================================
Handles vector embedding generation using Google Gemini Embeddings
via the LangChain integration.
=============================================================================
"""

import logging
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class EmbeddingService:
    """
    Generates vector embeddings for text using Google Gemini.
    
    Uses langchain-google-genai's GoogleGenerativeAIEmbeddings which wraps
    the Gemini embedding API for seamless integration with LangChain.
    """

    def __init__(self):
        """Initialize the Gemini embedding model."""
        self._model = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
        )
        logger.info(
            f"EmbeddingService initialized with model: {settings.EMBEDDING_MODEL}"
        )

    async def embed_text(self, text: str) -> list[float]:
        """
        Generate an embedding vector for a single text string.
        
        Args:
            text: The text to embed.
            
        Returns:
            A list of floats representing the embedding vector.
            
        Raises:
            ValueError: If the text is empty.
            RuntimeError: If the embedding API call fails.
        """
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text.")

        try:
            embedding = await self._model.aembed_query(text)
            logger.debug(
                f"Generated embedding for text ({len(text)} chars) -> "
                f"vector dim: {len(embedding)}"
            )
            return embedding
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise RuntimeError(f"Failed to generate embedding: {str(e)}")

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for multiple text strings in batch.
        
        Args:
            texts: A list of text strings to embed.
            
        Returns:
            A list of embedding vectors (each a list of floats).
            
        Raises:
            ValueError: If the texts list is empty.
            RuntimeError: If the embedding API call fails.
        """
        if not texts:
            raise ValueError("Cannot embed an empty list of texts.")

        # Filter out empty strings
        valid_texts = [t for t in texts if t and t.strip()]
        if not valid_texts:
            raise ValueError("All provided texts are empty.")

        try:
            embeddings = await self._model.aembed_documents(valid_texts)
            logger.info(
                f"Generated {len(embeddings)} embeddings in batch "
                f"(vector dim: {len(embeddings[0]) if embeddings else 'N/A'})."
            )
            return embeddings
        except Exception as e:
            logger.error(f"Batch embedding generation failed: {e}")
            raise RuntimeError(f"Failed to generate batch embeddings: {str(e)}")

    def get_dimension(self) -> int:
        """
        Get the embedding dimension for the current model.
        
        Returns:
            The expected vector dimension (768 for Gemini embedding-001).
        """
        # Gemini embedding-001 produces 768-dimensional vectors
        return 768
