import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Img from './Img';

// Airbnb-style in-card photo stepper: arrows on hover, dots below.
// Falls back to a plain <Img> when there's one photo or none.
export default function CardCarousel({ images = [], alt = '', icon, className = '' }) {
  const pics = (images || []).filter(Boolean);
  const [idx, setIdx] = useState(0);

  if (pics.length <= 1) {
    return <Img src={pics[0]} alt={alt} icon={icon} className={className} />;
  }

  const go = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + dir + pics.length) % pics.length);
  };

  const arrowCls =
    'absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-base-100/90 text-base-content shadow-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:!opacity-100 hover:scale-105 transition-all cursor-pointer';

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <Img key={pics[idx]} src={pics[idx]} alt={alt} icon={icon} className="w-full h-full object-cover" />

      <button onClick={(e) => go(e, -1)} className={`${arrowCls} left-2`} aria-label="previous photo">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={(e) => go(e, 1)} className={`${arrowCls} right-2`} aria-label="next photo">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-2 inset-x-0 z-10 flex justify-center gap-1.5 pointer-events-none">
        {pics.map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/55'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
