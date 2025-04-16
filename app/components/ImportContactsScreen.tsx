import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "./ui/Button";
import {
  Upload,
  Check,
  X,
  AlertCircle,
  FileText,
  UserPlus,
  Users,
  ArrowLeft,
} from "lucide-react-native";
import * as FileStorage from "../utils/fileStorage";
import * as Contacts from "expo-contacts";

type Contact = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  category?: string;
  valid: boolean;
};

export default function ImportContactsScreen() {
  const router = useRouter();
  const [step, setStep] = useState<
    "upload" | "preview" | "mapping" | "validation" | "complete"
  >("upload");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [mappedFields, setMappedFields] = useState<{
    name: string;
    phone: string;
    email?: string;
    category?: string;
  }>({ name: "", phone: "" });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [fileType, setFileType] = useState<"csv" | "excel" | "device">("csv");

  // Handle file selection
  const handleFileSelect = async () => {
    try {
      setLoading(true);
      const document = await FileStorage.pickDocument();

      if (!document) {
        setLoading(false);
        return;
      }

      setFileName(document.name);

      // Determine file type
      const fileExtension = document.name.split(".").pop()?.toLowerCase();
      let parsedData;

      if (fileExtension === "csv") {
        setFileType("csv");
        parsedData = await FileStorage.parseCSVFile(document.uri);
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        setFileType("excel");
        parsedData = await FileStorage.parseExcelFile(document.uri);
      } else {
        Alert.alert("Unsupported File", "Please select a CSV or Excel file.");
        setLoading(false);
        return;
      }

      console.log("Parsed data:", parsedData);

      if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
        // Filter out empty objects or rows
        const filteredData = parsedData.filter((row) => {
          // Check if row is an object with at least one non-empty property
          return (
            typeof row === "object" &&
            row !== null &&
            Object.keys(row).length > 0 &&
            Object.values(row).some(
              (val) => val !== undefined && val !== null && val !== "",
            )
          );
        });

        if (filteredData.length === 0) {
          Alert.alert(
            "Empty File",
            "The selected file contains no valid data.",
          );
          setLoading(false);
          return;
        }

        setPreviewData(filteredData);

        // Extract column headers
        const columns = Object.keys(filteredData[0]);
        setFileColumns(columns);

        // Try to auto-map fields
        const nameField = columns.find(
          (col) =>
            col.toLowerCase().includes("name") ||
            col.toLowerCase().includes("contact"),
        );

        const phoneField = columns.find(
          (col) =>
            col.toLowerCase().includes("phone") ||
            col.toLowerCase().includes("mobile") ||
            col.toLowerCase().includes("cell"),
        );

        const emailField = columns.find((col) =>
          col.toLowerCase().includes("email"),
        );

        const categoryField = columns.find(
          (col) =>
            col.toLowerCase().includes("category") ||
            col.toLowerCase().includes("group") ||
            col.toLowerCase().includes("type"),
        );

        setMappedFields({
          name: nameField || "",
          phone: phoneField || "",
          email: emailField,
          category: categoryField,
        });

        setFileSelected(true);
        setStep("preview");
      } else {
        Alert.alert(
          "Empty File",
          "The selected file contains no data or is in an invalid format.",
        );
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      Alert.alert("Error", "Failed to read the file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle device contacts import
  const handleDeviceContactsImport = async () => {
    try {
      setLoading(true);
      setFileType("device");

      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant contacts permission to import contacts.",
        );
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });

      if (data.length > 0) {
        // Transform contacts to our format
        const formattedContacts = data
          .filter(
            (contact) =>
              contact.name &&
              contact.phoneNumbers &&
              contact.phoneNumbers.length > 0,
          )
          .map((contact) => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phoneNumbers ? contact.phoneNumbers[0].number : "",
            email:
              contact.emails && contact.emails.length > 0
                ? contact.emails[0].email
                : "",
          }));

        setPreviewData(formattedContacts);
        setFileName(`Device Contacts (${formattedContacts.length})`);
        setFileSelected(true);

        // For device contacts, we already know the mapping
        setMappedFields({
          name: "name",
          phone: "phone",
          email: "email",
        });

        // Skip to validation step
        const validatedContacts = formattedContacts.map((contact) => ({
          ...contact,
          valid:
            contact.phone && contact.phone.replace(/[^0-9]/g, "").length >= 10,
        }));

        setContacts(validatedContacts);
        setStep("validation");
      } else {
        Alert.alert("No Contacts", "No contacts found on your device.");
      }
    } catch (error) {
      console.error("Error importing device contacts:", error);
      Alert.alert("Error", "Failed to import contacts from your device.");
    } finally {
      setLoading(false);
    }
  };

  // Process contacts after mapping
  const processContacts = () => {
    if (!mappedFields.name || !mappedFields.phone) {
      Alert.alert("Missing Fields", "Please map both name and phone fields.");
      return;
    }

    try {
      const processedContacts = previewData.map((row) => {
        const contact: Contact = {
          name: row[mappedFields.name] || "",
          phone: row[mappedFields.phone] || "",
          valid: false,
        };

        if (mappedFields.email) {
          contact.email = row[mappedFields.email];
        }

        if (mappedFields.category) {
          contact.category = row[mappedFields.category];
        }

        // Validate phone number (simple validation)
        const cleanPhone = contact.phone.replace(/[^0-9]/g, "");
        contact.valid = cleanPhone.length >= 10;

        return contact;
      });

      setContacts(processedContacts);
      setStep("validation");
    } catch (error) {
      console.error("Error processing contacts:", error);
      Alert.alert(
        "Error",
        "Failed to process contacts. Please check your mapping.",
      );
    }
  };

  // Save contacts
  const saveContacts = async (asGroup: boolean) => {
    if (asGroup && !groupName) {
      Alert.alert(
        "Missing Group Name",
        "Please enter a name for this contact group.",
      );
      return;
    }

    try {
      setLoading(true);

      // Filter out invalid contacts
      const validContacts = contacts.filter((contact) => contact.valid);

      if (validContacts.length === 0) {
        Alert.alert(
          "No Valid Contacts",
          "There are no valid contacts to save.",
        );
        setLoading(false);
        return;
      }

      // Save contacts to file storage
      const savedPath = await FileStorage.saveContacts(
        validContacts,
        asGroup ? groupName : "Imported_Contacts",
      );

      setLoading(false);

      Alert.alert(
        "Import Successful",
        `Successfully imported ${validContacts.length} contacts${asGroup ? ` to group "${groupName}"` : ""}.`,
        [
          {
            text: "OK",
            onPress: () => router.push("/components/ContactListScreen"),
          },
        ],
      );
    } catch (error) {
      console.error("Error saving contacts:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to save contacts. Please try again.");
    }
  };

  // Render column mapping options
  const renderColumnOptions = (field: string) => {
    return fileColumns.map((column, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setMappedFields({ ...mappedFields, [field]: column })}
        className={`p-2 rounded-md mb-2 ${mappedFields[field] === column ? "bg-indigo-100 border border-indigo-300" : "bg-gray-50"}`}
      >
        <Text
          className={`${mappedFields[field] === column ? "text-indigo-700" : "text-gray-700"}`}
        >
          {column}
        </Text>
      </TouchableOpacity>
    ));
  };

  // Loading overlay
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-600">Processing...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header with back button */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Import Contacts</Text>
      </View>

      {step === "upload" && (
        <View className="flex-1 justify-center items-center">
          <View className="bg-gray-50 p-6 rounded-xl w-full max-w-md border border-gray-200">
            <View className="items-center mb-6">
              <Upload size={48} color="#6366F1" />
              <Text className="text-xl font-bold mt-4 text-gray-800">
                Import Contacts
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-2">
                Upload a CSV/Excel file with your contacts or import from your
                device
              </Text>
            </View>

            <Button
              onPress={handleFileSelect}
              className="mb-3 bg-indigo-600"
              icon={<FileText size={18} color="white" />}
            >
              Select CSV/Excel File
            </Button>

            <Button
              onPress={handleDeviceContactsImport}
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
                  {fileColumns.map((column, index) => (
                    <Text key={index} className="font-medium w-32">
                      {column}
                    </Text>
                  ))}
                </View>
                <FlatList
                  data={previewData.slice(0, 5)} // Show only first 5 rows for preview
                  renderItem={({ item }) => (
                    <View className="flex-row border-t border-gray-200 p-3">
                      {fileColumns.map((column, index) => (
                        <Text key={index} className="w-32">
                          {item[column]}
                        </Text>
                      ))}
                    </View>
                  )}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                />
                {previewData.length > 5 && (
                  <View className="p-3 border-t border-gray-200 bg-gray-50">
                    <Text className="text-gray-500 italic">
                      + {previewData.length - 5} more rows
                    </Text>
                  </View>
                )}
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
            Match your file columns to contact fields
          </Text>

          <View className="mb-4">
            <Text className="font-medium mb-2">
              Name Field <Text className="text-red-500">*</Text>
            </Text>
            <View className="border border-gray-200 rounded-lg p-3">
              {renderColumnOptions("name")}
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">
              Phone Number Field <Text className="text-red-500">*</Text>
            </Text>
            <View className="border border-gray-200 rounded-lg p-3">
              {renderColumnOptions("phone")}
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">Email Field (Optional)</Text>
            <View className="border border-gray-200 rounded-lg p-3">
              {renderColumnOptions("email")}
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">
              Category/Group Field (Optional)
            </Text>
            <View className="border border-gray-200 rounded-lg p-3">
              {renderColumnOptions("category")}
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
              onPress={processContacts}
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
                      const cleanPhone = text.replace(/[^0-9+\-\s()]/g, "");
                      updatedContacts[index] = {
                        ...item,
                        phone: cleanPhone,
                        valid: cleanPhone.replace(/[^0-9]/g, "").length >= 10,
                      };
                      setContacts(updatedContacts);
                    }}
                    className="flex-1 p-1 border-b border-gray-300"
                    keyboardType="phone-pad"
                  />
                </View>
                {item.email && (
                  <View className="flex-row items-center mb-1">
                    <Text className="text-gray-500 w-20">Email:</Text>
                    <Text className="flex-1 p-1">{item.email}</Text>
                  </View>
                )}
                {item.category && (
                  <View className="flex-row items-center mb-1">
                    <Text className="text-gray-500 w-20">Category:</Text>
                    <Text className="flex-1 p-1">{item.category}</Text>
                  </View>
                )}
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />

          <View className="flex-row justify-end mt-4">
            {fileType !== "device" && (
              <Button
                onPress={() => setStep("mapping")}
                variant="outline"
                className="mr-3"
              >
                Back
              </Button>
            )}
            <Button
              onPress={() => setStep("complete")}
              className="bg-indigo-600"
              disabled={contacts.filter((c) => c.valid).length === 0}
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
                {contacts.filter((c) => c.valid).length} contacts are ready to
                be saved
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
              onPress={() => saveContacts(true)}
              className="mb-3 bg-indigo-600"
              icon={<Users size={18} color="white" />}
              disabled={!groupName}
            >
              Save as Group
            </Button>

            <Button
              onPress={() => saveContacts(false)}
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
