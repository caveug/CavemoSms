import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import Papa from "papaparse";
import XLSX from "xlsx";

// Define the base directory for storing app data
const APP_DIRECTORY = FileSystem.documentDirectory + "sms_campaign_manager/";
const CONTACTS_DIRECTORY = APP_DIRECTORY + "contacts/";
const CAMPAIGNS_DIRECTORY = APP_DIRECTORY + "campaigns/";
const TEMPLATES_DIRECTORY = APP_DIRECTORY + "templates/";

// Ensure directories exist
export const ensureDirectoriesExist = async () => {
  try {
    const appDirInfo = await FileSystem.getInfoAsync(APP_DIRECTORY);
    if (!appDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(APP_DIRECTORY, {
        intermediates: true,
      });
    }

    const contactsDirInfo = await FileSystem.getInfoAsync(CONTACTS_DIRECTORY);
    if (!contactsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CONTACTS_DIRECTORY, {
        intermediates: true,
      });
    }

    const campaignsDirInfo = await FileSystem.getInfoAsync(CAMPAIGNS_DIRECTORY);
    if (!campaignsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CAMPAIGNS_DIRECTORY, {
        intermediates: true,
      });
    }

    const templatesDirInfo = await FileSystem.getInfoAsync(TEMPLATES_DIRECTORY);
    if (!templatesDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(TEMPLATES_DIRECTORY, {
        intermediates: true,
      });
    }

    return true;
  } catch (error) {
    console.error("Error ensuring directories exist:", error);
    return false;
  }
};

// Pick a document (CSV or Excel)
export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/csv",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error("Error picking document:", error);
    return null;
  }
};

// Parse CSV file
export const parseCSVFile = async (uri: string) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(uri);
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error parsing CSV file:", error);
    throw error;
  }
};

// Parse Excel file
export const parseExcelFile = async (uri: string) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const workbook = XLSX.read(fileContent, { type: "base64" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw error;
  }
};

// Save contacts to file
export const saveContacts = async (contacts: any[], groupName: string) => {
  try {
    await ensureDirectoriesExist();
    const fileName = `${groupName.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.json`;
    const filePath = CONTACTS_DIRECTORY + fileName;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(contacts));
    return filePath;
  } catch (error) {
    console.error("Error saving contacts:", error);
    throw error;
  }
};

// Get all contact groups
export const getContactGroups = async () => {
  try {
    await ensureDirectoriesExist();
    const files = await FileSystem.readDirectoryAsync(CONTACTS_DIRECTORY);
    return files.filter((file) => file.endsWith(".json"));
  } catch (error) {
    console.error("Error getting contact groups:", error);
    return [];
  }
};

// Get contacts from a group
export const getContactsFromGroup = async (groupFileName: string) => {
  try {
    const filePath = CONTACTS_DIRECTORY + groupFileName;
    const fileContent = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error getting contacts from group:", error);
    return [];
  }
};

// Save campaign
export const saveCampaign = async (campaign: any) => {
  try {
    await ensureDirectoriesExist();
    const fileName = `campaign_${Date.now()}.json`;
    const filePath = CAMPAIGNS_DIRECTORY + fileName;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(campaign));
    return filePath;
  } catch (error) {
    console.error("Error saving campaign:", error);
    throw error;
  }
};

// Get all campaigns
export const getCampaigns = async () => {
  try {
    await ensureDirectoriesExist();
    const files = await FileSystem.readDirectoryAsync(CAMPAIGNS_DIRECTORY);
    const campaigns = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = CAMPAIGNS_DIRECTORY + file;
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        campaigns.push(JSON.parse(fileContent));
      }
    }

    return campaigns;
  } catch (error) {
    console.error("Error getting campaigns:", error);
    return [];
  }
};

// Export contacts to CSV
export const exportContactsToCSV = async (
  contacts: any[],
  fileName: string,
) => {
  try {
    const csv = Papa.unparse(contacts);
    const filePath = FileSystem.documentDirectory + fileName + ".csv";
    await FileSystem.writeAsStringAsync(filePath, csv);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
    }

    return true;
  } catch (error) {
    console.error("Error exporting contacts to CSV:", error);
    return false;
  }
};
