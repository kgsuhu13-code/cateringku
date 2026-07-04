import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Skeleton from '../../components/Skeleton';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Home as HomeIcon,
  CalendarDays,
  ShoppingCart,
  ClipboardList,
  Bell,
  MapPin,
  ChevronRight,
  UtensilsCrossed,
  Package,
  LogOut,
  Gift,
  Percent,
  Sparkles,
} from 'lucide-react-native';

interface Tenant {
  id: string;
  name: string;
  description?: string;
  address?: string;
}

const GREEN = '#059669';

const PROMOS = [
  {
    id: 1,
    tag: 'Promo Hari Ini',
    title: 'Gratis Ongkir Kampus',
    desc: 'Min. belanja Rp 50.000 untuk pengiriman area kampus.',
    bgColor: '#16a34a',
    icon: UtensilsCrossed,
  },
  {
    id: 2,
    tag: 'Pengguna Baru',
    title: 'Diskon 20% Pertama',
    desc: 'Pakai kode voucher CATERINGKU untuk pesanan pertama Anda.',
    bgColor: '#f59e0b',
    icon: Gift,
  },
  {
    id: 3,
    tag: 'Langganan Hemat',
    title: 'Catering Mingguan',
    desc: 'Hemat s/d 15% dengan berlangganan paket mingguan/bulanan.',
    bgColor: '#4f46e5',
    icon: Percent,
  },
  {
    id: 4,
    tag: 'Rekomendasi Siang',
    title: 'Diskon Kopi & Boba',
    desc: 'Potongan Rp 5.000 khusus menu minuman jam 12:00 - 13:00.',
    bgColor: '#db2777',
    icon: Sparkles,
  },
];

