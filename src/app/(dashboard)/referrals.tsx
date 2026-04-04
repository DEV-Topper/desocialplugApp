import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useGetReferralsQuery, useGetWithdrawalsQuery, useRequestWithdrawalMutation } from '../../store/api/user.api';
import { Users, Copy, Check, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error';
}

const defaultAlert: AlertState = { visible: false, title: '', message: '' };

export default function ReferralsScreen() {
  const { data: userData, isLoading: isLoadingUser, refetch: refetchUser } = useGetReferralsQuery();
  const { data: withdrawalsData, isLoading: isLoadingRequests, refetch: refetchWithdrawals } = useGetWithdrawalsQuery();
  const [requestWithdrawal, { isLoading: isSubmitting }] = useRequestWithdrawalMutation();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'referrals' | 'withdrawals'>('referrals');
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [alert, setAlert] = useState<AlertState>(defaultAlert);

  const referralData = userData?.data || { referrals: [], referralBalance: 0, referralCode: '' };
  const withdrawalRequests = withdrawalsData?.requests || [];

  const copyToClipboard = async (code: string) => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!withdrawBank || !withdrawAccountNumber || !withdrawAccountName) {
      showAlert('Error', 'Please fill in all bank details.');
      return;
    }
    if (isNaN(amount) || amount < 1000) {
      showAlert('Error', 'Minimum withdrawal amount is ₦1,000.');
      return;
    }
    if (amount > referralData.referralBalance) {
      showAlert('Error', 'Requested amount exceeds your referral balance.');
      return;
    }

    try {
      const res = await requestWithdrawal({
        amount,
        bankDetails: {
          bank: withdrawBank,
          accountNumber: withdrawAccountNumber,
          accountName: withdrawAccountName,
        }
      } as any).unwrap();

      if (res.success) {
        showAlert('Success', 'Withdrawal request submitted.', 'success');
        setShowWithdrawModal(false);
        refetchUser();
        refetchWithdrawals();
      } else {
        showAlert('Error', res.error || 'Failed to submit request');
      }
    } catch (err: any) {
      showAlert('Error', err.data?.error || 'Failed to submit request');
    }
  };

  if (isLoadingUser) {
    return <ActivityIndicator size="large" color="#2563EB" className="mt-10" />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-6">Referral Program</Text>

        {/* Stats */}
        <View className="flex-row gap-x-4 mb-4">
          <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <Text className="text-gray-500 mb-2 font-medium">Total Referrals</Text>
            <Text className="text-3xl font-bold text-gray-900">{referralData.referrals.length}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <Text className="text-gray-500 mb-2 font-medium">Total Earnings</Text>
            <Text className="text-3xl font-bold text-gray-900">₦{referralData.referralBalance.toLocaleString()}</Text>
          </View>
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity 
          disabled={referralData.referralBalance < 1000}
          onPress={() => {
            setWithdrawAmount(String(referralData.referralBalance));
            setShowWithdrawModal(true);
          }}
          className={`mb-6 p-4 rounded-xl items-center flex-row justify-center ${referralData.referralBalance >= 1000 ? 'bg-green-600' : 'bg-gray-300'}`}
        >
          <CreditCard size={20} className={referralData.referralBalance >= 1000 ? "text-white mr-2" : "text-gray-500 mr-2"} />
          <Text className={`font-bold text-lg ${referralData.referralBalance >= 1000 ? 'text-white' : 'text-gray-500'}`}>
            Withdraw Balance
          </Text>
        </TouchableOpacity>

        {/* Referral Code */}
        <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Your Referral Link</Text>
          <View className="flex-row items-center gap-x-3">
            <View className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Text className="text-gray-800 font-mono text-sm" numberOfLines={1}>{referralData.referralCode || 'Not generated'}</Text>
            </View>
            <TouchableOpacity 
              disabled={!referralData.referralCode}
              onPress={() => copyToClipboard(referralData.referralCode)}
              className="bg-blue-600 p-4 rounded-xl"
            >
              {copied ? <Check size={20} color="#fff" /> : <Copy size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity 
              onPress={() => setActiveTab('referrals')}
              className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'referrals' ? 'border-blue-600' : 'border-transparent'}`}
            >
              <Text className={`font-medium ${activeTab === 'referrals' ? 'text-blue-600' : 'text-gray-500'}`}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('withdrawals')}
              className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'withdrawals' ? 'border-blue-600' : 'border-transparent'}`}
            >
              <Text className={`font-medium ${activeTab === 'withdrawals' ? 'text-blue-600' : 'text-gray-500'}`}>Withdrawals</Text>
            </TouchableOpacity>
          </View>

          <View className="p-4">
            {activeTab === 'referrals' ? (
              referralData.referrals.length === 0 ? (
                <Text className="text-center text-gray-500 py-6">No referrals yet</Text>
              ) : (
                referralData.referrals.map((ref: any, idx: number) => (
                  <View key={idx} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <View className="flex-row items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      <Text className="text-gray-900 font-medium">{ref.username || 'User'}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-gray-900 font-bold">₦{ref.earnings}</Text>
                      <Text className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1">Active</Text>
                    </View>
                  </View>
                ))
              )
            ) : (
             isLoadingRequests ? (
               <ActivityIndicator color="#2563EB" className="py-6" />
             ) : withdrawalRequests.length === 0 ? (
               <Text className="text-center text-gray-500 py-6">No withdrawal requests yet</Text>
             ) : (
               withdrawalRequests.map((req: any, idx: number) => (
                 <View key={idx} className="py-3 border-b border-gray-100 last:border-b-0">
                    <View className="flex-row justify-between mb-1">
                      <Text className="font-bold text-gray-900">₦{req.amount.toLocaleString()}</Text>
                      <Text className={`text-xs px-2 py-1 rounded font-medium ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'Successful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {req.status}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm">{req.bank} • {req.accountNumber}</Text>
                    <Text className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</Text>
                 </View>
               ))
             )
            )}
          </View>
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <Text className="text-xl font-bold text-gray-900 mb-4">Withdraw Balance</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Bank Name</Text>
                <TextInput value={withdrawBank} onChangeText={setWithdrawBank} className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50" placeholder="e.g. Access Bank" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Account Number</Text>
                <TextInput value={withdrawAccountNumber} onChangeText={setWithdrawAccountNumber} keyboardType="numeric" className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50" placeholder="0123456789" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Account Name</Text>
                <TextInput value={withdrawAccountName} onChangeText={setWithdrawAccountName} className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50" placeholder="John Doe" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Amount (₦)</Text>
                <TextInput value={withdrawAmount} onChangeText={setWithdrawAmount} keyboardType="numeric" className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50" />
                <Text className="text-xs text-gray-500 mt-1">Available: ₦{referralData.referralBalance.toLocaleString()}</Text>
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)} className="flex-1 py-3 rounded-xl bg-gray-200 items-center">
                <Text className="text-gray-800 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                disabled={isSubmitting}
                onPress={handleWithdraw} 
                className={`flex-1 flex-row py-3 rounded-xl items-center justify-center ${isSubmitting ? 'bg-green-400' : 'bg-green-600'}`}
              >
                {isSubmitting && <ActivityIndicator color="#fff" size="small" className="mr-2" />}
                <Text className="text-white font-bold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Modal */}
      <Modal visible={alert.visible} transparent animationType="fade" onRequestClose={() => setAlert(defaultAlert)}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl w-full max-w-sm p-6">
            <View className="items-center mb-4">
              {alert.type === 'success' ? (
                <CheckCircle size={48} color="#16a34a" />
              ) : (
                <XCircle size={48} color="#dc2626" />
              )}
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">{alert.title}</Text>
            <Text className="text-gray-500 text-center mb-6">{alert.message}</Text>
            <TouchableOpacity onPress={() => setAlert(defaultAlert)} className="py-3 rounded-xl bg-blue-600 items-center">
              <Text className="text-white font-semibold">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
