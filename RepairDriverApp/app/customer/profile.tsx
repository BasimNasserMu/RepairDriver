import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/ui/Card";
import { useAuth } from "../../src/contexts/AuthContext";
import { COLORS } from "../../src/lib/constants";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  showBadge?: boolean;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signOut, profile } = useAuth();

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

  const menuItems: MenuItem[] = [
    {
      icon: "person-outline",
      title: t("profile.editProfile"),
      subtitle: "تعديل الاسم والصورة والبيانات",
      onPress: () => {},
    },
    {
      icon: "location-outline",
      title: t("profile.address"),
      subtitle: "إدارة العناوين المحفوظة",
      onPress: () => {},
    },
    {
      icon: "card-outline",
      title: t("payment.selectMethod"),
      subtitle: "إدارة طرق الدفع",
      onPress: () => {},
    },
    {
      icon: "notifications-outline",
      title: t("profile.notifications"),
      subtitle: "إعدادات الإشعارات",
      onPress: () => {},
      showBadge: true,
    },
    {
      icon: "language-outline",
      title: t("profile.language"),
      subtitle: "العربية",
      onPress: () => {},
    },
    {
      icon: "help-circle-outline",
      title: t("profile.helpSupport"),
      subtitle: "الأسئلة الشائعة والدعم الفني",
      onPress: () => {},
    },
    {
      icon: "information-circle-outline",
      title: t("profile.about"),
      subtitle: "الشروط والأحكام وسياسة الخصوصية",
      onPress: () => {},
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
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-3">
            <Text className="text-white text-3xl font-bold">ع</Text>
          </View>
          <Text className="text-white text-xl font-bold mb-1">
            عبدالله أحمد
          </Text>
          <Text className="text-white/70 text-sm">+966 55 123 4567</Text>
        </View>

        {/* Stats */}
        <View className="px-5 -mt-6">
          <Card className="flex-row justify-around py-5">
            <View className="items-center">
              <Text className="text-primary text-xl font-bold">4.8</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {t("profile.rating")}
              </Text>
            </View>
            <View className="w-px h-8 bg-gray-200" />
            <View className="items-center">
              <Text className="text-primary text-xl font-bold">12</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {t("profile.completedJobs")}
              </Text>
            </View>
            <View className="w-px h-8 bg-gray-200" />
            <View className="items-center">
              <Text className="text-primary text-xl font-bold">2</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {t("customer.activeJobs")}
              </Text>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View className="px-5 mt-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className="bg-white rounded-xl px-4 py-4 mb-2 flex-row items-center"
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={COLORS.gray[400]}
              />
              <View className="flex-1 items-end mr-3">
                <Text className="text-gray-800 font-semibold text-base">
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {item.subtitle}
                  </Text>
                )}
              </View>
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  item.color ? "" : "bg-primary/10"
                }`}
                style={item.color ? { backgroundColor: `${item.color}15` } : {}}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.color || COLORS.primary}
                />
                {item.showBadge && (
                  <View className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-danger rounded-full" />
                )}
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
