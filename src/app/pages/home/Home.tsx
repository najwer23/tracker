import { useEffect, useState, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = L.icon({
  iconUrl: 'marker.svg', // Adjust path to your marker image in public folder
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Haversine formula to calculate distance between two lat/lng points in meters
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

// Component to set initial map view only once
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
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const lastPositionRef = useRef<Position | null>(null);

  // Constants to filter noisy GPS readings
  const MIN_ACCURACY = 30; // meters, ignore positions with worse accuracy
  const MIN_MOVE_DISTANCE = 5; // meters, minimum movement to count

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const success = (pos: GeolocationPosition) => {
      const newPos: Position = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };

      // Ignore positions with poor accuracy
      if (newPos.accuracy > MIN_ACCURACY) {
        // Optionally, you can set an error or just ignore silently
        return;
      }

      // Set start position once
      if (!startPosition) {
        setStartPosition(newPos);
        setPosition(newPos);
        lastPositionRef.current = newPos;
        setError(null);
        return;
      }

      if (lastPositionRef.current) {
        const dist = getDistanceMeters(
          lastPositionRef.current.latitude,
          lastPositionRef.current.longitude,
          newPos.latitude,
          newPos.longitude
        );

        // Only count movement if distance > accuracy and > minimum move distance
        if (dist > newPos.accuracy && dist > MIN_MOVE_DISTANCE) {
          setDistance((prev) => prev + dist);
          setPosition(newPos);
          lastPositionRef.current = newPos;
          setError(null);
        }
      }
    };

    const failure = (err: GeolocationPositionError) => {
      setError(`Error getting position: ${err.message}`);
    };

    const watcherId = navigator.geolocation.watchPosition(success, failure, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    });

    return () => navigator.geolocation.clearWatch(watcherId);
  }, [startPosition]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1>Traveled Distance with Accuracy Filtering</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !position && <p>Loading position...</p>}
      {position && startPosition && (
        <>
          <div style={{ marginBottom: 10 }}>
            <p>
              <strong>Start Position:</strong><br />
              Lat: {startPosition.latitude.toFixed(6)}, Lon: {startPosition.longitude.toFixed(6)}
            </p>
            <p>
              <strong>Current Position:</strong><br />
              Lat: {position.latitude.toFixed(6)}, Lon: {position.longitude.toFixed(6)}
            </p>
            <p>
              <strong>Accuracy:</strong> ±{position.accuracy.toFixed(1)} meters
            </p>
            <p>
              <strong>Total Distance Traveled:</strong> {(distance / 1000).toFixed(3)} km
            </p>
          </div>

          <MapContainer
            center={[startPosition.latitude, startPosition.longitude]}
            zoom={17}
            scrollWheelZoom={false}
            style={{ height: '80vh', width: '100%' }}
          >
            <SetInitialView position={startPosition} />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.latitude, position.longitude]} icon={customIcon}>
              <Popup>
                Current Location <br />
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
