#!/usr/bin/env python3
"""
=============================================================================
HACK HUNTERS - Document Processing Test Suite
=============================================================================
Tests the document processing pipeline with various file types and edge cases.

Usage:
    python test_document_processing.py
    python test_document_processing.py --verbose
=============================================================================
"""

import argparse
import logging
import sys
from pathlib import Path
from io import BytesIO

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from utils.file_loader import (
    FileLoader,
    FileLoadError,
    UnsupportedFileTypeError,
    CorruptedFileError,
    PasswordProtectedError,
    EmptyDocumentError,
)

logger = logging.getLogger(__name__)


class TestResult:
    """Track test results."""
    
    def __init__(self):
        self.tests = []
        self.passed = 0
        self.failed = 0
        self.skipped = 0
    
    def add_test(self, name: str, passed: bool, message: str = "", skipped: bool = False):
        """Add a test result."""
        if skipped:
            status = "⊝ SKIP"
            self.skipped += 1
        elif passed:
            status = "✓ PASS"
            self.passed += 1
        else:
            status = "✗ FAIL"
            self.failed += 1
        
        self.tests.append({
            "name": name,
            "status": status,
            "message": message,
        })
    
    def print_report(self):
        """Print test report."""
        print("\n" + "=" * 70)
        print("HACK HUNTERS - Document Processing Test Report")
        print("=" * 70)
        
        for test in self.tests:
            print(f"{test['status']} {test['name']}")
            if test['message']:
                print(f"    → {test['message']}")
        
        print("\n" + "=" * 70)
        print(f"Total: {len(self.tests)} | Passed: {self.passed} | Failed: {self.failed} | Skipped: {self.skipped}")
        
        if self.failed == 0:
            print("✓ ALL TESTS PASSED")
        else:
            print("✗ SOME TESTS FAILED")
        
        print("=" * 70 + "\n")
        
        return self.failed == 0


def create_test_txt_file(content: str, path: Path) -> None:
    """Create a test TXT file."""
    path.write_text(content, encoding="utf-8")


def test_txt_valid(result: TestResult, test_dir: Path) -> None:
    """Test: Valid TXT file extraction."""
    test_file = test_dir / "valid.txt"
    content = "This is a valid text file with sufficient content for testing."
    
    try:
        create_test_txt_file(content, test_file)
        extracted = FileLoader.load(str(test_file))
        
        if extracted and len(extracted.strip()) >= 50:
            result.add_test(
                "TXT: Valid file extraction",
                True,
                f"Extracted {len(extracted)} characters"
            )
        else:
            result.add_test(
                "TXT: Valid file extraction",
                False,
                f"Expected ≥50 chars, got {len(extracted) if extracted else 0}"
            )
    except Exception as e:
        result.add_test("TXT: Valid file extraction", False, f"Exception: {e}")
    finally:
        test_file.unlink(missing_ok=True)


def test_txt_empty(result: TestResult, test_dir: Path) -> None:
    """Test: Empty TXT file handling."""
    test_file = test_dir / "empty.txt"
    
    try:
        create_test_txt_file("", test_file)
        
        try:
            FileLoader.load(str(test_file))
            result.add_test("TXT: Empty file detection", False, "Should raise EmptyDocumentError")
        except EmptyDocumentError:
            result.add_test("TXT: Empty file detection", True, "Correctly raised EmptyDocumentError")
        except Exception as e:
            result.add_test("TXT: Empty file detection", False, f"Wrong exception: {type(e).__name__}")
    
    except Exception as e:
        result.add_test("TXT: Empty file detection", False, f"Setup failed: {e}")
    finally:
        test_file.unlink(missing_ok=True)


