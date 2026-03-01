import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { COLORS } from "../../src/lib/constants";
import { UserType } from "../../src/types/database";

export default function UserTypeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUserType, updateProfile } = useAuth();

  const handleSelectType = async (type: UserType) => {
    try {
      await updateProfile({ user_type: type });
    } catch {
      // Demo mode - continue anyway
    }
    setUserType(type);
    if (type === "technician") {
      router.replace("/technician");
    } else {
      router.replace("/customer");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="flex-1 px-6 justify-center">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-6">
            <Ionicons name="person-outline" size={40} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {t("auth.selectUserType")}
          </Text>
          <Text className="text-gray-500 text-center">
            اختر نوع حسابك للمتابعة
          </Text>
        </View>

        {/* Options */}
        <View className="gap-4">
          {/* Customer */}
          <TouchableOpacity
            onPress={() => handleSelectType("customer")}
            className="bg-white rounded-2xl p-6 border-2 border-gray-100 active:border-primary"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800 text-right mb-1">
                  {t("auth.customer")}
                </Text>
                <Text className="text-gray-500 text-right text-sm">
                  ابحث عن فنيين محترفين لإصلاح وصيانة منزلك
                </Text>
              </View>
              <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="home-outline" size={32} color={COLORS.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Technician */}
          <TouchableOpacity
            onPress={() => handleSelectType("technician")}
            className="bg-white rounded-2xl p-6 border-2 border-gray-100 active:border-primary"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800 text-right mb-1">
                  {t("auth.technician")}
                </Text>
                <Text className="text-gray-500 text-right text-sm">
                  انضم كفني معتمد واحصل على طلبات الصيانة
                </Text>
              </View>
              <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="construct-outline" size={32} color={COLORS.success} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
