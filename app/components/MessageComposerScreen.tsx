import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button } from "./ui/Button";
import {
  Save,
  Send,
  Clock,
  Users,
  Tag,
  FileText,
  ChevronDown,
} from "lucide-react-native";

type Template = {
  id: string;
  name: string;
  content: string;
};

type PersonalizationTag = {
  id: string;
  name: string;
  tag: string;
};

export default function MessageComposerScreen() {
  const [message, setMessage] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  // Dummy data for templates
  const templates: Template[] = [
    {
      id: "1",
      name: "Welcome Message",
      content:
        "Hi {NAME}, welcome to our service! We're excited to have you on board.",
    },
    {
      id: "2",
      name: "Appointment Reminder",
      content:
        "Hello {NAME}, this is a reminder about your appointment on {DATE} at {TIME}.",
    },
    {
      id: "3",
      name: "Special Offer",
      content:
        "Hi {NAME}, we have a special offer just for you! Use code {CODE} for 20% off your next purchase.",
    },
  ];

  // Personalization tags
  const personalizationTags: PersonalizationTag[] = [
    { id: "1", name: "Name", tag: "{NAME}" },
    { id: "2", name: "Phone", tag: "{PHONE}" },
    { id: "3", name: "Date", tag: "{DATE}" },
    { id: "4", name: "Time", tag: "{TIME}" },
    { id: "5", name: "Code", tag: "{CODE}" },
  ];

  useEffect(() => {
    setCharacterCount(message.length);
  }, [message]);

  const selectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setSelectedTemplate(templateId);
    }
    setShowTemplates(false);
  };

  const insertTag = (tag: string) => {
    setMessage((prev) => prev + tag);
    setShowTags(false);
  };

  const getMessageParts = () => {
    const parts = [];
    let remainingMessage = message;
    let lastIndex = 0;

    personalizationTags.forEach((tag) => {
      const tagRegex = new RegExp(tag.tag.replace(/[{}/\\]/g, "\\$&"), "g");
      let match;

      while ((match = tagRegex.exec(message)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: message.substring(lastIndex, match.index),
          });
        }

        parts.push({
          type: "tag",
          content: tag.tag,
          name: tag.name,
        });

        lastIndex = match.index + tag.tag.length;
      }
    });

    if (lastIndex < message.length) {
      parts.push({
        type: "text",
        content: message.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content: message }];
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Campaign name input */}
      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Campaign Name</Text>
        <TextInput
          value={campaignName}
          onChangeText={setCampaignName}
          placeholder="Enter campaign name"
          className="border border-gray-300 rounded-lg p-3"
        />
      </View>

      {/* Recipients selector */}
      <TouchableOpacity className="flex-row justify-between items-center p-3 border border-gray-300 rounded-lg mb-4">
        <View className="flex-row items-center">
          <Users size={20} color="#6366F1" />
          <Text className="ml-2 text-gray-700">Recipients</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-700 mr-2">{recipientCount} selected</Text>
          <ChevronDown size={18} color="#6B7280" />
        </View>
      </TouchableOpacity>

      {/* Message composer */}
      <View className="flex-1 mb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-700 font-medium">Message</Text>
          <Text
            className={`text-sm ${characterCount > 160 ? "text-red-500" : "text-gray-500"}`}
          >
            {characterCount}/160 characters{" "}
            {characterCount > 160
              ? `(${Math.ceil(characterCount / 160)} SMS)`
              : ""}
          </Text>
        </View>

        {/* Template selector */}
        <View className="mb-2">
          <TouchableOpacity
            onPress={() => setShowTemplates(!showTemplates)}
            className="flex-row items-center p-2 bg-gray-100 rounded-lg"
          >
            <FileText size={18} color="#6366F1" />
            <Text className="ml-2 text-indigo-600">
              {selectedTemplate
                ? `Template: ${templates.find((t) => t.id === selectedTemplate)?.name}`
                : "Select Template"}
            </Text>
          </TouchableOpacity>

          {showTemplates && (
            <View className="border border-gray-200 rounded-lg mt-1 bg-white shadow-sm">
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => selectTemplate(template.id)}
                  className="p-3 border-b border-gray-200"
                >
                  <Text className="font-medium">{template.name}</Text>
                  <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    {template.content}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Message input */}
        <View className="flex-1 border border-gray-300 rounded-lg">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message here..."
            multiline
            className="p-3 text-gray-800 flex-1"
            style={{ textAlignVertical: "top" }}
          />

          {/* Message preview with highlighted tags */}
          {message.length > 0 && (
            <ScrollView className="p-3 bg-gray-50 border-t border-gray-300">
              <Text className="text-sm font-medium mb-1">Preview:</Text>
              <View className="flex-row flex-wrap">
                {getMessageParts().map((part, index) => (
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
            </ScrollView>
          )}
        </View>

        {/* Personalization tags */}
        <View className="mt-2">
          <TouchableOpacity
            onPress={() => setShowTags(!showTags)}
            className="flex-row items-center p-2 bg-gray-100 rounded-lg"
          >
            <Tag size={18} color="#6366F1" />
            <Text className="ml-2 text-indigo-600">
              Insert Personalization Tag
            </Text>
          </TouchableOpacity>

          {showTags && (
            <View className="flex-row flex-wrap mt-1 p-2 border border-gray-200 rounded-lg bg-white">
              {personalizationTags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => insertTag(tag.tag)}
                  className="bg-indigo-100 rounded-full px-3 py-1 m-1"
                >
                  <Text className="text-indigo-600">{tag.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-between">
        <Button
          onPress={() => {}}
          variant="outline"
          className="flex-1 mr-2"
          icon={<Save size={18} color="#6366F1" />}
        >
          Save Draft
        </Button>
        <Button
          onPress={() => {}}
          className="flex-1 ml-2 bg-indigo-600"
          icon={<Clock size={18} color="white" />}
        >
          Schedule
        </Button>
      </View>
    </View>
  );
}
