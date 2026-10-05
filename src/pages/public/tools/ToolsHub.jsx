import { Link } from 'react-router-dom';
import { MapPinned, Brain, Calculator, Compass, ArrowRight } from 'lucide-react';
import Seo from '../../../components/Seo';
import Reveal from '../../../components/ui/Reveal';
import { t } from '../../../i18n';

const TOOLS = [
  { to: '/my-map', Icon: MapPinned, key: 'myMap', tone: 'from-emerald-500 to-teal-600' },
  { to: '/tools/quiz', Icon: Brain, key: 'quiz', tone: 'from-violet-500 to-fuchsia-600' },
  { to: '/tools/budget', Icon: Calculator, key: 'budget', tone: 'from-amber-500 to-orange-600' },
  { to: '/tools/where-to-go', Icon: Compass, key: 'matcher', tone: 'from-sky-500 to-blue-600' },
];

export default function ToolsHub() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Seo title={t('tools.title')} description={t('tools.subtitle')} />
      <Reveal>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('tools.title')}</h1>
        <p className="text-base-content/60 mb-10">{t('tools.subtitle')}</p>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2">
        {TOOLS.map(({ to, Icon, key, tone }, i) => (
          <Reveal key={to} delay={i * 0.06}>
            <Link to={to} className="card bg-base-100 shadow-md card-lift h-full overflow-hidden group">
              <div className={`h-2 bg-gradient-to-r ${tone}`} />
              <div className="card-body flex-row items-start gap-4">
                <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tone} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                  <Icon className="w-7 h-7" />
                </span>
                <div className="grow">
                  <h2 className="font-bold text-xl mb-1">{t(`tools.${key}.name`)}</h2>
                  <p className="text-base-content/65 leading-relaxed">{t(`tools.${key}.desc`)}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
