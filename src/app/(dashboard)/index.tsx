import { useRouter } from 'expo-router';
import {
    Bell,
    ChevronRight,
    CreditCard,
    Edit2,
    Gem,
    LogOut,
    Moon,
    Sun,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AccountsList } from '../../components/dashboard/AccountsList';
import { CategoryTabs } from '../../components/dashboard/CategoryTabs';
import { PlatformSelector } from '../../components/dashboard/PlatformSelector';
import { PaymentMethodSelector } from '../../components/PaymentMethodSelector';
import { COLORS } from '../../constants/theme';
import { useCurrency } from '../../context/CurrencyContext';
import {
    useGetNotificationsQuery,
    useGetPurchasesQuery,
    useGetUserQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation
} from '../../store/api/user.api';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/auth.slice';

// Floating tab bar: 72px height + 8px bottom offset + safe area (~40px) = ~120px
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 128 : 100;

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modals state
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showPaymentMethodSelector, setShowPaymentMethodSelector] = useState(false);

  const { data: userData } = useGetUserQuery();
  const { data: purchasesData } = useGetPurchasesQuery();
  const { data: notificationsData } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const { formatAmount, currency, setCurrency } = useCurrency();

  const user = userData?.user;
  const balance = user?.walletBalance || 0;
  const referralBalance = user?.referralBalance || 0;
  const purchases = purchasesData?.purchases || [];
  const totalSpent = purchases.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.read) {
      await markRead(n.id);
    }
    setSelectedNotification(n);
  };

  const handleMarkAllAsRead = async () => {
    await markAllRead();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
          zIndex: 50,
        }}
      >
        {/* Logo / Brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
        </View>

        {/* Right actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

          {/* Currency Switcher */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 }}>
            <TouchableOpacity
              onPress={() => setCurrency('NGN')}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: currency === 'NGN' ? COLORS.white : 'transparent',
                shadowColor: currency === 'NGN' ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: currency === 'NGN' ? 2 : 0,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: currency === 'NGN' ? COLORS.primary : COLORS.textSecondary }}>NGN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrency('USD')}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: currency === 'USD' ? COLORS.white : 'transparent',
                shadowColor: currency === 'USD' ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: currency === 'USD' ? 2 : 0,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: currency === 'USD' ? COLORS.primary : COLORS.textSecondary }}>USD</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowNotificationsDropdown(true)}
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
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: 'red',
                width: 16,
                height: 16,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
              </View>
            )}
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
              overflow: 'hidden'
            }}
            onPress={() => setShowProfileMenu(true)}
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={{ width: 34, height: 34 }} />
            ) : (
              <Image source={require('../../../assets/images/avatar.jpeg')} style={{ width: 34, height: 34 }} />
            )}
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
                  {formatAmount(balance)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowPaymentMethodSelector(true)}
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
                {formatAmount(totalSpent)}
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
                {formatAmount(referralBalance)}
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
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            marginBottom: 12,
          }}
        >
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

      {/* Notifications Dropdown Modal */}
      <Modal
        visible={showNotificationsDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationsDropdown(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }}
          onPress={() => setShowNotificationsDropdown(false)}
        >
          <Pressable
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 100 : 70,
              right: 16,
              width: 300,
              maxHeight: 400,
              backgroundColor: COLORS.white,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 8,
              borderWidth: 1,
              borderColor: COLORS.cardBorder,
              overflow: 'hidden'
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>{unreadCount} New</Text>
                </View>
              )}
            </View>

            <FlatList
              data={notifications.slice(0, 5)} // Limit to 5
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 8 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginVertical: 20, fontSize: 13 }}>No notifications</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleNotificationClick(item)}
                  style={{
                    padding: 8,
                    marginBottom: 4,
                    flexDirection: 'row',
                    gap: 10,
                    opacity: item.read ? 0.6 : 1,
                    backgroundColor: item.read ? 'transparent' : COLORS.background,
                    borderRadius: 8
                  }}
                >
                  <View style={{ width: 6, alignItems: 'center', paddingTop: 6 }}>
                    {!item.read && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary }} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: item.read ? '500' : '600', color: COLORS.textPrimary, marginBottom: 2 }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }} numberOfLines={2}>
                      {item.message}
                    </Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            {notifications.length > 0 && unreadCount > 0 && (
              <View style={{ padding: 8, borderTopWidth: 1, borderTopColor: COLORS.cardBorder }}>
                <TouchableOpacity
                  onPress={handleMarkAllAsRead}
                  style={{
                    backgroundColor: COLORS.primary,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
                    View All & Mark as Read
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Profile Menu Dropdown */}
      <Modal
        transparent
        visible={showProfileMenu}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} 
          onPress={() => setShowProfileMenu(false)}
        >
          <Pressable 
            style={{ 
              position: 'absolute', 
              top: Platform.OS === 'ios' ? 100 : 70, 
              right: 16, 
              width: 250, 
              backgroundColor: COLORS.white, 
              borderRadius: 16, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.15, 
              shadowRadius: 10, 
              elevation: 8, 
              padding: 16,
              borderWidth: 1,
              borderColor: COLORS.cardBorder
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, overflow: 'hidden' }}>
                <Image 
                  source={user?.profileImage ? { uri: user.profileImage } : require('../../../assets/images/avatar.jpeg')} 
                  style={{ width: 44, height: 44 }} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: COLORS.textPrimary }} numberOfLines={1}>
                  {user?.username || 'User'}
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.textSecondary }} numberOfLines={1}>
                  {user?.email || 'No email found'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity 
              onPress={() => { setShowProfileMenu(false); /* Set edit profile modal */ }} 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder }}
            >
              <Edit2 size={16} color={COLORS.textSecondary} />
              <Text style={{ color: COLORS.textPrimary, fontSize: 13 }}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={{ marginVertical: 12 }}>
              <Text style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>Theme Mode</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    gap: 4, paddingVertical: 8, borderRadius: 8, 
                    backgroundColor: '#e0e7ff', // Mock light theme active
                    borderWidth: 1, borderColor: '#c7d2fe'
                  }}
                >
                  <Sun size={16} color={COLORS.primary} />
                  <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '500' }}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    gap: 4, paddingVertical: 8, borderRadius: 8, 
                    backgroundColor: COLORS.background, // Mock dark inactive
                    borderWidth: 1, borderColor: COLORS.cardBorder
                  }}
                >
                  <Moon size={16} color={COLORS.textSecondary} />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>Dark</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleLogout} 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, marginTop: 4 }}
            >
              <LogOut size={16} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '500' }}>Logout</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      
      {/* Detail Modal for Selected Notification */}
      {selectedNotification && (
        <Modal transparent animationType="fade" visible={!!selectedNotification} onRequestClose={() => setSelectedNotification(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <View style={{ width: '100%', maxWidth: 400, backgroundColor: COLORS.white, borderRadius: 16, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Notification Details</Text>
                <TouchableOpacity onPress={() => setSelectedNotification(null)}>
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: COLORS.textPrimary }}>
                {selectedNotification.title}
              </Text>
              
              <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 16 }}>
                {formatDate(selectedNotification.timestamp)}
              </Text>

              <View style={{ backgroundColor: COLORS.background, padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <Text style={{ color: COLORS.textPrimary, lineHeight: 22 }}>
                  {selectedNotification.message}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => setSelectedNotification(null)}
                style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Payment Method Selector Modal */}
      <Modal
        visible={showPaymentMethodSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentMethodSelector(false)}
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
                setShowPaymentMethodSelector(false);
                router.push('/(dashboard)/add-funds?method=bank');
              }}
              onSelectCrypto={() => {
                setShowPaymentMethodSelector(false);
                router.push('/(dashboard)/add-funds?method=crypto');
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPaymentMethodSelector(false)}
              style={{ marginTop: 24, paddingVertical: 12 }}
            >
              <Text style={{ textAlign: 'center', color: '#6B7280', fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}