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
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const points = [];
    let polyline = null;

    window.document.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'addMarker') {
          const { latitude, longitude, index, accuracy } = data.payload;

          // Add point to array for polyline
          points.push([latitude, longitude]);

          const circleMarker = L.circleMarker([latitude, longitude], {
            radius: 6,
            fillColor: '#3388ff',
            color: '#3388ff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map);

          circleMarker.bindPopup('Point ' + (index + 1) + ': ' + latitude.toFixed(6) + ', ' + longitude.toFixed(6));

          // Remove old polyline and add updated one
          if (polyline) {
            map.removeLayer(polyline);
          }
          polyline = L.polyline(points, { color: 'red', weight: 3 }).addTo(map);

          // Pan to latest point
          map.panTo([latitude, longitude]);
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    });
  </script>
</body>
</html>
`;