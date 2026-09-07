import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'student@demo.local' },
  { role: 'Industry', email: 'industry@demo.local' },
  { role: 'Faculty', email: 'faculty@demo.local' },
  { role: 'Institution', email: 'institution@demo.local' },
];

const ROLE_HOME = { student: '/student', industry: '/industry', faculty: '/faculty', institution: '/institution' };

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      push(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h1>
      <p className="text-sm text-slate-500 mb-6">Log in to your Skillbridge account.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-4 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Demo accounts (password: Demo@123)</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword('Demo@123');
              }}
              className="text-left text-xs rounded-lg border border-slate-200 px-2.5 py-2 hover:bg-slate-50"
            >
              <span className="block font-medium text-slate-700">{acc.role}</span>
              <span className="block text-slate-400 truncate">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
