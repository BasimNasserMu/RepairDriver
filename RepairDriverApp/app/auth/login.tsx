import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/contexts/AuthContext";
import { COLORS } from "../../src/lib/constants";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signInWithPhone } = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || phone.length < 9) {
      Alert.alert(t("common.error"), "يرجى إدخال رقم جوال صحيح");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith("+") ? phone : `+966${phone}`;
      await signInWithPhone(fullPhone);
      router.push({ pathname: "/auth/otp", params: { phone: fullPhone } });
    } catch (error) {
      // In demo mode, navigate directly
      router.push({ pathname: "/auth/otp", params: { phone: `+966${phone}` } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo & Title */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-6">
              <Text className="text-white text-4xl font-bold">RD</Text>
            </View>
            <Text className="text-3xl font-bold text-primary mb-2">
              ريبير درايفر
            </Text>
            <Text className="text-gray-500 text-base">
              خدمات الصيانة المنزلية
            </Text>
          </View>

          {/* Phone Input */}
          <View className="mb-6">
            <Text className="text-gray-800 text-lg font-bold mb-4 text-right">
              {t("auth.login")}
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
              <View className="bg-gray-50 px-4 py-4 border-l border-gray-200">
                <Text className="text-gray-600 font-semibold">966+</Text>
              </View>
              <View className="flex-1">
                <Input
                  placeholder={t("auth.enterPhone")}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          {/* Login Button */}
          <Button
            title={t("auth.login")}
            onPress={handleLogin}
            loading={loading}
            icon="arrow-back-outline"
            iconPosition="left"
          />

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-400 mx-4 text-sm">
              {t("auth.orContinueWith")}
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Login */}
          <View className="gap-3">
            <TouchableOpacity className="flex-row items-center justify-center bg-black rounded-xl py-3.5 gap-2">
              <Ionicons name="logo-apple" size={22} color="#fff" />
              <Text className="text-white font-semibold text-base">
                {t("auth.appleSignIn")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3.5 gap-2">
              <Ionicons name="logo-google" size={22} color="#DB4437" />
              <Text className="text-gray-700 font-semibold text-base">
                {t("auth.googleSignIn")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text className="text-gray-400 text-xs text-center mt-8 leading-5">
            {t("auth.termsAgree")}{" "}
            <Text className="text-primary">{t("auth.termsOfService")}</Text>{" "}
            {t("auth.and")}{" "}
            <Text className="text-primary">{t("auth.privacyPolicy")}</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
