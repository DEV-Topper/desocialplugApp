import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRegisterMutation } from '../../store/api/auth.api';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    referralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { username, email, phone, password, referralCode } = formData;
    if (!username || !email || !phone || !password) return;

    try {
      const response = await register({
        username,
        email,
        phone,
        password,
        referralCode,
      }).unwrap();

      if (response.success) {
        alert('Registration Successful!');
        router.replace('/(dashboard)');
      } else {
        alert(response.error || 'Registration Failed');
      }
    } catch (err: any) {
      alert(err.data?.error || 'An unexpected error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <View className="mb-10 w-full max-w-md mx-auto">
          <Text className="text-4xl font-bold text-gray-900 mb-3">
            Register
          </Text>
          <Text className="text-gray-600 text-base leading-relaxed mb-8">
            Create an account and unlock a vast selection of premium social media
            accounts.
          </Text>

          <View className="space-y-5">
            {/* Username */}
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <User size={20} className="text-blue-600" />
              </View>
              <TextInput
                className="pl-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Username"
                value={formData.username}
                onChangeText={(val) => handleInputChange('username', val)}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Email */}
            <View className="relative justify-center mt-5">
              <View className="absolute left-4 z-10">
                <Mail size={20} className="text-blue-600" />
              </View>
              <TextInput
                className="pl-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Email"
                value={formData.email}
                onChangeText={(val) => handleInputChange('email', val)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Phone */}
            <View className="relative justify-center mt-5">
              <View className="absolute left-4 z-10">
                <Phone size={20} className="text-blue-600" />
              </View>
              <TextInput
                className="pl-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Phone (e.g. 08012345678)"
                value={formData.phone}
                onChangeText={(val) => handleInputChange('phone', val)}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            {/* Password */}
            <View className="relative justify-center mt-5">
              <View className="absolute left-4 z-10">
                <Lock size={20} className="text-blue-600" />
              </View>
              <TextInput
                className="pl-12 pr-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Password"
                value={formData.password}
                onChangeText={(val) => handleInputChange('password', val)}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-4 z-10"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-blue-600" />
                ) : (
                  <Eye size={20} className="text-blue-600" />
                )}
              </TouchableOpacity>
            </View>

            {/* Referral Code */}
            <View className="relative justify-center mt-5">
              <View className="absolute left-4 z-10">
                <User size={20} className="text-blue-600" />
              </View>
              <TextInput
                className="pl-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Referral Code (optional)"
                value={formData.referralCode}
                onChangeText={(val) => handleInputChange('referralCode', val)}
                editable={!isLoading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`w-full h-14 bg-blue-600 rounded-xl items-center justify-center mt-8 flex-row ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading && <ActivityIndicator color="#fff" className="mr-2" />}
              <Text className="text-white text-lg font-semibold tracking-wide">
                {isLoading ? 'REGISTERING...' : 'REGISTER \u2192'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600 text-base">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-blue-600 font-semibold text-base">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
