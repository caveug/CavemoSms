import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  BarChart2,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Download,
  Calendar,
  ChevronDown,
  RefreshCw,
} from "lucide-react-native";
import * as Sharing from "expo-sharing";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";
import {
  getAnalyticsData,
  CampaignStat,
  exportAnalyticsData,
} from "../utils/analyticsStorage";
import { getCampaigns } from "../utils/fileStorage";

export default function AnalyticsDashboardScreen() {
  const [timeRange, setTimeRange] = useState("7days");
  const [showTimeRangeOptions, setShowTimeRangeOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    responses: 0,
    deliveryRate: 0,
    responseRate: 0,
  });
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [contactGroups, setContactGroups] = useState<
    { id: string; name: string; count: number; rate: number }[]
  >([]);

  // Time range options
  const timeRangeOptions = [
    { id: "7days", label: "Last 7 Days" },
    { id: "30days", label: "Last 30 Days" },
    { id: "90days", label: "Last 90 Days" },
    { id: "year", label: "This Year" },
  ];

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Get analytics data from storage
      const analyticsData = await getAnalyticsData();

      // Get campaigns from storage to ensure we have the latest data
      const storedCampaigns = await getCampaigns();

      // Convert stored campaigns to campaign stats if needed
      let campaignStats: CampaignStat[] = analyticsData.campaigns;

      // If we don't have campaign stats yet, generate them from campaigns
      if (campaignStats.length === 0 && storedCampaigns.length > 0) {
        campaignStats = storedCampaigns.map((campaign) => ({
          id: campaign.id || String(Date.now()),
          name: campaign.name || "Unnamed Campaign",
          sent: campaign.recipients?.length || 0,
          delivered: Math.floor((campaign.recipients?.length || 0) * 0.95), // Simulate 95% delivery rate
          failed: Math.ceil((campaign.recipients?.length || 0) * 0.05), // Simulate 5% failure rate
          responses: Math.floor((campaign.recipients?.length || 0) * 0.3), // Simulate 30% response rate
          date: campaign.createdAt || new Date().toISOString().split("T")[0],
        }));
      }

      // Filter campaigns based on selected time range
      const filteredCampaigns = filterCampaignsByTimeRange(
        campaignStats,
        timeRange,
      );

      // Calculate stats based on filtered campaigns
      const totalSent = filteredCampaigns.reduce((sum, c) => sum + c.sent, 0);
      const delivered = filteredCampaigns.reduce(
        (sum, c) => sum + c.delivered,
        0,
      );
      const failed = filteredCampaigns.reduce((sum, c) => sum + c.failed, 0);
      const responses = filteredCampaigns.reduce(
        (sum, c) => sum + c.responses,
        0,
      );

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      const responseRate = delivered > 0 ? (responses / delivered) * 100 : 0;

      // Generate contact groups data based on campaign performance
      // In a real implementation, this would be calculated from actual data
      const groups = [
        {
          id: "1",
          name: "Customers",
          count: Math.floor(totalSent * 0.4),
          rate: 32.5,
        },
        {
          id: "2",
          name: "Leads",
          count: Math.floor(totalSent * 0.3),
          rate: 24.8,
        },
        {
          id: "3",
          name: "VIP",
          count: Math.floor(totalSent * 0.1),
          rate: 41.2,
        },
        {
          id: "4",
          name: "New",
          count: Math.floor(totalSent * 0.2),
          rate: 18.3,
        },
      ];

      // Update state
      setStats({
        totalSent,
        delivered,
        failed,
        responses,
        deliveryRate,
        responseRate,
      });
      setCampaigns(filteredCampaigns);
      setContactGroups(groups);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      Alert.alert("Error", "Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  // Filter campaigns based on time range
  const filterCampaignsByTimeRange = (
    campaigns: CampaignStat[],
    range: string,
  ) => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (range) {
      case "7days":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }

    return campaigns.filter((campaign) => {
      const campaignDate = new Date(campaign.date);
      return campaignDate >= cutoffDate;
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  // Handle export
  const handleExport = async () => {
    try {
      // Show loading indicator
      setRefreshing(true);

      const analyticsData = await exportAnalyticsData();
      if (!analyticsData) {
        Alert.alert("Error", "No analytics data to export");
        setRefreshing(false);
        return;
      }

      // Check if there are campaigns to export
      if (analyticsData.campaigns.length === 0) {
        Alert.alert(
          "No Data",
          "There are no campaigns to export for the selected time period.",
        );
        setRefreshing(false);
        return;
      }

      // Convert to CSV
      const campaignData = analyticsData.campaigns.map((campaign) => {
        // Avoid division by zero
        const deliveryRate =
          campaign.sent > 0
            ? ((campaign.delivered / campaign.sent) * 100).toFixed(1) + "%"
            : "0%";

        const responseRate =
          campaign.delivered > 0
            ? ((campaign.responses / campaign.delivered) * 100).toFixed(1) + "%"
            : "0%";

        return {
          Campaign: campaign.name,
          Sent: campaign.sent,
          Delivered: campaign.delivered,
          Failed: campaign.failed,
          Responses: campaign.responses,
          Date: campaign.date,
          DeliveryRate: deliveryRate,
          ResponseRate: responseRate,
        };
      });

      const csv = Papa.unparse(campaignData);
      const fileName = `analytics_export_${Date.now()}.csv`;
      const filePath = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(filePath, csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
        Alert.alert("Success", "Analytics data exported successfully");
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error exporting analytics:", error);
      Alert.alert("Error", "Failed to export analytics data");
    } finally {
      // Always hide loading indicator
      setRefreshing(false);
    }
  };

  // Load data on mount and when time range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-600">Loading analytics data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header with time range selector and refresh button */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-gray-800">
          Analytics Dashboard
        </Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={handleRefresh}
            className="mr-2 bg-gray-100 p-2 rounded-lg"
            disabled={refreshing}
          >
            <RefreshCw size={20} color={refreshing ? "#A5B4FC" : "#6366F1"} />
          </TouchableOpacity>
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
      </View>

      {refreshing && (
        <View className="items-center mb-4">
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="text-indigo-600 mt-1">Refreshing data...</Text>
        </View>
      )}

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
            {timeRange === "7days"
              ? "+12% from last week"
              : "+8% from last period"}
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
            {stats.deliveryRate.toFixed(1)}% delivery rate
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
            {stats.responseRate.toFixed(1)}% response rate
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
            {stats.totalSent > 0
              ? ((stats.failed / stats.totalSent) * 100).toFixed(1)
              : "0.0"}
            % failure rate
          </Text>
        </View>
      </View>

      {/* Campaign performance */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            Campaign Performance
          </Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleExport}
          >
            <Download size={16} color="#6366F1" />
            <Text className="ml-1 text-indigo-600">Export</Text>
          </TouchableOpacity>
        </View>

        {campaigns.length === 0 ? (
          <View className="border border-gray-200 rounded-lg p-8 items-center justify-center">
            <BarChart2 size={32} color="#D1D5DB" />
            <Text className="text-gray-500 mt-2 text-center">
              No campaign data available for the selected time period
            </Text>
          </View>
        ) : (
          /* Campaign stats table */
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
        )}
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

          {contactGroups.map((group, index, arr) => (
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

      <View className="h-20" />
    </ScrollView>
  );
}
