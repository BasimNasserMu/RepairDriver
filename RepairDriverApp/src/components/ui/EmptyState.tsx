import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../lib/constants";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="bg-primary/10 w-20 h-20 rounded-full items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color={COLORS.primary} />
      </View>
      <Text className="text-gray-800 text-lg font-bold text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-gray-500 text-sm text-center">{description}</Text>
      )}
    </View>
  );
}
