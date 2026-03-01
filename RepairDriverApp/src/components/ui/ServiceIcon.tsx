import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../lib/constants";

interface ServiceIconProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  isSelected?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ServiceIcon({
  name,
  icon,
  onPress,
  isSelected = false,
  size = "md",
}: ServiceIconProps) {
  const containerSize = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const iconSizes = { sm: 24, md: 32, lg: 40 };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="items-center mb-3"
    >
      <View
        className={`${containerSize[size]} rounded-2xl items-center justify-center mb-1.5 ${
          isSelected ? "bg-primary" : "bg-primary/10"
        }`}
      >
        <Ionicons
          name={icon}
          size={iconSizes[size]}
          color={isSelected ? "#fff" : COLORS.primary}
        />
      </View>
      <Text
        className={`text-xs font-medium text-center ${
          isSelected ? "text-primary font-bold" : "text-gray-600"
        }`}
        numberOfLines={1}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
