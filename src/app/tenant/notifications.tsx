import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Star, ClipboardList, CheckSquare } from 'lucide-react-native';
import { api } from '../../hooks/api';

const GREEN = '#059669';

interface DbNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function TenantNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications(false);
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      await fetchNotifications(false);
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const getNotificationStyle = (type: string, isRead: boolean) => {
    let style = {
      Icon: Bell,
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-600',
    };

    if (type === 'NEW_ORDER') {
      style = {
        Icon: ClipboardList,
        color: 'bg-green-100 dark:bg-green-950/40 text-green-600',
      };
    } else if (type === 'NEW_REVIEW') {
      style = {
        Icon: Star,
        color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600',
      };
    }

    if (isRead) {
      style.color = 'bg-slate-100/50 dark:bg-slate-900/40 text-slate-400';
    }

    return style;
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} jam lalu`;
      
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch (_) {
      return '';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-lg font-extrabold">Notifikasi Toko</Text>
          {unreadCount > 0 && (
            <Text className="text-white/80 text-[10px] font-semibold">{unreadCount} belum dibaca</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity 
            onPress={handleMarkAllRead}
            className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full"
          >
            <CheckSquare size={13} color="white" className="mr-1" />
            <Text className="text-white text-[10px] font-bold">Baca Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Bell size={40} color="#cbd5e1" />
              <Text className="text-slate-400 text-xs mt-3 font-semibold">Tidak ada notifikasi baru</Text>
            </View>
          ) : (
            notifications.map((item) => {
              const { Icon: ItemIcon, color } = getNotificationStyle(item.type, item.isRead);
              return (
                <TouchableOpacity
                  key={item.id}
                  disabled={item.isRead}
                  onPress={() => handleMarkRead(item.id)}
                  activeOpacity={0.8}
                  className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 shadow-sm flex-row items-start ${!item.isRead ? 'border-l-4 border-l-green-600' : 'opacity-70'}`}
                >
                  <View className={`w-10 h-10 rounded-2xl items-center justify-center ${color.split(' ')[0]}`}>
                    <ItemIcon size={18} className={color.split(' ')[1]} />
                  </View>
                  <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-center">
                      <Text className={`text-slate-850 dark:text-white font-extrabold text-xs ${!item.isRead ? 'font-black' : ''}`}>
                        {item.title}
                      </Text>
                      <Text className="text-[8px] text-slate-400">{formatTime(item.createdAt)}</Text>
                    </View>
                    <Text className="text-slate-500 dark:text-slate-450 text-[10px] leading-4 mt-1.5">
                      {item.body}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
