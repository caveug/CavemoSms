import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  getModuleResolutionEvents,
  clearModuleCache,
} from "../utils/ModuleWizard";

type DebuggerProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ModuleWizardDebugger({
  visible,
  onClose,
}: DebuggerProps) {
  const [events, setEvents] = useState(getModuleResolutionEvents());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setEvents(getModuleResolutionEvents());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!visible) return null;

  const handleClearCache = () => {
    clearModuleCache();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-80 z-50">
      <View className="m-4 bg-white rounded-lg overflow-hidden flex-1">
        <View className="bg-indigo-600 p-4 flex-row justify-between items-center">
          <Text className="text-white font-bold text-lg">
            🧙‍♂️ ModuleWizard Debugger
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-white font-bold text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="p-4 flex-row justify-between">
          <Text className="font-bold">Module Resolution Events</Text>
          <TouchableOpacity
            className="bg-indigo-600 px-3 py-1 rounded-md"
            onPress={handleClearCache}
          >
            <Text className="text-white">Clear Cache</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {events.length === 0 ? (
            <Text className="text-gray-500 italic">
              No module resolution events recorded yet.
            </Text>
          ) : (
            events
              .slice()
              .reverse()
              .map((event, index) => (
                <View key={index} className="mb-2 p-2 border-b border-gray-200">
                  <View className="flex-row items-center">
                    <Text className="mr-2">{event.resolved ? "✅" : "❌"}</Text>
                    <Text className="font-medium">{event.module}</Text>
                  </View>
                  {event.replacement && (
                    <Text className="text-gray-600 ml-6">
                      → {event.replacement}
                    </Text>
                  )}
                  <Text className="text-xs text-gray-400 ml-6">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
