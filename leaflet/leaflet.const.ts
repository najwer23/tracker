export const initialMapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <style>
    #map { height: 100vh; width: 100vw; margin: 0; padding: 0; }
    body, html { margin: 0; padding: 0; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([51.0946, 17.0237], 18);
    // const map = L.map('map').setView([37.33, -122.06], 17);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const points = [];
    let polyline = null;

    function handleMessage(event) {
        try {
            const data = JSON.parse(event.data);

            console.log('Received message:', data);

            if (data.type === "clearMarkers") {
                if (polyline) {
                    map.removeLayer(polyline);
                    polyline = null;
                }
                points.length = 0;
                console.log('All points cleared');
            }

            if (data.type === 'addMarker') {
                const { latitude, longitude } = data.payload;
                points.push([latitude, longitude]);
                if (polyline) {
                    map.removeLayer(polyline);
                }
                polyline = L.polyline(points, { color: 'red', weight: 3 }).addTo(map);
                map.panTo([latitude, longitude]);
                console.log('Added marker at:', latitude, longitude);
            }
        } catch (e) {
            console.error('Failed to parse message', e);
        }
    }

    // Listen for both iOS and Android
    window.addEventListener('message', handleMessage, false);
    document.addEventListener('message', handleMessage, false);

  </script>
</body>
</html>
`;
