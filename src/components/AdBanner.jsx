import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Sponsor banner for a slot; renders nothing when no active ad is scheduled.
// Clicks route through the API for counting, then redirect to the sponsor.
export default function AdBanner({ slot }) {
  const { data: ads } = useQuery({
    queryKey: ['ads', slot],
    queryFn: async () => (await api.get('/ads', { params: { slot } })).data.data.ads,
    staleTime: 5 * 60 * 1000,
  });

  if (!ads?.length) return null;
  const ad = ads[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <a
        href={`${API_BASE}/ads/${ad._id}/click`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative rounded-xl overflow-hidden shadow-sm"
      >
        <span className="absolute top-1 right-2 badge badge-neutral badge-xs opacity-80">বিজ্ঞাপন</span>
        <img src={ad.imageUrl} alt={ad.sponsorName} className="w-full max-h-28 object-cover" loading="lazy" />
      </a>
    </div>
  );
}
