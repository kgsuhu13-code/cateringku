import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Skeleton from '../../components/Skeleton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, UtensilsCrossed, Star, MapPin, ChevronRight } from 'lucide-react-native';

interface Menu {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  maxQuota: number;
  availableAt: string;
  remainingQuota?: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  customer: { name: string };
  menu: { name: string };
}

const GREEN = '#059669';

export default function TenantDetail() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<{ description?: string | null; address?: string | null } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load menus for today and tomorrow, plus tenant list to find details
        const [todayMenus, tomorrowMenus, allTenants] = await Promise.all([
          api.getTenantMenus(id as string, today).catch(() => []),
          api.getTenantMenus(id as string, tomorrow).catch(() => []),
          api.getTenants().catch(() => [])
        ]);

        const combinedMenus = [...todayMenus, ...tomorrowMenus];
        setMenus(combinedMenus);

        const currentTenant = allTenants.find((t: any) => t.id === id);
        if (currentTenant) {
          setTenantInfo(currentTenant);
        }

        // Fetch reviews of tenant's menus. For simplicity, we can load all reviews and filter.
        // We will fetch reviews for each menu in parallel.
        const reviewPromises = combinedMenus.map(menu => 
          api.getMenuReviews(menu.id).then((revs: any[]) => 
            revs.map(r => ({ ...r, menu: { name: menu.name } }))
          ).catch(() => [])
        );
        const resolvedReviews = await Promise.all(reviewPromises);
        setReviews(resolvedReviews.flat());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/customer/home' as any);
            }
          }} 
          className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1" numberOfLines={1}>
          {name || 'Detail Catering'}
        </Text>
      </View>

      {loading ? (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Shop Card Skeleton */}
          <View className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 mb-4">
            <View className="flex-row items-center">
              <Skeleton width={56} height={56} borderRadius={16} className="mr-4" />
              <View className="flex-1 gap-2">
                <Skeleton width="60%" height={18} borderRadius={6} />
                <Skeleton width="30%" height={12} borderRadius={4} />
              </View>
            </View>
            <Skeleton.Text lines={2} className="mt-4" />
          </View>
          
          {/* Menus List Skeleton */}
          <View className="mt-4">
            <Skeleton width="45%" height={18} borderRadius={6} className="mb-4" />
            <Skeleton.MenuItem />
            <Skeleton.MenuItem />
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Shop Card */}
          <View className="bg-white dark:bg-slate-900 mx-4 rounded-3xl mt-4 shadow-sm border border-slate-100 dark:border-slate-800 p-5">
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mr-4">
                <UtensilsCrossed size={22} color={GREEN} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-white font-black text-base">{name}</Text>
                <View className="flex-row items-center mt-1.5">
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs ml-1">
                    {avgRating} <Text className="text-slate-400 font-normal">({reviews.length} ulasan)</Text>
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-4 leading-4">
              {tenantInfo?.description || 'Penyedia katering sehat siap antar untuk daerah kampus dan sekitarnya. Terjamin bersih, higienis, dan lezat.'}
            </Text>
            <View className="flex-row items-center mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <MapPin size={14} color="#64748b" />
              <Text className="text-slate-500 dark:text-slate-400 text-[10px] ml-1 flex-1 font-medium" numberOfLines={1}>
                {tenantInfo?.address || 'Kantin Gedung A, Kampus Pusat'}
              </Text>
            </View>
          </View>

          {/* Menus List */}
          <View className="mx-4 mt-6">
            <Text className="text-slate-800 dark:text-white font-extrabold text-base mb-4">Daftar Menu Tersedia</Text>
            {menus.length === 0 ? (
              <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 items-center border border-slate-100 dark:border-slate-800">
                <Text className="text-slate-400 dark:text-slate-500 text-sm">Tidak ada menu yang aktif saat ini.</Text>
              </View>
            ) : (
              menus.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push({ 
                    pathname: '/customer/menu-detail' as any, 
                    params: { 
                      id: item.id, 
                      name: item.name, 
                      price: item.price.toString(),
                      tenantId: id as string,
                      tenantName: name as string,
                      description: item.description || '',
                      maxQuota: item.maxQuota.toString(),
                      availableAt: item.availableAt,
                      remainingQuota: (item.remainingQuota !== undefined ? item.remainingQuota : item.maxQuota).toString()
                    } 
                  })}
                  activeOpacity={0.8}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 flex-row items-center shadow-sm"
                >
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center">
                      <Text className="text-slate-800 dark:text-white font-bold text-sm">{item.name}</Text>
                      <View className="ml-2 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-md">
                        <Text className="text-green-600 dark:text-green-400 text-[8px] font-black uppercase">
                          {item.availableAt === today ? 'Hari Ini' : 'Besok'}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-slate-500 dark:text-slate-400 text-[10px] mt-1" numberOfLines={1}>
                      {item.description || 'Menu lezat yang disiapkan spesial untuk Anda.'}
                    </Text>
                    <Text className="text-green-600 dark:text-green-400 font-extrabold text-xs mt-2">
                      Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Reviews List */}
          <View className="mx-4 mt-6 pb-8">
            <Text className="text-slate-800 dark:text-white font-extrabold text-base mb-4">Ulasan Pelanggan</Text>
            {reviews.length === 0 ? (
              <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 items-center border border-slate-100 dark:border-slate-800">
                <Text className="text-slate-400 dark:text-slate-500 text-sm">Belum ada ulasan untuk katering ini.</Text>
              </View>
            ) : (
              reviews.map((rev) => (
                <View
                  key={rev.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-800 dark:text-white font-bold text-xs">{rev.customer.name}</Text>
                    <View className="flex-row items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          color={i < rev.rating ? '#f59e0b' : '#cbd5e1'}
                          fill={i < rev.rating ? '#f59e0b' : 'transparent'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text className="text-slate-400 dark:text-slate-500 text-[8px] mt-0.5">
                    Menu: {rev.menu.name}
                  </Text>
                  <Text className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium">
                    "{rev.comment || 'Tanpa komentar'}"
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
