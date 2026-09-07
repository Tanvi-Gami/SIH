from fastapi import APIRouter
from pydantic import BaseModel

from app.tools import data_tools
from app.services.ai_provider import get_ai_provider
from app.workflows.opportunity_recommendation import run_recommendations

router = APIRouter(prefix="/ai", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    student_id: str
    message: str
    history: list[ChatMessage] = []


@router.post("/chat")
async def chat(payload: ChatRequest):
    """
    AI Career Assistant. When OpenAI is configured, the underlying provider
    runs a LangGraph ReAct agent that calls LangChain tools itself; the
    `context` we assemble here is what powers the offline mock fallback so
    it never has to hallucinate — it always answers from real query results.
    """
    profile = await data_tools.get_student_profile(payload.student_id)
    skill_gaps = await data_tools.get_skill_gaps(payload.student_id, profile.get("career_goal"))
    try:
        internships = await run_recommendations(payload.student_id, "internship", limit=5)
    except Exception:
        internships = []
    courses = await data_tools.search_courses(limit=5)

    context = {
        "student_id": payload.student_id,
        "profile": profile,
        "skill_gaps": skill_gaps,
        "internships": internships,
        "courses": courses,
    }

    ai = get_ai_provider()
    reply = await ai.chat_reply(payload.message, context, [h.model_dump() for h in payload.history])
    return {"reply": reply, "provider": ai.name}
