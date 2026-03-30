import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { useGetPurchasesQuery } from '../../store/api/user.api';
import { ShoppingBag, X, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function PurchasesScreen() {
  const { data, isLoading } = useGetPurchasesQuery();
  const purchases = data?.purchases || [];
  const totalSpent = purchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);
  
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await Clipboard.setStringAsync(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCredentialText = (cred: any): string => {
    if (typeof cred === 'string') return cred;
    if (typeof cred === 'object' && (cred.username || cred.password)) {
      return `Username: ${cred.username || '—'}\nPassword: ${cred.password || '—'}`;
    }
    return JSON.stringify(cred, null, 2);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const renderPurchase = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3"
      onPress={() => {
        setSelectedPurchase(item);
        setIsModalOpen(true);
      }}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-bold text-gray-900 text-base">Order #{item.id?.slice(0, 8)}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {item.platform} • {item.followers?.toLocaleString() || '—'} followers
          </Text>
          <Text className="text-xs text-gray-400 mt-1">{formatDate(item.purchaseDate)}</Text>
        </View>
        <View className="items-end">
          <Text className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
            {item.status || 'Completed'}
          </Text>
          <Text className="font-bold text-gray-900 mt-1">₦{item.totalAmount?.toLocaleString() || '0'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Purchases</Text>
        <Text className="text-gray-500 mt-1">View your recent purchases and credentials.</Text>
      </View>

      <View className="flex-row gap-x-4 mb-6">
        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <Text className="text-sm text-gray-500">Total Spent</Text>
          <Text className="text-xl font-bold text-gray-900 mt-1">₦{totalSpent.toLocaleString()}</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <Text className="text-sm text-gray-500">Orders</Text>
          <Text className="text-xl font-bold text-gray-900 mt-1">{purchases.length}</Text>
        </View>
      </View>

      {purchases.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="bg-blue-50 p-6 rounded-full mb-4">
            <ShoppingBag size={48} className="text-blue-600" />
          </View>
          <Text className="text-gray-900 text-lg font-bold">No Purchases Yet</Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id}
          renderItem={renderPurchase}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-10"
        />
      )}

      {/* Details Modal */}
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalOpen(false)}>
        <View className="flex-1 bg-gray-50">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-white">
            <Text className="text-lg font-bold text-gray-900">Order #{selectedPurchase?.id?.slice(0, 8)}</Text>
            <TouchableOpacity onPress={() => setIsModalOpen(false)} className="p-2">
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4 flex-1">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-gray-900">Credentials ({selectedPurchase?.credentials?.length || 0})</Text>
                {selectedPurchase?.credentials?.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      const allText = selectedPurchase.credentials
                        .map((cred: any, idx: number) => `Log ${idx + 1}:\n${getCredentialText(cred)}`)
                        .join('\n\n');
                      copyToClipboard(allText, -1);
                    }}
                    className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
                  >
                    {copiedIndex === -1 ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="text-blue-600 mr-1" />}
                    <Text className="text-blue-700 text-sm">{copiedIndex === -1 ? 'Copied' : 'Copy All'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedPurchase?.credentials?.length > 0 ? (
                selectedPurchase.credentials.map((cred: any, idx: number) => {
                  const credText = getCredentialText(cred);
                  return (
                    <View key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 relative">
                      <Text className="text-gray-800 font-mono text-sm leading-5 pr-8">{credText}</Text>
                      <TouchableOpacity 
                        onPress={() => copyToClipboard(credText, idx)}
                        className="absolute right-3 top-3 p-1.5 bg-white rounded-md border border-gray-200"
                      >
                        {copiedIndex === idx ? <Check size={16} className="text-green-600" /> : <Copy size={16} color="#4b5563" />}
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <Text className="text-gray-500 text-center py-4">No credentials available.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
