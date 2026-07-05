import React from 'react';
import { View, Platform } from 'react-native';
import OSMMap from './OSMMap';

interface MapPreviewProps {
  lat: number;
  lon: number;
  onLocationSelect: (location: { lat: number; lon: number; address: string }) => void;
}

export default function MapPreview({ lat, lon, onLocationSelect }: MapPreviewProps) {
  const handleLocationSelect = async (newLat: number, newLon: number) => {
    try {
      const headers: Record<string, string> = {};
      if (Platform.OS !== 'web') {
        headers['User-Agent'] = 'CateringKu-App-Demo';
      }
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLon}`,
        { headers }
      );
      const data = await response.json();
      const address = data?.display_name || 'Alamat Terdeteksi';
      
      onLocationSelect({
        lat: newLat,
        lon: newLon,
        address,
      });
    } catch (err) {
      console.error('Failed to reverse geocode in MapPreview:', err);
      onLocationSelect({
        lat: newLat,
        lon: newLon,
        address: 'Gagal memuat alamat teks',
      });
    }
  };

  return (
    <View style={{ marginTop: 16 }}>
      <OSMMap
        latitude={lat}
        longitude={lon}
        onLocationSelect={handleLocationSelect}
        draggable={true}
      />
    </View>
  );
}
