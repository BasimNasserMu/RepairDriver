import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { COLORS } from "../../src/lib/constants";

interface NearbyRequest {
  id: string;
  service: string;
  icon: keyof typeof Ionicons.glyphMap;
  customerName: string;
  description: string;
  distance: string;
  urgency: "normal" | "emergency";
  images: number;
  location: string;
}

const DEMO_REQUESTS: NearbyRequest[] = [
  {
    id: "1",
    service: "كهرباء",
    icon: "flash-outline",
    customerName: "سارة أحمد",
    description: "انقطاع كهرباء في غرفة المعيشة - القواطع تفصل باستمرار",
    distance: "2.5 كم",
    urgency: "emergency",
    images: 3,
    location: "الرياض، حي النرجس",
  },
  {
    id: "2",
    service: "سباكة",
    icon: "water-outline",
    customerName: "محمد عبدالله",
    description: "تسريب مياه تحت المغسلة في المطبخ",
    distance: "3.8 كم",
    urgency: "normal",
    images: 2,
    location: "الرياض، حي الياسمين",
  },
  {
    id: "3",
    service: "تكييف",
    icon: "thermometer-outline",
    customerName: "فاطمة علي",
    description: "مكيف سبليت لا يعمل - يصدر صوت عالي",
    distance: "5.1 كم",
    urgency: "normal",
    images: 1,
    location: "الرياض، حي الملقا",
  },
];

type FilterType = "all" | "emergency" | "nearby" | "high_value";

