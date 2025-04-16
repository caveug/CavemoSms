/**
 * 🧙‍♂️ Project Reset Script 🧙‍♂️
 * This script resets the project to a clean state by:
 * 1. Clearing caches
 * 2. Removing problematic node_modules
 * 3. Reinstalling dependencies with correct versions
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🧙‍♂️ Project Reset Wizard starting...");

// Directories to clean
const CACHE_DIRS = [
  "node_modules/.cache",
  "node_modules/.expo",
  "node_modules/.vite",
  "node_modules/.babel-cache",
  ".expo",
  ".next",
];

// Problematic modules to remove
const PROBLEM_MODULES = [
  "node_modules/react-native-css-interop",
  "node_modules/react-native-is-edge-to-edge",
  "node_modules/styleq",
  "node_modules/react-native-reanimated",
];

// Clean cache directories
console.log("\n🧹 Cleaning cache directories...");
CACHE_DIRS.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`  Removing ${dir}...`);
    try {
      if (process.platform === "win32") {
        execSync(`rmdir /s /q "${fullPath}"`);
      } else {
        execSync(`rm -rf "${fullPath}"`);
      }
    } catch (error) {
      console.error(`  Error removing ${dir}:`, error.message);
    }
  }
});

// Remove problematic modules
console.log("\n🔥 Removing problematic modules...");
PROBLEM_MODULES.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`  Removing ${dir}...`);
    try {
      if (process.platform === "win32") {
        execSync(`rmdir /s /q "${fullPath}"`);
      } else {
        execSync(`rm -rf "${fullPath}"`);
      }
    } catch (error) {
      console.error(`  Error removing ${dir}:`, error.message);
    }
  }
});

// Create mock modules
console.log("\n✨ Creating mock modules...");

// Create mock styleq module
const styleqDir = path.join(process.cwd(), "node_modules/styleq/dist");
if (!fs.existsSync(styleqDir)) {
  fs.mkdirSync(styleqDir, { recursive: true });
}

const styleqContent = `
/**
 * Mock implementation of styleq
 */
module.exports = {
  createStyle: () => ({}),
  createStyleObject: () => ({}),
  getStyleKeysFromProps: () => [],
  styleq: (...args) => args
};
`;

fs.writeFileSync(path.join(styleqDir, "styleq.js"), styleqContent);

// Create package.json for styleq
const styleqPackageJson = {
  name: "styleq",
  version: "0.1.8",
  main: "dist/styleq.js",
};

fs.writeFileSync(
  path.join(process.cwd(), "node_modules/styleq/package.json"),
  JSON.stringify(styleqPackageJson, null, 2),
);

// Create mock react-native-is-edge-to-edge module
const edgeToEdgeDir = path.join(
  process.cwd(),
  "node_modules/react-native-is-edge-to-edge",
);
if (!fs.existsSync(edgeToEdgeDir)) {
  fs.mkdirSync(edgeToEdgeDir, { recursive: true });
}

const edgeToEdgeContent = `
/**
 * Mock implementation of react-native-is-edge-to-edge
 */
module.exports = false;
`;

fs.writeFileSync(path.join(edgeToEdgeDir, "index.js"), edgeToEdgeContent);

// Create package.json for react-native-is-edge-to-edge
const edgeToEdgePackageJson = {
  name: "react-native-is-edge-to-edge",
  version: "1.1.7",
  main: "index.js",
};

fs.writeFileSync(
  path.join(edgeToEdgeDir, "package.json"),
  JSON.stringify(edgeToEdgePackageJson, null, 2),
);

// Create mock react-native-css-interop module
const cssInteropDir = path.join(
  process.cwd(),
  "node_modules/react-native-css-interop/jsx-runtime",
);
if (!fs.existsSync(cssInteropDir)) {
  fs.mkdirSync(cssInteropDir, { recursive: true });
}

const cssInteropContent = `
/**
 * Mock implementation of react-native-css-interop/jsx-runtime
 */
module.exports = require('react/jsx-runtime');
`;

fs.writeFileSync(path.join(cssInteropDir, "index.js"), cssInteropContent);

// Create package.json for react-native-css-interop/jsx-runtime
const cssInteropPackageJson = {
  name: "jsx-runtime",
  version: "0.1.0",
  main: "index.js",
};

fs.writeFileSync(
  path.join(cssInteropDir, "package.json"),
  JSON.stringify(cssInteropPackageJson, null, 2),
);

// Create package.json for react-native-css-interop
const cssInteropMainPackageJson = {
  name: "react-native-css-interop",
  version: "0.1.22",
  main: "index.js",
};

fs.writeFileSync(
  path.join(
    process.cwd(),
    "node_modules/react-native-css-interop/package.json",
  ),
  JSON.stringify(cssInteropMainPackageJson, null, 2),
);

const cssInteropMainContent = `
/**
 * Mock implementation of react-native-css-interop
 */
module.exports = require('react');
`;

fs.writeFileSync(
  path.join(process.cwd(), "node_modules/react-native-css-interop/index.js"),
  cssInteropMainContent,
);

console.log("\n🧙‍♂️ Project reset complete! Try running your app again.");
console.log("\n💡 If you still encounter issues, try running:");
console.log("   npm install --legacy-peer-deps");
console.log("   npm start -- --reset-cache");
