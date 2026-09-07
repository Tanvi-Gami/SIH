import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import * as institutionsApi from '../../api/institutions';
import DataState from '../../components/DataState';

export default function InstitutionProfile() {
  const { data: institution, loading, error, reload } = useAsync(() => institutionsApi.getMyInstitution(), []);
  const { push } = useToast();

  return (
    <DataState loading={loading} error={error} data={institution} onRetry={reload}>
      {(inst) => <Form institution={inst} onSaved={reload} push={push} />}
    </DataState>
  );
}

function Form({ institution, onSaved, push }) {
  const [form, setForm] = useState({
    name: institution.name || '',
    type: institution.type || '',
    address: institution.address || '',
    website: institution.website || '',
    description: institution.description || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await institutionsApi.updateMyInstitution(form);
      push('Institution profile updated.', 'success');
      onSaved();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Institution Profile</h1>
      <form onSubmit={submit} className="card p-5 space-y-4">
        <div>
          <label className="label">Institution name</label>
          <input className="input" required value={form.name} onChange={set('name')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <input className="input" value={form.type} onChange={set('type')} />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website} onChange={set('website')} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={set('address')} />
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
