"""
=============================================================================
HACK HUNTERS - Text Splitter Utility
=============================================================================
Splits extracted document text into semantically meaningful chunks
using LangChain's RecursiveCharacterTextSplitter.
=============================================================================
"""

import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class TextSplitter:
    """
    Splits document text into overlapping chunks for embedding and retrieval.
    
    Uses RecursiveCharacterTextSplitter which tries to split on natural
    boundaries (paragraphs, sentences, words) before resorting to character-level
    splitting, preserving semantic coherence within chunks.
    """

    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
    ):
        """
        Initialize the text splitter.
        
        Args:
            chunk_size: Maximum number of characters per chunk.
                        Defaults to settings.CHUNK_SIZE.
            chunk_overlap: Number of overlapping characters between chunks.
                           Defaults to settings.CHUNK_OVERLAP.
        """
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
            is_separator_regex=False,
        )

        logger.info(
            f"TextSplitter initialized: chunk_size={self.chunk_size}, "
            f"chunk_overlap={self.chunk_overlap}"
        )

    def split(self, text: str) -> list[str]:
        """
        Split text into chunks.
        
        Args:
            text: The raw document text to split.
            
        Returns:
            A list of text chunks.
            
        Raises:
            ValueError: If the input text is empty or None.
        """
        if not text or not text.strip():
            raise ValueError("Cannot split empty or whitespace-only text.")

        chunks = self._splitter.split_text(text)

        logger.info(
            f"Split text ({len(text)} chars) into {len(chunks)} chunks "
            f"(avg {len(text) // max(len(chunks), 1)} chars/chunk)."
        )

        return chunks

    def split_with_metadata(
        self,
        text: str,
        base_metadata: dict | None = None,
    ) -> list[dict]:
        """
        Split text into chunks with associated metadata.
        
        Each chunk gets a dictionary with:
            - 'text': the chunk content
            - 'chunk_index': zero-based index
            - Any additional metadata from base_metadata
        
        Args:
            text: The raw document text to split.
            base_metadata: Optional metadata to attach to every chunk.
            
        Returns:
            A list of dicts, each containing 'text', 'chunk_index', and metadata.
        """
        chunks = self.split(text)
        metadata = base_metadata or {}

        result = []
        for idx, chunk in enumerate(chunks):
            chunk_data = {
                "text": chunk,
                "chunk_index": idx,
                **metadata,
            }
            result.append(chunk_data)

        return result
