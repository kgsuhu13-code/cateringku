import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../hooks/api';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star } from 'lucide-react-native';

const GREEN = '#059669';

export default function AddReview() {
  const router = useRouter();
  const { menuId, menuName } = useLocalSearchParams();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('Perhatian', 'Rating harus diisi.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createReview({
        menuId: menuId as string,
        rating: rating,
        comment: comment.trim(),
      });
      Alert.alert('Sukses', 'Terima kasih atas ulasan Anda!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal mengirimkan ulasan.');
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
        <Text className="text-white text-lg font-extrabold flex-1">Beri Ulasan</Text>
      </View>

      <View className="flex-1 p-4">
        {/* Menu Info */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-4 items-center">
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Menilai Makanan</Text>
          <Text className="text-slate-800 dark:text-white font-extrabold text-base text-center mt-1">
            {menuName || 'Nama Menu'}
          </Text>

          {/* Star Rating Selector */}
          <View className="flex-row items-center mt-6 gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Star
                  size={36}
                  color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                  fill={star <= rating ? '#f59e0b' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment Text Box */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-6">
          <Text className="text-slate-800 dark:text-white font-extrabold text-sm mb-3">Tulis Komentar Anda</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholder="Bagikan pengalaman rasa masakan, porsi, dan pengantaran katering..."
            placeholderTextColor="#94a3b8"
            value={comment}
            onChangeText={setComment}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 text-left align-top"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-green-600 h-[52px] rounded-2xl items-center justify-center flex-row"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-base">Kirim Ulasan</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
