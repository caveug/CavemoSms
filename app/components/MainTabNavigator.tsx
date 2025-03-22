import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  Users,
  MessageSquare,
  BarChart2,
  Settings,
} from "lucide-react-native";

import DashboardScreen from "./DashboardScreen";
import ContactListScreen from "./ContactListScreen";
import CampaignListScreen from "./CampaignListScreen";
import AnalyticsDashboardScreen from "./AnalyticsDashboardScreen";
import SettingsScreen from "./SettingsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === "Dashboard") {
            icon = <Home size={size} color={color} />;
          } else if (route.name === "Contacts") {
            icon = <Users size={size} color={color} />;
          } else if (route.name === "Campaigns") {
            icon = <MessageSquare size={size} color={color} />;
          } else if (route.name === "Analytics") {
            icon = <BarChart2 size={size} color={color} />;
          } else if (route.name === "Settings") {
            icon = <Settings size={size} color={color} />;
          }

          return icon;
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Contacts" component={ContactListScreen} />
      <Tab.Screen name="Campaigns" component={CampaignListScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsDashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
