import { useRef, useState } from 'react';
import * as aiApi from '../../../api/ai';
import { useToast } from '../../../hooks/useToast';
import { Spinner } from '../../../components/States';

export default function ResumePanel({ onConfirmed }) {
  const fileRef = useRef();
  const { push } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [extraction, setExtraction] = useState(null);
  const [selected, setSelected] = useState({ skills: new Set(), projects: new Set(), certifications: new Set() });
  const [confirming, setConfirming] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setExtraction(null);
    try {
      const result = await aiApi.analyzeResume(file);
      setExtraction(result);
      setSelected({
        skills: new Set(result.skills || []),
        projects: new Set((result.projects || []).map((_, i) => i)),
        certifications: new Set((result.certifications || []).map((_, i) => i)),
      });
      push('Resume analyzed! Review and confirm what to save.', 'success');
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setAnalyzing(false);
      e.target.value = '';
    }
  };

  const toggle = (group, key) => {
    setSelected((s) => {
      const next = new Set(s[group]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...s, [group]: next };
    });
  };

  const confirm = async () => {
    setConfirming(true);
    try {
      await aiApi.confirmResumeData({
        skills: [...selected.skills],
        projects: (extraction.projects || []).filter((_, i) => selected.projects.has(i)),
        certifications: (extraction.certifications || []).filter((_, i) => selected.certifications.has(i)),
      });
      push('Saved to your profile.', 'success');
      setExtraction(null);
      onConfirmed?.();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
        <p className="text-3xl mb-2">📄</p>
        <p className="text-sm font-medium text-slate-700">Upload your resume for AI analysis</p>
        <p className="text-xs text-slate-500 mt-1">PDF, DOC(X), or plain text — we'll extract skills, projects and experience.</p>
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFile} />
        <button className="btn-primary mt-4" onClick={() => fileRef.current.click()} disabled={analyzing}>
          {analyzing ? (
            <>
              <Spinner className="text-white" /> Analyzing…
            </>
          ) : (
            'Choose file'
          )}
        </button>
      </div>

      {extraction && (
        <div className="mt-6 space-y-5">
          <div className="rounded-lg bg-brand-50 text-brand-800 text-sm px-4 py-3">
            Review the AI extraction below and uncheck anything that isn't right — only checked items are saved to your profile.
          </div>

          {extraction.career_roles?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Suggested roles</h4>
              <div className="flex flex-wrap gap-2">
                {extraction.career_roles.map((r) => (
                  <span key={r} className="badge bg-brand-50 text-brand-700">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Skills found ({extraction.skills?.length || 0})</h4>
            <div className="flex flex-wrap gap-2">
              {(extraction.skills || []).map((s) => (
                <label key={s} className={`badge cursor-pointer border ${selected.skills.has(s) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  <input type="checkbox" className="hidden" checked={selected.skills.has(s)} onChange={() => toggle('skills', s)} />
                  {selected.skills.has(s) ? '✓' : ''} {s}
                </label>
              ))}
            </div>
          </div>

          {extraction.projects?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Projects found</h4>
              <div className="space-y-2">
                {extraction.projects.map((p, i) => (
                  <label key={i} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1" checked={selected.projects.has(i)} onChange={() => toggle('projects', i)} />
                    <span className="text-slate-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {extraction.certifications?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Certifications found</h4>
              <div className="space-y-2">
                {extraction.certifications.map((c, i) => (
                  <label key={i} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1" checked={selected.certifications.has(i)} onChange={() => toggle('certifications', i)} />
                    <span className="text-slate-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {extraction.high_demand_missing_skills?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">High-demand skills missing from your resume</h4>
              <div className="flex flex-wrap gap-2">
                {extraction.high_demand_missing_skills.map((s) => (
                  <span key={s} className="badge bg-red-50 text-red-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button className="btn-primary" onClick={confirm} disabled={confirming}>
              {confirming ? 'Saving…' : 'Confirm & save to profile'}
            </button>
            <button className="btn-secondary" onClick={() => setExtraction(null)}>
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
