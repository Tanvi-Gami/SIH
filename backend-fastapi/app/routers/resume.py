from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.workflows.resume_analysis import run_resume_analysis

router = APIRouter(prefix="/ai/resume", tags=["resume"])


class ResumeAnalyzeRequest(BaseModel):
    student_id: str
    filename: str
    mime_type: str
    content_base64: str


@router.post("/analyze")
async def analyze_resume(payload: ResumeAnalyzeRequest):
    if not payload.content_base64:
        raise HTTPException(status_code=400, detail="content_base64 is required.")
    try:
        result = await run_resume_analysis(
            payload.student_id, payload.filename, payload.mime_type, payload.content_base64
        )
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {exc}")
    return result
