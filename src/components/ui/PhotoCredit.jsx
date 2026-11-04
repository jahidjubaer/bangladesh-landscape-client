import { useQuery } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import api from '../../lib/api';

// Attribution list (uploads/image-credits.json), fetched once per session
export function useCredits() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: async () => ((await api.get('/credits')).data.data.credits || []).filter((c) => c?.file),
    staleTime: Infinity,
  });
}

export function findCredit(credits, src) {
  if (!src || !credits?.length) return null;
  const file = decodeURIComponent(src.split('?')[0].split('/').pop() || '');
  return credits.find((c) => c.file === file) || null;
}

// Small "Photo: author · licence" chip for a photo, linking to the source.
// Renders nothing for photos without a credit entry.
export default function PhotoCredit({ src, className = '' }) {
  const { data } = useCredits();
  const c = findCredit(data, src);
  if (!c) return null;
  const text = [c.author, c.license].filter(Boolean).join(' · ');
  const cls = `inline-flex items-center gap-1.5 max-w-[80vw] truncate rounded-full bg-black/45 backdrop-blur px-2.5 py-1 text-[0.7rem] text-white/90 ${className}`;
  return c.source ? (
    <a href={c.source} target="_blank" rel="noopener noreferrer" className={`${cls} hover:text-white`} onClick={(e) => e.stopPropagation()}>
      <Camera className="w-3 h-3 shrink-0" aria-hidden /> {text}
    </a>
  ) : (
    <span className={cls}>
      <Camera className="w-3 h-3 shrink-0" aria-hidden /> {text}
    </span>
  );
}
