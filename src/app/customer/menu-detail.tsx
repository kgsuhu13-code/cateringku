import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { customAlert } from '../../components/CustomAlert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../hooks/api';
import { useCartStore } from '../../hooks/useCartStore';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, ShoppingCart, MessageSquare } from 'lucide-react-native';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer: { name: string };
}

const GREEN = '#059669';

export default function MenuDetail() {
  const router = useRouter();
  const { id, name, price, tenantId, tenantName } = useLocalSearchParams();
  const cart = useCartStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [menuDetail, setMenuDetail] = useState<any>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        // Fetch specific menu to get full description and maxQuota
        // Since we don't have direct GET /menus/:id, we can fetch all menus for this tenant
        // but for simplicity, we mock/set state from params, or fetch reviews
        const revs = await api.getMenuReviews(id as string);
        setReviews(revs);
      } catch (err) {
        console.error('Error fetching menu reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (id) {
      fetchMenuDetails();
    }
  }, [id]);

  const handleOrder = () => {
    if (!id || !name || !price) return;
    const parsedPrice = parseFloat(price as string);
    const mockMenu = {
      id: id as string,
      name: name as string,
      price: parsedPrice,
      maxQuota: 10,
      availableAt: new Date().toISOString().split('T')[0],
      tenantId: (tenantId as string) || '',
    };
    
    // Add to cart with today's date
    const today = new Date().toISOString().split('T')[0];
    const { success } = cart.addToCart(mockMenu, 1, today, (tenantName as string) || 'Catering');
    if (success) {
      customAlert.success('Sukses', `${name} dimasukkan ke keranjang untuk pengiriman hari ini.`);
      router.push('/customer/cart' as any);
    } else {
      customAlert.error('Gagal', 'Quota sudah habis.');
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1" numberOfLines={1}>
          Detail Menu
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 items-center">
          <View className="w-24 h-24 bg-green-50 dark:bg-green-950/20 rounded-full items-center justify-center mb-4">
            <ShoppingCart size={40} color={GREEN} />
          </View>
          <Text className="text-slate-800 dark:text-white font-extrabold text-xl text-center">{name}</Text>
          <Text className="text-green-600 dark:text-green-400 font-black text-lg mt-2">
            Rp {parseFloat(price as string || '0').toLocaleString('id-ID')}
          </Text>
          <View className="flex-row items-center mt-3 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full">
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <Text className="text-slate-700 dark:text-slate-200 font-extrabold text-xs ml-1">
              {avgRating} <Text className="text-slate-400 font-normal">({reviews.length} ulasan)</Text>
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="bg-white dark:bg-slate-900 mx-4 rounded-3xl mt-4 p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <Text className="text-slate-800 dark:text-white font-black text-sm mb-2">Deskripsi Makanan</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs leading-4">
            Dibuat secara higienis menggunakan bahan-bahan organik segar bermutu tinggi. Kaya akan nutrisi, disajikan hangat, dan tanpa pengawet tambahan. Sangat cocok sebagai menu diet sehat ataupun kebutuhan gizi harian Anda.
          </Text>
        </View>

        {/* Reviews Section */}
        <View className="mx-4 mt-6 pb-24">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-800 dark:text-white font-black text-base">Ulasan Menu ({reviews.length})</Text>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/customer/add-review' as any, params: { menuId: id, menuName: name } })}
              className="bg-green-50 dark:bg-green-950 px-3 py-1.5 rounded-full"
            >
              <Text className="text-green-600 dark:text-green-400 text-xs font-bold">+ Tulis Ulasan</Text>
            </TouchableOpacity>
          </View>

          {loadingReviews ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : reviews.length === 0 ? (
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 items-center border border-slate-100 dark:border-slate-800">
              <MessageSquare size={24} color="#cbd5e1" />
              <Text className="text-slate-400 dark:text-slate-500 text-xs mt-2">Belum ada ulasan untuk menu ini. Jadilah yang pertama!</Text>
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
                <Text className="text-slate-600 dark:text-slate-400 text-xs mt-2 font-medium">
                  "{rev.comment || 'Tanpa komentar'}"
                </Text>
                <Text className="text-[8px] text-slate-400 mt-2">
                  {new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Order Button Container */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={handleOrder}
          className="flex-1 bg-green-600 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
        >
          <ShoppingCart size={18} color="white" />
          <Text className="text-white font-extrabold text-sm">Tambahkan Ke Keranjang</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
