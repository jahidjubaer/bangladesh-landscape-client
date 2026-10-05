import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from './bdDistricts';

// Static (non-interactive) Bangladesh map with highlighted districts
export default function MiniMap({ visited, highlightClass = 'fill-primary', className = '' }) {
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className={className} aria-hidden="true">
      {DISTRICTS.map((d) => (
        <path
          key={d.slug}
          d={d.d}
          className={`stroke-base-100 ${visited.has(d.slug) ? highlightClass : 'fill-primary/15'}`}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
