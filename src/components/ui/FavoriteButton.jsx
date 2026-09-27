import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useFavorites } from '../../features/favorites/useFavorites';
import { t } from '../../i18n';

// Heart-save button for cards. Lives inside <Link> cards, so it swallows
// the click instead of navigating.
export default function FavoriteButton({ kind, itemId, className = '' }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(kind, itemId);

  return (
    <motion.button
      whileTap={{ scale: 0.75 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(kind, itemId);
      }}
      aria-label={t('wishlist.save')}
      aria-pressed={saved}
      className={`w-9 h-9 rounded-full bg-neutral/45 backdrop-blur-sm flex items-center justify-center hover:bg-neutral/65 transition-colors cursor-pointer ${className}`}
    >
      <Heart
        className={`w-[1.15rem] h-[1.15rem] transition-all ${
          saved ? 'fill-red-500 text-red-500 scale-110' : 'fill-neutral/30 text-white'
        }`}
        strokeWidth={2}
      />
    </motion.button>
  );
}
