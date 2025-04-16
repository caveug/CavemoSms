/**
 * 🧙‍♂️ MODULE ENCHANTMENTS 🧙‍♂️
 * This file contains runtime enchantments to fix module resolution issues.
 * It should be imported at the entry point of the application.
 */

import { initializeModuleWizard } from "./utils/ModuleWizard";

// Apply runtime module resolution fixes
export function applyModuleEnchantments() {
  // Use the new ModuleWizard system for more robust module resolution
  initializeModuleWizard();
}
