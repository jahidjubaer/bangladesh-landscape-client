import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { t } from '../i18n';

// Vite doesn't resolve Leaflet's default icon paths — set them explicitly
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// markers: [{ lat, lng, nameBn, slug }]
export default function SpotMap({ center, zoom = 10, markers = [], height = '400px' }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-md" style={{ height }}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers
          .filter((m) => m.lat != null && m.lng != null)
          .map((m) => (
            <Marker key={`${m.lat}-${m.lng}-${m.nameBn}`} position={[m.lat, m.lng]}>
              <Popup>
                <strong>{m.nameBn}</strong>
                {m.slug && (
                  <>
                    <br />
                    <Link to={`/spots/${m.slug}`}>{t('district.viewDetails')}</Link>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
