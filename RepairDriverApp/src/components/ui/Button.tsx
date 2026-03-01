import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  loading = false,
  disabled = false,
  fullWidth = true,
}: ButtonProps) {
  const baseStyle =
    "rounded-xl items-center justify-center flex-row";

  const variantStyles = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border-2 border-primary",
    danger: "bg-danger",
    ghost: "bg-transparent",
  };

  const textVariantStyles = {
    primary: "text-white",
    secondary: "text-primary",
    outline: "text-primary",
    danger: "text-white",
    ghost: "text-primary",
  };

  const sizeStyles = {
    sm: "py-2 px-4",
    md: "py-3.5 px-6",
    lg: "py-4 px-8",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSize = { sm: 16, md: 20, lg: 24 };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } ${isDisabled ? "opacity-50" : ""}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#fff" : "#231a73"}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={iconSize[size]}
              color={
                variant === "primary" || variant === "danger"
                  ? "#fff"
                  : "#231a73"
              }
            />
          )}
          <Text
            className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={iconSize[size]}
              color={
                variant === "primary" || variant === "danger"
                  ? "#fff"
                  : "#231a73"
              }
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
