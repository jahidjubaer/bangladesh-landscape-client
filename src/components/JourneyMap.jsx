import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// One colour per transport mode — shared with the legend in PlanView
export const MODE_COLORS = {
  bus: '#0d7a68',
  train: '#7c3aed',
  launch: '#0284c7',
  air: '#db2777',
  cng: '#d97706',
  jeep: '#92400e',
  boat: '#0891b2',
  walk: '#64748b',
};

// legs: [{ mode, kind, from:{name,lat,lng}, to:{name,lat,lng} }]
export default function JourneyMap({ legs, height = '380px' }) {
  const pts = legs.flatMap((l) => [l.from, l.to]).filter((p) => p?.lat != null);
  if (!pts.length) return null;
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const bounds = [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];

  // Unique stops in visiting order, numbered
  const stops = [];
  for (const p of pts) if (!stops.some((s) => s.lat === p.lat && s.lng === p.lng)) stops.push(p);

  return (
    <div className="relative isolate z-0 rounded-xl overflow-hidden shadow-md" style={{ height }}>
      <MapContainer bounds={bounds} boundsOptions={{ padding: [30, 30] }} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {legs.map((l, i) => (
          <Polyline
            key={i}
            positions={[[l.from.lat, l.from.lng], [l.to.lat, l.to.lng]]}
            pathOptions={{
              color: MODE_COLORS[l.mode] || '#334155',
              weight: l.kind === 'local' ? 3 : 5,
              dashArray: l.kind === 'return' ? '8 8' : l.kind === 'local' ? '4 6' : undefined,
              opacity: 0.9,
            }}
          >
            <Tooltip sticky>{`${l.modeLabel}: ${l.from.name} → ${l.to.name}`}</Tooltip>
          </Polyline>
        ))}
        {stops.map((s, i) => (
          <CircleMarker
            key={`${s.lat},${s.lng}`}
            center={[s.lat, s.lng]}
            radius={i === 0 ? 9 : 7}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: i === 0 ? '#b91c1c' : '#0f172a', fillOpacity: 1 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>{`${i + 1}. ${s.name}`}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