export default function CustomerHome() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const active = Math.round(offset / slideWidth);
    if (active !== activeSlide) {
      setActiveSlide(active);
    }
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      let nextSlide = activeSlide + 1;
      if (nextSlide >= PROMOS.length) {
        nextSlide = 0;
      }
      const slideWidth = Dimensions.get('window').width - 32 + 12;
      scrollViewRef.current?.scrollTo({
        x: nextSlide * slideWidth,
        animated: true,
      });
      setActiveSlide(nextSlide);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlide]);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTenants()
      .then(setTenants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { icon: UtensilsCrossed, label: 'Catering Harian', color: 'bg-green-500', onPress: () => router.push('/customer/calendar' as any) },
    { icon: CalendarDays, label: 'Pre-Order', color: 'bg-blue-500', onPress: () => router.push('/customer/calendar' as any) },
    { icon: ShoppingCart, label: 'Keranjang', color: 'bg-orange-500', onPress: () => router.push('/customer/cart' as any) },
    { icon: ClipboardList, label: 'Riwayat', color: 'bg-purple-500', onPress: () => router.push('/customer/orders' as any) },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 pt-4 pb-6">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-green-100 text-xs font-semibold">Selamat datang,</Text>
            <Text className="text-white text-xl font-extrabold mt-0.5" numberOfLines={1}>
              {user?.name || 'Customer'}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push('/customer/notifications' as any)}
              className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center"
              accessibilityLabel="Notifikasi"
              accessibilityRole="button"
            >
              <Bell size={18} color="white" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { logout(); router.replace('/login' as any); }}
              className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center"
              accessibilityLabel="Keluar"
              accessibilityRole="button"
            >
              <LogOut size={18} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Row */}
        <TouchableOpacity
          onPress={() => router.push('/customer/profile' as any)}
          className="flex-row items-center mt-4 bg-white/15 rounded-2xl px-3.5 py-2.5"
          accessibilityLabel="Lokasi pengiriman"
          accessibilityRole="button"
        >
          <MapPin size={14} color="white" strokeWidth={2.5} />
          <Text className="text-white font-semibold text-xs ml-2 flex-1" numberOfLines={1}>
            {user?.address || 'Kantin Universitas (Atur alamat di Profil)'}
          </Text>
          <ChevronRight size={12} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 -mt-2" showsVerticalScrollIndicator={false}>
        {/* Service Quick Actions */}
        <View className="bg-white dark:bg-slate-900 mx-4 rounded-3xl mt-4 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 p-5 mb-5">
          <Text className="text-slate-800 dark:text-white font-extrabold text-base mb-4">Layanan</Text>
          <View className="flex-row justify-between">
            {quickActions.map(({ icon: Icon, label, color, onPress }) => (
              <TouchableOpacity
                key={label}
                onPress={onPress}
                activeOpacity={0.7}
                className="items-center"
                style={{ width: '22%' }}
              >
                <View className={`w-14 h-14 ${color} rounded-2xl items-center justify-center mb-2`}>
                  <Icon size={24} color="white" strokeWidth={2} />
                </View>
                <Text className="text-slate-700 dark:text-slate-300 text-[10px] font-bold text-center leading-3">
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo Carousel */}
        <View className="mb-6">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            decelerationRate="fast"
            snapToInterval={Dimensions.get('window').width - 32 + 12}
            snapToAlignment="center"
          >
            {PROMOS.map((promo) => {
              const Icon = promo.icon;
              return (
                <View
                  key={promo.id}
                  style={{
                    width: Dimensions.get('window').width - 32,
                    backgroundColor: promo.bgColor,
                  }}
                  className="mr-3 rounded-3xl p-5 flex-row items-center justify-between overflow-hidden"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">
                      {promo.tag}
                    </Text>
                    <Text className="text-white text-base font-black">
                      {promo.title}
                    </Text>
                    <Text className="text-white/90 text-xs mt-1 leading-4" numberOfLines={2}>
                      {promo.desc}
                    </Text>
                  </View>
                  <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center">
                    <Icon size={26} color="white" strokeWidth={2} />
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Dots Indicator */}
          <View className="flex-row justify-center gap-1.5 mt-3">
            {PROMOS.map((_, idx) => (
              <View
                key={idx}
                className={`h-1.5 rounded-full ${
                  activeSlide === idx ? 'w-5 bg-green-600' : 'w-1.5 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Tenant List */}
        <View className="px-4 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-800 dark:text-white font-extrabold text-base">Mitra Catering</Text>
            <Text className="text-green-600 dark:text-green-400 font-bold text-xs">Lihat Semua</Text>
          </View>

          {loading ? (
            <View>
              <Skeleton.TenantItem />
              <Skeleton.TenantItem />
              <Skeleton.TenantItem />
            </View>
          ) : tenants.length === 0 ? (
            <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <UtensilsCrossed size={32} color="#cbd5e1" strokeWidth={1.5} />
              <Text className="text-slate-400 dark:text-slate-500 text-sm font-semibold mt-4">
                Belum ada mitra catering
              </Text>
            </View>
          ) : (
            tenants.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => router.push({ pathname: '/customer/tenant-detail' as any, params: { id: t.id, name: t.name } })}
                activeOpacity={0.8}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 flex-row items-center shadow-sm shadow-slate-100 dark:shadow-none"
              >
                {/* Avatar */}
                <View className="w-14 h-14 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mr-4 border border-green-100 dark:border-green-900/50">
                  <UtensilsCrossed size={22} color={GREEN} strokeWidth={2} />
                </View>
                {/* Info */}
                <View className="flex-1 pr-2">
                  <Text className="text-slate-800 dark:text-white font-black text-sm">{t.name}</Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 leading-3" numberOfLines={2}>
                    {t.description || 'Penyedia katering pre-order sehat dan higienis.'}
                  </Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-[9px] mt-1.5 font-bold" numberOfLines={1}>
                    📍 {t.address || 'Tanpa alamat'}
                  </Text>
                </View>
                <ChevronRight size={16} color="#94a3b8" strokeWidth={2.5} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
