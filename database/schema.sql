-- ============================================================================
-- SIH 26SIH044 — Industry-Academia-Student Ecosystem
-- PostgreSQL schema
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- USERS & ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('student','industry','faculty','institution','admin')),
    phone           VARCHAR(20),
    avatar_url      TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- INSTITUTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institutions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(50) DEFAULT 'University',
    address         TEXT,
    website         TEXT,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- STUDENT PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    institution_id  UUID REFERENCES institutions(id),
    degree          VARCHAR(100),
    branch          VARCHAR(100),
    college         VARCHAR(200),
    graduation_year INTEGER,
    cgpa            NUMERIC(3,2),
    bio             TEXT,
    interests       TEXT[] DEFAULT '{}',
    career_goal     VARCHAR(150),
    resume_url      TEXT,
    location        VARCHAR(150),
    readiness_score INTEGER DEFAULT 0,
    updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_profiles_goal ON student_profiles(career_goal);

-- ----------------------------------------------------------------------------
-- SKILLS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    category        VARCHAR(50) NOT NULL DEFAULT 'technical', -- technical, soft, domain
    description     TEXT
);

CREATE TABLE IF NOT EXISTS student_skills (
    student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id        INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency     INTEGER DEFAULT 0 CHECK (proficiency BETWEEN 0 AND 100),
    assessment_score INTEGER,
    source          VARCHAR(20) DEFAULT 'manual', -- manual, assessment, resume_ai
    updated_at      TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (student_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON student_skills(skill_id);

-- Career tracks (target careers used for skill-gap analysis)
CREATE TABLE IF NOT EXISTS career_tracks (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) UNIQUE NOT NULL,
    description     TEXT
);

CREATE TABLE IF NOT EXISTS career_track_skills (
    track_id        INTEGER REFERENCES career_tracks(id) ON DELETE CASCADE,
    skill_id        INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    required_proficiency INTEGER DEFAULT 60,
    weight          NUMERIC(3,2) DEFAULT 1.0,
    PRIMARY KEY (track_id, skill_id)
);

-- ----------------------------------------------------------------------------
-- COMPANIES (Industry)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    industry        VARCHAR(120),
    description     TEXT,
    website         TEXT,
    location        VARCHAR(150),
    logo_url        TEXT,
    size            VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- JOBS / INTERNSHIPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    location        VARCHAR(150),
    employment_type VARCHAR(50) DEFAULT 'Full-time',
    eligibility     TEXT,
    min_cgpa        NUMERIC(3,2) DEFAULT 0,
    experience_required INTEGER DEFAULT 0,
    salary_range    VARCHAR(80),
    deadline        DATE,
    status          VARCHAR(20) DEFAULT 'open', -- open, closed
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

CREATE TABLE IF NOT EXISTS internships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    duration         VARCHAR(50),
    location        VARCHAR(150),
    eligibility     TEXT,
    min_cgpa        NUMERIC(3,2) DEFAULT 0,
    stipend         VARCHAR(80),
    deadline        DATE,
    status          VARCHAR(20) DEFAULT 'open',
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);

-- Required skills for a job or internship (opportunity_type differentiates)
CREATE TABLE IF NOT EXISTS opportunity_skills (
    opportunity_id      UUID NOT NULL,
    opportunity_type    VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('job','internship')),
    skill_id            INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    required_proficiency INTEGER DEFAULT 50,
    importance          VARCHAR(20) DEFAULT 'required', -- required, preferred
    PRIMARY KEY (opportunity_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_opp_skills_opp ON opportunity_skills(opportunity_id, opportunity_type);

-- ----------------------------------------------------------------------------
-- APPLICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id      UUID NOT NULL,
    opportunity_type    VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('job','internship')),
    status              VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied','under_review','shortlisted','interview','selected','rejected')),
    match_score         INTEGER,
    cover_note          TEXT,
    applied_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE (student_id, opportunity_id, opportunity_type)
);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_opp ON applications(opportunity_id, opportunity_type);

-- ----------------------------------------------------------------------------
-- PROJECTS / CERTIFICATIONS (portfolio)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    technologies    TEXT[] DEFAULT '{}',
    project_url     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(200) NOT NULL,
    issuer              VARCHAR(150),
    issue_date          DATE,
    file_url            TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- LEARNING PROGRAMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_programs (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    provider        VARCHAR(150),
    description     TEXT,
    duration        VARCHAR(50),
    difficulty      VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    url             TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_skills (
    program_id      INTEGER REFERENCES learning_programs(id) ON DELETE CASCADE,
    skill_id        INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, skill_id)
);

-- ----------------------------------------------------------------------------
-- FACULTY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    institution_id      UUID REFERENCES institutions(id),
    designation         VARCHAR(150),
    department          VARCHAR(150),
    qualifications      TEXT,
    expertise           TEXT[] DEFAULT '{}',
    research_interests  TEXT[] DEFAULT '{}',
    experience_years    INTEGER DEFAULT 0,
    bio                 TEXT,
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculty_opportunities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID REFERENCES companies(id) ON DELETE CASCADE,
    type                VARCHAR(30) NOT NULL CHECK (type IN ('fdp','industrial_training','consultancy','workshop','mentorship','research_collaboration')),
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    required_expertise  TEXT[] DEFAULT '{}',
    location            VARCHAR(150),
    deadline            DATE,
    status              VARCHAR(20) DEFAULT 'open',
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculty_applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id      UUID REFERENCES faculty_opportunities(id) ON DELETE CASCADE,
    status              VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied','under_review','shortlisted','interview','selected','rejected')),
    applied_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE (faculty_id, opportunity_id)
);

-- ----------------------------------------------------------------------------
-- ASSESSMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessment_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    career_track    VARCHAR(120),
    skill_scores    JSONB, -- {"Python": 88, "SQL": 68, ...}
    overall_score   INTEGER,
    taken_at        TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assessment_student ON assessment_results(student_id);

-- ----------------------------------------------------------------------------
-- AI RECOMMENDATIONS CACHE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    rec_type        VARCHAR(30) NOT NULL, -- job, internship, course
    opportunity_id  VARCHAR(80),
    score           INTEGER,
    explanation     TEXT,
    payload         JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_rec_student ON ai_recommendations(student_id, rec_type);

-- ----------------------------------------------------------------------------
-- DOCUMENTS (resume, certificates, academic docs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    doc_type        VARCHAR(30) NOT NULL, -- resume, certificate, academic, project
    filename        VARCHAR(255) NOT NULL,
    url             TEXT NOT NULL,
    mime_type       VARCHAR(100),
    size_bytes      INTEGER,
    uploaded_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    message         TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ----------------------------------------------------------------------------
-- AI CHAT HISTORY (career assistant)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant')),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, created_at);
