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
import { Plus, Edit2, Trash2, RotateCcw, UtensilsCrossed, Calendar } from 'lucide-react-native';

interface Menu {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  maxQuota: number;
  availableAt: string;
}

const GREEN = '#059669';

export default function TenantMenus() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const data = await api.getTenantMenusOnly();
      setMenus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMenus();
    }
  }, [isAuthenticated]);

  const handleDeleteMenu = (id: string, name: string) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus menu "${name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTenantMenu(id);
              Alert.alert('Sukses', 'Menu berhasil dihapus.');
              loadMenus();
            } catch (err: any) {
              Alert.alert('Gagal Hapus', err.message || 'Gagal menghapus menu.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row justify-between items-center">
        <Text className="text-white text-lg font-extrabold">Kelola Menu Catering</Text>
        <TouchableOpacity
          onPress={loadMenus}
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-full"
        >
          <RotateCcw size={16} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4 pb-20" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : menus.length === 0 ? (
          <View className="items-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <UtensilsCrossed size={36} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-4">
              Belum ada menu yang dibuat
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/tenant/add-menu' as any)}
              className="mt-6 bg-green-600 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-extrabold text-xs">+ Tambah Menu Pertama</Text>
            </TouchableOpacity>
          </View>
        ) : (
          menus.map((m) => (
            <View
              key={m.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 shadow-sm"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-850 dark:text-white font-extrabold text-sm">{m.name}</Text>
                  <Text className="text-slate-450 dark:text-slate-400 text-[10px] mt-1" numberOfLines={2}>
                    {m.description || 'Tidak ada deskripsi masakan'}
                  </Text>
                </View>
                <Text className="text-green-600 dark:text-green-400 font-black text-sm">
                  Rp {m.price.toLocaleString('id-ID')}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-slate-50 dark:border-slate-850">
                <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Calendar size={10} color="#64748b" />
                  <Text className="text-slate-500 dark:text-slate-400 text-[9px] font-bold ml-1.5 uppercase">
                    Kirim: {m.availableAt} • Max Quota: {m.maxQuota}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => router.push({
                      pathname: '/tenant/edit-menu' as any,
                      params: { id: m.id, name: m.name, description: m.description || '', price: m.price.toString(), maxQuota: m.maxQuota.toString(), availableAt: m.availableAt }
                    })}
                    className="w-9 h-9 items-center justify-center bg-slate-55 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <Edit2 size={12} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteMenu(m.id, m.name)}
                    className="w-9 h-9 items-center justify-center bg-red-50 border border-red-150 rounded-xl"
                  >
                    <Trash2 size={12} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-12" />
      </ScrollView>

      {/* FAB Floating Button */}
      {!loading && menus.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/tenant/add-menu' as any)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full items-center justify-center shadow-lg shadow-green-200"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 }}
        >
          <Plus size={24} color="white" strokeWidth={3} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
