import { Link } from 'react-router-dom';
import { Camera, MapPin, Clock } from 'lucide-react';
import Img from '../ui/Img';
import FavoriteButton from '../ui/FavoriteButton';
import { CATEGORY_SCENE } from '../../lib/scenes';
import { t, lx } from '../../i18n';

// Editorial photo card: the whole card is the link, title on a scrim.
// `size="lg"` for the lead card in a picks row.
export default function SeasonSpotCard({ spot, size = 'md' }) {
  const tall = size === 'lg' ? 'min-h-[26rem] md:min-h-[30rem]' : 'min-h-[22rem]';
  return (
    <Link
      to={`/spots/${spot.slug}`}
      className={`group relative block overflow-hidden rounded-3xl text-white isolate ${tall} shadow-lg shadow-neutral/10`}
    >
      <Img
        src={spot.images?.[0]}
        alt={lx(spot.name)}
        icon={Camera}
        scene={CATEGORY_SCENE[spot.category]}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-brand group-hover:scale-[1.06]"
      />
      <span className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/75 pointer-events-none" />
      <FavoriteButton kind="spot" itemId={spot._id} className="absolute top-3 right-3 z-20" />
      <span className="absolute inset-x-0 bottom-0 p-5 md:p-6 pointer-events-none">
        <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-white/15 border border-white/25 backdrop-blur-md px-2.5 py-1 mb-3">
          <MapPin className="w-3 h-3" aria-hidden /> {lx(spot.district?.name)}
        </span>
        <span className={`font-display font-bold block leading-tight ${size === 'lg' ? 'text-title' : 'text-2xl'}`}>
          {lx(spot.name)}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-white/85">
          <span>{t(`spot.category.${spot.category}`)}</span>
          {spot.timeNeededHours > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden /> {spot.timeNeededHours}h
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
