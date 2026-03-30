import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Camera,
  MessageSquare,
  Music,
  Hash,
  Briefcase,
  Mic,
  Ghost,
  Shield,
  MoreHorizontal,
  LayoutGrid,
} from 'lucide-react-native';
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
  { id: 'other', name: 'Other', icon: MoreHorizontal },
];

interface PlatformSelectorProps {
  selectedPlatform: string;
  onPlatformChange: (platformId: string) => void;
}

export function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '700',
          color: COLORS.textPrimary,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.cardBorder,
        }}
      >
        Shop by Categories
      </Text>

      {/* Two-column grid matching web */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;

          return (
            <TouchableOpacity
              key={platform.id}
              onPress={() => onPlatformChange(platform.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                borderWidth: 1.5,
                backgroundColor: isSelected ? COLORS.primary : COLORS.white,
                borderColor: isSelected ? COLORS.primary : COLORS.cardBorder,
                minWidth: '45%',
                flex: 1,
                shadowColor: isSelected ? COLORS.primary : '#000',
                shadowOffset: { width: 0, height: isSelected ? 2 : 1 },
                shadowOpacity: isSelected ? 0.18 : 0.04,
                shadowRadius: isSelected ? 6 : 2,
                elevation: isSelected ? 4 : 1,
              }}
            >
              <Icon size={16} color={isSelected ? '#fff' : COLORS.textSecondary} strokeWidth={2} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isSelected ? '#fff' : COLORS.textPrimary,
                }}
                numberOfLines={1}
              >
                {platform.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
