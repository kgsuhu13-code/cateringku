import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';

interface OSMMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lon: number) => void;
  draggable?: boolean;
}

// Lazy-load WebView only for mobile builds to prevent bundling crashes on web platforms
let WebViewComponent: any = null;
if (Platform.OS !== 'web') {
  try {
    WebViewComponent = require('react-native-webview').WebView;
  } catch (err) {
    console.error('Failed to load react-native-webview:', err);
  }
}

export default function OSMMap({ latitude, longitude, onLocationSelect, draggable = true }: OSMMapProps) {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper JS function in Leaflet script that determines if it should post message to mobile container or web parent window
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

          var marker = L.marker([${latitude}, ${longitude}], { draggable: ${draggable} }).addTo(map);

          function sendPosition(lat, lon) {
            var msg = JSON.stringify({
              type: 'location_changed',
              lat: lat,
              lon: lon
            });
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(msg);
            } else {
              window.parent.postMessage(msg, '*');
            }
          }

          if (${draggable}) {
            // Handle marker dragend event
            marker.on('dragend', function(e) {
              var position = marker.getLatLng();
              sendPosition(position.lat, position.lng);
            });

            // Handle map click event
            map.on('click', function(e) {
              marker.setLatLng(e.latlng);
              sendPosition(e.latlng.lat, e.latlng.lng);
            });
          }

          // Listen for messages from parent (React Native Web or Mobile WebView)
          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'update_center') {
                map.setView([data.lat, data.lon], 15);
                marker.setLatLng([data.lat, data.lon]);
              }
            } catch (err) {
              // Ignore invalid parse messages
            }
          });
        </script>
      </body>
    </html>
  `;

  // Sync coords from parent props to map view dynamically (Mobile & Web compatibility)
  useEffect(() => {
    const updateMsg = JSON.stringify({
      type: 'update_center',
      lat: latitude,
      lon: longitude
    });

    if (Platform.OS === 'web') {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(updateMsg, '*');
      }
    } else {
      if (webViewRef.current) {
        webViewRef.current.postMessage(updateMsg);
      }
    }
  }, [latitude, longitude]);

  // Handle messages on Web Browser (Web parent window)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleWebMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_changed') {
          onLocationSelect(data.lat, data.lon);
        }
      } catch (err) {
        // Ignore unparsed non-leaflet messages
      }
    };

    window.addEventListener('message', handleWebMessage);
    return () => window.removeEventListener('message', handleWebMessage);
  }, [onLocationSelect]);

  // Handle messages on Mobile (react-native-webview event)
  const handleMobileMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location_changed') {
        onLocationSelect(data.lat, data.lon);
      }
    } catch (err) {
      console.error('Failed to parse mobile message:', err);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-scripts allow-same-origin"
        />
      </View>
    );
  }

  if (!WebViewComponent) {
    return null;
  }

  return (
    <View className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <WebViewComponent
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMobileMessage}
        scrollEnabled={false}
        className="flex-1"
      />
    </View>
  );
}
