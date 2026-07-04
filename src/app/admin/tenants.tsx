import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, Plus, MapPin, X } from 'lucide-react-native';

const GREEN = '#059669';

export default function AdminTenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminTenants();
      setTenants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleCreateTenant = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama katering harus diisi.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createTenant({
        name: name.trim(),
        description: description.trim() || undefined,
        address: address.trim() || undefined,
      });
      Alert.alert('Sukses', 'Mitra katering baru berhasil didaftarkan!');
      setName('');
      setDescription('');
      setAddress('');
      setModalVisible(false);
      loadTenants();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal mendaftarkan katering.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-red-600 px-5 py-4 flex-row justify-between items-center">
        <Text className="text-white text-lg font-extrabold">Kelola Mitra Catering</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1"
        >
          <Plus size={14} color="white" strokeWidth={3} />
          <Text className="text-white text-xs font-bold">Mitra</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : tenants.length === 0 ? (
          <View className="items-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200">
            <Store size={36} color="#cbd5e1" strokeWidth={1.5} />
            <Text className="text-slate-400 text-sm font-bold mt-4">Belum ada mitra terdaftar</Text>
          </View>
        ) : (
          tenants.map((t) => (
            <View
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-3 shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-50 rounded-2xl items-center justify-center mr-4">
                  <Store size={18} color={GREEN} />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-slate-850 dark:text-white font-extrabold text-sm">{t.name}</Text>
                  <Text className="text-slate-400 text-[10px] mt-0.5 leading-4" numberOfLines={2}>
                    {t.description || 'Penyedia menu pre-order lezat.'}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <MapPin size={10} color="#64748b" />
                    <Text className="text-slate-500 text-[9px] font-bold ml-1 flex-1" numberOfLines={1}>
                      {t.address || 'Kantin Utama'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="border-t border-slate-50 dark:border-slate-850 mt-4 pt-3 flex-row justify-between items-center">
                <Text className="text-slate-400 text-[8px] font-bold uppercase tracking-wider">Anggota Dapur</Text>
                <Text className="text-slate-600 dark:text-slate-350 text-[10px] font-semibold">
                  {t.users?.length || 0} Akun Terhubung
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Add Tenant Form */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-slate-950/50">
          <View className="bg-white dark:bg-slate-900 rounded-t-[36px] p-6 border-t border-slate-200 dark:border-slate-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-850 dark:text-white font-extrabold text-base">Daftarkan Katering Baru</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 items-center justify-center bg-slate-100 rounded-full">
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-2">Nama Katering *</Text>
              <TextInput
                placeholder="Masukkan nama katering"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-2">Deskripsi Layanan</Text>
              <TextInput
                placeholder="Tuliskan spesialisasi menu katering..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
              />
            </View>

            <View className="mb-6">
              <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-2">Alamat Lengkap</Text>
              <TextInput
                placeholder="Masukkan alamat dapur katering"
                placeholderTextColor="#94a3b8"
                value={address}
                onChangeText={setAddress}
                className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
              />
            </View>

            <TouchableOpacity
              onPress={handleCreateTenant}
              disabled={submitting}
              className="bg-green-600 h-[52px] rounded-2xl items-center justify-center flex-row mb-4"
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-extrabold text-base">Simpan & Daftarkan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
