/**
 * Seeds the database with realistic demo data so the platform is fully
 * demonstrable without any external accounts or manual data entry.
 *
 * Run with: npm run seed  (after `npm run migrate`)
 */
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const env = require('../config/env');

const pool = new Pool({ connectionString: env.databaseUrl });
const DEMO_PASSWORD = 'Demo@123';

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

const SKILLS = [
  ['Python', 'technical'], ['JavaScript', 'technical'], ['TypeScript', 'technical'],
  ['React', 'technical'], ['Node.js', 'technical'], ['Express.js', 'technical'],
  ['FastAPI', 'technical'], ['SQL', 'technical'], ['PostgreSQL', 'technical'],
  ['MongoDB', 'technical'], ['Java', 'technical'], ['C++', 'technical'],
  ['Machine Learning', 'domain'], ['Deep Learning', 'domain'], ['NLP', 'domain'],
  ['TensorFlow', 'technical'], ['PyTorch', 'technical'], ['Computer Vision', 'domain'],
  ['Docker', 'technical'], ['Kubernetes', 'technical'], ['AWS', 'technical'],
  ['Azure', 'technical'], ['Linux', 'technical'], ['Git', 'technical'],
  ['Data Analysis', 'domain'], ['Data Visualization', 'domain'], ['Statistics', 'domain'],
  ['Cybersecurity', 'domain'], ['Networking', 'domain'], ['System Design', 'domain'],
  ['REST APIs', 'technical'], ['HTML/CSS', 'technical'], ['Tailwind CSS', 'technical'],
  ['Communication', 'soft'], ['Problem Solving', 'soft'], ['Teamwork', 'soft'],
  ['Leadership', 'soft'], ['Time Management', 'soft'], ['Critical Thinking', 'soft'],
];

const CAREER_TRACKS = [
  {
    name: 'AI Engineer',
    description: 'Builds and deploys machine learning and NLP systems into production.',
    skills: [
      ['Python', 90], ['Machine Learning', 85], ['Deep Learning', 80], ['NLP', 75],
      ['TensorFlow', 70], ['PyTorch', 65], ['SQL', 60], ['FastAPI', 55], ['Docker', 50],
      ['AWS', 45], ['Problem Solving', 70], ['Communication', 55],
    ],
  },
  {
    name: 'Full Stack Developer',
    description: 'Builds end-to-end web applications across frontend and backend.',
    skills: [
      ['JavaScript', 85], ['React', 85], ['Node.js', 80], ['Express.js', 75],
      ['SQL', 65], ['MongoDB', 55], ['HTML/CSS', 70], ['Tailwind CSS', 55],
      ['REST APIs', 70], ['Git', 60], ['System Design', 50], ['Problem Solving', 65],
    ],
  },
  {
    name: 'Data Scientist',
    description: 'Extracts insights from data using statistics and machine learning.',
    skills: [
      ['Python', 85], ['Statistics', 80], ['Machine Learning', 80], ['SQL', 70],
      ['Data Analysis', 80], ['Data Visualization', 65], ['Deep Learning', 55],
      ['Communication', 60], ['Problem Solving', 70],
    ],
  },
  {
    name: 'Data Analyst',
    description: 'Analyzes and visualizes business data to drive decisions.',
    skills: [
      ['SQL', 85], ['Data Analysis', 85], ['Data Visualization', 80], ['Python', 60],
      ['Statistics', 65], ['Communication', 70], ['Critical Thinking', 65],
    ],
  },
  {
    name: 'Cloud Engineer',
    description: 'Designs, deploys and manages scalable cloud infrastructure.',
    skills: [
      ['AWS', 85], ['Docker', 80], ['Kubernetes', 75], ['Linux', 75], ['Azure', 55],
      ['System Design', 65], ['Networking', 55], ['Python', 50], ['Problem Solving', 60],
    ],
  },
  {
    name: 'Cybersecurity Engineer',
    description: 'Protects systems and networks from security threats.',
    skills: [
      ['Cybersecurity', 90], ['Networking', 80], ['Linux', 65], ['Python', 55],
      ['System Design', 50], ['Critical Thinking', 70], ['Communication', 50],
    ],
  },
  {
    name: 'Software Developer',
    description: 'Designs, builds and maintains general-purpose software systems.',
    skills: [
      ['Java', 75], ['Python', 65], ['SQL', 60], ['Git', 65], ['System Design', 60],
      ['REST APIs', 60], ['Problem Solving', 75], ['Teamwork', 60],
    ],
  },
];

