import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface OSMMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lon: number) => void;
}

export default function OSMMap({ latitude, longitude, onLocationSelect }: OSMMapProps) {
  const webViewRef = useRef<WebView>(null);

  // HTML content rendering Leaflet Map with OpenStreetMap tiles
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; padding: 0; }
          body { margin: 0; padding: 0; overflow: hidden; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var marker = L.marker([${latitude}, ${longitude}], { draggable: true }).addTo(map);

          // Handle marker dragend event
          marker.on('dragend', function(e) {
            var position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'location_changed',
              lat: position.lat,
              lon: position.lng
            }));
          });

          // Handle map click event
          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'location_changed',
              lat: e.latlng.lat,
              lon: e.latlng.lng
            }));
          });

          // Listen for messages from React Native (e.g. search address trigger location update)
          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'update_center') {
                map.setView([data.lat, data.lon], 15);
                marker.setLatLng([data.lat, data.lon]);
              }
            } catch (err) {
              console.error(err);
            }
          });
        </script>
      </body>
    </html>
  `;

  // Send update to Leaflet map when lat/lon props change dynamically
  useEffect(() => {
    if (webViewRef.current) {
      const updateMsg = JSON.stringify({
        type: 'update_center',
        lat: latitude,
        lon: longitude
      });
      webViewRef.current.postMessage(updateMsg);
    }
  }, [latitude, longitude]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location_changed') {
        onLocationSelect(data.lat, data.lon);
      }
    } catch (err) {
      console.error('Failed to parse message from map WebView:', err);
    }
  };

  return (
    <View className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        scrollEnabled={false}
        className="flex-1"
      />
    </View>
  );
}
