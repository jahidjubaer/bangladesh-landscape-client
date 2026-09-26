import { Link } from 'react-router-dom';
import { t } from '../i18n';

// Placeholder for routes that ship in later phases (districts, guides, blog, plan wizard)
export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="badge badge-warning badge-lg mb-6">{t('home.comingSoon')}</p>
      <Link to="/" className="btn btn-primary btn-sm">
        {t('common.backHome')}
      </Link>
    </div>
  );
}