const LEARNING_PROGRAMS = [
  ['Python for Data Science', 'Coursera', 'Hands-on Python for data manipulation and analysis.', '4 weeks', 'beginner', ['Python', 'Data Analysis']],
  ['NLP Fundamentals', 'DeepLearning.AI', 'Core concepts of natural language processing.', '6 weeks', 'intermediate', ['NLP', 'Python']],
  ['Transformers Workshop', 'HuggingFace', 'Hands-on workshop on transformer architectures.', '2 weeks', 'advanced', ['NLP', 'Deep Learning']],
  ['LLM Development Program', 'Anthropic Academy', 'Build applications with large language models.', '5 weeks', 'advanced', ['NLP', 'Deep Learning', 'Python']],
  ['Deep Learning Specialization', 'Coursera', 'Neural networks, CNNs, RNNs and optimization.', '12 weeks', 'advanced', ['Deep Learning', 'TensorFlow', 'PyTorch']],
  ['AWS Cloud Practitioner', 'AWS Training', 'Foundational AWS cloud concepts and services.', '3 weeks', 'beginner', ['AWS', 'Networking']],
  ['Docker & Kubernetes Bootcamp', 'Udemy', 'Containerization and orchestration from scratch.', '4 weeks', 'intermediate', ['Docker', 'Kubernetes']],
  ['SQL Mastery', 'DataCamp', 'Advanced SQL querying and database design.', '3 weeks', 'beginner', ['SQL', 'PostgreSQL']],
  ['React Advanced Patterns', 'Frontend Masters', 'Advanced hooks, performance and architecture in React.', '3 weeks', 'advanced', ['React', 'JavaScript']],
  ['Cybersecurity Fundamentals', 'Cisco Networking Academy', 'Introduction to network and application security.', '6 weeks', 'beginner', ['Cybersecurity', 'Networking']],
  ['Cloud Fundamentals', 'Google Cloud Skills Boost', 'Core cloud computing concepts across providers.', '2 weeks', 'beginner', ['AWS', 'Azure']],
  ['Data Visualization with Tableau', 'Coursera', 'Communicate data insights through visual storytelling.', '3 weeks', 'beginner', ['Data Visualization', 'Data Analysis']],
  ['Full Stack Web Development', 'upGrad', 'End-to-end MERN stack web application development.', '10 weeks', 'intermediate', ['React', 'Node.js', 'MongoDB', 'Express.js']],
  ['Communication Skills for Engineers', 'LinkedIn Learning', 'Professional communication for technical roles.', '2 weeks', 'beginner', ['Communication']],
  ['System Design Interview Prep', 'Educative', 'Learn to design large-scale distributed systems.', '4 weeks', 'advanced', ['System Design']],
  ['MLOps Essentials', 'DeepLearning.AI', 'Deploying and monitoring ML models in production.', '4 weeks', 'advanced', ['Machine Learning', 'Docker', 'AWS']],
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🌱 Seeding database...');

    // Wipe existing demo data (idempotent re-seed) — order respects FKs.
    await client.query(`
      TRUNCATE TABLE chat_messages, notifications, ai_recommendations, documents,
      assessment_results, faculty_applications, faculty_opportunities, faculty_profiles,
      certifications, projects, applications, opportunity_skills, internships, jobs,
      companies, program_skills, learning_programs, career_track_skills, career_tracks,
      student_skills, student_profiles, institutions, skills, users
      RESTART IDENTITY CASCADE;
    `);

    // ---------------- Skills ----------------
    const skillId = {};
    for (const [name, category] of SKILLS) {
      const { rows } = await client.query(
        'INSERT INTO skills (name, category) VALUES ($1,$2) RETURNING id',
        [name, category]
      );
      skillId[name] = rows[0].id;
    }
    console.log(`  ✓ ${SKILLS.length} skills`);

    // ---------------- Career tracks ----------------
    for (const track of CAREER_TRACKS) {
      const { rows } = await client.query(
        'INSERT INTO career_tracks (name, description) VALUES ($1,$2) RETURNING id',
        [track.name, track.description]
      );
      const trackId = rows[0].id;
      for (const [skillName, reqProf] of track.skills) {
        await client.query(
          'INSERT INTO career_track_skills (track_id, skill_id, required_proficiency, weight) VALUES ($1,$2,$3,1.0)',
          [trackId, skillId[skillName], reqProf]
        );
      }
    }
    console.log(`  ✓ ${CAREER_TRACKS.length} career tracks`);

    // ---------------- Learning programs ----------------
    for (const [title, provider, description, duration, difficulty, skillNames] of LEARNING_PROGRAMS) {
      const { rows } = await client.query(
        `INSERT INTO learning_programs (title, provider, description, duration, difficulty)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [title, provider, description, duration, difficulty]
      );
      const programId = rows[0].id;
      for (const skillName of skillNames) {
        await client.query(
          'INSERT INTO program_skills (program_id, skill_id) VALUES ($1,$2)',
          [programId, skillId[skillName]]
        );
      }
    }
    console.log(`  ✓ ${LEARNING_PROGRAMS.length} learning programs`);

    // ---------------- Users helper ----------------
    const pwHash = await hash(DEMO_PASSWORD);
    async function createUser(name, email, role, phone = null) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, role, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [name, email, pwHash, role, phone]
      );
      return rows[0].id;
    }

    // ---------------- Institution ----------------
    const institutionUserId = await createUser('Institution Admin', 'institution@demo.local', 'institution');
    const { rows: instRows } = await client.query(
      `INSERT INTO institutions (user_id, name, type, address, website, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [institutionUserId, 'Rashtriya Institute of Technology', 'Autonomous Engineering Institute',
       'Sector 22, Knowledge Park, New Delhi', 'https://rit.edu.example',
       'A premier autonomous engineering institution focused on producing industry-ready graduates.']
    );
    const institutionId = instRows[0].id;
    console.log('  ✓ institution');

    // ---------------- Companies / Industry ----------------
    const companyDefs = [
      ['industry@demo.local', 'TechNova Solutions', 'Artificial Intelligence & IT Services',
       'TechNova builds AI-powered enterprise products and platforms for global clients.',
       'https://technova.example', 'Bengaluru, India', '500-1000 employees'],
      ['recruiter2@demo.local', 'CloudSphere Systems', 'Cloud Infrastructure',
       'CloudSphere provides managed cloud and DevOps solutions to enterprises.',
       'https://cloudsphere.example', 'Pune, India', '200-500 employees'],
      ['recruiter3@demo.local', 'FinEdge Analytics', 'FinTech & Data Analytics',
       'FinEdge builds data-driven risk and analytics products for financial institutions.',
       'https://finedge.example', 'Mumbai, India', '100-200 employees'],
      ['recruiter4@demo.local', 'SecureNet Labs', 'Cybersecurity',
       'SecureNet Labs offers threat detection and security consulting services.',
       'https://securenetlabs.example', 'Hyderabad, India', '50-100 employees'],
      ['recruiter5@demo.local', 'NextGen Robotics', 'Robotics & Computer Vision',
       'NextGen Robotics develops autonomous robotics systems powered by computer vision.',
       'https://nextgenrobotics.example', 'Chennai, India', '100-200 employees'],
    ];
    const companyId = {};
    for (const [email, name, industry, description, website, location, size] of companyDefs) {
      const userId = await createUser(`${name} Recruiter`, email, 'industry');
      const { rows } = await client.query(
        `INSERT INTO companies (user_id, name, industry, description, website, location, size)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [userId, name, industry, description, website, location, size]
      );
      companyId[name] = rows[0].id;
    }
    console.log(`  ✓ ${companyDefs.length} companies`);

    // ---------------- Faculty ----------------
    const facultyDefs = [
      ['faculty@demo.local', 'Dr. Ananya Krishnan', 'Associate Professor', 'Computer Science & Engineering',
       'Ph.D in Machine Learning, IIT Delhi', ['Machine Learning', 'NLP', 'Deep Learning'],
       ['Explainable AI', 'Natural Language Processing', 'AI in Education'], 9,
       'Researches explainable AI and its applications in adaptive learning systems.'],
      ['faculty2@demo.local', 'Dr. Vikram Rao', 'Professor', 'Computer Science & Engineering',
       'Ph.D in Distributed Systems, IISc Bangalore', ['Cloud Computing', 'System Design', 'Kubernetes'],
       ['Distributed Systems', 'Cloud Security', 'Edge Computing'], 15,
       'Works on scalable distributed systems and cloud-native architectures.'],
      ['faculty3@demo.local', 'Dr. Meera Nair', 'Assistant Professor', 'Information Technology',
       'Ph.D in Cybersecurity, IIT Bombay', ['Cybersecurity', 'Networking'],
       ['Network Security', 'Threat Intelligence'], 6,
       'Focuses on applied cybersecurity and industrial security audits.'],
    ];
    const facultyUserId = {};
    for (const [email, name, designation, department, qualifications, expertise, research, exp, bio] of facultyDefs) {
      const userId = await createUser(name, email, 'faculty');
      facultyUserId[email] = userId;
      await client.query(
        `INSERT INTO faculty_profiles (user_id, institution_id, designation, department, qualifications, expertise, research_interests, experience_years, bio)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [userId, institutionId, designation, department, qualifications, expertise, research, exp, bio]
      );
    }
    console.log(`  ✓ ${facultyDefs.length} faculty profiles`);

    // ---------------- Students ----------------
    const studentDefs = [
      {
        email: 'student@demo.local', name: 'Aarav Sharma', degree: 'B.Tech', branch: 'Computer Science',
        college: 'Rashtriya Institute of Technology', gradYear: 2026, cgpa: 8.4,
        interests: ['Artificial Intelligence', 'Backend Development'], careerGoal: 'AI Engineer',
        location: 'New Delhi, India',
        bio: 'Final-year CS student passionate about building intelligent, production-grade AI systems.',
        skills: { Python: 88, 'Machine Learning': 74, SQL: 68, React: 61, FastAPI: 72, 'Deep Learning': 55,
                  Communication: 82, 'Problem Solving': 85, NLP: 48, Docker: 40 },
      },
      {
        email: 'student2@demo.local', name: 'Priya Patel', degree: 'B.Tech', branch: 'Information Technology',
        college: 'Rashtriya Institute of Technology', gradYear: 2026, cgpa: 9.1,
        interests: ['Data Science', 'Analytics'], careerGoal: 'Data Scientist',
        location: 'Mumbai, India',
        bio: 'Aspiring data scientist with strong statistical foundations and a love for storytelling with data.',
        skills: { Python: 82, Statistics: 78, 'Machine Learning': 70, SQL: 80, 'Data Analysis': 85,
                  'Data Visualization': 75, Communication: 70 },
      },
      {
        email: 'student3@demo.local', name: 'Rohan Verma', degree: 'B.Tech', branch: 'Computer Science',
        college: 'Rashtriya Institute of Technology', gradYear: 2025, cgpa: 7.8,
        interests: ['Web Development', 'Cloud'], careerGoal: 'Full Stack Developer',
        location: 'Bengaluru, India',
        bio: 'Full-stack developer who enjoys shipping polished, scalable web products end-to-end.',
        skills: { JavaScript: 85, React: 80, 'Node.js': 78, 'Express.js': 74, SQL: 60, 'HTML/CSS': 82,
                  'Tailwind CSS': 70, Git: 75, Teamwork: 78 },
      },
      {
        email: 'student4@demo.local', name: 'Sneha Iyer', degree: 'B.Tech', branch: 'Electronics & Computer',
        college: 'Rashtriya Institute of Technology', gradYear: 2026, cgpa: 8.9,
        interests: ['Cloud Infrastructure', 'DevOps'], careerGoal: 'Cloud Engineer',
        location: 'Pune, India',
        bio: 'Cloud enthusiast building CI/CD pipelines and scalable infra since sophomore year.',
        skills: { AWS: 70, Docker: 75, Kubernetes: 60, Linux: 72, Python: 55, 'System Design': 50 },
      },
      {
        email: 'student5@demo.local', name: 'Karan Mehta', degree: 'B.Tech', branch: 'Information Security',
        college: 'Rashtriya Institute of Technology', gradYear: 2025, cgpa: 8.0,
        interests: ['Cybersecurity', 'Ethical Hacking'], careerGoal: 'Cybersecurity Engineer',
        location: 'Hyderabad, India',
        bio: 'Security researcher who has contributed to two responsible disclosure programs.',
        skills: { Cybersecurity: 80, Networking: 75, Linux: 68, Python: 58, 'Critical Thinking': 72 },
      },
      {
        email: 'student6@demo.local', name: 'Isha Nair', degree: 'M.Tech', branch: 'Computer Science',
        college: 'Rashtriya Institute of Technology', gradYear: 2026, cgpa: 8.7,
        interests: ['AI', 'Robotics'], careerGoal: 'AI Engineer',
        location: 'Chennai, India',
        bio: 'Graduate researcher exploring computer vision applications for autonomous robotics.',
        skills: { Python: 80, 'Deep Learning': 70, TensorFlow: 65, 'Computer Vision': 68, SQL: 55, NLP: 50 },
      },
    ];

    const studentUserId = {};
    for (const s of studentDefs) {
      const userId = await createUser(s.name, s.email, 'student');
      studentUserId[s.email] = userId;
      await client.query(
        `INSERT INTO student_profiles (user_id, institution_id, degree, branch, college, graduation_year, cgpa, bio, interests, career_goal, location)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [userId, institutionId, s.degree, s.branch, s.college, s.gradYear, s.cgpa, s.bio, s.interests, s.careerGoal, s.location]
      );
      for (const [skillName, prof] of Object.entries(s.skills)) {
        await client.query(
          `INSERT INTO student_skills (student_id, skill_id, proficiency, assessment_score, source)
           VALUES ($1,$2,$3,$4,'assessment')`,
          [userId, skillId[skillName], prof, prof]
        );
      }
      // Readiness score: simple average of the student's own assessed proficiencies.
      const profValues = Object.values(s.skills);
      const readiness = Math.round(profValues.reduce((a, b) => a + b, 0) / profValues.length);
      await client.query('UPDATE student_profiles SET readiness_score = $2 WHERE user_id = $1', [userId, readiness]);
    }
    console.log(`  ✓ ${studentDefs.length} student profiles + skills`);

    // Assessment results for most demo students (drives institution "assessment completion" analytics).
    const assessedStudents = [
      ['student@demo.local', 'AI Engineer', 0, 78],
      ['student2@demo.local', 'Data Scientist', 1, 81],
      ['student3@demo.local', 'Full Stack Developer', 2, 74],
      ['student4@demo.local', 'Cloud Engineer', 3, 69],
      ['student5@demo.local', 'Cybersecurity Engineer', 4, 76],
    ];
    for (const [email, track, idx, score] of assessedStudents) {
      await client.query(
        `INSERT INTO assessment_results (student_id, career_track, skill_scores, overall_score)
         VALUES ($1,$2,$3,$4)`,
        [studentUserId[email], track, JSON.stringify(studentDefs[idx].skills), score]
      );
    }

    // Projects & certifications for primary demo student
    await client.query(
      `INSERT INTO projects (student_id, title, description, technologies, project_url) VALUES
       ($1,'AI Career Assistant Chatbot','A RAG-based chatbot that answers career questions using a student''s own profile data.',$2,'https://github.com/demo/ai-career-bot'),
       ($1,'Campus Marketplace App','A full-stack marketplace app for students to buy/sell used textbooks.',$3,'https://github.com/demo/campus-marketplace')`,
      [studentUserId['student@demo.local'], ['Python', 'LangChain', 'FastAPI', 'React'], ['React', 'Node.js', 'PostgreSQL']]
    );
    await client.query(
      `INSERT INTO certifications (student_id, name, issuer, issue_date, verification_status) VALUES
       ($1,'Machine Learning Specialization','Coursera / Stanford Online','2025-03-15','verified'),
       ($1,'AWS Cloud Practitioner','Amazon Web Services','2025-08-01','pending')`,
      [studentUserId['student@demo.local']]
    );

    // ---------------- Jobs & Internships ----------------
    const opportunities = [
      { company: 'TechNova Solutions', type: 'internship', title: 'AI Engineer Intern',
        description: 'Work with our applied AI team to build and fine-tune NLP models for enterprise search and support automation.',
        duration: '6 months', location: 'Bengaluru, India (Hybrid)', eligibility: 'B.Tech/M.Tech, CS/IT/ECE, 2025-2026 batch',
        min_cgpa: 7.0, stipend: '₹40,000/month', deadline: '2026-10-15',
        skills: [['Python', 80, 'required'], ['Machine Learning', 70, 'required'], ['NLP', 60, 'preferred'],
                 ['FastAPI', 50, 'preferred'], ['AWS', 40, 'preferred']] },
      { company: 'TechNova Solutions', type: 'job', title: 'Backend Developer',
        description: 'Design and build scalable backend services powering our AI products.',
        employment_type: 'Full-time', location: 'Bengaluru, India', eligibility: 'B.Tech CS/IT, 2025 or 2026 batch',
        min_cgpa: 7.5, salary_range: '₹9-14 LPA', deadline: '2026-11-01',
        skills: [['Node.js', 70, 'required'], ['Express.js', 65, 'required'], ['SQL', 60, 'required'],
                 ['Docker', 45, 'preferred'], ['System Design', 50, 'preferred']] },
      { company: 'CloudSphere Systems', type: 'internship', title: 'Cloud Engineer Intern',
        description: 'Assist in building and maintaining CI/CD pipelines and cloud infrastructure for enterprise clients.',
        duration: '4 months', location: 'Pune, India', eligibility: 'B.Tech, all branches, 2025-2026 batch',
        min_cgpa: 6.5, stipend: '₹30,000/month', deadline: '2026-10-05',
        skills: [['AWS', 65, 'required'], ['Docker', 60, 'required'], ['Kubernetes', 50, 'preferred'],
                 ['Linux', 55, 'required']] },
      { company: 'CloudSphere Systems', type: 'job', title: 'DevOps Engineer',
        description: 'Own the reliability, scalability and automation of our cloud infrastructure.',
        employment_type: 'Full-time', location: 'Pune, India', eligibility: 'B.Tech, 2025 batch or experienced',
        min_cgpa: 7.0, salary_range: '₹10-16 LPA', deadline: '2026-10-20',
        skills: [['AWS', 75, 'required'], ['Kubernetes', 65, 'required'], ['Docker', 70, 'required'],
                 ['Linux', 60, 'required'], ['System Design', 55, 'preferred']] },
      { company: 'FinEdge Analytics', type: 'internship', title: 'Data Analyst Intern',
        description: 'Analyze transactional data to identify fraud patterns and generate risk dashboards.',
        duration: '6 months', location: 'Mumbai, India', eligibility: 'B.Tech/B.Sc, any branch, 2025-2026 batch',
        min_cgpa: 7.0, stipend: '₹25,000/month', deadline: '2026-10-25',
        skills: [['SQL', 70, 'required'], ['Python', 55, 'required'], ['Data Analysis', 70, 'required'],
                 ['Data Visualization', 55, 'preferred']] },
      { company: 'FinEdge Analytics', type: 'job', title: 'Data Scientist',
        description: 'Build predictive models for credit risk and fraud detection at scale.',
        employment_type: 'Full-time', location: 'Mumbai, India', eligibility: 'B.Tech/M.Tech, 2025 batch',
        min_cgpa: 8.0, salary_range: '₹12-20 LPA', deadline: '2026-11-10',
        skills: [['Python', 80, 'required'], ['Machine Learning', 75, 'required'], ['Statistics', 70, 'required'],
                 ['SQL', 65, 'required'], ['Data Visualization', 45, 'preferred']] },
      { company: 'SecureNet Labs', type: 'internship', title: 'Cybersecurity Intern',
        description: 'Support our SOC team with vulnerability assessments and threat monitoring.',
        duration: '3 months', location: 'Hyderabad, India (Remote)', eligibility: 'B.Tech CS/IT/InfoSec, 2025-2026 batch',
        min_cgpa: 6.5, stipend: '₹20,000/month', deadline: '2026-10-12',
        skills: [['Cybersecurity', 65, 'required'], ['Networking', 60, 'required'], ['Linux', 50, 'preferred']] },
      { company: 'SecureNet Labs', type: 'job', title: 'Security Analyst',
        description: 'Perform security audits, penetration testing, and incident response for enterprise clients.',
        employment_type: 'Full-time', location: 'Hyderabad, India', eligibility: 'B.Tech, 2025 batch',
        min_cgpa: 7.0, salary_range: '₹8-13 LPA', deadline: '2026-11-05',
        skills: [['Cybersecurity', 75, 'required'], ['Networking', 70, 'required'], ['Critical Thinking', 55, 'preferred']] },
      { company: 'NextGen Robotics', type: 'internship', title: 'ML Intern - Computer Vision',
        description: 'Develop computer vision models for real-time object detection on robotics hardware.',
        duration: '6 months', location: 'Chennai, India', eligibility: 'B.Tech/M.Tech CS/ECE, 2025-2026 batch',
        min_cgpa: 7.5, stipend: '₹35,000/month', deadline: '2026-10-30',
        skills: [['Python', 75, 'required'], ['Deep Learning', 65, 'required'], ['TensorFlow', 55, 'preferred'],
                 ['Computer Vision', 60, 'required']] },
      { company: 'NextGen Robotics', type: 'job', title: 'Robotics Software Engineer',
        description: 'Build perception and control software for autonomous mobile robots.',
        employment_type: 'Full-time', location: 'Chennai, India', eligibility: 'B.Tech/M.Tech, 2025 batch',
        min_cgpa: 8.0, salary_range: '₹11-18 LPA', deadline: '2026-11-15',
        skills: [['Python', 75, 'required'], ['Deep Learning', 70, 'required'], ['Computer Vision', 70, 'required'],
                 ['C++', 45, 'preferred']] },
    ];

    const opportunityRef = []; // {id, type, title, company}
    for (const opp of opportunities) {
      const cId = companyId[opp.company];
      if (opp.type === 'internship') {
        const { rows } = await client.query(
          `INSERT INTO internships (company_id, title, description, duration, location, eligibility, min_cgpa, stipend, deadline)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
          [cId, opp.title, opp.description, opp.duration, opp.location, opp.eligibility, opp.min_cgpa, opp.stipend, opp.deadline]
        );
        opportunityRef.push({ id: rows[0].id, type: 'internship', title: opp.title, company: opp.company });
        for (const [skillName, reqProf, importance] of opp.skills) {
          await client.query(
            `INSERT INTO opportunity_skills (opportunity_id, opportunity_type, skill_id, required_proficiency, importance)
             VALUES ($1,'internship',$2,$3,$4)`,
            [rows[0].id, skillId[skillName], reqProf, importance]
          );
        }
      } else {
        const { rows } = await client.query(
          `INSERT INTO jobs (company_id, title, description, employment_type, location, eligibility, min_cgpa, salary_range, deadline)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
          [cId, opp.title, opp.description, opp.employment_type, opp.location, opp.eligibility, opp.min_cgpa, opp.salary_range, opp.deadline]
        );
        opportunityRef.push({ id: rows[0].id, type: 'job', title: opp.title, company: opp.company });
        for (const [skillName, reqProf, importance] of opp.skills) {
          await client.query(
            `INSERT INTO opportunity_skills (opportunity_id, opportunity_type, skill_id, required_proficiency, importance)
             VALUES ($1,'job',$2,$3,$4)`,
            [rows[0].id, skillId[skillName], reqProf, importance]
          );
        }
      }
    }
    console.log(`  ✓ ${opportunities.length} jobs/internships`);

    function findOpp(title) { return opportunityRef.find(o => o.title === title); }

    // ---------------- Applications ----------------
    const applicationDefs = [
      ['student@demo.local', 'AI Engineer Intern', 'shortlisted', 89],
      ['student@demo.local', 'Backend Developer', 'under_review', 76],
      ['student@demo.local', 'ML Intern - Computer Vision', 'applied', 71],
      ['student2@demo.local', 'Data Scientist', 'interview', 91],
      ['student2@demo.local', 'Data Analyst Intern', 'selected', 88],
      ['student3@demo.local', 'Backend Developer', 'applied', 68],
      ['student3@demo.local', 'DevOps Engineer', 'rejected', 52],
      ['student4@demo.local', 'Cloud Engineer Intern', 'shortlisted', 85],
      ['student4@demo.local', 'DevOps Engineer', 'applied', 74],
      ['student5@demo.local', 'Cybersecurity Intern', 'selected', 90],
      ['student5@demo.local', 'Security Analyst', 'interview', 82],
      ['student6@demo.local', 'ML Intern - Computer Vision', 'shortlisted', 87],
      ['student6@demo.local', 'AI Engineer Intern', 'applied', 79],
    ];
    for (const [email, title, status, score] of applicationDefs) {
      const opp = findOpp(title);
      await client.query(
        `INSERT INTO applications (student_id, opportunity_id, opportunity_type, status, match_score)
         VALUES ($1,$2,$3,$4,$5)`,
        [studentUserId[email], opp.id, opp.type, status, score]
      );
    }
    console.log(`  ✓ ${applicationDefs.length} applications`);

    // ---------------- Faculty opportunities ----------------
    const facultyOppDefs = [
      ['TechNova Solutions', 'fdp', 'FDP: AI in Education', 'A 1-week faculty development program on applying AI to personalized learning.', ['Machine Learning', 'AI in Education'], 'Bengaluru, India', '2026-11-20'],
      ['CloudSphere Systems', 'industrial_training', 'Industrial Training: Cloud-Native Architectures', '2-week immersive industrial training for faculty on cloud-native systems.', ['Cloud Computing', 'Kubernetes'], 'Pune, India', '2026-12-01'],
      ['NextGen Robotics', 'research_collaboration', 'Research Collaboration: Vision-Language Models for Robotics', 'Joint research collaboration exploring vision-language models for robotic perception.', ['Natural Language Processing', 'Computer Vision'], 'Chennai, India', '2026-12-15'],
      ['SecureNet Labs', 'consultancy', 'Consultancy: Enterprise Security Audit', 'Paid consultancy engagement to audit enterprise clients\' security posture.', ['Network Security', 'Threat Intelligence'], 'Hyderabad, India (Remote)', '2026-10-31'],
      ['CloudSphere Systems', 'workshop', 'Workshop: Designing for Cloud Scale', 'A hands-on workshop for faculty and students on cloud architecture design patterns.', ['Cloud Security', 'Distributed Systems'], 'Pune, India', '2026-11-05'],
      ['FinEdge Analytics', 'mentorship', 'Mentorship: FinTech Student Startups', 'Mentor student-led fintech startup teams over one semester.', ['Data Analysis'], 'Mumbai, India (Remote)', '2026-11-30'],
    ];
    const facultyOppId = {};
    for (const [company, type, title, description, expertise, location, deadline] of facultyOppDefs) {
      const { rows } = await client.query(
        `INSERT INTO faculty_opportunities (company_id, type, title, description, required_expertise, location, deadline)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [companyId[company], type, title, description, expertise, location, deadline]
      );
      facultyOppId[title] = rows[0].id;
    }
    console.log(`  ✓ ${facultyOppDefs.length} faculty opportunities`);

    await client.query(
      `INSERT INTO faculty_applications (faculty_id, opportunity_id, status) VALUES
       ($1,$2,'shortlisted'), ($1,$3,'applied'),
       ($4,$5,'selected'), ($6,$7,'under_review')`,
      [
        facultyUserId['faculty@demo.local'], facultyOppId['FDP: AI in Education'], facultyOppId['Research Collaboration: Vision-Language Models for Robotics'],
        facultyUserId['faculty2@demo.local'], facultyOppId['Industrial Training: Cloud-Native Architectures'],
        facultyUserId['faculty3@demo.local'], facultyOppId['Consultancy: Enterprise Security Audit'],
      ]
    );
    console.log('  ✓ faculty applications');

    // ---------------- Notifications for primary demo student ----------------
    await client.query(
      `INSERT INTO notifications (user_id, title, message) VALUES
       ($1,'Application Shortlisted','You have been shortlisted for AI Engineer Intern at TechNova Solutions.'),
       ($1,'New Recommendation','3 new internships match your AI Engineer career goal.'),
       ($1,'Assessment Reminder','Complete your Full Stack Developer assessment to unlock more recommendations.')`,
      [studentUserId['student@demo.local']]
    );

    await client.query('COMMIT');
    console.log('✅ Seed complete.');
    console.log('\nDemo credentials (password for all: Demo@123):');
    console.log('  student@demo.local     (Student — Aarav Sharma)');
    console.log('  industry@demo.local    (Industry — TechNova Solutions)');
    console.log('  faculty@demo.local     (Faculty — Dr. Ananya Krishnan)');
    console.log('  institution@demo.local (Institution — Rashtriya Institute of Technology)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) run();
module.exports = run;
