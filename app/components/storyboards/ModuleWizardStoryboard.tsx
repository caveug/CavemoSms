import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import ModuleWizardDebugger from "../ModuleWizardDebugger";
import {
  registerModuleMapping,
  createVirtualModule,
  clearModuleCache,
} from "../../utils/ModuleWizard";

export default function ModuleWizardStoryboard() {
  const [showDebugger, setShowDebugger] = useState(false);

  const handleCreateVirtualModule = () => {
    createVirtualModule("test-virtual-module", {
      hello: "world",
      testFunction: () => console.log("Virtual module function called!"),
    });
    alert("Virtual module created! Check the debugger.");
  };

  const handleRegisterMapping = () => {
    registerModuleMapping({
      targetModule: "test-problematic-module",
      replacementModule: "react",
    });
    alert("Module mapping registered! Check the debugger.");
  };

  const handleClearCache = () => {
    clearModuleCache();
    alert("Module cache cleared!");
  };

  return (
    <div className="bg-white min-h-screen p-4">
      <View className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
        <Text className="text-2xl font-bold text-indigo-800 mb-4">
          🧙‍♂️ ModuleWizard
        </Text>
        <Text className="text-gray-700 mb-6">
          A magical utility that fixes module resolution issues at runtime by
          intercepting module requests and providing mock implementations or
          redirecting to compatible modules.
        </Text>

        <View className="bg-white p-4 rounded-lg border border-indigo-100 mb-6">
          <Text className="font-bold text-lg mb-2">Features:</Text>
          <View className="ml-4">
            <Text className="text-gray-700 mb-1">
              • Runtime module interception
            </Text>
            <Text className="text-gray-700 mb-1">
              • Mock implementations for problematic modules
            </Text>
            <Text className="text-gray-700 mb-1">
              • Module resolution caching
            </Text>
            <Text className="text-gray-700 mb-1">
              • Module health monitoring
            </Text>
            <Text className="text-gray-700">• Virtual module creation</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            className="bg-indigo-600 px-4 py-3 rounded-lg mb-4 w-[48%]"
            onPress={() => setShowDebugger(true)}
          >
            <Text className="text-white font-medium text-center">
              Open Debugger
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 px-4 py-3 rounded-lg mb-4 w-[48%]"
            onPress={handleCreateVirtualModule}
          >
            <Text className="text-white font-medium text-center">
              Create Virtual Module
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-600 px-4 py-3 rounded-lg mb-4 w-[48%]"
            onPress={handleRegisterMapping}
          >
            <Text className="text-white font-medium text-center">
              Register Module Mapping
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-600 px-4 py-3 rounded-lg mb-4 w-[48%]"
            onPress={handleClearCache}
          >
            <Text className="text-white font-medium text-center">
              Clear Module Cache
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm text-gray-500 italic mt-4 text-center">
          Press Ctrl+Shift+D to toggle the debugger at any time
        </Text>
      </View>

      <ModuleWizardDebugger
        visible={showDebugger}
        onClose={() => setShowDebugger(false)}
      />
    </div>
  );
}
