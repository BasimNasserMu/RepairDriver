import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/ui/Card";
import { StatusBadge } from "../../src/components/ui/StatusBadge";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { COLORS } from "../../src/lib/constants";
import { ServiceRequestStatus } from "../../src/types/database";

type TabFilter = "all" | "active" | "completed";

const DEMO_BOOKINGS = [
  {
    id: "1",
    service: "تكييف",
    icon: "thermometer-outline" as const,
    description: "صيانة مكيف سبليت - لا يبرد",
    status: "in_progress" as ServiceRequestStatus,
    techName: "أحمد محمد",
    techRating: 4.9,
    price: "150 ر.س",
    date: "1 مارس 2026",
  },
  {
    id: "2",
    service: "سباكة",
    icon: "water-outline" as const,
    description: "تسريب مياه تحت المغسلة",
    status: "quote_received" as ServiceRequestStatus,
    techName: "خالد عبدالله",
    techRating: 4.7,
    price: "200 ر.س",
    date: "28 فبراير 2026",
  },
  {
    id: "3",
    service: "كهرباء",
    icon: "flash-outline" as const,
    description: "تركيب ثريا في غرفة المعيشة",
    status: "completed" as ServiceRequestStatus,
    techName: "فهد سعد",
    techRating: 4.8,
    price: "85 ر.س",
    date: "25 فبراير 2026",
  },
  {
    id: "4",
    service: "دهان",
    icon: "color-palette-outline" as const,
    description: "دهان غرفة نوم رئيسية",
    status: "completed" as ServiceRequestStatus,
    techName: "محمد علي",
    techRating: 4.6,
    price: "500 ر.س",
    date: "20 فبراير 2026",
  },
];

export default function BookingsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const filteredBookings = DEMO_BOOKINGS.filter((booking) => {
    if (activeTab === "active")
      return !["completed", "cancelled"].includes(booking.status);
    if (activeTab === "completed") return booking.status === "completed";
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-gray-800 text-right">
          {t("customer.bookings")}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-4 gap-2">
        {(["all", "active", "completed"] as TabFilter[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === tab ? "bg-primary" : "bg-white"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                activeTab === tab ? "text-white" : "text-gray-500"
              }`}
            >
              {tab === "all"
                ? t("common.all")
                : tab === "active"
                ? t("customer.activeJobs")
                : t("status.completed")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={t("customer.noActiveJobs")}
          />
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="mb-3" onPress={() => {}}>
              <View className="flex-row items-start">
                <StatusBadge status={booking.status} />
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center justify-end gap-2 mb-1">
                    <Text className="text-gray-800 font-bold text-base">
                      {booking.service}
                    </Text>
                    <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                      <Ionicons
                        name={booking.icon}
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                  </View>
                  <Text className="text-gray-500 text-right text-sm mb-2">
                    {booking.description}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <Text className="text-primary font-bold">{booking.price}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-600 text-sm">{booking.techName}</Text>
                  <View className="flex-row items-center gap-0.5">
                    <Text className="text-yellow-500 text-xs font-semibold">
                      {booking.techRating}
                    </Text>
                    <Ionicons name="star" size={12} color="#eab308" />
                  </View>
                </View>
              </View>
              <Text className="text-gray-400 text-xs text-right mt-2">
                {booking.date}
              </Text>
            </Card>
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
