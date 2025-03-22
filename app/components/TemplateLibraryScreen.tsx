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
  Edit,
  Trash2,
  Copy,
  FileText,
} from "lucide-react-native";
import { Button } from "./ui/Button";

type Template = {
  id: string;
  name: string;
  content: string;
  category: string;
  usageCount: number;
  lastUsed?: string;
};

export default function TemplateLibraryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Dummy data for templates
  const templates: Template[] = [
    {
      id: "1",
      name: "Welcome Message",
      content:
        "Hi {NAME}, welcome to our service! We're excited to have you on board.",
      category: "Onboarding",
      usageCount: 45,
      lastUsed: "2023-10-15",
    },
    {
      id: "2",
      name: "Appointment Reminder",
      content:
        "Hello {NAME}, this is a reminder about your appointment on {DATE} at {TIME}.",
      category: "Reminders",
      usageCount: 78,
      lastUsed: "2023-10-18",
    },
    {
      id: "3",
      name: "Special Offer",
      content:
        "Hi {NAME}, we have a special offer just for you! Use code {CODE} for 20% off your next purchase.",
      category: "Promotions",
      usageCount: 32,
      lastUsed: "2023-10-10",
    },
    {
      id: "4",
      name: "Payment Confirmation",
      content:
        "Thank you for your payment of ${AMOUNT}. Your transaction has been processed successfully.",
      category: "Transactional",
      usageCount: 112,
      lastUsed: "2023-10-20",
    },
    {
      id: "5",
      name: "Feedback Request",
      content:
        "Hi {NAME}, we value your opinion! Please take a moment to share your feedback about our service.",
      category: "Engagement",
      usageCount: 28,
      lastUsed: "2023-10-12",
    },
  ];

  // Categories
  const categories = [
    { id: "all", name: "All Templates" },
    { id: "Onboarding", name: "Onboarding" },
    { id: "Reminders", name: "Reminders" },
    { id: "Promotions", name: "Promotions" },
    { id: "Transactional", name: "Transactional" },
    { id: "Engagement", name: "Engagement" },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === "all") return matchesSearch;
    return matchesSearch && template.category === selectedCategory;
  });

  // Function to highlight personalization tags in template content
  const highlightTags = (content: string) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /\{([^}]+)\}/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }

      parts.push({
        type: "tag",
        content: match[0],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content }];
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Search and add button */}
      <View className="flex-row items-center mb-4">
        <View className="flex-row flex-1 items-center bg-gray-100 rounded-lg px-3 py-2 mr-2">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search templates..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity className="bg-indigo-600 w-10 h-10 rounded-full items-center justify-center">
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View className="mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              className={`mr-2 px-4 py-2 rounded-full ${selectedCategory === item.id ? "bg-indigo-100 border border-indigo-300" : "bg-gray-100"}`}
            >
              <Text
                className={`${selectedCategory === item.id ? "text-indigo-700" : "text-gray-700"}`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Template list */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              setSelectedTemplate(selectedTemplate === item.id ? null : item.id)
            }
            className={`p-4 mb-3 rounded-lg border ${selectedTemplate === item.id ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <FileText size={18} color="#6366F1" />
                <Text className="ml-2 font-bold text-gray-800">
                  {item.name}
                </Text>
              </View>
              <View className="bg-gray-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-700">{item.category}</Text>
              </View>
            </View>

            <View className="mb-3">
              <View className="flex-row flex-wrap">
                {highlightTags(item.content).map((part, index) => (
                  <Text
                    key={index}
                    className={
                      part.type === "tag"
                        ? "text-indigo-600 bg-indigo-100 rounded px-1"
                        : "text-gray-800"
                    }
                  >
                    {part.content}
                  </Text>
                ))}
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500">
                Used {item.usageCount} times{" "}
                {item.lastUsed ? `• Last used ${item.lastUsed}` : ""}
              </Text>

              {selectedTemplate === item.id && (
                <View className="flex-row">
                  <TouchableOpacity className="p-2">
                    <Copy size={18} color="#6366F1" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2">
                    <Edit size={18} color="#6366F1" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2">
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Create template button */}
      <View className="mt-4">
        <Button
          onPress={() => {}}
          className="bg-indigo-600"
          icon={<Plus size={18} color="white" />}
        >
          Create New Template
        </Button>
      </View>
    </View>
  );
}
