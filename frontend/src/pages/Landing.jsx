import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import * as miscApi from '../api/misc';

const ROLE_HOME = { student: '/student', industry: '/industry', faculty: '/faculty', institution: '/institution' };

const FEATURES = [
  { icon: '🧠', title: 'AI Skill Gap Analysis', desc: 'See exactly which skills separate you from your target career, ranked by real industry demand.' },
  { icon: '📄', title: 'AI Resume Analysis', desc: 'Upload your resume and let AI extract skills, projects and experience — you confirm before anything is saved.' },
  { icon: '🎯', title: 'Explainable Matching', desc: 'Every recommendation shows its match score AND why — matched skills, gaps, and career alignment.' },
  { icon: '🔍', title: 'Semantic Search', desc: 'Search opportunities in plain English — powered by vector similarity, not just keyword matching.' },
  { icon: '💬', title: 'AI Career Assistant', desc: 'Ask real questions about your gaps, applications and roadmap — grounded in your actual profile data.' },
  { icon: '📈', title: 'Institutional Intelligence', desc: 'Institutions see skill distributions, industry demand trends, and placement readiness in real time.' },
];

const STEPS = ['Assess', 'Analyze', 'Learn', 'Match', 'Apply', 'Recruit', 'Measure', 'Improve'];

export default function Landing() {
  const { user } = useAuth();
  const { data: stats } = useAsync(() => miscApi.platformStats(), []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">S</div>
            <span className="text-lg font-bold text-slate-900">Skillbridge</span>
          </div>
          {user ? (
            <Link to={ROLE_HOME[user.role] || '/'} className="btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <span className="badge bg-brand-50 text-brand-700 mb-5">SIH 26SIH044 · Industry-Academia-Student Ecosystem</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight max-w-3xl mx-auto">
          One intelligent ecosystem for students, faculty, institutions and industry.
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
          AI analyzes skills and career goals, matches students to the right opportunities and learning paths, and
          gives institutions real visibility into industry demand — all explainable, none of it a black box.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Create free account
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">
            View demo
          </Link>
        </div>

        {stats && (
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <Stat label="Students" value={stats.students} />
            <Stat label="Companies" value={stats.companies} />
            <Stat label="Open opportunities" value={stats.open_jobs + stats.open_internships} />
            <Stat label="Students placed" value={stats.students_placed} />
          </div>
        )}
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Everything runs on real data flow</h2>
          <p className="text-center text-slate-500 mb-10">Not static dashboards — a continuous, measurable loop.</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="badge bg-white border border-slate-200 text-slate-700 px-3 py-1.5">{step}</span>
                {i < STEPS.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">What makes it intelligent</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        Built for Smart India Hackathon — Problem Statement 26SIH044.
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}
