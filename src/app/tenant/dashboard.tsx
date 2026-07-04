import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChefHat,
  TrendingUp,
  Package,
  Banknote,
  LogOut,
  Bell,
  UtensilsCrossed,
  ClipboardList,
  ChevronRight,
  Star,
} from 'lucide-react-native';

const GREEN = '#059669';

export default function TenantDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<{ menuCount: number; orderCount: number; totalRevenue: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await api.getTenantStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load tenant stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* GoBiz-style Green Header */}
      <View className="bg-green-600 px-5 pt-4 pb-8">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-green-100 text-xs font-semibold">Mitra Catering</Text>
            <Text className="text-white text-xl font-extrabold mt-0.5" numberOfLines={1}>
              {user?.tenant?.name || 'Dapur Anda'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity
              onPress={() => router.push('/tenant/notifications' as any)}
              className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center"
              accessibilityLabel="Notifikasi"
            >
              <Bell size={18} color="white" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { logout(); router.replace('/login' as any); }}
              className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center"
              accessibilityLabel="Keluar"
            >
              <LogOut size={18} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Card (overlapping header) */}
      <View className="px-4 -mt-4 mb-4">
        <View className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
          <View className="flex-row">
            <View className="flex-1 items-center py-4 border-r border-slate-100 dark:border-slate-800">
              <View className="w-9 h-9 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mb-2">
                <Package size={16} color={GREEN} strokeWidth={2} />
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Menu Aktif</Text>
              <Text className="text-slate-800 dark:text-white font-extrabold text-lg mt-0.5">
                {stats !== null ? stats.menuCount : '—'}
              </Text>
            </View>
            <View className="flex-1 items-center py-4 border-r border-slate-100 dark:border-slate-800">
              <View className="w-9 h-9 bg-blue-50 dark:bg-blue-950/30 rounded-2xl items-center justify-center mb-2">
                <TrendingUp size={16} color="#2563eb" strokeWidth={2} />
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Pesanan</Text>
              <Text className="text-slate-800 dark:text-white font-extrabold text-lg mt-0.5">
                {stats !== null ? stats.orderCount : '—'}
              </Text>
            </View>
            <View className="flex-1 items-center py-4">
              <View className="w-9 h-9 bg-orange-50 dark:bg-orange-950/30 rounded-2xl items-center justify-center mb-2">
                <Banknote size={16} color="#ea580c" strokeWidth={2} />
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Pendapatan</Text>
              <Text className="text-slate-800 dark:text-white font-extrabold text-sm mt-1" numberOfLines={1}>
                {stats !== null ? `Rp ${stats.totalRevenue.toLocaleString('id-ID')}` : '—'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Menu Quick Navigation */}
        <Text className="text-slate-850 dark:text-white font-extrabold text-base mb-4">Pengelolaan Toko</Text>
        
        <TouchableOpacity
          onPress={() => router.push('/tenant/kitchen-rekap' as any)}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-green-50 rounded-2xl items-center justify-center">
              <ChefHat size={18} color={GREEN} />
            </View>
            <View className="ml-4">
              <Text className="text-slate-800 dark:text-white font-bold text-xs">Rekap Dapur Harian</Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">Lihat daftar belanja dan porsi masak harian</Text>
            </View>
          </View>
          <ChevronRight size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/tenant/menus' as any)}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center">
              <UtensilsCrossed size={18} color="#2563eb" />
            </View>
            <View className="ml-4">
              <Text className="text-slate-800 dark:text-white font-bold text-xs">Kelola Menu Masakan</Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">Tambah, ubah, atau hapus menu catering</Text>
            </View>
          </View>
          <ChevronRight size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/tenant/orders' as any)}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-50 rounded-2xl items-center justify-center">
              <ClipboardList size={18} color="#ea580c" />
            </View>
            <View className="ml-4">
              <Text className="text-slate-800 dark:text-white font-bold text-xs">Kelola Pesanan Masuk</Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">Proses pesanan harian pelanggan</Text>
            </View>
          </View>
          <ChevronRight size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/tenant/reviews-list' as any)}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-amber-50 rounded-2xl items-center justify-center">
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
            </View>
            <View className="ml-4">
              <Text className="text-slate-800 dark:text-white font-bold text-xs">Ulasan & Review</Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">Lihat umpan balik rasa masakan pelanggan</Text>
            </View>
          </View>
          <ChevronRight size={16} color="#94a3b8" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
