# 🚀 HACK HUNTERS Backend - Production Deployment Guide

## 📋 Overview

This guide covers the complete setup and deployment of the HACK HUNTERS Smart Document Assistant backend with **production-grade document processing**, including OCR support for scanned PDFs.

---

## 🎯 Document Processing Architecture

### 3-Stage PDF Extraction Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    PDF UPLOAD                                 │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 0: Preflight Check                                    │
│  • Detect password protection                                │
│  • Validate file integrity                                   │
│  • Check page count > 0                                      │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 1: PyPDF2 (Fast Digital Text Extraction)             │
│  • Extracts native text from digital PDFs                    │
│  • Success if ≥ 50 characters extracted ✓                   │
└──────────────────┬───────────────────────────────────────────┘
                   │ (if < 50 chars)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 2: pdfplumber (Enhanced Layout Handling)             │
│  • Better handling of tables and complex layouts             │
│  • Extracts text + table content                            │
│  • Success if ≥ 50 characters extracted ✓                   │
└──────────────────┬───────────────────────────────────────────┘
                   │ (if < 50 chars)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Stage 3: OCR Pipeline (Scanned/Image-based PDFs)           │
│  • pdf2image: Convert PDF pages → PNG images (200 DPI)      │
│  • pytesseract: Run Tesseract OCR on each image             │
│  • Success if ≥ 50 characters extracted ✓                   │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
       ┌───────────┴────────────┐
       │  ✓ SUCCESS             │  ✗ FAIL
       │  Text extracted        │  EmptyDocumentError
       │  Continue to chunking  │  Return JSON error
       └────────────────────────┘
```

---

## 🛠️ System Requirements

### Operating System
- **Linux** (Ubuntu 20.04+ recommended)
- **macOS** (10.15+)
- **Windows** (10/11 with WSL2 recommended)

### Python
- **Version**: 3.10 or 3.11 (3.12 may have compatibility issues with some dependencies)

### System Dependencies (for OCR)
- **Tesseract OCR** (for scanned PDF support)
- **Poppler Utils** (for pdf2image conversion)

---

## 📦 Installation

### Step 1: Clone Repository & Navigate to Backend

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
# Linux/macOS
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 3: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Install System Dependencies

#### **Ubuntu/Debian**

```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng poppler-utils
```

#### **macOS (Homebrew)**

```bash
brew install tesseract poppler
```

#### **Windows**

1. **Tesseract OCR**:
   - Download installer: [Tesseract Windows](https://github.com/UB-Mannheim/tesseract/wiki)
   - Install to `C:\Program Files\Tesseract-OCR`
   - Add `C:\Program Files\Tesseract-OCR` to PATH
   - Verify: `tesseract --version`

2. **Poppler Utils**:
   - Download: [Poppler Windows](https://blog.alivate.com.au/poppler-windows/)
   - Extract to `C:\Program Files\poppler`
   - Add `C:\Program Files\poppler\bin` to PATH
   - Verify: `pdfinfo -v`

### Step 5: Verify System Setup

Run the system dependency checker:

```bash
python -m utils.system_check
```

**Expected Output**:
```
======================================================================
HACK HUNTERS - System Dependency Check Report
======================================================================
✓ FastAPI
✓ LangChain
✓ Pinecone
✓ Google GenAI
✓ PyPDF2
✓ python-docx
✓ pdfplumber
✓ pytesseract
✓ pdf2image
✓ Pillow
✓ Tesseract OCR (system)
✓ Tesseract English Data
✓ Poppler Utils (system)

======================================================================
✓ ALL CHECKS PASSED - System is ready for document processing!
======================================================================
```

---

## ⚙️ Configuration

### Step 6: Environment Variables

Create a `.env` file in the `/backend` directory:

```bash
# =============================================================================
# HACK HUNTERS - Backend Environment Configuration
# =============================================================================

# ── Application Settings ──
APP_HOST=0.0.0.0
APP_PORT=8000
LOG_LEVEL=INFO

# ── Google Gemini API ──
GOOGLE_API_KEY=your_google_gemini_api_key_here

# ── Pinecone Vector Database ──
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=keyurdon

# ── Document Processing ──
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50
ALLOWED_EXTENSIONS=pdf,docx,txt

# ── Embedding Model ──
EMBEDDING_MODEL=models/embedding-001
EMBEDDING_DIMENSION=768

# ── Text Chunking ──
CHUNK_SIZE=500
CHUNK_OVERLAP=100
```

### Important Notes:
- **GOOGLE_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **PINECONE_API_KEY**: Get from [Pinecone Console](https://app.pinecone.io/)
- **PINECONE_INDEX_NAME**: Must match your Pinecone index name (default: `keyurdon`)

---

## 🚀 Running the Backend

### Development Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode (with Gunicorn)

```bash
# Install gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t hackhunters-backend .
docker run -p 8000:8000 --env-file .env hackhunters-backend
```

---

## 🧪 Testing Document Processing

### Test with curl

```bash
# Upload a PDF
curl -X POST "http://localhost:8000/api/v1/upload" \
  -F "file=@test_document.pdf" \
  -F "user_id=test_user_123"

# Expected success response:
{
  "success": true,
  "message": "Document uploaded and processed successfully.",
  "data": {
    "document_id": "uuid-here",
    "file_name": "test_document.pdf",
    "num_chunks": 15,
    "total_characters": 12500,
    "status": "success"
  }
}
```

### Test with Python

```python
import requests

url = "http://localhost:8000/api/v1/upload"
files = {"file": open("test_document.pdf", "rb")}
data = {"user_id": "test_user_123"}

