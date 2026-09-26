import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDistricts } from '../../features/districts/queries';
import { useDistrictGuides } from '../../features/guides/queries';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

export function GuideCard({ g }) {
  return (
    <Link to={`/guides/${g.id || g._id}`} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
      <div className="card-body p-5">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            {g.photoUrl ? (
              <div className="w-14 rounded-full">
                <img src={g.photoUrl} alt={g.user?.name} />
              </div>
            ) : (
              <div className="bg-primary text-primary-content rounded-full w-14 text-xl">
                <span>{g.user?.name?.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold">{g.user?.name}</h2>
            <div className="text-sm text-warning">
              {'★'.repeat(Math.round(g.ratingAvg))}{'☆'.repeat(5 - Math.round(g.ratingAvg))}{' '}
              <span className="text-base-content/60">({g.ratingCount})</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-base-content/70 line-clamp-2">{g.bio?.bn}</p>
        <div className="flex flex-wrap gap-1 text-xs">
          {(g.languages || []).map((l) => (
            <span key={l} className="badge badge-ghost badge-sm">{t(`guide.lang.${l}`)}</span>
          ))}
          <span className="badge badge-outline badge-sm">{t('guide.experience')}: {g.experienceYears} {t('guide.years')}</span>
        </div>
        <div className="card-actions justify-between items-center mt-1">
          <span className="font-bold text-primary">৳{g.dailyRate?.toLocaleString('bn-BD')} / {t('guide.perDay')}</span>
          <span className="btn btn-primary btn-sm">{t('district.viewDetails')}</span>
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
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">{t('guide.listTitle')}</h1>
          <p className="text-base-content/70">{t('guide.listSubtitle')}</p>
        </div>
        <div className="flex gap-3 items-center">
          <select className="select select-bordered" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {(districts || []).map((d) => (
              <option key={d.slug} value={d.slug}>{d.name.bn}</option>
            ))}
          </select>
          <Link to="/become-guide" className="btn btn-secondary btn-sm">
            🧭 {t('guide.becomeGuide')}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : !guides?.length ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🧭</div>
          <p className="text-base-content/70 mb-6">{t('guide.noGuides')}</p>
          <Link to="/become-guide" className="btn btn-primary">{t('guide.becomeGuideTitle')}</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <GuideCard key={g.id} g={g} />
          ))}
        </div>
      )}
    </div>
  );
}
