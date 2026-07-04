export function getLeafletHtml(lat: number, lon: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; }
    html, body, #map { height: 100%; width: 100vw; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var lat = ${lat};
    var lon = ${lon};

    var map = L.map('map', {
      zoomControl: true
    }).setView([lat, lon], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    var marker = L.marker([lat, lon], { draggable: true }).addTo(map);

    function sendLocation(newLat, newLon, address) {
      var payload = {
        type: 'MAP_CLICKED',
        lat: newLat,
        lon: newLon,
        address: address
      };
      
      // Post to React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
      
      // Post to Parent window (for web iframe)
      window.parent.postMessage(payload, '*');
    }

    var isRequesting = false;
    async function reverseGeocode(newLat, newLon) {
      if (isRequesting) return;
      isRequesting = true;
      try {
        var response = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + newLat + '&lon=' + newLon + '&zoom=18&addressdetails=1', {
          headers: {
            'User-Agent': 'CateringKu-App'
          }
        });
        var data = await response.json();
        if (data && data.display_name) {
          sendLocation(newLat, newLon, data.display_name);
        } else {
          sendLocation(newLat, newLon, "Koordinat: " + newLat.toFixed(5) + ", " + newLon.toFixed(5));
        }
      } catch (err) {
        console.error(err);
        sendLocation(newLat, newLon, "Koordinat: " + newLat.toFixed(5) + ", " + newLon.toFixed(5));
      } finally {
        isRequesting = false;
      }
    }

    // Handle map click
    map.on('click', function(e) {
      var newLat = e.latlng.lat;
      var newLon = e.latlng.lng;
      marker.setLatLng(e.latlng);
      map.panTo(e.latlng);
      reverseGeocode(newLat, newLon);
    });

    // Handle marker dragend
    marker.on('dragend', function(e) {
      var position = marker.getLatLng();
      map.panTo(position);
      reverseGeocode(position.lat, position.lng);
    });
  </script>
</body>
</html>
  `;
}
