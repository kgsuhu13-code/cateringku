import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { getLeafletHtml } from './LeafletMapHtml';

interface MapPreviewProps {
  lat: number;
  lon: number;
  onLocationSelect: (location: { lat: number; lon: number; address: string }) => void;
}

export default function MapPreview({ lat, lon, onLocationSelect }: MapPreviewProps) {
  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg && msg.type === 'MAP_CLICKED') {
        onLocationSelect({
          lat: msg.lat,
          lon: msg.lon,
          address: msg.address,
        });
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  const htmlContent = getLeafletHtml(lat, lon);

  return (
    <View style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', height: 200 }}>
      <WebView
        key={`${lat}-${lon}`} // Re-render WebView when coordinates change from search box
        style={{ flex: 1 }}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}
