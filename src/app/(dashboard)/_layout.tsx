import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { LayoutDashboard, Wallet, ShoppingBag, Users, ListFilter } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/theme';

function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="systemChromeMaterial"
        intensity={80}
        style={{ position: 'absolute', inset: 0 }}
      />
    );
  }
  return (
    <View
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.tabBarBg,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.tabBarBorder,
      }}
    />
  );
}

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-funds"
        options={{
          title: 'Add Funds',
          tabBarIcon: ({ color, focused }) => (
            <Wallet
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: 'Purchases',
          tabBarIcon: ({ color, focused }) => (
            <ShoppingBag
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="referrals"
        options={{
          title: 'Referrals',
          tabBarIcon: ({ color, focused }) => (
            <Users
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            <ListFilter
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  );
}
