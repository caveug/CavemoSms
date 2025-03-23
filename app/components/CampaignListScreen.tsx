import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Search,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Copy,
} from "lucide-react-native";
import { Button } from "./ui/Button";
import * as FileStorage from "../utils/fileStorage";

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      // Get campaigns from storage
      const storedCampaigns = await FileStorage.getCampaigns();

      if (storedCampaigns && storedCampaigns.length > 0) {
        setCampaigns(storedCampaigns);
      } else {
        // If no campaigns found, set empty array
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
      Alert.alert("Error", "Failed to load campaigns. Please try again.");
      setCampaigns([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  const toggleCampaignSelection = (id: string) => {
    if (selectedCampaigns.includes(id)) {
      setSelectedCampaigns(
        selectedCampaigns.filter((campaignId) => campaignId !== id),
      );
    } else {
      setSelectedCampaigns([...selectedCampaigns, id]);
    }
  };

  const handleCreateCampaign = () => {
    router.push("/components/CampaignBuilder");
  };

  const handleEditCampaign = (id: string) => {
    router.push({
      pathname: "/components/CampaignBuilder",
      params: { campaignId: id },
    });
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      // Create a copy of the campaign
      const newCampaign = {
        ...campaign,
        id: Date.now().toString(),
        name: `${campaign.name} (Copy)`,
        status: "draft" as Campaign["status"],
        sentDate: undefined,
        scheduledDate: undefined,
      };

      // Get existing campaigns
      const existingCampaigns = await FileStorage.getCampaigns();

      // Add new campaign
      const updatedCampaigns = [...existingCampaigns, newCampaign];

      // Save updated campaigns
      await FileStorage.saveCampaigns(updatedCampaigns);

      // Reload campaigns
      await loadCampaigns();

      Alert.alert("Success", "Campaign duplicated successfully");
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      Alert.alert("Error", "Failed to duplicate campaign. Please try again.");
    }
  };

  const handleDeleteCampaigns = async () => {
    if (selectedCampaigns.length === 0) return;

    Alert.alert(
      "Delete Campaigns",
      `Are you sure you want to delete ${selectedCampaigns.length} campaign(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Get existing campaigns
              const existingCampaigns = await FileStorage.getCampaigns();

              // Filter out selected campaigns
              const updatedCampaigns = existingCampaigns.filter(
                (campaign) => !selectedCampaigns.includes(campaign.id),
              );

              // Save updated campaigns
              await FileStorage.saveCampaigns(updatedCampaigns);

              // Clear selection and reload
              setSelectedCampaigns([]);
              await loadCampaigns();

              Alert.alert("Success", "Campaigns deleted successfully");
            } catch (error) {
              console.error("Error deleting campaigns:", error);
              Alert.alert(
                "Error",
                "Failed to delete campaigns. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    if (campaign.status === "sent") {
      Alert.alert(
        "Campaign Already Sent",
        "This campaign has already been sent.",
      );
      return;
    }

    Alert.alert(
      "Send Campaign",
      `Are you sure you want to send "${campaign.name}" to ${campaign.recipients} recipients now?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Now",
          onPress: async () => {
            try {
              // Update campaign status
              const updatedCampaign = {
                ...campaign,
                status: "sent" as Campaign["status"],
                sentDate: new Date().toISOString().split("T")[0],
                delivered: campaign.recipients - Math.floor(Math.random() * 5), // Simulate some failed messages
                failed: Math.floor(Math.random() * 5),
              };

              // Get existing campaigns
              const existingCampaigns = await FileStorage.getCampaigns();

              // Replace the campaign
              const updatedCampaigns = existingCampaigns.map((c) =>
                c.id === campaign.id ? updatedCampaign : c,
              );

              // Save updated campaigns
              await FileStorage.saveCampaigns(updatedCampaigns);

              // Reload campaigns
              await loadCampaigns();

              Alert.alert("Success", "Campaign sent successfully");
            } catch (error) {
              console.error("Error sending campaign:", error);
              Alert.alert(
                "Error",
                "Failed to send campaign. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

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

  // Sort campaigns: drafts first, then scheduled, then in-progress, then sent
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const statusOrder = { draft: 0, scheduled: 1, "in-progress": 2, sent: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
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
        data={sortedCampaigns}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="py-8 items-center justify-center">
            <Text className="text-gray-500 text-center mb-4">
              No campaigns found
            </Text>
            <Button
              onPress={handleCreateCampaign}
              className="bg-indigo-600"
              icon={<MessageSquare size={18} color="white" />}
            >
              Create Campaign
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`p-4 mb-3 border rounded-lg ${selectedCampaigns.includes(item.id) ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`}
            onPress={() => toggleCampaignSelection(item.id)}
            onLongPress={() => handleEditCampaign(item.id)}
          >
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

            {/* Action buttons */}
            <View className="flex-row mt-3 justify-end">
              {item.status === "draft" && (
                <TouchableOpacity
                  className="mr-3 p-2 bg-indigo-100 rounded-full"
                  onPress={() => handleSendCampaign(item)}
                >
                  <MessageSquare size={18} color="#6366F1" />
                </TouchableOpacity>
              )}
              {item.status === "scheduled" && (
                <TouchableOpacity
                  className="mr-3 p-2 bg-indigo-100 rounded-full"
                  onPress={() => handleSendCampaign(item)}
                >
                  <MessageSquare size={18} color="#6366F1" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="mr-3 p-2 bg-gray-100 rounded-full"
                onPress={() => handleDuplicateCampaign(item)}
              >
                <Copy size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 bg-gray-100 rounded-full"
                onPress={() => handleEditCampaign(item.id)}
              >
                <Edit size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Selection actions */}
      {selectedCampaigns.length > 0 && (
        <View className="absolute bottom-20 left-4 right-4 bg-indigo-600 rounded-lg p-4 flex-row justify-between items-center">
          <Text className="text-white font-medium">
            {selectedCampaigns.length} selected
          </Text>
          <View className="flex-row">
            <Button
              onPress={handleDeleteCampaigns}
              variant="ghost"
              className="bg-indigo-700"
              icon={<Trash2 size={18} color="white" />}
            >
              Delete
            </Button>
          </View>
        </View>
      )}

      {/* Create campaign button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={handleCreateCampaign}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
