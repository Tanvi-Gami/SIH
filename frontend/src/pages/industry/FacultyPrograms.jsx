import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as facultyApi from '../../api/faculty';
import Modal from '../../components/Modal';
import Tabs from '../../components/Tabs';
import { StatusBadge } from '../../components/Badge';
import { EmptyState } from '../../components/States';
import DataState from '../../components/DataState';

const TYPES = [
  { value: 'fdp', label: 'Faculty Development Program' },
  { value: 'industrial_training', label: 'Industrial Training' },
  { value: 'consultancy', label: 'Consultancy' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'research_collaboration', label: 'Research Collaboration' },
];
const STATUS_OPTIONS = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];

export default function IndustryFacultyPrograms() {
  const [tab, setTab] = useState('applicants');
  const [showPost, setShowPost] = useState(false);
  const { data: applicants, loading, error, reload } = useAsync(() => facultyApi.listApplicantsForCompany(), []);
  const { push } = useToast();

  const updateStatus = async (id, status) => {
    try {
      await facultyApi.updateApplicationStatus(id, status);
      push('Status updated.', 'success');
      reload();
    } catch (err) {
      push(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Faculty Programs</h1>
        <button className="btn-primary" onClick={() => setShowPost(true)}>
          + Post opportunity
        </button>
      </div>
      <Tabs tabs={[{ value: 'applicants', label: 'Applicants' }]} active={tab} onChange={setTab} />

      <DataState loading={loading} error={error} data={applicants} onRetry={reload} empty={<EmptyState icon="🎓" title="No faculty applications yet." />}>
        {(list) => (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Faculty</th>
                  <th className="px-4 py-3 font-medium">Opportunity</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{a.faculty_name}</p>
                      <p className="text-xs text-slate-400">{a.designation}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.opportunity_title}</td>
                    <td className="px-4 py-3 text-slate-500">{a.department}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <select className="input py-1 text-xs" value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataState>

      <PostModal open={showPost} onClose={() => setShowPost(false)} onPosted={reload} />
    </div>
  );
}

function PostModal({ open, onClose, onPosted }) {
  const { push } = useToast();
  const [form, setForm] = useState({ type: 'fdp', title: '', description: '', required_expertise: '', location: '', deadline: '' });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await facultyApi.createOpportunity({
        ...form,
        required_expertise: form.required_expertise.split(',').map((s) => s.trim()).filter(Boolean),
      });
      push('Faculty opportunity posted.', 'success');
      onPosted();
      onClose();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post a faculty opportunity">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={set('type')}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
        </div>
        <div>
          <label className="label">Required expertise (comma-separated)</label>
          <input className="input" value={form.required_expertise} onChange={set('required_expertise')} placeholder="e.g. Machine Learning, NLP" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set('location')} />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={set('deadline')} />
          </div>
        </div>
        <button className="btn-primary w-full" disabled={saving}>
          {saving ? 'Posting…' : 'Post opportunity'}
        </button>
      </form>
    </Modal>
  );
}
