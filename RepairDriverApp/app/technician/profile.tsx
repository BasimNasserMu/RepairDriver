import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/ui/Card";
import { useAuth } from "../../src/contexts/AuthContext";
import { COLORS } from "../../src/lib/constants";

export default function TechnicianProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(t("auth.logout"), "هل أنت متأكد من تسجيل الخروج؟", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            router.replace("/auth/login");
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      title: t("profile.editProfile"),
      subtitle: "تعديل البيانات والصورة الشخصية",
    },
    {
      icon: "document-text-outline" as const,
      title: t("profile.documents"),
      subtitle: "رفع وإدارة المستندات والشهادات",
      badge: t("profile.pendingVerification"),
      badgeColor: "bg-warning/10 text-warning",
    },
    {
      icon: "construct-outline" as const,
      title: "التخصصات",
      subtitle: "إدارة تخصصات الصيانة",
    },
    {
      icon: "star-outline" as const,
      title: t("review.reviews"),
      subtitle: "عرض تقييمات العملاء",
    },
    {
      icon: "notifications-outline" as const,
      title: t("profile.notifications"),
      subtitle: "إعدادات الإشعارات والتنبيهات",
    },
    {
      icon: "language-outline" as const,
      title: t("profile.language"),
      subtitle: "العربية",
    },
    {
      icon: "help-circle-outline" as const,
      title: t("profile.helpSupport"),
      subtitle: "الأسئلة الشائعة والدعم الفني",
    },
    {
      icon: "information-circle-outline" as const,
      title: t("profile.about"),
      subtitle: "الشروط والأحكام وسياسة الخصوصية",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary px-6 pt-4 pb-10 items-center">
          <Text className="text-white/70 text-sm mb-6">
            {t("profile.title")}
          </Text>
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-3 relative">
            <Text className="text-white text-3xl font-bold">أ</Text>
            <View className="absolute bottom-0 right-0 w-7 h-7 bg-success rounded-full items-center justify-center border-2 border-primary">
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          </View>
          <Text className="text-white text-xl font-bold mb-1">
            أحمد محمد الدوسري
          </Text>
          <Text className="text-white/70 text-sm mb-2">فني كهرباء وتكييف</Text>
          <View className="bg-white/20 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {t("profile.verified")} ✓
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-5 -mt-6">
          <Card className="flex-row justify-around py-5">
            <View className="items-center">
              <View className="flex-row items-center gap-0.5">
                <Ionicons name="star" size={16} color="#eab308" />
                <Text className="text-primary text-xl font-bold">4.9</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                {t("profile.rating")}
              </Text>
            </View>
            <View className="w-px h-8 bg-gray-200" />
            <View className="items-center">
              <Text className="text-primary text-xl font-bold">156</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {t("profile.completedJobs")}
              </Text>
            </View>
            <View className="w-px h-8 bg-gray-200" />
            <View className="items-center">
              <Text className="text-primary text-xl font-bold">30</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {t("profile.warrantyDays")} يوم
              </Text>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View className="px-5 mt-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-xl px-4 py-4 mb-2 flex-row items-center"
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={COLORS.gray[400]}
              />
              <View className="flex-1 items-end mr-3">
                <View className="flex-row items-center gap-2">
                  {item.badge && (
                    <View className={`px-2 py-0.5 rounded-full ${item.badgeColor?.split(" ")[0]}`}>
                      <Text className={`text-[10px] font-semibold ${item.badgeColor?.split(" ")[1]}`}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  <Text className="text-gray-800 font-semibold text-base">
                    {item.title}
                  </Text>
                </View>
                {item.subtitle && (
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {item.subtitle}
                  </Text>
                )}
              </View>
              <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={COLORS.primary}
                />
              </View>
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-danger/5 rounded-xl px-4 py-4 mt-4 mb-8 flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <Text className="text-danger font-semibold text-base">
              {t("auth.logout")}
            </Text>
            <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
