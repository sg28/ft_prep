#!/usr/bin/env python3
"""
PDF to Markdown Converter - Optimized for LLM consumption
Extracts PDF content and converts to structured Markdown format.
Preserves chapters, headings, tables, and formatting while minimizing token usage.
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF not installed.")
    print("Install with: pip install pymupdf")
    sys.exit(1)

try:
    import pytesseract
    from PIL import Image
    import io
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


class PDFToMarkdownConverter:
    """Convert PDF to structured Markdown files optimized for LLMs."""

    def __init__(self, pdf_path: str, output_dir: str = None):
        """
        Initialize converter.

        Args:
            pdf_path: Path to PDF file
            output_dir: Output directory (defaults to pdf_name/ in same directory)
        """
        self.pdf_path = Path(pdf_path)
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        # Set output directory
        if output_dir:
            self.output_dir = Path(output_dir)
        else:
            self.output_dir = self.pdf_path.parent / self.pdf_path.stem.replace(' ', '-').lower()

        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.doc = fitz.open(pdf_path)
        self.toc = self.doc.get_toc()  # Table of contents

        # Detect if PDF is image-based (requires OCR)
        sample_text = self.doc[0].get_text().strip() if len(self.doc) > 0 else ""
        self.needs_ocr = len(sample_text) < 10 and OCR_AVAILABLE
        if self.needs_ocr:
            print("Detected image-based PDF. Using OCR (Tesseract) for text extraction.")
        elif len(sample_text) < 10 and not OCR_AVAILABLE:
            print("WARNING: PDF appears image-based but pytesseract is not installed.")
            print("Install with: pip install pytesseract  (also needs tesseract-ocr system package)")

    def extract_text_with_ocr(self, page) -> str:
        """Extract text from an image-based page using OCR."""
        # Render page to image at 300 DPI for good OCR quality
        mat = fitz.Matrix(300 / 72, 300 / 72)
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
        img_bytes = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_bytes))
        text = pytesseract.image_to_string(img, lang="eng")
        return text

    def extract_text_with_formatting(self, page) -> str:
        """Extract text from page preserving basic formatting."""
        if self.needs_ocr:
            return self.extract_text_with_ocr(page)

        blocks = page.get_text("dict")["blocks"]
        text_parts = []

        for block in blocks:
            if block.get("type") == 0:  # Text block
                for line in block.get("lines", []):
                    line_text = ""
                    for span in line.get("spans", []):
                        text = span.get("text", "")
                        # Detect bold/italic from font name
                        font = span.get("font", "").lower()

                        if "bold" in font and "italic" in font:
                            text = f"***{text}***"
                        elif "bold" in font:
                            text = f"**{text}**"
                        elif "italic" in font:
                            text = f"*{text}*"

                        line_text += text

                    if line_text.strip():
                        text_parts.append(line_text)

        return "\n".join(text_parts)

    def detect_chapter_boundaries(self) -> List[Tuple[int, str, int]]:
        """
        Detect chapter boundaries from TOC or text patterns.

        Returns:
            List of (chapter_num, title, start_page)
        """
        chapters = []

        # Use TOC if available
        if self.toc:
            for i, (level, title, page_num) in enumerate(self.toc):
                if level == 1:  # Top-level chapters
                    chapters.append((len(chapters) + 1, title, page_num - 1))

        # Fallback: detect "Chapter X" patterns
        if not chapters:
            for page_num in range(len(self.doc)):
                page = self.doc[page_num]
                text = page.get_text()

                # Look for chapter patterns
                patterns = [
                    r'Chapter\s+(\d+|[IVXLC]+)[:\s]+(.*)',
                    r'^(\d+)\.\s+([A-Z][^\n]{10,60})$',
                    r'^([IVXLC]+)\.\s+([A-Z][^\n]{10,60})$'
                ]

                for pattern in patterns:
                    match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
                    if match:
                        chapters.append((len(chapters) + 1, match.group(0), page_num))
                        break

        return chapters

    def clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)

        # Fix common OCR/extraction issues
        text = re.sub(r'([a-z])- ([a-z])', r'\1\2', text)  # Fix hyphenation
        text = re.sub(r'([.!?])\s*\n([A-Z])', r'\1\n\n\2', text)  # Paragraph breaks

        # Remove page numbers (common patterns)
        text = re.sub(r'\n\d+\n', '\n', text)
        text = re.sub(r'\nPage \d+\n', '\n', text, flags=re.IGNORECASE)

        return text.strip()

    def convert_page_to_markdown(self, page_num: int) -> str:
        """Convert a single page to markdown."""
        page = self.doc[page_num]
        text = self.extract_text_with_formatting(page)
        text = self.clean_text(text)

        # Add page reference
        markdown = f"<!-- Page {page_num + 1} -->\n\n{text}\n\n"
        return markdown

    def create_metadata_file(self):
        """Create metadata file with book information."""
        metadata = f"""# {self.pdf_path.stem}

