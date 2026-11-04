import { useEffect, useState } from 'react';
import { Link, isRouteErrorResponse, useRouteError } from '../lib/router';
import { RefreshCw, Home, TriangleAlert } from 'lucide-react';
import NotFound from './NotFound';
import Loader from '../components/Loader';
import { t } from '../i18n';
import { reportError, isChunkLoadError, reloadForNewBuild } from '../lib/errorReporter';

// Router-level error screen: replaces React Router's default developer crash page
export default function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const staleChunk = isChunkLoadError(error);
  // Stale chunk after a deploy: reload once; if we already did, show the message instead
  const [reloading, setReloading] = useState(staleChunk);

  useEffect(() => {
    if (staleChunk) {
      if (!reloadForNewBuild()) setReloading(false);
    } else if (!notFound) {
      reportError(error);
    }
  }, [error, notFound, staleChunk]);

  if (notFound) return <NotFound />;
  if (reloading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-warning/15 text-warning flex items-center justify-center mb-6">
        <TriangleAlert className="w-10 h-10" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl font-bold mb-2">{t(staleChunk ? 'errorPage.updatedTitle' : 'errorPage.title')}</h1>
      <p className="text-base-content/60 max-w-sm mb-8">{t(staleChunk ? 'errorPage.updatedDesc' : 'errorPage.desc')}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button className="btn btn-primary rounded-full gap-2" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" /> {t('errorPage.reload')}
        </button>
        <Link to="/" reloadDocument className="btn btn-outline rounded-full gap-2">
          <Home className="w-4 h-4" /> {t('common.backHome')}
        </Link>
      </div>
    </div>
  );
}
