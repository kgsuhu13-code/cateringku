import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { customAlert } from '../../components/CustomAlert';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../hooks/useCartStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Info } from 'lucide-react-native';
import MapPreview from '../../components/MapPreview';

const GREEN = '#059669';

export default function CheckoutShipping() {
  const router = useRouter();
  const cart = useCartStore();
  const { user } = useAuthStore();

  const [address, setAddress] = useState(user?.address || '');
  const [deliveryTime, setDeliveryTime] = useState('12:00');
  const [submitting, setSubmitting] = useState(false);

  // Address search suggestions (OpenStreetMap Nominatim)
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: -7.2504, // Default Surabaya
    lon: 112.7688,
  });

  useEffect(() => {
    if (user?.address && user.address.trim().length > 3) {
      const headers: Record<string, string> = {};
      if (Platform.OS !== 'web') {
        headers['User-Agent'] = 'CateringKu-App';
      }
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(user.address)}&countrycodes=id&limit=1`,
        { headers }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            });
          }
        })
        .catch((err) => console.error('Error geocoding default address:', err));
    }
  }, [user?.address]);

  useEffect(() => {
    if (!triggerSearch || address.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const headers: Record<string, string> = {};
        if (Platform.OS !== 'web') {
          headers['User-Agent'] = 'CateringKu-App';
        }
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=id&limit=5`,
          { headers }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [address, triggerSearch]);

  useEffect(() => {
    const validateCartItems = async () => {
      if (cart.items.length === 0 || !cart.tenantId) return;

      try {
        const uniqueDates = Array.from(new Set(cart.items.map((item: any) => item.targetDate)));
        let hasChanges = false;
        const validatedItems = [...cart.items];

        for (const date of uniqueDates) {
          const serverMenus = await api.getTenantMenus(cart.tenantId, date);
          const dateItems = validatedItems.filter((item: any) => item.targetDate === date);
          
          for (const item of dateItems) {
            const serverMenu = serverMenus.find((m: any) => m.id === item.menu.id);
            if (!serverMenu) {
              const index = validatedItems.findIndex((vi: any) => vi.menu.id === item.menu.id && vi.targetDate === date);
              if (index > -1) {
                validatedItems.splice(index, 1);
                hasChanges = true;
              }
            } else {
              const serverPrice = serverMenu.price;
              const serverQuota = serverMenu.remainingQuota !== undefined ? serverMenu.remainingQuota : serverMenu.maxQuota;
              if (item.menu.price !== serverPrice || item.menu.remainingQuota !== serverQuota) {
                const index = validatedItems.findIndex((vi: any) => vi.menu.id === item.menu.id && vi.targetDate === date);
                if (index > -1) {
                  validatedItems[index] = {
                    ...validatedItems[index],
                    menu: {
                      ...validatedItems[index].menu,
                      price: serverPrice,
                      remainingQuota: serverQuota,
                    }
                  };
                  hasChanges = true;
                }
              }
            }
          }
        }

        if (hasChanges) {
          useCartStore.setState({
            items: validatedItems,
            tenantId: validatedItems.length > 0 ? cart.tenantId : null,
            tenantName: validatedItems.length > 0 ? cart.tenantName : null,
          });

          customAlert.info('Keranjang Diperbarui', 'Beberapa menu di keranjang Anda sudah tidak tersedia lagi di database. Keranjang Anda disesuaikan secara otomatis.');

          if (validatedItems.length === 0) {
            router.replace('/customer' as any);
          }
        }
      } catch (err) {
        console.error('Failed to validate cart items during checkout:', err);
      }
    };

    validateCartItems();
  }, []);

  const selectSuggestion = (item: any) => {
    setTriggerSearch(false);
    setAddress(item.display_name);
    setCoordinates({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const times = ['10:00', '11:00', '12:00', '13:00'];

  const handleCheckout = async () => {
    if (!address.trim()) {
      customAlert.warning('Perhatian', 'Alamat pengiriman harus diisi.');
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
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('tidak ditemukan')) {
        customAlert.warning('Keranjang Belanja Kadaluarsa', 'Beberapa menu di keranjang Anda sudah tidak tersedia lagi di database (kemungkinan database baru saja di-reset). Keranjang belanja Anda akan dikosongkan secara otomatis.');
        cart.clearCart();
        router.replace('/customer' as any);
      } else {
        customAlert.error('Checkout Gagal', err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
      }
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
            onChangeText={(txt) => {
              setTriggerSearch(true);
              setAddress(txt);
            }}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 text-left align-top"
          />
          {searching && (
            <View className="flex-row items-center mt-2 px-2">
              <ActivityIndicator size="small" color={GREEN} />
              <Text className="text-slate-400 text-[10px] ml-2">Mencari alamat...</Text>
            </View>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mt-2 overflow-hidden">
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selectSuggestion(item)}
                  className={`px-4 py-3 flex-row items-start ${
                    index < suggestions.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                  }`}
                >
                  <MapPin size={14} color="#64748b" className="mt-0.5 mr-2" />
                  <Text className="text-[11px] text-slate-700 dark:text-slate-300 flex-1 leading-4">
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Map Preview */}
          <MapPreview
            lat={coordinates.lat}
            lon={coordinates.lon}
            onLocationSelect={(loc) => {
              setTriggerSearch(false);
              setAddress(loc.address);
              setCoordinates({ lat: loc.lat, lon: loc.lon });
            }}
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
          <View className="flex-row gap-2">
            {times.map((t) => {
              const isSelected = deliveryTime === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setDeliveryTime(t)}
                  className={`flex-1 py-2.5 rounded-2xl border items-center justify-center ${
                    isSelected ? 'bg-green-600 border-green-600' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text className={`font-black text-[10px] ${isSelected ? 'text-white' : 'text-slate-600'}`} numberOfLines={1}>
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
