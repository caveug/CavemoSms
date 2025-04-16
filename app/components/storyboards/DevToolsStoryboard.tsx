import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DevTools from "../DevTools";
import { Bug, Activity, Zap } from "lucide-react-native";
import { BugWizardTracker } from "../BugWizard";

export default function DevToolsStoryboard() {
  const [showDevTools, setShowDevTools] = useState(false);

  const generateTestError = () => {
    try {
      // Intentionally cause an error
      throw new Error("This is a test error generated for debugging purposes");
    } catch (error) {
      console.error("Test error:", error);
    }
  };

  const generateTestWarning = () => {
    console.warn("This is a test warning generated for debugging purposes");
  };

  const simulateSlowOperation = () => {
    const start = performance.now();
    // Simulate a slow operation by blocking the main thread
    const blockTime = 500; // 500ms
    while (performance.now() - start < blockTime) {
      // Busy wait
    }
    console.log(`Simulated slow operation: ${blockTime}ms`);
  };

  return (
    <div className="bg-white min-h-screen p-4">
      <View className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 mb-6">
        <Text className="text-2xl font-bold text-indigo-800 mb-4">
          DevTools Demo
        </Text>
        <Text className="text-gray-700 mb-6">
          This storyboard demonstrates the new DevTools system that helps
          identify and fix bugs in the application. Use the buttons below to
          generate test errors and warnings, then open the DevTools to see how
          they're tracked.
        </Text>

        <View className="flex-row flex-wrap justify-between mb-6">
          <TouchableOpacity
            className="bg-red-600 px-4 py-3 rounded-lg mb-4 w-[48%] items-center"
            onPress={generateTestError}
          >
            <View className="flex-row items-center">
              <Bug size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                Generate Error
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-yellow-600 px-4 py-3 rounded-lg mb-4 w-[48%] items-center"
            onPress={generateTestWarning}
          >
            <View className="flex-row items-center">
              <Bug size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                Generate Warning
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-purple-600 px-4 py-3 rounded-lg mb-4 w-[48%] items-center"
            onPress={simulateSlowOperation}
          >
            <View className="flex-row items-center">
              <Activity size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                Slow Operation
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-indigo-600 px-4 py-3 rounded-lg mb-4 w-[48%] items-center"
            onPress={() => setShowDevTools(true)}
          >
            <View className="flex-row items-center">
              <Zap size={20} color="white" />
              <Text className="text-white font-medium ml-2">Open DevTools</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 rounded-lg border border-indigo-100">
          <Text className="font-bold text-lg mb-2">Features:</Text>
          <View className="ml-4">
            <Text className="text-gray-700 mb-1">
              • Real-time error and warning tracking
            </Text>
            <Text className="text-gray-700 mb-1">
              • Performance monitoring with FPS tracking
            </Text>
            <Text className="text-gray-700 mb-1">
              • Module resolution debugging
            </Text>
            <Text className="text-gray-700 mb-1">
              • One-click quick fixes for common issues
            </Text>
            <Text className="text-gray-700">
              • Error boundaries to prevent app crashes
            </Text>
          </View>
        </View>
      </View>

      <DevTools visible={showDevTools} onClose={() => setShowDevTools(false)} />
    </div>
  );
}
