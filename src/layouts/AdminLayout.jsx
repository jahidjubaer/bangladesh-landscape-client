import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Map, MapPin, Compass, Wallet, PenLine, BedDouble, Megaphone, Users, Settings, ShieldCheck, Tent, Star, TrendingUp,
} from 'lucide-react';
import { t } from '../i18n';

const links = [
  { to: '/admin', label: t('admin.dashboard'), Icon: LayoutDashboard, end: true },
  { to: '/admin/analytics', label: t('analytics.title'), Icon: TrendingUp },
  { to: '/admin/districts', label: t('admin.districts'), Icon: Map },
  { to: '/admin/spots', label: t('admin.spots'), Icon: MapPin },
  { to: '/admin/guide-applications', label: t('admin.guideApps'), Icon: Compass },
  { to: '/admin/payments', label: t('admin.payments'), Icon: Wallet },
  { to: '/admin/blogs', label: t('nav.blog'), Icon: PenLine },
  { to: '/admin/reviews', label: t('admin.reviews'), Icon: Star },
  { to: '/admin/users', label: t('adminUsers.title'), Icon: Users },
  { to: '/admin/events', label: t('nav.events'), Icon: Tent },
  { to: '/admin/listings', label: t('admin.listings'), Icon: BedDouble },
  { to: '/admin/ads', label: t('admin.ads'), Icon: Megaphone },
  { to: '/admin/settings', label: t('admin.settings'), Icon: Settings },
];

function AdminNavLink({ to, label, Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
          isActive
            ? 'bg-primary text-primary-content shadow-md shadow-primary/25'
            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
        }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile: horizontal scrollable pill bar */}
      <nav className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 w-max pb-1">
          {links.map((l) => (
            <AdminNavLink key={l.to} {...l} />
          ))}
        </div>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-24">
          <div className="bg-base-100 rounded-2xl shadow-md border border-base-200 p-3">
            <div className="flex items-center gap-2 px-3 py-2 mb-2 border-b border-base-200">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <ShieldCheck className="w-[18px] h-[18px] text-primary-content" />
              </span>
              <span className="font-bold">{t('admin.title')}</span>
            </div>
            <div className="space-y-1">
              {links.map((l) => (
                <AdminNavLink key={l.to} {...l} />
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
