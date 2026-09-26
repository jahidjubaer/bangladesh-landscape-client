import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Home, Map as MapIcon } from 'lucide-react';
import { t } from '../i18n';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center min-h-[60vh]">
      <motion.div
        className="w-24 h-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6"
        animate={{ rotate: [0, 20, -20, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
      >
        <Compass className="w-12 h-12" strokeWidth={1.5} />
      </motion.div>
      <p className="font-display text-7xl font-extrabold text-primary mb-3">৪০৪</p>
      <h1 className="text-2xl font-bold mb-2">{t('common.notFoundTitle')}</h1>
      <p className="text-base-content/60 max-w-sm mb-8">
        {t('common.notFoundDesc')} মনে হচ্ছে আপনি হাওরের মাঝে পথ হারিয়েছেন! 🛶
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn btn-primary rounded-full gap-2">
          <Home className="w-4 h-4" /> {t('common.backHome')}
        </Link>
        <Link to="/districts" className="btn btn-outline rounded-full gap-2">
          <MapIcon className="w-4 h-4" /> {t('nav.districts')}
        </Link>
      </div>
    </div>
  );
}
