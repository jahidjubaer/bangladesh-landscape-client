import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet, Compass, PenLine, Users, FileText, BadgeCheck, CalendarCheck, Tent,
  HandCoins, ArrowRight, PartyPopper,
} from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

const money = (n) => `৳${Number(n || 0).toLocaleString('bn-BD')}`;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async () => (await api.get('/admin/overview')).data.data,
    refetchInterval: 60_000,
  });

  if (isLoading) return <Loader />;

  const a = data?.actionNeeded || {};
  const totals = data?.totals || {};
  const actionCards = [
    { count: a.pendingPayments, label: t('overview.pendingPayments'), to: '/admin/payments', Icon: Wallet, tone: 'bg-error/10 text-error border-error/30' },
    { count: a.pendingGuideApps, label: t('overview.pendingApps'), to: '/admin/guide-applications', Icon: Compass, tone: 'bg-warning/10 text-warning border-warning/30' },
    { count: a.pendingBlogs, label: t('overview.pendingBlogs'), to: '/admin/blogs', Icon: PenLine, tone: 'bg-info/10 text-info border-info/30' },
    { count: a.pendingEventBookings, label: t('overview.pendingEvents'), to: '/admin/events', Icon: Tent, tone: 'bg-secondary/10 text-secondary border-secondary/30' },
  ].filter((c) => c.count > 0);

  const stats = [
    { label: t('overview.users'), value: totals.users, Icon: Users },
    { label: t('overview.plans'), value: totals.plans, Icon: FileText },
    { label: t('overview.paidPlans'), value: totals.paidPlans, Icon: BadgeCheck },
    { label: t('overview.bookings'), value: totals.bookings, Icon: CalendarCheck },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold">
        {t('admin.welcome')}, {user?.name} 👋
      </h1>

      {/* Action needed */}
      <section>
        <h2 className="font-semibold text-base-content/60 text-sm uppercase tracking-wide mb-3">{t('overview.actionNeeded')}</h2>
        {actionCards.length === 0 ? (
          <div className="alert bg-success/10 border-success/30">
            <PartyPopper className="w-5 h-5 text-success" /> {t('overview.allClear')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {actionCards.map(({ count, label, to, Icon, tone }) => (
              <Link key={to} to={to} className={`card border ${tone} card-lift`}>
                <div className="card-body p-5 flex-row items-center gap-4">
                  <Icon className="w-8 h-8 shrink-0" strokeWidth={1.6} />
                  <div>
                    <div className="font-display text-3xl font-extrabold">{Number(count).toLocaleString('bn-BD')}</div>
                    <div className="text-sm">{label}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 ms-auto" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Stats */}
      <section>
        <h2 className="font-semibold text-base-content/60 text-sm uppercase tracking-wide mb-3">{t('overview.totals')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-base-300 rounded-2xl overflow-hidden shadow-md">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="bg-base-100 p-5 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" strokeWidth={1.8} />
              <div className="font-display text-2xl font-extrabold">{Number(value || 0).toLocaleString('bn-BD')}</div>
              <div className="text-xs text-base-content/55">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-md">
          <div className="card-body p-5 flex-row items-center gap-4">
            <HandCoins className="w-8 h-8" strokeWidth={1.6} />
            <div>
              <div className="font-display text-2xl font-extrabold">{money(totals.commissionEarned)}</div>
              <div className="text-sm opacity-85">{t('overview.commission')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent lists */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-5">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" /> {t('overview.recentPlans')}
            </h3>
            {!data?.recentPlans?.length ? (
              <p className="text-sm text-base-content/50">{t('admin.noItems')}</p>
            ) : (
              <ul className="divide-y divide-base-200">
                {data.recentPlans.map((p) => (
                  <li key={p.publicId} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.output?.title}</div>
                      <div className="text-xs text-base-content/50">
                        {p.user?.name} · {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`badge badge-sm ${p.status === 'paid' ? 'badge-success' : 'badge-ghost'}`}>{p.status}</span>
                      <Link to={`/plans/${p.publicId}`} className="btn btn-xs btn-outline">{t('overview.review')}</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-5">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" /> {t('overview.recentPayments')}
            </h3>
            {!data?.recentPendingPayments?.length ? (
              <p className="text-sm text-base-content/50">{t('admin.noItems')}</p>
            ) : (
              <ul className="divide-y divide-base-200">
                {data.recentPendingPayments.map((p) => (
                  <li key={p._id} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                    <div>
                      <div className="font-medium">{p.user?.name} — {money(p.amount)}</div>
                      <div className="text-xs text-base-content/50 font-mono">{p.manual?.trxId || p.tranId}</div>
                    </div>
                    <Link to="/admin/payments" className="btn btn-xs btn-primary shrink-0">{t('overview.review')}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
