# Skillbridge — Industry-Academia-Student Ecosystem

**Smart India Hackathon — Problem Statement 26SIH044**

An AI-powered employability and industry-academia ecosystem connecting **students**, **faculty**, **institutions**
and **industry** in one platform, built around a single continuous loop:

```
Assess → Analyze → Learn → Match → Apply → Recruit → Measure → Improve
```

---

## 1. Problem being solved

Students don't know what skills they have, what industry actually demands, or which opportunities and learning
paths are right for them. Institutions lack visibility into student skill levels and industry demand. Industries
struggle to discover and evaluate the right candidates. Faculty have no unified channel to industry collaboration,
FDPs, or research opportunities. Skillbridge connects all four stakeholders through one intelligent, explainable
recommendation engine.

## 2. Architecture

```
┌─────────────┐      REST/JSON      ┌───────────────────┐
│   React SPA │ ──────────────────► │  Express API      │
│  (Vite +    │ ◄────────────────── │  (auth, CRUD,      │
│  Tailwind)  │                     │  applications,     │
└─────────────┘                     │  analytics)        │
                                     └─────────┬─────────┘
                                               │ proxies AI calls
                                               ▼
                                     ┌───────────────────┐        ┌──────────────┐
                                     │  FastAPI service   │◄──────►│  PostgreSQL  │
                                     │  (LangChain +      │        │  (shared by  │
                                     │  LangGraph AI /    │        │  both APIs)  │
                                     │  recommendation     │        └──────────────┘
                                     │  engine)            │
                                     └─────────┬─────────┘
                                               │
                                     ┌─────────▼─────────┐
                                     │ OpenAI / Pinecone   │  (optional — mock
                                     │ (if keys present)   │   fallback otherwise)
                                     └────────────────────┘
```

- **Express** owns authentication, RBAC, all transactional CRUD (profiles, jobs, internships, applications,
  companies, faculty, institutions, documents, notifications) and proxies AI requests to FastAPI.
- **FastAPI** owns everything "intelligent": resume analysis, skill-gap analysis, the hybrid recommendation
  engine, semantic search, and the AI career assistant. It reads the same PostgreSQL database directly for
  fast, real, tool-grounded context (no hallucinated data).
- Both AI (`OpenAIProvider` / `MockAIProvider`) and vector search (`PineconeProvider` / `MockVectorProvider`)
  are behind clean abstractions, so **the whole platform runs fully offline** with zero API keys, and upgrades
  transparently to real OpenAI/Pinecone the moment keys are set.

## 3. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Axios |
| Backend (transactional) | Node.js, Express, PostgreSQL (`pg`), JWT, bcrypt, Multer |
| Backend (AI) | Python, FastAPI, asyncpg |
| AI orchestration | LangChain (tool calling), LangGraph (multi-step workflows), OpenAI (optional) |
| Vector search | Pinecone (optional) with a local TF-IDF fallback |
| Database | PostgreSQL |
| Infra | Docker, Docker Compose, GitHub Actions |

No technology outside this list was introduced.

## 4. Folder structure

```
sih-platform/
├── frontend/            React SPA (components/, pages/, layouts/, api/, context/, hooks/)
├── backend-express/     Express API (routes/, controllers/, services/, middleware/, db/)
├── backend-fastapi/     FastAPI AI service (routers/, services/, workflows/, tools/)
├── database/            schema.sql (source of truth for the Postgres schema) + seed.sql (demo data)
├── .github/workflows/   CI pipeline
├── docker-compose.yml
└── README.md
```

## 5. Environment variables

Each service has its own `.env.example`; a consolidated reference also lives at the repo root (`.env.example`).

```
DATABASE_URL           postgres connection string (shared by both backends)
JWT_SECRET              Express auth signing secret
FASTAPI_URL             Express → FastAPI base URL
CORS_ORIGIN             allowed frontend origin
OPENAI_API_KEY          optional — enables real LLM calls (LangChain/LangGraph agent)
OPENAI_MODEL            default: gpt-4o-mini
PINECONE_API_KEY        optional — enables real Pinecone vector search
PINECONE_INDEX          default: sih-platform
VITE_API_URL            frontend → Express base URL
```

**If `OPENAI_API_KEY` / `PINECONE_API_KEY` are unset, the platform automatically falls back to `MockAIProvider`
and `MockVectorProvider` — genuinely functional (not stubbed), just less "smart" than the real APIs.**

## 6. Running locally (without Docker)

### 6.1 Database

```bash
# any local Postgres 16+ works — or spin up just the DB via Docker:
docker compose up -d postgres
```

### 6.2 Express API

```bash
cd backend-express
cp .env.example .env        # edit DATABASE_URL if not using the default docker-compose port
npm install
npm run migrate             # applies database/schema.sql (idempotent)
npm run seed                # populates realistic demo data
npm run dev                 # http://localhost:5000
```

**Seeding demo data — two equivalent options:**

| Option | Command | When to use |
|---|---|---|
| Node seed script | `npm run seed` (from `backend-express/`) | Default — no extra tooling needed |
| Pure SQL seed | `psql "$DATABASE_URL" -f database/seed.sql` | No Node.js available, or seeding from a DB client/GUI directly |

