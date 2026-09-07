export default function ProgressBar({ value, label, sublabel, color = 'brand', size = 'md' }) {
  const colors = {
    brand: 'bg-brand-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    slate: 'bg-slate-400',
  };
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };
  return (
    <div>
      {(label || sublabel) && (
        <div className="flex items-center justify-between mb-1 text-sm">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {sublabel !== undefined && <span className="text-slate-500 tabular-nums">{sublabel}</span>}
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-100 overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