export default function TechnicianRadarScreen() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedRequest, setSelectedRequest] = useState<NearbyRequest | null>(
    null
  );
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteType, setQuoteType] = useState<"direct" | "inspection">("direct");

  const filters: { key: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "all", label: t("common.all"), icon: "apps-outline" },
    { key: "emergency", label: t("serviceRequest.emergency"), icon: "warning-outline" },
    { key: "nearby", label: "الأقرب", icon: "location-outline" },
    { key: "high_value", label: "قيمة عالية", icon: "trending-up-outline" },
  ];

  const handleOpenQuote = (request: NearbyRequest) => {
    setSelectedRequest(request);
    setShowQuoteModal(true);
  };

  const handleSendQuote = () => {
    if (quoteType === "direct" && !quotePrice) {
      Alert.alert(t("common.error"), "يرجى إدخال السعر");
      return;
    }
    Alert.alert("تم الإرسال", "تم إرسال عرضك بنجاح", [
      { text: t("common.ok"), onPress: () => setShowQuoteModal(false) },
    ]);
    setQuotePrice("");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="bg-primary px-6 pt-4 pb-6">
        <Text className="text-white text-2xl font-bold text-right mb-4">
          {t("technician.requestRadar")}
        </Text>

        {/* Search */}
        <TouchableOpacity className="bg-white/10 rounded-xl flex-row items-center px-4 py-3">
          <Ionicons name="options-outline" size={20} color="#fff" />
          <Text className="flex-1 text-white/60 text-right mr-3">
            {t("common.search")}...
          </Text>
          <Ionicons name="search-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View className="bg-gray-200 h-48 items-center justify-center relative">
        <Ionicons name="map-outline" size={48} color={COLORS.gray[400]} />
        <Text className="text-gray-400 mt-2">خريطة الطلبات القريبة</Text>
        {/* Floating Location Button */}
        <TouchableOpacity className="absolute bottom-3 left-3 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md">
          <Ionicons name="locate" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        {/* Floating map pins */}
        <View className="absolute top-8 right-20 w-10 h-10 bg-danger rounded-full items-center justify-center shadow-md">
          <Ionicons name="flash" size={18} color="#fff" />
        </View>
        <View className="absolute top-20 left-16 w-10 h-10 bg-primary rounded-full items-center justify-center shadow-md">
          <Ionicons name="water" size={18} color="#fff" />
        </View>
        <View className="absolute bottom-16 right-12 w-10 h-10 bg-primary rounded-full items-center justify-center shadow-md">
          <Ionicons name="thermometer" size={18} color="#fff" />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            className={`flex-row items-center px-4 py-2 rounded-full gap-1.5 ${
              activeFilter === filter.key
                ? "bg-primary"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeFilter === filter.key ? "text-white" : "text-gray-600"
              }`}
            >
              {filter.label}
            </Text>
            <Ionicons
              name={filter.icon}
              size={16}
              color={activeFilter === filter.key ? "#fff" : COLORS.gray[500]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nearby Requests */}
      <View className="px-5 flex-row items-center justify-between mb-3">
        <Text className="text-gray-400 text-sm">{DEMO_REQUESTS.length} طلب</Text>
        <Text className="text-lg font-bold text-gray-800">
          {t("technician.nearbyRequests")}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {DEMO_REQUESTS.map((request) => (
          <Card
            key={request.id}
            className="mb-3"
            onPress={() => handleOpenQuote(request)}
          >
            <View className="flex-row items-start">
              {request.urgency === "emergency" && (
                <View className="bg-danger/10 px-2 py-0.5 rounded-full">
                  <Text className="text-danger text-xs font-semibold">طوارئ</Text>
                </View>
              )}
              <View className="flex-1 mr-3">
                <View className="flex-row items-center justify-end gap-2 mb-1">
                  <Text className="text-gray-800 font-bold text-base">
                    {request.service}
                  </Text>
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                      request.urgency === "emergency"
                        ? "bg-danger/10"
                        : "bg-primary/10"
                    }`}
                  >
                    <Ionicons
                      name={request.icon}
                      size={22}
                      color={
                        request.urgency === "emergency"
                          ? COLORS.danger
                          : COLORS.primary
                      }
                    />
                  </View>
                </View>
                <Text className="text-gray-500 text-right text-sm mb-2">
                  {request.description}
                </Text>
                <View className="flex-row items-center justify-end gap-3">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-gray-400 text-xs">
                      {request.images} صور
                    </Text>
                    <Ionicons name="image-outline" size={14} color={COLORS.gray[400]} />
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-gray-400 text-xs">
                      {request.distance}
                    </Text>
                    <Ionicons name="location-outline" size={14} color={COLORS.gray[400]} />
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}
        <View className="h-6" />
      </ScrollView>

      {/* Quote Modal */}
      <Modal
        visible={showQuoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuoteModal(false)}
      >
        <SafeAreaView className="flex-1 bg-background-light">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Modal Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
              <View className="w-10" />
              <Text className="text-lg font-bold text-gray-800">
                {t("technician.sendResponse")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowQuoteModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={22} color={COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <View className="px-6 py-4">
                {/* Customer Info */}
                <View className="flex-row items-center justify-end mb-4">
                  <View className="items-end mr-3">
                    <Text className="text-gray-800 font-bold text-base">
                      {selectedRequest.customerName}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {selectedRequest.location} • {selectedRequest.distance}
                    </Text>
                  </View>
                  <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                    <Text className="text-primary font-bold text-lg">
                      {selectedRequest.customerName.charAt(0)}
                    </Text>
                  </View>
                </View>

                {/* Problem Details */}
                <Text className="text-base font-bold text-gray-800 mb-2 text-right">
                  {t("technician.problemDetails")}
                </Text>
                <Card className="mb-4">
                  <View className="flex-row items-center justify-end gap-2 mb-2">
                    <Text className="text-primary font-bold">
                      {selectedRequest.service}
                    </Text>
                    <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                      <Ionicons
                        name={selectedRequest.icon}
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                  </View>
                  <Text className="text-gray-600 text-right text-sm leading-5">
                    {selectedRequest.description}
                  </Text>
                </Card>

                {/* Photo Placeholders */}
                <View className="flex-row gap-2 mb-6 justify-end">
                  {Array.from({ length: selectedRequest.images }).map((_, i) => (
                    <View
                      key={i}
                      className="w-24 h-24 bg-gray-200 rounded-xl items-center justify-center"
                    >
                      <Ionicons name="image-outline" size={28} color={COLORS.gray[400]} />
                    </View>
                  ))}
                </View>

                {/* Quote Options */}
                <Text className="text-base font-bold text-gray-800 mb-3 text-right">
                  نوع الرد
                </Text>

                {/* Direct Quote */}
                <TouchableOpacity
                  onPress={() => setQuoteType("direct")}
                  className={`border-2 rounded-xl p-4 mb-3 ${
                    quoteType === "direct"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View className="flex-row items-center justify-end gap-2 mb-2">
                    <Text className="text-gray-800 font-bold">
                      {t("quotes.directQuote")}
                    </Text>
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        quoteType === "direct"
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {quoteType === "direct" && (
                        <View className="w-3 h-3 bg-primary rounded-full" />
                      )}
                    </View>
                  </View>
                  {quoteType === "direct" && (
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mt-2">
                      <Text className="text-gray-500 text-sm">ر.س</Text>
                      <TextInput
                        className="flex-1 text-right text-lg font-bold text-gray-800"
                        placeholder={t("technician.enterPrice")}
                        placeholderTextColor={COLORS.gray[400]}
                        value={quotePrice}
                        onChangeText={setQuotePrice}
                        keyboardType="numeric"
                        style={{ writingDirection: "rtl" }}
                      />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Inspection Request */}
                <TouchableOpacity
                  onPress={() => setQuoteType("inspection")}
                  className={`border-2 rounded-xl p-4 mb-6 ${
                    quoteType === "inspection"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View className="flex-row items-center justify-end gap-2 mb-1">
                    <Text className="text-gray-800 font-bold">
                      {t("quotes.inspectionRequest")}
                    </Text>
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        quoteType === "inspection"
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {quoteType === "inspection" && (
                        <View className="w-3 h-3 bg-primary rounded-full" />
                      )}
                    </View>
                  </View>
                  <Text className="text-gray-500 text-right text-sm">
                    {t("technician.inspectionFeeNote")}
                  </Text>
                </TouchableOpacity>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      title={t("technician.decline")}
                      onPress={() => setShowQuoteModal(false)}
                      variant="outline"
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title={t("technician.sendResponse")}
                      onPress={handleSendQuote}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
