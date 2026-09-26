import { Link } from 'react-router-dom';
import { useDistricts } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

export default function Districts() {
  const { data: districts, isLoading, isError } = useDistricts();

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-center py-16 text-error">{t('common.error')}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-1">{t('district.listTitle')}</h1>
      <p className="text-base-content/70 mb-8">{t('district.listSubtitle')}</p>

      {districts.length === 0 ? (
        <p className="text-center py-16">{t('district.noDistricts')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d) => (
            <Link key={d.slug} to={`/districts/${d.slug}`} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
              <figure className="h-48 bg-gradient-to-br from-primary/30 to-emerald-700/30">
                {d.heroImageUrl ? (
                  <img src={d.heroImageUrl} alt={d.name.bn} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🏞️</span>
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title">{d.name.bn}</h2>
                <p className="text-sm text-base-content/70 line-clamp-3">{d.overview?.bn}</p>
                <div className="card-actions justify-end mt-2">
                  <span className="btn btn-primary btn-sm">{t('district.viewDetails')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
