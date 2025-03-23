import * as FileSystem from "expo-file-system";
import { ensureDirectoriesExist } from "./fileStorage";

// Define the settings directory
const APP_DIRECTORY = FileSystem.documentDirectory + "sms_campaign_manager/";
const SETTINGS_DIRECTORY = APP_DIRECTORY + "settings/";

// Types
export type AppSettings = {
  darkMode: boolean;
  notifications: boolean;
  deliveryReports: boolean;
  autoRetry: boolean;
  smsLimit: string;
  lastUpdated: string;
};

// Ensure settings directory exists
export const ensureSettingsDirectoryExists = async () => {
  try {
    await ensureDirectoriesExist();
    const settingsDirInfo = await FileSystem.getInfoAsync(SETTINGS_DIRECTORY);
    if (!settingsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SETTINGS_DIRECTORY, {
        intermediates: true,
      });
    }
    return true;
  } catch (error) {
    console.error("Error ensuring settings directory exists:", error);
    return false;
  }
};

// Get app settings
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    await ensureSettingsDirectoryExists();
    const filePath = SETTINGS_DIRECTORY + "app_settings.json";
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(fileContent);
    } else {
      // Return default settings if no file exists yet
      const defaultSettings = {
        darkMode: false,
        notifications: true,
        deliveryReports: true,
        autoRetry: true,
        smsLimit: "100",
        lastUpdated: new Date().toISOString(),
      };

      // Save default settings
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(defaultSettings),
      );
      return defaultSettings;
    }
  } catch (error) {
    console.error("Error getting app settings:", error);
    // Return default settings in case of error
    return {
      darkMode: false,
      notifications: true,
      deliveryReports: true,
      autoRetry: true,
      smsLimit: "100",
      lastUpdated: new Date().toISOString(),
    };
  }
};

// Update app settings
export const updateAppSettings = async (settings: Partial<AppSettings>) => {
  try {
    await ensureSettingsDirectoryExists();
    const filePath = SETTINGS_DIRECTORY + "app_settings.json";
    const currentSettings = await getAppSettings();

    const updatedSettings = {
      ...currentSettings,
      ...settings,
      lastUpdated: new Date().toISOString(),
    };

    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(updatedSettings),
    );
    return true;
  } catch (error) {
    console.error("Error updating app settings:", error);
    return false;
  }
};
