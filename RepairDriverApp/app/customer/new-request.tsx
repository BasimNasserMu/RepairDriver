import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Button } from "../../src/components/ui/Button";
import { ServiceIcon } from "../../src/components/ui/ServiceIcon";
import { COLORS, MAX_PHOTOS, SERVICE_ICONS } from "../../src/lib/constants";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  createServiceRequest,
  LocalPhoto,
  RequestLocation,
} from "../../src/lib/requests";
import type { Urgency } from "../../src/types/database";

const SERVICE_KEYS = [
  "plumbing",
  "electrical",
  "hvac",
  "painting",
  "carpentry",
  "cleaning",
  "general",
] as const;

function formatAddress(place: Location.LocationGeocodedAddress | undefined, lat: number, lng: number) {
  const parts = [place?.district, place?.street ?? place?.name, place?.city]
    .filter((p): p is string => !!p && p.trim().length > 0);
  const unique = [...new Set(parts)];
  return unique.length > 0 ? unique.join("، ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export default function NewRequestScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [location, setLocation] = useState<RequestLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const locate = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("common.error"), t("requests.locationPermissionDenied"));
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = position.coords;
      let place: Location.LocationGeocodedAddress | undefined;
      try {
        [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      } catch {
        // Address lookup is best-effort; coordinates are what matter.
      }
      setLocation({ lat, lng, address: formatAddress(place, lat, lng) });
    } catch {
      Alert.alert(t("common.error"), t("requests.locationFailed"));
    } finally {
      setLocating(false);
    }
  }, [t]);

  useEffect(() => {
    locate();
  }, [locate]);

  const addPhotos = async (source: "camera" | "library") => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;

    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("common.error"), t("requests.photoPermissionDenied"));
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      quality: 0.6,
    };
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync({
            ...options,
            allowsMultipleSelection: true,
            selectionLimit: remaining,
          });
    if (result.canceled) return;

    const picked = result.assets.map((a) => ({ uri: a.uri, mimeType: a.mimeType }));
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  };

  const handleAddPhoto = () => {
    Alert.alert(t("serviceRequest.addPhotos"), undefined, [
      { text: t("requests.takePhoto"), onPress: () => addPhotos("camera") },
      { text: t("requests.chooseFromLibrary"), onPress: () => addPhotos("library") },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const resetForm = () => {
    setCategory(null);
    setDescription("");
    setUrgency("normal");
    setPhotos([]);
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert(t("common.error"), t("requests.selectServiceError"));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t("common.error"), t("requests.describeIssueError"));
      return;
    }
    if (!location) {
      Alert.alert(t("common.error"), t("requests.locationRequired"));
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      await createServiceRequest({
        customerId: user.id,
        category,
        description,
        urgency,
        photos,
        location,
      });
      resetForm();
      Alert.alert(
        t("serviceRequest.requestSent"),
        t("serviceRequest.requestSentDesc"),
        [{ text: t("common.ok"), onPress: () => router.push("/customer/bookings") }]
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : (e as { message?: string })?.message;
      Alert.alert(t("common.error"), message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            {SERVICE_KEYS.map((key) => (
              <ServiceIcon
                key={key}
                name={t(`services.${key}`)}
                icon={SERVICE_ICONS[key] as keyof typeof Ionicons.glyphMap}
                isSelected={category === key}
                onPress={() => setCategory(key)}
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
              maxLength={1000}
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
            contentContainerStyle={{ gap: 12, paddingTop: 8 }}
          >
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                onPress={handleAddPhoto}
                className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-xl items-center justify-center"
              >
                <Ionicons name="camera-outline" size={28} color={COLORS.gray[400]} />
                <Text className="text-gray-400 text-xs mt-1">
                  {photos.length}/{MAX_PHOTOS}
                </Text>
              </TouchableOpacity>
            )}
            {photos.map((photo, index) => (
              <View key={photo.uri} className="w-24 h-24">
                <Image
                  source={{ uri: photo.uri }}
                  className="w-24 h-24 rounded-xl bg-gray-200"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
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
          <TouchableOpacity
            onPress={locate}
            disabled={locating}
            className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center mb-8"
          >
            {locating ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Ionicons name="refresh" size={20} color={COLORS.gray[400]} />
            )}
            <View className="flex-1 items-end mr-3">
              <Text className="text-gray-800 font-semibold">
                {t("serviceRequest.currentLocation")}
              </Text>
              <Text className="text-gray-400 text-sm mt-0.5 text-right" numberOfLines={2}>
                {locating
                  ? t("requests.locating")
                  : location?.address ?? t("requests.locationTapToRetry")}
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
            loading={submitting}
            disabled={locating}
            icon="send-outline"
            iconPosition="left"
          />
          <View className="h-8" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
