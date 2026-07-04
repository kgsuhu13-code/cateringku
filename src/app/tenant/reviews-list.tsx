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
import { ArrowLeft, Star, MessageSquare } from 'lucide-react-native';

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer: { name: string; email: string };
  menu: { name: string };
}

const GREEN = '#059669';

export default function TenantReviewsList() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await api.getTenantReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReviews();
    }
  }, [isAuthenticated]);

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
        <Text className="text-white text-lg font-extrabold flex-1">Ulasan Masakan Pelanggan</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : (
          <View className="pb-8">
            {/* Rating Summary Card */}
            <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-5 items-center shadow-sm">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rating Toko Anda</Text>
              <Text className="text-slate-800 dark:text-white font-extrabold text-4xl mt-2">{avgRating}</Text>
              <View className="flex-row items-center mt-2 gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    color={star <= Math.round(parseFloat(avgRating)) ? '#f59e0b' : '#cbd5e1'}
                    fill={star <= Math.round(parseFloat(avgRating)) ? '#f59e0b' : 'transparent'}
                  />
                ))}
              </View>
              <Text className="text-slate-500 text-xs mt-3 font-semibold">Berdasarkan {reviews.length} ulasan pelanggan</Text>
            </View>

            {/* List Reviews */}
            <Text className="text-slate-850 dark:text-white font-extrabold text-base mb-4">Semua Ulasan</Text>
            {reviews.length === 0 ? (
              <View className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 rounded-3xl p-10 items-center">
                <MessageSquare size={32} color="#cbd5e1" />
                <Text className="text-slate-400 text-xs mt-2 font-bold">Belum ada ulasan masuk dari pembeli</Text>
              </View>
            ) : (
              reviews.map((rev) => (
                <View
                  key={rev.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 shadow-sm"
                >
                  <View className="flex-row justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-850">
                    <View>
                      <Text className="text-slate-850 dark:text-white font-bold text-xs">{rev.customer.name}</Text>
                      <Text className="text-[8px] text-slate-400 mt-0.5">Menu: {rev.menu.name}</Text>
                    </View>
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
                  <Text className="text-slate-650 dark:text-slate-450 text-xs mt-3 leading-4 italic">
                    "{rev.comment || 'Tanpa ulasan tertulis'}"
                  </Text>
                  <Text className="text-[8px] text-slate-400 text-right mt-3">
                    {new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
