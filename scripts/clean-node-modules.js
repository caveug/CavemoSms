const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Directories to clean
const PROBLEM_DIRS = [
  "node_modules/.cache",
  "node_modules/.expo",
  "node_modules/@react-native-async-storage",
  "node_modules/react-native-reanimated",
  "node_modules/.vite",
  "node_modules/.babel-cache",
];

// Clean specific directories
PROBLEM_DIRS.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${dir}...`);
    try {
      if (process.platform === "win32") {
        execSync(`rmdir /s /q "${fullPath}"`);
      } else {
        execSync(`rm -rf "${fullPath}"`);
      }
      console.log(`Successfully removed ${dir}`);
    } catch (error) {
      console.error(`Error removing ${dir}:`, error.message);
    }
  } else {
    console.log(`Directory ${dir} does not exist, skipping...`);
  }
});

// Reinstall specific packages with exact versions
const packagesToReinstall = [
  "@react-native-async-storage/async-storage@1.21.0",
  "react-native@0.72.6",
];

console.log("\nReinstalling packages...");
try {
  // Force remove package-lock.json
  if (fs.existsSync(path.join(process.cwd(), "package-lock.json"))) {
    fs.unlinkSync(path.join(process.cwd(), "package-lock.json"));
  }

  // Install packages with --legacy-peer-deps
  const installCommand = `npm install ${packagesToReinstall.join(" ")} --legacy-peer-deps`;
  console.log(`Running: ${installCommand}`);
  execSync(installCommand, { stdio: "inherit" });

  console.log("\nPackages reinstalled successfully!");
} catch (error) {
  console.error("\nError reinstalling packages:", error.message);
}

console.log("\nCleaning complete! Try running your app again.");
