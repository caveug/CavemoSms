module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // Add expo-asset plugin for asset hashing
  plugins.push("expo-asset/tools/hashAssetFiles");

  // Only use tempo-devtools plugin when in Tempo environment
  if (process.env.EXPO_PUBLIC_TEMPO) {
    plugins.push(["tempo-devtools/dist/babel-plugin"]);
  }

  // Only include reanimated plugin for native platforms
  if (process.env.EXPO_PLATFORM !== "web") {
    plugins.push("react-native-reanimated/plugin");
  }

  // Handle NativeWind for non-web platforms
  if (process.env.EXPO_PLATFORM !== "web") {
    try {
      const nativewind = require("nativewind/babel");
      if (typeof nativewind === "function") {
        plugins.push(nativewind());
      } else if (nativewind && typeof nativewind.default === "function") {
        plugins.push(nativewind.default());
      }
    } catch (error) {
      console.warn("Error loading nativewind/babel:", error);
    }
  }

  // Transform problematic imports
  plugins.push([
    function () {
      return {
        name: "transform-problematic-imports",
        visitor: {
          ImportDeclaration(path) {
            if (
              path.node.source.value === "react-native-css-interop/jsx-runtime"
            ) {
              path.node.source.value = "react/jsx-runtime";
            }
          },
          CallExpression(path) {
            if (
              path.node.callee.name === "require" &&
              path.node.arguments.length === 1 &&
              path.node.arguments[0].type === "StringLiteral" &&
              path.node.arguments[0].value ===
                "react-native-css-interop/jsx-runtime"
            ) {
              path.node.arguments[0].value = "react/jsx-runtime";
            }
          },
        },
      };
    },
  ]);

  return {
    presets: [["babel-preset-expo", { jsxRuntime: "automatic" }]],
    plugins,
    env: {
      web: {
        compact: true,
        targets: ">1%, not dead, not ie 11, not op_mini all",
      },
    },
  };
};
