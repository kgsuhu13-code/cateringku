import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../hooks/useCartStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Info } from 'lucide-react-native';

const GREEN = '#16a34a';

export default function CheckoutShipping() {
  const router = useRouter();
  const cart = useCartStore();
  const { user } = useAuthStore();

  const [address, setAddress] = useState(user?.address || '');
  const [deliveryTime, setDeliveryTime] = useState('12:00');
  const [submitting, setSubmitting] = useState(false);

  const times = ['10:00', '11:00', '12:00', '13:00'];

  const handleCheckout = async () => {
    if (!address.trim()) {
      Alert.alert('Perhatian', 'Alamat pengiriman harus diisi.');
      return;
    }
    if (cart.items.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        tenantId: cart.tenantId!,
        items: cart.items.map((item: any) => ({
          menuId: item.menu.id,
          quantity: item.quantity,
          targetDate: item.targetDate,
        })),
        shippingAddress: address,
        deliveryTime: deliveryTime,
      };

      const order = await api.createOrder(payload);
      cart.clearCart();
      
      // Navigate to payment simulator
      router.replace({
        pathname: '/payment-simulator',
        params: { orderId: order.id, totalAmount: order.totalAmount.toString() }
      });
    } catch (err: any) {
      Alert.alert('Checkout Gagal', err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1">Informasi Pengiriman</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Alamat Pengiriman */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <MapPin size={16} color={GREEN} />
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Alamat Pengiriman</Text>
          </View>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="Masukkan alamat pengiriman lengkap (Contoh: Gedung Fakultas Teknik Elektro, Lantai 2, Ruang Dosen)"
            placeholderTextColor="#94a3b8"
            value={address}
            onChangeText={setAddress}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 text-left align-top"
          />
        </View>

        {/* Waktu Pengantaran */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <Clock size={16} color={GREEN} />
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Jam Pengantaran Makanan</Text>
          </View>
          <Text className="text-slate-400 text-[10px] mb-4">
            Pilih opsi jam pengantaran untuk catering harian Anda:
          </Text>
          <View className="flex-row justify-between">
            {times.map((t) => {
              const isSelected = deliveryTime === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setDeliveryTime(t)}
                  className={`px-4 py-2.5 rounded-2xl border ${
                    isSelected ? 'bg-green-600 border-green-600' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text className={`font-black text-xs ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {t} WIB
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Catatan Ringkasan */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 flex-row items-start">
          <Info size={16} color="#64748b" className="mt-0.5" />
          <View className="flex-1 ml-3">
            <Text className="text-slate-800 dark:text-white font-bold text-xs">Catatan Pre-Order</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-[10px] leading-4 mt-1">
              Makanan akan diantar oleh katering mitra langsung ke titik lokasi pengantaran yang Anda tentukan sesuai waktu yang dipilih.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom bar */}
      <View className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-5 pt-4 pb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Total Belanja</Text>
          <Text className="text-green-600 dark:text-green-400 font-extrabold text-xl">
            Rp {cart.getTotalAmount().toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={submitting}
          className="bg-green-600 h-[52px] rounded-2xl items-center justify-center"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-base">Buat Pesanan & Bayar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
