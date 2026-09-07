-- ============================================================================
-- SIH 26SIH044 — Demo data seed (pure SQL)
--
-- Prerequisite: database/schema.sql must already be applied to this database.
--
-- Usage:
--   psql "$DATABASE_URL" -f database/schema.sql   -- once, creates tables
--   psql "$DATABASE_URL" -f database/seed.sql      -- populates demo data
--
-- This is a pure-SQL equivalent of backend-express/src/db/seed.js (which you
-- can also run via `npm run seed` — both produce the same demo dataset).
-- It is idempotent: re-running it TRUNCATEs and rebuilds every seeded table.
--
-- All demo accounts use the password:  Demo@123
-- (bcrypt hash below was generated with bcryptjs at cost factor 10)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- ----------------------------------------------------------------------------
-- Reset demo data (safe to re-run)
-- ----------------------------------------------------------------------------
TRUNCATE TABLE chat_messages, notifications, ai_recommendations, documents,
  assessment_results, faculty_applications, faculty_opportunities, faculty_profiles,
  certifications, projects, applications, opportunity_skills, internships, jobs,
  companies, program_skills, learning_programs, career_track_skills, career_tracks,
  student_skills, student_profiles, institutions, skills, users
  RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- Shared password hash for every demo account: Demo@123
-- ----------------------------------------------------------------------------
-- (referenced literally below — Postgres has no session variables in plain
--  SQL, so the hash string is simply repeated in each INSERT)

-- ----------------------------------------------------------------------------
-- Skills catalog
-- ----------------------------------------------------------------------------
INSERT INTO skills (name, category) VALUES
  ('Python', 'technical'), ('JavaScript', 'technical'), ('TypeScript', 'technical'),
  ('React', 'technical'), ('Node.js', 'technical'), ('Express.js', 'technical'),
  ('FastAPI', 'technical'), ('SQL', 'technical'), ('PostgreSQL', 'technical'),
  ('MongoDB', 'technical'), ('Java', 'technical'), ('C++', 'technical'),
  ('Machine Learning', 'domain'), ('Deep Learning', 'domain'), ('NLP', 'domain'),
  ('TensorFlow', 'technical'), ('PyTorch', 'technical'), ('Computer Vision', 'domain'),
  ('Docker', 'technical'), ('Kubernetes', 'technical'), ('AWS', 'technical'),
  ('Azure', 'technical'), ('Linux', 'technical'), ('Git', 'technical'),
  ('Data Analysis', 'domain'), ('Data Visualization', 'domain'), ('Statistics', 'domain'),
  ('Cybersecurity', 'domain'), ('Networking', 'domain'), ('System Design', 'domain'),
  ('REST APIs', 'technical'), ('HTML/CSS', 'technical'), ('Tailwind CSS', 'technical'),
  ('Communication', 'soft'), ('Problem Solving', 'soft'), ('Teamwork', 'soft'),
  ('Leadership', 'soft'), ('Time Management', 'soft'), ('Critical Thinking', 'soft');

-- ----------------------------------------------------------------------------
-- Career tracks + their required skills
-- ----------------------------------------------------------------------------
INSERT INTO career_tracks (name, description) VALUES
  ('AI Engineer', 'Builds and deploys machine learning and NLP systems into production.'),
  ('Full Stack Developer', 'Builds end-to-end web applications across frontend and backend.'),
  ('Data Scientist', 'Extracts insights from data using statistics and machine learning.'),
  ('Data Analyst', 'Analyzes and visualizes business data to drive decisions.'),
  ('Cloud Engineer', 'Designs, deploys and manages scalable cloud infrastructure.'),
  ('Cybersecurity Engineer', 'Protects systems and networks from security threats.'),
  ('Software Developer', 'Designs, builds and maintains general-purpose software systems.');

