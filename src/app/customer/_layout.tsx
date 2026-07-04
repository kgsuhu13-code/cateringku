import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import { Home, CalendarDays, ShoppingCart, ClipboardList, User } from 'lucide-react-native';

export default function CustomerLayout() {
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
        name="home"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Menu Harian',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Keranjang',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
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
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hide sub-screens from tab bar */}
      <Tabs.Screen
        name="tenant-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="menu-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="checkout-shipping"
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
        name="add-review"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
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
