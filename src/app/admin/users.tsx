import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Shield, User, X } from 'lucide-react-native';

const GREEN = '#16a34a';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Role Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'TENANT' | 'SUPER_ADMIN'>('CUSTOMER');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, tenantData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminTenants()
      ]);
      setUsers(userData);
      setTenants(tenantData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedTenantId(user.tenantId || null);
    setModalVisible(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await api.updateUserRole(selectedUser.id, {
        role: selectedRole,
        tenantId: selectedRole === 'TENANT' ? selectedTenantId : null
      });
      Alert.alert('Sukses', 'Peran pengguna berhasil diperbarui!');
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal mengubah peran pengguna.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-red-600 px-5 py-4">
        <Text className="text-white text-lg font-extrabold">Kelola Pengguna</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : users.length === 0 ? (
          <View className="items-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200">
            <Users size={36} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 text-sm font-bold mt-4">Belum ada pengguna terdaftar</Text>
          </View>
        ) : (
          users.map((u) => (
            <View
              key={u.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 shadow-sm"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-3">
                  <Text className="text-slate-850 dark:text-white font-extrabold text-sm">{u.name}</Text>
                  <Text className="text-slate-400 text-[10px] mt-0.5">{u.email}</Text>
                  {u.phone && <Text className="text-slate-450 text-[9px] mt-0.5">📞 {u.phone}</Text>}
                  
                  {u.role === 'TENANT' && (
                    <View className="mt-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl self-start border border-slate-100">
                      <Text className="text-slate-500 text-[9px] font-bold">
                        Toko: {u.tenant?.name || 'Belum dihubungkan'}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View className="items-end">
                  <View className={`px-2 py-0.5 rounded-full border ${
                    u.role === 'SUPER_ADMIN' ? 'bg-red-50 border-red-200 text-red-600' :
                    u.role === 'TENANT' ? 'bg-green-50 border-green-200 text-green-600' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <Text className="text-[8px] font-black uppercase tracking-wider">{u.role}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => openEditModal(u)}
                    className="mt-3 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-red-650 text-[10px] font-bold">Ubah Akses</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Edit Role */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-slate-950/50">
          <View className="bg-white dark:bg-slate-900 rounded-t-[36px] p-6 border-t border-slate-200">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-850 dark:text-white font-extrabold text-base">Ubah Akses Pengguna</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 items-center justify-center bg-slate-100 rounded-full">
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Nama Pengguna</Text>
            <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-5">{selectedUser?.name}</Text>

            {/* Role Selector */}
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">Pilih Hak Akses (Role)</Text>
            <View className="flex-row justify-between mb-6">
              {(['CUSTOMER', 'TENANT', 'SUPER_ADMIN'] as const).map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setSelectedRole(role)}
                    className={`px-4 py-2.5 rounded-2xl border ${
                      isSelected ? 'bg-red-650 border-red-650' : 'bg-slate-50 border-slate-200'
                    }`}
                    style={{ width: '31%' }}
                  >
                    <Text className={`text-center font-black text-[9px] uppercase ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tenant Selector (if role is TENANT) */}
            {selectedRole === 'TENANT' && (
              <View className="mb-6">
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">Hubungkan ke Katering (Tenant)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tenants.map((tenant) => {
                    const isSelected = selectedTenantId === tenant.id;
                    return (
                      <TouchableOpacity
                        key={tenant.id}
                        onPress={() => setSelectedTenantId(tenant.id)}
                        className={`px-4 py-2 rounded-full mr-2.5 border ${
                          isSelected ? 'bg-green-600 border-green-600' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                          {tenant.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSaveRole}
              disabled={updating}
              className="bg-green-600 h-[52px] rounded-2xl items-center justify-center flex-row mb-4"
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-extrabold text-base">Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
