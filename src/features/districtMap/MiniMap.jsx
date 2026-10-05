import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from './bdDistricts';
import { stateOf } from './visited';

export const STATE_FILL = {
  home: 'fill-rose-600',
  visited: 'fill-primary',
  passed: 'fill-amber-400',
  '': 'fill-primary/15',
};

// Static (non-interactive) Bangladesh map coloured by visit state
export default function MiniMap({ map, className = '' }) {
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className={className} aria-hidden="true">
      {DISTRICTS.map((d) => (
        <path
          key={d.slug}
          d={d.d}
          className={`stroke-base-100 ${STATE_FILL[stateOf(map, d.slug)]}`}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
