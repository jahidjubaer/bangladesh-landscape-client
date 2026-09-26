import { Link } from 'react-router-dom';
import { Sparkles, Map as MapIcon } from 'lucide-react';
import { useMyPlans } from '../../features/plans/queries';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { t, lx, locale } from '../../i18n';

export default function MyPlans() {
  const { data: plans, isLoading } = useMyPlans();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-extrabold">{t('plan.myPlans')}</h1>
        <Link to="/plan" className="btn btn-primary btn-sm rounded-full gap-1.5">
          <Sparkles className="w-4 h-4" /> {t('home.ctaPlan')}
        </Link>
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : !plans?.length ? (
        <EmptyState icon={MapIcon} title={t('plan.noPlans')} description={t('plan.makeFirst')} actionLabel={t('home.ctaPlan')} actionTo="/plan" />
      ) : (
        <div className="space-y-3">
          {plans.map((p) => (
            <Link
              key={p.publicId}
              to={`/plans/${p.publicId}`}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="card-body p-5 flex-row items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold">{p.output?.title}</h2>
                  <div className="text-sm text-base-content/60">
                    📍 {lx(p.district?.name)} · 👥 {p.input?.members} জন · 🗓️ {p.input?.days} দিন {p.input?.nights} রাত ·{' '}
                    {new Date(p.createdAt).toLocaleDateString(locale())}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {p.status === 'paid' ? t('plan.paidBadge') : t('plan.previewBadge').split(' — ')[0]}
                  </span>
                  <span className="btn btn-sm btn-outline">{t('plan.viewPlan')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
