import { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Position {
  latitude: number;
  longitude: number;
}

const customIcon = L.icon({
  iconUrl: 'marker.svg',   // path to your custom marker image
  iconSize: [25, 41],                         // size of the icon [width, height]
  iconAnchor: [12, 41],                       // point of the icon which corresponds to marker's location
  popupAnchor: [1, -34],                      // point from which the popup should open relative to the iconAnchor
  shadowSize: [41, 41],                       // size of the shadow
  shadowAnchor: [12, 41],                     // anchor for the shadow
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
      console.log(pos.coords.latitude, pos.coords.longitude);
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
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
      <h1>Hello World!</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !position && <p>Loading position...</p>}
      {position && (
        <>
          <div>
            <p>Latitude: {position.latitude}</p>
            <p>Longitude: {position.longitude}</p>
          </div>

          <MapContainer
            center={[position.latitude, +position.longitude]}
            zoom={17}
            scrollWheelZoom={false}
            style={{ height: '800px', width: '100%' }}>
            <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
