import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as facultyApi from '../../api/faculty';
import DataState from '../../components/DataState';

export default function FacultyProfile() {
  const { data: profile, loading, error, reload } = useAsync(() => facultyApi.getProfile(), []);
  const { push } = useToast();

  return (
    <DataState loading={loading} error={error} data={profile} onRetry={reload}>
      {(p) => <Form profile={p} onSaved={reload} push={push} />}
    </DataState>
  );
}

function Form({ profile, onSaved, push }) {
  const [form, setForm] = useState({
    designation: profile.designation || '',
    department: profile.department || '',
    qualifications: profile.qualifications || '',
    expertise: (profile.expertise || []).join(', '),
    research_interests: (profile.research_interests || []).join(', '),
    experience_years: profile.experience_years || '',
    bio: profile.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await facultyApi.updateProfile({
        ...form,
        experience_years: form.experience_years ? Number(form.experience_years) : 0,
        expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean),
        research_interests: form.research_interests.split(',').map((s) => s.trim()).filter(Boolean),
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
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Faculty Profile</h1>
      <form onSubmit={submit} className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Designation</label>
            <input className="input" value={form.designation} onChange={set('designation')} />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" value={form.department} onChange={set('department')} />
          </div>
          <div>
            <label className="label">Years of experience</label>
            <input className="input" type="number" value={form.experience_years} onChange={set('experience_years')} />
          </div>
        </div>
        <div>
          <label className="label">Qualifications</label>
          <input className="input" value={form.qualifications} onChange={set('qualifications')} />
        </div>
        <div>
          <label className="label">Expertise (comma-separated)</label>
          <input className="input" value={form.expertise} onChange={set('expertise')} placeholder="Machine Learning, NLP" />
        </div>
        <div>
          <label className="label">Research interests (comma-separated)</label>
          <input className="input" value={form.research_interests} onChange={set('research_interests')} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={3} value={form.bio} onChange={set('bio')} />
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
