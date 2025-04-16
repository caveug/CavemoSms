/**
 * 🧙‍♂️ MODULE SORCERY 🧙‍♂️
 * A magical script that fixes module resolution issues by creating
 * runtime illusions and module enchantments.
 */

const fs = require("fs");
const path = require("path");

console.log("🔮 Beginning module sorcery ritual...");

// The problematic module we need to fix
const TARGET_MODULE = "react-native-css-interop/jsx-runtime";

// Create a magical incantation (runtime shim) that will be injected into the bundle
const createMagicalIncantation = () => {
  const shimDir = path.join(__dirname, "../node_modules/.module-sorcery");
  const shimFile = path.join(shimDir, "runtime-spell.js");

  if (!fs.existsSync(shimDir)) {
    fs.mkdirSync(shimDir, { recursive: true });
  }

  const spellCode = `/**
 * 🧙‍♂️ RUNTIME SPELL 🧙‍♂️
 * This magical spell intercepts module requests at runtime
 * and redirects them to working alternatives.
 */

// Store the original require function
const originalRequire = module.constructor.prototype.require;

// Create an enchanted require function
module.constructor.prototype.require = function(modulePath) {
  // Check if this is our target module
  if (modulePath === 'react-native-css-interop/jsx-runtime') {
    console.log('🔮 Intercepted request for ' + modulePath);
    // Redirect to React's jsx-runtime
    return originalRequire.call(this, 'react/jsx-runtime');
  }
  
  // For all other modules, use the original require
  return originalRequire.apply(this, arguments);
};

console.log('🧙‍♂️ Runtime spell has been cast!');
`;

  fs.writeFileSync(shimFile, spellCode);
  console.log(`✨ Magical incantation created at ${shimFile}`);
  return shimFile;
};

// Create illusions (symbolic links) for the problematic module
const createIllusions = () => {
  const targetDir = path.join(
    __dirname,
    "../node_modules/react-native-css-interop",
  );
  const jsxRuntimeDir = path.join(targetDir, "jsx-runtime");
  const reactJsxRuntimeDir = path.join(
    __dirname,
    "../node_modules/react/jsx-runtime",
  );

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Create jsx-runtime directory if it doesn't exist
  if (!fs.existsSync(jsxRuntimeDir)) {
    fs.mkdirSync(jsxRuntimeDir, { recursive: true });
  }

  // Create a package.json that points to our implementation
  const packageJson = {
    name: "jsx-runtime-illusion",
    version: "1.0.0",
    main: "./index.js",
  };

  fs.writeFileSync(
    path.join(jsxRuntimeDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  // Create the implementation file that re-exports React's jsx-runtime
  const implementationCode = `/**
 * 🧙‍♂️ MODULE ILLUSION 🧙‍♂️
 * This file creates the illusion of react-native-css-interop/jsx-runtime
 * by re-exporting React's jsx-runtime.
 */

module.exports = require('react/jsx-runtime');
`;

  fs.writeFileSync(path.join(jsxRuntimeDir, "index.js"), implementationCode);

  console.log("✨ Module illusions created successfully!");
};

// Cast a protection spell on Metro to handle the problematic module
const castProtectionSpell = () => {
  const metroConfigPath = path.join(__dirname, "../metro.config.js");
  let metroConfig = fs.readFileSync(metroConfigPath, "utf8");

  // Check if the protection spell is already in place
  if (metroConfig.includes("MODULE SORCERY")) {
    console.log("🔮 Protection spell already in place!");
    return;
  }

  // Add our magical resolver to the Metro config
  const spellCode = `
// 🧙‍♂️ MODULE SORCERY PROTECTION SPELL 🧙‍♂️
// This spell protects Metro from crashing when it encounters the problematic module
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Detect the problematic module
  if (moduleName === 'react-native-css-interop/jsx-runtime') {
    console.log('🔮 Metro protection spell activated for: ' + moduleName);
    // Redirect to React's jsx-runtime
    return context.resolveRequest(context, 'react/jsx-runtime', platform);
  }
  
  // For all other modules, use the original resolver if available
  if (typeof originalResolveRequest === 'function') {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  // Fallback to default context resolution
  return context.resolveRequest(context, moduleName, platform);
};
`;

  // Find the right place to insert our spell
  const insertPoint = metroConfig.indexOf(
    "// Increase Metro bundler memory limit",
  );
  if (insertPoint !== -1) {
    metroConfig =
      metroConfig.slice(0, insertPoint) +
      spellCode +
      metroConfig.slice(insertPoint);
    fs.writeFileSync(metroConfigPath, metroConfig);
    console.log("✨ Protection spell cast on Metro config!");
  } else {
    console.log(
      "❌ Could not find a suitable place to cast the protection spell!",
    );
  }
};

// Enchant Babel to transform imports at compile time
const enchantBabel = () => {
  const babelConfigPath = path.join(__dirname, "../babel.config.js");
  let babelConfig = fs.readFileSync(babelConfigPath, "utf8");

  // Check if the enchantment is already in place
  if (babelConfig.includes("MODULE SORCERY")) {
    console.log("🔮 Babel enchantment already in place!");
    return;
  }

  // Create a custom Babel plugin that transforms imports
  const pluginCode = `
  // 🧙‍♂️ MODULE SORCERY BABEL ENCHANTMENT 🧙‍♂️
  plugins.push([
    // Custom plugin to transform problematic imports
    function() {
      return {
        name: 'transform-problematic-imports',
        visitor: {
          ImportDeclaration(path) {
            // Check if this is our target module
            if (path.node.source.value === 'react-native-css-interop/jsx-runtime') {
              // Transform to use React's jsx-runtime instead
              path.node.source.value = 'react/jsx-runtime';
            }
          },
          CallExpression(path) {
            // Handle require() calls
            if (path.node.callee.name === 'require' && 
                path.node.arguments.length === 1 && 
                path.node.arguments[0].type === 'StringLiteral' && 
                path.node.arguments[0].value === 'react-native-css-interop/jsx-runtime') {
              // Transform to use React's jsx-runtime instead
              path.node.arguments[0].value = 'react/jsx-runtime';
            }
          }
        }
      };
    }
  ]);
`;

  // Find the right place to insert our enchantment
  const insertPoint = babelConfig.indexOf("return {");
  if (insertPoint !== -1) {
    // Find the line before 'return {' where plugins are defined
    const pluginsLine = babelConfig.lastIndexOf("const plugins", insertPoint);
    if (pluginsLine !== -1) {
      // Insert our plugin code right before the return statement
      babelConfig =
        babelConfig.slice(0, insertPoint) +
        pluginCode +
        babelConfig.slice(insertPoint);
      fs.writeFileSync(babelConfigPath, babelConfig);
      console.log("✨ Babel successfully enchanted!");
    } else {
      console.log("❌ Could not find plugins definition in Babel config!");
    }
  } else {
    console.log("❌ Could not find a suitable place to enchant Babel!");
  }
};

// Run all our magical functions
createIllusions();
castProtectionSpell();
enchantBabel();
const magicalIncantation = createMagicalIncantation();

console.log(
  "🧙‍♂️ Module sorcery ritual complete! Your app should now be protected from the dark forces of module resolution errors.",
);
