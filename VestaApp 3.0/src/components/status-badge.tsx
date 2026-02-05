import clsx from 'clsx';

const colors: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  complete: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  todo: 'bg-slate-100 text-slate-700',
  done: 'bg-emerald-100 text-emerald-700'
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', colors[status] || 'bg-slate-100')}>{status}</span>;
}
