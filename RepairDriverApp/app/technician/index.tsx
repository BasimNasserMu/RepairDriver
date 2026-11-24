import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { StatusBadge } from "../../src/components/ui/StatusBadge";
import {
  COLORS,
  COMMISSION_RATE,
  DEFAULT_WARRANTY_DAYS,
  SERVICE_ICONS,
} from "../../src/lib/constants";
import {
  AssignmentItem,
  useTechnicianAssignments,
} from "../../src/hooks/useTechnicianAssignments";

type Tab = "new" | "active";

const WARRANTY_OPTIONS = [0, 14, DEFAULT_WARRANTY_DAYS];

function formatSar(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export default function TechnicianAssignmentsScreen() {
  const { t } = useTranslation();
  const {
    pending,
    active,
    loading,
    refreshing,
    error,
    refresh,
    confirm,
    start,
    complete,
  } = useTechnicianAssignments();

  const [tab, setTab] = useState<Tab>("new");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [completing, setCompleting] = useState<AssignmentItem | null>(null);
  const [warrantyDays, setWarrantyDays] = useState(DEFAULT_WARRANTY_DAYS);

  const list = tab === "new" ? pending : active;

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } catch (e) {
      const message = e instanceof Error ? e.message : (e as { message?: string })?.message;
      Alert.alert(t("common.error"), message);
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirm = (item: AssignmentItem) =>
    run(item.assignment.id, async () => {
      await confirm(item.assignment.id);
      Alert.alert(t("assignments.confirmedTitle"));
      setTab("active");
    });

  const handleStart = (item: AssignmentItem) =>
    run(item.assignment.id, async () => {
      await start(item.request.id);
      Alert.alert(t("assignments.startedTitle"));
    });

  const openComplete = (item: AssignmentItem) => {
    setWarrantyDays(DEFAULT_WARRANTY_DAYS);
    setCompleting(item);
  };

  const handleComplete = () => {
    if (!completing) return;
    const item = completing;
    run(item.assignment.id, async () => {
      const result = await complete(item.request.id, warrantyDays);
      setCompleting(null);
      Alert.alert(
        t("assignments.completedTitle"),
        t("assignments.completedDesc", {
          commission: formatSar(result.commission ?? 0),
          balance: formatSar(result.new_balance),
        }) + (result.suspended ? `\n\n${t("assignments.suspendedWarning")}` : "")
      );
    });
  };

  const renderAction = (item: AssignmentItem) => {
    const busy = busyId === item.assignment.id;
    if (item.assignment.status === "pending") {
      return (
        <Button
          title={t("assignments.confirm")}
          icon="checkmark-circle-outline"
          onPress={() => handleConfirm(item)}
          loading={busy}
          disabled={busyId !== null}
          size="sm"
        />
      );
    }
    if (item.request.status === "confirmed") {
      return (
        <Button
          title={t("assignments.start")}
          icon="play-outline"
          onPress={() => handleStart(item)}
          loading={busy}
          disabled={busyId !== null}
          size="sm"
        />
      );
    }
    if (item.request.status === "in_progress") {
      return (
        <Button
          title={t("assignments.complete")}
          icon="checkmark-done-outline"
          onPress={() => openComplete(item)}
          loading={busy}
          disabled={busyId !== null}
          size="sm"
        />
      );
    }
    return null;
  };

  const renderCard = (item: AssignmentItem) => {
    const { request, customer } = item;
    const emergency = request.urgency === "emergency";
    const icon = (SERVICE_ICONS[request.category] ?? SERVICE_ICONS.general) as keyof typeof Ionicons.glyphMap;

    return (
      <Card key={item.assignment.id} className="mb-3">
        {/* Header row: badges | service */}
        <View className="flex-row items-start">
          <View className="gap-1.5 items-start">
            {item.assignment.status === "confirmed" && (
              <StatusBadge status={request.status} />
            )}
            {emergency && (
              <View className="bg-danger/10 px-2 py-0.5 rounded-full">
                <Text className="text-danger text-xs font-semibold">
                  {t("serviceRequest.emergency")}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1 mr-3">
            <View className="flex-row items-center justify-end gap-2 mb-1">
              <Text className="text-gray-800 font-bold text-base">
                {t(`services.${request.category}`, { defaultValue: request.category })}
              </Text>
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  emergency ? "bg-danger/10" : "bg-primary/10"
                }`}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color={emergency ? COLORS.danger : COLORS.primary}
                />
              </View>
            </View>
            <Text className="text-gray-500 text-right text-sm" numberOfLines={3}>
              {request.description}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="border-t border-gray-100 mt-3 pt-3 gap-2">
          {customer && (
            <View className="flex-row items-center justify-end gap-1.5">
              <Text className="text-gray-600 text-sm">{customer.full_name}</Text>
              <Ionicons name="person-outline" size={14} color={COLORS.gray[400]} />
            </View>
          )}
          <View className="flex-row items-center justify-end gap-1.5">
            <Text className="text-gray-600 text-sm" numberOfLines={1}>
              {request.location_address}
            </Text>
            <Ionicons name="location-outline" size={14} color={COLORS.gray[400]} />
          </View>
          {request.photos.length > 0 && (
            <View className="flex-row items-center justify-end gap-1.5">
              <Text className="text-gray-600 text-sm">
                {t("assignments.photos", { count: request.photos.length })}
              </Text>
              <Ionicons name="image-outline" size={14} color={COLORS.gray[400]} />
            </View>
          )}
        </View>

        {/* Price + action */}
        <View className="flex-row items-center mt-3 gap-3">
          <View className="flex-1">{renderAction(item)}</View>
          <View className="items-end">
            <Text className="text-gray-400 text-xs">{t("assignments.price")}</Text>
            <Text className="text-primary font-bold text-lg">
              {request.assigned_price != null
                ? `${formatSar(request.assigned_price)} ${t("common.sar")}`
                : t("assignments.priceNotSet")}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "active", label: t("assignments.tabActive"), count: active.length },
    { key: "new", label: t("assignments.tabNew"), count: pending.length },
  ];

  const completingPrice = completing?.request.assigned_price ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="bg-primary px-6 pt-4 pb-5">
        <Text className="text-white text-2xl font-bold text-right mb-4">
          {t("assignments.title")}
        </Text>
        <View className="flex-row bg-white/10 rounded-xl p-1">
          {tabs.map(({ key, label, count }) => {
            const selected = tab === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setTab(key)}
                className={`flex-1 flex-row items-center justify-center py-2 rounded-lg gap-2 ${
                  selected ? "bg-white" : ""
                }`}
              >
                {count > 0 && (
                  <View
                    className={`min-w-5 h-5 px-1.5 rounded-full items-center justify-center ${
                      selected ? "bg-primary" : "bg-white/20"
                    }`}
                  >
                    <Text className="text-white text-xs font-bold">{count}</Text>
                  </View>
                )}
                <Text
                  className={`font-semibold ${selected ? "text-primary" : "text-white/80"}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-4"
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
              <Button
                title={t("common.retry")}
                variant="outline"
                size="sm"
                onPress={refresh}
              />
            </Card>
          )}

          {list.length === 0 && !error ? (
            tab === "new" ? (
              <EmptyState
                icon="file-tray-outline"
                title={t("assignments.noNew")}
                description={t("assignments.noNewDesc")}
              />
            ) : (
              <EmptyState
                icon="construct-outline"
                title={t("assignments.noActive")}
                description={t("assignments.noActiveDesc")}
              />
            )
          ) : (
            list.map(renderCard)
          )}
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Complete job sheet */}
      <Modal
        visible={completing !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setCompleting(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity onPress={() => setCompleting(null)}>
                <Ionicons name="close" size={26} color={COLORS.gray[500]} />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">
                {t("assignments.completeTitle")}
              </Text>
            </View>

            <Text className="text-gray-700 font-semibold text-right mb-3">
              {t("assignments.warranty")}
            </Text>
            <View className="flex-row gap-2 mb-5">
              {WARRANTY_OPTIONS.map((days) => {
                const selected = warrantyDays === days;
                return (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setWarrantyDays(days)}
                    className={`flex-1 py-3 rounded-xl items-center border-2 ${
                      selected ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${selected ? "text-primary" : "text-gray-600"}`}
                    >
                      {days === 0
                        ? t("assignments.noWarranty")
                        : t("assignments.days", { count: days })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="bg-secondary rounded-xl p-4 mb-5 flex-row items-start gap-2">
              <Text className="flex-1 text-gray-600 text-right text-sm">
                {t("assignments.commissionNote", {
                  amount: formatSar(Math.round(completingPrice * COMMISSION_RATE * 100) / 100),
                })}
              </Text>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            </View>

            <Button
              title={t("assignments.complete")}
              icon="checkmark-done-outline"
              onPress={handleComplete}
              loading={completing !== null && busyId === completing.assignment.id}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
