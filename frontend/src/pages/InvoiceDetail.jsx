import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Badge from '../components/Badge';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then((res) => setInvoice(res.data))
      .catch(() => toast.error('Invoice not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const markPaid = async () => {
    try {
      await api.patch(`/invoices/${id}/status`, { status: 'paid' });
      setInvoice((prev) => ({ ...prev, status: 'paid' }));
      toast.success('Marked as paid');
    } catch {
      toast.error('Unable to update invoice');
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading invoice...</p>;
  }

  if (!invoice) {
    return <p className="text-slate-500">Invoice not found.</p>;
  }

  const total = invoice.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Invoice detail</h2>
          <p className="mt-1 text-sm text-slate-500">Review the full invoice and export if needed.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => window.print()}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
          >
            Print / Export PDF
          </button>
          {invoice.status !== 'paid' && (
            <button
              onClick={markPaid}
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Mark as paid
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Invoice</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">#{invoice._id.slice(-8)}</h3>
          </div>
          <Badge status={invoice.status} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">From</p>
            <p className="mt-3 text-sm text-slate-700">InvoiceOS</p>
            <p className="text-sm text-slate-500">support@invoiceos.com</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">To</p>
            <p className="mt-3 text-sm text-slate-700">{invoice.client?.name}</p>
            <p className="text-sm text-slate-500">{invoice.client?.company}</p>
            <p className="text-sm text-slate-500">{invoice.client?.email}</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Due date</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">${total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
