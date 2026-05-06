import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ClientTable from '../components/ClientTable';
import Modal from '../components/Modal';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/invoices')])
      .then(([clientsRes, invoicesRes]) => {
        setClients(clientsRes.data);
        setInvoices(invoicesRes.data);
      })
      .catch(() => toast.error('Unable to load clients and invoices'))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const map = {};
    invoices.forEach((invoice) => {
      const clientId = invoice.client?._id || invoice.client;
      const amount = invoice.items?.reduce((sum, item) => sum + (item.qty || item.quantity || 0) * item.price, 0) || 0;
      map[clientId] = (map[clientId] || 0) + amount;
    });
    return map;
  }, [invoices]);

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/clients', data);
      setClients((prev) => [response.data, ...prev]);
      toast.success('Client added');
      reset();
      setOpen(false);
    } catch (error) {
      toast.error('Unable to add client');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients((prev) => prev.filter((client) => client._id !== id));
      toast.success('Client deleted');
    } catch {
      toast.error('Unable to delete client');
    }
  };

  const filteredClients = useMemo(
    () => clients.filter((client) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return (
        client.name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query)
      );
    }),
    [clients, search]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Clients</h2>
          <p className="mt-1 text-sm text-slate-500">Manage all your clients and track their invoices.</p>
          <p className="mt-2 text-sm text-slate-500">Total clients: {clients.length}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 sm:w-72"
          />
          <button
            onClick={() => setOpen(true)}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Add client
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-500">Loading clients...</p>
        ) : (
          <ClientTable clients={filteredClients} onDelete={handleDelete} totals={totals} />
        )}
      </div>

      <Modal
        open={open}
        title="Add client"
        onClose={() => setOpen(false)}
        footer={
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save client
          </button>
        }
      >
        <form className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.name && <p className="mt-2 text-sm text-rose-600">{errors.name.message}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Company</span>
            <input
              type="text"
              {...register('company', { required: 'Company is required' })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.company && <p className="mt-2 text-sm text-rose-600">{errors.company.message}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              type="text"
              {...register('phone', { required: 'Phone is required' })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.phone && <p className="mt-2 text-sm text-rose-600">{errors.phone.message}</p>}
          </label>
        </form>
      </Modal>
    </div>
  );
}
