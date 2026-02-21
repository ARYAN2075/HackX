"""
=============================================================================
HACK HUNTERS - System Dependency Checker
=============================================================================
Validates that all required system dependencies for document processing
are installed and properly configured.

Checks:
    - Python packages (pdfplumber, pytesseract, pdf2image, etc.)
    - System binaries (tesseract-ocr, poppler-utils)
    - OCR language data

Usage:
    python -m utils.system_check
=============================================================================
"""

import logging
import sys
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)


class SystemCheckResult:
    """Encapsulates the result of a system dependency check."""
    
    def __init__(self):
        self.checks = []
        self.warnings = []
        self.errors = []
        self.all_passed = True
    
    def add_check(self, name: str, passed: bool, message: str, critical: bool = True):
        """Add a check result."""
        status = "✓" if passed else "✗"
        self.checks.append({
            "name": name,
            "passed": passed,
            "message": message,
            "critical": critical,
            "status": status,
        })
        
        if not passed:
            if critical:
                self.errors.append(f"{status} {name}: {message}")
                self.all_passed = False
            else:
                self.warnings.append(f"⚠ {name}: {message}")
    
    def print_report(self):
        """Print a formatted report of all checks."""
        print("\n" + "=" * 70)
        print("HACK HUNTERS - System Dependency Check Report")
        print("=" * 70)
        
        for check in self.checks:
            print(f"{check['status']} {check['name']}")
            if not check['passed']:
                print(f"  → {check['message']}")
        
        print("\n" + "-" * 70)
        
        if self.warnings:
            print("\n⚠ WARNINGS:")
            for warning in self.warnings:
                print(f"  {warning}")
        
        if self.errors:
            print("\n✗ ERRORS:")
            for error in self.errors:
                print(f"  {error}")
            print("\n💡 INSTALLATION GUIDE:")
            print_installation_guide()
        
        print("\n" + "=" * 70)
        
        if self.all_passed:
            print("✓ ALL CHECKS PASSED - System is ready for document processing!")
        else:
            print("✗ SOME CHECKS FAILED - Please install missing dependencies.")
        
        print("=" * 70 + "\n")
        
        return self.all_passed


def check_python_package(package_name: str, import_name: str = None) -> tuple[bool, str]:
    """Check if a Python package is installed."""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        return True, f"Python package '{package_name}' is installed"
    except ImportError:
        return False, f"Python package '{package_name}' is NOT installed. Run: pip install {package_name}"


def check_system_binary(binary_name: str, check_cmd: list[str] = None) -> tuple[bool, str]:
    """Check if a system binary is installed."""
    if check_cmd is None:
        check_cmd = [binary_name, "--version"]
    
    try:
        result = subprocess.run(
            check_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
        )
        if result.returncode == 0:
            version = result.stdout.decode().strip().split("\n")[0]
            return True, f"System binary '{binary_name}' is installed: {version}"
        else:
            return False, f"System binary '{binary_name}' returned non-zero exit code"
    except FileNotFoundError:
        return False, f"System binary '{binary_name}' is NOT found in PATH"
    except subprocess.TimeoutExpired:
        return False, f"System binary '{binary_name}' check timed out"
    except Exception as e:
        return False, f"System binary '{binary_name}' check failed: {e}"


def check_tesseract_languages() -> tuple[bool, str]:
    """Check if Tesseract has English language data installed."""
    try:
        result = subprocess.run(
            ["tesseract", "--list-langs"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
        )
        
        if result.returncode == 0:
            output = result.stdout.decode().strip()
            languages = [line.strip() for line in output.split("\n")[1:]]  # Skip header
            
            if "eng" in languages:
                return True, f"Tesseract English language data is installed (Languages: {', '.join(languages)})"
            else:
                return False, f"Tesseract is installed but missing 'eng' language data. Available: {', '.join(languages)}"
        else:
            return False, "Could not retrieve Tesseract language list"
    
    except Exception as e:
        return False, f"Could not check Tesseract languages: {e}"


def run_system_check() -> SystemCheckResult:
    """
    Run all system dependency checks.
    
    Returns:
        SystemCheckResult object with all check results.
    """
    result = SystemCheckResult()
    
    # ── Core Python Packages ──
    result.add_check("FastAPI", *check_python_package("fastapi"))
    result.add_check("LangChain", *check_python_package("langchain"))
    result.add_check("Pinecone", *check_python_package("pinecone"))
    result.add_check("Google GenAI", *check_python_package("google-generativeai", "google.generativeai"))
    
    # ── Document Processing Packages ──
    result.add_check("PyPDF2", *check_python_package("PyPDF2"))
    result.add_check("python-docx", *check_python_package("python-docx", "docx"))
    result.add_check("pdfplumber", *check_python_package("pdfplumber"), critical=False)
    
    # ── OCR Dependencies (Python) ──
    result.add_check("pytesseract", *check_python_package("pytesseract"), critical=False)
    result.add_check("pdf2image", *check_python_package("pdf2image"), critical=False)
    result.add_check("Pillow", *check_python_package("Pillow", "PIL"), critical=False)
    
    # ── System Binaries ──
    tesseract_passed, tesseract_msg = check_system_binary("tesseract")
    result.add_check("Tesseract OCR (system)", tesseract_passed, tesseract_msg, critical=False)
    
    if tesseract_passed:
        # Only check languages if tesseract is installed
        result.add_check("Tesseract English Data", *check_tesseract_languages(), critical=False)
    
    # Check for poppler-utils (required by pdf2image)
    poppler_passed, poppler_msg = check_system_binary("pdfinfo")
    result.add_check("Poppler Utils (system)", poppler_passed, poppler_msg, critical=False)
    
    return result


def print_installation_guide():
    """Print installation instructions for missing dependencies."""
    print("""
    ┌────────────────────────────────────────────────────────────────┐
    │ INSTALLATION GUIDE                                             │
    └────────────────────────────────────────────────────────────────┘
    
    ▸ Python Packages (all):
      pip install -r requirements.txt
    
    ▸ Tesseract OCR (Ubuntu/Debian):
      sudo apt-get update
      sudo apt-get install -y tesseract-ocr tesseract-ocr-eng
    
    ▸ Tesseract OCR (macOS):
      brew install tesseract
    
    ▸ Tesseract OCR (Windows):
      Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
      Add tesseract.exe to PATH
    
    ▸ Poppler Utils (Ubuntu/Debian):
      sudo apt-get install -y poppler-utils
    
    ▸ Poppler Utils (macOS):
      brew install poppler
    
    ▸ Poppler Utils (Windows):
      Download from: https://blog.alivate.com.au/poppler-windows/
      Add bin/ folder to PATH
    """)


if __name__ == "__main__":
    # Run when executed as script
    result = run_system_check()
    success = result.print_report()
    sys.exit(0 if success else 1)
