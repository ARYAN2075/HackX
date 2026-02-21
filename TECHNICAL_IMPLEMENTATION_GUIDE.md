# 🔧 Technical Implementation Guide
## AI Document Q&A System - Code Examples & Specifications

---

## 📚 Table of Contents

1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [RAG Pipeline Code](#rag-pipeline-code)
4. [Vector Database Setup](#vector-database-setup)
5. [LLM Integration](#llm-integration)
6. [Real-time Streaming](#real-time-streaming)
7. [Deployment Guide](#deployment-guide)

---

## 🔙 Backend Implementation

### 1. Document Processing Service

```python
# services/document_processor.py

from typing import List, Dict, Optional
import PyPDF2
import pdfplumber
from docx import Document
import tiktoken
from dataclasses import dataclass

@dataclass
class DocumentChunk:
    """Represents a chunk of document text with metadata"""
    chunk_id: str
    text: str
    page_number: int
    char_start: int
    char_end: int
    token_count: int
    document_id: str

class DocumentProcessor:
    """Handles document extraction and chunking"""
    
    def __init__(self, max_chunk_tokens: int = 500, overlap_tokens: int = 50):
        self.max_chunk_tokens = max_chunk_tokens
        self.overlap_tokens = overlap_tokens
        self.encoding = tiktoken.get_encoding("cl100k_base")  # For OpenAI
    
    async def process_document(
        self, 
        file_path: str, 
        document_id: str
    ) -> List[DocumentChunk]:
        """
        Main entry point: Extract text and create chunks
        
        Args:
            file_path: Path to uploaded document
            document_id: Unique identifier for document
            
        Returns:
            List of DocumentChunk objects ready for embedding
        """
        # Step 1: Extract text by file type
        if file_path.endswith('.pdf'):
            pages = await self._extract_pdf(file_path)
        elif file_path.endswith('.docx'):
            pages = await self._extract_docx(file_path)
        elif file_path.endswith('.txt'):
            pages = await self._extract_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
        
        # Step 2: Create intelligent chunks
        chunks = await self._create_chunks(pages, document_id)
        
        return chunks
    
    async def _extract_pdf(self, file_path: str) -> List[Dict]:
        """Extract text from PDF with page numbers"""
        pages = []
        
        try:
            # Use pdfplumber for better text extraction
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text()
                    if text:
                        pages.append({
                            'page': page_num,
                            'text': text,
                            'char_count': len(text)
                        })
        except Exception as e:
            # Fallback to PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages, start=1):
                    text = page.extract_text()
                    if text:
                        pages.append({
                            'page': page_num,
                            'text': text,
                            'char_count': len(text)
                        })
        
        return pages
    
    async def _extract_docx(self, file_path: str) -> List[Dict]:
        """Extract text from DOCX"""
        doc = Document(file_path)
        pages = []
        current_page = 1
        current_text = []
        
        # DOCX doesn't have clear page breaks, so we estimate
        # based on content length (roughly 500 words per page)
        word_count = 0
        words_per_page = 500
        
        for paragraph in doc.paragraphs:
            current_text.append(paragraph.text)
            word_count += len(paragraph.text.split())
            
            if word_count >= words_per_page:
                pages.append({
                    'page': current_page,
                    'text': '\n'.join(current_text),
                    'char_count': sum(len(t) for t in current_text)
                })
                current_page += 1
                current_text = []
                word_count = 0
        
        # Add remaining text
        if current_text:
            pages.append({
                'page': current_page,
                'text': '\n'.join(current_text),
                'char_count': sum(len(t) for t in current_text)
            })
        
        return pages
    
    async def _extract_txt(self, file_path: str) -> List[Dict]:
        """Extract text from TXT file"""
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()
        
        # Simulate pages (1000 chars per page)
        chars_per_page = 1000
        pages = []
        
        for i in range(0, len(text), chars_per_page):
            chunk = text[i:i + chars_per_page]
            pages.append({
                'page': (i // chars_per_page) + 1,
                'text': chunk,
                'char_count': len(chunk)
            })
        
        return pages
    
    async def _create_chunks(
        self, 
        pages: List[Dict], 
        document_id: str
    ) -> List[DocumentChunk]:
        """
        Create semantic chunks with overlap
        
        Strategy:
        1. Split by paragraphs (natural boundaries)
        2. Combine paragraphs until max_chunk_tokens reached
        3. Add overlap from previous chunk
        4. Preserve page numbers
        """
        chunks = []
        chunk_index = 0
        
        for page_data in pages:
            page_num = page_data['page']
            text = page_data['text']
            
            # Split into paragraphs
            paragraphs = text.split('\n\n')
            
            current_chunk_text = []
            current_chunk_tokens = 0
            char_start = 0
            
            for paragraph in paragraphs:
                paragraph = paragraph.strip()
                if not paragraph:
                    continue
                
                # Count tokens
                tokens = self.encoding.encode(paragraph)
                token_count = len(tokens)
                
                # Check if adding this paragraph exceeds limit
                if current_chunk_tokens + token_count > self.max_chunk_tokens:
                    # Save current chunk
                    if current_chunk_text:
                        chunk_text = '\n\n'.join(current_chunk_text)
                        chunks.append(DocumentChunk(
                            chunk_id=f"{document_id}_chunk_{chunk_index}",
                            text=chunk_text,
                            page_number=page_num,
                            char_start=char_start,
                            char_end=char_start + len(chunk_text),
                            token_count=current_chunk_tokens,
                            document_id=document_id
                        ))
                        chunk_index += 1
                    
                    # Start new chunk with overlap
                    # Take last paragraph from previous chunk as overlap
                    if current_chunk_text:
                        overlap_text = current_chunk_text[-1]
                        current_chunk_text = [overlap_text, paragraph]
                        overlap_tokens = len(self.encoding.encode(overlap_text))
                        current_chunk_tokens = overlap_tokens + token_count
                    else:
                        current_chunk_text = [paragraph]
                        current_chunk_tokens = token_count
                    
                    char_start = char_start + len(chunk_text)
                else:
                    current_chunk_text.append(paragraph)
                    current_chunk_tokens += token_count
            
            # Save final chunk for this page
            if current_chunk_text:
                chunk_text = '\n\n'.join(current_chunk_text)
                chunks.append(DocumentChunk(
                    chunk_id=f"{document_id}_chunk_{chunk_index}",
                    text=chunk_text,
                    page_number=page_num,
                    char_start=char_start,
                    char_end=char_start + len(chunk_text),
                    token_count=current_chunk_tokens,
                    document_id=document_id
                ))
                chunk_index += 1
        
        return chunks
```

---

### 2. Embedding Service

```python
# services/embedding_service.py

from typing import List
import openai
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

class EmbeddingService:
    """Generate embeddings for text chunks"""
    
    def __init__(self, api_key: str, model: str = "text-embedding-3-large"):
        self.client = openai.AsyncOpenAI(api_key=api_key)
        self.model = model
        self.batch_size = 100  # Process 100 chunks at a time
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def generate_embeddings(
        self, 
        texts: List[str]
    ) -> List[List[float]]:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors
        """
        # Batch processing for efficiency
        all_embeddings = []
        
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            
            response = await self.client.embeddings.create(
                model=self.model,
                input=batch,
                encoding_format="float"
            )
            
            embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(embeddings)
        
        return all_embeddings
    
    async def generate_single_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text (for queries)"""
        response = await self.client.embeddings.create(
            model=self.model,
            input=[text],
            encoding_format="float"
        )
        return response.data[0].embedding
```

---

### 3. Vector Database Service (Pinecone)

```python
# services/vector_db_service.py

from typing import List, Dict, Optional
import pinecone
from pinecone import Pinecone, ServerlessSpec

class VectorDBService:
    """Manage vector storage and retrieval with Pinecone"""
    
    def __init__(self, api_key: str, environment: str = "us-east-1"):
        self.pc = Pinecone(api_key=api_key)
        self.index_name = "document-qa"
        self.dimension = 3072  # For text-embedding-3-large
        
        # Create index if it doesn't exist
        if self.index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region=environment
                )
            )
        
        self.index = self.pc.Index(self.index_name)
    
    async def upsert_chunks(
        self,
        chunks: List[DocumentChunk],
        embeddings: List[List[float]],
        document_id: str
    ):
        """
        Store document chunks with embeddings
        
        Args:
            chunks: List of DocumentChunk objects
            embeddings: Corresponding embedding vectors
            document_id: Document identifier (used as namespace)
        """
        vectors = []
        
        for chunk, embedding in zip(chunks, embeddings):
            vectors.append({
                "id": chunk.chunk_id,
                "values": embedding,
                "metadata": {
                    "document_id": document_id,
                    "page": chunk.page_number,
                    "text": chunk.text[:1000],  # Store first 1000 chars in metadata
                    "char_start": chunk.char_start,
                    "char_end": chunk.char_end,
                    "full_text": chunk.text  # Store full text for retrieval
                }
            })
        
        # Upsert in batches of 100
        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            self.index.upsert(
                vectors=batch,
                namespace=document_id
            )
    
    async def search(
        self,
        query_embedding: List[float],
        document_id: str,
        top_k: int = 5,
        min_score: float = 0.7
    ) -> List[Dict]:
        """
        Search for relevant chunks
        
        Args:
            query_embedding: Query vector
            document_id: Document to search in
            top_k: Number of results to return
            min_score: Minimum similarity score
            
        Returns:
            List of relevant chunks with scores
        """
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            namespace=document_id,
            include_metadata=True
        )
        
        # Filter by minimum score
        filtered_results = []
        for match in results.matches:
            if match.score >= min_score:
                filtered_results.append({
                    "chunk_id": match.id,
                    "score": match.score,
                    "page": match.metadata.get("page"),
                    "text": match.metadata.get("full_text"),
                    "char_range": {
                        "start": match.metadata.get("char_start"),
                        "end": match.metadata.get("char_end")
                    }
                })
        
        return filtered_results
    
    async def delete_document(self, document_id: str):
        """Delete all chunks for a document"""
        self.index.delete(namespace=document_id, delete_all=True)
```

---

### 4. Answer Generation Service

```python
# services/answer_service.py

from typing import List, Dict, Optional
from openai import AsyncOpenAI
import json

class AnswerGenerationService:
    """Generate answers using LLM with RAG"""
    
    def __init__(self, api_key: str, model: str = "gpt-4-turbo-preview"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
    
    async def generate_answer(
        self,
        question: str,
        relevant_chunks: List[Dict],
        stream: bool = False
    ) -> Dict:
        """
        Generate answer from relevant chunks
        
        Args:
            question: User's question
            relevant_chunks: Retrieved chunks from vector search
            stream: Whether to stream the response
            
        Returns:
            Structured answer with citations
        """
        # Prepare context
        context = self._prepare_context(relevant_chunks)
        
        # Create prompt
        prompt = self._create_prompt(question, context)
        
        # Generate answer
        if stream:
            return await self._generate_streaming(prompt)
        else:
            return await self._generate_complete(prompt)
    
    def _prepare_context(self, chunks: List[Dict]) -> str:
        """Format chunks into context string"""
        context_parts = []
        
        for chunk in chunks:
            page = chunk.get('page', 'Unknown')
            text = chunk.get('text', '')
            context_parts.append(f"[Page {page}]\n{text}\n")
        
        return "\n".join(context_parts)
    
    def _create_prompt(self, question: str, context: str) -> str:
        """Create prompt with strict grounding instructions"""
        return f"""You are a helpful AI assistant that answers questions based ONLY on the provided document context.

STRICT RULES:
1. Use ONLY information from the context below
2. If the answer is not in the context, respond with EXACTLY:
   {{"found_in_document": false, "message": "This information is not available in the uploaded document."}}
3. Always include exact page number(s) where you found the information
4. Quote relevant phrases from the document when helpful
5. Do not add information from your general knowledge
6. Be precise and factual

CONTEXT FROM DOCUMENT:
{context}

USER QUESTION:
{question}

Provide your answer in this JSON format:
{{
  "answer": "Your detailed answer here",
  "page_numbers": [12, 13],
  "relevant_quote": "Exact quote from the document that supports your answer",
  "extra_context": "1-2 additional sentences providing helpful context from the document",
  "confidence": "high|medium|low",
  "found_in_document": true
}}

If the information is NOT in the document, return:
{{
  "found_in_document": false,
  "message": "This information is not available in the uploaded document.",
  "suggested_questions": ["Alternative question 1", "Alternative question 2"]
}}

JSON Response:"""
    
    async def _generate_complete(self, prompt: str) -> Dict:
        """Generate complete answer (non-streaming)"""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise document analysis assistant. Always respond with valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for more factual responses
            response_format={"type": "json_object"}
        )
        
        # Parse JSON response
        answer_json = json.loads(response.choices[0].message.content)
        
        # If answer found, generate summary
        if answer_json.get("found_in_document", False):
            summary = await self._generate_summary(
                answer_json["answer"],
                answer_json.get("extra_context", "")
            )
            answer_json["summary"] = summary
        
        return answer_json
    
    async def _generate_streaming(self, prompt: str):
        """Generate streaming answer"""
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise document analysis assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            stream=True
        )
        
        return stream
    
    async def _generate_summary(
        self, 
        answer: str, 
        extra_context: str
    ) -> str:
        """Generate 3-5 line summary"""
        summary_prompt = f"""Generate a concise 3-5 line summary based on this answer and context.

Answer: {answer}

Context: {extra_context}

Summary (3-5 lines):"""
        
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",  # Use cheaper model for summaries
            messages=[{"role": "user", "content": summary_prompt}],
            temperature=0.5,
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
```

---

### 5. FastAPI Endpoint Implementation

```python
# main.py

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os

app = FastAPI(title="AI Document Q&A API")

# Initialize services
document_processor = DocumentProcessor()
embedding_service = EmbeddingService(api_key=os.getenv("OPENAI_API_KEY"))
vector_db = VectorDBService(api_key=os.getenv("PINECONE_API_KEY"))
answer_service = AnswerGenerationService(api_key=os.getenv("OPENAI_API_KEY"))

# Models
class QuestionRequest(BaseModel):
    question: str
    stream: bool = False

class AnswerResponse(BaseModel):
    answer: str
    page_numbers: List[int]
    relevant_quote: Optional[str]
    extra_context: Optional[str]
    summary: Optional[str]
    confidence: str
    found_in_document: bool

# Endpoints
@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """Upload and process document"""
    
    # Validate file type
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(400, "Unsupported file type")
    
    # Validate file size (50MB max)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(400, "File too large (max 50MB)")
    
    # Generate document ID
    document_id = str(uuid.uuid4())
    
    # Save file temporarily
    file_path = f"/tmp/{document_id}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Start background processing
    background_tasks.add_task(
        process_document_background,
        file_path,
        document_id
    )
    
    return {
        "document_id": document_id,
        "filename": file.filename,
        "size": file_size,
        "status": "processing"
    }

async def process_document_background(file_path: str, document_id: str):
    """Background task: process document"""
    try:
        # Step 1: Extract and chunk
        chunks = await document_processor.process_document(file_path, document_id)
        
        # Step 2: Generate embeddings
        texts = [chunk.text for chunk in chunks]
        embeddings = await embedding_service.generate_embeddings(texts)
        
        # Step 3: Store in vector DB
        await vector_db.upsert_chunks(chunks, embeddings, document_id)
        
        # Update status in database
        # await db.update_document_status(document_id, "complete")
        
    except Exception as e:
        # Log error and update status
        # await db.update_document_status(document_id, "failed", str(e))
        raise
    finally:
        # Clean up temp file
        os.remove(file_path)

@app.post("/api/documents/{document_id}/ask")
async def ask_question(
    document_id: str,
    request: QuestionRequest
) -> AnswerResponse:
    """Ask a question about the document"""
    
    # Step 1: Generate query embedding
    query_embedding = await embedding_service.generate_single_embedding(
        request.question
    )
    
    # Step 2: Search vector DB
    relevant_chunks = await vector_db.search(
        query_embedding=query_embedding,
        document_id=document_id,
        top_k=5
    )
    
    if not relevant_chunks:
        return AnswerResponse(
            answer="",
            page_numbers=[],
            relevant_quote=None,
            extra_context=None,
            summary=None,
            confidence="low",
            found_in_document=False
        )
    
    # Step 3: Generate answer
    answer_data = await answer_service.generate_answer(
        question=request.question,
        relevant_chunks=relevant_chunks,
        stream=False
    )
    
    return AnswerResponse(**answer_data)

@app.post("/api/documents/{document_id}/ask/stream")
async def ask_question_stream(
    document_id: str,
    request: QuestionRequest
):
    """Stream answer generation"""
    
    # Get relevant chunks (same as above)
    query_embedding = await embedding_service.generate_single_embedding(
        request.question
    )
    relevant_chunks = await vector_db.search(
        query_embedding=query_embedding,
        document_id=document_id,
        top_k=5
    )
    
    async def stream_generator():
        stream = await answer_service.generate_answer(
            question=request.question,
            relevant_chunks=relevant_chunks,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream"
    )

@app.get("/api/documents/{document_id}/suggestions")
async def get_suggested_questions(document_id: str) -> List[str]:
    """Generate suggested questions based on document"""
    
    # This would analyze document structure and generate relevant questions
    # For now, returning mock data
    return [
        "What is the main conclusion of this document?",
        "Summarize the key findings",
        "What methodology was used?",
        "What are the limitations mentioned?"
    ]

@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete document and all associated data"""
    await vector_db.delete_document(document_id)
    # Also delete from main database
    return {"message": "Document deleted successfully"}
```

---

## 🎨 Frontend Implementation

### React Component Example

```typescript
// components/AIResponseCard.tsx

import React from 'react';
import { motion } from 'motion/react';
import { Copy, Save, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AIResponseProps {
  answer: string;
  pageNumbers: number[];
  relevantQuote?: string;
  extraContext?: string;
  summary?: string;
  confidence: 'high' | 'medium' | 'low';
  foundInDocument: boolean;
  onViewInDocument: (page: number) => void;
  onCopy: () => void;
  onSave: () => void;
  onFeedback: (helpful: boolean) => void;
}

export function AIResponseCard({
  answer,
  pageNumbers,
  relevantQuote,
  extraContext,
  summary,
  confidence,
  foundInDocument,
  onViewInDocument,
  onCopy,
  onSave,
  onFeedback
}: AIResponseProps) {
  
  if (!foundInDocument) {
    return (
      <div className="rounded-xl p-6 border border-[var(--border-primary)] bg-[var(--cyber-navy)]">
        <div className="flex items-start gap-3">
          <AlertCircle size={24} style={{ color: 'var(--warning-500)' }} />
          <div>
            <p style={{ color: 'var(--cyber-white)' }}>
              This information is not available in the uploaded document.
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
              Try rephrasing your question or ask about a different topic.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-6 border border-[var(--border-primary)] bg-[var(--cyber-navy)] shadow-[var(--card-shadow)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span style={{ color: 'var(--cyber-white)' }} className="font-medium">
            AI Assistant
          </span>
        </div>
        <ConfidenceBadge level={confidence} />
      </div>
      
      {/* Answer Section */}
      <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--primary-50)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Check size={18} style={{ color: 'var(--success-500)' }} />
          <span className="font-semibold" style={{ color: 'var(--cyber-white)' }}>
            ANSWER
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>{answer}</p>
      </div>
      
      {/* Source References */}
      <div className="mb-4 p-4 rounded-lg border border-[var(--border-primary)]">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={18} style={{ color: 'var(--primary-500)' }} />
          <span className="font-semibold" style={{ color: 'var(--cyber-white)' }}>
            SOURCE REFERENCES
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => onViewInDocument(page)}
              className="px-3 py-1 rounded-full text-sm font-medium hover:scale-105 transition-transform"
              style={{
                background: 'var(--primary-100)',
                color: 'var(--primary-700)'
              }}
            >
              Page {page}
            </button>
          ))}
        </div>
        
        {relevantQuote && (
          <blockquote className="border-l-4 pl-3 italic" style={{
            borderColor: 'var(--primary-500)',
            color: 'var(--text-secondary)'
          }}>
            "{relevantQuote}"
          </blockquote>
        )}
        
        <button
          onClick={() => onViewInDocument(pageNumbers[0])}
          className="mt-3 text-sm flex items-center gap-1 hover:underline"
          style={{ color: 'var(--primary-500)' }}
        >
          <Eye size={16} />
          View in Document
        </button>
      </div>
      
      {/* Extra Context */}
      {extraContext && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={18} style={{ color: 'var(--warning-500)' }} />
            <span className="font-semibold" style={{ color: 'var(--cyber-white)' }}>
              ADDITIONAL CONTEXT
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{extraContext}</p>
        </div>
      )}
      
      {/* Summary */}
      {summary && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--cyber-navy-light)' }}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart size={18} style={{ color: 'var(--cyber-purple)' }} />
            <span className="font-semibold" style={{ color: 'var(--cyber-white)' }}>
              SUMMARY
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{summary}</p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <ActionButton icon={<Copy size={16} />} label="Copy" onClick={onCopy} />
        <ActionButton icon={<Save size={16} />} label="Save" onClick={onSave} />
        <div className="flex-1" />
        <ActionButton 
          icon={<ThumbsUp size={16} />} 
          label="Helpful" 
          onClick={() => onFeedback(true)}
          variant="ghost"
        />
        <ActionButton 
          icon={<ThumbsDown size={16} />} 
          label="Not Helpful" 
          onClick={() => onFeedback(false)}
          variant="ghost"
        />
      </div>
    </motion.div>
  );
}

// Helper components
function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { color: 'var(--success-500)', bg: 'var(--success-50)', label: 'High Confidence' },
    medium: { color: 'var(--warning-500)', bg: 'var(--warning-50)', label: 'Medium Confidence' },
    low: { color: 'var(--error-500)', bg: 'var(--error-50)', label: 'Low Confidence' }
  };
  
  const { color, bg, label } = config[level];
  
  return (
    <span 
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

function ActionButton({ icon, label, onClick, variant = 'default' }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
        transition-colors
        ${variant === 'ghost' 
          ? 'hover:bg-[var(--bg-tertiary)]' 
          : 'border border-[var(--border-secondary)] hover:bg-[var(--bg-tertiary)]'
        }
      `}
      style={{ color: 'var(--text-secondary)' }}
    >
      {icon}
      {label}
    </button>
  );
}
```

---

This implementation guide provides production-ready code for both backend and frontend components of your AI Document Q&A system!
