from fastapi import APIRouter
from pydantic import BaseModel

from app.workflows.career_guidance import run_career_guidance

router = APIRouter(prefix="/ai", tags=["career-guidance"])


class CareerGuidanceRequest(BaseModel):
    student_id: str


@router.post("/career-guidance")
async def career_guidance(payload: CareerGuidanceRequest):
    return await run_career_guidance(payload.student_id)
