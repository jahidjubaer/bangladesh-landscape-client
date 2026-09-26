import { Link } from 'react-router-dom';
import AdBanner from '../../components/AdBanner';
import { t } from '../../i18n';

const features = [
  { icon: '🗺️', title: t('home.features.planTitle'), desc: t('home.features.planDesc') },
  { icon: '🧭', title: t('home.features.guideTitle'), desc: t('home.features.guideDesc') },
  { icon: '✅', title: t('home.features.infoTitle'), desc: t('home.features.infoDesc') },
];

export default function Home() {
  return (
    <div>
      <AdBanner slot="hero-top" />
      <section className="hero min-h-[70vh] bg-gradient-to-br from-primary/90 to-emerald-800 text-primary-content">
        <div className="hero-content text-center py-16">
          <div className="max-w-2xl">
            <div className="badge badge-warning badge-lg mb-4 font-semibold">{t('home.launchDistrict')}</div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">{t('home.heroTitle')}</h1>
            <p className="text-lg opacity-90 mb-8">{t('home.heroSubtitle')}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/plan" className="btn btn-warning btn-lg">
                {t('home.ctaPlan')}
              </Link>
              <Link to="/districts" className="btn btn-outline btn-lg text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
                {t('home.ctaExplore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AdBanner slot="hero-bottom" />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-2">{f.icon}</div>
                <h2 className="card-title">{f.title}</h2>
                <p className="text-base-content/70 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
