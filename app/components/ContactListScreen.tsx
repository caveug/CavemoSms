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
  Users,
  UserPlus,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  MessageSquare,
} from "lucide-react-native";
import { Button } from "./ui/Button";
import * as FileStorage from "../utils/fileStorage";

type Contact = {
  id: string;
  name: string;
  phone: string;
  groups: string[];
  lastContacted?: string;
};

type Group = {
  id: string;
  name: string;
  count: number;
};

export default function ContactListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      // Get all contact groups
      const groupNames = await FileStorage.getContactGroups();

      // Load all contacts from all groups
      let allContacts: Contact[] = [];
      const groupsWithCount: Group[] = [];

      // Add "All Contacts" group
      groupsWithCount.push({ id: "all", name: "All Contacts", count: 0 });

      // Load contacts from each group
      for (const groupName of groupNames) {
        const groupContacts = await FileStorage.getContactsFromGroup(groupName);

        // Format contacts and add group information
        const formattedContacts = groupContacts.map((contact) => ({
          id: contact.id || contact.phone,
          name: contact.name,
          phone: contact.phone,
          groups: [groupName.replace(".json", "")],
          lastContacted:
            contact.lastContacted || new Date().toISOString().split("T")[0],
        }));

        // Add to all contacts
        allContacts = [...allContacts, ...formattedContacts];

        // Add group with count
        groupsWithCount.push({
          id: groupName,
          name: groupName.replace(".json", "").replace(/_/g, " "),
          count: groupContacts.length,
        });
      }

      // Update "All Contacts" count
      groupsWithCount[0].count = allContacts.length;

      // Deduplicate contacts by phone number
      const uniqueContacts = allContacts.reduce((acc, current) => {
        const x = acc.find((item) => item.phone === current.phone);
        if (!x) {
          return acc.concat([current]);
        } else {
          // Merge groups for duplicate contacts
          x.groups = [...new Set([...x.groups, ...current.groups])];
          return acc;
        }
      }, [] as Contact[]);

      setContacts(uniqueContacts);
      setGroups(groupsWithCount);
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts. Please try again.");

      // Fallback to empty arrays if there's an error
      setContacts([]);
      setGroups([{ id: "all", name: "All Contacts", count: 0 }]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    if (selectedFilter === "all") return matchesSearch;
    return (
      matchesSearch &&
      contact.groups.includes(selectedFilter.replace(".json", ""))
    );
  });

  const handleAddContact = () => {
    router.push("/components/ContactManagement");
  };

  const handleImportContacts = () => {
    router.push("/components/ImportContactsScreen");
  };

  const handleDeleteContacts = async () => {
    if (selectedContacts.length === 0) return;

    Alert.alert(
      "Delete Contacts",
      `Are you sure you want to delete ${selectedContacts.length} contact(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Show loading state
              setRefreshing(true);

              // Get all groups
              const groupNames = await FileStorage.getContactGroups();

              // For each group, remove the selected contacts
              for (const groupName of groupNames) {
                try {
                  const groupContacts =
                    await FileStorage.getContactsFromGroup(groupName);
                  const updatedContacts = groupContacts.filter(
                    (contact) =>
                      !selectedContacts.includes(contact.id || contact.phone),
                  );

                  // Save the updated contacts back to the group
                  await FileStorage.saveContactsToGroup(
                    updatedContacts,
                    groupName,
                  );
                } catch (groupError) {
                  console.error(
                    `Error updating group ${groupName}:`,
                    groupError,
                  );
                  // Continue with other groups even if one fails
                }
              }

              // Clear selection and reload contacts
              setSelectedContacts([]);
              await loadContacts();

              Alert.alert("Success", "Contacts deleted successfully");
            } catch (error) {
              console.error("Error deleting contacts:", error);
              Alert.alert(
                "Error",
                "Failed to delete contacts. Please try again.",
              );
            } finally {
              // Hide loading state
              setRefreshing(false);
            }
          },
        },
      ],
    );
  };

  const handleAddToGroup = async () => {
    if (selectedContacts.length === 0) return;

    try {
      // Get all groups
      const groupNames = await FileStorage.getContactGroups();
      const formattedGroups = groupNames.map((name) => ({
        label: name.replace(".json", "").replace(/_/g, " "),
        value: name,
      }));

      // Show group selection dialog
      Alert.alert("Add to Group", "Select a group or create a new one", [
        { text: "Cancel", style: "cancel" },
        {
          text: "New Group",
          onPress: () => {
            // Using Alert.alert instead of Alert.prompt which is iOS-only
            Alert.alert("New Group", "Enter a name for the new group", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Create",
                onPress: async () => {
                  // In a real implementation, we would use a proper input dialog
                  // For now, we'll use a default group name
                  const groupName = "New Group";
                  if (!groupName) return;

                  const fileName = `${groupName.replace(/ /g, "_")}.json`;

                  // Get selected contacts
                  const selectedContactObjects = contacts.filter((contact) =>
                    selectedContacts.includes(contact.id),
                  );

                  // Save to new group
                  await FileStorage.saveContactsToGroup(
                    selectedContactObjects,
                    fileName,
                  );

                  // Clear selection and reload
                  setSelectedContacts([]);
                  await loadContacts();

                  Alert.alert(
                    "Success",
                    `${selectedContactObjects.length} contacts added to ${groupName}`,
                  );
                },
              },
            ]);
          },
        },
        ...formattedGroups.map((group) => ({
          text: group.label,
          onPress: async () => {
            // Get existing contacts in the group
            const groupContacts = await FileStorage.getContactsFromGroup(
              group.value,
            );

            // Get selected contacts
            const selectedContactObjects = contacts.filter((contact) =>
              selectedContacts.includes(contact.id),
            );

            // Merge contacts (avoid duplicates by phone)
            const mergedContacts = [...groupContacts];

            for (const contact of selectedContactObjects) {
              const existingIndex = mergedContacts.findIndex(
                (c) => c.phone === contact.phone,
              );
              if (existingIndex === -1) {
                mergedContacts.push(contact);
              }
            }

            // Save back to group
            await FileStorage.saveContactsToGroup(mergedContacts, group.value);

            // Clear selection and reload
            setSelectedContacts([]);
            await loadContacts();

            Alert.alert("Success", `Contacts added to ${group.label}`);
          },
        })),
      ]);
    } catch (error) {
      console.error("Error adding to group:", error);
      Alert.alert(
        "Error",
        "Failed to add contacts to group. Please try again.",
      );
    }
  };

  const handleCreateCampaign = () => {
    if (selectedContacts.length === 0) return;

    // Navigate to campaign builder with selected contacts
    router.push({
      pathname: "/components/CampaignBuilder",
      params: {
        selectedContacts: JSON.stringify(selectedContacts),
      },
    });
  };

  const toggleContactSelection = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(
        selectedContacts.filter((contactId) => contactId !== id),
      );
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Search and filter bar */}
      <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3 py-2">
        <Search size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-800"
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity className="ml-2 p-1">
          <Filter size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Groups horizontal scroll */}
      <View className="mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                setSelectedFilter(
                  item.name === "All Contacts" ? "all" : item.name,
                )
              }
              className={`mr-2 px-4 py-2 rounded-full ${selectedFilter === (item.name === "All Contacts" ? "all" : item.name) ? "bg-indigo-100 border border-indigo-300" : "bg-gray-100"}`}
            >
              <Text
                className={`${selectedFilter === (item.name === "All Contacts" ? "all" : item.name) ? "text-indigo-700" : "text-gray-700"}`}
              >
                {item.name} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Contact list */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="py-8 items-center justify-center">
            <Text className="text-gray-500 text-center mb-4">
              No contacts found
            </Text>
            <Button
              onPress={handleImportContacts}
              className="bg-indigo-600"
              icon={<Users size={18} color="white" />}
            >
              Import Contacts
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleContactSelection(item.id)}
            className={`flex-row items-center p-3 mb-2 rounded-lg border ${selectedContacts.includes(item.id) ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`}
          >
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${selectedContacts.includes(item.id) ? "bg-indigo-200" : "bg-gray-200"}`}
            >
              <Text
                className={`font-bold ${selectedContacts.includes(item.id) ? "text-indigo-700" : "text-gray-700"}`}
              >
                {item.name.charAt(0)}
              </Text>
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-gray-800">{item.name}</Text>
              <Text className="text-gray-500">{item.phone}</Text>
            </View>
            <View className="flex-row">
              {item.groups.slice(0, 2).map((group, index) => (
                <View
                  key={index}
                  className="bg-gray-100 rounded-full px-2 py-1 mr-1"
                >
                  <Text className="text-xs text-gray-700">{group}</Text>
                </View>
              ))}
              {item.groups.length > 2 && (
                <View className="bg-gray-100 rounded-full px-2 py-1">
                  <Text className="text-xs text-gray-700">
                    +{item.groups.length - 2}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity className="ml-2 p-1">
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Action buttons */}
      <View className="flex-row justify-between mt-4">
        <Button
          onPress={handleAddContact}
          variant="outline"
          className="flex-1 mr-2"
          icon={<UserPlus size={18} color="#6366F1" />}
        >
          Add Contact
        </Button>
        <Button
          onPress={handleImportContacts}
          className="flex-1 ml-2 bg-indigo-600"
          icon={<Users size={18} color="white" />}
        >
          Import Contacts
        </Button>
      </View>

      {/* Selection actions */}
      {selectedContacts.length > 0 && (
        <View className="absolute bottom-4 left-4 right-4 bg-indigo-600 rounded-lg p-4 flex-row justify-between items-center">
          <Text className="text-white font-medium">
            {selectedContacts.length} selected
          </Text>
          <View className="flex-row">
            <Button
              onPress={handleDeleteContacts}
              variant="ghost"
              className="mr-2"
              icon={<Trash2 size={18} color="white" />}
            >
              Delete
            </Button>
            <Button onPress={handleAddToGroup} variant="ghost" className="mr-2">
              Add to Group
            </Button>
            <Button
              onPress={handleCreateCampaign}
              variant="ghost"
              className="bg-indigo-700"
              icon={<MessageSquare size={18} color="white" />}
            >
              New Campaign
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
