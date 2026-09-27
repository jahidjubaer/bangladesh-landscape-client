import { useQuery } from '@tanstack/react-query';
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudLightning, Droplets, Wind } from 'lucide-react';
import api from '../lib/axios';
import Reveal from './ui/Reveal';
import { t, locale } from '../i18n';

// WMO weather code → { Icon, label key }
function codeInfo(code) {
  if (code === 0) return { Icon: Sun, key: 'clear' };
  if (code <= 2) return { Icon: CloudSun, key: 'partly' };
  if (code === 3) return { Icon: Cloud, key: 'cloudy' };
  if (code === 45 || code === 48) return { Icon: CloudFog, key: 'fog' };
  if (code >= 51 && code <= 57) return { Icon: CloudDrizzle, key: 'drizzle' };
  if (code >= 95) return { Icon: CloudLightning, key: 'storm' };
  return { Icon: CloudRain, key: 'rain' }; // 61–82
}

const n = (v) => Number(v).toLocaleString(locale());

export default function WeatherStrip({ slug }) {
  const { data: weather } = useQuery({
    queryKey: ['weather', slug],
    queryFn: async () => (await api.get(`/districts/${slug}/weather`)).data.data.weather,
    enabled: Boolean(slug),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (!weather) return null; // loading or unavailable — the page works without it

  const cur = codeInfo(weather.current.code);
  const CurIcon = cur.Icon;

  return (
    <Reveal>
      <div className="card bg-gradient-to-r from-secondary/10 via-base-100 to-primary/10 border border-base-200 shadow-sm">
        <div className="card-body p-4 md:p-5 flex-row items-center gap-4 flex-wrap">
          {/* Current */}
          <div className="flex items-center gap-3 pe-4 md:border-e border-base-300">
            <CurIcon className="w-10 h-10 text-secondary" strokeWidth={1.6} />
            <div>
              <div className="font-display text-2xl font-extrabold leading-none">{n(weather.current.temp)}°C</div>
              <div className="text-xs text-base-content/60 mt-0.5">{t(`weather.code.${cur.key}`)}</div>
            </div>
            <div className="text-xs text-base-content/55 space-y-1 ms-2">
              <div className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> {n(weather.current.humidity)}%</div>
              <div className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> {n(weather.current.wind)} km/h</div>
            </div>
          </div>

          {/* 4-day forecast */}
          <div className="flex gap-2 flex-1 justify-end flex-wrap">
            {weather.daily.map((d) => {
              const info = codeInfo(d.code);
              const DayIcon = info.Icon;
              return (
                <div key={d.date} className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-base-100/70 min-w-16">
                  <span className="text-xs text-base-content/55">
                    {new Date(d.date).toLocaleDateString(locale(), { weekday: 'short' })}
                  </span>
                  <DayIcon className="w-5 h-5 text-secondary" strokeWidth={1.7} />
                  <span className="text-xs font-semibold">
                    {n(d.max)}°<span className="text-base-content/45">/{n(d.min)}°</span>
                  </span>
                  <span className={`text-[10px] flex items-center gap-0.5 ${d.rain >= 60 ? 'text-info font-semibold' : 'text-base-content/45'}`}>
                    <Droplets className="w-2.5 h-2.5" /> {n(d.rain)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
