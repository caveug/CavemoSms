import React from "react";
import { View } from "react-native";
import MainTabNavigator from "./components/MainTabNavigator";
import AppWrapper from "./components/AppWrapper";

// IMPORTANT: This is a simplified web-specific entry point with no animations
// It bypasses the complex navigation chain that might cause bus errors
// and directly renders the main app content without the splash/onboarding flow
export default function WebEntry() {
  return (
    <AppWrapper>
      <View style={{ flex: 1 }}>
        <MainTabNavigator />
      </View>
    </AppWrapper>
  );
}