WITH track_skill_data(track_name, skill_name, required_proficiency) AS (
  VALUES
    ('AI Engineer', 'Python', 90), ('AI Engineer', 'Machine Learning', 85), ('AI Engineer', 'Deep Learning', 80),
    ('AI Engineer', 'NLP', 75), ('AI Engineer', 'TensorFlow', 70), ('AI Engineer', 'PyTorch', 65),
    ('AI Engineer', 'SQL', 60), ('AI Engineer', 'FastAPI', 55), ('AI Engineer', 'Docker', 50),
    ('AI Engineer', 'AWS', 45), ('AI Engineer', 'Problem Solving', 70), ('AI Engineer', 'Communication', 55),

    ('Full Stack Developer', 'JavaScript', 85), ('Full Stack Developer', 'React', 85), ('Full Stack Developer', 'Node.js', 80),
    ('Full Stack Developer', 'Express.js', 75), ('Full Stack Developer', 'SQL', 65), ('Full Stack Developer', 'MongoDB', 55),
    ('Full Stack Developer', 'HTML/CSS', 70), ('Full Stack Developer', 'Tailwind CSS', 55), ('Full Stack Developer', 'REST APIs', 70),
    ('Full Stack Developer', 'Git', 60), ('Full Stack Developer', 'System Design', 50), ('Full Stack Developer', 'Problem Solving', 65),

    ('Data Scientist', 'Python', 85), ('Data Scientist', 'Statistics', 80), ('Data Scientist', 'Machine Learning', 80),
    ('Data Scientist', 'SQL', 70), ('Data Scientist', 'Data Analysis', 80), ('Data Scientist', 'Data Visualization', 65),
    ('Data Scientist', 'Deep Learning', 55), ('Data Scientist', 'Communication', 60), ('Data Scientist', 'Problem Solving', 70),

    ('Data Analyst', 'SQL', 85), ('Data Analyst', 'Data Analysis', 85), ('Data Analyst', 'Data Visualization', 80),
    ('Data Analyst', 'Python', 60), ('Data Analyst', 'Statistics', 65), ('Data Analyst', 'Communication', 70),
    ('Data Analyst', 'Critical Thinking', 65),

    ('Cloud Engineer', 'AWS', 85), ('Cloud Engineer', 'Docker', 80), ('Cloud Engineer', 'Kubernetes', 75),
    ('Cloud Engineer', 'Linux', 75), ('Cloud Engineer', 'Azure', 55), ('Cloud Engineer', 'System Design', 65),
    ('Cloud Engineer', 'Networking', 55), ('Cloud Engineer', 'Python', 50), ('Cloud Engineer', 'Problem Solving', 60),

    ('Cybersecurity Engineer', 'Cybersecurity', 90), ('Cybersecurity Engineer', 'Networking', 80), ('Cybersecurity Engineer', 'Linux', 65),
    ('Cybersecurity Engineer', 'Python', 55), ('Cybersecurity Engineer', 'System Design', 50), ('Cybersecurity Engineer', 'Critical Thinking', 70),
    ('Cybersecurity Engineer', 'Communication', 50),

    ('Software Developer', 'Java', 75), ('Software Developer', 'Python', 65), ('Software Developer', 'SQL', 60),
    ('Software Developer', 'Git', 65), ('Software Developer', 'System Design', 60), ('Software Developer', 'REST APIs', 60),
    ('Software Developer', 'Problem Solving', 75), ('Software Developer', 'Teamwork', 60)
)
INSERT INTO career_track_skills (track_id, skill_id, required_proficiency, weight)
SELECT ct.id, s.id, tsd.required_proficiency, 1.0
FROM track_skill_data tsd
JOIN career_tracks ct ON ct.name = tsd.track_name
JOIN skills s ON s.name = tsd.skill_name;

-- ----------------------------------------------------------------------------
-- Learning programs + the skills they cover
-- ----------------------------------------------------------------------------
INSERT INTO learning_programs (title, provider, description, duration, difficulty) VALUES
  ('Python for Data Science', 'Coursera', 'Hands-on Python for data manipulation and analysis.', '4 weeks', 'beginner'),
  ('NLP Fundamentals', 'DeepLearning.AI', 'Core concepts of natural language processing.', '6 weeks', 'intermediate'),
  ('Transformers Workshop', 'HuggingFace', 'Hands-on workshop on transformer architectures.', '2 weeks', 'advanced'),
  ('LLM Development Program', 'Anthropic Academy', 'Build applications with large language models.', '5 weeks', 'advanced'),
  ('Deep Learning Specialization', 'Coursera', 'Neural networks, CNNs, RNNs and optimization.', '12 weeks', 'advanced'),
  ('AWS Cloud Practitioner', 'AWS Training', 'Foundational AWS cloud concepts and services.', '3 weeks', 'beginner'),
  ('Docker & Kubernetes Bootcamp', 'Udemy', 'Containerization and orchestration from scratch.', '4 weeks', 'intermediate'),
  ('SQL Mastery', 'DataCamp', 'Advanced SQL querying and database design.', '3 weeks', 'beginner'),
  ('React Advanced Patterns', 'Frontend Masters', 'Advanced hooks, performance and architecture in React.', '3 weeks', 'advanced'),
  ('Cybersecurity Fundamentals', 'Cisco Networking Academy', 'Introduction to network and application security.', '6 weeks', 'beginner'),
  ('Cloud Fundamentals', 'Google Cloud Skills Boost', 'Core cloud computing concepts across providers.', '2 weeks', 'beginner'),
  ('Data Visualization with Tableau', 'Coursera', 'Communicate data insights through visual storytelling.', '3 weeks', 'beginner'),
  ('Full Stack Web Development', 'upGrad', 'End-to-end MERN stack web application development.', '10 weeks', 'intermediate'),
  ('Communication Skills for Engineers', 'LinkedIn Learning', 'Professional communication for technical roles.', '2 weeks', 'beginner'),
  ('System Design Interview Prep', 'Educative', 'Learn to design large-scale distributed systems.', '4 weeks', 'advanced'),
  ('MLOps Essentials', 'DeepLearning.AI', 'Deploying and monitoring ML models in production.', '4 weeks', 'advanced');