response = requests.post(url, files=files, data=data)
print(response.json())
```

---

## 🔧 Error Handling Reference

### Structured Error Responses

All document processing errors return clean JSON (never 500):

```json
{
  "success": false,
  "error": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE"
}
```

### Error Codes

| Error Code | Description | Status Code |
|-----------|-------------|-------------|
| `UNSUPPORTED_FILE_TYPE` | File extension not in [pdf, docx, txt] | 400 |
| `PASSWORD_PROTECTED` | PDF/DOCX is password-protected | 400 |
| `CORRUPTED_FILE` | File appears to be corrupted | 400 |
| `EMPTY_DOCUMENT` | No extractable text (< 50 chars) | 400 |
| `INSUFFICIENT_CONTENT` | Text too short for meaningful analysis | 400 |
| `EMPTY_CHUNKS` | Chunking produced no usable text | 400 |
| `EMBEDDING_FAILED` | Embedding generation failed | 400 |
| `PINECONE_SERVICE_ERROR` | Vector DB unavailable | 400 |
| `SERVICE_UNAVAILABLE` | Backend service not initialized | 503 |

---

## 📊 Monitoring & Logging

### Log Levels

Logs are written to stdout in structured format:

```
2024-02-21 10:30:45 | INFO     | services.document_processor | [uuid] Processing document: file='example.pdf'
2024-02-21 10:30:46 | INFO     | utils.file_loader           | PDF extraction starting: example.pdf
2024-02-21 10:30:47 | INFO     | utils.file_loader           | PDF 'example.pdf': PyPDF2 extracted 5234 chars (stage 1).
2024-02-21 10:30:48 | INFO     | services.document_processor | [uuid] Created 12 chunks.
```

### Key Log Markers

- `[uuid] Processing document:` - Upload started
- `PDF extraction starting:` - Text extraction started
- `PyPDF2 extracted X chars (stage 1)` - Stage 1 success
- `pdfplumber extracted X chars (stage 2)` - Stage 2 success
- `OCR extracted X chars (stage 3)` - Stage 3 success
- `Created X chunks` - Chunking complete
- `Generated X embeddings` - Embeddings complete
- `Stored X vectors` - Pinecone upsert complete

---

## 🛡️ Production Hardening

### 1. Resource Limits

Update `config.py`:

```python
MAX_FILE_SIZE_MB = 50  # Prevent DoS via large files
CHUNK_SIZE = 500       # Balance between context and performance
```

### 2. Rate Limiting (with Redis)

```bash
pip install slowapi redis
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/v1/upload")
@limiter.limit("10/minute")  # Max 10 uploads per minute per IP
async def upload_document(...):
    ...
```

### 3. CORS Configuration

For production, restrict origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://app.yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)
```

### 4. Health Checks

Monitor `/health` endpoint:

```bash
curl http://localhost:8000/health
```

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

---

## 🐛 Troubleshooting

### Issue: "Text extraction failed" error

**Diagnosis**:
1. Check logs for which extraction stage failed
2. Run system check: `python -m utils.system_check`
3. Verify file is not corrupted: Try opening in PDF viewer
4. Check if PDF is password-protected

**Solutions**:
- If Stage 3 (OCR) fails: Install Tesseract + Poppler
- If all stages fail but file opens fine: File may be image-only scanned PDF without OCR layer

### Issue: "OCR dependencies not installed"

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr poppler-utils

# macOS
brew install tesseract poppler

# Windows
# Install manually (see Step 4 above)
```

### Issue: Slow PDF processing

**Causes**:
- Large PDFs (> 100 pages)
- OCR fallback (slow by design)

**Solutions**:
- Set page limit in `file_loader.py` (default: no limit)
- Use digital PDFs instead of scanned
- Increase server resources

### Issue: "Pinecone service unavailable"

**Check**:
1. API key is valid: `echo $PINECONE_API_KEY`
2. Index exists: Log into Pinecone Console
3. Index name matches `.env`: `PINECONE_INDEX_NAME=keyurdon`

---

## 📚 API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔐 Security Checklist

- [ ] Environment variables in `.env` (not committed to Git)
- [ ] CORS restricted to known origins
- [ ] Rate limiting enabled
- [ ] File size limits enforced
- [ ] Input validation on all endpoints
- [ ] Structured error responses (no stack traces leaked)
- [ ] Uploaded files stored outside web root
- [ ] Regular security updates: `pip install --upgrade -r requirements.txt`

---

## 📞 Support

For issues, check logs and run diagnostics:

```bash
# System check
python -m utils.system_check

# Test endpoint
curl http://localhost:8000/health

# View logs
tail -f logs/app.log  # if logging to file
```

---

## ✅ Production Deployment Checklist

- [ ] Python 3.10/3.11 installed
- [ ] Virtual environment created
- [ ] All Python packages installed (`requirements.txt`)
- [ ] Tesseract OCR installed and in PATH
- [ ] Poppler utils installed and in PATH
- [ ] System check passes (`python -m utils.system_check`)
- [ ] `.env` file configured with valid API keys
- [ ] Pinecone index created and accessible
- [ ] Google Gemini API key valid and has quota
- [ ] Upload directory writable (`UPLOAD_DIR`)
- [ ] Backend starts without errors (`uvicorn main:app`)
- [ ] Health check returns `healthy` status
- [ ] Test upload succeeds
- [ ] CORS configured for frontend domain
- [ ] Rate limiting enabled (optional)
- [ ] Monitoring/logging configured
- [ ] Backups configured for uploaded files
- [ ] SSL/TLS certificate configured (production)

---

**🎉 You're ready for production document processing!**
