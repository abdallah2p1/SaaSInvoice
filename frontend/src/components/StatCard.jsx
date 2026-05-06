export default function StatCard({ label, value, description, accent }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${accent}`}>{description}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
