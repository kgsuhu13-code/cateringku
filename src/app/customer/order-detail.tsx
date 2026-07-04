import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Star, Landmark } from 'lucide-react-native';

interface OrderDetailData {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  orderDate: string;
  shippingAddress?: string | null;
  deliveryTime?: string | null;
  tenant: { name: string; address?: string | null };
  orderItems: Array<{
    id: string;
    menuId: string;
    quantity: number;
    targetDate: string;
    menu: { name: string; price: number };
  }>;
}

const GREEN = '#059669';

export default function CustomerOrderDetail() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrderDetail = async () => {
    try {
      const allOrders = await api.getOrders();
      const matched = allOrders.find((o: any) => o.id === orderId);
      if (matched) {
        setOrder(matched);
      } else {
        Alert.alert('Error', 'Pesanan tidak ditemukan');
        router.back();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1">Detail Pesanan</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Status Pemesanan</Text>
          <Text className="text-slate-800 dark:text-white font-extrabold text-base mt-1">
            {order.status === 'COMPLETED' ? 'Pesanan Selesai' :
             order.status === 'SHIPPED' ? 'Makanan Sedang Dikirim' :
             order.status === 'PREPARING' ? 'Makanan Sedang Disiapkan' :
             order.status === 'PAID' ? 'Sudah Dibayar' : 'Menunggu Konfirmasi'}
          </Text>
          <Text className="text-slate-450 dark:text-slate-500 text-[9px] mt-1">
            Pembayaran: <Text className="font-bold">{order.paymentStatus}</Text>
          </Text>
        </View>

        {/* Shipping & Delivery Details */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-4">Informasi Pengiriman</Text>
          
          <View className="flex-row items-start mb-4">
            <MapPin size={16} color="#64748b" className="mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-700 dark:text-slate-350 text-xs font-bold">Lokasi Pengantaran</Text>
              <Text className="text-slate-500 dark:text-slate-450 text-[10px] leading-4 mt-0.5">
                {order.shippingAddress || 'Alamat tidak diatur'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Clock size={16} color="#64748b" className="mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-700 dark:text-slate-350 text-xs font-bold">Estimasi Jam Antar</Text>
              <Text className="text-slate-500 dark:text-slate-450 text-[10px] mt-0.5">
                {order.deliveryTime ? `${order.deliveryTime} WIB` : '12:00 WIB'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tenant Info */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-2">Penyedia Catering</Text>
          <Text className="text-slate-700 dark:text-white font-bold text-xs">{order.tenant.name}</Text>
          <Text className="text-slate-400 text-[9px] mt-1">📍 {order.tenant.address || 'Kantin Universitas'}</Text>
        </View>

        {/* Items & Review Actions */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 shadow-sm">
          <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-4">Daftar Menu & Rincian Harga</Text>

          {order.orderItems.map((item) => (
            <View key={item.id} className="border-b border-slate-50 dark:border-slate-850 pb-4 mb-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-800 dark:text-white font-bold text-xs">{item.menu.name}</Text>
                  <Text className="text-slate-400 text-[10px] mt-1">
                    Rp {item.menu.price.toLocaleString('id-ID')} x {item.quantity} • Pengiriman: {item.targetDate}
                  </Text>
                </View>
                <Text className="text-slate-800 dark:text-white font-extrabold text-xs">
                  Rp {(item.menu.price * item.quantity).toLocaleString('id-ID')}
                </Text>
              </View>

              {/* Review button if COMPLETED */}
              {order.status === 'COMPLETED' && (
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/customer/add-review' as any,
                    params: { menuId: item.menuId, menuName: item.menu.name }
                  })}
                  className="mt-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 py-1.5 px-3 rounded-xl flex-row items-center justify-center gap-1.5 self-start"
                >
                  <Star size={10} color={GREEN} fill={GREEN} />
                  <Text className="text-green-600 dark:text-green-400 text-[10px] font-extrabold">Beri Ulasan</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Grand Total */}
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-slate-700 dark:text-slate-350 font-bold text-xs">Total Pembayaran</Text>
            <Text className="text-green-600 dark:text-green-450 font-black text-sm">
              Rp {order.totalAmount.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
