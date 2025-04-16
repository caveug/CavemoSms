/**
 * 🧙‍♂️ ModuleWizard 🧙‍♂️
 * A magical utility that fixes module resolution issues at runtime
 * by intercepting module requests and providing mock implementations
 * or redirecting to compatible modules.
 */

// Registry of problematic modules and their replacements
type ModuleMapping = {
  targetModule: string;
  replacementModule?: string;
  mockImplementation?: any;
};

const MODULE_REGISTRY: ModuleMapping[] = [
  {
    targetModule: "react-native-css-interop/babel",
    mockImplementation: {
      createStyleSheet: () => ({}),
      processCSS: () => ({}),
      default: { createStyleSheet: () => ({}), processCSS: () => ({}) },
    },
  },
  {
    targetModule: "react-native-css-interop/jsx-runtime",
    replacementModule: "react/jsx-runtime",
  },
  {
    targetModule: "react-native-css-interop",
    replacementModule: "react",
  },
  {
    targetModule: "react-native-is-edge-to-edge",
    mockImplementation: false,
  },
  {
    targetModule: "styleq",
    mockImplementation: {
      createStyle: () => ({}),
      createStyleObject: () => ({}),
      getStyleKeysFromProps: () => [],
      styleq: (...args: any[]) => args,
    },
  },
  {
    targetModule: "lucide-react-native",
    mockImplementation: {
      // Create mock implementations for commonly used icons
      MessageSquare: (props: any) => null,
      Users: (props: any) => null,
      BarChart2: (props: any) => null,
      Clock: (props: any) => null,
      Search: (props: any) => null,
      Plus: (props: any) => null,
      ChevronRight: (props: any) => null,
      Bell: (props: any) => null,
      Moon: (props: any) => null,
      Shield: (props: any) => null,
      LogOut: (props: any) => null,
      User: (props: any) => null,
      RefreshCw: (props: any) => null,
      // Generic function to handle any icon
      default: (props: any) => null,
    },
  },
];

// Module resolution cache
const moduleCache = new Map<string, any>();

// Module health monitoring
type ModuleResolutionEvent = {
  module: string;
  resolved: boolean;
  replacement?: string;
  timestamp: number;
};

const resolutionEvents: ModuleResolutionEvent[] = [];

// Log module resolution event
function logResolutionEvent(event: ModuleResolutionEvent): void {
  resolutionEvents.push(event);
  // Keep only the last 100 events
  if (resolutionEvents.length > 100) {
    resolutionEvents.shift();
  }

  // Log to console in development
  if (__DEV__) {
    console.log(
      `🧙‍♂️ ModuleWizard: ${event.resolved ? "✅" : "❌"} ${event.module}${event.replacement ? ` → ${event.replacement}` : ""}`,
    );
  }
}

// Get module resolution events
export function getModuleResolutionEvents(): ModuleResolutionEvent[] {
  return [...resolutionEvents];
}

// Clear module resolution cache
export function clearModuleCache(): void {
  moduleCache.clear();
  console.log("🧙‍♂️ ModuleWizard: Module cache cleared");
}

