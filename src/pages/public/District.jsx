import { useParams, Link } from 'react-router-dom';
import { useDistrict } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import NotFound from '../NotFound';
import { t } from '../../i18n';

function InfoCard({ icon, title, children }) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">
          <span>{icon}</span> {title}
        </h2>
        <div className="text-base-content/80 leading-relaxed whitespace-pre-line">{children}</div>
      </div>
    </div>
  );
}

export default function District() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useDistrict(slug);

  if (isLoading) return <Loader />;
  if (isError || !data) return <NotFound />;

  const { district, spots } = data;

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[40vh] flex items-end bg-gradient-to-br from-primary to-emerald-800 text-primary-content"
        style={
          district.heroImageUrl
            ? { backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.55)), url(${district.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        <div className="max-w-7xl mx-auto px-4 py-10 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold">{district.name.bn}</h1>
          {district.division && <p className="opacity-80 mt-1">{district.division}</p>}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Overview */}
        <p className="text-lg leading-relaxed text-base-content/90">{district.overview?.bn}</p>

        {/* Spots */}
        <section>
          <h2 className="text-2xl font-bold mb-4">{t('district.spots')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((s) => (
              <Link key={s.slug} to={`/spots/${s.slug}`} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
                <figure className="h-40 bg-gradient-to-br from-secondary/20 to-primary/20">
                  {s.images?.[0] ? (
                    <img src={s.images[0]} alt={s.name.bn} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-5xl">📍</span>
                  )}
                </figure>
                <div className="card-body p-5">
                  <h3 className="card-title text-base">
                    {s.name.bn}
                    {s.isHidden && <span className="badge badge-secondary badge-sm">{t('district.hiddenGem')}</span>}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    <span className="badge badge-outline badge-sm">{t(`spot.category.${s.category}`)}</span>
                    {(s.tags || []).map((tag) => (
                      <span key={tag} className="badge badge-ghost badge-sm">
                        {t(`spot.tag.${tag}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Map */}
        <section>
          <h2 className="text-2xl font-bold mb-4">{t('district.mapTitle')}</h2>
          <SpotMap
            center={district.mapCenter}
            zoom={district.zoom}
            markers={spots.map((s) => ({ lat: s.location?.lat, lng: s.location?.lng, nameBn: s.name.bn, slug: s.slug }))}
          />
        </section>

        {/* Info cards */}
        <section className="grid gap-6 md:grid-cols-2">
          <InfoCard icon="🚌" title={t('district.transport')}>{district.transportInfo?.bn}</InfoCard>
          <InfoCard icon="🍲" title={t('district.food')}>{district.foodInfo?.bn}</InfoCard>
          <InfoCard icon="🗓️" title={t('district.bestSeason')}>{district.bestSeason?.bn}</InfoCard>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-lg">🚨 {t('district.emergency')}</h2>
              <ul className="text-base-content/80 space-y-1">
                {district.emergency?.police && <li><strong>{t('district.police')}:</strong> {district.emergency.police}</li>}
                {district.emergency?.hospital && <li><strong>{t('district.hospital')}:</strong> {district.emergency.hospital}</li>}
                {district.emergency?.fireService && <li><strong>{t('district.fireService')}:</strong> {district.emergency.fireService}</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Warnings */}
        {district.warnings?.length > 0 && (
          <section className="alert alert-warning items-start">
            <div>
              <h2 className="font-bold mb-2">⚠️ {t('district.warnings')}</h2>
              <ul className="list-disc ms-5 space-y-1">
                {district.warnings.map((w, i) => (
                  <li key={i}>{w.bn}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
