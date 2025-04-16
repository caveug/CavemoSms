import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";

// Removed the SplashScreenModule import and preventAutoHideAsync call
// as it's already being handled in _layout.tsx

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulate loading resources
    const loadResources = async () => {
      try {
        // Simulate a delay to show the splash screen
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Navigate to the onboarding screen
        // In a real app, you would check if the user has seen onboarding
        router.replace("/onboarding");
      } catch (e) {
        console.warn("Navigation error:", e);
        // Fallback to index if navigation fails
        try {
          router.replace("/");
        } catch (navError) {
          console.warn("Fallback navigation error:", navError);
        }
      }
    };

    loadResources();
  }, [router]);

  return (
    <View className="flex-1 bg-indigo-600 items-center justify-center">
      <View className="items-center">
        <View className="w-24 h-24 bg-white rounded-2xl items-center justify-center mb-4">
          <MessageSquare size={64} color="#6366F1" />
        </View>
        <Text className="text-white text-3xl font-bold mb-2">SMS Campaign</Text>
        <Text className="text-white text-xl font-medium">Manager</Text>
      </View>
    </View>
  );
}
