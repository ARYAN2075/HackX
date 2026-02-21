# HACK HUNTERS - Smart Document Assistant Backend

## ⚡ Quick Start (Production-Ready)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install system dependencies (Ubuntu/Debian)
sudo apt-get install tesseract-ocr tesseract-ocr-eng poppler-utils

# 3. Run system check
python -m utils.system_check

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# 5. Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📚 Complete Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Full production deployment guide with OCR setup
- **[API Documentation](http://localhost:8000/docs)** - Interactive Swagger UI (after starting server)
- **Test Suite**: `python test_document_processing.py`
- **System Check**: `python -m utils.system_check`

---

## Setup & Installation

### Prerequisites

- Python 3.11+
- Google Cloud account with Gemini API access
- Pinecone account (free tier works)

### 1. Clone & Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys: