import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  Search,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { Button } from "./ui/Button";

type Campaign = {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "sent" | "in-progress";
  recipients: number;
  delivered?: number;
  failed?: number;
  sentDate?: string;
  scheduledDate?: string;
};

export default function CampaignListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Dummy data for campaigns
  const campaigns: Campaign[] = [
    {
      id: "1",
      name: "Welcome Message",
      status: "sent",
      recipients: 120,
      delivered: 118,
      failed: 2,
      sentDate: "2023-10-15",
    },
    {
      id: "2",
      name: "October Promotion",
      status: "scheduled",
      recipients: 250,
      scheduledDate: "2023-10-25",
    },
    {
      id: "3",
      name: "Customer Feedback",
      status: "draft",
      recipients: 85,
    },
    {
      id: "4",
      name: "Black Friday Sale",
      status: "scheduled",
      recipients: 500,
      scheduledDate: "2023-11-24",
    },
    {
      id: "5",
      name: "New Product Announcement",
      status: "in-progress",
      recipients: 300,
      delivered: 150,
      failed: 5,
    },
  ];

  const filters = [
    { id: "all", name: "All Campaigns" },
    { id: "draft", name: "Drafts" },
    { id: "scheduled", name: "Scheduled" },
    { id: "sent", name: "Sent" },
    { id: "in-progress", name: "In Progress" },
  ];

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && campaign.status === selectedFilter;
  });

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "sent":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: Campaign["status"]) => {
    switch (status) {
      case "draft":
        return <MessageSquare size={16} color="#4B5563" />;
      case "scheduled":
        return <Clock size={16} color="#1D4ED8" />;
      case "sent":
        return <CheckCircle size={16} color="#047857" />;
      case "in-progress":
        return <AlertCircle size={16} color="#B45309" />;
      default:
        return <MessageSquare size={16} color="#4B5563" />;
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Search bar */}
      <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3 py-2">
        <Search size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-800"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View className="mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedFilter(item.id)}
              className={`mr-2 px-4 py-2 rounded-full ${selectedFilter === item.id ? "bg-indigo-100 border border-indigo-300" : "bg-gray-100"}`}
            >
              <Text
                className={`${selectedFilter === item.id ? "text-indigo-700" : "text-gray-700"}`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Campaign list */}
      <FlatList
        data={filteredCampaigns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="p-4 mb-3 border border-gray-200 rounded-lg">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-lg text-gray-800">
                {item.name}
              </Text>
              <View
                className={`flex-row items-center px-2 py-1 rounded-full ${getStatusColor(item.status).split(" ")[0]}`}
              >
                {getStatusIcon(item.status)}
                <Text
                  className={`ml-1 text-xs ${getStatusColor(item.status).split(" ")[1]}`}
                >
                  {item.status === "in-progress"
                    ? "In Progress"
                    : item.status.charAt(0).toUpperCase() +
                      item.status.slice(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <Text className="text-gray-500">
                Recipients: {item.recipients}
              </Text>
              {item.delivered && (
                <Text className="ml-4 text-gray-500">
                  Delivered: {item.delivered}
                </Text>
              )}
              {item.failed && (
                <Text className="ml-4 text-gray-500">
                  Failed: {item.failed}
                </Text>
              )}
            </View>

            {item.sentDate && (
              <Text className="text-gray-500">Sent: {item.sentDate}</Text>
            )}
            {item.scheduledDate && (
              <Text className="text-gray-500">
                Scheduled: {item.scheduledDate}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Create campaign button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
