import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { ServiceRequestStatus } from "../../types/database";

interface StatusBadgeProps {
  status: ServiceRequestStatus;
}

const statusColors: Record<ServiceRequestStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  quote_received: { bg: "bg-blue-100", text: "text-blue-700" },
  inspection_scheduled: { bg: "bg-purple-100", text: "text-purple-700" },
  accepted: { bg: "bg-green-100", text: "text-green-700" },
  in_progress: { bg: "bg-primary/10", text: "text-primary" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
  cancelled: { bg: "bg-red-100", text: "text-red-700" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const colors = statusColors[status];

  return (
    <View className={`${colors.bg} px-3 py-1 rounded-full`}>
      <Text className={`${colors.text} text-xs font-semibold`}>
        {t(`status.${status}`)}
      </Text>
    </View>
  );
}
