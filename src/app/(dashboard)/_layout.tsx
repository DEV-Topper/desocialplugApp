import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ListFilter, ShoppingBag, Users, Settings, Wallet } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Floating blur background
function FloatingTabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="systemMaterial"
        intensity={80}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }
  return <View style={StyleSheet.absoluteFillObject} />;
}

// Custom Animated Tab Bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  const TAB_WIDTH = (width - 40) / state.routes.length;
  const translateX = useSharedValue(state.index * TAB_WIDTH);

  React.useEffect(() => {
    translateX.value = withTiming(state.index * TAB_WIDTH, {
      duration: 250,
    });
  }, [state.index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <FloatingTabBarBackground />

      {/* Sliding Pill Indicator */}
      <Animated.View
        style={[
          styles.activePill,
          {
            width: TAB_WIDTH - 10,
          },
          animatedStyle,
        ]}
      />

      {/* Tabs */}
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          navigation.navigate(route.name);
        };

        const color = isFocused ? COLORS.primary : '#8E8E93';

        return (
          <View key={route.key} style={styles.tabItem}>
            <View onTouchEnd={onPress} style={styles.innerTab}>
              {options.tabBarIcon?.({
                color,
                focused: isFocused,
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function DashboardLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-funds"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Wallet
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <ShoppingBag
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="referrals"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Users
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <ListFilter
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Settings
              color={color}
              size={focused ? 24 : 22}
              strokeWidth={focused ? 2.3 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },

  activePill: {
    position: 'absolute',
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 30,
    left: 5,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerTab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: '100%',
  },
});