import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react-native';

const GREEN = '#16a34a';

export default function EditProfile() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.getUserProfile();
        setName(data.name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama tidak boleh kosong.');
      return;
    }
    setSubmitting(true);
    try {
      await api.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      Alert.alert('Sukses', 'Profil berhasil diperbarui!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal memperbarui profil.');
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
        <Text className="text-white text-lg font-extrabold flex-1">Edit Profil</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Input Nama */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <User size={16} color={GREEN} />
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Nama Lengkap</Text>
            </View>
            <TextInput
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
            />
          </View>

          {/* Input Nomor HP */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Phone size={16} color={GREEN} />
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Nomor HP / WhatsApp</Text>
            </View>
            <TextInput
              placeholder="Masukkan nomor handphone"
              placeholderTextColor="#94a3b8"
              value={phone}
              keyboardType="phone-pad"
              onChangeText={setPhone}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
            />
          </View>

          {/* Input Alamat default */}
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-3">
              <MapPin size={16} color={GREEN} />
              <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Alamat Pengiriman Utama</Text>
            </View>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Contoh: Jl. Sukolilo Indah No. 22, Ruko B3, Surabaya"
              placeholderTextColor="#94a3b8"
              value={address}
              onChangeText={setAddress}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 text-left align-top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={submitting}
            className="bg-green-600 h-[52px] rounded-2xl items-center justify-center flex-row mb-8"
            style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-base">Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
