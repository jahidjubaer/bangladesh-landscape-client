import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster from 'supercluster';
import { Link } from 'react-router-dom';
import Img from './ui/Img';
import { t, lx } from '../i18n';

const BD_CENTER = [23.685, 90.3563];

function clusterIcon(count) {
  const size = count < 10 ? 38 : count < 50 ? 46 : 54;
  return L.divIcon({
    html: `<div class="bl-cluster" style="width:${size}px;height:${size}px">${count}</div>`,
    className: '',
    iconSize: [size, size],
  });
}

const spotIcon = L.divIcon({
  html: '<div class="bl-pin"></div>',
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Re-clusters on every pan/zoom (Airbnb-style pins)
function Clusters({ points }) {
  const map = useMap();
  const [clusters, setClusters] = useState([]);

  const index = useMemo(() => {
    const sc = new Supercluster({ radius: 70, maxZoom: 15 });
    sc.load(
      points.map((s) => ({
        type: 'Feature',
        properties: { spot: s },
        geometry: { type: 'Point', coordinates: [s.location.lng, s.location.lat] },
      }))
    );
    return sc;
  }, [points]);

  useEffect(() => {
    function update() {
      const b = map.getBounds();
      setClusters(
        index.getClusters([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], Math.round(map.getZoom()))
      );
    }
    update();
    map.on('moveend', update);
    return () => map.off('moveend', update);
  }, [map, index]);

  return clusters.map((c) => {
    const [lng, lat] = c.geometry.coordinates;

    if (c.properties.cluster) {
      return (
        <Marker
          key={`cluster-${c.id}`}
          position={[lat, lng]}
          icon={clusterIcon(c.properties.point_count)}
          eventHandlers={{
            click: () =>
              map.setView([lat, lng], Math.min(index.getClusterExpansionZoom(c.id), 16), { animate: true }),
          }}
        />
      );
    }

    const s = c.properties.spot;
    return (
      <Marker key={s.slug} position={[lat, lng]} icon={spotIcon}>
        <Popup>
          <Link to={`/spots/${s.slug}`} className="block">
            <Img src={s.images?.[0]} alt={lx(s.name)} className="w-full h-24 object-cover" />
            <div className="p-3">
              <div className="font-bold text-sm leading-snug mb-0.5">{lx(s.name)}</div>
              <div className="text-xs opacity-60 mb-1.5">
                {lx(s.district?.name)} · {t(`spot.category.${s.category}`)}
              </div>
              <span className="text-primary text-xs font-semibold">{t('district.viewDetails')} →</span>
            </div>
          </Link>
        </Popup>
      </Marker>
    );
  });
}

export default function ExploreMap({ spots }) {
  const points = (spots || []).filter((s) => s.location?.lat != null && s.location?.lng != null);

  return (
    <div className="bl-map relative isolate z-0 rounded-2xl overflow-hidden shadow-lg h-[68vh] min-h-96">
      <MapContainer center={BD_CENTER} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Clusters points={points} />
      </MapContainer>
    </div>
  );
}
