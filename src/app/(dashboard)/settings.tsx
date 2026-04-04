import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Edit2, Moon, Sun, LogOut, Lock, Image as ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetUserQuery } from '../../store/api/user.api';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/auth.slice';
import { COLORS } from '../../constants/theme';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success';
}

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: userData, refetch: refetchUser } = useGetUserQuery();
  const user = userData?.user;
  const [theme, setTheme] = useState<'light' | 'dark'>(useColorScheme() === 'dark' ? 'dark' : 'light');

  // Edit profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Forgot password state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Alert state
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      setEditedUsername(user.username || '');
      setEditedEmail(user.email || '');
    }
  }, [user]);

  const handleEditProfile = async () => {
    if (!editedUsername.trim() || !editedEmail.trim()) {
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Username and email are required',
        type: 'error',
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editedUsername.trim(),
          email: editedEmail.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          visible: true,
          title: 'Success',
          message: 'Profile updated successfully!',
          type: 'success',
        });
        setShowEditProfile(false);
        await refetchUser();
      } else {
        setAlert({
          visible: true,
          title: 'Error',
          message: data.error || 'Failed to update profile',
          type: 'error',
        });
      }
    } catch (error: any) {
      setAlert({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'No email found for this account',
        type: 'error',
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          visible: true,
          title: 'Email Sent',
          message: `Password reset instructions sent to ${user.email}. Check your inbox.`,
          type: 'success',
        });
        setShowResetPassword(false);
      } else {
        setAlert({
          visible: true,
          title: 'Error',
          message: data.error || 'Failed to send reset email',
          type: 'error',
        });
      }
    } catch (error: any) {
      setAlert({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to send reset email',
        type: 'error',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          dispatch(logout());
          router.replace('/(auth)/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      contentContainerStyle={{ paddingBottom: 150 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={{ backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'ios' ? 60 : 20, paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827' }}>Settings</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Manage your account and preferences</Text>
      </View>

      {/* Account Section */}
      <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Account</Text>

        {/* Profile Card */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Profile Information</Text>
            <TouchableOpacity
              onPress={() => {
                setEditedUsername(user?.username || '');
                setEditedEmail(user?.email || '');
                setShowEditProfile(true);
              }}
              style={{ padding: 8 }}
            >
              <Edit2 size={18} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Username</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{user?.username || 'N/A'}</Text>
          </View>

          <View>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Email</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* Password Section */}
        <TouchableOpacity
          onPress={() => setShowResetPassword(true)}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Reset Password</Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Change your password</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Preferences</Text>

        {/* Theme Mode */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Theme Mode</Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => handleThemeChange('light')}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: theme === 'light' ? '#2563EB' : '#E5E7EB',
                backgroundColor: theme === 'light' ? '#F0F9FF' : '#FFFFFF',
              }}
            >
              <Sun size={24} color={theme === 'light' ? '#2563EB' : '#9CA3AF'} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme === 'light' ? '#2563EB' : '#6B7280', marginTop: 6 }}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleThemeChange('dark')}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: theme === 'dark' ? '#2563EB' : '#E5E7EB',
                backgroundColor: theme === 'dark' ? '#F0F9FF' : '#FFFFFF',
              }}
            >
              <Moon size={24} color={theme === 'dark' ? '#2563EB' : '#9CA3AF'} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme === 'dark' ? '#2563EB' : '#6B7280', marginTop: 6 }}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={{ marginTop: 24, paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Danger Zone</Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={20} color="#DC2626" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Logout</Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Sign out of your account</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} transparent animationType="slide" onRequestClose={() => setShowEditProfile(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Edit Profile</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Update your profile information</Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Username</Text>
                <TextInput
                  value={editedUsername}
                  onChangeText={setEditedUsername}
                  editable={!isUpdatingProfile}
                  style={{
                    width: '100%',
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: '#111827',
                    fontSize: 16,
                    opacity: isUpdatingProfile ? 0.6 : 1,
                  }}
                  placeholder="Enter username"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Email</Text>
                <TextInput
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  editable={!isUpdatingProfile}
                  keyboardType="email-address"
                  style={{
                    width: '100%',
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: '#111827',
                    fontSize: 16,
                    opacity: isUpdatingProfile ? 0.6 : 1,
                  }}
                  placeholder="Enter email"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity
                onPress={() => setShowEditProfile(false)}
                disabled={isUpdatingProfile}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  alignItems: 'center',
                  opacity: isUpdatingProfile ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEditProfile}
                disabled={isUpdatingProfile}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: '#2563EB',
                  alignItems: 'center',
                  opacity: isUpdatingProfile ? 0.6 : 1,
                }}
              >
                {isUpdatingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset Password Modal */}
      <Modal visible={showResetPassword} transparent animationType="slide" onRequestClose={() => setShowResetPassword(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Reset Password</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>A password reset link will be sent to {user?.email}</Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowResetPassword(false)}
                disabled={isResettingPassword}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  alignItems: 'center',
                  opacity: isResettingPassword ? 0.6 : 1,
                }}
              >
                <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isResettingPassword}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: '#2563EB',
                  alignItems: 'center',
                  opacity: isResettingPassword ? 0.6 : 1,
                }}
              >
                {isResettingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Modal */}
      <Modal visible={alert.visible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              minWidth: '80%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: 8,
              }}
            >
              {alert.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#6B7280',
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              {alert.message}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setAlert({
                  visible: false,
                  title: '',
                  message: '',
                })
              }
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: '#2563EB',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
