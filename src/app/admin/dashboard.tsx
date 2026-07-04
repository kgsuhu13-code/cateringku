import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../hooks/api';
import { useAuthStore } from '../../hooks/useAuthStore';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Users, Store, ClipboardList, Banknote, ArrowLeft, LogOut } from 'lucide-react-native';

const GREEN = '#059669';

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-red-600 px-5 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/customer/profile' as any)} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-extrabold">Super Admin Panel</Text>
        </View>
        <TouchableOpacity
          onPress={() => { logout(); router.replace('/login' as any); }}
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-full"
        >
          <LogOut size={16} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Welcome Card */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm flex-row items-center">
            <View className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl items-center justify-center mr-4">
              <Shield size={24} color="#dc2626" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm">Halo, Administrator</Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">Sistem monitoring katering multi-tenant</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <Text className="text-slate-850 dark:text-white font-extrabold text-base mb-3 mt-2">Ringkasan Sistem</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm" style={{ width: '48%' }}>
              <View className="w-8 h-8 bg-blue-50 rounded-xl items-center justify-center mb-2">
                <Users size={16} color="#2563eb" />
              </View>
              <Text className="text-slate-400 text-[9px] font-bold uppercase">Total Users</Text>
              <Text className="text-slate-800 dark:text-white font-black text-xl mt-1">{stats?.totalUsers || 0}</Text>
            </View>

            <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm" style={{ width: '48%' }}>
              <View className="w-8 h-8 bg-green-50 rounded-xl items-center justify-center mb-2">
                <Store size={16} color={GREEN} />
              </View>
              <Text className="text-slate-400 text-[9px] font-bold uppercase">Total Mitra</Text>
              <Text className="text-slate-800 dark:text-white font-black text-xl mt-1">{stats?.totalTenants || 0}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm" style={{ width: '48%' }}>
              <View className="w-8 h-8 bg-orange-50 rounded-xl items-center justify-center mb-2">
                <ClipboardList size={16} color="#ea580c" />
              </View>
              <Text className="text-slate-400 text-[9px] font-bold uppercase">Total Pesanan</Text>
              <Text className="text-slate-800 dark:text-white font-black text-xl mt-1">{stats?.totalOrders || 0}</Text>
            </View>

            <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm" style={{ width: '48%' }}>
              <View className="w-8 h-8 bg-amber-50 rounded-xl items-center justify-center mb-2">
                <Banknote size={16} color="#d97706" />
              </View>
              <Text className="text-slate-400 text-[9px] font-bold uppercase">Uang Beredar</Text>
              <Text className="text-slate-800 dark:text-white font-black text-[13px] mt-2.5" numberOfLines={1}>
                Rp {stats?.totalRevenue ? stats.totalRevenue.toLocaleString('id-ID') : 0}
              </Text>
            </View>
          </View>

          {/* Quick links to details */}
          <Text className="text-slate-850 dark:text-white font-extrabold text-base mb-3 mt-4">Menu Kontrol</Text>
          
          <TouchableOpacity
            onPress={() => router.push('/admin/tenants' as any)}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center">
              <Store size={18} color={GREEN} />
              <Text className="text-slate-800 dark:text-white font-extrabold text-xs ml-4">Manajemen Mitra Catering</Text>
            </View>
            <Text className="text-slate-400 font-bold text-xs">→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/admin/users' as any)}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center">
              <Users size={18} color="#2563eb" />
              <Text className="text-slate-800 dark:text-white font-extrabold text-xs ml-4">Manajemen Akun Pengguna</Text>
            </View>
            <Text className="text-slate-400 font-bold text-xs">→</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
