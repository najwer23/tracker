import { useEffect, useState, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = L.icon({
  iconUrl: 'marker.svg', // your marker image path
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
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const lastPositionRef = useRef<Position | null>(null);

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

      // Set start position once
      if (!startPosition) {
        setStartPosition(newPos);
        setPosition(newPos);
        lastPositionRef.current = newPos;
        setError(null);
        return;
      }

      // Calculate distance from last position
      if (lastPositionRef.current) {
        const dist = getDistanceMeters(
          lastPositionRef.current.latitude,
          lastPositionRef.current.longitude,
          newPos.latitude,
          newPos.longitude
        );

        // Update distance if moved more than 3 meters (to avoid noise)
        if (dist > 3) {
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
      <h1>Traveled Distance From Start</h1>
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
