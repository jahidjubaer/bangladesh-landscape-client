import { Link } from 'react-router-dom';
import { useMyPlans } from '../../features/plans/queries';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

export default function MyPlans() {
  const { data: plans, isLoading } = useMyPlans();

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t('plan.myPlans')}</h1>

      {!plans?.length ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-base-content/70 mb-6">{t('plan.noPlans')}</p>
          <Link to="/plan" className="btn btn-primary">
            ✨ {t('plan.makeFirst')}
          </Link>
        </div>
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
                    📍 {p.district?.name?.bn} · 👥 {p.input?.members} জন · 🗓️ {p.input?.days} দিন {p.input?.nights} রাত ·{' '}
                    {new Date(p.createdAt).toLocaleDateString('bn-BD')}
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
