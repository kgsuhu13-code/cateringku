import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, User, Phone, MapPin, Mail, LogOut, ChevronRight } from 'lucide-react-native';
import OSMMap from '../../components/OSMMap';

const GREEN = '#059669';

export default function TenantProfileSettings() {
  const router = useRouter();
  const { logout, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantDesc, setTenantDesc] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  // OSM Search states
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [tenantCoords, setTenantCoords] = useState({ latitude: -6.3627, longitude: 106.8272 });

  const handleMapLocationSelect = async (lat: number, lon: number) => {
    setTenantCoords({ latitude: lat, longitude: lon });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'CateringKu-App-Demo',
          },
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        setTenantAddress(data.display_name);
      }
    } catch (err) {
      console.error('Failed to reverse geocode coordinate:', err);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await api.getUserProfile();
      setProfile(data);
      if (data) {
        setTenantName(data.tenant?.name || '');
        setTenantDesc(data.tenant?.description || '');
        setTenantAddress(data.tenant?.address || '');
        setOwnerName(data.name || '');
        setOwnerPhone(data.phone || '');

        // Resolve coordinates of existing tenant address if present
        if (data.tenant?.address) {
          const initHeaders: Record<string, string> = {};
          if (Platform.OS !== 'web') {
            initHeaders['User-Agent'] = 'CateringKu-App-Demo';
          }
          fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.tenant.address)}&limit=1`,
            { headers: initHeaders }
          )
            .then((res) => res.json())
            .then((geocodeData) => {
              if (geocodeData && geocodeData.length > 0) {
                setTenantCoords({
                  latitude: parseFloat(geocodeData[0].lat),
                  longitude: parseFloat(geocodeData[0].lon),
                });
              }
            })
            .catch((err) => console.log('Failed to geocode initial tenant address:', err));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSearchAddress = async (query: string) => {
    if (!query) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const headers: Record<string, string> = {};
      if (Platform.OS !== 'web') {
        headers['User-Agent'] = 'CateringKu-App-Demo';
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Failed to search address:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!tenantName || !tenantAddress || !ownerName) {
      Alert.alert('Error', 'Nama katering, alamat katering, dan nama pemilik tidak boleh kosong.');
      return;
    }

    setUpdating(true);
    try {
      // 1. Update user profile (name, phone)
      await api.updateUserProfile({
        name: ownerName,
        phone: ownerPhone || undefined,
      });

      // 2. Update tenant profile (name, description, address)
      if (profile?.tenantId) {
        await api.updateTenantProfile({
          name: tenantName,
          description: tenantDesc || undefined,
          address: tenantAddress || undefined,
        });
      }

      // Sync Zustand user store
      updateUser({
        name: ownerName,
        phone: ownerPhone,
      });

      Alert.alert('Sukses', 'Profil toko/mitra berhasil diperbarui.');
      setIsEditing(false);
      loadProfile();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Gagal', err.message || 'Gagal memperbarui profil.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row justify-between items-center">
        <Text className="text-white text-lg font-extrabold">Pengaturan Toko</Text>
        {!loading && (
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                setIsEditing(false);
                loadProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className="bg-white/20 px-3 py-1.5 rounded-xl"
          >
            <Text className="text-white text-xs font-bold">{isEditing ? 'Batal' : 'Edit Toko'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {isEditing ? (
            <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm gap-4">
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm border-b border-slate-50 dark:border-slate-850 pb-2 mb-2">Edit Informasi Mitra & Toko</Text>

              {/* Nama Katering */}
              <View>
                <Text className="text-slate-400 dark:text-slate-350 text-[9px] font-bold uppercase mb-1">Nama Katering Usaha</Text>
                <TextInput
                  value={tenantName}
                  onChangeText={setTenantName}
                  placeholder="Nama Katering Usaha"
                  placeholderTextColor="#94a3b8"
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[48px] rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </View>

              {/* Deskripsi */}
              <View>
                <Text className="text-slate-400 dark:text-slate-350 text-[9px] font-bold uppercase mb-1">Deskripsi Usaha</Text>
                <TextInput
                  value={tenantDesc}
                  onChangeText={setTenantDesc}
                  placeholder="Deskripsi Usaha"
                  placeholderTextColor="#94a3b8"
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[48px] rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </View>

              {/* Alamat Dapur (OSM Search) */}
              <View className="gap-1.5">
                <Text className="text-slate-400 dark:text-slate-350 text-[9px] font-bold uppercase">Alamat Dapur</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    value={tenantAddress}
                    onChangeText={setTenantAddress}
                    placeholder="Alamat Dapur"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[48px] rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                  <TouchableOpacity
                    onPress={() => handleSearchAddress(tenantAddress)}
                    disabled={searching}
                    className="bg-green-600 px-4 rounded-2xl justify-center items-center h-[48px]"
                  >
                    {searching ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white text-xs font-bold">Cari</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Dropdown OSM Search Results */}
                {searchResults.length > 0 && (
                  <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden mt-1 max-h-[160px] z-50">
                    {searchResults.map((item: any, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          setTenantAddress(item.display_name);
                          setTenantCoords({
                            latitude: parseFloat(item.lat),
                            longitude: parseFloat(item.lon)
                          });
                          setSearchResults([]);
                        }}
                        className={`p-3 ${
                          idx < searchResults.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                        }`}
                      >
                        <Text className="text-slate-700 dark:text-slate-300 text-[10px] leading-4">
                          {item.display_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* OSM Map View */}
                <View className="mt-2">
                  <OSMMap
                    latitude={tenantCoords.latitude}
                    longitude={tenantCoords.longitude}
                    onLocationSelect={handleMapLocationSelect}
                  />
                </View>
              </View>

              {/* Nama Pemilik */}
              <View>
                <Text className="text-slate-400 dark:text-slate-350 text-[9px] font-bold uppercase mb-1">Nama Pemilik</Text>
                <TextInput
                  value={ownerName}
                  onChangeText={setOwnerName}
                  placeholder="Nama Pemilik"
                  placeholderTextColor="#94a3b8"
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[48px] rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </View>

              {/* No WA */}
              <View>
                <Text className="text-slate-400 dark:text-slate-350 text-[9px] font-bold uppercase mb-1">No. Handphone / WA</Text>
                <TextInput
                  value={ownerPhone}
                  onChangeText={setOwnerPhone}
                  placeholder="No. Handphone / WA"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 h-[48px] rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </View>

              {/* Simpan Button */}
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={updating}
                className="bg-green-600 h-[48px] rounded-2xl items-center justify-center mt-2 shadow-sm"
              >
                {updating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-extrabold text-xs">Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Shop Header Card */}
              <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-4 items-center shadow-sm">
                <View className="w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full items-center justify-center mb-3">
                  <Store size={32} color={GREEN} />
                </View>
                <Text className="text-slate-850 dark:text-white font-extrabold text-base text-center">
                  {profile?.tenant?.name || 'Katering Anda'}
                </Text>
                <Text className="text-slate-400 text-xs mt-1 text-center leading-4 px-4">
                  {profile?.tenant?.description || 'Penyedia pre-order katering mahasiswa.'}
                </Text>
              </View>

              {/* Shop Details */}
              <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
                <Text className="text-slate-850 dark:text-white font-extrabold text-sm mb-4">Informasi Mitra Catering</Text>

                <View className="flex-row items-center py-3 border-b border-slate-50 dark:border-slate-850">
                  <Store size={16} color="#64748b" />
                  <View className="ml-3 flex-1">
                    <Text className="text-slate-400 dark:text-slate-300 text-[9px] font-bold uppercase">Nama Katering</Text>
                    <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold">{profile?.tenant?.name}</Text>
                  </View>
                </View>

                <View className="flex-row items-start py-3 border-b border-slate-50 dark:border-slate-850">
                  <MapPin size={16} color="#64748b" className="mt-0.5" />
                  <View className="ml-3 flex-1">
                    <Text className="text-slate-400 dark:text-slate-300 text-[9px] font-bold uppercase">Alamat Dapur</Text>
                    <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold leading-4 mb-2">
                      {profile?.tenant?.address || 'Kantin Universitas'}
                    </Text>
                    {/* OSM Map Read-Only for View Mode */}
                    <OSMMap
                      latitude={tenantCoords.latitude}
                      longitude={tenantCoords.longitude}
                      onLocationSelect={() => {}}
                      draggable={false}
                    />
                  </View>
                </View>

                <View className="flex-row items-center py-3">
                  <User size={16} color="#64748b" />
                  <View className="ml-3 flex-1">
                    <Text className="text-slate-400 dark:text-slate-300 text-[9px] font-bold uppercase">Pemilik (User Akun)</Text>
                    <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold">{profile?.name} ({profile?.email})</Text>
                  </View>
                </View>
              </View>

              {/* Contact settings */}
              <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
                <Text className="text-slate-850 dark:text-white font-extrabold text-sm mb-4">Kontak Pemilik</Text>
                <View className="flex-row items-center py-2">
                  <Phone size={16} color="#64748b" />
                  <View className="ml-3 flex-1">
                    <Text className="text-slate-400 dark:text-slate-300 text-[9px] font-bold uppercase">No. Handphone / WA</Text>
                    <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold">{profile?.phone || '085xxxxxxxx'}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Logout Action */}
          <TouchableOpacity
            onPress={() => { logout(); router.replace('/login'); }}
            className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-3xl p-4 flex-row items-center justify-center gap-2 mb-8 shadow-sm"
          >
            <LogOut size={16} color="#ef4444" />
            <Text className="text-red-500 font-extrabold text-xs">Keluar Akun</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
