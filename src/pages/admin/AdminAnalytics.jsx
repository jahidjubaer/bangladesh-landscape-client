import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Eye, Users, Wallet, FileText, CalendarCheck, Hourglass, Tent } from 'lucide-react';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import { t, locale } from '../../i18n';

const PALETTE = ['#0d7a68', '#0a6a8a', '#e8590c', '#d97706', '#0f9d6e'];
const num = (n) => Number(n || 0).toLocaleString(locale());
const money = (n) => `৳${num(n)}`;
const fmtDay = (d) => new Date(d).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });

const tooltipStyle = {
  background: 'var(--color-base-100)',
  border: '1px solid var(--color-base-300)',
  borderRadius: '0.75rem',
  color: 'var(--color-base-content)',
  fontSize: 13,
};
const tick = { fill: 'var(--color-base-content)', opacity: 0.55, fontSize: 11 };

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="card bg-base-100 shadow-md p-5">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <div className="font-display text-2xl font-extrabold leading-tight">{value}</div>
          <div className="text-xs text-base-content/55">{label}{sub && <span className="ms-1 opacity-70">· {sub}</span>}</div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children, className = '' }) {
  return (
    <div className={`card bg-base-100 shadow-md p-5 ${className}`}>
      <h2 className="font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

// Classic funnel: every booking starts as "requested"
function BookingFunnel({ funnel }) {
  const total = Object.values(funnel).reduce((n, c) => n + c, 0);
  const confirmed = (funnel.confirmed || 0) + (funnel.completed || 0);
  const completed = funnel.completed || 0;
  const stages = [
    { key: 'requested', count: total },
    { key: 'confirmed', count: confirmed },
    { key: 'completed', count: completed },
  ];
  const lost = ['rejected', 'expired', 'cancelled'].filter((k) => funnel[k]);

  if (!total) return <p className="text-sm text-base-content/50">{t('analytics.noData')}</p>;

  return (
    <div className="space-y-3">
      {stages.map(({ key, count }, i) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span>{t(`analytics.funnel.${key}`)}</span>
            <span className="font-semibold">
              {num(count)}
              <span className="text-xs text-base-content/45 ms-1.5">
                {total ? Math.round((count / total) * 100) : 0}%
              </span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-base-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${total ? (count / total) * 100 : 0}%`, background: PALETTE[i] }}
            />
          </div>
        </div>
      ))}
      {lost.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {lost.map((k) => (
            <span key={k} className="badge badge-ghost badge-sm">
              {t(`analytics.funnel.${k}`)}: {num(funnel[k])}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', days],
    queryFn: async () => (await api.get('/admin/analytics', { params: { days } })).data.data,
    staleTime: 60 * 1000,
  });

  if (isLoading || !data) return <Loader />;

  const totalViews = data.series.reduce((n, d) => n + d.views, 0);
  const totalUniques = data.series.reduce((n, d) => n + d.uniques, 0);
  const chart = data.series.map((d) => ({ ...d, label: fmtDay(d.day) }));
  const pie = (data.revenue.byPurpose || []).map((p) => ({
    name: t(`analytics.purpose.${p.purpose}`),
    value: p.amount,
  }));
  const maxPage = Math.max(1, ...data.topPages.map((p) => p.views));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">{t('analytics.title')}</h1>
        <div className="join shadow-sm">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`btn btn-sm join-item ${days === d ? 'btn-primary' : 'bg-base-100'}`}
            >
              {t(`analytics.range.${d}`)}
            </button>
          ))}
        </div>
      </div>

      {data.revenue.pendingVerification > 0 && (
        <div className="alert bg-warning/15 border-warning/30 mb-6 py-2.5 text-sm">
          <Hourglass className="w-4 h-4 text-warning" />
          <span>{t('analytics.pendingVerification').replace('{n}', num(data.revenue.pendingVerification))}</span>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={Eye} label={t('analytics.views')} value={num(totalViews)} />
        <Kpi icon={Users} label={t('analytics.uniques')} value={num(totalUniques)} />
        <Kpi icon={Wallet} label={t('analytics.revenue')} value={money(data.revenue.total)} sub={`${num(data.revenue.count)} ${t('analytics.payments')}`} />
        <Kpi icon={FileText} label={t('analytics.plansCreated')} value={num(data.plans.total)} sub={`${t('analytics.plansPaid')}: ${num(data.plans.byStatus.paid || 0)}`} />
        <Kpi icon={CalendarCheck} label={t('analytics.bookingFunnel')} value={num(data.bookings.total)} />
        <Kpi icon={Tent} label={t('analytics.eventSeats')} value={num(data.events.seatsConfirmed)} />
        <Kpi icon={Users} label={t('analytics.newUsers')} value={num(data.users.new)} sub={`${t('analytics.totalUsers')}: ${num(data.users.total)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic */}
        <Panel title={t('analytics.traffic')} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" vertical={false} />
                <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="views" name={t('analytics.views')} stroke={PALETTE[0]} strokeWidth={2} fill="url(#gViews)" />
                <Area type="monotone" dataKey="uniques" name={t('analytics.uniques')} stroke={PALETTE[1]} strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Revenue by day */}
        <Panel title={t('analytics.revenueTrend')}>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" vertical={false} />
                <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={44} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                <Bar dataKey="revenue" name={t('analytics.revenue')} fill={PALETTE[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Revenue split */}
        <Panel title={t('analytics.revenueSplit')}>
          {pie.length === 0 ? (
            <p className="text-sm text-base-content/50">{t('analytics.noData')}</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3}>
                    {pie.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="var(--color-base-100)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* Booking funnel */}
        <Panel title={t('analytics.bookingFunnel')}>
          <BookingFunnel funnel={data.bookings.funnel} />
          {Object.keys(data.bookings.byType || {}).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-base-200">
              {Object.entries(data.bookings.byType).map(([k, v]) => (
                <span key={k} className="badge badge-outline badge-sm">
                  {t(`analytics.byType.${k}`)}: {num(v)}
                </span>
              ))}
            </div>
          )}
        </Panel>

        {/* Top pages */}
        <Panel title={t('analytics.topPages')}>
          {!data.topPages.length ? (
            <p className="text-sm text-base-content/50">{t('analytics.noData')}</p>
          ) : (
            <div className="space-y-2.5">
              {data.topPages.map((p) => (
                <div key={p.path} className="relative rounded-lg overflow-hidden bg-base-200">
                  <div className="absolute inset-y-0 left-0 bg-primary/15" style={{ width: `${(p.views / maxPage) * 100}%` }} />
                  <div className="relative flex justify-between px-3 py-1.5 text-sm">
                    <code className="text-xs">{p.path}</code>
                    <span className="font-semibold">{num(p.views)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
