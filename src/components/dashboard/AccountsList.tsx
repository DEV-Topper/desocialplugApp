import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
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
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ShoppingCart,
  Users,
  MailCheck,
  Tag,
  Layers,
} from 'lucide-react-native';

interface AccountsListProps {
  selectedPlatform: string;
  selectedCategory: string;
}

interface ModalState {
  visible: boolean;
  type: 'info' | 'confirm' | 'result' | 'detail';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  resultType?: 'success' | 'error';
  account?: any;
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

const defaultModal: ModalState = { visible: false, type: 'info', title: '', message: '' };

const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <View className="flex-row items-center py-3 border-b border-gray-100">
    <View className="bg-blue-50 p-2 rounded-lg mr-3">
      <Icon size={18} className="text-blue-600" />
    </View>
    <Text className="text-gray-500 text-sm flex-1">{label}</Text>
    <Text className="text-gray-900 font-semibold text-sm">{value}</Text>
  </View>
);

export function AccountsList({ selectedPlatform, selectedCategory }: AccountsListProps) {
  const { data, isLoading } = useGetAccountsQuery();
  const { data: userData } = useGetUserQuery();
  const [purchaseAccount, { isLoading: isPurchasing }] = usePurchaseAccountMutation();
  const [modal, setModal] = useState<ModalState>(defaultModal);
  const [pendingAccount, setPendingAccount] = useState<any>(null);

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

  const closeModal = () => {
    setModal(defaultModal);
    setPendingAccount(null);
  };

  const handleShowDetail = (account: any) => {
    setModal({
      visible: true,
      type: 'detail',
      title: '',
      message: '',
      account,
    });
  };

  const handleBuyFromDetail = (account: any) => {
    closeModal();
    if (userBalance < account.price) {
      setModal({
        visible: true,
        type: 'info',
        title: 'Insufficient Balance',
        message: `You need at least ₦${account.price} to purchase.\nYour balance: ₦${userBalance}`,
      });
      return;
    }

    setPendingAccount(account);
    setModal({
      visible: true,
      type: 'confirm',
      title: 'Confirm Purchase',
      message: `Are you sure you want to buy 1 log of ${account.platform} for ₦${account.price}?`,
      confirmText: 'Buy',
      cancelText: 'Cancel',
      onConfirm: () => executePurchase(account),
    });
  };

  const executePurchase = async (account: any) => {
    closeModal();
    try {
      const res = await purchaseAccount({ accountId: account.id, quantity: 1 }).unwrap();
      if (res.success) {
        setModal({
          visible: true,
          type: 'result',
          title: 'Success',
          message: 'Account purchased successfully!',
          resultType: 'success',
        });
      } else {
        setModal({
          visible: true,
          type: 'result',
          title: 'Error',
          message: res.error || 'Failed to purchase',
          resultType: 'error',
        });
      }
    } catch (err: any) {
      setModal({
        visible: true,
        type: 'result',
        title: 'Error',
        message: err.data?.error || 'An unexpected error occurred',
        resultType: 'error',
      });
    }
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
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleShowDetail(item)}
        className="bg-white px-4 py-3 rounded-xl mb-2 shadow-sm border border-gray-100 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-50 p-2 rounded-full mr-3">
            <Icon size={20} className="text-blue-600" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-base">{item.platform}</Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <Text className={`px-2 py-0.5 rounded text-xs font-bold ${stockColor}`}>
                {item.logs} logs
              </Text>
              {item.mailIncluded && (
                <Text className="text-xs text-blue-600 font-medium">Mail included</Text>
              )}
            </View>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-gray-900">₦{item.price.toLocaleString()}</Text>
          <TouchableOpacity
            onPress={() => handleShowDetail(item)}
            className="bg-blue-600 px-4 py-1.5 rounded-full mt-1"
          >
            <Text className="text-white text-xs font-bold">Buy</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View>
        {filteredAccounts.map((item: any) => (
          <View key={item.id || Math.random().toString()}>
            {renderItem({ item })}
          </View>
        ))}
      </View>

      <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={closeModal}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          {modal.type === 'detail' && modal.account ? (
            <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
              {/* Header */}
              <View className="bg-blue-600 px-5 py-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-white/20 p-2 rounded-full mr-3">
                    {(() => {
                      const DetailIcon = getPlatformIcon(modal.account.platform);
                      return <DetailIcon size={24} color="#fff" />;
                    })()}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{modal.account.platform}</Text>
                    <Text className="text-white/80 text-xs">
                      {modal.account.subcategory || 'General'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeModal} className="bg-white/20 p-1.5 rounded-full">
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Details */}
              <ScrollView className="px-5 py-4" style={{ maxHeight: 320 }}>
                <DetailRow icon={Tag} label="Price per log" value={`₦${(modal.account.price || 0).toLocaleString()}`} />
                <DetailRow icon={Layers} label="Stock" value={`${modal.account.logs} ${modal.account.logs === 1 ? 'log' : 'logs'}`} />
                <DetailRow icon={Users} label="Followers" value={`${modal.account.followers || 'N/A'}`} />
                <DetailRow icon={MailCheck} label="Mail Included" value={modal.account.mailIncluded ? 'Yes' : 'No'} />
                {modal.account.description ? (
                  <View className="py-3 border-b border-gray-100">
                    <Text className="text-gray-500 text-sm mb-1">Description</Text>
                    <Text className="text-gray-900 font-medium text-sm leading-5">{modal.account.description}</Text>
                  </View>
                ) : null}
              </ScrollView>

              {/* Actions */}
              <View className="px-5 py-4 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => handleBuyFromDetail(modal.account)}
                  disabled={modal.account.logs === 0}
                  className={`py-3.5 rounded-xl items-center ${modal.account.logs === 0 ? 'bg-gray-300' : 'bg-blue-600'}`}
                >
                  <View className="flex-row items-center gap-2">
                    <ShoppingCart size={18} color="#fff" />
                    <Text className="text-white font-bold text-base">
                      {modal.account.logs === 0 ? 'Out of Stock' : 'Buy Now'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-2xl w-full max-w-sm p-6">
              <View className="items-center mb-4">
                {modal.resultType === 'success' ? (
                  <CheckCircle size={48} color="#16a34a" />
                ) : modal.resultType === 'error' ? (
                  <XCircle size={48} color="#dc2626" />
                ) : (
                  <AlertCircle size={48} color="#2563eb" />
                )}
              </View>

              <Text className="text-xl font-bold text-gray-900 text-center mb-2">{modal.title}</Text>
              <Text className="text-gray-500 text-center mb-6">{modal.message}</Text>

              {modal.type === 'confirm' ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={closeModal}
                    className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
                  >
                    <Text className="text-gray-700 font-semibold">{modal.cancelText || 'Cancel'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const confirm = modal.onConfirm;
                      closeModal();
                      confirm?.();
                    }}
                    className="flex-1 py-3 rounded-xl bg-blue-600 items-center"
                  >
                    <Text className="text-white font-semibold">{modal.confirmText || 'OK'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={closeModal}
                  className="py-3 rounded-xl bg-blue-600 items-center"
                >
                  <Text className="text-white font-semibold">OK</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
