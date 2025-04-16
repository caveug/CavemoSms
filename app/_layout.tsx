import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";
import { Platform } from "react-native";
import ErrorBoundary from "./components/ErrorBoundary";

// Disable reanimated in web mode to prevent bus errors
if (Platform.OS === "web") {
  console.log("Running in web mode - disabling certain native features");
}

// Only prevent splash screen auto-hiding on native platforms
if (Platform.OS !== "web") {
  try {
    SplashScreen.preventAutoHideAsync();
  } catch (e) {
    console.warn("Error preventing splash screen auto hide:", e);
  }
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize Tempo devtools only in web environment
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
      try {
        const { TempoDevtools } = require("tempo-devtools");
        TempoDevtools.init();
      } catch (e) {
        console.warn("Error initializing Tempo devtools:", e);
      }
    }
  }, []);

  // Hide splash screen when fonts are loaded (only on native)
  useEffect(() => {
    if (loaded && Platform.OS !== "web") {
      try {
        SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Error hiding splash screen:", e);
      }
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Use a simplified layout for web to avoid navigation issues
  if (Platform.OS === "web") {
    return (
      <ErrorBoundary id="root-layout">
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="web-entry" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="components/storyboards/DevToolsStoryboard"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Full navigation stack for native platforms
  return (
    <ErrorBoundary id="root-layout">
      <ThemeProvider value={DefaultTheme}>
        <Stack
          screenOptions={({ route }) => ({
            headerShown:
              !route.name.startsWith("tempobook") &&
              route.name !== "splash" &&
              route.name !== "onboarding" &&
              route.name !== "auth",
          })}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
