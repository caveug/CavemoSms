import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button } from "./ui/Button";
import {
  Search,
  UserPlus,
  Users,
  UserCircle,
  Trash2,
  Edit,
  Plus,
} from "lucide-react-native";

type Contact = {
  id: string;
  name: string;
  phone: string;
  groups: string[];
};

type Group = {
  id: string;
  name: string;
  contactCount: number;
};

const DUMMY_CONTACTS: Contact[] = [
  { id: "1", name: "John Doe", phone: "+1234567890", groups: ["friends"] },
  {
    id: "2",
    name: "Jane Smith",
    phone: "+1987654321",
    groups: ["work", "friends"],
  },
  { id: "3", name: "Bob Johnson", phone: "+1122334455", groups: ["work"] },
  { id: "4", name: "Alice Brown", phone: "+1555666777", groups: ["family"] },
  {
    id: "5",
    name: "Charlie Davis",
    phone: "+1999888777",
    groups: ["family", "friends"],
  },
];

const DUMMY_GROUPS: Group[] = [
  { id: "1", name: "Work", contactCount: 2 },
  { id: "2", name: "Friends", contactCount: 3 },
  { id: "3", name: "Family", contactCount: 2 },
];

export default function ContactManagement() {
  const [contacts, setContacts] = useState<Contact[]>(DUMMY_CONTACTS);
  const [groups, setGroups] = useState<Group[]>(DUMMY_GROUPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"contacts" | "groups">("contacts");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);
    const matchesGroup = selectedGroup
      ? contact.groups.includes(selectedGroup.toLowerCase())
      : true;
    return matchesSearch && matchesGroup;
  });

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
      <View className="flex-row items-center">
        <UserCircle size={40} color="#4B5563" />
        <View className="ml-3">
          <Text className="text-lg font-medium">{item.name}</Text>
          <Text className="text-gray-500">{item.phone}</Text>
          <View className="flex-row mt-1">
            {item.groups.map((group, index) => (
              <Text key={index} className="text-xs text-blue-600 mr-2">
                #{group}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View className="flex-row">
        <TouchableOpacity className="p-2">
          <Edit size={20} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-200 ${selectedGroup === item.name.toLowerCase() ? "bg-blue-50" : "bg-white"}`}
      onPress={() => {
        if (selectedGroup === item.name.toLowerCase()) {
          setSelectedGroup(null);
        } else {
          setSelectedGroup(item.name.toLowerCase());
          setActiveTab("contacts");
        }
      }}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Users size={24} color="#4B5563" />
          <Text className="ml-3 text-lg font-medium">{item.name}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-500 mr-2">
            {item.contactCount} contacts
          </Text>
          <TouchableOpacity className="p-1">
            <Edit size={16} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold mb-2">Contact Management</Text>
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View className="flex-row justify-between mb-2">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setActiveTab("contacts")}
              className={`px-4 py-2 rounded-t-lg ${activeTab === "contacts" ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <Text
                className={`${activeTab === "contacts" ? "text-white" : "text-gray-700"}`}
              >
                Contacts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("groups")}
              className={`px-4 py-2 rounded-t-lg ml-2 ${activeTab === "groups" ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <Text
                className={`${activeTab === "groups" ? "text-white" : "text-gray-700"}`}
              >
                Groups
              </Text>
            </TouchableOpacity>
          </View>
          <Button variant="default" size="sm" className="flex-row items-center">
            <Plus size={16} color="white" className="mr-1" />
            <Text className="text-white">
              {activeTab === "contacts" ? "Add Contact" : "Create Group"}
            </Text>
          </Button>
        </View>
      </View>

      {activeTab === "contacts" ? (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="p-4 items-center justify-center">
              <Text className="text-gray-500">No contacts found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="p-4 items-center justify-center">
              <Text className="text-gray-500">No groups found</Text>
            </View>
          }
        />
      )}

      <View className="p-4 bg-white border-t border-gray-200">
        <Button variant="outline" className="mb-2">
          <UserPlus size={20} color="#4B5563" className="mr-2" />
          Import from Device
        </Button>
        <Button variant="outline">
          <Plus size={20} color="#4B5563" className="mr-2" />
          Import from CSV
        </Button>
      </View>
    </View>
  );
}
