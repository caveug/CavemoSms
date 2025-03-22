import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  BarChart2,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Download,
  Calendar,
  ChevronDown,
} from "lucide-react-native";

type CampaignStat = {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  failed: number;
  responses: number;
  date: string;
};

export default function AnalyticsDashboardScreen() {
  const [timeRange, setTimeRange] = useState("7days");
  const [showTimeRangeOptions, setShowTimeRangeOptions] = useState(false);

  // Dummy data for analytics
  const stats = {
    totalSent: 1250,
    delivered: 1218,
    failed: 32,
    responses: 345,
    deliveryRate: 97.4,
    responseRate: 28.3,
  };

  // Dummy data for campaigns
  const campaigns: CampaignStat[] = [
    {
      id: "1",
      name: "Welcome Message",
      sent: 120,
      delivered: 118,
      failed: 2,
      responses: 45,
      date: "2023-10-15",
    },
    {
      id: "2",
      name: "October Promotion",
      sent: 250,
      delivered: 245,
      failed: 5,
      responses: 78,
      date: "2023-10-18",
    },
    {
      id: "3",
      name: "Customer Feedback",
      sent: 85,
      delivered: 82,
      failed: 3,
      responses: 32,
      date: "2023-10-20",
    },
    {
      id: "4",
      name: "New Product Announcement",
      sent: 300,
      delivered: 293,
      failed: 7,
      responses: 112,
      date: "2023-10-22",
    },
  ];

  // Time range options
  const timeRangeOptions = [
    { id: "7days", label: "Last 7 Days" },
    { id: "30days", label: "Last 30 Days" },
    { id: "90days", label: "Last 90 Days" },
    { id: "year", label: "This Year" },
  ];

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header with time range selector */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-gray-800">
          Analytics Dashboard
        </Text>
        <View>
          <TouchableOpacity
            onPress={() => setShowTimeRangeOptions(!showTimeRangeOptions)}
            className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
          >
            <Calendar size={16} color="#6366F1" />
            <Text className="mx-2 text-indigo-600">
              {timeRangeOptions.find((o) => o.id === timeRange)?.label}
            </Text>
            <ChevronDown size={16} color="#6366F1" />
          </TouchableOpacity>

          {showTimeRangeOptions && (
            <View className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-40">
              {timeRangeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setTimeRange(option.id);
                    setShowTimeRangeOptions(false);
                  }}
                  className={`p-3 ${option.id !== timeRangeOptions[timeRangeOptions.length - 1].id ? "border-b border-gray-200" : ""}`}
                >
                  <Text
                    className={`${timeRange === option.id ? "text-indigo-600 font-medium" : "text-gray-700"}`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Summary cards */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="w-[48%] bg-indigo-50 p-4 rounded-lg mb-3 border border-indigo-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-indigo-800 font-medium">Messages Sent</Text>
            <MessageSquare size={18} color="#6366F1" />
          </View>
          <Text className="text-2xl font-bold text-indigo-700">
            {stats.totalSent}
          </Text>
          <Text className="text-indigo-600 text-xs mt-1">
            +12% from last period
          </Text>
        </View>

        <View className="w-[48%] bg-green-50 p-4 rounded-lg mb-3 border border-green-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-green-800 font-medium">Delivered</Text>
            <TrendingUp size={18} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-green-700">
            {stats.delivered}
          </Text>
          <Text className="text-green-600 text-xs mt-1">
            {stats.deliveryRate}% delivery rate
          </Text>
        </View>

        <View className="w-[48%] bg-blue-50 p-4 rounded-lg mb-3 border border-blue-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-blue-800 font-medium">Responses</Text>
            <BarChart2 size={18} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-blue-700">
            {stats.responses}
          </Text>
          <Text className="text-blue-600 text-xs mt-1">
            {stats.responseRate}% response rate
          </Text>
        </View>

        <View className="w-[48%] bg-red-50 p-4 rounded-lg mb-3 border border-red-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-red-800 font-medium">Failed</Text>
            <Clock size={18} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-red-700">
            {stats.failed}
          </Text>
          <Text className="text-red-600 text-xs mt-1">
            {((stats.failed / stats.totalSent) * 100).toFixed(1)}% failure rate
          </Text>
        </View>
      </View>

      {/* Campaign performance */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            Campaign Performance
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Download size={16} color="#6366F1" />
            <Text className="ml-1 text-indigo-600">Export</Text>
          </TouchableOpacity>
        </View>

        {/* Campaign stats table */}
        <View className="border border-gray-200 rounded-lg">
          <View className="flex-row bg-gray-100 p-3 rounded-t-lg">
            <Text className="font-medium text-gray-700 flex-1">Campaign</Text>
            <Text className="font-medium text-gray-700 w-16 text-center">
              Sent
            </Text>
            <Text className="font-medium text-gray-700 w-16 text-center">
              Delivered
            </Text>
            <Text className="font-medium text-gray-700 w-16 text-center">
              Responses
            </Text>
          </View>

          {campaigns.map((campaign, index) => (
            <TouchableOpacity
              key={campaign.id}
              className={`flex-row p-3 items-center ${index !== campaigns.length - 1 ? "border-b border-gray-200" : "rounded-b-lg"}`}
            >
              <View className="flex-1">
                <Text className="font-medium text-gray-800">
                  {campaign.name}
                </Text>
                <Text className="text-xs text-gray-500">{campaign.date}</Text>
              </View>
              <Text className="w-16 text-center text-gray-800">
                {campaign.sent}
              </Text>
              <Text className="w-16 text-center text-green-600">
                {campaign.delivered}
              </Text>
              <Text className="w-16 text-center text-blue-600">
                {campaign.responses}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Delivery by time chart placeholder */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Delivery Success by Time of Day
        </Text>
        <View className="h-40 bg-gray-100 rounded-lg items-center justify-center">
          <BarChart2 size={32} color="#6B7280" />
          <Text className="text-gray-500 mt-2">
            Chart visualization would appear here
          </Text>
        </View>
      </View>

      {/* Response rate by group */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Response Rate by Contact Group
        </Text>
        <View className="border border-gray-200 rounded-lg">
          <View className="flex-row bg-gray-100 p-3 rounded-t-lg">
            <Text className="font-medium text-gray-700 flex-1">Group</Text>
            <Text className="font-medium text-gray-700 w-20 text-center">
              Contacts
            </Text>
            <Text className="font-medium text-gray-700 w-24 text-center">
              Response Rate
            </Text>
          </View>

          {[
            { id: "1", name: "Customers", count: 450, rate: 32.5 },
            { id: "2", name: "Leads", count: 320, rate: 24.8 },
            { id: "3", name: "VIP", count: 85, rate: 41.2 },
            { id: "4", name: "New", count: 120, rate: 18.3 },
          ].map((group, index, arr) => (
            <View
              key={group.id}
              className={`flex-row p-3 items-center ${index !== arr.length - 1 ? "border-b border-gray-200" : "rounded-b-lg"}`}
            >
              <Text className="flex-1 font-medium text-gray-800">
                {group.name}
              </Text>
              <Text className="w-20 text-center text-gray-800">
                {group.count}
              </Text>
              <View className="w-24 items-center">
                <View className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <View
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${group.rate}%` }}
                  />
                </View>
                <Text className="text-xs text-blue-600 mt-1">
                  {group.rate}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
