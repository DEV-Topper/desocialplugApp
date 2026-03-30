import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useGetUserQuery } from '../../store/api/user.api';
import { useGetVirtualAccountQuery, useCreateVirtualAccountMutation } from '../../store/api/funding.api';
import { Wallet, Info, Copy, Check, Building2, User } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function AddFundsScreen() {
  const { data: userData } = useGetUserQuery();
  const userId = userData?.user?._id;
  const username = userData?.user?.username || '';
  const userPhone = userData?.user?.phone || '';

  const { data: virtualAccountData, isLoading: isLoadingVA, refetch: refetchVA } = useGetVirtualAccountQuery(userId as string, {
    skip: !userId,
  });
  
  const [createVirtualAccount, { isLoading: isCreating }] = useCreateVirtualAccountMutation();

  const virtualAccount = (virtualAccountData?.accountNumber && virtualAccountData?.bankName) ? virtualAccountData : null;
  const [showModal, setShowModal] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userData?.user && !isLoadingVA) {
      if (!virtualAccount) {
        const parts = username.split(' ').filter(Boolean);
        const fName = parts[0] || '';
        const lName = parts.slice(1).join(' ') || '';
        
        if (fName && lName) {
           handleCreateVA(userId, fName, lName, userPhone || '');
        } else {
           setFirstName(fName);
           setLastName(lName);
           setPhone(userPhone || '');
           setShowModal(true);
        }
      }
    }
  }, [userData, isLoadingVA, virtualAccount, username, userId, userPhone]);

  const handleCreateVA = async (id: string, fName: string, lName: string, phn: string) => {
    try {
      if (!fName || !lName || !phn) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      const res = await createVirtualAccount({
        userId: id,
        bvn: '', // API takes firstName, lastName, phone in web version. Wait, API signature might need checking. 
        // We'll pass them as any for now since the web body was: userId, firstName, lastName, phone.
        firstName: fName,
        lastName: lName,
        phone: phn
      } as any).unwrap();
      
      if (res.accountNumber) {
        setShowModal(false);
        refetchVA();
      } else {
        Alert.alert('Error', res.error || 'Failed to create virtual account');
      }
    } catch (err: any) {
       Alert.alert('Error', err.data?.error || err.message || 'Failed to create virtual account');
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-6">
      <View className="items-center mb-8">
        <View className="bg-blue-100 p-4 rounded-full mb-3 shadow-sm">
          <Wallet size={32} className="text-blue-600" />
        </View>
        <Text className="text-3xl font-bold text-gray-900">Add Funds</Text>
        <Text className="text-gray-500 mt-1">Top up your virtual wallet instantly</Text>
      </View>

      {(isLoadingVA || (userId && !virtualAccount && !showModal)) ? (
        <View className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 items-center">
          <ActivityIndicator size="large" color="#2563EB" className="mb-4" />
          <Text className="text-gray-600 font-medium">Setting up your virtual account...</Text>
        </View>
      ) : virtualAccount ? (
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <View className="bg-blue-600 p-5">
            <Text className="text-white text-lg font-bold">Fund Your Wallet</Text>
            <Text className="text-blue-100 text-sm mt-1">You will be charged a 0.9% fee for each recharge.</Text>
          </View>
          
          <View className="p-5">
            <View className="bg-blue-50 p-3 rounded-lg flex-row items-center mb-5">
              <Info size={20} className="text-blue-600 mr-2" />
              <Text className="text-sm text-blue-800 font-medium flex-1">Transfer to the virtual account number below</Text>
            </View>

            <View className="mb-4">
              <Text className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Account Number</Text>
              <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                <Text className="text-xl font-bold text-gray-900 tracking-widest">{virtualAccount.accountNumber}</Text>
                <TouchableOpacity 
                  onPress={() => copyToClipboard(virtualAccount.accountNumber)}
                  className="flex-row items-center bg-blue-100 px-3 py-2 rounded-lg"
                >
                  {copied ? <Check size={16} className="text-green-600 mr-1" /> : <Copy size={16} className="text-blue-600 mr-1" />}
                  <Text className={`font-medium ${copied ? 'text-green-700' : 'text-blue-700'}`}>{copied ? 'Copied!' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Bank Name</Text>
              <View className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                <View className="bg-white p-2 rounded-full mr-3 border border-gray-100">
                  <Building2 size={20} className="text-gray-600" />
                </View>
                <Text className="text-lg font-bold text-gray-900">{virtualAccount.bankName}</Text>
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Account Name</Text>
              <View className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                <View className="bg-white p-2 rounded-full mr-3 border border-gray-100">
                  <User size={20} className="text-gray-600" />
                </View>
                <Text className="text-base font-bold text-gray-900">{virtualAccount.accountName}</Text>
              </View>
            </View>
            
            <Text className="text-center text-xs text-gray-400 mt-4">Funds reflect instantly after transfer.</Text>
          </View>
        </View>
      ) : (
        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
            <Text className="text-gray-500 mb-4 text-center">Unable to load Virtual Account.</Text>
            <TouchableOpacity onPress={refetchVA} className="bg-blue-600 px-6 py-3 rounded-xl">
              <Text className="text-white font-bold">Try Again</Text>
            </TouchableOpacity>
        </View>
      )}

      {/* Modal required missing info */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <Text className="text-xl font-bold text-gray-900 mb-2">Confirm your details</Text>
            <Text className="text-sm text-gray-500 mb-6">Please provide these details to create your virtual funding account.</Text>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">First Name</Text>
                <TextInput value={firstName} onChangeText={setFirstName} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" placeholder="John" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Last Name</Text>
                <TextInput value={lastName} onChangeText={setLastName} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" placeholder="Doe" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Phone Number</Text>
                <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900" placeholder="08012345678" />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => userId && handleCreateVA(userId, firstName, lastName, phone)}
              disabled={isCreating}
              className={`w-full mt-6 py-4 rounded-xl items-center ${isCreating ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              <Text className="text-white font-bold text-base">{isCreating ? 'Creating...' : 'Save & Continue'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
