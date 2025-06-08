import { useEffect, useState, useRef } from 'react';
import styles from './Home.module.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Position {
  latitude: number;
  longitude: number;
}

const customIcon = L.icon({
  iconUrl: 'marker.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

export const Home: React.FC = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const success = (pos: GeolocationPosition) => {
      const roundedLat = Number(pos.coords.latitude.toFixed(12));
      const roundedLng = Number(pos.coords.longitude.toFixed(12));

      setPosition({
        latitude: roundedLat,
        longitude: roundedLng,
      });
      setError(null);
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
      <h1>Hello World! 12</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !position && <p>Loading position...</p>}
      {position && (
        <>
          <div>
            <p>Latitude: {position.latitude}</p>
            <p>Longitude: {position.longitude}</p>
          </div>

          <MapContainer
            center={[position.latitude, position.longitude]}
            zoom={17}
            scrollWheelZoom={false}
            style={{ height: '800px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.latitude, position.longitude]} icon={customIcon}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </>
      )}
    </div>
  );
};
