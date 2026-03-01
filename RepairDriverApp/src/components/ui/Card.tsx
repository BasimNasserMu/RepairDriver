import React from "react";
import { View, TouchableOpacity, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "elevated" | "outlined" | "filled";
}

export function Card({
  children,
  onPress,
  variant = "elevated",
  className: extraClass = "",
  ...props
}: CardProps) {
  const variantStyles = {
    elevated: "bg-white shadow-sm shadow-black/10",
    outlined: "bg-white border border-gray-200",
    filled: "bg-secondary",
  };

  const content = (
    <View
      className={`rounded-2xl p-4 ${variantStyles[variant]} ${extraClass}`}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
