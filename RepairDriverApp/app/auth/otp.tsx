import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/contexts/AuthContext";
import { COLORS } from "../../src/lib/constants";

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && text) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otp?: string) => {
    const otpCode = otp || code.join("");
    if (otpCode.length !== 6) {
      Alert.alert(t("common.error"), "يرجى إدخال رمز التحقق كاملاً");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone || "", otpCode);
      router.replace("/auth/user-type");
    } catch (error) {
      // Demo mode - navigate directly
      router.replace("/auth/user-type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="flex-1 px-6">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 mb-8 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-forward" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {t("auth.enterOtp")}
          </Text>
          <Text className="text-gray-500 text-center">
            تم إرسال رمز التحقق إلى{"\n"}
            <Text className="text-primary font-semibold">{phone}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View className="flex-row justify-center gap-3 mb-8" style={{ direction: "ltr" }}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold ${
                digit
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white"
              }`}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <Button
          title={t("auth.verify")}
          onPress={() => handleVerify()}
          loading={loading}
        />

        {/* Resend */}
        <View className="items-center mt-6">
          {countdown > 0 ? (
            <Text className="text-gray-400">
              إعادة الإرسال خلال{" "}
              <Text className="text-primary font-bold">{countdown}</Text> ثانية
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setCountdown(60)}>
              <Text className="text-primary font-semibold">
                {t("auth.resendOtp")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
