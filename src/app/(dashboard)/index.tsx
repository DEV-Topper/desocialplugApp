import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/auth.slice';
import { useGetUserQuery } from '../../store/api/user.api';
import { useGetPurchasesQuery } from '../../store/api/user.api';
import {
  Bell,
  CreditCard,
  Gem,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { PlatformSelector } from '../../components/dashboard/PlatformSelector';
import { CategoryTabs } from '../../components/dashboard/CategoryTabs';
import { AccountsList } from '../../components/dashboard/AccountsList';
import { COLORS } from '../../constants/theme';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 68;

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: userData } = useGetUserQuery();
  const { data: purchasesData } = useGetPurchasesQuery();

  const user = userData?.user;
  const balance = user?.walletBalance || 0;
  const referralBalance = user?.referralBalance || 0;
  const purchases = purchasesData?.purchases || [];
  const totalSpent = purchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'DS';

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Sticky Header */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.cardBorder,
          paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 0) + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo / Brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: COLORS.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 14 }}>D</Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.textPrimary }}>
            DeSocialPlug
          </Text>
        </View>

        {/* Right actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: COLORS.cardBorder,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.white,
            }}
          >
            <Bell size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: COLORS.primary,
            }}
            onPress={handleLogout}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 13 }}>
              {initials}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}
      >
        {/* Stats Section */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 10 }}>
          {/* Balance + Fund Wallet */}
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: COLORS.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CreditCard size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>
                  Total Balance
                </Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.textPrimary }}>
                  ₦{balance.toLocaleString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(dashboard)/add-funds')}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Fund Wallet</Text>
            </TouchableOpacity>
          </View>

          {/* Total Spent + Referral row */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: COLORS.primaryLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCard size={16} color={COLORS.primary} />
                </View>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Total Spent</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>
                ₦{totalSpent.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(dashboard)/referrals')}
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: COLORS.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Gem size={16} color={COLORS.primary} />
                  </View>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Referral</Text>
                </View>
                <ChevronRight size={16} color={COLORS.textMuted} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>
                ₦{referralBalance.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Selector */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onPlatformChange={(id) => {
              setSelectedPlatform(id);
              setSelectedCategory('all');
            }}
          />
        </View>

        {/* Category Tabs */}
        <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
          <CategoryTabs
            selectedPlatform={selectedPlatform}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </View>

        {/* Accounts List */}
        <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
          <AccountsList
            selectedPlatform={selectedPlatform}
            selectedCategory={selectedCategory}
          />
        </View>
      </ScrollView>
    </View>
  );
}
