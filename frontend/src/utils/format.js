export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function proficiencyColor(value) {
  if (value >= 75) return 'emerald';
  if (value >= 50) return 'brand';
  if (value >= 25) return 'amber';
  return 'red';
}

export function proficiencyLabel(value) {
  if (value >= 75) return 'Strong';
  if (value >= 50) return 'Moderate';
  if (value >= 25) return 'Developing';
  return 'Beginner';
}

export function titleCase(str) {
  return (str || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
