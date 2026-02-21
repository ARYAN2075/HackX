"""
=============================================================================
HACK HUNTERS - RAG (Retrieval-Augmented Generation) Service
=============================================================================
Implements the core RAG pipeline:
    1. Embed the user's question
    2. Retrieve top-k relevant chunks from Pinecone
    3. Build a context-augmented prompt
    4. Send to Gemini LLM for answer generation
    5. Return the answer with source citations
=============================================================================
"""

import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import get_settings
from services.embedding_service import EmbeddingService
from services.pinecone_service import PineconeService

logger = logging.getLogger(__name__)

settings = get_settings()

# --- RAG System Prompt Template ---
RAG_SYSTEM_PROMPT = """You are a highly accurate document assistant for the HACK HUNTERS Smart Document Assistant platform.

STRICT RULES:
1. Answer ONLY based on the provided context below.
2. If the answer is not present in the context, respond with exactly: "Answer not found in the uploaded document."
3. Do NOT make up, infer, or hallucinate any information beyond what is explicitly stated in the context.
4. Provide clear, well-structured answers.
5. When relevant, cite which part of the context supports your answer.
6. Be concise but thorough.

CONTEXT FROM DOCUMENT:
{context}

USER QUESTION:
{question}

ANSWER:"""


class RAGService:
    """
    Implements Retrieval-Augmented Generation for document Q&A.
    
    The pipeline:
        1. Embeds the user's question using Gemini Embeddings
        2. Performs similarity search in Pinecone to find relevant chunks
        3. Constructs a prompt with retrieved context
        4. Sends to Gemini LLM for answer generation
        5. Returns structured response with answer and sources
    """

    def __init__(
        self,
        embedding_service: EmbeddingService,
        pinecone_service: PineconeService,
    ):
        """
        Initialize the RAG service.
        
        Args:
            embedding_service: For embedding the query.
            pinecone_service: For retrieving relevant document chunks.
        """
        self._embedding_service = embedding_service
        self._pinecone_service = pinecone_service

        # Initialize the Gemini LLM
        self._llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.1,  # Low temperature for factual answers
            max_output_tokens=2048,
        )

        # Build the LangChain prompt template
        self._prompt = ChatPromptTemplate.from_template(RAG_SYSTEM_PROMPT)

        # Output parser
        self._output_parser = StrOutputParser()

        # Build the chain
        self._chain = self._prompt | self._llm | self._output_parser

        logger.info(
            f"RAGService initialized with LLM: {settings.LLM_MODEL}, "
            f"top_k: {settings.TOP_K}"
        )

    async def ask_question(
        self,
        question: str,
        user_id: str,
        document_id: str,
    ) -> dict:
        """
        Answer a question using RAG against a specific document.
        
        Args:
            question: The user's question.
            user_id: The user's ID (for scoping the search).
            document_id: The document to search within.
            
        Returns:
            Dict with:
                - answer: The generated answer string.
                - sources: List of source chunks used for context.
                - num_sources: Number of chunks retrieved.
                - question: The original question (echoed back).
                
        Raises:
            ValueError: If the question is empty.
            RuntimeError: If the RAG pipeline fails.
        """
        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")

        logger.info(
            f"RAG query: user='{user_id}', doc='{document_id}', "
            f"question='{question[:80]}...'"
        )

        try:
            # --- Step 1: Embed the question ---
            logger.debug("Embedding question...")
            query_vector = await self._embedding_service.embed_text(question)

            # --- Step 2: Retrieve relevant chunks from Pinecone ---
            logger.debug("Querying Pinecone for relevant chunks...")
            matches = await self._pinecone_service.query(
                query_vector=query_vector,
                top_k=settings.TOP_K,
                filter_dict={
                    "user_id": user_id,
                    "document_id": document_id,
                },
            )

            if not matches:
                logger.warning(
                    f"No matching chunks found for document '{document_id}'."
                )
                return {
                    "answer": "Answer not found in the uploaded document.",
                    "sources": [],
                    "num_sources": 0,
                    "question": question,
                }

            # --- Step 3: Build context from retrieved chunks ---
            sources = []
            context_parts = []
            for i, match in enumerate(matches, start=1):
                chunk_text = match["metadata"].get("text", "")
                chunk_index = match["metadata"].get("chunk_index", "?")
                score = match.get("score", 0)

                context_parts.append(
                    f"[Source {i} | Chunk {chunk_index} | "
                    f"Relevance: {score:.4f}]\n{chunk_text}"
                )
                sources.append({
                    "chunk_index": chunk_index,
                    "text": chunk_text,
                    "relevance_score": round(score, 4),
                    "file_name": match["metadata"].get("file_name", "Unknown"),
                })

            context = "\n\n---\n\n".join(context_parts)

            logger.debug(
                f"Built context from {len(sources)} chunks "
                f"({len(context)} chars total)."
            )

            # --- Step 4: Generate answer via LLM ---
            logger.debug("Sending to Gemini LLM...")
            answer = await self._chain.ainvoke({
                "context": context,
                "question": question,
            })

            logger.info(
                f"RAG answer generated: {len(answer)} chars from "
                f"{len(sources)} sources."
            )

            return {
                "answer": answer.strip(),
                "sources": sources,
                "num_sources": len(sources),
                "question": question,
            }

        except ValueError:
            raise
        except Exception as e:
            logger.error(f"RAG pipeline failed: {e}", exc_info=True)
            raise RuntimeError(f"Failed to process question: {str(e)}")
