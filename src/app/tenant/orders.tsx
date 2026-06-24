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
import {
  ChefHat,
  RotateCcw,
  ClipboardList,
  CheckCheck,
  TrendingUp,
} from 'lucide-react-native';

interface TenantOrder {
  id: string;
  customerId: string;
  customer: { name: string; email: string };
  totalAmount: number;
  paymentStatus: string;
  status: string;
  orderDate: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    targetDate: string;
    menu: { name: string; price: number };
  }>;
}

const GREEN = '#16a34a';

export default function TenantOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<TenantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getTenantOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (orderId: string, nextStatus: 'PAID' | 'PREPARING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      loadOrders();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal mengubah status pesanan.');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { label: 'Dibayar', color: 'text-green-700 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50' };
      case 'PREPARING':
        return { label: 'Sedang Dibuat', color: 'text-orange-700 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50' };
      case 'SHIPPED':
        return { label: 'Sedang Dikirim', color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' };
      case 'COMPLETED':
        return { label: 'Selesai', color: 'text-slate-650 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50' };
      case 'CANCELLED':
        return { label: 'Dibatalkan', color: 'text-red-650 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50' };
      default:
        return { label: 'Menunggu', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-slate-850 dark:text-white font-extrabold text-xl">Daftar Pesanan</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Ubah status pesanan pelanggan di sini</Text>
          </View>
          <TouchableOpacity
            onPress={loadOrders}
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
        ) : orders.length === 0 ? (
          <View className="items-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <ClipboardList size={32} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-4">Belum ada pesanan masuk</Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusConfig = getStatusConfig(order.status || order.paymentStatus);
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push({ pathname: '/tenant/order-detail' as any, params: { orderId: order.id } })}
                activeOpacity={0.85}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
              >
                {/* Customer Info */}
                <View className="flex-row justify-between items-start mb-3 pb-3 border-b border-slate-50 dark:border-slate-850">
                  <View className="flex-1 pr-3">
                    <Text className="text-slate-850 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                      {order.customer.name}
                    </Text>
                    <Text className="text-slate-400 text-[9px] mt-1 font-bold">
                      Order ID: {order.id.substring(0, 8).toUpperCase()}... • {new Date(order.orderDate).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                    <Text className="text-[10px] font-extrabold uppercase">{statusConfig.label}</Text>
                  </View>
                </View>

                {/* Items */}
                {order.orderItems.map((item) => (
                  <View key={item.id} className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-slate-650 dark:text-slate-400 text-xs flex-1 pr-2" numberOfLines={1}>
                      {item.quantity}x {item.menu.name}
                    </Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">
                      Kirim: {item.targetDate}
                    </Text>
                  </View>
                ))}

                {/* Total Amount */}
                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50 dark:border-slate-850">
                  <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Total Pendapatan</Text>
                  <Text className="text-slate-800 dark:text-white font-extrabold text-sm">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </Text>
                </View>

                {/* Action Buttons based on status */}
                {order.status === 'PAID' && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="bg-orange-500 h-[44px] rounded-2xl items-center justify-center mt-4 flex-row gap-2"
                  >
                    <ChefHat size={16} color="white" strokeWidth={2} />
                    <Text className="text-white font-bold text-sm">Mulai Masak (Proses)</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'PREPARING' && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(order.id, 'SHIPPED')}
                    className="bg-blue-500 h-[44px] rounded-2xl items-center justify-center mt-4 flex-row gap-2"
                  >
                    <TrendingUp size={16} color="white" strokeWidth={2} />
                    <Text className="text-white font-bold text-sm">Kirim Makanan</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'SHIPPED' && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    className="bg-green-600 h-[44px] rounded-2xl items-center justify-center mt-4 flex-row gap-2"
                  >
                    <CheckCheck size={16} color="white" strokeWidth={2.5} />
                    <Text className="text-white font-bold text-sm">Tandai Selesai</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
