export default function Badge({ status }) {
  const styles = {
    paid: 'bg-emerald-100 text-emerald-800',
    unpaid: 'bg-amber-100 text-amber-800',
    overdue: 'bg-rose-100 text-rose-800',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
      {status}
    </span>
  );
}
