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
import {
  ChefHat,
  Clock,
  CheckCheck,
  XCircle,
  CalendarDays,
  ChevronRight,
  RotateCcw,
  ClipboardList,
} from 'lucide-react-native';

interface Order {
  id: string;
  tenantId: string;
  tenant: { name: string };
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

const GREEN = '#059669';

export default function CustomerOrders() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { label: 'Dibayar', color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50', Icon: CheckCheck, iconColor: '#10b981' };
      case 'PREPARING':
        return { label: 'Sedang Dibuat', color: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50', Icon: ChefHat, iconColor: '#f97316' };
      case 'SHIPPED':
        return { label: 'Sedang Dikirim', color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50', Icon: Clock, iconColor: '#3b82f6' };
      case 'COMPLETED':
        return { label: 'Selesai', color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50', Icon: CheckCheck, iconColor: '#10b981' };
      case 'CANCELLED':
        return { label: 'Dibatalkan', color: 'text-red-600 dark:text-red-450 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50', Icon: XCircle, iconColor: '#ef4444' };
      case 'FAILED':
        return { label: 'Gagal', color: 'text-red-600 dark:text-red-450 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50', Icon: XCircle, iconColor: '#ef4444' };
      default:
        return { label: 'Menunggu', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50', Icon: Clock, iconColor: '#f59e0b' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-slate-800 dark:text-white font-extrabold text-xl">Pesanan Saya</Text>
          <TouchableOpacity
            onPress={loadOrders}
            className="flex-row items-center gap-1 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-xl"
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
            <ClipboardList size={36} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-300 text-sm font-bold mt-4">
              Belum ada riwayat pesanan
            </Text>
          </View>
        ) : (
          orders.map((o) => {
            const statusCfg = getStatusConfig(o.status);
            const StatusIcon = statusCfg.Icon;
            return (
              <TouchableOpacity
                key={o.id}
                onPress={() => router.push({ pathname: '/customer/order-detail' as any, params: { orderId: o.id } })}
                activeOpacity={0.8}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
              >
                {/* Header Row */}
                <View className="flex-row justify-between items-start border-b border-slate-50 dark:border-slate-850 pb-4 mb-4">
                  <View className="flex-1 pr-2">
                    <Text className="text-slate-800 dark:text-white font-black text-sm" numberOfLines={1}>
                      {o.tenant.name}
                    </Text>
                    <Text className="text-slate-400 dark:text-slate-400 text-[9px] mt-1 font-bold">
                      Order ID: {o.id.substring(0, 8).toUpperCase()}... • {new Date(o.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <View className={`flex-row items-center gap-1 px-3 py-1 rounded-full border ${statusCfg.color}`}>
                    <StatusIcon size={10} color={statusCfg.iconColor} strokeWidth={2.5} />
                    <Text className="text-[9px] font-black uppercase tracking-wider">{statusCfg.label}</Text>
                  </View>
                </View>

                {/* Items Summary */}
                {o.orderItems.map((item) => (
                  <View key={item.id} className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium flex-1 pr-2" numberOfLines={1}>
                      {item.menu.name} ({item.quantity}x)
                    </Text>
                    <View className="flex-row items-center">
                      <CalendarDays size={10} color="#94a3b8" />
                      <Text className="text-slate-400 dark:text-slate-300 text-[10px] ml-1">
                        {item.targetDate}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Total & Action Row */}
                <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-slate-50 dark:border-slate-850">
                  <View>
                    <Text className="text-[10px] text-slate-400 dark:text-slate-300 font-semibold uppercase tracking-wider">Total Transaksi</Text>
                    <Text className="text-slate-800 dark:text-white font-extrabold text-sm mt-0.5">
                      Rp {o.totalAmount.toLocaleString('id-ID')}
                    </Text>
                  </View>

                  {o.paymentStatus === 'PENDING' ? (
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/payment-simulator', params: { orderId: o.id, totalAmount: o.totalAmount.toString() } })}
                      className="bg-amber-600 px-4 py-2.5 rounded-2xl"
                    >
                      <Text className="text-white text-xs font-extrabold">Bayar Sekarang</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-slate-400 dark:text-slate-300 text-xs font-bold">Detail Pesanan</Text>
                      <ChevronRight size={14} color="#cbd5e1" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
