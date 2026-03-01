import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../src/components/ui/Button";
import { ServiceIcon } from "../../src/components/ui/ServiceIcon";
import { COLORS } from "../../src/lib/constants";

const SERVICES = [
  { id: "1", key: "plumbing", icon: "water-outline" as const },
  { id: "2", key: "electrical", icon: "flash-outline" as const },
  { id: "3", key: "hvac", icon: "thermometer-outline" as const },
  { id: "4", key: "painting", icon: "color-palette-outline" as const },
  { id: "5", key: "carpentry", icon: "hammer-outline" as const },
  { id: "6", key: "cleaning", icon: "sparkles-outline" as const },
  { id: "7", key: "general", icon: "build-outline" as const },
];

export default function NewRequestScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "emergency">("normal");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddPhoto = () => {
    // In production, use expo-image-picker
    if (photos.length < 5) {
      setPhotos([...photos, `photo_${photos.length + 1}`]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      Alert.alert(t("common.error"), "يرجى اختيار نوع الخدمة");
      return;
    }
    if (!description.trim()) {
      Alert.alert(t("common.error"), "يرجى وصف المشكلة");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t("serviceRequest.requestSent"),
        t("serviceRequest.requestSentDesc"),
        [{ text: t("common.ok"), onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
          <View className="w-10" />
          <Text className="text-xl font-bold text-gray-800">
            {t("serviceRequest.title")}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="close" size={22} color={COLORS.gray[600]} />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {/* Service Selection */}
          <Text className="text-base font-bold text-gray-800 mb-3 text-right">
            {t("serviceRequest.selectService")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 12 }}
          >
            {SERVICES.map((service) => (
              <ServiceIcon
                key={service.id}
                name={t(`services.${service.key}`)}
                icon={service.icon}
                isSelected={selectedService === service.id}
                onPress={() => setSelectedService(service.id)}
                size="sm"
              />
            ))}
          </ScrollView>

          {/* Description */}
          <Text className="text-base font-bold text-gray-800 mb-3 text-right">
            {t("serviceRequest.describeIssue")}
          </Text>
          <View className="bg-white border border-gray-200 rounded-xl mb-6">
            <TextInput
              className="p-4 text-right text-base text-gray-800"
              placeholder={t("serviceRequest.descriptionPlaceholder")}
              placeholderTextColor={COLORS.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 120, writingDirection: "rtl" }}
            />
          </View>

          {/* Photos */}
          <Text className="text-base font-bold text-gray-800 mb-1 text-right">
            {t("serviceRequest.addPhotos")}
          </Text>
          <Text className="text-xs text-gray-400 mb-3 text-right">
            {t("serviceRequest.addPhotosHint")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 12 }}
          >
            <TouchableOpacity
              onPress={handleAddPhoto}
              className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-xl items-center justify-center"
            >
              <Ionicons name="camera-outline" size={28} color={COLORS.gray[400]} />
              <Text className="text-gray-400 text-xs mt-1">
                {photos.length}/5
              </Text>
            </TouchableOpacity>
            {photos.map((_, index) => (
              <View
                key={index}
                className="w-24 h-24 bg-gray-200 rounded-xl items-center justify-center"
              >
                <Ionicons name="image-outline" size={32} color={COLORS.gray[500]} />
                <TouchableOpacity
                  onPress={() =>
                    setPhotos(photos.filter((_, i) => i !== index))
                  }
                  className="absolute -top-2 -left-2 w-6 h-6 bg-danger rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Urgency */}
          <Text className="text-base font-bold text-gray-800 mb-3 text-right">
            {t("serviceRequest.urgencyLevel")}
          </Text>
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setUrgency("emergency")}
              className={`flex-1 py-3 rounded-xl items-center border-2 ${
                urgency === "emergency"
                  ? "bg-danger/10 border-danger"
                  : "bg-white border-gray-200"
              }`}
            >
              <Ionicons
                name="warning-outline"
                size={24}
                color={urgency === "emergency" ? COLORS.danger : COLORS.gray[400]}
              />
              <Text
                className={`mt-1 font-semibold ${
                  urgency === "emergency" ? "text-danger" : "text-gray-500"
                }`}
              >
                {t("serviceRequest.emergency")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUrgency("normal")}
              className={`flex-1 py-3 rounded-xl items-center border-2 ${
                urgency === "normal"
                  ? "bg-primary/10 border-primary"
                  : "bg-white border-gray-200"
              }`}
            >
              <Ionicons
                name="time-outline"
                size={24}
                color={urgency === "normal" ? COLORS.primary : COLORS.gray[400]}
              />
              <Text
                className={`mt-1 font-semibold ${
                  urgency === "normal" ? "text-primary" : "text-gray-500"
                }`}
              >
                {t("serviceRequest.normal")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <Text className="text-base font-bold text-gray-800 mb-3 text-right">
            {t("serviceRequest.location")}
          </Text>
          <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center mb-8">
            <Ionicons
              name="chevron-back"
              size={20}
              color={COLORS.gray[400]}
            />
            <View className="flex-1 items-end mr-3">
              <Text className="text-gray-800 font-semibold">
                {t("serviceRequest.currentLocation")}
              </Text>
              <Text className="text-gray-400 text-sm mt-0.5">
                الرياض، المملكة العربية السعودية
              </Text>
            </View>
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
              <Ionicons name="location" size={22} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Submit */}
          <Button
            title={t("serviceRequest.submitRequest")}
            onPress={handleSubmit}
            loading={loading}
            icon="send-outline"
            iconPosition="left"
          />
          <View className="h-8" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
