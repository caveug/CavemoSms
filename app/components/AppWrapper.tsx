import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Platform, Text } from "react-native";
import { Settings } from "lucide-react-native";
import ErrorBoundary from "./ErrorBoundary";
import DevTools from "./DevTools";

type AppWrapperProps = {
  children: React.ReactNode;
};

export default function AppWrapper({ children }: AppWrapperProps) {
  const [showDevTools, setShowDevTools] = useState(false);

  // Add keyboard shortcut for DevTools (Ctrl+Shift+D)
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
          e.preventDefault();
          setShowDevTools((prev) => !prev);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, []);

  return (
    <ErrorBoundary id="root">
      <View style={{ flex: 1 }}>
        {children}

        {/* DevTools toggle button (only in development) */}
        {__DEV__ && (
          <>
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                backgroundColor: "#6366F1",
                borderRadius: 30,
                width: 50,
                height: 50,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              onPress={() => setShowDevTools(true)}
            >
              <Settings size={24} color="white" />
            </TouchableOpacity>

            <DevTools
              visible={showDevTools}
              onClose={() => setShowDevTools(false)}
            />
          </>
        )}
      </View>
    </ErrorBoundary>
  );
}
