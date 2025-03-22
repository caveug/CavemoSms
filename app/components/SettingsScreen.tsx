import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
} from "lucide-react-native";
import { Button } from "./ui/Button";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [deliveryReports, setDeliveryReports] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [smsLimit, setSmsLimit] = useState("100");

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
          onToggle: () => setDarkMode(!darkMode),
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "Receive campaign status notifications",
          type: "switch",
          icon: <Bell size={20} color="#6366F1" />,
          value: notifications,
          onToggle: () => setNotifications(!notifications),
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
          onToggle: () => setDeliveryReports(!deliveryReports),
        },
        {
          id: "autoRetry",
          title: "Auto-Retry Failed Messages",
          description: "Automatically retry sending failed messages",
          type: "switch",
          icon: <Clock size={20} color="#6366F1" />,
          value: autoRetry,
          onToggle: () => setAutoRetry(!autoRetry),
        },
        {
          id: "smsLimit",
          title: "Daily SMS Limit",
          description: "Maximum number of SMS to send per day",
          type: "input",
          icon: <Shield size={20} color="#6366F1" />,
          value: smsLimit,
          onChangeText: setSmsLimit,
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
          onPress: () => {},
        },
        {
          id: "logout",
          title: "Log Out",
          description: "Sign out of your account",
          type: "button",
          icon: <LogOut size={20} color="#EF4444" />,
          buttonColor: "text-red-500",
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-800 mb-6">Settings</Text>

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
                    />
                  )}

                  {setting.type === "input" && (
                    <TextInput
                      value={setting.value as string}
                      onChangeText={setting.onChangeText}
                      keyboardType="number-pad"
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1 w-16 text-center"
                    />
                  )}

                  {setting.type === "link" && (
                    <TouchableOpacity onPress={setting.onPress}>
                      <ChevronRight size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}

                  {setting.type === "button" && (
                    <TouchableOpacity
                      onPress={setting.onPress}
                      className="bg-red-50 px-3 py-1 rounded-lg"
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
        </View>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
