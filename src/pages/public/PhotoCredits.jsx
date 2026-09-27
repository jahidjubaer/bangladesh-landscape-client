import { useQuery } from '@tanstack/react-query';
import { Camera, ExternalLink } from 'lucide-react';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import Seo from '../../components/Seo';
import { t } from '../../i18n';

export default function PhotoCredits() {
  const { data: credits, isLoading } = useQuery({
    queryKey: ['photoCredits'],
    queryFn: async () => ((await api.get('/credits')).data.data.credits || []).filter((c) => c?.file),
    staleTime: 60 * 60 * 1000,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Seo title={t('credits.title')} description={t('credits.subtitle')} />
      <Reveal>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('credits.title')}</h1>
        <p className="text-base-content/60 mb-10 max-w-2xl">{t('credits.subtitle')}</p>
      </Reveal>

      {isLoading ? (
        <Loader />
      ) : !credits?.length ? (
        <EmptyState icon={Camera} title={t('credits.empty')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {credits.map((c, i) => (
            <Reveal key={`${c.file}-${i}`} delay={(i % 2) * 0.06}>
              <div className="card card-side bg-base-100 shadow-md h-full">
                <figure className="w-32 shrink-0">
                  <Img src={`/uploads/${c.file}`} alt={c.author} icon={Camera} className="w-full h-full object-cover" />
                </figure>
                <div className="card-body p-4 gap-1">
                  <div className="text-sm">
                    <span className="text-base-content/50">{t('credits.photographer')}: </span>
                    <strong>{c.author || 'Unknown'}</strong>
                  </div>
                  <div className="text-sm">
                    <span className="text-base-content/50">{t('credits.license')}: </span>
                    <span className="badge badge-ghost badge-sm">{c.license}</span>
                  </div>
                  {c.source && (
                    <a
                      href={c.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary text-sm flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> {t('credits.viewSource')}
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
