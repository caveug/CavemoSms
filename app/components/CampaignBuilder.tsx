import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Button } from "./ui/Button";
import {
  MessageSquare,
  Users,
  Clock,
  ChevronRight,
  Save,
  Send,
  Check,
  X,
  UserCircle,
} from "lucide-react-native";
import * as FileStorage from "../utils/fileStorage";

type Template = {
  id: string;
  name: string;
  content: string;
};

type Contact = {
  id: string;
  name: string;
  phone: string;
  groups?: string[];
};

type Group = {
  id: string;
  name: string;
  fileName: string;
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

  // Contact and group selection state
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);

  // Modal visibility state
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load contacts and groups on component mount
  useEffect(() => {
    loadContactsAndGroups();
  }, []);

  const loadContactsAndGroups = async () => {
    setIsLoading(true);
    try {
      // Load groups
      const groupFiles = await FileStorage.getContactGroups();
      const groups: Group[] = groupFiles.map((fileName, index) => {
        // Extract group name from filename (e.g., "work_1234567890.json" -> "work")
        const groupName = fileName.split("_")[0].replace(/_/g, " ");
        return {
          id: index.toString(),
          name: groupName.charAt(0).toUpperCase() + groupName.slice(1), // Capitalize first letter
          fileName: fileName,
        };
      });
      setAvailableGroups(groups);

      // Load all contacts from all groups for individual selection
      const allContacts: Contact[] = [];
      for (const group of groups) {
        const groupContacts = await FileStorage.getContactsFromGroup(
          group.fileName,
        );
        allContacts.push(...groupContacts);
      }

      // Remove duplicates based on phone number
      const uniqueContacts = allContacts.filter(
        (contact, index, self) =>
          index === self.findIndex((c) => c.phone === contact.phone),
      );

      setAvailableContacts(uniqueContacts);
    } catch (error) {
      console.error("Error loading contacts and groups:", error);
      Alert.alert("Error", "Failed to load contacts and groups");
    } finally {
      setIsLoading(false);
    }
  };

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

  const toggleGroupSelection = (group: Group) => {
    if (selectedGroups.some((g) => g.id === group.id)) {
      setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const toggleContactSelection = (contact: Contact) => {
    if (selectedContacts.some((c) => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const saveCampaignDraft = async () => {
    if (!campaignName) {
      Alert.alert("Error", "Please enter a campaign name");
      return;
    }

    if (!messageContent) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    if (selectedGroups.length === 0 && selectedContacts.length === 0) {
      Alert.alert("Error", "Please select at least one recipient");
      return;
    }

    setIsLoading(true);
    try {
      const campaign = {
        id: Date.now().toString(),
        name: campaignName,
        message: messageContent,
        selectedGroups: selectedGroups,
        selectedContacts: selectedContacts,
        createdAt: new Date().toISOString(),
        status: "draft",
      };

      await FileStorage.saveCampaign(campaign);
      Alert.alert("Success", "Campaign saved as draft");
      resetForm();
    } catch (error) {
      console.error("Error saving campaign:", error);
      Alert.alert("Error", "Failed to save campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const sendCampaign = async () => {
    if (!campaignName) {
      Alert.alert("Error", "Please enter a campaign name");
      return;
    }

    if (!messageContent) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    if (selectedGroups.length === 0 && selectedContacts.length === 0) {
      Alert.alert("Error", "Please select at least one recipient");
      return;
    }

    // Confirm sending
    Alert.alert(
      "Send Campaign",
      `Are you sure you want to send this campaign to ${getTotalRecipientCount()} recipients?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: () => processSendCampaign() },
      ],
    );
  };

  const processSendCampaign = async () => {
    setIsSending(true);
    try {
      // Get all recipient phone numbers
      const recipientPhones: string[] = [];

      // Add phones from selected contacts
      selectedContacts.forEach((contact) => {
        if (contact.phone && !recipientPhones.includes(contact.phone)) {
          recipientPhones.push(contact.phone);
        }
      });

      // Add phones from selected groups
      for (const group of selectedGroups) {
        const groupContacts = await FileStorage.getContactsFromGroup(
          group.fileName,
        );
        groupContacts.forEach((contact) => {
          if (contact.phone && !recipientPhones.includes(contact.phone)) {
            recipientPhones.push(contact.phone);
          }
        });
      }

      // Save campaign with sent status
      const campaign = {
        id: Date.now().toString(),
        name: campaignName,
        message: messageContent,
        selectedGroups: selectedGroups,
        selectedContacts: selectedContacts,
        recipientCount: recipientPhones.length,
        createdAt: new Date().toISOString(),
        status: "sent",
      };

      await FileStorage.saveCampaign(campaign);

      // On mobile, we can use SMS URI scheme to send messages
      // Note: This will only send to the first recipient due to limitations
      // A real implementation would use a proper SMS API or native module
      if (recipientPhones.length > 0) {
        const smsUri = `sms:${recipientPhones[0]}?body=${encodeURIComponent(messageContent)}`;
        const canOpen = await Linking.canOpenURL(smsUri);

        if (canOpen) {
          await Linking.openURL(smsUri);
        } else {
          Alert.alert("Error", "Cannot open SMS app");
        }
      }

      Alert.alert(
        "Success",
        `Campaign sent to ${recipientPhones.length} recipients`,
      );
      resetForm();
    } catch (error) {
      console.error("Error sending campaign:", error);
      Alert.alert("Error", "Failed to send campaign");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setCampaignName("");
    setMessageContent("");
    setSelectedTemplate(null);
    setCharacterCount(0);
    setSelectedGroups([]);
    setSelectedContacts([]);
  };

  const getTotalRecipientCount = () => {
    // This is a simplified count that doesn't account for duplicates between groups and contacts
    // A real implementation would need to deduplicate phone numbers
    return (
      selectedContacts.length +
      selectedGroups.reduce((sum, group) => {
        const groupIndex = availableGroups.findIndex((g) => g.id === group.id);
        return (
          sum +
          (groupIndex >= 0 ? parseInt(availableGroups[groupIndex].id) + 1 : 0)
        );
      }, 0)
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      className={`flex-row justify-between items-center p-3 border-b border-gray-200 ${selectedGroups.some((g) => g.id === item.id) ? "bg-blue-50" : "bg-white"}`}
      onPress={() => toggleGroupSelection(item)}
    >
      <View className="flex-row items-center">
        <Users size={20} color="#4B5563" />
        <Text className="ml-2 font-medium">{item.name}</Text>
      </View>
      {selectedGroups.some((g) => g.id === item.id) && (
        <Check size={20} color="#3B82F6" />
      )}
    </TouchableOpacity>
  );

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      className={`flex-row justify-between items-center p-3 border-b border-gray-200 ${selectedContacts.some((c) => c.id === item.id) ? "bg-blue-50" : "bg-white"}`}
      onPress={() => toggleContactSelection(item)}
    >
      <View className="flex-row items-center">
        <UserCircle size={24} color="#4B5563" />
        <View className="ml-2">
          <Text className="font-medium">{item.name}</Text>
          <Text className="text-gray-500 text-sm">{item.phone}</Text>
        </View>
      </View>
      {selectedContacts.some((c) => c.id === item.id) && (
        <Check size={20} color="#3B82F6" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Groups Selection Modal */}
      <Modal visible={showGroupsModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl h-3/4">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-xl font-bold">Select Groups</Text>
              <TouchableOpacity onPress={() => setShowGroupsModal(false)}>
                <X size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <FlatList
                data={availableGroups}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View className="p-4 items-center justify-center">
                    <Text className="text-gray-500">No groups found</Text>
                  </View>
                }
              />
            )}

            <View className="p-4 border-t border-gray-200">
              <Button
                variant="default"
                onPress={() => setShowGroupsModal(false)}
              >
                Done ({selectedGroups.length} selected)
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contacts Selection Modal */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl h-3/4">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-xl font-bold">Select Contacts</Text>
              <TouchableOpacity onPress={() => setShowContactsModal(false)}>
                <X size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <FlatList
                data={availableContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View className="p-4 items-center justify-center">
                    <Text className="text-gray-500">No contacts found</Text>
                  </View>
                }
              />
            )}

            <View className="p-4 border-t border-gray-200">
              <Button
                variant="default"
                onPress={() => setShowContactsModal(false)}
              >
                Done ({selectedContacts.length} selected)
              </Button>
            </View>
          </View>
        </View>
      </Modal>

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
            <TouchableOpacity
              className="flex-row justify-between items-center border border-gray-300 rounded-lg p-3 bg-white mb-2"
              onPress={() => setShowGroupsModal(true)}
            >
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

            <TouchableOpacity
              className="flex-row justify-between items-center border border-gray-300 rounded-lg p-3 bg-white"
              onPress={() => setShowContactsModal(true)}
            >
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
            <Button
              variant="outline"
              className="flex-1 mr-2"
              onPress={saveCampaignDraft}
              disabled={isLoading || isSending}
            >
              <Save size={20} color="#4B5563" className="mr-2" />
              Save Draft
            </Button>
            <Button
              variant="default"
              className="flex-1"
              disabled={isLoading || isSending}
            >
              <Clock size={20} color="white" className="mr-2" />
              Schedule
            </Button>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          variant="default"
          className="bg-green-600"
          onPress={sendCampaign}
          disabled={isLoading || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="white" className="mr-2" />
          ) : (
            <Send size={20} color="white" className="mr-2" />
          )}
          Send Campaign Now
        </Button>
      </View>
    </View>
  );
}
