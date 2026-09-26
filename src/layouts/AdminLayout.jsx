import { NavLink, Outlet, Link } from 'react-router-dom';
import { t } from '../i18n';

const links = [
  { to: '/admin', label: t('admin.dashboard'), end: true },
  { to: '/admin/districts', label: t('admin.districts') },
  { to: '/admin/spots', label: t('admin.spots') },
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside>
        <div className="bg-base-100 rounded-xl shadow-md p-4 sticky top-20">
          <Link to="/admin" className="font-bold text-primary block mb-3">
            {t('admin.title')}
          </Link>
          <ul className="menu p-0">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
