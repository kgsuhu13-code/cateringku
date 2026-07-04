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
import { ArrowLeft, ChefHat, RotateCcw } from 'lucide-react-native';

interface RekapItem {
  menuId: string;
  name: string;
  description?: string | null;
  price: number;
  totalQuantity: number;
}

const GREEN = '#059669';

export default function KitchenRekap() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [rekap, setRekap] = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState(true);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const loadKitchenRekap = async () => {
    setLoading(true);
    try {
      const data = await api.getKitchenRekap(selectedDate);
      setRekap(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadKitchenRekap();
    }
  }, [selectedDate, isAuthenticated]);

  const formatDateLabel = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Hari Ini';
    if (dateStr === tomorrowStr) return 'Besok';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getDateDay = (dateStr: string) => new Date(dateStr).getDate().toString();
  const getDateShortMonth = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1">Rekap Dapur Harian</Text>
      </View>

      {/* Date Selector */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {dates.map((date) => {
            const isSelected = selectedDate === date;
            const isToday = date === new Date().toISOString().split('T')[0];
            return (
              <TouchableOpacity
                key={date}
                onPress={() => setSelectedDate(date)}
                className={`w-14 mr-2.5 items-center py-2.5 rounded-2xl border ${
                  isSelected
                    ? 'bg-green-600 border-green-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
                }`}
              >
                <Text className={`text-[9px] font-bold uppercase ${isSelected ? 'text-green-100' : 'text-slate-400'}`}>
                  {isToday ? 'Hari Ini' : getDateShortMonth(date)}
                </Text>
                <Text className={`text-lg font-black mt-0.5 ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                  {getDateDay(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm">Daftar Porsi Masak</Text>
            <Text className="text-slate-400 text-[10px] mt-0.5">Pesanan berstatus LUNAS saja</Text>
          </View>
          <TouchableOpacity
            onPress={loadKitchenRekap}
            className="flex-row items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-xl"
          >
            <RotateCcw size={12} color={GREEN} strokeWidth={2.5} />
            <Text className="text-green-600 dark:text-green-400 font-bold text-xs">Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : rekap.length === 0 ? (
          <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <View className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl items-center justify-center mb-4">
              <ChefHat size={36} color="#cbd5e1" strokeWidth={1.5} />
            </View>
            <Text className="text-slate-700 dark:text-slate-350 font-extrabold text-base">Dapur Istirahat</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-xs text-center mt-2 px-8 leading-5">
              Belum ada masakan yang harus dibuat untuk tanggal {formatDateLabel(selectedDate)}.
            </Text>
          </View>
        ) : (
          rekap.map((item) => (
            <View
              key={item.menuId}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-1 pr-3">
                <Text className="text-slate-850 dark:text-white font-extrabold text-sm">{item.name}</Text>
                <Text className="text-slate-400 text-[10px] mt-1" numberOfLines={1}>
                  {item.description || 'Tidak ada deskripsi masakan'}
                </Text>
              </View>
              <View className="bg-green-100 dark:bg-green-950 px-4 py-2 rounded-2xl items-center justify-center border border-green-200 dark:border-green-900">
                <Text className="text-green-700 dark:text-green-400 font-black text-base">{item.totalQuantity}</Text>
                <Text className="text-green-600 dark:text-green-450 text-[8px] font-bold uppercase tracking-wider">Porsi</Text>
              </View>
            </View>
          ))
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