## Metadata

- **Source PDF**: {self.pdf_path.name}
- **Total Pages**: {len(self.doc)}
- **Extracted**: {self._get_timestamp()}

## Table of Contents

"""

        # Add TOC
        if self.toc:
            for level, title, page_num in self.toc:
                indent = "  " * (level - 1)
                metadata += f"{indent}- [{title}](#{self._slugify(title)}) (page {page_num})\n"

        # Save metadata
        output_path = self.output_dir / "00-metadata.md"
        output_path.write_text(metadata, encoding='utf-8')
        print(f"✓ Created metadata: {output_path.name}")

    def convert_to_chapters(self):
        """Convert PDF to chapter-based markdown files. Returns True if chapters were found."""
        chapters = self.detect_chapter_boundaries()

        if not chapters:
            print("No chapters detected. Creating single file...")
            self.convert_to_single_file()
            return False

        print(f"Detected {len(chapters)} chapters")

        for i, (chapter_num, title, start_page) in enumerate(chapters):
            # Determine end page
            end_page = chapters[i + 1][2] if i + 1 < len(chapters) else len(self.doc)

            # Extract chapter content
            content = f"# {title}\n\n"
            for page_num in range(start_page, end_page):
                content += self.convert_page_to_markdown(page_num)

            # Save chapter file
            filename = f"{chapter_num:02d}-{self._slugify(title)}.md"
            output_path = self.output_dir / filename
            output_path.write_text(content, encoding='utf-8')
            print(f"✓ Created chapter {chapter_num}: {filename}")

        return True

    def convert_to_single_file(self):
        """Convert entire PDF to a single markdown file."""
        print("Converting entire PDF to single markdown file...")

        content = f"# {self.pdf_path.stem}\n\n"

        for page_num in range(len(self.doc)):
            content += self.convert_page_to_markdown(page_num)
            if (page_num + 1) % 10 == 0:
                print(f"  Processed {page_num + 1}/{len(self.doc)} pages...")

        # Save full book
        output_path = self.output_dir / "full-book.md"
        output_path.write_text(content, encoding='utf-8')
        print(f"✓ Created full book: {output_path.name}")

    def convert(self, mode: str = "chapters"):
        """
        Run the conversion.

        Args:
            mode: 'chapters' (split by chapters) or 'single' (one file)
        """
        print(f"\n{'='*60}")
        print(f"Converting: {self.pdf_path.name}")
        print(f"Output: {self.output_dir}")
        print(f"Mode: {mode}")
        print(f"{'='*60}\n")

        # Create metadata
        self.create_metadata_file()

        # Convert based on mode
        if mode == "chapters":
            chapters_found = self.convert_to_chapters()
            # Only create a combined full-book if chapters were actually split
            if chapters_found:
                print("\nCreating combined full-book file...")
                self.convert_to_single_file()
        else:
            self.convert_to_single_file()

        print(f"\n✓ Conversion complete!")
        print(f"  Output directory: {self.output_dir}")
        print(f"  Files created: {len(list(self.output_dir.glob('*.md')))}")

        # Show token savings estimate
        pdf_size_mb = self.pdf_path.stat().st_size / (1024 * 1024)
        estimated_pdf_tokens = len(self.doc) * 1000  # Rough estimate

        total_md_size = sum(f.stat().st_size for f in self.output_dir.glob('*.md'))
        estimated_md_tokens = total_md_size // 4  # Rough estimate (4 bytes per token)

        savings = ((estimated_pdf_tokens - estimated_md_tokens) / estimated_pdf_tokens * 100)

        print(f"\n📊 Token Usage Estimate:")
        print(f"  PDF reading:      ~{estimated_pdf_tokens:,} tokens")
        print(f"  Markdown reading: ~{estimated_md_tokens:,} tokens")
        print(f"  Estimated savings: ~{savings:.0f}%")

        self.doc.close()

    @staticmethod
    def _slugify(text: str) -> str:
        """Convert text to URL-friendly slug."""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text[:50]  # Limit length

    @staticmethod
    def _get_timestamp() -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python pdf_to_markdown.py <pdf_file> [output_dir] [mode]")
        print("\nModes:")
        print("  chapters - Split into chapter files (default)")
        print("  single   - Single markdown file")
        print("\nExample:")
        print("  python pdf_to_markdown.py book.pdf ./output chapters")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    mode = sys.argv[3] if len(sys.argv) > 3 else "chapters"

    try:
        converter = PDFToMarkdownConverter(pdf_path, output_dir)
        converter.convert(mode=mode)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
