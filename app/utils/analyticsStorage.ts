import * as FileSystem from "expo-file-system";
import { ensureDirectoriesExist } from "./fileStorage";

// Define the analytics directory
const APP_DIRECTORY = FileSystem.documentDirectory + "sms_campaign_manager/";
const ANALYTICS_DIRECTORY = APP_DIRECTORY + "analytics/";

// Types
export type CampaignStat = {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  failed: number;
  responses: number;
  date: string;
};

export type AnalyticsData = {
  totalSent: number;
  delivered: number;
  failed: number;
  responses: number;
  deliveryRate: number;
  responseRate: number;
  campaigns: CampaignStat[];
  lastUpdated: string;
};

// Ensure analytics directory exists
export const ensureAnalyticsDirectoryExists = async () => {
  try {
    await ensureDirectoriesExist();
    const analyticsDirInfo = await FileSystem.getInfoAsync(ANALYTICS_DIRECTORY);
    if (!analyticsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(ANALYTICS_DIRECTORY, {
        intermediates: true,
      });
    }
    return true;
  } catch (error) {
    console.error("Error ensuring analytics directory exists:", error);
    return false;
  }
};

// Get analytics data
export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    await ensureAnalyticsDirectoryExists();
    const filePath = ANALYTICS_DIRECTORY + "analytics_data.json";
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(fileContent);
    } else {
      // Return default data if no file exists yet
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        responses: 0,
        deliveryRate: 0,
        responseRate: 0,
        campaigns: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Error getting analytics data:", error);
    // Return default data in case of error
    return {
      totalSent: 0,
      delivered: 0,
      failed: 0,
      responses: 0,
      deliveryRate: 0,
      responseRate: 0,
      campaigns: [],
      lastUpdated: new Date().toISOString(),
    };
  }
};

// Update analytics data
export const updateAnalyticsData = async (data: Partial<AnalyticsData>) => {
  try {
    await ensureAnalyticsDirectoryExists();
    const filePath = ANALYTICS_DIRECTORY + "analytics_data.json";
    const currentData = await getAnalyticsData();

    const updatedData = {
      ...currentData,
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error("Error updating analytics data:", error);
    return false;
  }
};

// Add campaign stats
export const addCampaignStats = async (campaign: CampaignStat) => {
  try {
    const analyticsData = await getAnalyticsData();

    // Check if campaign already exists
    const existingIndex = analyticsData.campaigns.findIndex(
      (c) => c.id === campaign.id,
    );

    if (existingIndex >= 0) {
      // Update existing campaign
      analyticsData.campaigns[existingIndex] = campaign;
    } else {
      // Add new campaign
      analyticsData.campaigns.push(campaign);
    }

    // Recalculate totals
    const totalSent = analyticsData.campaigns.reduce(
      (sum, c) => sum + c.sent,
      0,
    );
    const delivered = analyticsData.campaigns.reduce(
      (sum, c) => sum + c.delivered,
      0,
    );
    const failed = analyticsData.campaigns.reduce(
      (sum, c) => sum + c.failed,
      0,
    );
    const responses = analyticsData.campaigns.reduce(
      (sum, c) => sum + c.responses,
      0,
    );

    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const responseRate = delivered > 0 ? (responses / delivered) * 100 : 0;

    await updateAnalyticsData({
      totalSent,
      delivered,
      failed,
      responses,
      deliveryRate,
      responseRate,
      campaigns: analyticsData.campaigns,
    });

    return true;
  } catch (error) {
    console.error("Error adding campaign stats:", error);
    return false;
  }
};

// Export analytics data to CSV
export const exportAnalyticsData = async () => {
  try {
    const analyticsData = await getAnalyticsData();
    return analyticsData;
  } catch (error) {
    console.error("Error exporting analytics data:", error);
    return null;
  }
};
