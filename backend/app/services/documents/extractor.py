try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
import os
import re
from pathlib import Path
from typing import Optional


class DocumentExtractor:
    """Extracts text content from PDF, DOCX, and PPTX files."""

    SUPPORTED_TYPES = {".pdf", ".docx", ".pptx", ".txt"}

    def extract(self, file_path: str) -> dict:
        """Extract content from a document file.
        
        Returns dict with:
            - text: full extracted text
            - pages: list of {page_number, text, headings}
            - metadata: {page_count, file_type, title}
        """
        ext = Path(file_path).suffix.lower()
        
        if ext == ".pdf":
            return self._extract_pdf(file_path)
        elif ext == ".docx":
            return self._extract_docx(file_path)
        elif ext == ".pptx":
            return self._extract_pptx(file_path)
        elif ext == ".txt":
            return self._extract_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def _extract_pdf(self, file_path: str) -> dict:
        """Extract text from PDF using PyMuPDF."""
        doc = fitz.open(file_path)
        pages = []
        full_text_parts = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            
            # Try to identify headings (lines that are short and possibly bold/larger)
            blocks = page.get_text("dict")["blocks"]
            headings = []
            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        line_text = "".join(span["text"] for span in line["spans"]).strip()
                        if line_text and len(line_text) < 100:
                            # Check for larger font size as heading indicator
                            max_size = max(span["size"] for span in line["spans"]) if line["spans"] else 12
                            if max_size > 14:
                                headings.append({
                                    "text": line_text,
                                    "level": 1 if max_size > 18 else 2,
                                    "font_size": max_size
                                })

            pages.append({
                "page_number": page_num + 1,
                "text": text.strip(),
                "headings": headings
            })
            full_text_parts.append(text.strip())

        doc.close()

        return {
            "text": "\n\n".join(full_text_parts),
            "pages": pages,
            "metadata": {
                "page_count": len(pages),
                "file_type": "pdf",
                "title": self._guess_title(pages)
            }
        }

    def _extract_docx(self, file_path: str) -> dict:
        """Extract text from Word document."""
        try:
            from docx import Document as DocxDocument
        except ImportError:
            raise ImportError("python-docx is required for DOCX extraction")

        doc = DocxDocument(file_path)
        pages = []
        current_page = {"page_number": 1, "text": "", "headings": []}
        
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            
            current_page["text"] += text + "\n"
            
            if para.style and para.style.name.startswith("Heading"):
                level = int(para.style.name.replace("Heading ", "")) if para.style.name != "Heading" else 1
                current_page["headings"].append({
                    "text": text,
                    "level": min(level, 3)
                })

        if current_page["text"]:
            pages.append(current_page)

        return {
            "text": "\n".join(p["text"] for p in pages),
            "pages": pages,
            "metadata": {
                "page_count": len(pages),
                "file_type": "docx",
                "title": self._guess_title(pages)
            }
        }

    def _extract_pptx(self, file_path: str) -> dict:
        """Extract text from PowerPoint."""
        try:
            from pptx import Presentation
        except ImportError:
            raise ImportError("python-pptx is required for PPTX extraction")

        prs = Presentation(file_path)
        pages = []

        for slide_num, slide in enumerate(prs.slides, 1):
            texts = []
            headings = []
            
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for para in shape.text_frame.paragraphs:
                        text = para.text.strip()
                        if text:
                            texts.append(text)
                
                if shape.has_text_frame and shape.shape_type == 13:  # Title
                    title_text = shape.text_frame.text.strip()
                    if title_text:
                        headings.append({"text": title_text, "level": 1})

            pages.append({
                "page_number": slide_num,
                "text": "\n".join(texts),
                "headings": headings
            })

        return {
            "text": "\n\n".join(p["text"] for p in pages),
            "pages": pages,
            "metadata": {
                "page_count": len(pages),
                "file_type": "pptx",
                "title": self._guess_title(pages)
            }
        }

    def _extract_txt(self, file_path: str) -> dict:
        """Extract text from plain text file."""
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()

        return {
            "text": text,
            "pages": [{"page_number": 1, "text": text, "headings": []}],
            "metadata": {
                "page_count": 1,
                "file_type": "txt",
                "title": Path(file_path).stem
            }
        }

    def _guess_title(self, pages: list) -> str:
        """Try to identify the document title from the first page."""
        if pages and pages[0]["headings"]:
            return pages[0]["headings"][0]["text"]
        if pages and pages[0]["text"]:
            first_line = pages[0]["text"].strip().split("\n")[0]
            if len(first_line) < 200:
                return first_line
        return "Untitled Document"


document_extractor = DocumentExtractor()
