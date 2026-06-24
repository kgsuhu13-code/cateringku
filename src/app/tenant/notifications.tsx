import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Star, ClipboardList, TrendingUp } from 'lucide-react-native';

export default function TenantNotifications() {
  const router = useRouter();

  const notifications = [
    {
      id: '1',
      type: 'NEW_ORDER',
      title: 'Pesanan Baru Masuk! 📦',
      body: 'Budi Raharjo memesan 2 porsi Ayam Goreng Penyet untuk tanggal besok. Siapkan bahan masakan sekarang!',
      time: '15 menit yang lalu',
      Icon: ClipboardList,
      color: 'bg-green-100 dark:bg-green-950/40 text-green-600',
    },
    {
      id: '2',
      type: 'RATING',
      title: 'Ulasan Bintang 5 Baru! ⭐',
      body: 'Customer memberikan ulasan: "Ayam gorengnya gurih garing, sambalnya pas pedas mantap!".',
      time: '3 jam yang lalu',
      Icon: Star,
      color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600',
    },
    {
      id: '3',
      type: 'PROMO',
      title: 'Kenaikan Omset Pekan Ini 📈',
      body: 'Selamat! Total pendapatan catering Dapur Anda naik 18% dibandingkan pekan lalu. Tingkatkan terus pelayanan Anda!',
      time: '2 hari yang lalu',
      Icon: TrendingUp,
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1">Notifikasi Toko</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Bell size={40} color="#cbd5e1" />
            <Text className="text-slate-400 text-xs mt-3">Tidak ada notifikasi baru</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const ItemIcon = item.Icon;
            return (
              <View
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 shadow-sm flex-row items-start"
              >
                <View className={`w-10 h-10 rounded-2xl items-center justify-center ${item.color.split(' ')[0]}`}>
                  <ItemIcon size={18} className={item.color.split(' ')[1]} />
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-850 dark:text-white font-extrabold text-xs">{item.title}</Text>
                    <Text className="text-[8px] text-slate-400">{item.time}</Text>
                  </View>
                  <Text className="text-slate-500 dark:text-slate-450 text-[10px] leading-4 mt-1.5">
                    {item.body}
                  </Text>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
