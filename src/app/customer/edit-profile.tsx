import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { customAlert } from '../../components/CustomAlert';
import { useRouter } from 'expo-router';
import { api } from '../../hooks/api';
import { useAuthStore } from '../../hooks/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react-native';
import MapPreview from '../../components/MapPreview';

const GREEN = '#059669';

export default function EditProfile() {
  const router = useRouter();
  const { updateUser } = useAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Address search suggestions (OpenStreetMap Nominatim)
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: -7.2504, // Default Surabaya
    lon: 112.7688,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.getUserProfile();
        setName(data.name || '');
        setPhone(data.phone || '');
        const addr = data.address || '';
        setAddress(addr);

        // Geocode initial address if it exists
        if (addr.trim().length > 3) {
          try {
            const headers: Record<string, string> = {};
            if (Platform.OS !== 'web') {
              headers['User-Agent'] = 'CateringkuApp/1.0';
            }
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&countrycodes=id&limit=1`,
              { headers }
            );
            const items = await response.json();
            if (Array.isArray(items) && items.length > 0) {
              setCoordinates({
                lat: parseFloat(items[0].lat),
                lon: parseFloat(items[0].lon),
              });
            }
          } catch (e) {
            console.error('Failed to geocode initial profile address:', e);
          }
        }
      } catch (err) {
        console.error(err);
        customAlert.error('Error', 'Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Suggestions search effect
  useEffect(() => {
    if (!triggerSearch || address.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const headers: Record<string, string> = {};
        if (Platform.OS !== 'web') {
          headers['User-Agent'] = 'CateringkuApp/1.0';
        }
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=id&limit=5`,
          { headers }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [address, triggerSearch]);

  const selectSuggestion = (item: any) => {
    setTriggerSearch(false);
    setAddress(item.display_name);
    setCoordinates({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      customAlert.warning('Perhatian', 'Nama tidak boleh kosong.');
      return;
    }
    setSubmitting(true);
    try {
      const updatedData = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };
      await api.updateUserProfile(updatedData);
      updateUser(updatedData);
      
      customAlert.success('Sukses', 'Profil berhasil diperbarui!');
      router.back();
    } catch (err: any) {
      customAlert.error('Error', err.message || 'Gagal memperbarui profil.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1">Edit Profil</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Input Nama */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <User size={16} color={GREEN} />
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Nama Lengkap</Text>
            </View>
            <TextInput
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
            />
          </View>

          {/* Input Nomor HP */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Phone size={16} color={GREEN} />
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Nomor HP / WhatsApp</Text>
            </View>
            <TextInput
              placeholder="Masukkan nomor handphone"
              placeholderTextColor="#94a3b8"
              value={phone}
              keyboardType="phone-pad"
              onChangeText={setPhone}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
            />
          </View>

          {/* Input Alamat default */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-3">
              <MapPin size={16} color={GREEN} />
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Alamat Pengiriman Utama</Text>
            </View>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Contoh: Jl. Sukolilo Indah No. 22, Ruko B3, Surabaya"
              placeholderTextColor="#94a3b8"
              value={address}
              onChangeText={(txt) => {
                setTriggerSearch(true);
                setAddress(txt);
              }}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 text-left align-top"
            />
            {searching && (
              <View className="flex-row items-center mt-2 px-2">
                <ActivityIndicator size="small" color={GREEN} />
                <Text className="text-slate-400 text-[10px] ml-2">Mencari alamat...</Text>
              </View>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mt-2 overflow-hidden">
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => selectSuggestion(item)}
                    className={`px-4 py-3 flex-row items-start ${
                      index < suggestions.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                    }`}
                  >
                    <MapPin size={14} color="#64748b" className="mt-0.5 mr-2" />
                    <Text className="text-[11px] text-slate-700 dark:text-slate-300 flex-1 leading-4">
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Map Preview */}
            <MapPreview
              lat={coordinates.lat}
              lon={coordinates.lon}
              onLocationSelect={(loc) => {
                setTriggerSearch(false);
                setAddress(loc.address);
                setCoordinates({ lat: loc.lat, lon: loc.lon });
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={submitting}
            className="bg-green-600 h-[52px] rounded-2xl items-center justify-center flex-row mb-8"
            style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-base">Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
