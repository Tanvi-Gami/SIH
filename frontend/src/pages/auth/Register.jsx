import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const ROLES = [
  { value: 'student', label: 'Student', icon: '🎓' },
  { value: 'industry', label: 'Industry', icon: '🏢' },
  { value: 'faculty', label: 'Faculty', icon: '👩‍🏫' },
  { value: 'institution', label: 'Institution', icon: '🏛️' },
];
const ROLE_HOME = { student: '/student', industry: '/industry', faculty: '/faculty', institution: '/institution' };

export default function Register() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await register(form);
      push('Account created! Welcome to Skillbridge.', 'success');
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.errors?.[0]?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Create your account</h1>
      <p className="text-sm text-slate-500 mb-6">Join the industry-academia ecosystem.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  form.role === r.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