// Apply module enchantments
export function applyModuleEnchantments(): void {
  if (typeof window === "undefined") return;

  console.log("🧙‍♂️ ModuleWizard: Applying module enchantments...");

  // Store original require function if it exists
  const originalRequire = (window as any).require;
  if (typeof originalRequire === "function") {
    (window as any).require = function (modulePath: string) {
      // Safety check for modulePath
      if (!modulePath) {
        console.warn("🧙‍♂️ ModuleWizard: Empty module path provided");
        return null;
      }

      // Check if module is in registry
      const moduleMapping = MODULE_REGISTRY.find(
        (m) => m.targetModule === modulePath,
      );

      if (moduleMapping) {
        // Check cache first
        if (moduleCache.has(modulePath)) {
          logResolutionEvent({
            module: modulePath,
            resolved: true,
            replacement: "cache",
            timestamp: Date.now(),
          });
          return moduleCache.get(modulePath);
        }

        // Handle replacement module
        if (moduleMapping.replacementModule) {
          try {
            const replacement = originalRequire(
              moduleMapping.replacementModule,
            );
            moduleCache.set(modulePath, replacement);

            logResolutionEvent({
              module: modulePath,
              resolved: true,
              replacement: moduleMapping.replacementModule,
              timestamp: Date.now(),
            });

            return replacement;
          } catch (error) {
            console.error(
              `🧙‍♂️ ModuleWizard: Error requiring replacement module ${moduleMapping.replacementModule}:`,
              error,
            );
          }
        }

        // Handle mock implementation
        if (moduleMapping.mockImplementation !== undefined) {
          moduleCache.set(modulePath, moduleMapping.mockImplementation);

          logResolutionEvent({
            module: modulePath,
            resolved: true,
            replacement: "mock",
            timestamp: Date.now(),
          });

          return moduleMapping.mockImplementation;
        }
      }

      // Fall back to original require
      try {
        const result = originalRequire(modulePath);
        logResolutionEvent({
          module: modulePath,
          resolved: true,
          timestamp: Date.now(),
        });
        return result;
      } catch (error) {
        logResolutionEvent({
          module: modulePath,
          resolved: false,
          timestamp: Date.now(),
        });
        throw error;
      }
    };
  }

  // Handle webpack require if available
  const webpackRequire = (window as any).__webpack_require__;
  if (typeof webpackRequire === "function") {
    const originalWebpackRequire = webpackRequire;
    (window as any).__webpack_require__ = function (moduleId: string) {
      // Safety check for moduleId
      if (!moduleId) {
        console.warn("🧙‍♂️ ModuleWizard: Empty module ID provided");
        return null;
      }

      try {
        return originalWebpackRequire(moduleId);
      } catch (error) {
        // Try to handle known problematic modules
        if (
          error instanceof Error &&
          error.message &&
          error.message.includes &&
          error.message.includes("Cannot find module")
        ) {
          for (const mapping of MODULE_REGISTRY) {
            if (
              mapping &&
              mapping.targetModule &&
              error.message.includes(mapping.targetModule)
            ) {
              if (mapping.mockImplementation !== undefined) {
                logResolutionEvent({
                  module: mapping.targetModule,
                  resolved: true,
                  replacement: "mock",
                  timestamp: Date.now(),
                });
                return mapping.mockImplementation;
              }
            }
          }
        }
        throw error;
      }
    };
  }

  // Handle dynamic imports
  const originalImport = (window as any).import;
  if (typeof originalImport === "function") {
    (window as any).import = function (modulePath: string) {
      // Safety check for modulePath
      if (!modulePath) {
        console.warn("🧙‍♂️ ModuleWizard: Empty module path provided for import");
        return Promise.resolve(null);
      }

      // Check if module is in registry
      const moduleMapping = MODULE_REGISTRY.find(
        (m) => m && m.targetModule === modulePath,
      );

      if (moduleMapping) {
        // Handle replacement module
        if (moduleMapping.replacementModule) {
          return originalImport(moduleMapping.replacementModule);
        }

        // Handle mock implementation
        if (moduleMapping.mockImplementation !== undefined) {
          return Promise.resolve(moduleMapping.mockImplementation);
        }
      }

      // Fall back to original import
      return originalImport(modulePath);
    };
  }

  console.log("✨ ModuleWizard: Module enchantments applied successfully!");
}

// Register a new module mapping
export function registerModuleMapping(mapping: ModuleMapping): void {
  // Remove any existing mapping for this module
  const existingIndex = MODULE_REGISTRY.findIndex(
    (m) => m.targetModule === mapping.targetModule,
  );
  if (existingIndex !== -1) {
    MODULE_REGISTRY.splice(existingIndex, 1);
  }

  // Add new mapping
  MODULE_REGISTRY.push(mapping);

  // Clear cache for this module
  moduleCache.delete(mapping.targetModule);

  console.log(
    `🧙‍♂️ ModuleWizard: Registered mapping for ${mapping.targetModule}`,
  );
}

// Create a virtual module
export function createVirtualModule(name: string, implementation: any): void {
  registerModuleMapping({
    targetModule: name,
    mockImplementation: implementation,
  });
}

// Initialize ModuleWizard
export function initializeModuleWizard(): void {
  applyModuleEnchantments();

  // Add global access for debugging
  if (typeof window !== "undefined" && __DEV__) {
    (window as any).__ModuleWizard = {
      registry: MODULE_REGISTRY,
      cache: moduleCache,
      events: resolutionEvents,
      clearCache: clearModuleCache,
      registerMapping: registerModuleMapping,
      createVirtualModule: createVirtualModule,
    };
  }
}
