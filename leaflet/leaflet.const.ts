export const initialMapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <style>
    #map { height: 100vh; width: 100vw; margin: 0; padding: 0; }
    body, html { margin: 0; padding: 0; height: 100%; }
    .leaflet-control-attribution.leaflet-control { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([51.0946, 17.0237], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const points = [];
    let polyline = null;
    let firstCircle = null;
    let lastCircle = null;

    function updateCircles() {
      // Remove existing circles if any
      if (firstCircle) {
        map.removeLayer(firstCircle);
        firstCircle = null;
      }
      if (lastCircle) {
        map.removeLayer(lastCircle);
        lastCircle = null;
      }

      if (points.length === 0) return;

      // Add green circle for first point
      const firstPoint = points[0];
      firstCircle = L.circleMarker(firstPoint, {
        radius: 8,
        color: '#228B22',
        fillColor: '#228B22',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);

      // Add red circle for last point if more than one point
      if (points.length > 1) {
        const lastPoint = points[points.length - 1];
        lastCircle = L.circleMarker(lastPoint, {
          radius: 8,
          color: '#D32F2F',
          fillColor: '#D32F2F',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
      }
    }

    function handleMessage(event) {
      try {
        console.log("WebView received message:", event.data);
        const data = JSON.parse(event.data);

        if (data.type === "clearMarkers") {
          if (polyline) {
            map.removeLayer(polyline);
            polyline = null;
          }
          points.length = 0;

          if (firstCircle) {
            map.removeLayer(firstCircle);
            firstCircle = null;
          }
          if (lastCircle) {
            map.removeLayer(lastCircle);
            lastCircle = null;
          }
          console.log('All points and circles cleared');
        }

        if (data.type === 'addMarker') {
          const { lat, lon } = data.payload;
          points.push([lat, lon]);

          if (polyline) {
            map.removeLayer(polyline);
          }
          polyline = L.polyline(points, { color: '#FB8C00', weight: 3 }).addTo(map);

          updateCircles();

          map.panTo([lat, lon]);
          console.log('Added point at:', lat, lon);
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    }

    window.addEventListener('message', handleMessage, false);
    document.addEventListener('message', handleMessage, false);

    // Notify React Native that map is ready
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'mapReady' }));
  </script>
</body>
</html>
`;
