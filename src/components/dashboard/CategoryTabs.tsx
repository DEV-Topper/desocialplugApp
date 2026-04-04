import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useGetCategoriesQuery } from '../../store/api/accounts.api';

interface CategoryTabsProps {
  selectedPlatform: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onPlatformChange?: (platformId: string) => void;
}

const platformOrder = [
  'instagram',
  'facebook',
  'tiktok',
  'x',
  'linkedin',
  'google',
  'snapchat',
  'vpn',
  'other',
];

const normalizePlatform = (platform: string): string => {
  const normalized = platform.toLowerCase().trim();
  if (normalized === 'twitter') return 'x';
  return normalized;
};

export function CategoryTabs({
  selectedPlatform,
  selectedCategory,
  onCategoryChange,
  onPlatformChange,
}: CategoryTabsProps) {
  const { data, isLoading } = useGetCategoriesQuery();
  const categoriesMap = data?.categories || {};

  const getPlatformCategories = (platformId: string) => {
    if (!platformId) return [];
    const normalized = normalizePlatform(platformId);
    if (categoriesMap[normalized]) return categoriesMap[normalized];

    const matchedKey = Object.keys(categoriesMap).find(
      (key) => key.includes(normalized) || normalized.includes(key)
    );

    return matchedKey ? categoriesMap[matchedKey] : [];
  };

  const normalizeLabel = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

  const categoriesForDisplay: string[] = (() => {
    if (!data?.success) return [];

    if (selectedPlatform === 'all') {
      const combined: string[] = ['All'];
      platformOrder.forEach((platform) => {
        if (categoriesMap[platform] && categoriesMap[platform].length > 0) {
          combined.push(...categoriesMap[platform]);
        }
      });
      const remainingPlatforms = Object.keys(categoriesMap).filter((p) => !platformOrder.includes(p));
      remainingPlatforms.forEach((p) => {
        combined.push(...categoriesMap[p]);
      });

      const unique = Array.from(new Map(combined.map((c) => [normalizeLabel(c), c])).values());
      return unique;
    } else if (selectedPlatform === 'other') {
      const knownKeywords = new Set(platformOrder.map((p) => p.toLowerCase()));
      const otherCats: string[] = [];

      Object.keys(categoriesMap).forEach((key) => {
        const platformIsKnown = Array.from(knownKeywords).some((keyword) => key.includes(keyword));
        if (!platformIsKnown) {
          otherCats.push(...categoriesMap[key]);
        }
      });

      const unique = Array.from(new Map(otherCats.map((c) => [normalizeLabel(c), c])).values());
      return unique.sort();
    }

    return getPlatformCategories(selectedPlatform);
  })();

  useEffect(() => {
    if (selectedPlatform === 'all') return;
    if (categoriesForDisplay.length > 0) {
      if (!categoriesForDisplay.includes(selectedCategory)) {
        onCategoryChange(categoriesForDisplay[0]);
      }
    }
  }, [selectedPlatform, categoriesForDisplay.length, selectedCategory, onCategoryChange]);

  if (isLoading) {
    return (
      <View className="py-2 items-center">
        <ActivityIndicator color="#2563EB" size="small" />
      </View>
    );
  }

  if (categoriesForDisplay.length === 0) {
    return (
      <View className="py-1 mb-2 items-center">
        <Text className="text-gray-400 text-xs">No categories available</Text>
      </View>
    );
  }

  const visibleActiveLabel = (() => {
    if (selectedPlatform === 'all') {
      if (selectedCategory && categoriesForDisplay.includes(selectedCategory)) return selectedCategory;
      return 'All';
    }
    return categoriesForDisplay.includes(selectedCategory) ? selectedCategory : categoriesForDisplay[0];
  })();

  return (
    <View className="mb-2 border-b border-gray-100 pb-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5 px-0.5">
        {categoriesForDisplay.map((cat) => {
          const isActive = visibleActiveLabel === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                if (cat === 'All') {
                  if (onPlatformChange) onPlatformChange('all');
                  onCategoryChange('');
                } else {
                  onCategoryChange(cat);
                }
              }}
              className={`px-2.5 py-1 rounded-full border ${isActive
                  ? 'bg-blue-100 border-blue-200'
                  : 'bg-white border-gray-200'
                }`}
            >
              <Text className={`text-xs ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}