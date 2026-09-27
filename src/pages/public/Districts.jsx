import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Map as MapIcon, MapPinned, Search, Camera } from 'lucide-react';
import { useDistricts } from '../../features/districts/queries';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import FavoriteButton from '../../components/ui/FavoriteButton';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import Seo from '../../components/Seo';
import { t, lx, locale } from '../../i18n';

const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

export default function Districts() {
  const { data: districts, isLoading, isError } = useDistricts();
  const [q, setQ] = useState('');
  const [division, setDivision] = useState('');

  const filtered = useMemo(() => {
    let list = districts || [];
    if (division) list = list.filter((d) => d.division === division);
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (d) => d.name.bn.includes(needle) || (d.name.en || '').toLowerCase().includes(needle)
      );
    }
    return list;
  }, [districts, q, division]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('district.listTitle')} description={t('district.listSubtitle')} />

      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('district.listTitle')}</h1>
            <p className="text-base-content/60">{t('district.listSubtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="input input-bordered input-sm flex items-center gap-2 w-52">
              <Search className="w-4 h-4 text-base-content/40" />
              <input
                className="grow bg-transparent focus:outline-none"
                placeholder={t('district.searchPlaceholder')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <select className="select select-bordered select-sm" value={division} onChange={(e) => setDivision(e.target.value)}>
              <option value="">{t('district.allDivisions')}</option>
              {DIVISIONS.map((dv) => (
                <option key={dv} value={dv}>{t(`district.divisions.${dv}`)}</option>
              ))}
            </select>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <p className="text-center py-16 text-error">{t('common.error')}</p>
      ) : !filtered.length ? (
        <EmptyState icon={MapPinned} title={t('district.noDistricts')} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 4) * 0.05}>
              <Link to={`/districts/${d.slug}`} className="card bg-base-100 shadow-md card-lift img-zoom block h-full">
                <figure className="h-44 relative">
                  <Img src={d.heroImageUrl} alt={lx(d.name)} icon={MapIcon} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral/75 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <VerifiedBadge verified={d.isVerified} />
                  </div>
                  <FavoriteButton kind="district" itemId={d._id} className="absolute top-3 right-3 z-20" />
                  <div className="absolute bottom-0 p-4 text-neutral-content pointer-events-none">
                    <h2 className="font-display text-xl font-bold">{lx(d.name)}</h2>
                    <span className="text-xs opacity-80">{t(`district.divisions.${d.division}`) || d.division}</span>
                  </div>
                </figure>
                <div className="card-body p-4">
                  <p className="text-sm text-base-content/70 line-clamp-2 leading-relaxed">{lx(d.overview)}</p>
                  <div className="card-actions justify-between items-center mt-1">
                    <span className="badge badge-ghost badge-sm gap-1">
                      <Camera className="w-3 h-3" />
                      {d.spotCount > 0
                        ? t('district.spotCount').replace('{n}', Number(d.spotCount).toLocaleString(locale()))
                        : t('district.contentComing')}
                    </span>
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
