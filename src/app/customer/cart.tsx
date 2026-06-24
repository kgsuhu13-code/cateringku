import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../hooks/useCartStore';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  CalendarDays,
  Minus,
  Plus,
} from 'lucide-react-native';

const GREEN = '#16a34a';

export default function CustomerCart() {
  const router = useRouter();
  const cart = useCartStore();

  if (cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl items-center justify-center mb-5">
            <ShoppingCart size={40} color="#cbd5e1" strokeWidth={1.5} />
          </View>
          <Text className="text-slate-800 dark:text-slate-100 text-xl font-extrabold mb-2">Keranjang Kosong</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-sm text-center leading-6">
            Belum ada menu yang dipilih. Buka tab Menu Harian untuk memesan.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/customer/calendar' as any)}
            className="mt-6 bg-green-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold text-xs">Pesan Menu Harian</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-slate-800 dark:text-white font-extrabold text-xl">Keranjang</Text>
          <TouchableOpacity
            onPress={() => cart.clearCart()}
            className="flex-row items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl"
          >
            <Trash2 size={12} color="#ef4444" strokeWidth={2.5} />
            <Text className="text-red-500 font-bold text-xs">Kosongkan</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-6">
          Dari: {cart.tenantName}
        </Text>

        {cart.items.map((item: any) => (
          <View
            key={`${item.menu.id}-${item.targetDate}`}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mr-3 border border-green-100 dark:border-green-900/40">
                <UtensilsCrossed size={20} color={GREEN} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                  {item.menu.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <CalendarDays size={10} color="#94a3b8" strokeWidth={2} />
                  <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold ml-1">
                    Kirim: {item.targetDate}
                  </Text>
                </View>
              </View>
              <Text className="text-slate-800 dark:text-white font-extrabold text-sm">
                Rp {(item.menu.price * item.quantity).toLocaleString('id-ID')}
              </Text>
            </View>

            {/* Quantity Control */}
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-850">
              <Text className="text-slate-400 dark:text-slate-500 text-xs">
                @Rp {item.menu.price.toLocaleString('id-ID')}
              </Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 border border-slate-100 dark:border-slate-700">
                <TouchableOpacity
                  onPress={() => cart.updateQuantity(item.menu.id, item.targetDate, item.quantity - 1)}
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl items-center justify-center border border-slate-100 dark:border-slate-600"
                >
                  <Minus size={12} color="#374151" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text className="px-4 text-slate-800 dark:text-white font-black text-sm">{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => cart.updateQuantity(item.menu.id, item.targetDate, item.quantity + 1)}
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl items-center justify-center border border-slate-100 dark:border-slate-600"
                >
                  <Plus size={12} color="#374151" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <View className="h-4" />
      </ScrollView>

      {/* Sticky Checkout Bar */}
      <View className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-5 pt-4 pb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Total Pembayaran</Text>
          <Text className="text-green-600 dark:text-green-400 font-extrabold text-xl">
            Rp {cart.getTotalAmount().toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/customer/checkout-shipping' as any)}
          className="bg-green-600 h-[52px] rounded-2xl items-center justify-center"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
        >
          <Text className="text-white font-extrabold text-base">Lanjutkan ke Pengiriman</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
