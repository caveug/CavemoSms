import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { Button } from "./ui/Button";
import {
  Upload,
  Check,
  X,
  AlertCircle,
  FileText,
  UserPlus,
  Users,
} from "lucide-react-native";

type Contact = {
  name: string;
  phone: string;
  valid: boolean;
};

export default function ImportContactsScreen() {
  const [step, setStep] = useState<
    "upload" | "preview" | "mapping" | "validation" | "complete"
  >("upload");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [mappedFields, setMappedFields] = useState<{
    name: string;
    phone: string;
  }>({ name: "", phone: "" });
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState("");

  // Dummy data for preview
  const dummyPreviewData = [
    ["John Doe", "+1234567890", "john@example.com", "Customer"],
    ["Jane Smith", "+1987654321", "jane@example.com", "Lead"],
    ["Bob Johnson", "+1122334455", "bob@example.com", "Customer"],
    ["Alice Brown", "+15556667777", "alice@example.com", "Lead"],
  ];

  // Complete the rest of the component implementation
  return (
    <View className="flex-1 bg-white p-4">
      {step === "upload" && (
        <View className="flex-1 justify-center items-center">
          <View className="bg-gray-50 p-6 rounded-xl w-full max-w-md border border-gray-200">
            <View className="items-center mb-6">
              <Upload size={48} color="#6366F1" />
              <Text className="text-xl font-bold mt-4 text-gray-800">
                Import Contacts
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-2">
                Upload a CSV file with your contacts or import from your device
              </Text>
            </View>

            <Button
              onPress={() => {
                setFileSelected(true);
                setFileName("contacts.csv");
                setPreviewData(dummyPreviewData);
                setStep("preview");
              }}
              className="mb-3 bg-indigo-600"
              icon={<FileText size={18} color="white" />}
            >
              Select CSV File
            </Button>

            <Button
              onPress={() => {
                setFileSelected(true);
                setFileName("Device Contacts");
                setPreviewData(dummyPreviewData);
                setStep("preview");
              }}
              variant="outline"
              className="border-indigo-600"
              icon={<UserPlus size={18} color="#6366F1" />}
            >
              Import from Device
            </Button>
          </View>
        </View>
      )}

      {step === "preview" && (
        <View className="flex-1">
          <View className="flex-row items-center mb-4">
            <FileText size={20} color="#6366F1" />
            <Text className="ml-2 text-lg font-semibold">{fileName}</Text>
          </View>

          <Text className="text-lg font-bold mb-2">Preview</Text>
          <Text className="text-sm text-gray-500 mb-4">
            Review your contact data before importing
          </Text>

          <View className="border border-gray-200 rounded-lg mb-4">
            <ScrollView horizontal>
              <View>
                <View className="flex-row bg-gray-100 p-3">
                  <Text className="font-medium w-32">Name</Text>
                  <Text className="font-medium w-32">Phone</Text>
                  <Text className="font-medium w-32">Email</Text>
                  <Text className="font-medium w-24">Category</Text>
                </View>
                <FlatList
                  data={previewData}
                  renderItem={({ item }) => (
                    <View className="flex-row border-t border-gray-200 p-3">
                      <Text className="w-32">{item[0]}</Text>
                      <Text className="w-32">{item[1]}</Text>
                      <Text className="w-32">{item[2]}</Text>
                      <Text className="w-24">{item[3]}</Text>
                    </View>
                  )}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                />
              </View>
            </ScrollView>
          </View>

          <View className="flex-row justify-end mt-auto">
            <Button
              onPress={() => setStep("upload")}
              variant="outline"
              className="mr-3"
            >
              Back
            </Button>
            <Button
              onPress={() => setStep("mapping")}
              className="bg-indigo-600"
            >
              Continue
            </Button>
          </View>
        </View>
      )}

      {step === "mapping" && (
        <View className="flex-1">
          <Text className="text-lg font-bold mb-2">Map Fields</Text>
          <Text className="text-sm text-gray-500 mb-4">
            Match your CSV columns to contact fields
          </Text>

          <View className="mb-4">
            <Text className="font-medium mb-2">Name Field</Text>
            <View className="border border-gray-200 rounded-lg p-3">
              <TouchableOpacity
                onPress={() =>
                  setMappedFields({ ...mappedFields, name: "Column 1" })
                }
                className={`p-2 rounded-md mb-2 ${mappedFields.name === "Column 1" ? "bg-indigo-100 border border-indigo-300" : "bg-gray-50"}`}
              >
                <Text
                  className={`${mappedFields.name === "Column 1" ? "text-indigo-700" : "text-gray-700"}`}
                >
                  Column 1 (Name)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setMappedFields({ ...mappedFields, name: "Column 3" })
                }
                className={`p-2 rounded-md ${mappedFields.name === "Column 3" ? "bg-indigo-100 border border-indigo-300" : "bg-gray-50"}`}
              >
                <Text
                  className={`${mappedFields.name === "Column 3" ? "text-indigo-700" : "text-gray-700"}`}
                >
                  Column 3 (Email)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">Phone Number Field</Text>
            <View className="border border-gray-200 rounded-lg p-3">
              <TouchableOpacity
                onPress={() =>
                  setMappedFields({ ...mappedFields, phone: "Column 2" })
                }
                className={`p-2 rounded-md ${mappedFields.phone === "Column 2" ? "bg-indigo-100 border border-indigo-300" : "bg-gray-50"}`}
              >
                <Text
                  className={`${mappedFields.phone === "Column 2" ? "text-indigo-700" : "text-gray-700"}`}
                >
                  Column 2 (Phone)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-end mt-auto">
            <Button
              onPress={() => setStep("preview")}
              variant="outline"
              className="mr-3"
            >
              Back
            </Button>
            <Button
              onPress={() => {
                // Create contacts from mapped fields
                const newContacts = previewData.map((row) => ({
                  name: row[0],
                  phone: row[1],
                  valid: true,
                }));
                setContacts(newContacts);
                setStep("validation");
              }}
              className="bg-indigo-600"
              disabled={!mappedFields.name || !mappedFields.phone}
            >
              Continue
            </Button>
          </View>
        </View>
      )}

      {step === "validation" && (
        <View className="flex-1">
          <Text className="text-lg font-bold mb-2">Validate Contacts</Text>
          <Text className="text-sm text-gray-500 mb-4">
            Review and fix any issues with your contacts
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Check size={16} color="#10B981" />
              <Text className="ml-1 text-green-600">
                {contacts.filter((c) => c.valid).length} Valid
              </Text>
            </View>
            <View className="flex-row items-center ml-4">
              <AlertCircle size={16} color="#EF4444" />
              <Text className="ml-1 text-red-500">
                {contacts.filter((c) => !c.valid).length} Invalid
              </Text>
            </View>
          </View>

          <FlatList
            data={contacts}
            renderItem={({ item, index }) => (
              <View className="border border-gray-200 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-bold">{item.name}</Text>
                  {item.valid ? (
                    <View className="bg-green-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-green-700">Valid</Text>
                    </View>
                  ) : (
                    <View className="bg-red-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-red-700">Invalid</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-500 w-20">Phone:</Text>
                  <TextInput
                    value={item.phone}
                    onChangeText={(text) => {
                      const updatedContacts = [...contacts];
                      updatedContacts[index] = {
                        ...item,
                        phone: text,
                        valid: text.length >= 10,
                      };
                      setContacts(updatedContacts);
                    }}
                    className="flex-1 p-1 border-b border-gray-300"
                  />
                </View>
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />

          <View className="flex-row justify-end mt-4">
            <Button
              onPress={() => setStep("mapping")}
              variant="outline"
              className="mr-3"
            >
              Back
            </Button>
            <Button
              onPress={() => setStep("complete")}
              className="bg-indigo-600"
              disabled={contacts.some((c) => !c.valid)}
            >
              Continue
            </Button>
          </View>
        </View>
      )}

      {step === "complete" && (
        <View className="flex-1 justify-center items-center">
          <View className="bg-gray-50 p-6 rounded-xl w-full max-w-md border border-gray-200">
            <View className="items-center mb-6">
              <View className="bg-green-100 p-3 rounded-full">
                <Check size={32} color="#10B981" />
              </View>
              <Text className="text-xl font-bold mt-4 text-gray-800">
                Import Complete
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-2">
                {contacts.length} contacts have been successfully imported
              </Text>
            </View>

            <View className="mb-4">
              <Text className="font-medium mb-2">Create Contact Group</Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                className="border border-gray-300 rounded-lg p-3"
              />
            </View>

            <Button
              onPress={() => {
                // Here you would save the contacts and group
                // Then navigate back to contacts screen
                console.log("Contacts saved:", contacts);
                console.log("Group created:", groupName);
              }}
              className="mb-3 bg-indigo-600"
              icon={<Users size={18} color="white" />}
              disabled={!groupName}
            >
              Save as Group
            </Button>

            <Button
              onPress={() => {
                // Here you would save just the contacts
                // Then navigate back to contacts screen
                console.log("Contacts saved:", contacts);
              }}
              variant="outline"
              className="border-indigo-600"
            >
              Save Contacts Only
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
