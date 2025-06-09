import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Circle,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Constants
const MIN_ACCURACY = 10; // meters
const MIN_MOVE_DISTANCE = 10; // meters, lowered for more frequent updates
const THROTTLE_TIME = 0; // ms, throttle updates
const SMOOTHING_WINDOW = 1; // disabled smoothing

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Custom marker icon
const customIcon = L.icon({
  iconUrl: 'marker.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

// Distance calculation helper
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

// Initial map view setter
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

// Throttle helper
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let lastFunc: number;
  let lastRan: number;
  return function (this: any, ...args: any[]) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = window.setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  } as T;
}

export const Home: React.FC = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [path, setPath] = useState<[number, number][]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastPositionRef = useRef<Position | null>(null);
  const recentPositionsRef = useRef<Position[]>([]);

  // Smoothing (effectively disabled here)
  const smoothPosition = (newPos: Position): Position => {
    recentPositionsRef.current.push(newPos);
    if (recentPositionsRef.current.length > SMOOTHING_WINDOW) {
      recentPositionsRef.current.shift();
    }
    const avgLat =
      recentPositionsRef.current.reduce((sum, p) => sum + p.latitude, 0) /
      recentPositionsRef.current.length;
    const avgLon =
      recentPositionsRef.current.reduce((sum, p) => sum + p.longitude, 0) /
      recentPositionsRef.current.length;
    const avgAccuracy =
      recentPositionsRef.current.reduce((sum, p) => sum + p.accuracy, 0) /
      recentPositionsRef.current.length;
    return { latitude: avgLat, longitude: avgLon, accuracy: avgAccuracy };
  };

  // Position update handler (throttled)
  const updatePosition = useCallback(
    (pos: GeolocationPosition) => {
      const rawPos: Position = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };

      if (rawPos.accuracy > MIN_ACCURACY) return;

      const newPos = smoothPosition(rawPos);

      if (!startPosition) {
        setStartPosition(newPos);
        setPosition(newPos);
        lastPositionRef.current = newPos;
        setPath([[newPos.latitude, newPos.longitude]]);
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

        if (
          dist > MIN_MOVE_DISTANCE &&
          newPos.accuracy <= lastPositionRef.current.accuracy + 10
        ) {
          setDistance((prev) => prev + dist);
          setPosition(newPos);
          lastPositionRef.current = newPos;
          setPath((prev) => [...prev, [newPos.latitude, newPos.longitude]]);
          setError(null);
        }
      }
    },
    [startPosition]
  );

  // Throttled version of updatePosition
  const throttledUpdatePosition = useMemo(() => throttle(updatePosition, THROTTLE_TIME), [updatePosition]);

  const failure = useCallback((err: GeolocationPositionError) => {
    setError(`Error getting position: ${err.message}`);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      throttledUpdatePosition,
      failure,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, [throttledUpdatePosition, failure]);

  const resetTracking = () => {
    setPosition(null);
    setStartPosition(null);
    setDistance(0);
    setPath([]);
    setError(null);
    lastPositionRef.current = null;
    recentPositionsRef.current = [];
  };

  // Memoized Polyline to avoid unnecessary re-renders
  const MemoizedPolyline = React.memo(({ positions }: { positions: [number, number][] }) => (
    <Polyline
      positions={positions}
      pathOptions={{ color: 'red', weight: 5, lineJoin: 'round', lineCap: 'round' }}
      renderer={L.canvas()}
    />
  ));

  return (
    <div style={{ height: '100vh', width: '100%', padding: 10 }}>
      <h1>Traveled Distance and Path (Improved)</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!error && !position && <p>Loading current position...</p>}

      {position && startPosition && (
        <>
          <div style={{ marginBottom: 10 }}>
            <p>
              <strong>Start Position:</strong>
              <br />
              Lat: {startPosition.latitude.toFixed(6)}, Lon: {startPosition.longitude.toFixed(6)}
            </p>
            <p>
              <strong>Current Position:</strong>
              <br />
              Lat: {position.latitude.toFixed(6)}, Lon: {position.longitude.toFixed(6)}
            </p>
            <p>
              <strong>Accuracy:</strong> ±{position.accuracy.toFixed(1)} meters
            </p>
            <p>
              <strong>Total Distance Traveled:</strong> {(distance / 1000).toFixed(3)} km
            </p>
            <button onClick={resetTracking} aria-label="Reset tracking">
              Reset Tracking
            </button>
          </div>

          <MapContainer
            center={[startPosition.latitude, startPosition.longitude]}
            zoom={17}
            scrollWheelZoom={false}
            style={{ height: '80vh', width: '100%' }}
            aria-label="Map showing traveled path"
          >
            <SetInitialView position={startPosition} />
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.latitude, position.longitude]} icon={customIcon}>
              <Popup>
                Current Location
                <br />
                Accuracy: ±{position.accuracy.toFixed(1)} meters
              </Popup>
            </Marker>
            <Circle
              center={[position.latitude, position.longitude]}
              radius={position.accuracy}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
            <MemoizedPolyline positions={path} />
          </MapContainer>
        </>
      )}
    </div>
  );
};
