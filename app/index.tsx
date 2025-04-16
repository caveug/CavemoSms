import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import MainTabNavigator from "./components/MainTabNavigator";
import { Platform, View } from "react-native";
import { applyModuleEnchantments } from "./module-enchantments";
import AppWrapper from "./components/AppWrapper";

// Apply module enchantments to fix resolution issues
if (Platform.OS === "web") {
  // Initialize the ModuleWizard system
  applyModuleEnchantments();
}

export default function Page() {
  const router = useRouter();

  // Platform-specific navigation strategy
  useEffect(() => {
    if (Platform.OS === "web") {
      // On web, redirect to our simplified web entry point
      try {
        router.replace("/web-entry");
      } catch (e) {
        console.warn("Web navigation error:", e);
      }
    } else {
      // On native, use the full navigation flow with splash screen
      try {
        const timer = setTimeout(() => {
          router.replace("/splash");
        }, 100);

        return () => clearTimeout(timer);
      } catch (e) {
        console.warn("Native navigation error:", e);
      }
    }
  }, []);

  // Render a minimal placeholder while navigation is happening
  return (
    <AppWrapper>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <MainTabNavigator />
      </View>
    </AppWrapper>
  );
}
