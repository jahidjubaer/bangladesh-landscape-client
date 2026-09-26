import { Link } from 'react-router-dom';
import { t } from '../i18n';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <p className="text-7xl font-extrabold text-primary mb-4">৪০৪</p>
      <h1 className="text-2xl font-bold mb-2">{t('common.notFoundTitle')}</h1>
      <p className="text-base-content/70 mb-6">{t('common.notFoundDesc')}</p>
      <Link to="/" className="btn btn-primary">
        {t('common.backHome')}
      </Link>
    </div>
  );
}
