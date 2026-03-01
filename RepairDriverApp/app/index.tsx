import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { COLORS } from "../src/lib/constants";

export default function Index() {
  const { session, profile, isLoading, userType } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <View className="items-center">
          <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-6">
            <Text className="text-white text-4xl font-bold">RD</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-2">ريبير درايفر</Text>
          <Text className="text-white/70 text-base">خدمات الصيانة المنزلية</Text>
          <ActivityIndicator
            color="#fff"
            size="large"
            style={{ marginTop: 40 }}
          />
        </View>
      </View>
    );
  }

  // Not authenticated
  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  // Authenticated but no profile/type yet
  if (!userType) {
    return <Redirect href="/auth/user-type" />;
  }

  // Route based on user type
  if (userType === "technician") {
    return <Redirect href="/technician" />;
  }

  return <Redirect href="/customer" />;
}
