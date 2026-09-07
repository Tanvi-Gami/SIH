"""
AI provider abstraction.

    AIProvider
     ├── OpenAIProvider   (real LLM calls via LangChain's ChatOpenAI)
     └── MockAIProvider   (deterministic, heuristic reasoning over real data)

Every caller in this codebase talks to `get_ai_provider()` — never to OpenAI
directly — so the whole platform keeps working (with slightly less "smart"
but still genuinely data-driven output) when OPENAI_API_KEY is not set.
"""
import json
import re
from abc import ABC, abstractmethod
from typing import Any

from app.config import settings

KNOWN_SKILL_HINTS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Express.js", "FastAPI",
    "SQL", "PostgreSQL", "MongoDB", "Java", "C++", "Machine Learning", "Deep Learning",
    "NLP", "TensorFlow", "PyTorch", "Computer Vision", "Docker", "Kubernetes", "AWS",
    "Azure", "Linux", "Git", "Data Analysis", "Data Visualization", "Statistics",
    "Cybersecurity", "Networking", "System Design", "REST APIs", "HTML/CSS", "Tailwind CSS",
    "Communication", "Problem Solving", "Teamwork", "Leadership",
]


class AIProvider(ABC):
    name: str = "base"

    @abstractmethod
    async def extract_resume(self, text: str) -> dict[str, Any]:
        """Return {skills, projects, experience, certifications, education, career_roles}."""

    @abstractmethod
    async def explain_match(self, student_ctx: dict, opportunity_ctx: dict, breakdown: dict) -> str:
        """Human-friendly explanation of why an opportunity is/isn't a good match."""

    @abstractmethod
    async def generate_roadmap(self, student_ctx: dict, gap: dict) -> str:
        """A short, personalized career roadmap paragraph."""

    @abstractmethod
    async def chat_reply(self, message: str, context: dict, history: list[dict]) -> str:
        """Reply to a career-assistant chat message, grounded in `context` (tool outputs)."""


