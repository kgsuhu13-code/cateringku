import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Skeleton from '../../components/Skeleton';
import { customAlert } from '../../components/CustomAlert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useCartStore } from '../../hooks/useCartStore';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UtensilsCrossed,
  Package,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react-native';

interface Tenant {
  id: string;
  name: string;
}

interface Menu {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  price: number;
  maxQuota: number;
  availableAt: string;
  remainingQuota?: number;
}

const GREEN = '#059669';

export default function CustomerCalendar() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cart = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  // Load tenants on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    api.getTenants()
      .then((data) => {
        setTenants(data);
        // Pre-select if tenant ID passed in params
        if (params.tenantId) {
          const pre = data.find((t: any) => t.id === params.tenantId);
          if (pre) setSelectedTenant(pre);
        } else if (data.length > 0) {
          setSelectedTenant(data[0]);
        }
      })
      .catch(console.error);
  }, [isAuthenticated, params.tenantId]);

  // Load menus when selected tenant or date changes
  useEffect(() => {
    if (!isAuthenticated || !selectedTenant) return;
    loadMenus();
  }, [selectedTenant, selectedDate, isAuthenticated]);

  const loadMenus = async () => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      const data = await api.getTenantMenus(selectedTenant.id, selectedDate);
      setMenus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menu: Menu) => {
    if (!selectedTenant) return;
    const currentQty = cart.items.find(
      (item: any) => item.menu.id === menu.id && item.targetDate === selectedDate
    )?.quantity || 0;
    const remaining = menu.remainingQuota !== undefined ? menu.remainingQuota : menu.maxQuota;
    
    if (currentQty >= remaining) {
      customAlert.error('Gagal', 'Stok/Quota tidak mencukupi untuk ditambahkan ke keranjang.');
      return;
    }

    const { success, clearedPrevious } = cart.addToCart(menu, 1, selectedDate, selectedTenant.name);
    
    if (success) {
      showToast(`${menu.name} ditambahkan ke keranjang`);
      if (clearedPrevious) {
        customAlert.warning('Perhatian', 'Keranjang dari catering sebelumnya telah dihapus.');
      }
      loadMenus();
    } else {
      customAlert.error('Gagal', 'Stok/Quota tidak mencukupi.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const formatDateLabel = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Hari Ini';
    if (dateStr === tomorrowStr) return 'Besok';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getDateDay = (dateStr: string) => new Date(dateStr).getDate().toString();
  const getDateShortMonth = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Toast */}
      {toastMessage && (
        <View className="absolute top-4 left-5 right-5 bg-slate-900/95 py-3 px-5 rounded-2xl z-50 flex-row items-center shadow-xl">
          <CheckCheck size={16} color="#22c55e" strokeWidth={2.5} />
          <Text className="text-white text-xs font-bold ml-2 flex-1">{toastMessage}</Text>
        </View>
      )}

      {/* Tenant Selector */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {tenants.map((t) => {
            const isActive = selectedTenant?.id === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelectedTenant(t)}
                activeOpacity={0.75}
                className={`px-4 py-2.5 rounded-full mr-2.5 border flex-row items-center gap-2 ${
                  isActive
                    ? 'bg-green-600 border-green-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <UtensilsCrossed size={12} color={isActive ? 'white' : '#94a3b8'} strokeWidth={2} />
                <Text className={`font-bold text-xs ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Date Selector */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {dates.map((date) => {
            const isSelected = selectedDate === date;
            const isToday = date === new Date().toISOString().split('T')[0];
            return (
              <TouchableOpacity
                key={date}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.75}
                className={`w-14 mr-2.5 items-center py-2.5 rounded-2xl border ${
                  isSelected
                    ? 'bg-green-600 border-green-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/70'
                }`}
              >
                <Text className={`text-[9px] font-bold uppercase ${isSelected ? 'text-green-100' : 'text-slate-400'}`}>
                  {isToday ? 'Hari Ini' : getDateShortMonth(date)}
                </Text>
                <Text className={`text-lg font-black mt-0.5 ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                  {getDateDay(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu List */}
      <ScrollView className="flex-1 px-4 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-800 dark:text-white font-extrabold text-base">Menu Tersedia</Text>
          <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
            {formatDateLabel(selectedDate)}
          </Text>
        </View>

        {loading ? (
          <View>
            <Skeleton.MenuItem />
            <Skeleton.MenuItem />
          </View>
        ) : menus.length === 0 ? (
          <View className="items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <UtensilsCrossed size={32} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-4">
              Belum ada menu di tanggal ini
            </Text>
          </View>
        ) : (
          menus.map((m) => {
            const quota = m.remainingQuota !== undefined ? m.remainingQuota : m.maxQuota;
            const isOutOfStock = quota <= 0;
            return (
              <View
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm shadow-slate-100 dark:shadow-none"
              >
                <TouchableOpacity
                  onPress={() => router.push({ 
                    pathname: '/customer/menu-detail' as any, 
                    params: { 
                      id: m.id, 
                      name: m.name, 
                      price: m.price.toString(),
                      tenantId: m.tenantId,
                      tenantName: selectedTenant?.name || 'Catering'
                    } 
                  })}
                  activeOpacity={0.9}
                  className="flex-row items-start"
                >
                  {/* Food Icon */}
                  <View className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-2xl items-center justify-center mr-4 border border-green-100 dark:border-green-900/40">
                    <UtensilsCrossed size={24} color={GREEN} strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 dark:text-slate-100 font-bold text-sm" numberOfLines={1}>
                      {m.name}
                    </Text>
                    {m.description && (
                      <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-4" numberOfLines={2}>
                        {m.description}
                      </Text>
                    )}
                    {/* Price & Stock Row */}
                    <View className="flex-row items-center justify-between mt-3">
                      <Text className="text-green-600 dark:text-green-400 font-extrabold text-base">
                        Rp {m.price.toLocaleString('id-ID')}
                      </Text>
                      {/* Stock badge */}
                      <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${
                        isOutOfStock ? 'bg-red-50 dark:bg-red-950/30' : 'bg-slate-50 dark:bg-slate-800'
                      }`}>
                        {isOutOfStock ? (
                          <AlertTriangle size={10} color="#ef4444" strokeWidth={2.5} />
                        ) : (
                          <Package size={10} color="#94a3b8" strokeWidth={2} />
                        )}
                        <Text className={`text-[10px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-slate-400'}`}>
                          {isOutOfStock ? 'Habis' : `${quota} sisa`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Add to Cart Button */}
                <TouchableOpacity
                  onPress={() => handleAddToCart(m)}
                  disabled={isOutOfStock}
                  className={`mt-4 w-full py-2.5 rounded-2xl items-center ${
                    isOutOfStock ? 'bg-slate-100 dark:bg-slate-850' : 'bg-green-600'
                  }`}
                >
                  <Text className={`text-xs font-extrabold ${isOutOfStock ? 'text-slate-400' : 'text-white'}`}>
                    {isOutOfStock ? 'Quota Habis' : 'Pesan Harian (Tambah Keranjang)'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
