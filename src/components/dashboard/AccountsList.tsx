import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useGetAccountsQuery, usePurchaseAccountMutation } from '../../store/api/accounts.api';
import { useGetUserQuery } from '../../store/api/user.api';
import { 
  Camera, 
  MessageSquare, 
  Music, 
  Hash, 
  Briefcase, 
  Mic, 
  Ghost, 
  Shield, 
  Mail,
  MoreHorizontal 
} from 'lucide-react-native';

interface AccountsListProps {
  selectedPlatform: string;
  selectedCategory: string;
}

const getPlatformIcon = (platform: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram') || p.includes('ig') || p === 'instagram') return Camera;
  if (p.includes('facebook') || p.includes('fb') || p === 'facebook') return MessageSquare;
  if (p.includes('tiktok') || p.includes('tik tok') || p === 'tiktok') return Music;
  if (p.includes('x') || p.includes('twitter') || p === 'twitter' || p === 'x') return Hash;
  if (p.includes('linkedin') || p === 'linkedin') return Briefcase;
  if (p.includes('google') || p.includes('voice') || p === 'google voice') return Mic;
  if (p.includes('snapchat') || p.includes('snap') || p === 'snapchat') return Ghost;
  if (p.includes('vpn') || p === 'vpn') return Shield;
  if (p.includes('mail') || p.includes('email') || p.includes('gmail')) return Mail;
  return MoreHorizontal;
};

// Simplified main platform logic from web
const mainPlatforms = ['instagram', 'facebook', 'tiktok', 'x', 'twitter', 'linkedin', 'google', 'snapchat', 'vpn'];

const getPlatformKeyForGrouping = (platform: string): string => {
  const p = platform.toLowerCase();
  if (p.includes('instagram') || p.includes('ig')) return 'instagram';
  if (p.includes('facebook') || p.includes('fb')) return 'facebook';
  if (p.includes('tiktok') || p.includes('tik tok')) return 'tiktok';
  if (p.includes('x') || p.includes('twitter')) return 'x';
  if (p.includes('linkedin')) return 'linkedin';
  if (p.includes('google') || p.includes('voice')) return 'google';
  if (p.includes('snapchat') || p.includes('snap')) return 'snapchat';
  if (p.includes('vpn')) return 'vpn';
  return 'other';
};

export function AccountsList({ selectedPlatform, selectedCategory }: AccountsListProps) {
  const { data, isLoading } = useGetAccountsQuery();
  const { data: userData } = useGetUserQuery();
  const [purchaseAccount, { isLoading: isPurchasing }] = usePurchaseAccountMutation();
  
  const accounts = data?.accounts || (Array.isArray(data) ? data : []);
  const userBalance = userData?.user?.walletBalance || 0;

  const filteredAccounts = accounts.filter((acc: any) => {
    if (!acc.platform) return false;

    const normalizedPlatform = acc.platform.toLowerCase().trim();
    const platformKey = getPlatformKeyForGrouping(acc.platform);

    let platformMatch = false;
    if (selectedPlatform === 'all') {
      platformMatch = true;
    } else if (selectedPlatform === 'other') {
      const isMainPlatform = mainPlatforms.some((mainPlatform) =>
        normalizedPlatform.includes(mainPlatform.toLowerCase())
      );
      platformMatch = !isMainPlatform;
    } else {
      platformMatch = platformKey === selectedPlatform || normalizedPlatform.includes(selectedPlatform.toLowerCase());
    }

    let categoryMatch = true;
    if (selectedCategory && selectedCategory !== 'all') {
      const accountSubcategory = (acc.subcategory || 'Uncategorized').toLowerCase().trim();
      const selectedCategoryLower = selectedCategory.toLowerCase().trim();
      categoryMatch = accountSubcategory === selectedCategoryLower;
    }

    return platformMatch && categoryMatch;
  });

  const handleBuy = async (account: any) => {
    if (userBalance < account.price) {
      Alert.alert('Insufficient Balance', `You need at least ₦${account.price} to purchase.\nYour balance: ₦${userBalance}`);
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to buy 1 log of ${account.platform} for ₦${account.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            try {
              const res = await purchaseAccount({ accountId: account.id, quantity: 1 }).unwrap();
              if (res.success) {
                Alert.alert('Success', 'Account purchased successfully!');
              } else {
                Alert.alert('Error', res.error || 'Failed to purchase');
              }
            } catch (err: any) {
              Alert.alert('Error', err.data?.error || 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#2563EB" className="mt-8" />;
  }

  if (filteredAccounts.length === 0) {
    return (
      <View className="py-12 items-center justify-center">
        <Text className="text-gray-500 font-medium">No accounts found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const Icon = getPlatformIcon(item.platform);
    const stockColor = item.logs === 0 ? 'bg-red-100 text-red-600' : item.logs <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

    return (
      <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="bg-blue-50 p-2 rounded-full mr-3">
              <Icon size={24} className="text-blue-600" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-lg">{item.platform}</Text>
              <Text className="text-gray-500 text-sm">
                Followers: {item.followers} • Mail: {item.mailIncluded ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        </View>

        {item.description && (
          <View className="bg-gray-50 p-3 rounded-lg mb-4 text-gray-600">
            <Text className="text-sm font-medium">{item.description}</Text>
          </View>
        )}

        <View className="flex-row items-center justify-between mt-2">
          <View>
            <Text className="text-sm text-gray-500 mb-1">Price per log</Text>
            <Text className="text-2xl font-bold text-gray-900">₦{item.price.toLocaleString()}</Text>
          </View>

          <View className="items-end">
            <Text className={`px-2 py-1 rounded text-xs font-bold mb-2 ${stockColor}`}>
              Stock: {item.logs} logs
            </Text>
            <TouchableOpacity 
              onPress={() => handleBuy(item)}
              disabled={item.logs === 0 || isPurchasing}
              className={`px-6 py-3 rounded-full ${item.logs === 0 ? 'bg-gray-300' : 'bg-blue-600'}`}
            >
              <Text className="text-white font-bold ml-1">
                {item.logs === 0 ? 'Out of Stock' : 'Buy Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={filteredAccounts}
      keyExtractor={(item) => item.id || Math.random().toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      contentContainerClassName="pb-10"
    />
  );
}
