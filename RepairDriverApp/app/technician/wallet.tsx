import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { COLORS } from "../../src/lib/constants";

interface Transaction {
  id: string;
  type: "earning" | "commission" | "top_up";
  description: string;
  amount: number;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "earning",
    description: "صيانة تكييف - طلب #1023",
    amount: 150,
    date: "اليوم",
    icon: "arrow-down-circle-outline",
  },
  {
    id: "2",
    type: "commission",
    description: "رسوم عمولة",
    amount: -22.5,
    date: "اليوم",
    icon: "remove-circle-outline",
  },
  {
    id: "3",
    type: "earning",
    description: "إصلاح سباكة - طلب #1019",
    amount: 85,
    date: "أمس",
    icon: "arrow-down-circle-outline",
  },
  {
    id: "4",
    type: "top_up",
    description: "شحن محفظة",
    amount: 200,
    date: "24 أكتوبر",
    icon: "add-circle-outline",
  },
  {
    id: "5",
    type: "commission",
    description: "رسوم عمولة",
    amount: -8.5,
    date: "23 أكتوبر",
    icon: "remove-circle-outline",
  },
];

export default function WalletScreen() {
  const { t } = useTranslation();

  const balance = -150;
  const totalEarnings = 3450;
  const totalCommission = 450;
  const limitUsed = 75; // percentage

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <Text className="text-2xl font-bold text-gray-800 text-right">
            {t("wallet.title")}
          </Text>
        </View>

        {/* Balance Card */}
        <View className="px-5 mb-6">
          <View className="bg-primary rounded-2xl p-6 overflow-hidden">
            <View className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
            <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
            <Text className="text-white/70 text-sm text-right mb-1">
              {t("wallet.balance")}
            </Text>
            <View className="flex-row items-end justify-end gap-2 mb-4">
              <Text className="text-white/70 text-lg">ر.س</Text>
              <Text
                className={`text-4xl font-bold ${
                  balance < 0 ? "text-red-300" : "text-white"
                }`}
              >
                {Math.abs(balance).toFixed(2)}
                {balance < 0 ? "-" : ""}
              </Text>
            </View>
            <Button
              title={`${t("wallet.topUp")} / ${t("wallet.settle")}`}
              onPress={() => {}}
              variant="secondary"
              size="sm"
              icon="wallet-outline"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-5 flex-row gap-3 mb-6">
          <Card className="flex-1">
            <View className="items-end">
              <View className="flex-row items-center gap-1 mb-1">
                <Ionicons name="trending-up" size={14} color={COLORS.success} />
                <Text className="text-success text-xs font-semibold">12%↑</Text>
              </View>
              <Text className="text-primary text-xl font-bold">
                {totalEarnings.toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {t("wallet.totalEarnings")}
              </Text>
              <Text className="text-gray-400 text-[10px]">ر.س</Text>
            </View>
          </Card>
          <Card className="flex-1">
            <View className="items-end">
              <View className="flex-row items-center gap-1 mb-1">
                <Ionicons name="trending-down" size={14} color={COLORS.danger} />
                <Text className="text-danger text-xs font-semibold">
                  {t("wallet.platformFees")}
                </Text>
              </View>
              <Text className="text-primary text-xl font-bold">
                {totalCommission.toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {t("wallet.commission")}
              </Text>
              <Text className="text-gray-400 text-[10px]">ر.س</Text>
            </View>
          </Card>
        </View>

        {/* Negative Balance Limit */}
        <View className="px-5 mb-6">
          <Card>
            <View className="flex-row items-center justify-end gap-2 mb-3">
              <Text className="text-gray-800 font-bold">
                {t("wallet.negativeLimit")}
              </Text>
              <Ionicons
                name="warning-outline"
                size={20}
                color={COLORS.warning}
              />
            </View>
            <View className="bg-gray-100 h-3 rounded-full overflow-hidden mb-2">
              <View
                className={`h-full rounded-full ${
                  limitUsed > 80 ? "bg-danger" : limitUsed > 50 ? "bg-warning" : "bg-success"
                }`}
                style={{ width: `${limitUsed}%` }}
              />
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-400 text-xs">
                الحد: -200 ر.س
              </Text>
              <Text className="text-gray-600 text-sm font-semibold">
                {limitUsed}% مستخدم
              </Text>
            </View>
            {limitUsed > 70 && (
              <View className="bg-warning/10 rounded-lg p-2 mt-2 flex-row items-center justify-end gap-1">
                <Text className="text-warning text-xs font-semibold">
                  {t("wallet.limitWarning")}
                </Text>
                <Ionicons name="alert-circle" size={14} color={COLORS.warning} />
              </View>
            )}
          </Card>
        </View>

        {/* Recent Transactions */}
        <View className="px-5">
          <Text className="text-lg font-bold text-gray-800 text-right mb-4">
            {t("wallet.recentTransactions")}
          </Text>

          {DEMO_TRANSACTIONS.map((transaction) => (
            <View
              key={transaction.id}
              className="bg-white rounded-xl px-4 py-3.5 mb-2 flex-row items-center"
            >
              <Text
                className={`font-bold text-base ${
                  transaction.amount > 0 ? "text-success" : "text-danger"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toFixed(2)} ر.س
              </Text>
              <View className="flex-1 items-end mr-3">
                <Text className="text-gray-800 font-semibold text-sm">
                  {transaction.description}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {transaction.date}
                </Text>
              </View>
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  transaction.type === "earning"
                    ? "bg-success/10"
                    : transaction.type === "commission"
                    ? "bg-danger/10"
                    : "bg-primary/10"
                }`}
              >
                <Ionicons
                  name={transaction.icon}
                  size={22}
                  color={
                    transaction.type === "earning"
                      ? COLORS.success
                      : transaction.type === "commission"
                      ? COLORS.danger
                      : COLORS.primary
                  }
                />
              </View>
            </View>
          ))}
          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
