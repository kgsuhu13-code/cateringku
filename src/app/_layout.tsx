import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { ThemeProvider, DefaultTheme, DarkTheme } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { useEffect } from 'react';
import '../global.css';
import { useAuthStore } from '../hooks/useAuthStore';
import CustomAlert from '../components/CustomAlert';

// Inject modern Google Font dynamically on Web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    body, input, textarea, button, select, span, div, p, a, h1, h2, h3, h4, h5, h6 {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
  `;
  document.head.appendChild(style);
}

// Protected routes that require authentication
const PROTECTED_SEGMENTS = ['customer', 'tenant', 'admin', 'payment-simulator', 'payment-status'];

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!navigationState?.key) return; // Mencegah redirect sebelum navigation stack terpasang sepenuhnya

    const currentSegment = segments[0] as string | undefined;
    const isProtected = PROTECTED_SEGMENTS.includes(currentSegment ?? '');

    if (isProtected && !isAuthenticated) {
      // Not logged in but trying to access protected page → redirect to login
      router.replace('/login');
      return;
    }

    if (isAuthenticated && user) {
      // Prevent role cross-access
      if (user.role === 'CUSTOMER' && (currentSegment === 'tenant' || currentSegment === 'admin')) {
        router.replace('/customer/home');
      } else if (user.role === 'TENANT' && (currentSegment === 'customer' || currentSegment === 'admin')) {
        router.replace('/tenant/dashboard');
      } else if (user.role === 'SUPER_ADMIN' && (currentSegment === 'customer' || currentSegment === 'tenant')) {
        router.replace('/admin/dashboard');
      }
    }
  }, [segments, isAuthenticated, user, navigationState?.key]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="customer" />
        <Stack.Screen name="tenant" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="payment-simulator" options={{ presentation: 'modal' }} />
        <Stack.Screen name="payment-status" />
      </Stack>
      <CustomAlert />
    </ThemeProvider>
  );
}
