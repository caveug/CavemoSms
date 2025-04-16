import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { AlertCircle, Bug, X, RefreshCw, Zap } from "lucide-react-native";

type BugReport = {
  id: string;
  timestamp: number;
  type: "error" | "warning" | "info";
  message: string;
  componentStack?: string;
  resolved: boolean;
};

type BugWizardProps = {
  visible: boolean;
  onClose: () => void;
};

// Global bug tracking
let bugReports: BugReport[] = [];
let listeners: (() => void)[] = [];

// Global error tracking functions
export const BugWizardTracker = {
  reportBug: (bug: Omit<BugReport, "id" | "timestamp" | "resolved">) => {
    const newBug = {
      ...bug,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      resolved: false,
    };
    bugReports = [newBug, ...bugReports].slice(0, 50); // Keep only the last 50 bugs
    listeners.forEach((listener) => listener());
    return newBug.id;
  },

  resolveBug: (id: string) => {
    bugReports = bugReports.map((bug) =>
      bug.id === id ? { ...bug, resolved: true } : bug,
    );
    listeners.forEach((listener) => listener());
  },

  clearBugs: () => {
    bugReports = [];
    listeners.forEach((listener) => listener());
  },

  getBugs: () => [...bugReports],

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // Intercept console errors and warnings
  setupConsoleInterceptors: () => {
    if (typeof console !== "undefined") {
      const originalError = console.error;
      const originalWarn = console.warn;

      console.error = (...args: any[]) => {
        originalError.apply(console, args);
        const message = args
          .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
          .join(" ");

        BugWizardTracker.reportBug({
          type: "error",
          message: message.substring(0, 500), // Limit length
        });
      };

      console.warn = (...args: any[]) => {
        originalWarn.apply(console, args);
        const message = args
          .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
          .join(" ");

        BugWizardTracker.reportBug({
          type: "warning",
          message: message.substring(0, 500), // Limit length
        });
      };
    }
  },

  // Setup global error handler
  setupGlobalErrorHandler: () => {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        BugWizardTracker.reportBug({
          type: "error",
          message: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
        });
      });

      window.addEventListener("unhandledrejection", (event) => {
        BugWizardTracker.reportBug({
          type: "error",
          message: `Unhandled Promise Rejection: ${event.reason}`,
        });
      });
    }
  },
};

// Initialize interceptors
if (typeof window !== "undefined") {
  BugWizardTracker.setupConsoleInterceptors();
  BugWizardTracker.setupGlobalErrorHandler();
}

export default function BugWizard({ visible, onClose }: BugWizardProps) {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Subscribe to bug updates
    const unsubscribe = BugWizardTracker.subscribe(() => {
      setBugs(BugWizardTracker.getBugs());
    });

    // Initial load
    setBugs(BugWizardTracker.getBugs());

    return unsubscribe;
  }, []);

  const handleResolveBug = (id: string) => {
    BugWizardTracker.resolveBug(id);
  };

  const handleClearBugs = () => {
    BugWizardTracker.clearBugs();
  };

  const handleBugPress = (bug: BugReport) => {
    setSelectedBug(bug);
    setShowDetails(true);
  };

  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-80 z-50">
      <View className="m-4 bg-white rounded-lg overflow-hidden flex-1">
        <View className="bg-indigo-600 p-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Bug size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Bug Wizard
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="p-4 flex-row justify-between items-center">
          <Text className="font-bold text-lg">Bug Reports ({bugs.length})</Text>
          <View className="flex-row">
            <TouchableOpacity
              className="bg-indigo-100 p-2 rounded-md mr-2"
              onPress={() => setBugs(BugWizardTracker.getBugs())}
            >
              <RefreshCw size={20} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-100 p-2 rounded-md"
              onPress={handleClearBugs}
            >
              <Text className="text-red-600 font-medium">Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {bugs.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Zap size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 text-center">
                No bugs reported yet. That's a good sign!
              </Text>
            </View>
          ) : (
            bugs.map((bug) => (
              <TouchableOpacity
                key={bug.id}
                className={`mb-3 p-3 rounded-lg border ${bug.resolved ? "bg-gray-50 border-gray-200" : bug.type === "error" ? "bg-red-50 border-red-200" : bug.type === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"}`}
                onPress={() => handleBugPress(bug)}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <View className="flex-row items-center">
                    <AlertCircle
                      size={16}
                      color={
                        bug.type === "error"
                          ? "#EF4444"
                          : bug.type === "warning"
                            ? "#F59E0B"
                            : "#3B82F6"
                      }
                    />
                    <Text
                      className={`ml-2 font-medium ${bug.resolved ? "text-gray-400" : bug.type === "error" ? "text-red-700" : bug.type === "warning" ? "text-yellow-700" : "text-blue-700"}`}
                    >
                      {bug.type.charAt(0).toUpperCase() + bug.type.slice(1)}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    {new Date(bug.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text
                  className={`${bug.resolved ? "text-gray-400" : "text-gray-700"}`}
                  numberOfLines={2}
                >
                  {bug.message}
                </Text>
                {!bug.resolved && (
                  <TouchableOpacity
                    className="mt-2 self-end bg-green-100 px-2 py-1 rounded"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleResolveBug(bug.id);
                    }}
                  >
                    <Text className="text-green-700 text-xs">
                      Mark Resolved
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Bug Details Modal */}
      <Modal
        visible={showDetails}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetails(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
          <View className="bg-white rounded-lg w-full max-w-md p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-lg">Bug Details</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <X size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {selectedBug && (
              <>
                <View className="mb-4">
                  <Text className="text-gray-500 mb-1">Type</Text>
                  <View className="flex-row items-center">
                    <AlertCircle
                      size={16}
                      color={
                        selectedBug.type === "error"
                          ? "#EF4444"
                          : selectedBug.type === "warning"
                            ? "#F59E0B"
                            : "#3B82F6"
                      }
                    />
                    <Text className="ml-2 font-medium">
                      {selectedBug.type.charAt(0).toUpperCase() +
                        selectedBug.type.slice(1)}
                    </Text>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-500 mb-1">Time</Text>
                  <Text className="font-medium">
                    {new Date(selectedBug.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-500 mb-1">Message</Text>
                  <ScrollView className="max-h-32 bg-gray-50 p-2 rounded">
                    <Text className="font-medium">{selectedBug.message}</Text>
                  </ScrollView>
                </View>

                {selectedBug.componentStack && (
                  <View className="mb-4">
                    <Text className="text-gray-500 mb-1">Component Stack</Text>
                    <ScrollView className="max-h-32 bg-gray-50 p-2 rounded">
                      <Text className="font-mono text-xs">
                        {selectedBug.componentStack}
                      </Text>
                    </ScrollView>
                  </View>
                )}

                <View className="flex-row justify-end mt-4">
                  {!selectedBug.resolved && (
                    <TouchableOpacity
                      className="bg-green-100 px-4 py-2 rounded mr-2"
                      onPress={() => {
                        handleResolveBug(selectedBug.id);
                        setShowDetails(false);
                      }}
                    >
                      <Text className="text-green-700">Mark Resolved</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    className="bg-gray-100 px-4 py-2 rounded"
                    onPress={() => setShowDetails(false)}
                  >
                    <Text className="text-gray-700">Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
