import * as Clipboard from 'expo-clipboard';
import {
  AlertCircle,
  Check,
  Copy,
  DollarSign,
  Facebook,
  Ghost,
  Instagram,
  LinkedinIcon,
  Mail,
  Mic,
  MoreHorizontal,
  Music,
  Package,
  Shield,
  ShoppingCart,
  TwitterIcon,
  Users,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useGetAccountsQuery, usePurchaseAccountMutation } from '../../store/api/accounts.api';
import { useGetUserQuery } from '../../store/api/user.api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  platform: string;
  subcategory?: string;
  followers: number;
  mailIncluded: boolean;
  vpnType?: string;
  description?: string;
  status: string;
  price: number;
  logs: number;
  position?: number;
  createdAt: string;
}

interface PlatformGroup {
  platformName: string;
  platformKey: string;
  subcategories: { [subcategory: string]: Account[] };
}

interface AccountsListProps {
  selectedPlatform: string;
  selectedCategory: string;
}

// ─── Platform helpers ─────────────────────────────────────────────────────────

const getPlatformIcon = (platform: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram') || p.includes('ig')) return Instagram;
  if (p.includes('facebook') || p.includes('fb')) return Facebook;
  if (p.includes('tiktok') || p.includes('tik tok')) return Music;
  if (p.includes('x') || p.includes('twitter')) return TwitterIcon;
  if (p.includes('linkedin')) return LinkedinIcon;
  if (p.includes('google') || p.includes('voice')) return Mic;
  if (p.includes('snapchat') || p.includes('snap')) return Ghost;
  if (p.includes('vpn')) return Shield;
  if (p.includes('mail') || p.includes('email') || p.includes('gmail')) return Mail;
  return MoreHorizontal;
};

// Gradient as two hex colors [from, to]
const getPlatformGradientColors = (platform: string): [string, string] => {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram') || p.includes('ig')) return ['#a855f7', '#f97316'];
  if (p.includes('facebook') || p.includes('fb')) return ['#2563eb', '#3b82f6'];
  if (p.includes('tiktok') || p.includes('tik tok')) return ['#111827', '#3b82f6'];
  if (p.includes('x') || p.includes('twitter')) return ['#111827', '#374151'];
  if (p.includes('linkedin')) return ['#1d4ed8', '#2563eb'];
  if (p.includes('google') || p.includes('voice')) return ['#3b82f6', '#f59e0b'];
  if (p.includes('snapchat') || p.includes('snap')) return ['#facc15', '#fde047'];
  if (p.includes('youtube') || p.includes('video')) return ['#dc2626', '#ef4444'];
  if (p.includes('telegram') || p.includes('tele')) return ['#2563eb', '#3b82f6'];
  if (p.includes('discord')) return ['#6366f1', '#818cf8'];
  if (p.includes('mail') || p.includes('email') || p.includes('gmail')) return ['#f97316', '#fb923c'];
  if (p.includes('pinterest')) return ['#b91c1c', '#dc2626'];
  if (p.includes('reddit')) return ['#ea580c', '#f97316'];
  if (p.includes('twitch')) return ['#7c3aed', '#a855f7'];
  if (p.includes('vpn')) return ['#16a34a', '#22c55e'];
  return ['#4b5563', '#6b7280'];
};

const getPlatformDisplayName = (platform: string): string => {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram') || p.includes('ig')) return 'Instagram';
  if (p.includes('facebook') || p.includes('fb')) return 'Facebook';
  if (p.includes('tiktok') || p.includes('tik tok')) return 'TikTok';
  if (p.includes('x') || p.includes('twitter')) return 'X (Twitter)';
  if (p.includes('linkedin')) return 'LinkedIn';
  if (p.includes('google') || p.includes('voice')) return 'Google Voice';
  if (p.includes('snapchat') || p.includes('snap')) return 'Snapchat';
  if (p.includes('youtube') || p.includes('video')) return 'YouTube';
  if (p.includes('telegram') || p.includes('tele')) return 'Telegram';
  if (p.includes('discord')) return 'Discord';
  if (p.includes('mail') || p.includes('email') || p.includes('gmail')) return 'Email';
  if (p.includes('pinterest')) return 'Pinterest';
  if (p.includes('reddit')) return 'Reddit';
  if (p.includes('twitch')) return 'Twitch';
  if (p.includes('vpn')) return 'VPN';
  return platform;
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
  if (p.includes('youtube') || p.includes('video')) return 'youtube';
  if (p.includes('telegram') || p.includes('tele')) return 'telegram';
  if (p.includes('discord')) return 'discord';
  if (p.includes('mail') || p.includes('email') || p.includes('gmail')) return 'mail';
  if (p.includes('pinterest')) return 'pinterest';
  if (p.includes('reddit')) return 'reddit';
  if (p.includes('twitch')) return 'twitch';
  if (p.includes('vpn')) return 'vpn';
  return 'other';
};

