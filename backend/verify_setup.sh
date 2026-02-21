#!/bin/bash
################################################################################
# HACK HUNTERS - Backend Setup Verification Script
################################################################################
# This script verifies that the backend is properly configured and ready
# for production deployment.
#
# Usage:
#   chmod +x verify_setup.sh
#   ./verify_setup.sh
################################################################################

set -e  # Exit on error

echo ""
echo "========================================================================"
echo "HACK HUNTERS - Backend Setup Verification"
echo "========================================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ERRORS=0
WARNINGS=0

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo "  → $1"
}

# ============================================================================
# 1. Check Python Version
# ============================================================================
echo "1. Checking Python version..."

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    
    if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 10 ] && [ "$PYTHON_MINOR" -le 11 ]; then
        print_success "Python $PYTHON_VERSION (recommended: 3.10 or 3.11)"
    elif [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 12 ]; then
        print_warning "Python $PYTHON_VERSION (may have compatibility issues, use 3.10 or 3.11)"
    else
        print_error "Python $PYTHON_VERSION (requires 3.10 or 3.11)"
    fi
else
    print_error "Python 3 not found in PATH"
fi

echo ""

# ============================================================================
# 2. Check Virtual Environment
# ============================================================================
echo "2. Checking virtual environment..."

if [ -n "$VIRTUAL_ENV" ]; then
    print_success "Virtual environment active: $VIRTUAL_ENV"
elif [ -d "venv" ]; then
    print_warning "Virtual environment exists but not activated"
    print_info "Run: source venv/bin/activate"
else
    print_warning "No virtual environment found"
    print_info "Run: python3 -m venv venv && source venv/bin/activate"
fi

echo ""

# ============================================================================
# 3. Check Python Packages
# ============================================================================
echo "3. Checking Python packages..."

check_package() {
    if python3 -c "import $2" 2>/dev/null; then
        print_success "$1 installed"
    else
        print_error "$1 not installed"
        print_info "Run: pip install -r requirements.txt"
    fi
}

check_package "FastAPI" "fastapi"
check_package "LangChain" "langchain"
check_package "Pinecone" "pinecone"
check_package "Google GenAI" "google.generativeai"
check_package "PyPDF2" "PyPDF2"
check_package "python-docx" "docx"
check_package "pdfplumber" "pdfplumber"
check_package "pytesseract" "pytesseract"
check_package "pdf2image" "pdf2image"
check_package "Pillow" "PIL"

echo ""

# ============================================================================
# 4. Check System Dependencies
# ============================================================================
echo "4. Checking system dependencies..."

# Check Tesseract
if command -v tesseract &> /dev/null; then
    TESSERACT_VERSION=$(tesseract --version 2>&1 | head -n1)
    print_success "Tesseract OCR: $TESSERACT_VERSION"
    
    # Check English language data
    if tesseract --list-langs 2>&1 | grep -q "eng"; then
        print_success "Tesseract English language data installed"
    else
        print_warning "Tesseract missing 'eng' language data"
        print_info "Ubuntu/Debian: sudo apt-get install tesseract-ocr-eng"
        print_info "macOS: brew install tesseract"
    fi
else
    print_warning "Tesseract OCR not found (OCR for scanned PDFs will not work)"
    print_info "Ubuntu/Debian: sudo apt-get install tesseract-ocr"
    print_info "macOS: brew install tesseract"
fi

# Check Poppler Utils
if command -v pdfinfo &> /dev/null; then
    POPPLER_VERSION=$(pdfinfo -v 2>&1 | head -n1)
    print_success "Poppler Utils: $POPPLER_VERSION"
else
    print_warning "Poppler Utils not found (pdf2image conversion will not work)"
    print_info "Ubuntu/Debian: sudo apt-get install poppler-utils"
    print_info "macOS: brew install poppler"
fi

echo ""

# ============================================================================
# 5. Check Environment Configuration
# ============================================================================
echo "5. Checking environment configuration..."

if [ -f ".env" ]; then
    print_success ".env file exists"
    
    # Check critical environment variables
    if grep -q "GOOGLE_API_KEY=.*[^=]" .env 2>/dev/null; then
        print_success "GOOGLE_API_KEY configured"
    else
        print_error "GOOGLE_API_KEY not set in .env"
        print_info "Get key from: https://makersuite.google.com/app/apikey"
    fi
    
    if grep -q "PINECONE_API_KEY=.*[^=]" .env 2>/dev/null; then
        print_success "PINECONE_API_KEY configured"
    else
        print_error "PINECONE_API_KEY not set in .env"
        print_info "Get key from: https://app.pinecone.io/"
    fi
    
    if grep -q "PINECONE_INDEX_NAME=.*[^=]" .env 2>/dev/null; then
        print_success "PINECONE_INDEX_NAME configured"
    else
        print_error "PINECONE_INDEX_NAME not set in .env"
    fi
else
    print_error ".env file not found"
    print_info "Create .env file with API keys (see DEPLOYMENT_GUIDE.md)"
fi

echo ""

# ============================================================================
# 6. Check Upload Directory
# ============================================================================
echo "6. Checking upload directory..."

UPLOAD_DIR="./uploads"
if [ -d "$UPLOAD_DIR" ]; then
    print_success "Upload directory exists: $UPLOAD_DIR"
    
    # Check if writable
    if [ -w "$UPLOAD_DIR" ]; then
        print_success "Upload directory is writable"
    else
        print_error "Upload directory is not writable"
        print_info "Run: chmod 755 $UPLOAD_DIR"
    fi
else
    print_info "Upload directory will be created automatically"
fi

echo ""

# ============================================================================
# 7. Run Python System Check
# ============================================================================
echo "7. Running comprehensive system check..."
echo ""

if [ -f "utils/system_check.py" ]; then
    if python3 -m utils.system_check; then
        print_success "Comprehensive system check passed"
    else
        print_warning "Some system checks failed (see details above)"
    fi
else
    print_warning "System check script not found: utils/system_check.py"
fi

echo ""

# ============================================================================
# 8. Summary
# ============================================================================
echo "========================================================================"
echo "VERIFICATION SUMMARY"
echo "========================================================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo ""
    echo "Your backend is ready for production deployment!"
    echo ""
    echo "Next steps:"
    echo "  1. Start server: uvicorn main:app --reload"
    echo "  2. Test upload: python test_document_processing.py"
    echo "  3. API docs: http://localhost:8000/docs"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ PASSED WITH WARNINGS${NC}"
    echo ""
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Your backend will work but some features may be limited."
    echo "OCR for scanned PDFs requires Tesseract and Poppler."
    echo ""
    exit 0
else
    echo -e "${RED}✗ VERIFICATION FAILED${NC}"
    echo ""
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Please fix the errors above before deploying."
    echo "See DEPLOYMENT_GUIDE.md for detailed installation instructions."
    echo ""
    exit 1
fi
