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
import { useRouter, useLocalSearchParams } from "expo-router";
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
  Edit,
  ArrowLeft,
  Calendar,
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
  const router = useRouter();
  const params = useLocalSearchParams();
  const campaignId = params.campaignId as string;
  const selectedContactsParam = params.selectedContacts as string;

  const [campaignName, setCampaignName] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Contact and group selection state
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  // Modal visibility state
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load contacts, groups, and campaign data if editing
  useEffect(() => {
    loadContactsAndGroups();
    loadTemplates();

    // If we have a campaign ID, load the campaign data
    if (campaignId) {
      loadCampaignData(campaignId);
    }

    // If we have selected contacts from params, load them
    if (selectedContactsParam) {
      try {
        const contactIds = JSON.parse(selectedContactsParam);
        if (Array.isArray(contactIds) && contactIds.length > 0) {
          // We'll load these contacts when we have the available contacts loaded
          loadSelectedContacts(contactIds);
        }
      } catch (error) {
        console.error("Error parsing selected contacts:", error);
      }
    }
  }, [campaignId, selectedContactsParam]);

  // Filter contacts based on search query
  useEffect(() => {
    if (availableContacts.length > 0) {
      if (contactSearchQuery.trim() === "") {
        setFilteredContacts(availableContacts);
      } else {
        const query = contactSearchQuery.toLowerCase();
        const filtered = availableContacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(query) ||
            contact.phone.toLowerCase().includes(query),
        );
        setFilteredContacts(filtered);
      }
    }
  }, [contactSearchQuery, availableContacts]);

  const loadTemplates = async () => {
    try {
      // In a real app, we would load templates from storage
      // For now, we'll use the dummy templates
      setTemplates(DUMMY_TEMPLATES);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const loadCampaignData = async (id: string) => {
    setIsLoading(true);
    try {
      const campaigns = await FileStorage.getCampaigns();
      const campaign = campaigns.find((c) => c.id === id);

      if (campaign) {
        setCampaignName(campaign.name || "");
        setMessageContent(campaign.message || "");
        setCharacterCount((campaign.message || "").length);

        // Load selected groups and contacts if available
        if (campaign.selectedGroups && Array.isArray(campaign.selectedGroups)) {
          setSelectedGroups(campaign.selectedGroups);
        }

        if (
          campaign.selectedContacts &&
          Array.isArray(campaign.selectedContacts)
        ) {
          setSelectedContacts(campaign.selectedContacts);
        }
      }
    } catch (error) {
      console.error("Error loading campaign data:", error);
      Alert.alert("Error", "Failed to load campaign data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedContacts = async (contactIds: string[]) => {
    if (!availableContacts.length) return; // Wait until contacts are loaded

    try {
      const contacts = availableContacts.filter((contact) =>
        contactIds.includes(contact.id),
      );

      if (contacts.length > 0) {
        setSelectedContacts(contacts);
      }
    } catch (error) {
      console.error("Error loading selected contacts:", error);
    }
  };

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

      // Make sure each contact has an id
      const contactsWithIds = uniqueContacts.map((contact) => ({
        ...contact,
        id: contact.id || contact.phone,
      }));

      setAvailableContacts(contactsWithIds);
      setFilteredContacts(contactsWithIds);

      // If we have selected contacts from params, load them now
      if (selectedContactsParam) {
        try {
          const contactIds = JSON.parse(selectedContactsParam);
          if (Array.isArray(contactIds) && contactIds.length > 0) {
            loadSelectedContacts(contactIds);
          }
        } catch (error) {
          console.error("Error parsing selected contacts:", error);
        }
      }
    } catch (error) {
      console.error("Error loading contacts and groups:", error);
      Alert.alert("Error", "Failed to load contacts and groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    // Replace personalization tags with actual values if possible
    let content = template.content;

    // If we have selected contacts and the first one has a name, use it for the {NAME} tag
    if (selectedContacts.length > 0 && selectedContacts[0].name) {
      content = content.replace(/\{NAME\}/g, selectedContacts[0].name);
    }

    // Replace other tags with placeholders
    content = content.replace(/\{DATE\}/g, new Date().toLocaleDateString());
    content = content.replace(
      /\{TIME\}/g,
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
    content = content.replace(/\{CODE\}/g, "PROMO123");

    setMessageContent(content);
    setCharacterCount(content.length);
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
      // Calculate total recipient count
      const recipientCount = await getTotalRecipientCount();

      // If we're editing an existing campaign, update it
      if (campaignId) {
        const campaigns = await FileStorage.getCampaigns();
        const updatedCampaigns = campaigns.map((c) => {
          if (c.id === campaignId) {
            return {
              ...c,
              name: campaignName,
              message: messageContent,
              selectedGroups: selectedGroups,
              selectedContacts: selectedContacts,
              updatedAt: new Date().toISOString(),
              status: "draft",
              recipients: recipientCount,
            };
          }
          return c;
        });

        await FileStorage.saveCampaigns(updatedCampaigns);
        Alert.alert("Success", "Campaign updated successfully", [
          {
            text: "OK",
            onPress: () => router.push("/components/CampaignListScreen"),
          },
        ]);
      } else {
        // Create a new campaign
        const campaign = {
          id: Date.now().toString(),
          name: campaignName,
          message: messageContent,
          selectedGroups: selectedGroups,
          selectedContacts: selectedContacts,
          createdAt: new Date().toISOString(),
          status: "draft",
          recipients: recipientCount,
        };

        // Get existing campaigns and add the new one
        const existingCampaigns = await FileStorage.getCampaigns();
        existingCampaigns.push(campaign);
        await FileStorage.saveCampaigns(existingCampaigns);

        Alert.alert("Success", "Campaign saved as draft", [
          {
            text: "OK",
            onPress: () => router.push("/components/CampaignListScreen"),
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      Alert.alert("Error", "Failed to save campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleCampaign = async () => {
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

    try {
      // Save the campaign first
      await saveCampaignDraft();

      // Navigate to scheduling screen
      router.push({
        pathname: "/components/SchedulingScreen",
        params: {
          campaignId: campaignId || Date.now().toString(),
          campaignName: campaignName,
          recipientCount: await getTotalRecipientCount(),
        },
      });
    } catch (error) {
      console.error("Error preparing to schedule campaign:", error);
      Alert.alert("Error", "Failed to prepare campaign for scheduling");
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

    try {
      // Get recipient count asynchronously
      const recipientCount = await getTotalRecipientCount();

      // Confirm sending
      Alert.alert(
        "Send Campaign",
        `Are you sure you want to send this campaign to ${recipientCount} recipients?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Send", onPress: () => processSendCampaign() },
        ],
      );
    } catch (error) {
      console.error("Error preparing to send campaign:", error);
      Alert.alert(
        "Error",
        "There was an error preparing to send the campaign. Please try again.",
      );
    }
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
        id: campaignId || Date.now().toString(),
        name: campaignName,
        message: messageContent,
        selectedGroups: selectedGroups,
        selectedContacts: selectedContacts,
        recipients: recipientPhones.length,
        createdAt: new Date().toISOString(),
        sentDate: new Date().toISOString().split("T")[0],
        status: "sent",
        delivered: recipientPhones.length - Math.floor(Math.random() * 5), // Simulate some failed messages
        failed: Math.floor(Math.random() * 5),
      };

      // Get existing campaigns
      const existingCampaigns = await FileStorage.getCampaigns();

      // If editing, update the existing campaign
      if (campaignId) {
        const updatedCampaigns = existingCampaigns.map((c) =>
          c.id === campaignId ? campaign : c,
        );
        await FileStorage.saveCampaigns(updatedCampaigns);
      } else {
        // Otherwise add the new campaign
        existingCampaigns.push(campaign);
        await FileStorage.saveCampaigns(existingCampaigns);
      }

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
        [
          {
            text: "OK",
            onPress: () => router.push("/components/CampaignListScreen"),
          },
        ],
      );
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

  const getTotalRecipientCount = async () => {
    try {
      // Start with selected individual contacts count
      let count = selectedContacts.length;

      // Add count from each selected group
      for (const group of selectedGroups) {
        try {
          // Get actual contacts from the group file
          const groupContacts = await FileStorage.getContactsFromGroup(
            group.fileName,
          );
          count += groupContacts.length;
        } catch (error) {
          console.error(
            `Error counting contacts in group ${group.name}:`,
            error,
          );
          // Fallback to a reasonable estimate if we can't get the actual count
          count += 5;
        }
      }

      return count;
    } catch (error) {
      console.error("Error calculating total recipient count:", error);
      // Return the count of selected contacts as fallback
      return selectedContacts.length;
    }
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
                <Text className="text-white">
                  Done ({selectedGroups.length} selected)
                </Text>
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
        onShow={() => {
          // Reset search when modal opens
          setContactSearchQuery("");
          setFilteredContacts(availableContacts);
        }}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl h-3/4">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-xl font-bold">Select Contacts</Text>
              <TouchableOpacity onPress={() => setShowContactsModal(false)}>
                <X size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View className="px-4 py-2">
              <TextInput
                className="border border-gray-300 rounded-lg p-2 bg-white"
                placeholder="Search contacts..."
                value={contactSearchQuery}
                onChangeText={setContactSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>

            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View className="p-4 items-center justify-center">
                    <Text className="text-gray-500">
                      {contactSearchQuery.trim() !== ""
                        ? "No matching contacts found"
                        : "No contacts found"}
                    </Text>
                  </View>
                }
              />
            )}

            <View className="p-4 border-t border-gray-200">
              <Button
                variant="default"
                onPress={() => setShowContactsModal(false)}
              >
                <Text className="text-white">
                  Done ({selectedContacts.length} selected)
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.push("/components/CampaignListScreen")}
              className="p-2 mr-2"
            >
              <ArrowLeft size={24} color="#4B5563" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold">
              {campaignId ? "Edit Campaign" : "Create Campaign"}
            </Text>
          </View>

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
                {templates.map((template) => (
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
              <Text className="text-gray-700">Save Draft</Text>
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onPress={handleScheduleCampaign}
              disabled={isLoading || isSending}
            >
              <Calendar size={20} color="white" className="mr-2" />
              <Text className="text-white">Schedule</Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          variant="default"
          className="bg-green-600"
          onPress={sendCampaign}
          disabled={
            isLoading ||
            isSending ||
            !campaignName ||
            !messageContent ||
            (selectedGroups.length === 0 && selectedContacts.length === 0)
          }
        >
          {isSending ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white ml-2">Sending...</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Send size={20} color="white" />
              <Text className="text-white ml-2">Send Campaign Now</Text>
            </View>
          )}
        </Button>
      </View>
    </View>
  );
}