WITH program_skill_data(program_title, skill_name) AS (
  VALUES
    ('Python for Data Science', 'Python'), ('Python for Data Science', 'Data Analysis'),
    ('NLP Fundamentals', 'NLP'), ('NLP Fundamentals', 'Python'),
    ('Transformers Workshop', 'NLP'), ('Transformers Workshop', 'Deep Learning'),
    ('LLM Development Program', 'NLP'), ('LLM Development Program', 'Deep Learning'), ('LLM Development Program', 'Python'),
    ('Deep Learning Specialization', 'Deep Learning'), ('Deep Learning Specialization', 'TensorFlow'), ('Deep Learning Specialization', 'PyTorch'),
    ('AWS Cloud Practitioner', 'AWS'), ('AWS Cloud Practitioner', 'Networking'),
    ('Docker & Kubernetes Bootcamp', 'Docker'), ('Docker & Kubernetes Bootcamp', 'Kubernetes'),
    ('SQL Mastery', 'SQL'), ('SQL Mastery', 'PostgreSQL'),
    ('React Advanced Patterns', 'React'), ('React Advanced Patterns', 'JavaScript'),
    ('Cybersecurity Fundamentals', 'Cybersecurity'), ('Cybersecurity Fundamentals', 'Networking'),
    ('Cloud Fundamentals', 'AWS'), ('Cloud Fundamentals', 'Azure'),
    ('Data Visualization with Tableau', 'Data Visualization'), ('Data Visualization with Tableau', 'Data Analysis'),
    ('Full Stack Web Development', 'React'), ('Full Stack Web Development', 'Node.js'),
    ('Full Stack Web Development', 'MongoDB'), ('Full Stack Web Development', 'Express.js'),
    ('Communication Skills for Engineers', 'Communication'),
    ('System Design Interview Prep', 'System Design'),
    ('MLOps Essentials', 'Machine Learning'), ('MLOps Essentials', 'Docker'), ('MLOps Essentials', 'AWS')
)
INSERT INTO program_skills (program_id, skill_id)
SELECT lp.id, s.id
FROM program_skill_data psd
JOIN learning_programs lp ON lp.title = psd.program_title
JOIN skills s ON s.name = psd.skill_name;

