import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Button } from "./ui/Button";
import {
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Filter,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react-native";

type Campaign = {
  id: string;
  name: string;
  date: string;
  recipients: number;
  delivered: number;
  failed: number;
  pending: number;
  status: "completed" | "in-progress" | "scheduled";
};

const DUMMY_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Welcome Campaign",
    date: "2023-10-15",
    recipients: 120,
    delivered: 118,
    failed: 2,
    pending: 0,
    status: "completed",
  },
  {
    id: "2",
    name: "October Promotion",
    date: "2023-10-20",
    recipients: 250,
    delivered: 200,
    failed: 5,
    pending: 45,
    status: "in-progress",
  },
  {
    id: "3",
    name: "Appointment Reminders",
    date: "2023-10-25",
    recipients: 75,
    delivered: 0,
    failed: 0,
    pending: 75,
    status: "scheduled",
  },
];

export default function AnalyticsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DUMMY_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");

  const totalRecipients = campaigns.reduce(
    (sum, campaign) => sum + campaign.recipients,
    0,
  );
  const totalDelivered = campaigns.reduce(
    (sum, campaign) => sum + campaign.delivered,
    0,
  );
  const totalFailed = campaigns.reduce(
    (sum, campaign) => sum + campaign.failed,
    0,
  );
  const totalPending = campaigns.reduce(
    (sum, campaign) => sum + campaign.pending,
    0,
  );

  const deliveryRate =
    totalRecipients > 0
      ? Math.round((totalDelivered / totalRecipients) * 100)
      : 0;
  const failureRate =
    totalRecipients > 0 ? Math.round((totalFailed / totalRecipients) * 100) : 0;

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-200 bg-white"
      onPress={() => setSelectedCampaign(item)}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-medium">{item.name}</Text>
          <Text className="text-gray-500">{item.date}</Text>
        </View>
        <View className="flex-row items-center">
          {item.status === "completed" && (
            <CheckCircle size={16} color="#10B981" className="mr-1" />
          )}
          {item.status === "in-progress" && (
            <Clock size={16} color="#F59E0B" className="mr-1" />
          )}
          {item.status === "scheduled" && (
            <Calendar size={16} color="#3B82F6" className="mr-1" />
          )}
          <Text className="text-gray-700 mr-2">
            {item.status === "completed"
              ? "Completed"
              : item.status === "in-progress"
                ? "In Progress"
                : "Scheduled"}
          </Text>
          <ChevronRight size={16} color="#6B7280" />
        </View>
      </View>
      <View className="flex-row mt-2">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs">Recipients</Text>
          <Text className="font-medium">{item.recipients}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs">Delivered</Text>
          <Text className="font-medium text-green-600">{item.delivered}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs">Failed</Text>
          <Text className="font-medium text-red-600">{item.failed}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs">Pending</Text>
          <Text className="font-medium text-yellow-600">{item.pending}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold mb-4">Analytics Dashboard</Text>

          {/* Summary Cards */}
          <View className="flex-row flex-wrap mb-4">
            <View className="w-1/2 pr-2 mb-2">
              <View className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <Text className="text-blue-800 font-medium">
                  Total Campaigns
                </Text>
                <Text className="text-2xl font-bold text-blue-900">
                  {campaigns.length}
                </Text>
              </View>
            </View>
            <View className="w-1/2 pl-2 mb-2">
              <View className="bg-green-50 p-4 rounded-lg border border-green-100">
                <Text className="text-green-800 font-medium">
                  Delivery Rate
                </Text>
                <Text className="text-2xl font-bold text-green-900">
                  {deliveryRate}%
                </Text>
              </View>
            </View>
            <View className="w-1/2 pr-2">
              <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <Text className="text-yellow-800 font-medium">
                  Total Messages
                </Text>
                <Text className="text-2xl font-bold text-yellow-900">
                  {totalRecipients}
                </Text>
              </View>
            </View>
            <View className="w-1/2 pl-2">
              <View className="bg-red-50 p-4 rounded-lg border border-red-100">
                <Text className="text-red-800 font-medium">Failure Rate</Text>
                <Text className="text-2xl font-bold text-red-900">
                  {failureRate}%
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Controls */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-medium">Campaign Performance</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setTimeFilter("week")}
                className={`px-3 py-1 rounded-lg mr-2 ${timeFilter === "week" ? "bg-blue-100" : "bg-gray-100"}`}
              >
                <Text
                  className={
                    timeFilter === "week" ? "text-blue-800" : "text-gray-800"
                  }
                >
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTimeFilter("month")}
                className={`px-3 py-1 rounded-lg mr-2 ${timeFilter === "month" ? "bg-blue-100" : "bg-gray-100"}`}
              >
                <Text
                  className={
                    timeFilter === "month" ? "text-blue-800" : "text-gray-800"
                  }
                >
                  Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTimeFilter("all")}
                className={`px-3 py-1 rounded-lg ${timeFilter === "all" ? "bg-blue-100" : "bg-gray-100"}`}
              >
                <Text
                  className={
                    timeFilter === "all" ? "text-blue-800" : "text-gray-800"
                  }
                >
                  All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chart Placeholder */}
          <View className="h-40 bg-gray-100 rounded-lg mb-4 items-center justify-center">
            <BarChart3 size={40} color="#6B7280" />
            <Text className="text-gray-500 mt-2">
              Campaign Performance Chart
            </Text>
          </View>

          {/* Delivery Status */}
          <View className="mb-4">
            <Text className="text-lg font-medium mb-2">Delivery Status</Text>
            <View className="flex-row">
              <View className="flex-1 bg-gray-100 p-3 rounded-lg mr-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-800">Delivered</Text>
                  <CheckCircle size={16} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-green-600 mt-1">
                  {totalDelivered}
                </Text>
              </View>
              <View className="flex-1 bg-gray-100 p-3 rounded-lg mr-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-800">Failed</Text>
                  <XCircle size={16} color="#EF4444" />
                </View>
                <Text className="text-xl font-bold text-red-600 mt-1">
                  {totalFailed}
                </Text>
              </View>
              <View className="flex-1 bg-gray-100 p-3 rounded-lg">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-800">Pending</Text>
                  <Clock size={16} color="#F59E0B" />
                </View>
                <Text className="text-xl font-bold text-yellow-600 mt-1">
                  {totalPending}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Campaign List */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
            <Text className="text-lg font-medium">Recent Campaigns</Text>
            <TouchableOpacity className="flex-row items-center">
              <Filter size={16} color="#4B5563" className="mr-1" />
              <Text className="text-gray-700">Filter</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={campaigns}
            renderItem={renderCampaignItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <Button variant="outline" className="flex-row items-center">
          <Download size={20} color="#4B5563" className="mr-2" />
          Export Reports
        </Button>
      </View>
    </View>
  );
}