Both produce the identical dataset (same users, companies, jobs, applications, etc. — see §8) and are
idempotent: each one `TRUNCATE`s the seeded tables and rebuilds them, so re-running is always safe.
`database/schema.sql` must be applied first either way (`npm run migrate` does this for you, or run
`psql "$DATABASE_URL" -f database/schema.sql` directly).

### 6.3 FastAPI AI service

```bash
cd backend-fastapi
cp .env.example .env
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000
```

### 6.4 Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173** and log in with any demo account below.

## 7. Running with Docker Compose

```bash
docker compose up -d --build
docker compose exec backend-express npm run seed   # one-time — seed truncates tables, so it's manual
```

(Or, without touching the container's Node install: `psql "postgres://sih_user:sih_password@localhost:5433/sih_platform" -f database/seed.sql` from the host.)

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Express API | http://localhost:5000 |
| FastAPI AI service | http://localhost:8000 |
| PostgreSQL | localhost:5433 (mapped from container's 5432) |

`docker compose down` to stop; add `-v` to also drop the Postgres volume.

## 8. Demo credentials

Password for every account: **`Demo@123`**

| Role | Email | Identity |
|---|---|---|
| Student | `student@demo.local` | Aarav Sharma — AI Engineer track |
| Industry | `industry@demo.local` | TechNova Solutions |
| Faculty | `faculty@demo.local` | Dr. Ananya Krishnan |
| Institution | `institution@demo.local` | Rashtriya Institute of Technology |

Additional seeded accounts (all same password) round out a realistic multi-company, multi-faculty demo:
`student2`–`student6@demo.local` (varied skills/branches/career goals), `recruiter2`–`recruiter5@demo.local`
(CloudSphere Systems, FinEdge Analytics, SecureNet Labs, NextGen Robotics), and `faculty2`–`faculty3@demo.local`
(Dr. Vikram Rao, Dr. Meera Nair).

## 9. API overview

```
/api/v1/auth/{register,login,me}
/api/v1/students/{profile,skills,projects,certifications,assessment,career-tracks,portfolio/:id}
/api/v1/jobs, /api/v1/internships, /api/v1/my-opportunities
/api/v1/applications/{,mine,applicants,funnel,:id/status}
/api/v1/companies/{,me/profile,me/candidates}
/api/v1/faculty/{profile,opportunities,applications}
/api/v1/institutions/{profile,students,analytics/*}
/api/v1/programs
/api/v1/documents/{upload,mine}
/api/v1/notifications
/api/v1/analytics/platform

/ai/resume/{analyze,confirm}
/ai/skill-gap
/ai/recommendations
/ai/match, /ai/match-preview
/ai/career-guidance
/ai/chat, /ai/chat/history
/ai/search
/ai/industry-skill-analysis
```

All responses use a consistent envelope: `{ success, data }` or `{ success: false, message, errors? }`.

## 10. The AI/recommendation pipeline

Implemented in `backend-fastapi/app/services/matching.py` + `app/workflows/opportunity_recommendation.py`
as a real LangGraph workflow:

```
get_student_profile → eligibility_filter → skill_matching → semantic_search (Pinecone/TF-IDF)
  → ranking (weighted) → generate_explanation (LLM/rule-based)
```

```
Final Match Score = 40% Skill Match + 25% Semantic Similarity + 15% Career Interest
                   + 10% Experience + 10% Eligibility
```

Weights are configurable in `app/config.py::MATCH_WEIGHTS`. Every recommendation surfaces its full breakdown,
matched/missing skills, and a plain-language explanation in the UI ("Why this matches you").

Two other LangGraph workflows exist: **Resume Analysis** (extract → compare against industry demand → generate
gaps/recommendations) and **Career Guidance** (profile → skills → goal → gap → learning programs → internships →
roadmap). The AI Career Assistant runs a LangGraph **ReAct agent** bound to student-scoped LangChain tools
(`get_my_profile`, `get_my_skill_gaps`, `search_internships`, …) when OpenAI is configured, falling back to the
same tool outputs fed into a deterministic responder otherwise.

## 11. Testing

```bash
# Express
cd backend-express && npm test

# FastAPI (DB-free unit tests: mock AI provider + matching engine)
cd backend-fastapi && source venv/bin/activate && pytest -v

# Frontend
cd frontend && npm run lint && npm run build
```

## 12. GitHub Actions

`.github/workflows/ci.yml` runs on every push/PR to `main`:
1. Frontend — install, lint, build
2. Express — install, migrate against an ephemeral Postgres service, run Jest tests
3. FastAPI — install, smoke-import the app, run pytest
4. Build all three Docker images

## 13. Security notes

JWT auth + bcrypt password hashing + role-based authorization middleware, `express-validator` input validation,
parameterized SQL everywhere (no string-concatenated queries), file-type/size-limited uploads, Helmet + CORS +
rate limiting on the Express API, and no secrets committed to source (`.env` is git-ignored; `.env.example`
files document every variable).

## 14. Future improvements

- Persist chat/agent conversation state per-session in LangGraph's checkpointer for true multi-turn memory.
- Real issuer/API/blockchain-backed certificate verification (current flow is an extensible `pending → verified →
  rejected` prototype).
- Pagination on large list endpoints beyond jobs/internships.
- Replace the local TF-IDF fallback with a lightweight open-source embedding model for a stronger offline
  semantic-search baseline.
- DigitalOcean App Platform / Kubernetes deployment manifests.
