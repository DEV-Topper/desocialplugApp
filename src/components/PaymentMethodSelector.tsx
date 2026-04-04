import { Building2 } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PaymentMethodSelectorProps {
  onSelectBank: () => void;
  onSelectCrypto: () => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({
  onSelectBank,
  onSelectCrypto,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  return (
    <View style={{ width: '100%', gap: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: '#6B7280' }}>
          Select how you'd like to fund your wallet
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Bank Transfer Option */}
        <TouchableOpacity
          onPress={onSelectBank}
          disabled={isLoading}
          style={[
            {
              flex: 1,
              borderRadius: 16,
              padding: 20,
              borderWidth: 2,
              borderColor: '#93C5FD',
              backgroundColor: '#F0F9FF',
              opacity: isLoading ? 0.5 : 1,
            },
          ]}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: '#DBEAFE',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Building2 size={28} color="#2563EB" />
            </View>
            <Text style={{ fontWeight: '600', color: '#1F2937', fontSize: 14, marginBottom: 4 }}>
              Bank
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Virtual Account
            </Text>
          </View>
        </TouchableOpacity>

        {/* Crypto Option */}
        <TouchableOpacity
          onPress={onSelectCrypto}
          disabled={isLoading}
          style={[
            {
              flex: 1,
              borderRadius: 16,
              padding: 20,
              borderWidth: 2,
              borderColor: '#FED7AA',
              backgroundColor: '#FFF7ED',
              opacity: isLoading ? 0.5 : 1,
            },
          ]}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: '#FECACA',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>₿</Text>
            </View>
            <Text style={{ fontWeight: '600', color: '#1F2937', fontSize: 14, marginBottom: 4 }}>
              Crypto
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              BTC, ETH, etc.
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
