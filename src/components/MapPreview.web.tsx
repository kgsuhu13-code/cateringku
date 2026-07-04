import React, { useEffect } from 'react';
import { View } from 'react-native';
import { getLeafletHtml } from './LeafletMapHtml';

interface MapPreviewProps {
  lat: number;
  lon: number;
  onLocationSelect: (location: { lat: number; lon: number; address: string }) => void;
}

export default function MapPreview({ lat, lon, onLocationSelect }: MapPreviewProps) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg && msg.type === 'MAP_CLICKED') {
        onLocationSelect({
          lat: msg.lat,
          lon: msg.lon,
          address: msg.address,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLocationSelect]);

  const htmlContent = getLeafletHtml(lat, lon);

  return (
    <View style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', height: 200 }}>
      <iframe
        key={`${lat}-${lon}`} // Re-render iframe when coordinates change from search box
        width="100%"
        height="100%"
        srcDoc={htmlContent}
        style={{ border: 'none' }}
      />
    </View>
  );
}
