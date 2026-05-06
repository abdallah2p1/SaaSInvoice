import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Clients', path: '/clients' },
  { label: 'Invoices', path: '/invoices' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="w-72 border-r border-slate-200 bg-white px-6 py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-slate-900">InvoiceOS</h1>
        <p className="mt-2 text-sm text-slate-500">Invoice & client management.</p>
      </div>
      <div className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium ${
                isActive ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
        <p className="mt-3 text-sm font-medium text-slate-900">{user?.name || user?.email || 'User'}</p>
      </div>
      <button
        onClick={logout}
        className="mt-8 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Logout
      </button>
    </aside>
  );
}
