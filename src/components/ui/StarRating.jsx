import { Star } from 'lucide-react';

// Read-only star display with half-star support via fill overlay
export default function StarRating({ value = 0, count, size = 16, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-base-content/20" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-warning fill-warning" style={{ width: size, height: size }} />
            </span>
          </span>
        );
      })}
      {count !== undefined && <span className="text-xs text-base-content/50 ms-1">({count})</span>}
    </span>
  );
}
