import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Compass, ArrowRight } from 'lucide-react';
import { useDistricts } from '../../features/districts/queries';
import { useDistrictGuides } from '../../features/guides/queries';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import StarRating from '../../components/ui/StarRating';
import Reveal from '../../components/ui/Reveal';
import Seo from '../../components/Seo';
import { t, lx, locale } from '../../i18n';

export function GuideCard({ g }) {
  return (
    <Link to={`/guides/${g.id || g._id}`} className="card bg-base-100 shadow-md card-lift block h-full">
      <div className="card-body p-5">
        <div className="flex items-center gap-4">
          <div className="avatar placeholder">
            {g.photoUrl ? (
              <div className="w-16 rounded-2xl">
                <img src={g.photoUrl} alt={g.user?.name} />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl w-16 text-2xl">
                <span>{g.user?.name?.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold flex items-center gap-1.5 truncate">
              {g.user?.name}
              <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
            </h2>
            <StarRating value={g.ratingAvg} count={g.ratingCount} />
            <div className="text-xs text-base-content/55 mt-0.5">
              {t('guide.experience')}: {Number(g.experienceYears).toLocaleString(locale())} {t('guide.years')}
            </div>
          </div>
        </div>
        {lx(g.bio) && <p className="text-sm text-base-content/65 line-clamp-2 mt-1">{lx(g.bio)}</p>}
        <div className="flex flex-wrap gap-1">
          {(g.languages || []).map((l) => (
            <span key={l} className="badge badge-ghost badge-sm">{t(`guide.lang.${l}`)}</span>
          ))}
        </div>
        <div className="card-actions justify-between items-center mt-2 pt-3 border-t border-base-200">
          <span className="font-bold text-primary text-lg">
            ৳{g.dailyRate?.toLocaleString(locale())}
            <span className="text-xs font-normal text-base-content/50"> / {t('guide.perDay')}</span>
          </span>
          <span className="btn btn-primary btn-sm rounded-full gap-1">
            {t('district.viewDetails')} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Guides() {
  const { data: districts } = useDistricts();
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (!slug && districts?.length) setSlug(districts[0].slug);
  }, [districts, slug]);

  const { data: guides, isLoading } = useDistrictGuides(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('guide.listTitle')} description={t('guide.listSubtitle')} />
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('guide.listTitle')}</h1>
            <p className="text-base-content/60">{t('guide.listSubtitle')}</p>
          </div>
          <div className="flex gap-3 items-center">
            <select className="select select-bordered" value={slug} onChange={(e) => setSlug(e.target.value)}>
              {(districts || []).map((d) => (
                <option key={d.slug} value={d.slug}>{lx(d.name)}</option>
              ))}
            </select>
            <Link to="/become-guide" className="btn btn-secondary btn-sm rounded-full gap-1.5">
              <Compass className="w-4 h-4" /> {t('guide.becomeGuide')}
            </Link>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : !guides?.length ? (
        <EmptyState
          icon={Compass}
          title={t('guide.noGuides')}
          description={t('guide.becomeGuideDesc')}
          actionLabel={t('guide.becomeGuideTitle')}
          actionTo="/become-guide"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => (
            <Reveal key={g.id} delay={(i % 3) * 0.08}>
              <GuideCard g={g} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
