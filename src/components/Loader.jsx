import { t } from '../i18n';

export default function Loader({ fullScreen = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${fullScreen ? 'min-h-screen' : 'py-16'}`}>
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <span className="text-base-content/70">{t('common.loading')}</span>
    </div>
  );
}
