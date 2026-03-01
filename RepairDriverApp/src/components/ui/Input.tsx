import React, { useState } from "react";
import { View, TextInput, Text, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../lib/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  hint?: string;
}

export function Input({
  label,
  error,
  icon,
  hint,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 text-sm font-semibold mb-1.5 text-right">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-white border rounded-xl px-4 py-3 ${
          error
            ? "border-danger"
            : isFocused
            ? "border-primary"
            : "border-gray-200"
        }`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? COLORS.danger : isFocused ? COLORS.primary : COLORS.gray[400]}
            style={{ marginLeft: 8 }}
          />
        )}
        <TextInput
          className="flex-1 text-right text-base text-gray-800"
          placeholderTextColor={COLORS.gray[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[{ writingDirection: "rtl" }, style]}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-danger text-xs mt-1 text-right">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-gray-400 text-xs mt-1 text-right">{hint}</Text>
      )}
    </View>
  );
}