const platformOrder = ['instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'google', 'snapchat', 'vpn', 'other'];

const getStockStyle = (logs: number): { bg: string; text: string } => {
  if (logs === 0) return { bg: '#fee2e2', text: '#dc2626' };
  if (logs <= 2) return { bg: '#fef9c3', text: '#b45309' };
  return { bg: '#dcfce7', text: '#15803d' };
};

const sortAccountsByDate = (accountsArr: Account[]): Account[] => {
  const toPos = (pos: unknown) => {
    const n = typeof pos === 'number' ? pos : Number.NaN;
    return Number.isFinite(n) && n > 0 ? n : Number.MAX_SAFE_INTEGER;
  };
  return [...accountsArr].sort((a, b) => {
    const pA = toPos(a.position);
    const pB = toPos(b.position);
    if (pA !== pB) return pA - pB;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GradientIcon({ platform, size = 36 }: { platform: string; size?: number }) {
  const Icon = getPlatformIcon(platform);
  const [from] = getPlatformGradientColors(platform);
  return (
    <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: from, alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={size * 0.52} color="#fff" />
    </View>
  );
}

function InfoGrid({ account }: { account: Account }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
      {/* Followers */}
      <View style={{ flex: 1, minWidth: '44%', backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#bfdbfe' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Users size={13} color={COLORS.primary} />
          <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>Followers</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
          {(account.followers || 0).toLocaleString()}+
        </Text>
      </View>

      {/* Price */}
      <View style={{ flex: 1, minWidth: '44%', backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <DollarSign size={13} color="#16a34a" />
          <Text style={{ fontSize: 11, color: '#16a34a', fontWeight: '600' }}>Price / log</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
          ₦{(account.price || 0).toLocaleString()}
        </Text>
      </View>

      {/* Stock */}
      <View style={{ flex: 1, minWidth: '44%', backgroundColor: '#faf5ff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e9d5ff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Package size={13} color="#9333ea" />
          <Text style={{ fontSize: 11, color: '#9333ea', fontWeight: '600' }}>Stock</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
          {account.logs} pcs
        </Text>
      </View>

      {/* Mail */}
      <View style={{ flex: 1, minWidth: '44%', backgroundColor: '#fff7ed', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#fed7aa' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Mail size={13} color="#ea580c" />
          <Text style={{ fontSize: 11, color: '#ea580c', fontWeight: '600' }}>Email Access</Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>
          {account.mailIncluded ? 'Included ✓' : 'Not Included'}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AccountsList({ selectedPlatform, selectedCategory }: AccountsListProps) {
  const { data, isLoading } = useGetAccountsQuery();
  const { data: userData } = useGetUserQuery();
  const [purchaseAccount, { isLoading: isPurchasing }] = usePurchaseAccountMutation();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseMode, setIsPurchaseMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedCredentials, setPurchasedCredentials] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const accounts: Account[] = data?.accounts || (Array.isArray(data) ? data : []);
  const userBalance = userData?.user?.walletBalance || 0;

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredAccounts = accounts.filter((acc) => {
    if (!acc.platform) return false;
    const normalizedPlatform = acc.platform.toLowerCase().trim();
    const platformKey = getPlatformKeyForGrouping(acc.platform);

    let platformMatch = false;
    if (selectedPlatform === 'all') {
      platformMatch = true;
    } else if (selectedPlatform === 'other') {
      const isMain = mainPlatforms.some((mp) => normalizedPlatform.includes(mp));
      platformMatch = !isMain;
    } else {
      platformMatch = platformKey === selectedPlatform || normalizedPlatform.includes(selectedPlatform);
    }

    let categoryMatch = true;
    if (selectedCategory && selectedCategory !== 'all') {
      categoryMatch = (acc.subcategory || 'Uncategorized').toLowerCase().trim() === selectedCategory.toLowerCase().trim();
    }

    return platformMatch && categoryMatch;
  });

  // ── Grouping helpers ───────────────────────────────────────────────────────

  const buildPlatformGroups = (source: Account[]): PlatformGroup[] => {
    const map: { [name: string]: PlatformGroup } = {};
    source.forEach((account) => {
      const name = getPlatformDisplayName(account.platform);
      if (!map[name]) map[name] = { platformName: name, platformKey: name.toLowerCase().replace(/\s+/g, '-'), subcategories: {} };
      const sub = account.subcategory || 'Uncategorized';
      if (!map[name].subcategories[sub]) map[name].subcategories[sub] = [];
      map[name].subcategories[sub].push(account);
    });

    const arr = Object.values(map);
    arr.sort((a, b) => {
      const aIdx = platformOrder.findIndex((p) => a.platformName.toLowerCase().includes(p));
      const bIdx = platformOrder.findIndex((p) => b.platformName.toLowerCase().includes(p));
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.platformName.localeCompare(b.platformName);
    });

    arr.forEach((platform) => {
      const sorted: { [sub: string]: Account[] } = {};
      Object.entries(platform.subcategories)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([sub, accs]) => { sorted[sub] = sortAccountsByDate(accs); });
      platform.subcategories = sorted;
    });

    return arr;
  };

  const getSubcategoryGroups = (): { [sub: string]: Account[] } => {
    const map: { [sub: string]: Account[] } = {};
    filteredAccounts.forEach((acc) => {
      const sub = acc.subcategory || 'Uncategorized';
      if (!map[sub]) map[sub] = [];
      map[sub].push(acc);
    });
    const sorted: { [sub: string]: Account[] } = {};
    Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([sub, accs]) => { sorted[sub] = sortAccountsByDate(accs); });
    return sorted;
  };

  // ── Modal handlers ─────────────────────────────────────────────────────────

  const openModal = (account: Account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
    setIsPurchaseMode(false);
    setQuantity(1);
    setPurchaseSuccess(false);
    setPurchasedCredentials([]);
  };

  const closeModal = () => {
    if (isPurchasing) return;
    setIsModalOpen(false);
    setIsPurchaseMode(false);
    setPurchaseSuccess(false);
  };

  const handleProceedToPurchase = () => {
    if (!selectedAccount) return;
    if (userBalance < selectedAccount.price) {
      alert(`Insufficient balance!\nYou need ₦${selectedAccount.price.toLocaleString()} to purchase 1 log.\nYour balance: ₦${userBalance.toLocaleString()}\n\nPlease add funds.`);
      return;
    }
    setIsPurchaseMode(true);
    setQuantity(1);
  };

  const handleQuantityChange = (increment: boolean) => {
    if (!selectedAccount || isPurchasing) return;
    if (increment) {
      const next = quantity + 1;
      if (next * selectedAccount.price > userBalance) {
        alert(`Insufficient balance for ${next} logs!\nCost: ₦${(next * selectedAccount.price).toLocaleString()}\nBalance: ₦${userBalance.toLocaleString()}`);
        return;
      }
      if (next > selectedAccount.logs) {
        alert(`Max available: ${selectedAccount.logs} logs`);
        return;
      }
      setQuantity(next);
    } else {
      if (quantity > 1) setQuantity((q) => q - 1);
    }
  };

  const handleCompletePurchase = async () => {
    if (!selectedAccount || isPurchasing) return;
    const total = selectedAccount.price * quantity;
    if (total > userBalance) {
      alert(`Insufficient balance!\nTotal: ₦${total.toLocaleString()}\nBalance: ₦${userBalance.toLocaleString()}`);
      return;
    }
    try {
      const res = await purchaseAccount({ accountId: selectedAccount.id, quantity }).unwrap();
      if (res.success) {
        setPurchasedCredentials(res.purchase?.credentials || []);
        setPurchaseSuccess(true);
      } else {
        alert(res.error || 'Purchase failed. Please try again.');
      }
    } catch (err: any) {
      alert(err.data?.error || 'An unexpected error occurred.');
    }
  };

  const copyCredential = async (text: string, index: number) => {
    await Clipboard.setStringAsync(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const totalPrice = selectedAccount ? selectedAccount.price * quantity : 0;
  const canAfford = totalPrice <= userBalance;

  // ── Card renderer (Updated to match image: stock left, price middle, buy right) ──

  const renderAccountCard = (account: Account) => {
    const stock = getStockStyle(account.logs);
    const label = account.vpnType
      ? account.vpnType
      : `${account.platform} | ${(account.followers || 0).toLocaleString()}+ followers | ${account.mailIncluded ? 'Mail Included' : 'Mail Not Included'}`;

    return (
      <TouchableOpacity
        key={account.id}
        activeOpacity={0.7}
        onPress={() => openModal(account)}
        style={{
          backgroundColor: '#fff',
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#e9eef3',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* Top row: icon + description */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <GradientIcon platform={account.platform} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1f2937', lineHeight: 18 }} numberOfLines={2}>
              {label}
            </Text>
          </View>
        </View>

        {/* Bottom row: Stock (left), Price (middle), Buy button (right) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Stock badge - far left */}
          <View style={{ backgroundColor: stock.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 30, minWidth: 70, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: stock.text }}>{account.logs} pcs</Text>
          </View>

          {/* Price - middle */}
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>
            ₦{(account.price || 0).toLocaleString()}
          </Text>

          {/* Buy button - far right (non-interactive, parent handles tap) */}
          <View
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 40,
              paddingHorizontal: 20,
              paddingVertical: 7,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Buy</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Subcategory section ────────────────────────────────────────────────────

  const renderSubcategorySection = (subcategory: string, accs: Account[]) => (
    <View key={subcategory} style={{ marginBottom: 20 }}>
      {subcategory !== 'Uncategorized' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>{subcategory}</Text>
          <View style={{ backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 }}>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>{accs.length} item(s)</Text>
          </View>
        </View>
      )}
      {accs.map(renderAccountCard)}
    </View>
  );

  // ── Platform group section ─────────────────────────────────────────────────

  const renderPlatformGroup = (group: PlatformGroup) => (
    <View key={group.platformKey} style={{ marginBottom: 24 }}>
      {Object.entries(group.subcategories).map(([sub, accs]) =>
        renderSubcategorySection(sub, accs)
      )}
    </View>
  );

  // ── Loading / empty ────────────────────────────────────────────────────────

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 32 }} />;
  }

  if (filteredAccounts.length === 0) {
    return (
      <View style={{ paddingVertical: 48, alignItems: 'center' }}>
        <Text style={{ color: '#6b7280', fontWeight: '500' }}>No accounts available for this selection.</Text>
      </View>
    );
  }

  // ── Determine which grouped view to show ───────────────────────────────────

  const renderList = () => {
    if (selectedPlatform === 'all' || selectedPlatform === 'other') {
      const groups = buildPlatformGroups(filteredAccounts);
      return groups.map(renderPlatformGroup);
    }

    // Specific platform — group by subcategory
    const subGroups = getSubcategoryGroups();
    if (Object.keys(subGroups).length > 0) {
      return Object.entries(subGroups).map(([sub, accs]) => renderSubcategorySection(sub, accs));
    }

    // Fallback: no grouping
    return sortAccountsByDate(filteredAccounts).map(renderAccountCard);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Modal
  // ─────────────────────────────────────────────────────────────────────────────

  const renderModal = () => {
    if (!selectedAccount) return null;

    return (
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
          onPress={closeModal}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              width: '100%',
              maxHeight: '90%',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 32,
              elevation: 20,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={{ padding: 16, gap: 14 }}>

                {/* ── Header row ── */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <GradientIcon platform={selectedAccount.platform} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                        {selectedAccount.platform} Account
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {purchaseSuccess ? 'Purchase Complete!' : isPurchaseMode ? 'Select Quantity' : 'Account Details'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={closeModal}
                    disabled={isPurchasing}
                    style={{ padding: 4 }}
                  >
                    <X size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* ── Balance banner ── */}
                <View style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Your Balance:</Text>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
                    ₦{userBalance.toLocaleString()}
                  </Text>
                </View>

                {/* ══════════ SUCCESS STATE ══════════ */}
                {purchaseSuccess && (
                  <View style={{ gap: 12 }}>
                    {/* Success banner */}
                    <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' }}>
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <ShoppingCart size={22} color="#fff" />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#15803d', marginBottom: 4 }}>Purchase Successful!</Text>
                      <Text style={{ fontSize: 12, color: '#166534', textAlign: 'center' }}>
                        You purchased {quantity} log(s) for ₦{totalPrice.toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                        New Balance: ₦{(userBalance - totalPrice).toLocaleString()}
                      </Text>
                    </View>

                    {/* Credentials */}
                    {purchasedCredentials.length > 0 && (
                      <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: '#4b5563', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={12} color="#fff" />
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>
                            Your Credentials ({purchasedCredentials.length} items)
                          </Text>
                        </View>

                        <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                          {purchasedCredentials.map((cred, idx) => {
                            const text = typeof cred === 'string' ? cred : JSON.stringify(cred, null, 2);
                            return (
                              <View key={idx} style={{
                                backgroundColor: '#ecfdf5',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 6,
                                borderWidth: 1,
                                borderColor: '#a7f3d0',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 6,
                              }}>
                                <Text style={{ flex: 1, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', color: '#111827', lineHeight: 18 }}>
                                  {text}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => copyCredential(text, idx)}
                                  style={{ padding: 4, borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db' }}
                                >
                                  {copiedIndex === idx
                                    ? <Check size={14} color="#16a34a" />
                                    : <Copy size={14} color="#6b7280" />}
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => setIsModalOpen(false)}
                      style={{ backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ══════════ QUANTITY STATE ══════════ */}
                {isPurchaseMode && !purchaseSuccess && (
                  <View style={{ gap: 12 }}>
                    <View style={{ backgroundColor: '#f5f3ff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#ddd6fe' }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 14 }}>
                        Select Quantity
                      </Text>

                      {/* Stepper */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 14 }}>
                        <TouchableOpacity
                          onPress={() => handleQuantityChange(false)}
                          disabled={quantity <= 1 || isPurchasing}
                          style={{
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: quantity <= 1 ? '#e5e7eb' : '#dc2626',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 }}>−</Text>
                        </TouchableOpacity>

                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.primary }}>{quantity}</Text>
                          <Text style={{ fontSize: 11, color: COLORS.primary }}>log(s)</Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleQuantityChange(true)}
                          disabled={quantity >= selectedAccount.logs || isPurchasing || !canAfford}
                          style={{
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: quantity >= selectedAccount.logs || !canAfford ? '#e5e7eb' : '#16a34a',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 }}>+</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Summary */}
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: 12, gap: 6 }}>
                        {[
                          { label: 'Price per log', value: `₦${selectedAccount.price.toLocaleString()}` },
                          { label: 'Quantity', value: `${quantity}` },
                          { label: 'Available', value: `${selectedAccount.logs} logs`, color: '#16a34a' },
                          { label: 'Your Balance', value: `₦${userBalance.toLocaleString()}`, color: COLORS.primary },
                        ].map(({ label, value, color }) => (
                          <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>{label}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: color || '#111827' }}>{value}</Text>
                          </View>
                        ))}
                        <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>Total</Text>
                          <Text style={{ fontSize: 14, fontWeight: '800', color: canAfford ? '#16a34a' : '#dc2626' }}>
                            ₦{totalPrice.toLocaleString()}
                          </Text>
                        </View>
                      </View>

                      {/* Insufficient warning */}
                      {!canAfford && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#fef2f2', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#fecaca' }}>
                          <AlertCircle size={16} color="#dc2626" style={{ marginTop: 1 }} />
                          <View>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#b91c1c' }}>Insufficient balance!</Text>
                            <Text style={{ fontSize: 11, color: '#dc2626' }}>You need ₦{(totalPrice - userBalance).toLocaleString()} more.</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => setIsPurchaseMode(false)}
                        disabled={isPurchasing}
                        style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '700' }}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCompletePurchase}
                        disabled={isPurchasing || !canAfford || quantity < 1}
                        style={{
                          flex: 1, backgroundColor: isPurchasing || !canAfford ? '#93c5fd' : COLORS.primary,
                          borderRadius: 12, paddingVertical: 13, alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                          {isPurchasing ? 'Processing...' : `Pay ₦${totalPrice.toLocaleString()}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* ══════════ DETAILS STATE ══════════ */}
                {!isPurchaseMode && !purchaseSuccess && (
                  <View style={{ gap: 12 }}>
                    {/* 2×2 info grid */}
                    <InfoGrid account={selectedAccount} />

                    {/* Account info box */}
                    <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Account Information</Text>

                      {/* Status */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={12} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: '#6b7280' }}>Status</Text>
                          <View style={{
                            alignSelf: 'flex-start',
                            backgroundColor: selectedAccount.logs === 0 ? '#fee2e2' : '#dcfce7',
                            borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2,
                          }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: selectedAccount.logs === 0 ? '#dc2626' : '#16a34a' }}>
                              {selectedAccount.logs === 0 ? 'Sold Out' : (selectedAccount.status || 'Available')}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Description */}
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                        <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: '#fdf2f8', alignItems: 'center', justifyContent: 'center' }}>
                          <AlertCircle size={12} color="#ec4899" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Description</Text>
                          <Text style={{ fontSize: 13, fontWeight: '500', color: '#111827', lineHeight: 18 }}>
                            {selectedAccount.description || 'No description available'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 }}>
                      <TouchableOpacity
                        onPress={closeModal}
                        style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '700' }}>Close</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleProceedToPurchase}
                        disabled={selectedAccount.logs === 0}
                        style={{
                          flex: 1,
                          backgroundColor: selectedAccount.logs === 0 ? '#9ca3af' : COLORS.primary,
                          borderRadius: 12, paddingVertical: 13, alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                          {selectedAccount.logs === 0 ? 'Out of Stock' : 'Proceed to Purchase'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <View>{renderList()}</View>
      {renderModal()}
    </>
  );
}