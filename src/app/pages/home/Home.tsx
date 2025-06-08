import { useEffect, useState, useRef } from 'react';
import styles from './Home.module.css';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
}

const customIcon = L.icon({
  iconUrl: 'marker.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

// Haversine formula to calculate distance between two coords in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SetInitialView: React.FC<{ position: Position }> = ({ position }) => {
  const map = useMap();
  const initialSet = useRef(false);

  useEffect(() => {
    if (!initialSet.current) {
      map.setView([position.latitude, position.longitude], 17);
      initialSet.current = true;
    }
  }, [map, position]);

  return null;
};

export const Home: React.FC = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    let lastPosition: Position | null = null;

    const success = (pos: GeolocationPosition) => {
      const newPos: Position = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };

      // If no last position, set immediately
      if (!lastPosition) {
        setPosition(newPos);
        lastPosition = newPos;
        setError(null);
        return;
      }

      // Calculate distance between last and new position
      const dist = getDistanceMeters(
        lastPosition.latitude,
        lastPosition.longitude,
        newPos.latitude,
        newPos.longitude
      );

      // Update position only if moved more than 3 meters or accuracy improved
      if (dist > 3 || newPos.accuracy < lastPosition.accuracy) {
        setPosition(newPos);
        lastPosition = newPos;
        setError(null);
      }
    };

    const failure = (err: GeolocationPositionError) => {
      setError(`Error getting position: ${err.message}`);
    };

    const watcherId = navigator.geolocation.watchPosition(success, failure, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    });

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  return (
    <div className={styles.container}>
      <h1>Hello World!</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !position && <p>Loading position...</p>}
      {position && (
        <>
          <div>
            <p>Latitude: {position.latitude.toFixed(6)}</p>
            <p>Longitude: {position.longitude.toFixed(6)}</p>
            <p>Accuracy: ±{position.accuracy.toFixed(1)} meters</p>
          </div>

          <MapContainer
            center={[position.latitude, position.longitude]}
            zoom={17}
            scrollWheelZoom={false}
            style={{ height: '800px', width: '100%' }}
          >
            <SetInitialView position={position} />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.latitude, position.longitude]} icon={customIcon}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
            {/* Circle showing accuracy radius */}
            <Circle
              center={[position.latitude, position.longitude]}
              radius={position.accuracy}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
          </MapContainer>
        </>
      )}
    </div>
  );
};
