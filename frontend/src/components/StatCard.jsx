export default function StatCard({ label, value, sublabel, icon, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-600 bg-brand-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
    slate: 'text-slate-600 bg-slate-100',
  };
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
        </div>
        {icon && <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg ${accents[accent]}`}>{icon}</div>}
      </div>
    </div>
  );
}
