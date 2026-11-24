import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { CustomerRequestCard } from "../../src/components/CustomerRequestCard";
import { COLORS } from "../../src/lib/constants";
import {
  CustomerRequestItem,
  useCustomerRequests,
} from "../../src/hooks/useCustomerRequests";

type TabFilter = "all" | "active" | "completed";

export default function BookingsScreen() {
  const { t } = useTranslation();
  const { items, active, loading, refreshing, error, refresh, cancel } =
    useCustomerRequests();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filtered =
    activeTab === "active"
      ? active
      : activeTab === "completed"
      ? items.filter((i) => i.request.status === "completed")
      : items;

  const handleCancel = (item: CustomerRequestItem) => {
    Alert.alert(t("requests.cancelTitle"), t("requests.cancelConfirm"), [
      { text: t("common.no"), style: "cancel" },
      {
        text: t("requests.cancelRequest"),
        style: "destructive",
        onPress: async () => {
          setCancellingId(item.request.id);
          try {
            await cancel(item.request.id);
          } catch (e) {
            const message = e instanceof Error ? e.message : (e as { message?: string })?.message;
            Alert.alert(t("common.error"), message);
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {error && (
            <Card variant="outlined" className="mb-3 border-danger/30">
              <Text className="text-danger text-right mb-3">{error}</Text>
              <Button title={t("common.retry")} variant="outline" size="sm" onPress={refresh} />
            </Card>
          )}

          {filtered.length === 0 && !error ? (
            <EmptyState
              icon="calendar-outline"
              title={activeTab === "all" ? t("requests.noRequests") : t("customer.noActiveJobs")}
              description={activeTab === "all" ? t("requests.noRequestsDesc") : undefined}
            />
          ) : (
            filtered.map((item) => (
              <CustomerRequestCard
                key={item.request.id}
                item={item}
                onCancel={handleCancel}
                cancelling={cancellingId === item.request.id}
              />
            ))
          )}
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
