import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

const DARK = 'landscape-dark';
const LIGHT = 'landscape';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || LIGHT);
  const isDark = theme === DARK;

  function toggle() {
    const next = isDark ? LIGHT : DARK;
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('bl-theme', next);
    } catch {
      /* private mode */
    }
    setTheme(next);
  }

  return (
    <button onClick={toggle} className="btn btn-ghost btn-circle btn-sm" aria-label={isDark ? 'light mode' : 'dark mode'}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
