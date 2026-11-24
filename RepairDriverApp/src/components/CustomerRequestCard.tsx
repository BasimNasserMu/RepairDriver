import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { StatusBadge } from "./ui/StatusBadge";
import { COLORS, SERVICE_ICONS } from "../lib/constants";
import { canCustomerCancel } from "../lib/requests";
import type { CustomerRequestItem } from "../hooks/useCustomerRequests";

interface Props {
  item: CustomerRequestItem;
  onCancel?: (item: CustomerRequestItem) => void;
  cancelling?: boolean;
}

export function formatRequestDate(iso: string, language: string) {
  try {
    return new Date(iso).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function CustomerRequestCard({ item, onCancel, cancelling }: Props) {
  const { t, i18n } = useTranslation();
  const { request, technician } = item;
  const icon = (SERVICE_ICONS[request.category] ?? SERVICE_ICONS.general) as keyof typeof Ionicons.glyphMap;
  const showCancel = onCancel && canCustomerCancel(request);

  return (
    <Card className="mb-3">
      <View className="flex-row items-start">
        <View className="gap-1.5 items-start">
          <StatusBadge status={request.status} />
          {request.urgency === "emergency" && (
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
            <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
              <Ionicons name={icon} size={18} color={COLORS.primary} />
            </View>
          </View>
          <Text className="text-gray-500 text-right text-sm" numberOfLines={2}>
            {request.description}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <Text className="text-primary font-bold">
          {request.assigned_price != null
            ? `${request.assigned_price} ${t("common.sar")}`
            : t("requests.awaitingPrice")}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-gray-600 text-sm">
            {technician?.full_name ?? t("requests.awaitingTechnician")}
          </Text>
          <Ionicons name="person-outline" size={14} color={COLORS.gray[400]} />
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-2">
        {showCancel ? (
          <TouchableOpacity
            onPress={() => onCancel(item)}
            disabled={cancelling}
            className={cancelling ? "opacity-50" : ""}
          >
            <Text className="text-danger text-sm font-semibold">
              {t("requests.cancelRequest")}
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <Text className="text-gray-400 text-xs">
          {formatRequestDate(request.created_at, i18n.language)}
        </Text>
      </View>
    </Card>
  );
}
