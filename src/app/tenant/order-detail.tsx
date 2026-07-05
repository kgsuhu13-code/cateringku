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
import { ArrowLeft, User, Phone, MapPin, Clock, ChefHat, CheckCheck, TrendingUp, XCircle } from 'lucide-react-native';

interface TenantOrderDetailData {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  orderDate: string;
  shippingAddress?: string | null;
  deliveryTime?: string | null;
  customer: { name: string; email: string; phone?: string | null };
  orderItems: Array<{
    id: string;
    quantity: number;
    targetDate: string;
    menu: { name: string; price: number };
  }>;
}

const GREEN = '#059669';

export default function TenantOrderDetail() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<TenantOrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrderDetail = async () => {
    try {
      const allOrders = await api.getTenantOrders();
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

  const handleUpdateStatus = async (nextStatus: 'PAID' | 'PREPARING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.updateOrderStatus(orderId as string, nextStatus);
      loadOrderDetail();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal mengubah status pesanan.');
    }
  };

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
        <Text className="text-white text-lg font-extrabold flex-1">Proses Pesanan</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Status Card */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-slate-400 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">Status Pemesanan Masuk</Text>
          <Text className="text-slate-800 dark:text-white font-extrabold text-base mt-1">
            {order.status === 'COMPLETED' ? 'Selesai' :
             order.status === 'SHIPPED' ? 'Makanan Sedang Dikirim' :
             order.status === 'PREPARING' ? 'Sedang Dimasak' :
             order.status === 'PAID' ? 'Sudah Dibayar (Menunggu Dimasak)' : 'Menunggu Pembayaran'}
          </Text>
          <Text className="text-slate-400 dark:text-slate-300 text-[9px] mt-1">
            Pembayaran: <Text className="font-bold">{order.paymentStatus}</Text>
          </Text>
        </View>

        {/* Customer Contact */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-4">Kontak Pelanggan</Text>
          
          <View className="flex-row items-center mb-4">
            <User size={16} color="#64748b" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-400 dark:text-slate-300 text-[9px] font-bold uppercase">Nama Pembeli</Text>
              <Text className="text-slate-700 dark:text-slate-200 text-xs font-semibold">{order.customer.name}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Phone size={16} color="#64748b" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-400 dark:text-slate-300 text-[9px] font-bold uppercase">No. Telepon / WA</Text>
              <Text className="text-slate-700 dark:text-slate-200 text-xs font-semibold">
                {order.customer.phone || 'Belum ditambahkan'}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping details */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-4">Informasi Pengantaran</Text>
          
          <View className="flex-row items-start mb-4">
            <MapPin size={16} color="#64748b" className="mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-700 dark:text-slate-305 text-xs font-bold">Alamat Pengiriman</Text>
              <Text className="text-slate-500 dark:text-slate-300 text-[10px] leading-4 mt-0.5">
                {order.shippingAddress || 'Alamat Kantin Kampus'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Clock size={16} color="#64748b" className="mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-slate-700 dark:text-slate-305 text-xs font-bold">Jam Pengiriman</Text>
              <Text className="text-slate-500 dark:text-slate-300 text-[10px] mt-0.5">
                {order.deliveryTime ? `${order.deliveryTime} WIB` : '12:00 WIB'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu ordered */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 shadow-sm">
          <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-4">Daftar Porsi & Pendapatan</Text>
          {order.orderItems.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-850">
              <View className="flex-1 pr-2">
                <Text className="text-slate-800 dark:text-white font-bold text-xs">{item.menu.name}</Text>
                <Text className="text-slate-400 dark:text-slate-300 text-[9px] mt-0.5">
                  Rp {item.menu.price.toLocaleString('id-ID')} x {item.quantity} • Pengiriman: {item.targetDate}
                </Text>
              </View>
              <Text className="text-slate-800 dark:text-white font-extrabold text-xs">
                Rp {(item.menu.price * item.quantity).toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-slate-700 dark:text-slate-350 font-bold text-xs">Total Omset</Text>
            <Text className="text-green-600 dark:text-green-450 font-black text-sm">
              Rp {order.totalAmount.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action footer based on status */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4">
        {order.status === 'PAID' && (
          <TouchableOpacity
            onPress={() => handleUpdateStatus('PREPARING')}
            className="w-full bg-orange-500 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
          >
            <ChefHat size={18} color="white" />
            <Text className="text-white font-extrabold text-sm">Mulai Proses / Memasak</Text>
          </TouchableOpacity>
        )}

        {order.status === 'PREPARING' && (
          <TouchableOpacity
            onPress={() => handleUpdateStatus('SHIPPED')}
            className="w-full bg-blue-500 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
          >
            <TrendingUp size={18} color="white" />
            <Text className="text-white font-extrabold text-sm">Kirim Makanan ke Pelanggan</Text>
          </TouchableOpacity>
        )}

        {order.status === 'SHIPPED' && (
          <TouchableOpacity
            onPress={() => handleUpdateStatus('COMPLETED')}
            className="w-full bg-green-600 py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
          >
            <CheckCheck size={18} color="white" strokeWidth={2.5} />
            <Text className="text-white font-extrabold text-sm">Tandai Pesanan Selesai</Text>
          </TouchableOpacity>
        )}

        {['PAID', 'PREPARING'].includes(order.status) && (
          <TouchableOpacity
            onPress={() => handleUpdateStatus('CANCELLED')}
            className="w-full bg-red-50 dark:bg-red-950/20 py-2.5 rounded-2xl items-center justify-center mt-2"
          >
            <Text className="text-red-500 font-extrabold text-xs">Batalkan Pesanan</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
