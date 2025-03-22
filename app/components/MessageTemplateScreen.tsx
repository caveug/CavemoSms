import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Button } from "./ui/Button";
import { MessageSquare, Edit, Trash2, Plus, Save } from "lucide-react-native";

type Template = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

const DUMMY_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Welcome Message",
    content:
      "Hi {NAME}, welcome to our service! Reply HELP for assistance or STOP to unsubscribe.",
    createdAt: "2023-10-01",
  },
  {
    id: "2",
    name: "Appointment Reminder",
    content:
      "Reminder: You have an appointment scheduled for {DATE} at {TIME}. Reply C to confirm or R to reschedule.",
    createdAt: "2023-10-05",
  },
  {
    id: "3",
    name: "Special Offer",
    content:
      "Hi {NAME}, we have a special offer just for you! Get 20% off your next purchase with code: {CODE}",
    createdAt: "2023-10-10",
  },
  {
    id: "4",
    name: "Payment Confirmation",
    content:
      "Thank you for your payment of ${AMOUNT}. Your transaction has been processed successfully.",
    createdAt: "2023-10-15",
  },
];

export default function MessageTemplateScreen() {
  const [templates, setTemplates] = useState<Template[]>(DUMMY_TEMPLATES);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEditTemplate = (template: Template) => {
    setIsEditing(true);
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((template) => template.id !== id));
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !templateContent.trim()) return;

    if (isEditing && editingTemplate) {
      setTemplates(
        templates.map((template) =>
          template.id === editingTemplate.id
            ? { ...template, name: templateName, content: templateContent }
            : template,
        ),
      );
    } else {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: templateName,
        content: templateContent,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTemplates([newTemplate, ...templates]);
    }

    setIsEditing(false);
    setEditingTemplate(null);
    setTemplateName("");
    setTemplateContent("");
  };

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <View className="p-4 border-b border-gray-200 bg-white">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="text-lg font-medium">{item.name}</Text>
          <Text className="text-gray-500 text-sm mt-1">{item.content}</Text>
          <Text className="text-gray-400 text-xs mt-2">
            Created: {item.createdAt}
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="p-2"
            onPress={() => handleEditTemplate(item)}
          >
            <Edit size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2"
            onPress={() => handleDeleteTemplate(item.id)}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold mb-2">Message Templates</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-4"
          placeholder="Search templates..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isEditing || (!isEditing && (templateName || templateContent)) ? (
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-lg font-medium mb-2">
            {isEditing ? "Edit Template" : "Create New Template"}
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white mb-3"
            placeholder="Template Name"
            value={templateName}
            onChangeText={setTemplateName}
          />
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white h-40 mb-3"
            placeholder="Template Content"
            multiline
            textAlignVertical="top"
            value={templateContent}
            onChangeText={setTemplateContent}
          />
          <View className="flex-row">
            <Button
              variant="outline"
              className="flex-1 mr-2"
              onPress={() => {
                setIsEditing(false);
                setEditingTemplate(null);
                setTemplateName("");
                setTemplateContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onPress={handleSaveTemplate}
              disabled={!templateName.trim() || !templateContent.trim()}
            >
              <Save size={20} color="white" className="mr-2" />
              Save Template
            </Button>
          </View>
        </View>
      ) : (
        <View className="p-4">
          <Button
            variant="default"
            className="mb-4"
            onPress={() => {
              setIsEditing(false);
              setTemplateName("");
              setTemplateContent("");
            }}
          >
            <Plus size={20} color="white" className="mr-2" />
            Create New Template
          </Button>
        </View>
      )}

      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="p-4 items-center justify-center">
            <MessageSquare size={40} color="#D1D5DB" />
            <Text className="text-gray-500 mt-2">No templates found</Text>
          </View>
        }
      />
    </View>
  );
}
