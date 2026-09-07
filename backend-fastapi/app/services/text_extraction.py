"""Extracts plain text from an uploaded resume (PDF, DOCX, or plain text)."""
import base64
import io


def extract_text_from_upload(content_base64: str, mime_type: str, filename: str) -> str:
    raw = base64.b64decode(content_base64)

    if mime_type == "application/pdf" or filename.lower().endswith(".pdf"):
        return _extract_pdf(raw)
    if mime_type in (
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ) or filename.lower().endswith((".docx", ".doc")):
        return _extract_docx(raw)

    try:
        return raw.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def _extract_pdf(raw: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(raw))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        return ""


def _extract_docx(raw: bytes) -> str:
    try:
        import docx
        document = docx.Document(io.BytesIO(raw))
        return "\n".join(p.text for p in document.paragraphs)
    except Exception:
        return ""
