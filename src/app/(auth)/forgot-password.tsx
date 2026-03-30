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
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useForgotPasswordMutation } from '../../store/api/auth.api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleResetPassword = async () => {
    if (!email) return;

    try {
      const response = await forgotPassword({ email }).unwrap();
      // Assume success handles response internally, or we check response.success
      alert(
        response.success 
          ? `We've sent password reset instructions to ${email}. Please check your inbox and spam folder.` 
          : 'Check your email'
      );
      router.push('/(auth)/login');
    } catch (err: any) {
      alert(err.data?.error || 'Failed to send reset email');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <View className="mb-10 w-full max-w-md mx-auto">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
          >
            <ArrowLeft size={16} className="text-gray-600 mr-2" />
            <Text className="text-gray-600 text-sm font-medium">
              Back to Login
            </Text>
          </TouchableOpacity>

          <Text className="text-4xl font-bold text-gray-900 mb-3">
            Forgot Password?
          </Text>
          <Text className="text-gray-600 text-base leading-relaxed mb-8">
            No worries! Enter your email address and we'll send you instructions to
            reset your password.
          </Text>

          <View className="space-y-5">
            {/* Email Field */}
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Mail size={20} className="text-gray-400" />
              </View>
              <TextInput
                className="pl-12 h-14 bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white rounded-xl text-base text-gray-900"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`w-full h-14 bg-blue-600 rounded-xl items-center justify-center mt-8 flex-row ${
                isLoading || !email ? 'opacity-50' : ''
              }`}
              onPress={handleResetPassword}
              disabled={isLoading || !email}
              activeOpacity={0.8}
            >
              {isLoading && <ActivityIndicator color="#fff" className="mr-2" />}
              <Text className="text-white text-lg font-semibold tracking-wide">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 text-base">
                Remember your password?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-blue-600 font-semibold text-base">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
