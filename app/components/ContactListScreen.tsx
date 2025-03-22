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
  Users,
  UserPlus,
  Filter,
  MoreVertical,
} from "lucide-react-native";
import { Button } from "./ui/Button";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Dummy data for contacts
  const contacts: Contact[] = [
    {
      id: "1",
      name: "John Doe",
      phone: "+1234567890",
      groups: ["Customers", "VIP"],
      lastContacted: "2023-10-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      phone: "+1987654321",
      groups: ["Leads"],
      lastContacted: "2023-10-10",
    },
    {
      id: "3",
      name: "Bob Johnson",
      phone: "+1122334455",
      groups: ["Customers"],
      lastContacted: "2023-09-28",
    },
    {
      id: "4",
      name: "Alice Brown",
      phone: "+15556667777",
      groups: ["Leads", "New"],
      lastContacted: "2023-10-18",
    },
  ];

  // Dummy data for groups
  const groups: Group[] = [
    { id: "1", name: "All Contacts", count: contacts.length },
    { id: "2", name: "Customers", count: 2 },
    { id: "3", name: "Leads", count: 2 },
    { id: "4", name: "VIP", count: 1 },
    { id: "5", name: "New", count: 1 },
  ];

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && contact.groups.includes(selectedFilter);
  });

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
          onPress={() => {}}
          variant="outline"
          className="flex-1 mr-2"
          icon={<UserPlus size={18} color="#6366F1" />}
        >
          Add Contact
        </Button>
        <Button
          onPress={() => {}}
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
            <Button onPress={() => {}} variant="ghost" className="mr-2">
              Add to Group
            </Button>
            <Button
              onPress={() => {}}
              variant="ghost"
              className="bg-indigo-700"
            >
              New Campaign
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
