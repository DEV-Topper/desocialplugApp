import {
  Briefcase,
  Camera,
  Ghost,
  Hash,
  LayoutGrid,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Music,
  Shield,
} from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const platforms = [
  { id: 'all', name: 'All', icon: LayoutGrid },
  { id: 'instagram', name: 'Instagram', icon: Camera },
  { id: 'facebook', name: 'Facebook', icon: MessageSquare },
  { id: 'tiktok', name: 'TikTok', icon: Music },
  { id: 'x', name: 'X', icon: Hash },
  { id: 'linkedin', name: 'LinkedIn', icon: Briefcase },
  { id: 'google', name: 'Google Voice', icon: Mic },
  { id: 'snapchat', name: 'Snapchat', icon: Ghost },
  { id: 'vpn', name: 'VPN', icon: Shield },
  { id: 'other', name: 'Other Platforms', icon: MoreHorizontal },
];

interface PlatformSelectorProps {
  selectedPlatform: string;
  onPlatformChange: (platformId: string) => void;
}

export function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  const { width } = useWindowDimensions();

  // Responsive columns: mobile (2), tablet (3), desktop/large (5)
  let columns = 2;
  if (width >= 768) columns = 3;
  if (width >= 1024) columns = 5;

  // Responsive sizes
  const isLarge = width >= 768;
  const isDesktop = width >= 1024;

  const buttonPaddingVertical = isLarge ? 12 : 8;
  const buttonPaddingHorizontal = isLarge ? 16 : 10;
  const gap = isLarge ? 12 : 8;
  const iconSize = isLarge ? 18 : 14;
  const fontSize = isLarge ? 14 : 12;
  const borderRadius = isLarge ? 12 : 10;
  const titleFontSize = isLarge ? 16 : 15;
  const titleMarginBottom = isLarge ? 16 : 12;

  // Calculate item width based on columns and gap
  const totalGap = gap * (columns - 1);
  const itemWidth = (width - totalGap - 32) / columns; // 32 = horizontal padding (16*2)

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Section title with bottom border */}
      <Text
        style={{
          fontSize: titleFontSize,
          fontWeight: '700',
          color: COLORS.textPrimary,
          marginBottom: titleMarginBottom,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.cardBorder,
        }}
      >
        Shop by Categories
      </Text>

      {/* Responsive grid using flexWrap */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -gap / 2,
        }}
      >
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;

          return (
            <View
              key={platform.id}
              style={{
                width: itemWidth,
                marginHorizontal: gap / 2,
                marginBottom: gap,
              }}
            >
              <TouchableOpacity
                onPress={() => onPlatformChange(platform.id)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isLarge ? 8 : 6,
                  paddingVertical: buttonPaddingVertical,
                  paddingHorizontal: buttonPaddingHorizontal,
                  borderRadius: borderRadius,
                  borderWidth: 1.5,
                  backgroundColor: isSelected ? COLORS.primary : '#fff',
                  borderColor: isSelected ? COLORS.primary : COLORS.cardBorder,
                  shadowColor: isSelected ? COLORS.primary : '#000',
                  shadowOffset: { width: 0, height: isSelected ? 2 : 1 },
                  shadowOpacity: isSelected ? 0.12 : 0.04,
                  shadowRadius: isSelected ? 6 : 2,
                  elevation: isSelected ? 3 : 1,
                }}
              >
                <Icon
                  size={iconSize}
                  color={isSelected ? '#fff' : COLORS.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={{
                    fontSize: fontSize,
                    fontWeight: '600',
                    color: isSelected ? '#fff' : COLORS.textPrimary,
                  }}
                  numberOfLines={1}
                >
                  {platform.name}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}