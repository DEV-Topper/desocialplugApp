import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CryptoPaymentProps {
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess?: () => void;
  onBack?: () => void;
  usdToNgnRate?: number;
}

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success';
}

export function CryptoPayment({
  userId,
  userName,
  userEmail,
  onSuccess,
  onBack,
  usdToNgnRate = 1500,
}: CryptoPaymentProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
  });

  const handleProceedToPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setAlert({
        visible: true,
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get API base URL from environment or storage
      let apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Try to get from AsyncStorage if not set in env
      if (!process.env.EXPO_PUBLIC_API_URL) {
        const storedUrl = await AsyncStorage.getItem('api_url');
        if (storedUrl) {
          apiUrl = storedUrl;
        }
      }

      // Ensure URLs end without trailing slash
      apiUrl = apiUrl.replace(/\/$/, '');

      // Construct callback and return URLs using the API base URL (same as website)
      const callbackUrl = `${apiUrl}/api/payments/heleket-webhook`;
      const returnUrl = `${apiUrl}/dashboard?payment=success`;

      console.log('Creating crypto payment with:', {
        userId,
        userName,
        userEmail,
        amount: parseFloat(amount),
        apiUrl,
        callbackUrl,
        returnUrl,
      });

      const response = await fetch(`${apiUrl}/api/payments/heleket-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          userEmail,
          amount: parseFloat(amount),
          currency: 'USD',
          callbackUrl,
          returnUrl,
        }),
      });

      const data = await response.json();

      console.log('Crypto payment response:', data);

      if (!response.ok || !data.payment_url) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setPaymentUrl(data.payment_url);
      setAlert({
        visible: true,
        title: 'Payment URL Created',
        message: 'Opening payment gateway...',
        type: 'success',
      });

      // Open payment URL after a short delay
      setTimeout(() => {
        handleOpenPaymentUrl(data.payment_url);
      }, 1500);

      onSuccess?.();
    } catch (error: any) {
      console.error('Payment creation error:', error);
      setAlert({
        visible: true,
        title: 'Payment Error',
        message: error.message || 'Failed to create payment',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentUrl = async (url: string) => {
    try {
      // Try to open with WebBrowser first (better UX for in-app)
      const result = await WebBrowser.openBrowserAsync(url);

      if (result.type === 'opened') {
        // Successfully opened
        console.log('Payment URL opened in browser');
      }
    } catch (error) {
      console.error('Error opening payment URL with WebBrowser:', error);
      // Fallback to Linking
      try {
        await Linking.openURL(url);
      } catch (fallbackError) {
        console.error('Error opening payment URL with Linking:', fallbackError);
        setAlert({
          visible: true,
          title: 'Error',
          message: 'Unable to open payment URL. Please try again.',
          type: 'error',
        });
      }
    }
  };

  const ngnAmount =
    amount && parseFloat(amount) > 0
      ? (parseFloat(amount) * usdToNgnRate).toLocaleString('en-NG', {
          maximumFractionDigits: 0,
        })
      : '0';

  return (
    <ScrollView style={{ flex: 1, marginBottom: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 16 }}>
        {/* Back button */}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}
          >
            <ChevronLeft size={16} color="#2563EB" />
            <Text style={{ color: '#2563EB', fontWeight: '600', fontSize: 14 }}>
              Back to payment methods
            </Text>
          </TouchableOpacity>
        )}

        {/* Crypto Payment Card */}
        <View
          style={{
            backgroundColor: '#FFF7ED',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#FECACA',
            padding: 20,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <Text style={{ fontSize: 32 }}>₿</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: '#1F2937', fontSize: 16 }}>
                Cryptocurrency Payment
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
                Pay with Bitcoin, Ethereum, USDT, or other cryptocurrencies
              </Text>
            </View>
          </View>

          {/* Amount Input */}
          <View
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
              Amount (USD)
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937' }}>$</Text>
              <TextInput
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!isLoading && !paymentUrl}
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: '#F3F4F6',
                  color: '#1F2937',
                  fontSize: 16,
                  opacity: isLoading || paymentUrl ? 0.6 : 1,
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Amount Details */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 12,
              }}
            >
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Minimum: $1.00</Text>
              {amount && parseFloat(amount) > 0 && (
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#2563EB' }}>
                  ≈ ₦{ngnAmount} NGN
                </Text>
              )}
            </View>
          </View>

          {/* Provider Info */}
          <View
            style={{
              backgroundColor: '#F0F9FF',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#93C5FD',
            }}
          >
            <Text style={{ fontSize: 12, color: '#1E40AF' }}>
              <Text style={{ fontWeight: '600' }}>Powered by: </Text>
              Heleket - Secure crypto payment gateway
            </Text>
          </View>

          {/* Action Button */}
          {!paymentUrl ? (
            <TouchableOpacity
              onPress={handleProceedToPayment}
              disabled={isLoading || !amount}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor:
                  isLoading || !amount ? '#E5E7EB' : '#F97316',
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                    Creating Payment...
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    color: amount && parseFloat(amount) > 0 ? '#FFFFFF' : '#9CA3AF',
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  Proceed to Payment
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View
              style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: '#D1FAE5',
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#047857', fontWeight: '600', fontSize: 16 }}>
                ✓ Payment URL Created
              </Text>
              <Text style={{ color: '#059669', fontSize: 12, marginTop: 4 }}>
                Opening payment gateway...
              </Text>
            </View>
          )}
        </View>
      </View>

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
