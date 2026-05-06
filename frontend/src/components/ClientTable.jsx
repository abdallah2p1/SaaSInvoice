export default function ClientTable({ clients, onDelete, totals }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Company</th>
            <th className="px-6 py-4">Phone</th>
            <th className="px-6 py-4">Total invoiced</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
          {clients.map((client) => (
            <tr key={client._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{client.name}</td>
              <td className="px-6 py-4">{client.email}</td>
              <td className="px-6 py-4">{client.company}</td>
              <td className="px-6 py-4">{client.phone}</td>
              <td className="px-6 py-4">${(totals[client._id] || 0).toFixed(2)}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(client._id)}
                  className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