-- ----------------------------------------------------------------------------
-- Users
-- All demo accounts share one bcrypt hash (cost 10) for the password Demo@123
-- ----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Institution Admin', 'institution@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'institution'),

  ('20000000-0000-0000-0000-000000000001', 'TechNova Solutions Recruiter', 'industry@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'industry'),
  ('20000000-0000-0000-0000-000000000002', 'CloudSphere Systems Recruiter', 'recruiter2@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'industry'),
  ('20000000-0000-0000-0000-000000000003', 'FinEdge Analytics Recruiter', 'recruiter3@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'industry'),
  ('20000000-0000-0000-0000-000000000004', 'SecureNet Labs Recruiter', 'recruiter4@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'industry'),
  ('20000000-0000-0000-0000-000000000005', 'NextGen Robotics Recruiter', 'recruiter5@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'industry'),

  ('30000000-0000-0000-0000-000000000001', 'Dr. Ananya Krishnan', 'faculty@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'faculty'),
  ('30000000-0000-0000-0000-000000000002', 'Dr. Vikram Rao', 'faculty2@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'faculty'),
  ('30000000-0000-0000-0000-000000000003', 'Dr. Meera Nair', 'faculty3@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'faculty'),

  ('40000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'student@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'student'),
  ('40000000-0000-0000-0000-000000000002', 'Priya Patel', 'student2@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'student'),
  ('40000000-0000-0000-0000-000000000003', 'Rohan Verma', 'student3@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'student'),
  ('40000000-0000-0000-0000-000000000004', 'Sneha Iyer', 'student4@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'student'),
  ('40000000-0000-0000-0000-000000000005', 'Karan Mehta', 'student5@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'student'),
  ('40000000-0000-0000-0000-000000000006', 'Isha Nair', 'student6@demo.local', '$2a$10$NIrlCkCT1f1PHwXQLSVLjuFqAWqcbPTV8Tv66cVlyllV0Nod.9N7K', 'student');

-- ----------------------------------------------------------------------------
-- Institution
-- ----------------------------------------------------------------------------
INSERT INTO institutions (id, user_id, name, type, address, website, description) VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Rashtriya Institute of Technology', 'Autonomous Engineering Institute',
   'Sector 22, Knowledge Park, New Delhi', 'https://rit.edu.example',
   'A premier autonomous engineering institution focused on producing industry-ready graduates.');

-- ----------------------------------------------------------------------------
-- Companies
-- ----------------------------------------------------------------------------
INSERT INTO companies (id, user_id, name, industry, description, website, location, size) VALUES
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   'TechNova Solutions', 'Artificial Intelligence & IT Services',
   'TechNova builds AI-powered enterprise products and platforms for global clients.',
   'https://technova.example', 'Bengaluru, India', '500-1000 employees'),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
   'CloudSphere Systems', 'Cloud Infrastructure',
   'CloudSphere provides managed cloud and DevOps solutions to enterprises.',
   'https://cloudsphere.example', 'Pune, India', '200-500 employees'),
  ('60000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003',
   'FinEdge Analytics', 'FinTech & Data Analytics',
   'FinEdge builds data-driven risk and analytics products for financial institutions.',
   'https://finedge.example', 'Mumbai, India', '100-200 employees'),
  ('60000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004',
   'SecureNet Labs', 'Cybersecurity',
   'SecureNet Labs offers threat detection and security consulting services.',
   'https://securenetlabs.example', 'Hyderabad, India', '50-100 employees'),
  ('60000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005',
   'NextGen Robotics', 'Robotics & Computer Vision',
   'NextGen Robotics develops autonomous robotics systems powered by computer vision.',
   'https://nextgenrobotics.example', 'Chennai, India', '100-200 employees');

-- ----------------------------------------------------------------------------
-- Faculty profiles
-- ----------------------------------------------------------------------------
INSERT INTO faculty_profiles (user_id, institution_id, designation, department, qualifications, expertise, research_interests, experience_years, bio) VALUES
  ('30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
   'Associate Professor', 'Computer Science & Engineering', 'Ph.D in Machine Learning, IIT Delhi',
   ARRAY['Machine Learning', 'NLP', 'Deep Learning'],
   ARRAY['Explainable AI', 'Natural Language Processing', 'AI in Education'], 9,
   'Researches explainable AI and its applications in adaptive learning systems.'),
  ('30000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001',
   'Professor', 'Computer Science & Engineering', 'Ph.D in Distributed Systems, IISc Bangalore',
   ARRAY['Cloud Computing', 'System Design', 'Kubernetes'],
   ARRAY['Distributed Systems', 'Cloud Security', 'Edge Computing'], 15,
   'Works on scalable distributed systems and cloud-native architectures.'),
  ('30000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001',
   'Assistant Professor', 'Information Technology', 'Ph.D in Cybersecurity, IIT Bombay',
   ARRAY['Cybersecurity', 'Networking'],
   ARRAY['Network Security', 'Threat Intelligence'], 6,
   'Focuses on applied cybersecurity and industrial security audits.');

-- ----------------------------------------------------------------------------
-- Student profiles
-- ----------------------------------------------------------------------------
INSERT INTO student_profiles (user_id, institution_id, degree, branch, college, graduation_year, cgpa, bio, interests, career_goal, location) VALUES
  ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001',
   'B.Tech', 'Computer Science', 'Rashtriya Institute of Technology', 2026, 8.40,
   'Final-year CS student passionate about building intelligent, production-grade AI systems.',
   ARRAY['Artificial Intelligence', 'Backend Development'], 'AI Engineer', 'New Delhi, India'),
  ('40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001',
   'B.Tech', 'Information Technology', 'Rashtriya Institute of Technology', 2026, 9.10,
   'Aspiring data scientist with strong statistical foundations and a love for storytelling with data.',
   ARRAY['Data Science', 'Analytics'], 'Data Scientist', 'Mumbai, India'),
  ('40000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001',
   'B.Tech', 'Computer Science', 'Rashtriya Institute of Technology', 2025, 7.80,
   'Full-stack developer who enjoys shipping polished, scalable web products end-to-end.',
   ARRAY['Web Development', 'Cloud'], 'Full Stack Developer', 'Bengaluru, India'),
  ('40000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001',
   'B.Tech', 'Electronics & Computer', 'Rashtriya Institute of Technology', 2026, 8.90,
   'Cloud enthusiast building CI/CD pipelines and scalable infra since sophomore year.',
   ARRAY['Cloud Infrastructure', 'DevOps'], 'Cloud Engineer', 'Pune, India'),
  ('40000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001',
   'B.Tech', 'Information Security', 'Rashtriya Institute of Technology', 2025, 8.00,
   'Security researcher who has contributed to two responsible disclosure programs.',
   ARRAY['Cybersecurity', 'Ethical Hacking'], 'Cybersecurity Engineer', 'Hyderabad, India'),
  ('40000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000001',
   'M.Tech', 'Computer Science', 'Rashtriya Institute of Technology', 2026, 8.70,
   'Graduate researcher exploring computer vision applications for autonomous robotics.',
   ARRAY['AI', 'Robotics'], 'AI Engineer', 'Chennai, India');

-- Readiness score = average of each student's seeded skill proficiencies (set after student_skills below).

-- ----------------------------------------------------------------------------
-- Student skills
-- ----------------------------------------------------------------------------
WITH student_skill_data(student_id, skill_name, proficiency) AS (
  VALUES
    -- Aarav Sharma (AI Engineer)
    ('40000000-0000-0000-0000-000000000001'::uuid, 'Python', 88), ('40000000-0000-0000-0000-000000000001'::uuid, 'Machine Learning', 74),
    ('40000000-0000-0000-0000-000000000001'::uuid, 'SQL', 68), ('40000000-0000-0000-0000-000000000001'::uuid, 'React', 61),
    ('40000000-0000-0000-0000-000000000001'::uuid, 'FastAPI', 72), ('40000000-0000-0000-0000-000000000001'::uuid, 'Deep Learning', 55),
    ('40000000-0000-0000-0000-000000000001'::uuid, 'Communication', 82), ('40000000-0000-0000-0000-000000000001'::uuid, 'Problem Solving', 85),
    ('40000000-0000-0000-0000-000000000001'::uuid, 'NLP', 48), ('40000000-0000-0000-0000-000000000001'::uuid, 'Docker', 40),

    -- Priya Patel (Data Scientist)
    ('40000000-0000-0000-0000-000000000002'::uuid, 'Python', 82), ('40000000-0000-0000-0000-000000000002'::uuid, 'Statistics', 78),
    ('40000000-0000-0000-0000-000000000002'::uuid, 'Machine Learning', 70), ('40000000-0000-0000-0000-000000000002'::uuid, 'SQL', 80),
    ('40000000-0000-0000-0000-000000000002'::uuid, 'Data Analysis', 85), ('40000000-0000-0000-0000-000000000002'::uuid, 'Data Visualization', 75),
    ('40000000-0000-0000-0000-000000000002'::uuid, 'Communication', 70),

    -- Rohan Verma (Full Stack Developer)
    ('40000000-0000-0000-0000-000000000003'::uuid, 'JavaScript', 85), ('40000000-0000-0000-0000-000000000003'::uuid, 'React', 80),
    ('40000000-0000-0000-0000-000000000003'::uuid, 'Node.js', 78), ('40000000-0000-0000-0000-000000000003'::uuid, 'Express.js', 74),
    ('40000000-0000-0000-0000-000000000003'::uuid, 'SQL', 60), ('40000000-0000-0000-0000-000000000003'::uuid, 'HTML/CSS', 82),
    ('40000000-0000-0000-0000-000000000003'::uuid, 'Tailwind CSS', 70), ('40000000-0000-0000-0000-000000000003'::uuid, 'Git', 75),
    ('40000000-0000-0000-0000-000000000003'::uuid, 'Teamwork', 78),

    -- Sneha Iyer (Cloud Engineer)
    ('40000000-0000-0000-0000-000000000004'::uuid, 'AWS', 70), ('40000000-0000-0000-0000-000000000004'::uuid, 'Docker', 75),
    ('40000000-0000-0000-0000-000000000004'::uuid, 'Kubernetes', 60), ('40000000-0000-0000-0000-000000000004'::uuid, 'Linux', 72),
    ('40000000-0000-0000-0000-000000000004'::uuid, 'Python', 55), ('40000000-0000-0000-0000-000000000004'::uuid, 'System Design', 50),

    -- Karan Mehta (Cybersecurity Engineer)
    ('40000000-0000-0000-0000-000000000005'::uuid, 'Cybersecurity', 80), ('40000000-0000-0000-0000-000000000005'::uuid, 'Networking', 75),
    ('40000000-0000-0000-0000-000000000005'::uuid, 'Linux', 68), ('40000000-0000-0000-0000-000000000005'::uuid, 'Python', 58),
    ('40000000-0000-0000-0000-000000000005'::uuid, 'Critical Thinking', 72),

    -- Isha Nair (AI Engineer / Computer Vision)
    ('40000000-0000-0000-0000-000000000006'::uuid, 'Python', 80), ('40000000-0000-0000-0000-000000000006'::uuid, 'Deep Learning', 70),
    ('40000000-0000-0000-0000-000000000006'::uuid, 'TensorFlow', 65), ('40000000-0000-0000-0000-000000000006'::uuid, 'Computer Vision', 68),
    ('40000000-0000-0000-0000-000000000006'::uuid, 'SQL', 55), ('40000000-0000-0000-0000-000000000006'::uuid, 'NLP', 50)
)
INSERT INTO student_skills (student_id, skill_id, proficiency, assessment_score, source)
SELECT ssd.student_id, s.id, ssd.proficiency, ssd.proficiency, 'assessment'
FROM student_skill_data ssd JOIN skills s ON s.name = ssd.skill_name;

-- Set readiness_score = average proficiency across each student's seeded skills.
UPDATE student_profiles sp
SET readiness_score = sub.avg_prof
FROM (
  SELECT student_id, ROUND(AVG(proficiency)) AS avg_prof
  FROM student_skills GROUP BY student_id
) sub
WHERE sp.user_id = sub.student_id;

-- ----------------------------------------------------------------------------
-- Assessment results (drives institution "assessment completed" analytics)
-- ----------------------------------------------------------------------------
INSERT INTO assessment_results (student_id, career_track, skill_scores, overall_score) VALUES
  ('40000000-0000-0000-0000-000000000001', 'AI Engineer',
   '{"Python":88,"Machine Learning":74,"SQL":68,"React":61,"FastAPI":72,"Deep Learning":55,"Communication":82,"Problem Solving":85,"NLP":48,"Docker":40}', 78),
  ('40000000-0000-0000-0000-000000000002', 'Data Scientist',
   '{"Python":82,"Statistics":78,"Machine Learning":70,"SQL":80,"Data Analysis":85,"Data Visualization":75,"Communication":70}', 81),
  ('40000000-0000-0000-0000-000000000003', 'Full Stack Developer',
   '{"JavaScript":85,"React":80,"Node.js":78,"Express.js":74,"SQL":60,"HTML/CSS":82,"Tailwind CSS":70,"Git":75,"Teamwork":78}', 74),
  ('40000000-0000-0000-0000-000000000004', 'Cloud Engineer',
   '{"AWS":70,"Docker":75,"Kubernetes":60,"Linux":72,"Python":55,"System Design":50}', 69),
  ('40000000-0000-0000-0000-000000000005', 'Cybersecurity Engineer',
   '{"Cybersecurity":80,"Networking":75,"Linux":68,"Python":58,"Critical Thinking":72}', 76);

-- ----------------------------------------------------------------------------
-- Projects & certifications (primary demo student)
-- ----------------------------------------------------------------------------
INSERT INTO projects (student_id, title, description, technologies, project_url) VALUES
  ('40000000-0000-0000-0000-000000000001', 'AI Career Assistant Chatbot',
   'A RAG-based chatbot that answers career questions using a student''s own profile data.',
   ARRAY['Python', 'LangChain', 'FastAPI', 'React'], 'https://github.com/demo/ai-career-bot'),
  ('40000000-0000-0000-0000-000000000001', 'Campus Marketplace App',
   'A full-stack marketplace app for students to buy/sell used textbooks.',
   ARRAY['React', 'Node.js', 'PostgreSQL'], 'https://github.com/demo/campus-marketplace');

INSERT INTO certifications (student_id, name, issuer, issue_date, verification_status) VALUES
  ('40000000-0000-0000-0000-000000000001', 'Machine Learning Specialization', 'Coursera / Stanford Online', '2025-03-15', 'verified'),
  ('40000000-0000-0000-0000-000000000001', 'AWS Cloud Practitioner', 'Amazon Web Services', '2025-08-01', 'pending');

-- ----------------------------------------------------------------------------
-- Jobs & internships
-- ----------------------------------------------------------------------------
INSERT INTO internships (id, company_id, title, description, duration, location, eligibility, min_cgpa, stipend, deadline) VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
   'AI Engineer Intern', 'Work with our applied AI team to build and fine-tune NLP models for enterprise search and support automation.',
   '6 months', 'Bengaluru, India (Hybrid)', 'B.Tech/M.Tech, CS/IT/ECE, 2025-2026 batch', 7.0, '₹40,000/month', '2026-10-15'),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002',
   'Cloud Engineer Intern', 'Assist in building and maintaining CI/CD pipelines and cloud infrastructure for enterprise clients.',
   '4 months', 'Pune, India', 'B.Tech, all branches, 2025-2026 batch', 6.5, '₹30,000/month', '2026-10-05'),
  ('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000003',
   'Data Analyst Intern', 'Analyze transactional data to identify fraud patterns and generate risk dashboards.',
   '6 months', 'Mumbai, India', 'B.Tech/B.Sc, any branch, 2025-2026 batch', 7.0, '₹25,000/month', '2026-10-25'),
  ('70000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000004',
   'Cybersecurity Intern', 'Support our SOC team with vulnerability assessments and threat monitoring.',
   '3 months', 'Hyderabad, India (Remote)', 'B.Tech CS/IT/InfoSec, 2025-2026 batch', 6.5, '₹20,000/month', '2026-10-12'),
  ('70000000-0000-0000-0000-000000000009', '60000000-0000-0000-0000-000000000005',
   'ML Intern - Computer Vision', 'Develop computer vision models for real-time object detection on robotics hardware.',
   '6 months', 'Chennai, India', 'B.Tech/M.Tech CS/ECE, 2025-2026 batch', 7.5, '₹35,000/month', '2026-10-30');

INSERT INTO jobs (id, company_id, title, description, employment_type, location, eligibility, min_cgpa, salary_range, deadline) VALUES
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001',
   'Backend Developer', 'Design and build scalable backend services powering our AI products.',
   'Full-time', 'Bengaluru, India', 'B.Tech CS/IT, 2025 or 2026 batch', 7.5, '₹9-14 LPA', '2026-11-01'),
  ('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000002',
   'DevOps Engineer', 'Own the reliability, scalability and automation of our cloud infrastructure.',
   'Full-time', 'Pune, India', 'B.Tech, 2025 batch or experienced', 7.0, '₹10-16 LPA', '2026-10-20'),
  ('70000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000003',
   'Data Scientist', 'Build predictive models for credit risk and fraud detection at scale.',
   'Full-time', 'Mumbai, India', 'B.Tech/M.Tech, 2025 batch', 8.0, '₹12-20 LPA', '2026-11-10'),
  ('70000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000004',
   'Security Analyst', 'Perform security audits, penetration testing, and incident response for enterprise clients.',
   'Full-time', 'Hyderabad, India', 'B.Tech, 2025 batch', 7.0, '₹8-13 LPA', '2026-11-05'),
  ('70000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000005',
   'Robotics Software Engineer', 'Build perception and control software for autonomous mobile robots.',
   'Full-time', 'Chennai, India', 'B.Tech/M.Tech, 2025 batch', 8.0, '₹11-18 LPA', '2026-11-15');

-- Required skills per opportunity (opportunity_type + skill lookup by name)
WITH opp_skill_data(opportunity_id, opportunity_type, skill_name, required_proficiency, importance) AS (
  VALUES
    ('70000000-0000-0000-0000-000000000001'::uuid, 'internship', 'Python', 80, 'required'),
    ('70000000-0000-0000-0000-000000000001'::uuid, 'internship', 'Machine Learning', 70, 'required'),
    ('70000000-0000-0000-0000-000000000001'::uuid, 'internship', 'NLP', 60, 'preferred'),
    ('70000000-0000-0000-0000-000000000001'::uuid, 'internship', 'FastAPI', 50, 'preferred'),
    ('70000000-0000-0000-0000-000000000001'::uuid, 'internship', 'AWS', 40, 'preferred'),

    ('70000000-0000-0000-0000-000000000002'::uuid, 'job', 'Node.js', 70, 'required'),
    ('70000000-0000-0000-0000-000000000002'::uuid, 'job', 'Express.js', 65, 'required'),
    ('70000000-0000-0000-0000-000000000002'::uuid, 'job', 'SQL', 60, 'required'),
    ('70000000-0000-0000-0000-000000000002'::uuid, 'job', 'Docker', 45, 'preferred'),
    ('70000000-0000-0000-0000-000000000002'::uuid, 'job', 'System Design', 50, 'preferred'),

    ('70000000-0000-0000-0000-000000000003'::uuid, 'internship', 'AWS', 65, 'required'),
    ('70000000-0000-0000-0000-000000000003'::uuid, 'internship', 'Docker', 60, 'required'),
    ('70000000-0000-0000-0000-000000000003'::uuid, 'internship', 'Kubernetes', 50, 'preferred'),
    ('70000000-0000-0000-0000-000000000003'::uuid, 'internship', 'Linux', 55, 'required'),

    ('70000000-0000-0000-0000-000000000004'::uuid, 'job', 'AWS', 75, 'required'),
    ('70000000-0000-0000-0000-000000000004'::uuid, 'job', 'Kubernetes', 65, 'required'),
    ('70000000-0000-0000-0000-000000000004'::uuid, 'job', 'Docker', 70, 'required'),
    ('70000000-0000-0000-0000-000000000004'::uuid, 'job', 'Linux', 60, 'required'),
    ('70000000-0000-0000-0000-000000000004'::uuid, 'job', 'System Design', 55, 'preferred'),

    ('70000000-0000-0000-0000-000000000005'::uuid, 'internship', 'SQL', 70, 'required'),
    ('70000000-0000-0000-0000-000000000005'::uuid, 'internship', 'Python', 55, 'required'),
    ('70000000-0000-0000-0000-000000000005'::uuid, 'internship', 'Data Analysis', 70, 'required'),
    ('70000000-0000-0000-0000-000000000005'::uuid, 'internship', 'Data Visualization', 55, 'preferred'),

    ('70000000-0000-0000-0000-000000000006'::uuid, 'job', 'Python', 80, 'required'),
    ('70000000-0000-0000-0000-000000000006'::uuid, 'job', 'Machine Learning', 75, 'required'),
    ('70000000-0000-0000-0000-000000000006'::uuid, 'job', 'Statistics', 70, 'required'),
    ('70000000-0000-0000-0000-000000000006'::uuid, 'job', 'SQL', 65, 'required'),
    ('70000000-0000-0000-0000-000000000006'::uuid, 'job', 'Data Visualization', 45, 'preferred'),

    ('70000000-0000-0000-0000-000000000007'::uuid, 'internship', 'Cybersecurity', 65, 'required'),
    ('70000000-0000-0000-0000-000000000007'::uuid, 'internship', 'Networking', 60, 'required'),
    ('70000000-0000-0000-0000-000000000007'::uuid, 'internship', 'Linux', 50, 'preferred'),

    ('70000000-0000-0000-0000-000000000008'::uuid, 'job', 'Cybersecurity', 75, 'required'),
    ('70000000-0000-0000-0000-000000000008'::uuid, 'job', 'Networking', 70, 'required'),
    ('70000000-0000-0000-0000-000000000008'::uuid, 'job', 'Critical Thinking', 55, 'preferred'),

    ('70000000-0000-0000-0000-000000000009'::uuid, 'internship', 'Python', 75, 'required'),
    ('70000000-0000-0000-0000-000000000009'::uuid, 'internship', 'Deep Learning', 65, 'required'),
    ('70000000-0000-0000-0000-000000000009'::uuid, 'internship', 'TensorFlow', 55, 'preferred'),
    ('70000000-0000-0000-0000-000000000009'::uuid, 'internship', 'Computer Vision', 60, 'required'),

    ('70000000-0000-0000-0000-000000000010'::uuid, 'job', 'Python', 75, 'required'),
    ('70000000-0000-0000-0000-000000000010'::uuid, 'job', 'Deep Learning', 70, 'required'),
    ('70000000-0000-0000-0000-000000000010'::uuid, 'job', 'Computer Vision', 70, 'required'),
    ('70000000-0000-0000-0000-000000000010'::uuid, 'job', 'C++', 45, 'preferred')
)
INSERT INTO opportunity_skills (opportunity_id, opportunity_type, skill_id, required_proficiency, importance)
SELECT osd.opportunity_id, osd.opportunity_type, s.id, osd.required_proficiency, osd.importance
FROM opp_skill_data osd JOIN skills s ON s.name = osd.skill_name;

-- ----------------------------------------------------------------------------
-- Applications
-- ----------------------------------------------------------------------------
INSERT INTO applications (student_id, opportunity_id, opportunity_type, status, match_score) VALUES
  ('40000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'internship', 'shortlisted', 89),
  ('40000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'job', 'under_review', 76),
  ('40000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000009', 'internship', 'applied', 71),
  ('40000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000006', 'job', 'interview', 91),
  ('40000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000005', 'internship', 'selected', 88),
  ('40000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', 'job', 'applied', 68),
  ('40000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000004', 'job', 'rejected', 52),
  ('40000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000003', 'internship', 'shortlisted', 85),
  ('40000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004', 'job', 'applied', 74),
  ('40000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000007', 'internship', 'selected', 90),
  ('40000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000008', 'job', 'interview', 82),
  ('40000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000009', 'internship', 'shortlisted', 87),
  ('40000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000001', 'internship', 'applied', 79);

-- ----------------------------------------------------------------------------
-- Faculty opportunities + applications
-- ----------------------------------------------------------------------------
INSERT INTO faculty_opportunities (id, company_id, type, title, description, required_expertise, location, deadline) VALUES
  ('80000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'fdp',
   'FDP: AI in Education', 'A 1-week faculty development program on applying AI to personalized learning.',
   ARRAY['Machine Learning', 'AI in Education'], 'Bengaluru, India', '2026-11-20'),
  ('80000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 'industrial_training',
   'Industrial Training: Cloud-Native Architectures', '2-week immersive industrial training for faculty on cloud-native systems.',
   ARRAY['Cloud Computing', 'Kubernetes'], 'Pune, India', '2026-12-01'),
  ('80000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000005', 'research_collaboration',
   'Research Collaboration: Vision-Language Models for Robotics', 'Joint research collaboration exploring vision-language models for robotic perception.',
   ARRAY['Natural Language Processing', 'Computer Vision'], 'Chennai, India', '2026-12-15'),
  ('80000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000004', 'consultancy',
   'Consultancy: Enterprise Security Audit', 'Paid consultancy engagement to audit enterprise clients'' security posture.',
   ARRAY['Network Security', 'Threat Intelligence'], 'Hyderabad, India (Remote)', '2026-10-31'),
  ('80000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000002', 'workshop',
   'Workshop: Designing for Cloud Scale', 'A hands-on workshop for faculty and students on cloud architecture design patterns.',
   ARRAY['Cloud Security', 'Distributed Systems'], 'Pune, India', '2026-11-05'),
  ('80000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000003', 'mentorship',
   'Mentorship: FinTech Student Startups', 'Mentor student-led fintech startup teams over one semester.',
   ARRAY['Data Analysis'], 'Mumbai, India (Remote)', '2026-11-30');

INSERT INTO faculty_applications (faculty_id, opportunity_id, status) VALUES
  ('30000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'shortlisted'),
  ('30000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000003', 'applied'),
  ('30000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000002', 'selected'),
  ('30000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000004', 'under_review');

-- ----------------------------------------------------------------------------
-- Notifications (primary demo student)
-- ----------------------------------------------------------------------------
INSERT INTO notifications (user_id, title, message) VALUES
  ('40000000-0000-0000-0000-000000000001', 'Application Shortlisted', 'You have been shortlisted for AI Engineer Intern at TechNova Solutions.'),
  ('40000000-0000-0000-0000-000000000001', 'New Recommendation', '3 new internships match your AI Engineer career goal.'),
  ('40000000-0000-0000-0000-000000000001', 'Assessment Reminder', 'Complete your Full Stack Developer assessment to unlock more recommendations.');

COMMIT;

-- ----------------------------------------------------------------------------
-- Done. Demo credentials (password for all: Demo@123):
--   student@demo.local      Aarav Sharma       (Student)
--   student2@demo.local     Priya Patel        (Student)
--   student3@demo.local     Rohan Verma        (Student)
--   student4@demo.local     Sneha Iyer         (Student)
--   student5@demo.local     Karan Mehta        (Student)
--   student6@demo.local     Isha Nair          (Student)
--   industry@demo.local     TechNova Solutions (Industry)
--   recruiter2@demo.local   CloudSphere Systems (Industry)
--   recruiter3@demo.local   FinEdge Analytics  (Industry)
--   recruiter4@demo.local   SecureNet Labs     (Industry)
--   recruiter5@demo.local   NextGen Robotics   (Industry)
--   faculty@demo.local      Dr. Ananya Krishnan (Faculty)
--   faculty2@demo.local     Dr. Vikram Rao     (Faculty)
--   faculty3@demo.local     Dr. Meera Nair     (Faculty)
--   institution@demo.local  Rashtriya Institute of Technology (Institution)
-- ----------------------------------------------------------------------------
