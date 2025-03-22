import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button } from "./ui/Button";
import {
  MessageSquare,
  Users,
  Clock,
  ChevronRight,
  Save,
  Send,
} from "lucide-react-native";

type Template = {
  id: string;
  name: string;
  content: string;
};

const DUMMY_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Welcome Message",
    content:
      "Hi {NAME}, welcome to our service! Reply HELP for assistance or STOP to unsubscribe.",
  },
  {
    id: "2",
    name: "Appointment Reminder",
    content:
      "Reminder: You have an appointment scheduled for {DATE} at {TIME}. Reply C to confirm or R to reschedule.",
  },
  {
    id: "3",
    name: "Special Offer",
    content:
      "Hi {NAME}, we have a special offer just for you! Get 20% off your next purchase with code: {CODE}",
  },
];

export default function CampaignBuilder() {
  const [campaignName, setCampaignName] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const handleTemplateSelect = (template: Template) => {
    setMessageContent(template.content);
    setCharacterCount(template.content.length);
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleMessageChange = (text: string) => {
    setMessageContent(text);
    setCharacterCount(text.length);
  };

  const insertPersonalizationTag = (tag: string) => {
    const newText = messageContent + tag;
    setMessageContent(newText);
    setCharacterCount(newText.length);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold mb-4">Campaign Builder</Text>

          {/* Campaign Name */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Campaign Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Enter campaign name"
              value={campaignName}
              onChangeText={setCampaignName}
            />
          </View>

          {/* Recipients Section */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Recipients</Text>
            <TouchableOpacity className="flex-row justify-between items-center border border-gray-300 rounded-lg p-3 bg-white mb-2">
              <View className="flex-row items-center">
                <Users size={20} color="#4B5563" />
                <Text className="ml-2">Select Groups</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">
                  {selectedGroups.length} selected
                </Text>
                <ChevronRight size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center border border-gray-300 rounded-lg p-3 bg-white">
              <View className="flex-row items-center">
                <Users size={20} color="#4B5563" />
                <Text className="ml-2">Select Individual Contacts</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">
                  {selectedContacts.length} selected
                </Text>
                <ChevronRight size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Message Composition */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-medium">Message Content</Text>
              <TouchableOpacity
                onPress={() => setShowTemplates(!showTemplates)}
                className="flex-row items-center"
              >
                <Text className="text-blue-600 mr-1">Templates</Text>
                <ChevronRight size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {showTemplates && (
              <View className="mb-4 border border-gray-300 rounded-lg bg-white">
                {DUMMY_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    className="p-3 border-b border-gray-200"
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <Text className="font-medium">{template.name}</Text>
                    <Text
                      className="text-gray-500 text-sm mt-1"
                      numberOfLines={1}
                    >
                      {template.content}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white h-40"
              placeholder="Type your message here..."
              multiline
              textAlignVertical="top"
              value={messageContent}
              onChangeText={handleMessageChange}
            />

            <View className="flex-row justify-between mt-2">
              <Text
                className={`text-sm ${characterCount > 160 ? "text-red-500" : "text-gray-500"}`}
              >
                {characterCount}/160 characters{" "}
                {characterCount > 160 ? "(will be split)" : ""}
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className="mr-2"
                  onPress={() => insertPersonalizationTag("{NAME}")}
                >
                  <Text className="text-blue-600">+Name</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="mr-2"
                  onPress={() => insertPersonalizationTag("{DATE}")}
                >
                  <Text className="text-blue-600">+Date</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => insertPersonalizationTag("{CODE}")}
                >
                  <Text className="text-blue-600">+Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Preview Section */}
          <View className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <Text className="text-base font-medium mb-2">Message Preview</Text>
            <View className="bg-white p-3 rounded-lg border border-gray-200">
              <Text>{messageContent || "Your message will appear here"}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between">
            <Button variant="outline" className="flex-1 mr-2">
              <Save size={20} color="#4B5563" className="mr-2" />
              Save Draft
            </Button>
            <Button variant="default" className="flex-1">
              <Clock size={20} color="white" className="mr-2" />
              Schedule
            </Button>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <Button variant="default" className="bg-green-600">
          <Send size={20} color="white" className="mr-2" />
          Send Campaign Now
        </Button>
      </View>
    </View>
  );
}
