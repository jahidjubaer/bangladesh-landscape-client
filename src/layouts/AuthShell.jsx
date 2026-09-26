import { motion } from 'motion/react';
import { Mountain, Sparkles, ShieldCheck, Map as MapIcon } from 'lucide-react';
import { t } from '../i18n';

const perks = [
  { Icon: Sparkles, text: 'AI ট্যুর প্ল্যান — নতুন অ্যাকাউন্টে একটি ফ্রি' },
  { Icon: ShieldCheck, text: 'NID-যাচাই করা লোকাল গাইড' },
  { Icon: MapIcon, text: 'মাঠপর্যায়ে যাচাই করা ভ্রমণ তথ্য' },
];

// Split auth layout: brand panel (desktop) + form side
export default function AuthShell({ title, children }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-[#0a2622] via-[#0d3a32] to-primary text-neutral-content flex-col justify-center p-14">
        <motion.div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent/15 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Mountain className="w-7 h-7 text-primary-content" strokeWidth={2.2} />
            </span>
            <span className="font-display text-2xl font-bold">{t('site.name')}</span>
          </div>
          <h2 className="font-display text-3xl xl:text-4xl font-extrabold leading-snug mb-8 max-w-md">
            {t('home.heroTitle')}
          </h2>
          <ul className="space-y-4">
            {perks.map(({ Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.12 }}
                className="flex items-center gap-3"
              >
                <span className="w-9 h-9 rounded-xl bg-neutral-content/10 flex items-center justify-center shrink-0">
                  <Icon className="w-[18px] h-[18px] text-accent" />
                </span>
                <span className="opacity-85">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-14 bg-base-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-center mb-8">{title}</h1>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
