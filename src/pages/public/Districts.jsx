import { Link } from 'react-router-dom';
import { ArrowRight, Map as MapIcon, MapPinned } from 'lucide-react';
import { useDistricts } from '../../features/districts/queries';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import Seo from '../../components/Seo';
import { t } from '../../i18n';

export default function Districts() {
  const { data: districts, isLoading, isError } = useDistricts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('district.listTitle')} description={t('district.listSubtitle')} />

      <Reveal>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('district.listTitle')}</h1>
        <p className="text-base-content/60 mb-10">{t('district.listSubtitle')}</p>
      </Reveal>

      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : isError ? (
        <p className="text-center py-16 text-error">{t('common.error')}</p>
      ) : !districts?.length ? (
        <EmptyState icon={MapPinned} title={t('district.noDistricts')} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d, i) => (
            <Reveal key={d.slug} delay={i * 0.08}>
              <Link to={`/districts/${d.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block h-full">
                <figure className="h-52 relative">
                  <Img src={d.heroImageUrl} alt={d.name.bn} icon={MapIcon} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 p-5 text-neutral-content">
                    <h2 className="font-display text-2xl font-bold">{d.name.bn}</h2>
                    {d.division && <span className="text-sm opacity-80">{d.division}</span>}
                  </div>
                </figure>
                <div className="card-body p-5">
                  <p className="text-sm text-base-content/70 line-clamp-3 leading-relaxed">{d.overview?.bn}</p>
                  <div className="card-actions justify-between items-center mt-2">
                    <div className="flex gap-1 flex-wrap">
                      {(d.stayTypesAvailable || []).map((st) => (
                        <span key={st} className="badge badge-ghost badge-sm">{t(`plan.stay.${st}`)}</span>
                      ))}
                    </div>
                    <span className="text-primary font-medium text-sm flex items-center gap-1">
                      {t('district.viewDetails')} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
