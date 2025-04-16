import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "SMS Campaign Manager",
  slug: "sms-campaign-manager",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#6366F1"
  },
  assetBundlePatterns: ["**/*"],
  plugins: ["expo-router"],
  assetPlugins: ["expo-asset/tools/hashAssetFiles"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.smscampaignmanager"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#6366F1"
    },
    package: "com.yourcompany.smscampaignmanager"
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
    output: "static",
    build: {
      babel: {
        include: [
          "@expo/vector-icons",
          "expo-router",
          "@react-navigation/native",
          "@react-navigation/bottom-tabs",
          "lucide-react-native"
        ]
      }
    },
    // Add web-specific optimizations
    optimization: {
      minimize: false,
      splitChunks: {
        chunks: 'all',
      },
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  extra: {
    isProduction: process.env.NODE_ENV === "production",
    disableAnimations: true
  }
});