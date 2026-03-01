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

type TabFilter = "active" | "completed" | "cancelled";

const DEMO_JOBS = [
  {
    id: "1",
    service: "كهرباء",
    icon: "flash-outline" as const,
    customerName: "سارة أحمد",
    description: "انقطاع كهرباء في غرفة المعيشة",
    status: "in_progress" as ServiceRequestStatus,
    price: "150 ر.س",
    date: "1 مارس 2026",
    address: "الرياض، حي النرجس",
  },
  {
    id: "2",
    service: "سباكة",
    icon: "water-outline" as const,
    customerName: "محمد عبدالله",
    description: "تسريب مياه تحت المغسلة",
    status: "accepted" as ServiceRequestStatus,
    price: "200 ر.س",
    date: "28 فبراير 2026",
    address: "الرياض، حي الياسمين",
  },
  {
    id: "3",
    service: "تكييف",
    icon: "thermometer-outline" as const,
    customerName: "عبدالرحمن خالد",
    description: "صيانة مكيف سبليت",
    status: "completed" as ServiceRequestStatus,
    price: "85 ر.س",
    date: "25 فبراير 2026",
    address: "الرياض، حي الملقا",
  },
  {
    id: "4",
    service: "كهرباء",
    icon: "flash-outline" as const,
    customerName: "نورة محمد",
    description: "تركيب إنارة حديقة",
    status: "completed" as ServiceRequestStatus,
    price: "350 ر.س",
    date: "22 فبراير 2026",
    address: "الرياض، حي العليا",
  },
];

export default function TechnicianJobsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabFilter>("active");

  const filteredJobs = DEMO_JOBS.filter((job) => {
    if (activeTab === "active")
      return !["completed", "cancelled"].includes(job.status);
    if (activeTab === "completed") return job.status === "completed";
    if (activeTab === "cancelled") return job.status === "cancelled";
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-gray-800 text-right">
          {t("technician.jobs")}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-4 gap-2">
        {(["active", "completed", "cancelled"] as TabFilter[]).map((tab) => (
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
              {tab === "active"
                ? t("customer.activeJobs")
                : tab === "completed"
                ? t("status.completed")
                : t("status.cancelled")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Jobs List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title={t("common.noData")}
          />
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="mb-3" onPress={() => {}}>
              <View className="flex-row items-start">
                <StatusBadge status={job.status} />
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center justify-end gap-2 mb-1">
                    <Text className="text-gray-800 font-bold text-base">
                      {job.service}
                    </Text>
                    <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                      <Ionicons
                        name={job.icon}
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                  </View>
                  <Text className="text-gray-500 text-right text-sm mb-2">
                    {job.description}
                  </Text>
                  <View className="flex-row items-center justify-end gap-1">
                    <Text className="text-gray-400 text-xs">{job.customerName}</Text>
                    <Ionicons name="person-outline" size={12} color={COLORS.gray[400]} />
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <Text className="text-primary font-bold text-base">
                  {job.price}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-gray-400 text-xs">{job.address}</Text>
                  <Ionicons name="location-outline" size={12} color={COLORS.gray[400]} />
                </View>
              </View>
              <Text className="text-gray-400 text-xs text-right mt-2">
                {job.date}
              </Text>
            </Card>
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
