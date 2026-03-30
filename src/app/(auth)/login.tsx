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
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLoginMutation } from '../../store/api/auth.api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      const response = await login({ email, password }).unwrap();
      if (response.success) {
        // Redux slice automatically handles token storage from the matcher
        router.replace('/(dashboard)');
      } else {
        alert(response.error || 'Login Failed');
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
            Login
          </Text>
          <Text className="text-gray-600 text-base leading-relaxed mb-8">
            Welcome back! Sign in to access your premium social media accounts.
          </Text>

          <View className="space-y-5">
            {/* Email Field */}
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Mail size={20} className="text-blue-600" />
              </View>
              <TextInput
                className="pl-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Password Field */}
            <View className="relative justify-center mt-5">
              <View className="absolute left-4 z-10">
                <Lock size={20} className="text-blue-600" />
              </View>
              <TextInput
                className="pl-12 pr-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
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

            {/* Options */}
            <View className="flex-row items-center justify-between mt-4">
              <TouchableOpacity className="flex-row items-center">
                {/* Custom Checkbox mimicking web */}
                <View className="w-4 h-4 rounded border border-gray-300 mr-2 items-center justify-center">
                  {/* Empty checkbox */}
                </View>
                <Text className="text-gray-600">Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text className="text-blue-600 font-semibold">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="w-full h-14 bg-blue-600 rounded-xl items-center justify-center mt-8 disabled:opacity-50 flex-row"
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" className="mr-2" />
              ) : null}
              <Text className="text-white text-lg font-semibold tracking-wide">
                {isLoading ? 'LOGGING IN...' : 'LOGIN \u2192'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-500 font-medium">OR</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-2">
              <Text className="text-gray-600 text-base">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-blue-600 font-semibold text-base">
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
