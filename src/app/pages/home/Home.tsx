import { useEffect, useState, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon setup
const customIcon = L.icon({
  iconUrl: 'marker.svg', // Place your marker.svg in the public folder or adjust path accordingly
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
}

// Haversine formula to calculate distance between two coordinates in meters
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

// Component to set the initial map view only once
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

      // Filter updates to reduce jitter:
      // Update only if moved more than 3 meters or accuracy improved
      if (
        !lastPosition ||
        getDistanceMeters(
          lastPosition.latitude,
          lastPosition.longitude,
          newPos.latitude,
          newPos.longitude
        ) > 3 ||
        newPos.accuracy < lastPosition.accuracy
      ) {
        setPosition(newPos);
        lastPosition = newPos;
        setError(null);
      }
    };

    const failure = (err: GeolocationPositionError) => {
      setError(`Error getting position: ${err.message}`);
    };

    const watcherId = navigator.geolocation.watchPosition(success, failure, {
      enableHighAccuracy: true, // Request high accuracy
      maximumAge: 0,            // Do not use cached location
      timeout: 15000,           // 15 seconds timeout
    });

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1>High Accuracy Geolocation with Leaflet</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !position && <p>Loading position...</p>}
      {position && (
        <>
          <div style={{ marginBottom: 10 }}>
            <strong>Latitude:</strong> {position.latitude.toFixed(6)} <br />
            <strong>Longitude:</strong> {position.longitude.toFixed(6)} <br />
            <strong>Accuracy:</strong> ±{position.accuracy.toFixed(1)} meters
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
                Your current location <br />
                Accuracy: ±{position.accuracy.toFixed(1)} meters
              </Popup>
            </Marker>
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
