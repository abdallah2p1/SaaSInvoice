import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import InvoiceTable from '../components/InvoiceTable';
import Modal from '../components/Modal';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      clientId: '',
      dueDate: '',
      notes: '',
      items: [{ description: '', quantity: 1, price: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const values = watch('items');

  useEffect(() => {
    Promise.all([api.get('/invoices'), api.get('/clients')])
      .then(([invoicesRes, clientsRes]) => {
        setInvoices(invoicesRes.data);
        setClients(clientsRes.data);
      })
      .catch(() => toast.error('Unable to load data'))
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(
    () => values.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price || 0), 0),
    [values]
  );

  const onSubmit = async (data) => {
    try {
      const payload = {
        clientId: data.clientId,
        dueDate: data.dueDate,
        notes: data.notes,
        items: data.items.map((item) => ({
          desc: item.description,
          qty: Number(item.quantity),
          price: Number(item.price),
        })),
      };
      const response = await api.post('/invoices', payload);
      setInvoices((prev) => [response.data, ...prev]);
      toast.success('Invoice created');
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create invoice');
    }
  };

  const markPaid = async (id) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status: 'paid' });
      setInvoices((prev) => prev.map((invoice) => (invoice._id === id ? { ...invoice, status: 'paid' } : invoice)));
      toast.success('Invoice marked as paid');
    } catch {
      toast.error('Unable to update invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Invoices</h2>
            <p className="mt-1 text-sm text-slate-500">View and manage your invoice workflow.</p>
            <p className="mt-2 text-sm text-slate-500">Total invoices: {invoices.length}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 sm:w-72"
            />
            <button
              onClick={() => setOpen(true)}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Create invoice
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {['all', 'paid', 'unpaid', 'overdue'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-500">Loading invoices...</p>
        ) : (
          <InvoiceTable invoices={invoices.filter((invoice) => {
            const query = search.trim().toLowerCase();
            const matchesText = query === '' ||
              invoice.invoiceNumber?.toLowerCase().includes(query) ||
              invoice.client?.name?.toLowerCase().includes(query) ||
              invoice.client?.company?.toLowerCase().includes(query);
            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
            return matchesText && matchesStatus;
          })} onMarkPaid={markPaid} />
        )}
      </div>

      <Modal
        open={open}
        title="Create invoice"
        onClose={() => setOpen(false)}
        footer={
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save invoice
          </button>
        }
      >
        <form className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Client</span>
            <select
              {...register('clientId', { required: 'Client is required' })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
            {errors.clientId && <p className="mt-2 text-sm text-rose-600">{errors.clientId.message}</p>}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Due date</span>
              <input
                type="date"
                {...register('dueDate', { required: 'Due date is required' })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
              />
              {errors.dueDate && <p className="mt-2 text-sm text-rose-600">{errors.dueDate.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <input
                type="text"
                {...register('notes')}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Line items</h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, price: 0 })}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Add item
              </button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-4 sm:grid-cols-[1.7fr_1fr_1fr_auto]">
                  <input
                    type="text"
                    placeholder="Description"
                    {...register(`items.${index}.description`, { required: 'Required' })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, { min: 1, valueAsNumber: true })}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`items.${index}.price`, { min: 0, valueAsNumber: true })}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-full bg-rose-100 px-4 py-3 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-right">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">${total.toFixed(2)}</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
