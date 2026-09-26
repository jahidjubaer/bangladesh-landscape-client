import { Link } from 'react-router-dom';
import { t } from '../i18n';

export default function Footer() {
  return (
    <footer className="bg-neutral text-neutral-content mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-lg font-bold mb-2">{t('site.name')}</h2>
          <p className="text-sm opacity-80 leading-relaxed">{t('footer.about')}</p>
        </div>
        <nav>
          <h3 className="footer-title">{t('footer.quickLinks')}</h3>
          <ul className="space-y-1 text-sm">
            <li><Link className="link link-hover" to="/districts">{t('nav.districts')}</Link></li>
            <li><Link className="link link-hover" to="/guides">{t('nav.guides')}</Link></li>
            <li><Link className="link link-hover" to="/become-guide">{t('guide.becomeGuide')}</Link></li>
            <li><Link className="link link-hover" to="/blog">{t('nav.blog')}</Link></li>
          </ul>
        </nav>
        <nav>
          <h3 className="footer-title">{t('footer.policies')}</h3>
          <ul className="space-y-1 text-sm">
            <li><Link className="link link-hover" to="/policies/user">{t('footer.userPolicy')}</Link></li>
            <li><Link className="link link-hover" to="/policies/guide">{t('footer.guidePolicy')}</Link></li>
            <li><Link className="link link-hover" to="/policies/partner">{t('footer.partnerPolicy')}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-neutral-content/10 py-4 text-center text-sm opacity-70">
        © {new Date().getFullYear()} {t('site.name')} — {t('footer.rights')}
      </div>
    </footer>
  );
}
