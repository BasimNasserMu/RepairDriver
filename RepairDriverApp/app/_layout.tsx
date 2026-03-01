import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { I18nManager } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/contexts/AuthContext";
import "../src/i18n";

// Force RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_left",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="customer" options={{ headerShown: false }} />
        <Stack.Screen name="technician" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
