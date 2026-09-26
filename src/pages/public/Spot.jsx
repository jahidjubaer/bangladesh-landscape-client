import { useParams, Link } from 'react-router-dom';
import { useSpot } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import NotFound from '../NotFound';
import { t } from '../../i18n';

export default function Spot() {
  const { slug } = useParams();
  const { data: spot, isLoading, isError } = useSpot(slug);

  if (isLoading) return <Loader />;
  if (isError || !spot) return <NotFound />;

  const cost =
    !spot.entryCost || (spot.entryCost.min === 0 && spot.entryCost.max === 0)
      ? t('spot.free')
      : `${spot.entryCost.min}–${spot.entryCost.max} ${t('spot.taka')}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link to={`/districts/${spot.district.slug}`} className="link link-primary text-sm">
          ← {spot.district.name.bn} — {t('spot.backToDistrict')}
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-2 flex items-center gap-3 flex-wrap">
          {spot.name.bn}
          {spot.isHidden && <span className="badge badge-secondary">{t('district.hiddenGem')}</span>}
        </h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="badge badge-outline">{t(`spot.category.${spot.category}`)}</span>
          {(spot.tags || []).map((tag) => (
            <span key={tag} className="badge badge-ghost">
              {t(`spot.tag.${tag}`)}
            </span>
          ))}
        </div>
      </div>

      {/* Images */}
      {spot.images?.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {spot.images.map((img, i) => (
            <img key={i} src={img} alt={`${spot.name.bn} ${i + 1}`} className="rounded-xl shadow-md w-full h-64 object-cover" loading="lazy" />
          ))}
        </div>
      )}

      <p className="text-lg leading-relaxed text-base-content/90">{spot.description?.bn}</p>

      {/* Quick facts */}
      <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
        <div className="stat">
          <div className="stat-title">{t('spot.entryCost')}</div>
          <div className="stat-value text-lg">{cost}</div>
        </div>
        <div className="stat">
          <div className="stat-title">{t('spot.timeNeeded')}</div>
          <div className="stat-value text-lg">
            {spot.timeNeededHours} {t('spot.hours')}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t('spot.bestTime')}</div>
          <div className="stat-desc text-base whitespace-normal">{spot.bestTime?.bn}</div>
        </div>
      </div>

      {/* How to go */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">🚌 {t('spot.howToGo')}</h2>
          <p className="leading-relaxed text-base-content/80 whitespace-pre-line">{spot.howToGo?.bn}</p>
        </div>
      </div>

      {/* Warnings & obstacles */}
      {spot.warnings?.length > 0 && (
        <div className="alert alert-warning items-start">
          <div>
            <h3 className="font-bold mb-1">⚠️ {t('district.warnings')}</h3>
            <ul className="list-disc ms-5 space-y-1">
              {spot.warnings.map((w, i) => (
                <li key={i}>{w.bn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {spot.obstacles?.length > 0 && (
        <div className="alert items-start">
          <div>
            <h3 className="font-bold mb-1">🚧 {t('spot.obstacles')}</h3>
            <ul className="list-disc ms-5 space-y-1">
              {spot.obstacles.map((o, i) => (
                <li key={i}>{o.bn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Map */}
      {spot.location?.lat != null && (
        <SpotMap center={spot.location} zoom={13} markers={[{ ...spot.location, nameBn: spot.name.bn }]} height="320px" />
      )}
    </div>
  );
}
