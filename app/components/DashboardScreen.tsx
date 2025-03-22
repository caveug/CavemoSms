import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  MessageSquare,
  Users,
  BarChart2,
  Clock,
  Plus,
  ChevronRight,
} from "lucide-react-native";
import ActivityItem from "./ActivityItem";

export default function DashboardScreen() {
  // Dummy data for dashboard
  const stats = {
    totalContacts: 1250,
    activeGroups: 8,
    sentMessages: 3450,
    scheduledCampaigns: 3,
  };

  // Dummy data for recent activity
  const recentActivity = [
    {
      id: "1",
      type: "campaign_sent",
      title: "Welcome Message",
      description: "Campaign sent to 120 contacts",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "contacts_imported",
      title: "New Leads",
      description: "45 contacts imported",
      time: "5 hours ago",
    },
    {
      id: "3",
      type: "campaign_scheduled",
      title: "October Promotion",
      description: "Scheduled for Oct 25, 2023",
      time: "Yesterday",
    },
    {
      id: "4",
      type: "group_created",
      title: "VIP Customers",
      description: "Group with 28 contacts created",
      time: "2 days ago",
    },
  ];

  // Dummy data for upcoming campaigns
  const upcomingCampaigns = [
    {
      id: "1",
      name: "October Promotion",
      recipients: 250,
      scheduledDate: "Oct 25, 2023",
      scheduledTime: "9:00 AM",
    },
    {
      id: "2",
      name: "Black Friday Sale",
      recipients: 500,
      scheduledDate: "Nov 24, 2023",
      scheduledTime: "8:00 AM",
    },
    {
      id: "3",
      name: "Customer Feedback",
      recipients: 85,
      scheduledDate: "Oct 30, 2023",
      scheduledTime: "3:00 PM",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800">Dashboard</Text>
        <Text className="text-gray-500">Welcome to SMS Campaign Manager</Text>
      </View>

      {/* Stats cards */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <TouchableOpacity className="w-[48%] bg-indigo-50 p-4 rounded-lg mb-3 border border-indigo-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-indigo-800 font-medium">Contacts</Text>
            <Users size={20} color="#6366F1" />
          </View>
          <Text className="text-2xl font-bold text-indigo-700">
            {stats.totalContacts}
          </Text>
          <Text className="text-indigo-600 text-xs mt-1">
            {stats.activeGroups} active groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-[48%] bg-green-50 p-4 rounded-lg mb-3 border border-green-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-green-800 font-medium">Messages</Text>
            <MessageSquare size={20} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-green-700">
            {stats.sentMessages}
          </Text>
          <Text className="text-green-600 text-xs mt-1">
            Total messages sent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-[48%] bg-blue-50 p-4 rounded-lg mb-3 border border-blue-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-blue-800 font-medium">Scheduled</Text>
            <Clock size={20} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-blue-700">
            {stats.scheduledCampaigns}
          </Text>
          <Text className="text-blue-600 text-xs mt-1">Upcoming campaigns</Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-[48%] bg-purple-50 p-4 rounded-lg mb-3 border border-purple-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-purple-800 font-medium">Analytics</Text>
            <BarChart2 size={20} color="#8B5CF6" />
          </View>
          <Text className="text-purple-700 text-sm mt-1">
            View detailed reports
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-purple-600 text-xs font-medium">
              Open Analytics
            </Text>
            <ChevronRight size={14} color="#8B5CF6" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick actions */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Quick Actions
        </Text>
        <View className="flex-row justify-between">
          <TouchableOpacity className="bg-indigo-600 rounded-lg p-3 flex-1 mr-2 items-center">
            <MessageSquare size={24} color="white" />
            <Text className="text-white font-medium mt-2">New Campaign</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-indigo-600 rounded-lg p-3 flex-1 ml-2 items-center">
            <Users size={24} color="white" />
            <Text className="text-white font-medium mt-2">Import Contacts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming campaigns */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">
            Upcoming Campaigns
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-indigo-600 mr-1">View All</Text>
            <ChevronRight size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {upcomingCampaigns.map((campaign) => (
          <TouchableOpacity
            key={campaign.id}
            className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200"
          >
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-bold text-gray-800">{campaign.name}</Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-blue-700">Scheduled</Text>
              </View>
            </View>
            <Text className="text-gray-500 mb-2">
              {campaign.recipients} recipients
            </Text>
            <View className="flex-row items-center">
              <Clock size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">
                {campaign.scheduledDate} at {campaign.scheduledTime}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent activity */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">
            Recent Activity
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-indigo-600 mr-1">View All</Text>
            <ChevronRight size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {recentActivity.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </View>

      {/* Create campaign button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
}
