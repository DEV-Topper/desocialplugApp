import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { Building2, Check, Copy, Info, User, Wallet, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CryptoPayment } from '../../components/CryptoPayment';
import { PaymentMethodSelector } from '../../components/PaymentMethodSelector';
import { useCreateVirtualAccountMutation, useGetVirtualAccountQuery } from '../../store/api/funding.api';
import { useGetUserQuery } from '../../store/api/user.api';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
}

const defaultAlert: AlertState = { visible: false, title: '', message: '' };

export default function AddFundsScreen() {
  const { data: userData } = useGetUserQuery();
  const { method } = useLocalSearchParams<{ method?: string }>();
  const userId = userData?.user?._id;
  const username = userData?.user?.username || '';
  const userPhone = userData?.user?.phone || '';

  const { data: virtualAccountData, isLoading: isLoadingVA, refetch: refetchVA } = useGetVirtualAccountQuery(userId as string, {
    skip: !userId,
  });
  
  const [createVirtualAccount, { isLoading: isCreating }] = useCreateVirtualAccountMutation();

  const virtualAccount = (virtualAccountData?.accountNumber && virtualAccountData?.bankName) ? virtualAccountData : null;
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<AlertState>(defaultAlert);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Payment method state - initialize from route parameter
  const initialMethod = method as 'bank' | 'crypto' | null;
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'crypto' | null>(initialMethod);
  const [showSelectorModal, setShowSelectorModal] = useState(false);

  // Update payment method when route parameter changes
  useEffect(() => {
    if (method) {
      setPaymentMethod(method as 'bank' | 'crypto');
    }
  }, [method]);

  useEffect(() => {
    if (userData?.user && !isLoadingVA) {
      if (!virtualAccount && paymentMethod === 'bank') {
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
  }, [userData, isLoadingVA, virtualAccount, username, userId, userPhone, paymentMethod]);

  // Show selector modal when no payment method is selected
  useEffect(() => {
    if (!paymentMethod) {
      setShowSelectorModal(true);
    } else {
      setShowSelectorModal(false);
    }
  }, [paymentMethod]);

  const handleCreateVA = async (id: string, fName: string, lName: string, phn: string) => {
    try {
      if (!fName || !lName || !phn) {
        setAlert({ visible: true, title: 'Error', message: 'Please fill in all fields' });
        return;
      }
      
      const res = await createVirtualAccount({
        userId: id,
        bvn: '',
        firstName: fName,
        lastName: lName,
        phone: phn
      } as any).unwrap();
      
      if (res.accountNumber) {
        setShowModal(false);
        refetchVA();
      } else {
        setAlert({ visible: true, title: 'Error', message: res.error || 'Failed to create virtual account' });
      }
    } catch (err: any) {
       setAlert({ visible: true, title: 'Error', message: err.data?.error || err.message || 'Failed to create virtual account' });
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 56 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{ backgroundColor: '#DBEAFE', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <Wallet size={32} color="#2563EB" />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827' }}>Add Funds</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
          {paymentMethod ? 'Complete your payment' : 'Choose your payment method'}
        </Text>
      </View>

      {/* Payment Method Selector Modal */}
      <Modal
        visible={showSelectorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSelectorModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 32 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                Choose Payment Method
              </Text>
            </View>
            <PaymentMethodSelector
              onSelectBank={() => {
                setShowSelectorModal(false);
                setPaymentMethod('bank');
              }}
              onSelectCrypto={() => {
                setShowSelectorModal(false);
                setPaymentMethod('crypto');
              }}
            />
            <TouchableOpacity
              onPress={() => setShowSelectorModal(false)}
              style={{ marginTop: 24, paddingVertical: 12 }}
            >
              <Text style={{ textAlign: 'center', color: '#6B7280', fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bank Transfer View */}
      {paymentMethod === 'bank' && (
        <>
          {(isLoadingVA || (userId && !virtualAccount && !showModal)) ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#2563EB" style={{ marginBottom: 16 }} />
              <Text style={{ color: '#4B5563', fontWeight: '600', fontSize: 16 }}>Setting up your virtual account...</Text>
            </View>
          ) : virtualAccount ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden', marginBottom: 32 }}>
              <View style={{ backgroundColor: '#2563EB', padding: 20 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>Fund Your Wallet</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, marginTop: 4 }}>You will be charged a 0.9% fee for each recharge.</Text>
              </View>
              
              <View style={{ padding: 20 }}>
                <View style={{ backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#93C5FD' }}>
                  <Info size={20} color="#2563EB" style={{ marginRight: 12 }} />
                  <Text style={{ fontSize: 13, color: '#1E40AF', fontWeight: '500', flex: 1 }}>Transfer to the virtual account number below</Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Number</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', letterSpacing: 2 }}>{virtualAccount.accountNumber}</Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(virtualAccount.accountNumber)}
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                    >
                      {copied ? <Check size={16} color="#16A34A" style={{ marginRight: 6 }} /> : <Copy size={16} color="#2563EB" style={{ marginRight: 6 }} />}
                      <Text style={{ fontWeight: '600', color: copied ? '#16A34A' : '#2563EB', fontSize: 13 }}>{copied ? 'Copied!' : 'Copy'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bank Name</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                    <View style={{ backgroundColor: '#FFFFFF', padding: 8, borderRadius: 100, marginRight: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <Building2 size={20} color="#4B5563" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>{virtualAccount.bankName}</Text>
                  </View>
                </View>

                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Name</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                    <View style={{ backgroundColor: '#FFFFFF', padding: 8, borderRadius: 100, marginRight: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <User size={20} color="#4B5563" />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{virtualAccount.accountName}</Text>
                  </View>
                </View>
                
                <Text style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>Funds reflect instantly after transfer.</Text>
              </View>

              {/* Back Button */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', padding: 16 }}>
                <TouchableOpacity
                  onPress={() => setPaymentMethod(null)}
                  style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' }}
                >
                  <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 14 }}>Back to Payment Methods</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: 'center' }}>
                <XCircle size={48} color="#DC2626" style={{ marginBottom: 16 }} />
                <Text style={{ color: '#6B7280', marginBottom: 16, textAlign: 'center', fontSize: 14 }}>Unable to load Virtual Account.</Text>
                <TouchableOpacity onPress={refetchVA} style={{ backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Try Again</Text>
                </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Crypto Payment View */}
      {paymentMethod === 'crypto' && userData?.user && (
        <View style={{ marginBottom: 32 }}>
          <CryptoPayment
            userId={userData.user._id}
            userName={userData.user.username}
            userEmail={userData.user.email}
            onSuccess={() => {
              setAlert({
                visible: true,
                title: 'Success',
                message: 'Payment completed successfully! Your funds will be added shortly.',
              });
              setTimeout(() => {
                setPaymentMethod(null);
              }, 2000);
            }}
            onBack={() => setPaymentMethod(null)}
            usdToNgnRate={1500}
          />
        </View>
      )}

      {/* Modal for missing info */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Confirm your details</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Please provide these details to create your virtual funding account.</Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>First Name</Text>
                <TextInput 
                  value={firstName} 
                  onChangeText={setFirstName} 
                  style={{ width: '100%', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#111827', fontSize: 16 }} 
                  placeholder="John" 
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Last Name</Text>
                <TextInput 
                  value={lastName} 
                  onChangeText={setLastName} 
                  style={{ width: '100%', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#111827', fontSize: 16 }} 
                  placeholder="Doe" 
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Phone Number</Text>
                <TextInput 
                  value={phone} 
                  onChangeText={setPhone} 
                  keyboardType="phone-pad" 
                  style={{ width: '100%', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#111827', fontSize: 16 }} 
                  placeholder="08012345678" 
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => userId && handleCreateVA(userId, firstName, lastName, phone)}
              disabled={isCreating}
              style={{ width: '100%', marginTop: 24, paddingVertical: 14, borderRadius: 8, backgroundColor: isCreating ? '#93C5FD' : '#2563EB', alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                {isCreating ? 'Creating...' : 'Save & Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Alert Modal */}
      <Modal visible={alert.visible} transparent animationType="fade" onRequestClose={() => setAlert(defaultAlert)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 320, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, alignItems: 'center' }}>
            <XCircle size={48} color="#DC2626" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' }}>{alert.title}</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>{alert.message}</Text>
            <TouchableOpacity 
              onPress={() => setAlert(defaultAlert)} 
              style={{ paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, backgroundColor: '#2563EB', width: '100%', alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

