import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MessageSquare, Users, Clock, UserPlus } from "lucide-react-native";

type ActivityType =
  | "campaign_sent"
  | "contacts_imported"
  | "campaign_scheduled"
  | "group_created";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
};

type ActivityItemProps = {
  activity: Activity;
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "campaign_sent":
        return <MessageSquare size={18} color="#10B981" />;
      case "contacts_imported":
        return <UserPlus size={18} color="#3B82F6" />;
      case "campaign_scheduled":
        return <Clock size={18} color="#8B5CF6" />;
      case "group_created":
        return <Users size={18} color="#F59E0B" />;
      default:
        return <MessageSquare size={18} color="#6B7280" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "campaign_sent":
        return "bg-green-100";
      case "contacts_imported":
        return "bg-blue-100";
      case "campaign_scheduled":
        return "bg-purple-100";
      case "group_created":
        return "bg-amber-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <TouchableOpacity className="flex-row items-center p-3 mb-2 border border-gray-200 rounded-lg">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${getActivityColor(activity.type)}`}
      >
        {getActivityIcon(activity.type)}
      </View>
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-gray-800">{activity.title}</Text>
        <Text className="text-gray-500">{activity.description}</Text>
      </View>
      <Text className="text-xs text-gray-400">{activity.time}</Text>
    </TouchableOpacity>
  );
}
