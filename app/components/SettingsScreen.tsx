import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Moon,
  Bell,
  Shield,
  Clock,
  MessageSquare,
  User,
  ChevronRight,
  LogOut,
  RefreshCw,
} from "lucide-react-native";
import { getAppSettings, updateAppSettings } from "../utils/settingsStorage";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [deliveryReports, setDeliveryReports] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [smsLimit, setSmsLimit] = useState("100");
  const [lastUpdated, setLastUpdated] = useState("");

  // Load settings from storage
  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await getAppSettings();

      setDarkMode(settings.darkMode);
      setNotifications(settings.notifications);
      setDeliveryReports(settings.deliveryReports);
      setAutoRetry(settings.autoRetry);
      setSmsLimit(settings.smsLimit);

      // Format the last updated date
      if (settings.lastUpdated) {
        const date = new Date(settings.lastUpdated);
        setLastUpdated(date.toLocaleString());
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      Alert.alert("Error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Save a specific setting
  const saveSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      const updateData: any = {};
      updateData[key] = value;

      await updateAppSettings(updateData);

      // Update last updated time
      const date = new Date();
      setLastUpdated(date.toLocaleString());
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      Alert.alert("Error", `Failed to save ${key} setting`);

      // Revert the UI state if save failed
      switch (key) {
        case "darkMode":
          setDarkMode(!value);
          break;
        case "notifications":
          setNotifications(!value);
          break;
        case "deliveryReports":
          setDeliveryReports(!value);
          break;
        case "autoRetry":
          setAutoRetry(!value);
          break;
        case "smsLimit":
          loadSettings(); // Reload all settings
          break;
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle SMS limit change
  const handleSmsLimitChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    setSmsLimit(numericValue);
  };

  // Save SMS limit when input is complete
  const handleSmsLimitBlur = () => {
    // Ensure a minimum value of 1
    const numericValue = parseInt(smsLimit) || 1;
    const limitValue = numericValue.toString();
    setSmsLimit(limitValue);
    saveSetting("smsLimit", limitValue);
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            // Implement logout logic here
            Alert.alert("Logged Out", "You have been logged out successfully");
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Handle profile navigation
  const handleProfilePress = () => {
    Alert.alert("Profile", "This would navigate to the profile screen", [
      { text: "OK" },
    ]);
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const settingsSections = [
    {
      title: "App Preferences",
      settings: [
        {
          id: "darkMode",
          title: "Dark Mode",
          description: "Enable dark theme for the app",
          type: "switch",
          icon: <Moon size={20} color="#6366F1" />,
          value: darkMode,
          onToggle: () => {
            const newValue = !darkMode;
            setDarkMode(newValue);
            saveSetting("darkMode", newValue);
          },
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "Receive campaign status notifications",
          type: "switch",
          icon: <Bell size={20} color="#6366F1" />,
          value: notifications,
          onToggle: () => {
            const newValue = !notifications;
            setNotifications(newValue);
            saveSetting("notifications", newValue);
          },
        },
      ],
    },
    {
      title: "SMS Settings",
      settings: [
        {
          id: "deliveryReports",
          title: "Delivery Reports",
          description: "Track message delivery status",
          type: "switch",
          icon: <MessageSquare size={20} color="#6366F1" />,
          value: deliveryReports,
          onToggle: () => {
            const newValue = !deliveryReports;
            setDeliveryReports(newValue);
            saveSetting("deliveryReports", newValue);
          },
        },
        {
          id: "autoRetry",
          title: "Auto-Retry Failed Messages",
          description: "Automatically retry sending failed messages",
          type: "switch",
          icon: <Clock size={20} color="#6366F1" />,
          value: autoRetry,
          onToggle: () => {
            const newValue = !autoRetry;
            setAutoRetry(newValue);
            saveSetting("autoRetry", newValue);
          },
        },
        {
          id: "smsLimit",
          title: "Daily SMS Limit",
          description: "Maximum number of SMS to send per day",
          type: "input",
          icon: <Shield size={20} color="#6366F1" />,
          value: smsLimit,
          onChangeText: handleSmsLimitChange,
          onBlur: handleSmsLimitBlur,
        },
      ],
    },
    {
      title: "Account",
      settings: [
        {
          id: "profile",
          title: "Profile Information",
          description: "Update your profile details",
          type: "link",
          icon: <User size={20} color="#6366F1" />,
          onPress: handleProfilePress,
        },
        {
          id: "logout",
          title: "Log Out",
          description: "Sign out of your account",
          type: "button",
          icon: <LogOut size={20} color="#EF4444" />,
          buttonColor: "text-red-500",
          onPress: handleLogout,
        },
      ],
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-600">Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-gray-800">Settings</Text>
        <TouchableOpacity
          onPress={loadSettings}
          className="bg-gray-100 p-2 rounded-lg"
          disabled={loading || saving}
        >
          <RefreshCw
            size={20}
            color={loading || saving ? "#A5B4FC" : "#6366F1"}
          />
        </TouchableOpacity>
      </View>

      {saving && (
        <View className="items-center mb-4">
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="text-indigo-600 mt-1">Saving changes...</Text>
        </View>
      )}

      {settingsSections.map((section, sectionIndex) => (
        <View key={section.title} className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            {section.title}
          </Text>
          <View className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {section.settings.map((setting, settingIndex) => (
              <View
                key={setting.id}
                className={`p-4 ${settingIndex !== section.settings.length - 1 ? "border-b border-gray-200" : ""}`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1">
                    {setting.icon}
                    <View className="ml-3 flex-1">
                      <Text className="font-medium text-gray-800">
                        {setting.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {setting.description}
                      </Text>
                    </View>
                  </View>

                  {setting.type === "switch" && (
                    <Switch
                      value={setting.value as boolean}
                      onValueChange={setting.onToggle}
                      trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
                      thumbColor={setting.value ? "#6366F1" : "#F3F4F6"}
                      disabled={saving}
                    />
                  )}

                  {setting.type === "input" && (
                    <TextInput
                      value={setting.value as string}
                      onChangeText={setting.onChangeText}
                      onBlur={setting.onBlur}
                      keyboardType="number-pad"
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1 w-16 text-center"
                      editable={!saving}
                    />
                  )}

                  {setting.type === "link" && (
                    <TouchableOpacity
                      onPress={setting.onPress}
                      disabled={saving}
                    >
                      <ChevronRight size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}

                  {setting.type === "button" && (
                    <TouchableOpacity
                      onPress={setting.onPress}
                      className="bg-red-50 px-3 py-1 rounded-lg"
                      disabled={saving}
                    >
                      <Text className="text-red-500 font-medium">Log Out</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">About</Text>
        <View className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <Text className="font-medium text-gray-800 mb-1">
            SMS Campaign Manager
          </Text>
          <Text className="text-sm text-gray-500 mb-2">Version 1.0.0</Text>
          <Text className="text-sm text-gray-500">
            A professional Android mobile application built with Expo that
            enables users to create, send, and track bulk SMS campaigns directly
            using the device's native SMS functionality.
          </Text>
          {lastUpdated && (
            <Text className="text-xs text-gray-400 mt-3">
              Settings last updated: {lastUpdated}
            </Text>
          )}
        </View>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
