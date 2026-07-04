import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Skeleton from '../../components/Skeleton';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, MapPin, Mail, LogOut, Edit3, ShieldAlert } from 'lucide-react-native';

const GREEN = '#059669';

export default function CustomerProfile() {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await api.getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row justify-between items-center">
        <Text className="text-white text-lg font-extrabold">Profil Saya</Text>
        <TouchableOpacity
          onPress={() => router.push('/customer/edit-profile' as any)}
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-full"
        >
          <Edit3 size={16} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Avatar Section Skeleton */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-4 items-center shadow-sm">
            <Skeleton width={64} height={64} borderRadius={32} className="mb-3" />
            <Skeleton width="40%" height={16} borderRadius={6} className="mb-2" />
            <Skeleton width="15%" height={11} borderRadius={4} />
          </View>

          {/* Account Details Skeleton */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm gap-4">
            <Skeleton width="35%" height={15} borderRadius={6} className="mb-2" />
            
            {/* Row 1 */}
            <View className="flex-row items-center">
              <Skeleton width={18} height={18} borderRadius={4} className="mr-3" />
              <View className="flex-1 gap-1.5">
                <Skeleton width="15%" height={9} borderRadius={3} />
                <Skeleton width="60%" height={12} borderRadius={4} />
              </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row items-center border-t border-slate-50 dark:border-slate-850 pt-3">
              <Skeleton width={18} height={18} borderRadius={4} className="mr-3" />
              <View className="flex-1 gap-1.5">
                <Skeleton width="20%" height={9} borderRadius={3} />
                <Skeleton width="40%" height={12} borderRadius={4} />
              </View>
            </View>

            {/* Row 3 */}
            <View className="flex-row items-start border-t border-slate-50 dark:border-slate-850 pt-3">
              <Skeleton width={18} height={18} borderRadius={4} className="mr-3 mt-1" />
              <View className="flex-1 gap-1.5">
                <Skeleton width="25%" height={9} borderRadius={3} />
                <Skeleton width="85%" height={12} borderRadius={4} />
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-4 items-center shadow-sm">
            <View className="w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full items-center justify-center mb-3">
              <User size={32} color={GREEN} />
            </View>
            <Text className="text-slate-850 dark:text-white font-extrabold text-base">{profile?.name || 'Customer'}</Text>
            <Text className="text-slate-400 text-xs mt-0.5">{profile?.role}</Text>
          </View>

          {/* Account Details */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
            <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-4">Informasi Akun</Text>

            <View className="flex-row items-center py-3 border-b border-slate-50 dark:border-slate-850">
              <Mail size={16} color="#64748b" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-400 text-[9px] font-bold uppercase">Email</Text>
                <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold">{profile?.email}</Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-slate-50 dark:border-slate-850">
              <Phone size={16} color="#64748b" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-400 text-[9px] font-bold uppercase">Nomor HP</Text>
                <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold">
                  {profile?.phone || 'Belum diatur'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start py-3">
              <MapPin size={16} color="#64748b" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-400 text-[9px] font-bold uppercase">Alamat Pengiriman</Text>
                <Text className="text-slate-700 dark:text-slate-350 text-xs font-semibold leading-4">
                  {profile?.address || 'Belum diatur'}
                </Text>
              </View>
            </View>
          </View>

          {/* Super Admin Route */}
          {profile?.role === 'SUPER_ADMIN' && (
            <TouchableOpacity
              onPress={() => router.push('/admin/dashboard' as any)}
              className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-3xl p-4 mb-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <ShieldAlert size={18} color="#ef4444" />
                <Text className="text-red-500 font-extrabold text-xs ml-3">Buka Admin Panel (Super Admin)</Text>
              </View>
              <Text className="text-red-400 font-black text-xs">→</Text>
            </TouchableOpacity>
          )}

          {/* Action Log Out */}
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
