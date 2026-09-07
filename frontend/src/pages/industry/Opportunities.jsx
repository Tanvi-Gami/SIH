import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as oppApi from '../../api/opportunities';
import Tabs from '../../components/Tabs';
import Modal from '../../components/Modal';
import { StatusBadge } from '../../components/Badge';
import { EmptyState } from '../../components/States';
import { formatDate } from '../../utils/format';

export default function IndustryOpportunities() {
  const { data, loading, error, reload } = useAsync(() => oppApi.myOpportunities(), []);
  const [type, setType] = useState('internship');
  const [showPost, setShowPost] = useState(false);
  const { push } = useToast();

  const toggleStatus = async (item, currentType) => {
    try {
      const next = item.status === 'open' ? 'closed' : 'open';
      if (currentType === 'job') await oppApi.updateJobStatus(item.id, next);
      else await oppApi.updateInternshipStatus(item.id, next);
      push(`Marked as ${next}.`, 'success');
      reload();
    } catch (err) {
      push(err.message, 'error');
    }
  };

  if (loading) return null;
  if (error) return <p className="text-sm text-red-600">{error.message}</p>;

  const list = type === 'internship' ? data.internships : data.jobs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Jobs & Internships</h1>
        <button className="btn-primary" onClick={() => setShowPost(true)}>
          + Post new
        </button>
      </div>

      <Tabs
        tabs={[
          { value: 'internship', label: `Internships (${data.internships.length})` },
          { value: 'job', label: `Jobs (${data.jobs.length})` },
        ]}
        active={type}
        onChange={setType}
      />

      {list.length === 0 ? (
        <EmptyState icon="💼" title={`No ${type}s posted yet.`} action={<button className="btn-primary" onClick={() => setShowPost(true)}>Post one</button>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{o.title}</td>
                  <td className="px-4 py-3 text-slate-500">{o.location}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(o.deadline)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-brand-600 hover:underline text-xs" onClick={() => toggleStatus(o, type)}>
                      Mark as {o.status === 'open' ? 'closed' : 'open'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PostOpportunityModal open={showPost} onClose={() => setShowPost(false)} onPosted={reload} />
    </div>
  );
}

function PostOpportunityModal({ open, onClose, onPosted }) {
  const { push } = useToast();
  const [type, setType] = useState('internship');
  const [form, setForm] = useState({
    title: '', description: '', location: '', eligibility: '', min_cgpa: '', deadline: '',
    duration: '', stipend: '', employment_type: 'Full-time', salary_range: '',
  });
  const [skillRows, setSkillRows] = useState([{ skill_name: '', required_proficiency: 60, importance: 'required' }]);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateSkillRow = (idx, key, value) => {
    setSkillRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        min_cgpa: form.min_cgpa ? Number(form.min_cgpa) : null,
        required_skills: skillRows.filter((r) => r.skill_name.trim()),
      };
      if (type === 'internship') await oppApi.createInternship(payload);
      else await oppApi.createJob(payload);
      push(`${type === 'internship' ? 'Internship' : 'Job'} posted!`, 'success');
      onPosted();
      onClose();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post a new opportunity" maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2">
          {['internship', 'job'].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`btn-secondary flex-1 capitalize ${type === t ? 'bg-brand-50 border-brand-300 text-brand-700' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} required value={form.description} onChange={set('description')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set('location')} />
          </div>
          <div>
            <label className="label">Eligibility</label>
            <input className="input" value={form.eligibility} onChange={set('eligibility')} placeholder="e.g. B.Tech CS/IT, 2026 batch" />
          </div>
          <div>
            <label className="label">Minimum CGPA</label>
            <input className="input" type="number" step="0.1" value={form.min_cgpa} onChange={set('min_cgpa')} />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={set('deadline')} />
          </div>
          {type === 'internship' ? (
            <>
              <div>
                <label className="label">Duration</label>
                <input className="input" value={form.duration} onChange={set('duration')} placeholder="e.g. 6 months" />
              </div>
              <div>
                <label className="label">Stipend</label>
                <input className="input" value={form.stipend} onChange={set('stipend')} placeholder="e.g. ₹30,000/month" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label">Employment type</label>
                <input className="input" value={form.employment_type} onChange={set('employment_type')} />
              </div>
              <div>
                <label className="label">Salary range</label>
                <input className="input" value={form.salary_range} onChange={set('salary_range')} placeholder="e.g. ₹10-16 LPA" />
              </div>
            </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Required skills</label>
            <button type="button" className="text-xs text-brand-600 hover:underline" onClick={() => setSkillRows((r) => [...r, { skill_name: '', required_proficiency: 60, importance: 'required' }])}>
              + Add skill
            </button>
          </div>
          <div className="space-y-2">
            {skillRows.map((row, idx) => (
              <div key={idx} className="flex gap-2">
                <input className="input flex-1" placeholder="Skill name" value={row.skill_name} onChange={(e) => updateSkillRow(idx, 'skill_name', e.target.value)} />
                <input
                  className="input w-24"
                  type="number"
                  min="0"
                  max="100"
                  value={row.required_proficiency}
                  onChange={(e) => updateSkillRow(idx, 'required_proficiency', Number(e.target.value))}
                />
                <select className="input w-32" value={row.importance} onChange={(e) => updateSkillRow(idx, 'importance', e.target.value)}>
                  <option value="required">Required</option>
                  <option value="preferred">Preferred</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full" disabled={saving}>
          {saving ? 'Posting…' : `Post ${type}`}
        </button>
      </form>
    </Modal>
  );
}
