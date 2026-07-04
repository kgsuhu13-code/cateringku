import { Platform } from 'react-native';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android Emulator maps localhost to 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  // Web: resolve current hostname dynamically (e.g. for testing on phone via Wi-Fi IP)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}:5000/api`;
    }
  }
  // Web or iOS Simulator default
  return 'http://localhost:5000/api';
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getBaseUrl()}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Sync user with local database
  syncUser: async (userData: {
    firebaseUid: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'TENANT' | 'SUPER_ADMIN';
    tenantId?: string;
  }) => {
    return request('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get all tenants
  getTenants: async () => {
    return request('/tenants');
  },

  // Create a new tenant (mitra catering)
  createTenant: async (tenantData: {
    name: string;
    description?: string;
    address?: string;
  }) => {
    return request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  },

  // Get menus for a specific tenant on a date
  getTenantMenus: async (tenantId: string, date: string) => {
    return request(`/tenants/${tenantId}/menus?date=${date}`);
  },

  // Create an order
  createOrder: async (orderData: {
    tenantId: string;
    items: Array<{
      menuId: string;
      quantity: number;
      targetDate: string;
    }>;
    shippingAddress?: string;
    deliveryTime?: string;
  }) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get customer orders history
  getOrders: async () => {
    return request('/orders');
  },

  // Pay order (Simulate)
  payOrder: async (orderId: string, status: 'PAID' | 'FAILED') => {
    return request(`/orders/${orderId}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Tenant: Get menus created by this tenant
  getTenantMenusOnly: async () => {
    return request('/tenant/menus');
  },

  // Tenant: Create daily menu
  createTenantMenu: async (menuData: {
    name: string;
    description?: string;
    price: number;
    maxQuota: number;
    availableAt: string;
  }) => {
    return request('/tenant/menus', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  },

  // Tenant: Update daily menu
  updateTenantMenu: async (menuId: string, menuData: {
    name?: string;
    description?: string;
    price?: number;
    maxQuota?: number;
    availableAt?: string;
  }) => {
    return request(`/tenant/menus/${menuId}`, {
      method: 'PUT',
      body: JSON.stringify(menuData),
    });
  },

  // Tenant: Delete daily menu
  deleteTenantMenu: async (menuId: string) => {
    return request(`/tenant/menus/${menuId}`, {
      method: 'DELETE',
    });
  },

  // Tenant: Get kitchen rekap
  getKitchenRekap: async (date: string) => {
    return request(`/tenant/kitchen-rekap?date=${date}`);
  },

  // Tenant: Get dashboard stats (menuCount, orderCount, totalRevenue)
  getTenantStats: async () => {
    return request('/tenant/stats');
  },

  // Tenant: Get orders placed with this tenant
  getTenantOrders: async () => {
    return request('/tenant/orders');
  },

  // Tenant: Update order process status
  updateOrderStatus: async (orderId: string, status: 'PAID' | 'PREPARING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED') => {
    return request(`/tenant/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // User Profile
  getUserProfile: async () => {
    return request('/users/profile');
  },

  updateUserProfile: async (profileData: {
    name?: string;
    phone?: string;
    address?: string;
  }) => {
    return request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Reviews
  createReview: async (reviewData: {
    menuId: string;
    rating: number;
    comment?: string;
  }) => {
    return request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getMenuReviews: async (menuId: string) => {
    return request(`/menus/${menuId}/reviews`);
  },

  getTenantReviews: async () => {
    return request('/tenant/reviews');
  },

  deleteReview: async (reviewId: string) => {
    return request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // Admin Endpoints
  getAdminStats: async () => {
    return request('/admin/stats');
  },

  getAdminUsers: async () => {
    return request('/admin/users');
  },

  updateUserRole: async (userId: string, roleData: {
    role: 'CUSTOMER' | 'TENANT' | 'SUPER_ADMIN';
    tenantId?: string | null;
  }) => {
    return request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  },

  getAdminTenants: async () => {
    return request('/admin/tenants');
  },

  // Notifications Endpoints
  getNotifications: async () => {
    return request('/notifications');
  },

  markNotificationRead: async (id: string) => {
    return request(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  markAllNotificationsRead: async () => {
    return request('/notifications/read-all', {
      method: 'POST',
    });
  },
};
