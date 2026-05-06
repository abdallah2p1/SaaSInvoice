import { useNavigate } from 'react-router-dom';
import Badge from './Badge';

export default function InvoiceTable({ invoices, onMarkPaid }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-6 py-4">Invoice</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Due date</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
          {invoices.map((invoice) => {
            const invoiceTotal = invoice.total ?? invoice.items?.reduce(
              (sum, item) => sum + (Number(item.qty) || Number(item.quantity) || 0) * Number(item.price || 0),
              0
            );
            return (
              <tr key={invoice._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{invoice.invoiceNumber || `#${invoice._id.slice(-6)}`}</td>
                <td className="px-6 py-4">{invoice.client?.name || 'Unknown'}</td>
                <td className="px-6 py-4">{new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">${invoiceTotal.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Badge status={invoice.status} />
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    View
                  </button>
                  {invoice.status !== 'paid' && (
                    <button
                      onClick={() => onMarkPaid(invoice._id)}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                    >
                      Mark paid
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
