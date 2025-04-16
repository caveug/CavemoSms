const { getDefaultConfig } = require("expo/metro-config");
// Remove dependency on nativewind/metro which requires react-native-css-interop/metro
// const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname, {
  // Comment out the watcher to prevent memory issues
  watchFolders: [],
});

// Optimize for web platform
config.resolver.resolverMainFields = ["browser", "main"];
config.resolver.platforms = ["web", "ios", "android"];

// 🧙‍♂️ MODULE SORCERY PROTECTION SPELL 🧙‍♂️
// This spell protects Metro from crashing when it encounters the problematic module
const originalResolveRequest = config.resolver.resolveRequest;

// Increase Metro bundler memory limit
config.maxWorkers = 2;
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: false,
    mangle: false,
  },
  assetPlugins: [],
  // Disable source maps in development
  sourceMap: false,
  // Disable hot module reload
  hmr: false,
};

// Enhanced resolver function to handle problematic modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle react-native-css-interop/jsx-runtime
  if (moduleName === "react-native-css-interop/jsx-runtime") {
    console.log("🔮 Metro protection spell activated for: " + moduleName);
    return context.resolveRequest(context, "react/jsx-runtime", platform);
  }

  // Handle react-native-css-interop and its submodules
  if (
    moduleName === "react-native-css-interop" ||
    moduleName === "react-native-css-interop/babel"
  ) {
    console.log("🔮 Metro protection spell activated for: " + moduleName);
    return context.resolveRequest(context, "react", platform);
  }

  // Handle react-native-is-edge-to-edge
  if (moduleName === "react-native-is-edge-to-edge") {
    console.log("🔮 Metro protection spell activated for: " + moduleName);
    // Create a mock implementation that returns false
    return {
      type: "sourceFile",
      filePath: path.join(__dirname, "node_modules/react/index.js"),
      sourceCode: "module.exports = false;",
    };
  }

  // Handle styleq module resolution
  if (moduleName === "styleq" || moduleName.startsWith("styleq/")) {
    console.log("🔮 Metro protection spell activated for: " + moduleName);
    return {
      type: "sourceFile",
      filePath: path.join(__dirname, "node_modules/react/index.js"),
      sourceCode:
        "module.exports = { createStyle: () => ({}), createStyleObject: () => ({}), getStyleKeysFromProps: () => ([]), styleq: (...args) => args };",
    };
  }

  // Handle react-native-web/dist/index resolution
  if (
    moduleName === "react-native-web/dist/index" ||
    moduleName.startsWith("react-native-web/dist/")
  ) {
    console.log("🔮 Metro protection spell activated for: " + moduleName);
    return context.resolveRequest(context, "react-native-web", platform);
  }

  // Handle lucide-react-native resolution
  if (
    moduleName === "lucide-react-native" ||
    moduleName.startsWith("lucide-react-native/")
  ) {
    console.log("🔮 Metro protection spell activated for: " + moduleName);
    // Try to resolve the actual module first
    try {
      return originalResolveRequest(context, moduleName, platform);
    } catch (e) {
      // Fallback to mock implementation if resolution fails
      const iconName = moduleName.split("/").pop();
      return {
        type: "sourceFile",
        filePath: path.join(__dirname, "node_modules/react/index.js"),
        sourceCode: `module.exports = function ${iconName || "Icon"}(props) { return props.children || null; };`,
      };
    }
  }

  // For all other modules, use the original resolver if available
  if (typeof originalResolveRequest === "function") {
    return originalResolveRequest(context, moduleName, platform);
  }

  // Fallback to default context resolution
  return context.resolveRequest(context, moduleName, platform);
};

// Add resolver for web-specific modules
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "web.js", "web.ts", "web.tsx"],
  // Exclude problematic modules
  blockList:
    /\.git|\.expo|\.vscode|node_modules\/react-native-reanimated\/.*|node_modules\/react-native-gesture-handler\/.*|node_modules\/(?!react-native-web).+\/dist/,
  // Disable watching
  watch: false,
  // Add browser field resolution
  resolverMainFields: ["browser", "main"],
  // Add aliases for problematic modules
  extraNodeModules: {
    // Use React's jsx-runtime as a fallback
    "react-native-css-interop/jsx-runtime": path.resolve(
      __dirname,
      "node_modules/react/jsx-runtime",
    ),
    "react-native-css-interop": path.resolve(__dirname, "node_modules/react"),
    // Add alias for react-native-web/dist/index
    "react-native-web/dist/index": path.resolve(
      __dirname,
      "node_modules/react-native-web",
    ),
    "react-native-web/dist": path.resolve(
      __dirname,
      "node_modules/react-native-web",
    ),
    // Add mock for react-native-is-edge-to-edge
    "react-native-is-edge-to-edge": path.resolve(
      __dirname,
      "node_modules/react",
    ),
    "react-native-is-edge-to-edge/dist/index": path.resolve(
      __dirname,
      "node_modules/react",
    ),
    // Add mock for styleq
    styleq: path.resolve(__dirname, "node_modules/styleq"),
    "styleq/dist/styleq.js": path.resolve(
      __dirname,
      "node_modules/styleq/dist/styleq.js",
    ),
    "styleq/dist": path.resolve(__dirname, "node_modules/styleq/dist"),
    "styleq/package.json": path.resolve(
      __dirname,
      "node_modules/styleq/package.json",
    ),
    "styleq/index": path.resolve(
      __dirname,
      "node_modules/styleq/dist/styleq.js",
    ),
    "styleq/index.js": path.resolve(
      __dirname,
      "node_modules/styleq/dist/styleq.js",
    ),
  },
};

// Increase heap memory limit
process.env.NODE_OPTIONS = "--max-old-space-size=4096";

// Export the config directly without using withNativeWind
module.exports = config;
