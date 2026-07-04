import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, User, Phone, MapPin, Mail, LogOut, ChevronRight } from 'lucide-react-native';

const GREEN = '#059669';

export default function TenantProfileSettings() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4">
        <Text className="text-white text-lg font-extrabold">Pengaturan Toko</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
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
                <Text className="text-slate-400 text-[9px] font-bold uppercase">Nama Katering</Text>
                <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold">{profile?.tenant?.name}</Text>
              </View>
            </View>

            <View className="flex-row items-start py-3 border-b border-slate-50 dark:border-slate-850">
              <MapPin size={16} color="#64748b" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-400 text-[9px] font-bold uppercase">Alamat Dapur</Text>
                <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold leading-4">
                  {profile?.tenant?.address || 'Kantin Universitas'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3">
              <User size={16} color="#64748b" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-400 text-[9px] font-bold uppercase">Pemilik (User Akun)</Text>
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
                <Text className="text-slate-400 text-[9px] font-bold uppercase">No. Handphone / WA</Text>
                <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold">{profile?.phone || '085xxxxxxxx'}</Text>
              </View>
            </View>
          </View>

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
