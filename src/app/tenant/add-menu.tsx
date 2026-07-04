import React, { useState } from 'react';
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
import { ArrowLeft, UtensilsCrossed, Calendar, Hash, BookOpen } from 'lucide-react-native';

const GREEN = '#059669';

export default function AddMenu() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxQuota, setMaxQuota] = useState('20');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [availableAt, setAvailableAt] = useState(todayStr);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !price || !maxQuota || !availableAt.trim()) {
      Alert.alert('Perhatian', 'Semua kolom bertanda bintang (*) harus diisi.');
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedQuota = parseInt(maxQuota);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Perhatian', 'Harga harus berupa angka lebih besar dari 0.');
      return;
    }

    if (isNaN(parsedQuota) || parsedQuota <= 0) {
      Alert.alert('Perhatian', 'Kuota porsi harus berupa angka lebih besar dari 0.');
      return;
    }

    // Basic date validation YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(availableAt.trim())) {
      Alert.alert('Perhatian', 'Format tanggal ketersediaan harus YYYY-MM-DD.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTenantMenu({
        name: name.trim(),
        description: description.trim() || undefined,
        price: parsedPrice,
        maxQuota: parsedQuota,
        availableAt: availableAt.trim(),
      });
      Alert.alert('Sukses', 'Menu masakan harian baru berhasil ditambahkan!');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal Tambah Menu', err.message || 'Terjadi kesalahan saat menyimpan menu.');
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
        <Text className="text-white text-lg font-extrabold flex-1">Tambah Menu Baru</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Input Nama */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <UtensilsCrossed size={16} color={GREEN} />
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Nama Menu *</Text>
          </View>
          <TextInput
            placeholder="Contoh: Nasi Timbel Komplit Sambal Ijo"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
          />
        </View>

        {/* Input Deskripsi */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <BookOpen size={16} color={GREEN} />
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Deskripsi Makanan</Text>
          </View>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="Tuliskan isi lauk pauk, rasa, dan bumbu pelengkap..."
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 text-left align-top"
          />
        </View>

        {/* Input Harga */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Text className="text-green-600 font-extrabold text-sm">Rp</Text>
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Harga Jual *</Text>
          </View>
          <TextInput
            placeholder="Contoh: 18000"
            placeholderTextColor="#94a3b8"
            value={price}
            keyboardType="numeric"
            onChangeText={setPrice}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
          />
        </View>

        {/* Input Kuota */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Hash size={16} color={GREEN} />
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Kuota Porsi Masak *</Text>
          </View>
          <TextInput
            placeholder="Contoh: 20"
            placeholderTextColor="#94a3b8"
            value={maxQuota}
            keyboardType="numeric"
            onChangeText={setMaxQuota}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
          />
        </View>

        {/* Input Tanggal Ketersediaan */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Calendar size={16} color={GREEN} />
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Tanggal Tersedia (YYYY-MM-DD) *</Text>
          </View>
          <TextInput
            placeholder="Format: YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={availableAt}
            onChangeText={setAvailableAt}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-green-600 h-[52px] rounded-2xl items-center justify-center flex-row mb-8"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-base">Buat Menu Masakan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
