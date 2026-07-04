import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import { ChefHat, UtensilsCrossed, ClipboardList, Star, Settings } from 'lucide-react-native';

export default function TenantLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeColor = '#16a34a'; // Green brand
  const inactiveColor = isDark ? '#94a3b8' : '#64748b'; // Slate
  const bgColor = isDark ? '#0f172a' : '#ffffff'; // Slate-900 / White
  const borderColor = isDark ? '#1e293b' : '#f1f5f9'; // Border line

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: borderColor,
          height: Platform.OS === 'ios' ? 92 : 78,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          backgroundColor: bgColor,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.25 : 0.04,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Rekap Dapur',
          tabBarIcon: ({ color, size }) => <ChefHat size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menus"
        options={{
          title: 'Kelola Menu',
          tabBarIcon: ({ color, size }) => <UtensilsCrossed size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pesanan',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reviews-list"
        options={{
          title: 'Ulasan',
          tabBarIcon: ({ color, size }) => <Star size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile-settings"
        options={{
          title: 'Toko',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      {/* Hide sub-screens from tab bar */}
      <Tabs.Screen
        name="kitchen-rekap"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-menu"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-menu"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
