import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as companiesApi from '../../api/companies';
import DataState from '../../components/DataState';

export default function IndustryCompanyProfile() {
  const { data: company, loading, error, reload } = useAsync(() => companiesApi.getMyCompany(), []);
  const { push } = useToast();

  return (
    <DataState loading={loading} error={error} data={company} onRetry={reload}>
      {(c) => <Form company={c} onSaved={reload} push={push} />}
    </DataState>
  );
}

function Form({ company, onSaved, push }) {
  const [form, setForm] = useState({
    name: company.name || '',
    industry: company.industry || '',
    description: company.description || '',
    website: company.website || '',
    location: company.location || '',
    size: company.size || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companiesApi.updateMyCompany(form);
      push('Company profile updated.', 'success');
      onSaved();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Company Profile</h1>
      <form onSubmit={submit} className="card p-5 space-y-4">
        <div>
          <label className="label">Company name</label>
          <input className="input" required value={form.name} onChange={set('name')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Industry</label>
            <input className="input" value={form.industry} onChange={set('industry')} />
          </div>
          <div>
            <label className="label">Company size</label>
            <input className="input" value={form.size} onChange={set('size')} placeholder="e.g. 100-200 employees" />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set('location')} />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website} onChange={set('website')} />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={set('description')} />
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
