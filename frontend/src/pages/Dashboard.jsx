import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import api from '../api/axios';
import InvoiceTable from '../components/InvoiceTable';
import StatCard from '../components/StatCard';

const cardData = [
  { key: 'total', label: 'Total Revenue', description: 'Total', accent: 'bg-slate-100 text-slate-700' },
  { key: 'paid', label: 'Collected', description: 'Paid', accent: 'bg-emerald-100 text-emerald-700' },
  { key: 'unpaid', label: 'Outstanding', description: 'Unpaid', accent: 'bg-amber-100 text-amber-700' },
  { key: 'overdueCount', label: 'Overdue', description: 'Count', accent: 'bg-rose-100 text-rose-700' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/invoices/stats'), api.get('/invoices'), api.get('/clients')])
      .then(([statsRes, invoicesRes, clientsRes]) => {
        setStats(statsRes.data);
        setInvoices(invoicesRes.data.slice(0, 5));
        setClients(clientsRes.data.slice(0, 5));
      })
      .catch(() => {
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!invoices.length) return [];
    const buckets = {};
    invoices.forEach((invoice) => {
      const month = new Date(invoice.createdAt || invoice.dueDate).toLocaleString('default', { month: 'short' });
      const amount = (invoice.total ?? invoice.items?.reduce((sum, item) => sum + (item.qty || item.quantity || 0) * item.price, 0)) || 0;
      buckets[month] = (buckets[month] || 0) + amount;
    });
    return Object.entries(buckets).map(([month, revenue]) => ({ month, revenue }));
  }, [invoices]);

  const markPaid = async (id) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status: 'paid' });
      setInvoices((prev) => prev.map((invoice) => (invoice._id === id ? { ...invoice, status: 'paid' } : invoice)));
      toast.success('Invoice marked paid');
    } catch {
      toast.error('Unable to update invoice');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">Overview of your revenue and invoices.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {cardData.map((card) => {
          const cardValue = loading
            ? '—'
            : card.key === 'overdueCount'
            ? stats?.[card.key] ?? 0
            : `$${stats?.[card.key]?.toLocaleString() || 0}`;

          return (
            <StatCard
              key={card.key}
              label={card.label}
              value={cardValue}
              description={stats ? stats[card.key] || 0 : '—'}
              accent={card.accent}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Revenue by month</h3>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Recent clients</h3>
          <div className="mt-5 space-y-4">
            {clients.map((client) => (
              <div key={client._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{client.name}</p>
                <p className="text-sm text-slate-500">{client.company}</p>
              </div>
            ))}
            {!clients.length && <p className="text-sm text-slate-500">No clients yet.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent invoices</h3>
        </div>
        <div className="mt-6">
          <InvoiceTable invoices={invoices} onMarkPaid={markPaid} />
        </div>
      </div>
    </div>
  );
}
