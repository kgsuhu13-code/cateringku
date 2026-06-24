import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';

const GREEN = '#16a34a';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert('Perhatian', 'Email harus diisi.');
      return;
    }
    Alert.alert(
      'Instruksi Terkirim',
      `Tautan pemulihan kata sandi telah dikirim ke email: ${email.trim()}. Silakan cek kotak masuk Anda.`,
      [{ text: 'OK', onPress: () => router.replace('/login') }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-green-600 px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 w-10 h-10 items-center justify-center bg-white/20 rounded-full">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-extrabold flex-1">Reset Password</Text>
      </View>

      <View className="flex-1 p-6 justify-center">
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6 items-center">
          <View className="w-16 h-16 bg-green-50 rounded-full items-center justify-center mb-4">
            <Mail size={32} color={GREEN} />
          </View>
          <Text className="text-slate-850 dark:text-white font-extrabold text-base text-center">Lupa Kata Sandi?</Text>
          <Text className="text-slate-400 text-xs text-center mt-2 leading-4">
            Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
          </Text>
        </View>

        {/* Input Email */}
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Mail size={16} color={GREEN} />
            <Text className="text-slate-850 dark:text-white font-extrabold text-sm ml-2">Alamat Email *</Text>
          </View>
          <TextInput
            placeholder="Contoh: user@gmail.com"
            placeholderTextColor="#94a3b8"
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleReset}
          className="bg-green-600 h-[52px] rounded-2xl items-center justify-center"
          style={{ shadowColor: GREEN, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }}
        >
          <Text className="text-white font-extrabold text-base">Kirim Link Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
