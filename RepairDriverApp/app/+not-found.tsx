import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "الصفحة غير موجودة" }} />
      <View className="flex-1 items-center justify-center p-5 bg-background-light">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          هذه الصفحة غير موجودة
        </Text>
        <Link href="/">
          <Text className="text-primary font-semibold text-base">
            العودة للرئيسية
          </Text>
        </Link>
      </View>
    </>
  );
}
