import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as studentsApi from '../../api/students';
import DataState from '../../components/DataState';
import Tabs from '../../components/Tabs';
import ProgressBar from '../../components/ProgressBar';
import Modal from '../../components/Modal';
import { proficiencyColor } from '../../utils/format';
import ResumePanel from './components/ResumePanel';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'skills', label: 'Skills' },
  { value: 'projects', label: 'Projects' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'resume', label: 'Resume (AI)' },
];

export default function StudentProfile() {
  const [tab, setTab] = useState('overview');
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([studentsApi.getProfile(), studentsApi.getCareerTracks()]),
    []
  );

  return (
    <DataState loading={loading} error={error} data={data} onRetry={reload}>
      {([profile, careerTracks]) => (
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
          <div className="card">
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            <div className="p-5">
              {tab === 'overview' && <OverviewTab profile={profile} careerTracks={careerTracks} onSaved={reload} />}
              {tab === 'skills' && <SkillsTab />}
              {tab === 'projects' && <ProjectsTab />}
              {tab === 'certifications' && <CertificationsTab />}
              {tab === 'resume' && <ResumePanel onConfirmed={reload} />}
            </div>
          </div>
        </div>
      )}
    </DataState>
  );
}

function OverviewTab({ profile, careerTracks, onSaved }) {
  const { push } = useToast();
  const [form, setForm] = useState({
    degree: profile.degree || '',
    branch: profile.branch || '',
    college: profile.college || '',
    graduation_year: profile.graduation_year || '',
    cgpa: profile.cgpa || '',
    bio: profile.bio || '',
    interests: (profile.interests || []).join(', '),
    career_goal: profile.career_goal || '',
    location: profile.location || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentsApi.updateProfile({
        ...form,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        cgpa: form.cgpa ? Number(form.cgpa) : null,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
      });
      push('Profile updated.', 'success');
      onSaved();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Degree</label>
          <input className="input" value={form.degree} onChange={set('degree')} placeholder="B.Tech" />
        </div>
        <div>
          <label className="label">Branch</label>
          <input className="input" value={form.branch} onChange={set('branch')} placeholder="Computer Science" />
        </div>
        <div>
          <label className="label">College</label>
          <input className="input" value={form.college} onChange={set('college')} />
        </div>
        <div>
          <label className="label">Graduation year</label>
          <input className="input" type="number" value={form.graduation_year} onChange={set('graduation_year')} />
        </div>
        <div>
          <label className="label">CGPA</label>
          <input className="input" type="number" step="0.01" value={form.cgpa} onChange={set('cgpa')} />
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={set('location')} />
        </div>
      </div>
      <div>
        <label className="label">Career goal</label>
        <select className="input" value={form.career_goal} onChange={set('career_goal')}>
          <option value="">Select a target career…</option>
          {careerTracks.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Interests (comma-separated)</label>
        <input className="input" value={form.interests} onChange={set('interests')} placeholder="AI, Backend Development" />
      </div>
      <div>
        <label className="label">Bio</label>
        <textarea className="input" rows={3} value={form.bio} onChange={set('bio')} />
      </div>
      <button className="btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

function SkillsTab() {
  const { data: skills, loading, error, reload } = useAsync(() => studentsApi.listSkills(), []);
  const [showAdd, setShowAdd] = useState(false);
  const { push } = useToast();

  const remove = async (skillId) => {
    try {
      await studentsApi.deleteSkill(skillId);
      push('Skill removed.', 'success');
      reload();
    } catch (err) {
      push(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-800">Your skills</h3>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(true)}>
          + Add skill
        </button>
      </div>
      <DataState
        loading={loading}
        error={error}
        data={skills}
        onRetry={reload}
        empty={<p className="text-sm text-slate-500">No skills yet. Add one, or take a skill assessment.</p>}
      >
        {(list) => (
          <div className="space-y-4">
            {list.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar label={s.name} sublabel={`${s.proficiency}%`} value={s.proficiency} color={proficiencyColor(s.proficiency)} />
                </div>
                <button onClick={() => remove(s.id)} className="text-slate-400 hover:text-red-500 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </DataState>
      <AddSkillModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={reload} />
    </div>
  );
}

function AddSkillModal({ open, onClose, onAdded }) {
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState(50);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentsApi.upsertSkill({ skill_name: name, proficiency: Number(proficiency) });
      push('Skill added.', 'success');
      setName('');
      setProficiency(50);
      onAdded();
      onClose();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a skill">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Skill name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Python" />
        </div>
        <div>
          <label className="label">Proficiency: {proficiency}%</label>
          <input type="range" min="0" max="100" value={proficiency} onChange={(e) => setProficiency(e.target.value)} className="w-full" />
        </div>
        <button className="btn-primary w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Add skill'}
        </button>
      </form>
    </Modal>
  );
}

function ProjectsTab() {
  const { data: projects, loading, error, reload } = useAsync(() => studentsApi.listProjects(), []);
  const [showAdd, setShowAdd] = useState(false);
  const { push } = useToast();

  const remove = async (id) => {
    try {
      await studentsApi.deleteProject(id);
      push('Project removed.', 'success');
      reload();
    } catch (err) {
      push(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-800">Your projects</h3>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(true)}>
          + Add project
        </button>
      </div>
      <DataState loading={loading} error={error} data={projects} onRetry={reload} empty={<p className="text-sm text-slate-500">No projects yet.</p>}>
        {(list) => (
          <div className="grid sm:grid-cols-2 gap-4">
            {list.map((p) => (
              <div key={p.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-slate-900">{p.title}</h4>
                  <button onClick={() => remove(p.id)} className="text-slate-400 hover:text-red-500 text-xs">
                    Remove
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                {p.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.technologies.map((t) => (
                      <span key={t} className="badge bg-slate-100 text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {p.project_url && (
                  <a href={p.project_url} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
                    View project →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </DataState>
      <AddProjectModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={reload} />
    </div>
  );
}

function AddProjectModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', description: '', technologies: '', project_url: '' });
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentsApi.addProject({ ...form, technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean) });
      push('Project added.', 'success');
      setForm({ title: '', description: '', technologies: '', project_url: '' });
      onAdded();
      onClose();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a project">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
        </div>
        <div>
          <label className="label">Technologies (comma-separated)</label>
          <input className="input" value={form.technologies} onChange={set('technologies')} placeholder="React, Node.js" />
        </div>
        <div>
          <label className="label">Project URL</label>
          <input className="input" value={form.project_url} onChange={set('project_url')} placeholder="https://github.com/…" />
        </div>
        <button className="btn-primary w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Add project'}
        </button>
      </form>
    </Modal>
  );
}

function CertificationsTab() {
  const { data: certs, loading, error, reload } = useAsync(() => studentsApi.listCertifications(), []);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-800">Your certifications</h3>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(true)}>
          + Add certification
        </button>
      </div>
      <DataState loading={loading} error={error} data={certs} onRetry={reload} empty={<p className="text-sm text-slate-500">No certifications yet.</p>}>
        {(list) => (
          <div className="space-y-3">
            {list.map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.issuer}</p>
                </div>
                <span className={`badge ${c.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} capitalize`}>
                  {c.verification_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </DataState>
      <AddCertModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={reload} />
    </div>
  );
}

function AddCertModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', issuer: '', issue_date: '' });
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentsApi.addCertification(form);
      push('Certification added — pending verification.', 'success');
      setForm({ name: '', issuer: '', issue_date: '' });
      onAdded();
      onClose();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a certification">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Certification name</label>
          <input className="input" required value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Issuer</label>
          <input className="input" value={form.issuer} onChange={set('issuer')} placeholder="e.g. Coursera" />
        </div>
        <div>
          <label className="label">Issue date</label>
          <input className="input" type="date" value={form.issue_date} onChange={set('issue_date')} />
        </div>
        <button className="btn-primary w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Add certification'}
        </button>
      </form>
    </Modal>
  );
}
