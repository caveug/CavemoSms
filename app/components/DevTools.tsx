import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Settings, Bug, Activity, Zap, X, Code } from "lucide-react-native";
import BugWizard from "./BugWizard";
import PerformanceMonitor from "./PerformanceMonitor";
import ModuleWizardDebugger from "./ModuleWizardDebugger";

type DevToolsProps = {
  visible: boolean;
  onClose: () => void;
};

type Tool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
};

export default function DevTools({ visible, onClose }: DevToolsProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Close active tool when DevTools is closed
  useEffect(() => {
    if (!visible) {
      setActiveTool(null);
    }
  }, [visible]);

  if (!visible) return null;

  const tools: Tool[] = [
    {
      id: "bugs",
      name: "Bug Wizard",
      icon: <Bug size={24} color="#6366F1" />,
      component: (
        <BugWizard
          visible={activeTool === "bugs"}
          onClose={() => setActiveTool(null)}
        />
      ),
    },
    {
      id: "performance",
      name: "Performance",
      icon: <Activity size={24} color="#10B981" />,
      component: (
        <PerformanceMonitor
          visible={activeTool === "performance"}
          onClose={() => setActiveTool(null)}
        />
      ),
    },
    {
      id: "modules",
      name: "Module Wizard",
      icon: <Code size={24} color="#3B82F6" />,
      component: (
        <ModuleWizardDebugger
          visible={activeTool === "modules"}
          onClose={() => setActiveTool(null)}
        />
      ),
    },
    {
      id: "quickfix",
      name: "Quick Fix",
      icon: <Zap size={24} color="#F59E0B" />,
      component: null, // Will be handled separately
    },
  ];

  // Handle quick fix action
  const handleQuickFix = () => {
    // Apply a series of fixes to common issues
    if (Platform.OS === "web") {
      // Clear module cache
      if (typeof window !== "undefined" && window.__ModuleWizard) {
        window.__ModuleWizard.clearCache();
      }

      // Clear localStorage cache
      try {
        localStorage.clear();
      } catch (e) {
        console.warn("Could not clear localStorage:", e);
      }

      // Force refresh styles
      const styleSheets = document.styleSheets;
      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const sheet = styleSheets[i];
          if (sheet.disabled) sheet.disabled = false;
        } catch (e) {
          console.warn("Error refreshing stylesheet:", e);
        }
      }

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Render the active tool
  const renderActiveTool = () => {
    if (!activeTool) return null;

    if (activeTool === "quickfix") {
      handleQuickFix();
      setActiveTool(null);
      return null;
    }

    const tool = tools.find((t) => t.id === activeTool);
    return tool?.component || null;
  };

  return (
    <>
      {renderActiveTool()}

      <View className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <View className="bg-indigo-600 p-3 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Settings size={18} color="white" />
            <Text className="text-white font-medium ml-2">Dev Tools</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View className="p-2">
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              className="flex-row items-center p-2 rounded-md mb-1 hover:bg-gray-100"
              onPress={() => setActiveTool(tool.id)}
            >
              {tool.icon}
              <Text className="ml-2 font-medium">{tool.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}
