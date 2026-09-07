const STATUS_STYLES = {
  applied: 'bg-slate-100 text-slate-700',
  under_review: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-amber-50 text-amber-700',
  interview: 'bg-purple-50 text-purple-700',
  selected: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  open: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-100 text-slate-500',
  pending: 'bg-amber-50 text-amber-700',
  verified: 'bg-emerald-50 text-emerald-700',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700';
  const label = (status || '').replace(/_/g, ' ');
  return <span className={`badge ${style} capitalize`}>{label}</span>;
}

export function MatchScoreBadge({ score }) {
  if (score === null || score === undefined) return null;
  const color = score >= 80 ? 'bg-emerald-50 text-emerald-700' : score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
  return <span className={`badge ${color} font-semibold`}>{score}% Match</span>;
}
