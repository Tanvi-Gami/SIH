import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from '../components/NotificationBell';

const NAV_BY_ROLE = {
  student: [
    { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/student/profile', label: 'Profile', icon: '👤' },
    { to: '/student/assessment', label: 'Skill Assessment', icon: '🎯' },
    { to: '/student/skill-gap', label: 'Skill Gap', icon: '📊' },
    { to: '/student/opportunities', label: 'Opportunities', icon: '💼' },
    { to: '/student/applications', label: 'Applications', icon: '📋' },
    { to: '/student/learning', label: 'Learning', icon: '📚' },
    { to: '/student/portfolio', label: 'Portfolio', icon: '🪪' },
    { to: '/student/assistant', label: 'AI Assistant', icon: '✨' },
  ],
  industry: [
    { to: '/industry', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/industry/company', label: 'Company Profile', icon: '🏢' },
    { to: '/industry/opportunities', label: 'Jobs & Internships', icon: '💼' },
    { to: '/industry/applicants', label: 'Applicants', icon: '📋' },
    { to: '/industry/candidates', label: 'Candidate Search', icon: '🔍' },
    { to: '/industry/faculty-programs', label: 'Faculty Programs', icon: '🎓' },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/faculty/profile', label: 'Profile', icon: '👤' },
    { to: '/faculty/opportunities', label: 'Opportunities', icon: '🎓' },
    { to: '/faculty/applications', label: 'My Applications', icon: '📋' },
  ],
  institution: [
    { to: '/institution', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/institution/students', label: 'Students', icon: '👥' },
    { to: '/institution/analytics', label: 'Analytics', icon: '📈' },
    { to: '/institution/profile', label: 'Profile', icon: '🏛️' },
  ],
};

const ROLE_LABEL = { student: 'Student', industry: 'Industry', faculty: 'Faculty', institution: 'Institution' };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_BY_ROLE[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white">
        <SidebarContent navItems={navItems} user={user} onLogout={handleLogout} />
      </aside>

      {/* Sidebar (mobile drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white flex flex-col">
            <SidebarContent navItems={navItems} user={user} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button className="lg:hidden text-slate-600" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <span className="hidden lg:block text-sm text-slate-400">{ROLE_LABEL[user?.role]} workspace</span>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user?.name}</span>
            <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, user, onLogout, onNavigate }) {
  return (
    <>
      <div className="h-14 flex items-center gap-2 px-5 border-b border-slate-200">
        <div className="h-7 w-7 rounded-md bg-brand-600 text-white flex items-center justify-center text-sm font-bold">S</div>
        <span className="font-bold text-slate-900">Skillbridge</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        <button onClick={onLogout} className="btn-ghost w-full justify-start">
          🚪 Log out
        </button>
      </div>
    </>
  );
}
