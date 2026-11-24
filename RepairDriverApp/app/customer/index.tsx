import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ServiceIcon } from "../../src/components/ui/ServiceIcon";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { CustomerRequestCard } from "../../src/components/CustomerRequestCard";
import { useCustomerRequests } from "../../src/hooks/useCustomerRequests";
import { COLORS } from "../../src/lib/constants";

const SERVICES = [
  { id: "1", key: "plumbing", icon: "water-outline" as const },
  { id: "2", key: "electrical", icon: "flash-outline" as const },
  { id: "3", key: "hvac", icon: "thermometer-outline" as const },
  { id: "4", key: "painting", icon: "color-palette-outline" as const },
  { id: "5", key: "carpentry", icon: "hammer-outline" as const },
  { id: "6", key: "cleaning", icon: "sparkles-outline" as const },
];

export default function CustomerHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { active, loading } = useCustomerRequests();

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary px-6 pt-4 pb-8 rounded-b-3xl">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity className="relative">
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">3</Text>
              </View>
            </TouchableOpacity>
            <View className="items-end">
              <Text className="text-white/70 text-sm">
                {t("common.welcome")} 👋
              </Text>
              <Text className="text-white text-xl font-bold">
                {t("customer.welcomeBack")}
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity className="bg-white/10 rounded-xl flex-row items-center px-4 py-3">
            <Ionicons name="options-outline" size={20} color="#fff" />
            <Text className="flex-1 text-white/60 text-right mr-3">
              {t("customer.searchServices")}
            </Text>
            <Ionicons name="search-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="px-5 -mt-4">
          {/* Special Offers */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
          >
            <View className="bg-primary/90 rounded-2xl p-5 w-72">
              <Text className="text-white/80 text-xs mb-1">عرض خاص</Text>
              <Text className="text-white text-lg font-bold mb-1">
                خصم 20% على خدمات التنظيف
              </Text>
              <Text className="text-white/70 text-xs">
                صالح حتى نهاية الشهر
              </Text>
            </View>
            <View className="bg-success/90 rounded-2xl p-5 w-72">
              <Text className="text-white/80 text-xs mb-1">جديد</Text>
              <Text className="text-white text-lg font-bold mb-1">
                استشارة مجانية لأول طلب
              </Text>
              <Text className="text-white/70 text-xs">
                للعملاء الجدد فقط
              </Text>
            </View>
          </ScrollView>

          {/* Services Grid */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity>
              <Text className="text-primary text-sm font-semibold">
                {t("customer.viewAll")}
              </Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">
              {t("customer.services")}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between mb-6">
            {SERVICES.map((service) => (
              <View key={service.id} className="w-[30%] items-center">
                <ServiceIcon
                  name={t(`services.${service.key}`)}
                  icon={service.icon}
                  onPress={() => router.push("/customer/new-request")}
                />
              </View>
            ))}
          </View>

          {/* Active Jobs */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.push("/customer/bookings")}>
              <Text className="text-primary text-sm font-semibold">
                {t("customer.viewAll")}
              </Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">
              {t("customer.activeJobs")}
            </Text>
          </View>

          {loading ? null : active.length === 0 ? (
            <EmptyState
              icon="construct-outline"
              title={t("customer.noActiveJobs")}
              description={t("requests.noRequestsDesc")}
            />
          ) : (
            active
              .slice(0, 3)
              .map((item) => <CustomerRequestCard key={item.request.id} item={item} />)
          )}

          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
