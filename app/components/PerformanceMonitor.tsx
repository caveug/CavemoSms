import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Activity, X, Clock, Memory, Cpu, Zap } from "lucide-react-native";

type PerformanceMetric = {
  timestamp: number;
  fps: number;
  memory?: number;
  cpuUsage?: number;
  renderTime?: number;
};

type PerformanceMonitorProps = {
  visible: boolean;
  onClose: () => void;
};

// Global performance tracking
let metrics: PerformanceMetric[] = [];
let listeners: (() => void)[] = [];
let isTracking = false;
let lastFrameTime = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let currentFps = 0;

// Performance tracking functions
export const PerformanceTracker = {
  startTracking: () => {
    if (isTracking) return;
    isTracking = true;
    lastFrameTime = performance.now();
    frameCount = 0;
    lastFpsUpdate = performance.now();
    requestAnimationFrame(trackFrame);
  },

  stopTracking: () => {
    isTracking = false;
  },

  getMetrics: () => [...metrics],

  clearMetrics: () => {
    metrics = [];
    listeners.forEach((listener) => listener());
  },

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // Track component render time
  trackRender: (componentName: string, renderTime: number) => {
    if (renderTime > 16) {
      // Only track slow renders (>16ms = <60fps)
      console.warn(
        `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`,
      );
    }
  },
};

// Frame tracking function
function trackFrame() {
  if (!isTracking) return;

  const now = performance.now();
  frameCount++;

  // Update FPS every second
  if (now - lastFpsUpdate >= 1000) {
    currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));

    // Add new metric
    const newMetric: PerformanceMetric = {
      timestamp: now,
      fps: currentFps,
    };

    // Try to get memory usage if available
    if (typeof performance !== "undefined" && performance.memory) {
      newMetric.memory = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
    }

    metrics.push(newMetric);
    if (metrics.length > 60) metrics.shift(); // Keep last 60 seconds

    // Notify listeners
    listeners.forEach((listener) => listener());

    // Reset counters
    frameCount = 0;
    lastFpsUpdate = now;
  }

  lastFrameTime = now;
  requestAnimationFrame(trackFrame);
}

// Start tracking on import
if (typeof window !== "undefined") {
  PerformanceTracker.startTracking();
}

// Performance monitor hook for components
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    PerformanceTracker.trackRender(componentName, renderTime);

    // Reset for next render
    renderStartTime.current = performance.now();
  });
}

export default function PerformanceMonitor({
  visible,
  onClose,
}: PerformanceMonitorProps) {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    // Subscribe to metric updates
    const unsubscribe = PerformanceTracker.subscribe(() => {
      setCurrentMetrics(PerformanceTracker.getMetrics());
    });

    // Initial load
    setCurrentMetrics(PerformanceTracker.getMetrics());

    return unsubscribe;
  }, []);

  if (!visible) return null;

  // Calculate averages
  const avgFps =
    currentMetrics.length > 0
      ? currentMetrics.reduce((sum, metric) => sum + metric.fps, 0) /
        currentMetrics.length
      : 0;

  const latestMemory =
    currentMetrics.length > 0 &&
    currentMetrics[currentMetrics.length - 1].memory;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-80 z-50">
      <View className="m-4 bg-white rounded-lg overflow-hidden flex-1">
        <View className="bg-indigo-600 p-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Activity size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Performance Monitor
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <View className="flex-row justify-between mb-6">
            <View className="bg-green-50 p-3 rounded-lg border border-green-100 flex-1 mr-2 items-center">
              <View className="flex-row items-center mb-1">
                <Zap size={16} color="#10B981" />
                <Text className="text-green-700 font-medium ml-1">FPS</Text>
              </View>
              <Text className="text-2xl font-bold text-green-800">
                {avgFps.toFixed(1)}
              </Text>
            </View>

            {latestMemory && (
              <View className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex-1 ml-2 items-center">
                <View className="flex-row items-center mb-1">
                  <Memory size={16} color="#3B82F6" />
                  <Text className="text-blue-700 font-medium ml-1">Memory</Text>
                </View>
                <Text className="text-2xl font-bold text-blue-800">
                  {latestMemory.toFixed(1)} MB
                </Text>
              </View>
            )}
          </View>

          <Text className="font-bold mb-2">FPS Over Time</Text>
          <View className="h-40 bg-gray-50 rounded-lg p-2 mb-4 flex-row items-end">
            {currentMetrics.map((metric, index) => (
              <View
                key={index}
                style={{
                  height: `${(metric.fps / 60) * 100}%`,
                  backgroundColor:
                    metric.fps > 50
                      ? "#10B981"
                      : metric.fps > 30
                        ? "#F59E0B"
                        : "#EF4444",
                  width: `${100 / Math.min(60, currentMetrics.length)}%`,
                  marginHorizontal: 1,
                }}
              />
            ))}
            {currentMetrics.length === 0 && (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-400">No data available</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            className="bg-indigo-100 p-2 rounded-md self-start"
            onPress={() => PerformanceTracker.clearMetrics()}
          >
            <Text className="text-indigo-700">Clear Data</Text>
          </TouchableOpacity>
        </View>

        <View className="p-4 border-t border-gray-200">
          <Text className="font-bold mb-2">Performance Tips</Text>
          <ScrollView className="max-h-40">
            <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-2">
              <Text className="font-medium text-yellow-800 mb-1">
                Reduce Re-renders
              </Text>
              <Text className="text-yellow-700">
                Use React.memo() for components that don't need frequent
                updates.
              </Text>
            </View>
            <View className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
              <Text className="font-medium text-blue-800 mb-1">
                Optimize List Rendering
              </Text>
              <Text className="text-blue-700">
                Use FlatList with proper key extraction and item memoization.
              </Text>
            </View>
            <View className="bg-green-50 p-3 rounded-lg border border-green-100 mb-2">
              <Text className="font-medium text-green-800 mb-1">
                Lazy Load Components
              </Text>
              <Text className="text-green-700">
                Use React.lazy() and Suspense to load components only when
                needed.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