# ---------------------------------------------------------------------------
# Mock provider — no external API calls, fully deterministic, always available.
# ---------------------------------------------------------------------------
class MockAIProvider(AIProvider):
    name = "mock"

    async def extract_resume(self, text: str) -> dict[str, Any]:
        found_skills = [s for s in KNOWN_SKILL_HINTS if re.search(rf"\b{re.escape(s)}\b", text, re.IGNORECASE)]

        projects = []
        for line in text.splitlines():
            line = line.strip(" -•\t")
            if not line:
                continue
            if re.match(r"^(project|built|developed|created)\b", line, re.IGNORECASE) and len(line) < 140:
                projects.append(re.sub(r"^(project[:\s]*)", "", line, flags=re.IGNORECASE))

        experience = []
        for line in text.splitlines():
            line = line.strip(" -•\t")
            if re.search(r"\b(intern|engineer|developer|analyst)\b.*\bat\b", line, re.IGNORECASE) and len(line) < 160:
                experience.append(line)

        certifications = []
        for line in text.splitlines():
            line = line.strip(" -•\t")
            if line.isupper():
                continue  # skip section headers like "CERTIFICATIONS"
            if re.search(r"\bcertifi", line, re.IGNORECASE) and len(line) < 140:
                certifications.append(line)

        education = []
        for line in text.splitlines():
            line = line.strip(" -•\t")
            if re.search(r"\b(b\.?tech|m\.?tech|bachelor|master|university|institute of technology)\b", line, re.IGNORECASE) and len(line) < 160:
                education.append(line)

        # Very small rule-based role suggester based on which skill clusters are present.
        role_signals = {
            "Backend Developer": {"Node.js", "Express.js", "FastAPI", "SQL", "REST APIs"},
            "AI Engineer": {"Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch"},
            "Full Stack Developer": {"React", "JavaScript", "Node.js", "HTML/CSS"},
            "Data Analyst": {"SQL", "Data Analysis", "Data Visualization", "Statistics"},
            "Cloud Engineer": {"AWS", "Docker", "Kubernetes", "Azure"},
        }
        found_set = set(found_skills)
        career_roles = [role for role, sig in role_signals.items() if len(sig & found_set) >= 2]
        if not career_roles:
            career_roles = ["Software Developer"]

        return {
            "skills": found_skills or ["Python", "SQL"],
            "projects": projects[:5] or ["Personal project extracted from resume text"],
            "experience": experience[:5],
            "certifications": certifications[:5],
            "education": education[:3],
            "career_roles": career_roles[:3],
        }

    async def explain_match(self, student_ctx: dict, opportunity_ctx: dict, breakdown: dict) -> str:
        matched = breakdown.get("matched_skills", [])
        missing = breakdown.get("missing_skills", [])
        score = breakdown.get("score", 0)
        parts = [f"You are a {_strength_word(score)} match ({score}%) for {opportunity_ctx.get('title', 'this opportunity')}."]
        if matched:
            parts.append(f"You already have {', '.join(matched[:4])}, which directly aligns with what {opportunity_ctx.get('company_name', 'the company')} is looking for.")
        if student_ctx.get("career_goal") and student_ctx["career_goal"].lower() in (opportunity_ctx.get("title") or "").lower():
            parts.append(f"This also matches your stated career goal of {student_ctx['career_goal']}.")
        if missing:
            parts.append(f"Your main gap is {', '.join(missing[:3])} — consider a short course before applying to strengthen your profile.")
        else:
            parts.append("You meet all the listed required skills.")
        return " ".join(parts)

    async def generate_roadmap(self, student_ctx: dict, gap: dict) -> str:
        goal = student_ctx.get("career_goal") or "your target career"
        gaps = gap.get("gaps", [])
        strong = gap.get("strong", [])
        lines = [f"Roadmap towards {goal}:"]
        if strong:
            lines.append(f"You're already strong in {', '.join(s['skill'] for s in strong[:3])} — keep applying these in real projects.")
        if gaps:
            lines.append(f"Focus next on: {', '.join(g['skill'] for g in gaps[:4])}.")
            lines.append("Suggested order: start with the foundational gaps first, then the more advanced/specialized ones.")
        else:
            lines.append("You already cover the core required skills for this track — focus on deepening expertise and building portfolio projects.")
        return " ".join(lines)

    async def chat_reply(self, message: str, context: dict, history: list[dict]) -> str:
        msg = message.lower()
        profile = context.get("profile", {})
        gaps = context.get("skill_gaps", {}).get("gaps", [])
        recs_internships = context.get("internships", [])
        recs_courses = context.get("courses", [])
        name = profile.get("name", "there")

        if "missing" in msg or "gap" in msg or "learn" in msg or "improve" in msg:
            if gaps:
                gap_names = ", ".join(g["skill"] for g in gaps[:4])
                course_names = ", ".join(c["title"] for c in recs_courses[:3]) if recs_courses else "the recommended courses on your dashboard"
                return (f"Hi {name}, based on your profile the key skill gaps for {profile.get('career_goal', 'your target role')} are: "
                        f"{gap_names}. I'd recommend starting with {course_names}.")
            return f"Hi {name}, your current skills already cover the core requirements for {profile.get('career_goal', 'your target role')} well — nice work!"

        if "internship" in msg or "job" in msg or "opportunit" in msg or "shortlist" in msg or "recruit" in msg:
            if recs_internships:
                top = recs_internships[0]
                return (f"Based on your skills, {top.get('title')} at {top.get('company_name')} is currently your strongest match "
                        f"at {top.get('match_score')}%. You can find more on your Recommendations tab, each with a full explanation.")
            return "I couldn't find strong internship/job matches yet — try completing a skill assessment or uploading your resume so I have more to work with."

        if "resume" in msg:
            return ("For your resume: lead with quantified impact (e.g. 'reduced latency by 30%'), group skills by category, "
                    "and make sure every project lists the technologies you used — that's what powers your matching score here.")

        return (f"I can help with skill gaps, course recommendations, and job/internship matches for {profile.get('career_goal', 'your career goal')}. "
                "Try asking: 'What skills am I missing?' or 'Find internships suitable for me.'")