def test_txt_insufficient(result: TestResult, test_dir: Path) -> None:
    """Test: TXT file with insufficient content."""
    test_file = test_dir / "short.txt"
    
    try:
        create_test_txt_file("Short", test_file)  # Less than 50 chars
        
        try:
            FileLoader.load(str(test_file))
            result.add_test(
                "TXT: Insufficient content detection",
                False,
                "Should raise EmptyDocumentError for <50 chars"
            )
        except EmptyDocumentError:
            result.add_test(
                "TXT: Insufficient content detection",
                True,
                "Correctly raised EmptyDocumentError"
            )
        except Exception as e:
            result.add_test(
                "TXT: Insufficient content detection",
                False,
                f"Wrong exception: {type(e).__name__}"
            )
    
    except Exception as e:
        result.add_test("TXT: Insufficient content detection", False, f"Setup failed: {e}")
    finally:
        test_file.unlink(missing_ok=True)


def test_unsupported_extension(result: TestResult, test_dir: Path) -> None:
    """Test: Unsupported file extension handling."""
    test_file = test_dir / "test.exe"
    
    try:
        test_file.write_bytes(b"fake executable")
        
        try:
            FileLoader.load(str(test_file))
            result.add_test(
                "Extension: Unsupported type rejection",
                False,
                "Should raise UnsupportedFileTypeError"
            )
        except UnsupportedFileTypeError:
            result.add_test(
                "Extension: Unsupported type rejection",
                True,
                "Correctly raised UnsupportedFileTypeError"
            )
        except Exception as e:
            result.add_test(
                "Extension: Unsupported type rejection",
                False,
                f"Wrong exception: {type(e).__name__}"
            )
    
    except Exception as e:
        result.add_test("Extension: Unsupported type rejection", False, f"Setup failed: {e}")
    finally:
        test_file.unlink(missing_ok=True)


def test_file_not_found(result: TestResult, test_dir: Path) -> None:
    """Test: Non-existent file handling."""
    test_file = test_dir / "nonexistent.txt"
    
    try:
        FileLoader.load(str(test_file))
        result.add_test("File: Not found detection", False, "Should raise FileLoadError")
    except FileLoadError as e:
        if "not found" in str(e).lower():
            result.add_test("File: Not found detection", True, "Correctly raised FileLoadError")
        else:
            result.add_test("File: Not found detection", False, f"Wrong error message: {e}")
    except Exception as e:
        result.add_test("File: Not found detection", False, f"Wrong exception: {type(e).__name__}")


def test_pdf_processing(result: TestResult, test_dir: Path) -> None:
    """Test: PDF processing (if test PDF exists)."""
    # This is a placeholder - in a real test, you'd have sample PDFs
    result.add_test(
        "PDF: Digital text extraction",
        True,
        "Manual test required - use real PDF file",
        skipped=True
    )
    
    result.add_test(
        "PDF: OCR fallback",
        True,
        "Manual test required - use scanned PDF",
        skipped=True
    )


def test_docx_processing(result: TestResult, test_dir: Path) -> None:
    """Test: DOCX processing (if test DOCX exists)."""
    result.add_test(
        "DOCX: Text extraction",
        True,
        "Manual test required - use real DOCX file",
        skipped=True
    )


def run_tests(verbose: bool = False) -> TestResult:
    """
    Run all document processing tests.
    
    Args:
        verbose: Enable verbose logging.
    
    Returns:
        TestResult object with all test results.
    """
    if verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.WARNING)
    
    # Create temporary test directory
    test_dir = Path(__file__).parent / "test_files"
    test_dir.mkdir(exist_ok=True)
    
    result = TestResult()
    
    try:
        print("\n🧪 Running Document Processing Tests...\n")
        
        # Run all tests
        test_txt_valid(result, test_dir)
        test_txt_empty(result, test_dir)
        test_txt_insufficient(result, test_dir)
        test_unsupported_extension(result, test_dir)
        test_file_not_found(result, test_dir)
        test_pdf_processing(result, test_dir)
        test_docx_processing(result, test_dir)
        
    finally:
        # Cleanup
        import shutil
        shutil.rmtree(test_dir, ignore_errors=True)
    
    return result


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Test document processing pipeline")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose logging")
    args = parser.parse_args()
    
    result = run_tests(verbose=args.verbose)
    success = result.print_report()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