def _strength_word(score: int) -> str:
    if score >= 85:
        return "excellent"
    if score >= 70:
        return "strong"
    if score >= 50:
        return "moderate"
    return "early-stage"


# ---------------------------------------------------------------------------
# OpenAI provider — real LLM calls via LangChain.
# ---------------------------------------------------------------------------
class OpenAIProvider(AIProvider):
    name = "openai"

    def __init__(self):
        from langchain_openai import ChatOpenAI
        self.llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.3)
        self._fallback = MockAIProvider()

    async def _ask_json(self, system: str, user: str) -> dict:
        try:
            resp = await self.llm.ainvoke(
                [{"role": "system", "content": system + "\nRespond with ONLY valid JSON, no markdown fences."},
                 {"role": "user", "content": user}]
            )
            content = resp.content.strip()
            content = re.sub(r"^```json\s*|\s*```$", "", content.strip(), flags=re.MULTILINE)
            return json.loads(content)
        except Exception:
            return None

    async def extract_resume(self, text: str) -> dict[str, Any]:
        result = await self._ask_json(
            system=("You extract structured information from a student's resume for a career platform. "
                    "Return JSON with keys: skills (list[str]), projects (list[str]), experience (list[str]), "
                    "certifications (list[str]), education (list[str]), career_roles (list[str], 1-3 suggested job titles)."),
            user=text[:6000],
        )
        return result or await self._fallback.extract_resume(text)

    async def explain_match(self, student_ctx: dict, opportunity_ctx: dict, breakdown: dict) -> str:
        try:
            resp = await self.llm.ainvoke([
                {"role": "system", "content": ("You are a career platform assistant. Explain in 2-4 warm, specific sentences why a "
                                                "student is or isn't a good match for an opportunity, referencing their actual matched "
                                                "and missing skills. Do not invent skills not listed.")},
                {"role": "user", "content": json.dumps({"student": student_ctx, "opportunity": opportunity_ctx, "breakdown": breakdown})},
            ])
            return resp.content.strip()
        except Exception:
            return await self._fallback.explain_match(student_ctx, opportunity_ctx, breakdown)

    async def generate_roadmap(self, student_ctx: dict, gap: dict) -> str:
        try:
            resp = await self.llm.ainvoke([
                {"role": "system", "content": ("You are a career advisor. Write a concise (4-6 sentence) personalized roadmap for a "
                                                "student based on their current skills and skill gaps for their target career.")},
                {"role": "user", "content": json.dumps({"student": student_ctx, "gap": gap})},
            ])
            return resp.content.strip()
        except Exception:
            return await self._fallback.generate_roadmap(student_ctx, gap)

    async def chat_reply(self, message: str, context: dict, history: list[dict]) -> str:
        """
        Runs a LangGraph ReAct agent bound to student-scoped LangChain tools
        (get_my_profile, get_my_skill_gaps, search_internships, ...) so the
        model retrieves real platform data itself instead of relying on
        pre-stuffed context. Falls back to the deterministic mock reply if
        the agent errors out for any reason (e.g. no network).
        """
        try:
            from langgraph.prebuilt import create_react_agent
            from app.tools.langchain_tools import build_student_tools

            student_id = context.get("student_id")
            tools = build_student_tools(student_id) if student_id else []
            agent = create_react_agent(self.llm, tools=tools, prompt=(
                "You are the AI Career Assistant inside a student's dashboard on an industry-academia platform. "
                "Use the available tools to look up the student's real profile, skills, gaps, applications and "
                "opportunities before answering — never invent data. Keep answers concise (3-6 sentences) and specific."
            ))
            lc_messages = [{"role": h["role"], "content": h["content"]} for h in history[-6:]]
            lc_messages.append({"role": "user", "content": message})
            result = await agent.ainvoke({"messages": lc_messages}, config={"recursion_limit": 8})
            return result["messages"][-1].content.strip()
        except Exception:
            return await self._fallback.chat_reply(message, context, history)


_provider_instance: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = OpenAIProvider() if settings.ai_enabled else MockAIProvider()
    return _provider_instance
