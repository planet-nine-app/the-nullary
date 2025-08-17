#!/usr/bin/env node

/**
 * Add User Persistence to Nullary Apps
 * 
 * This script automatically adds the user persistence system to existing
 * Nullary applications by updating their Cargo.toml and Rust backend files.
 */

const fs = require('fs');
const path = require('path');

// List of all Nullary apps
const NULLARY_APPS = [
  'rhapsold/rhapsold',
  'ninefy/ninefy', 
  'nexus/nexus',
  'screenary/screenary',
  'blogary/blogary',
  'eventary/eventary',
  'postary/postary',
  'viewaris/viewaris',
  'wikiary/wikiary',
  'lexary/lexary',
  'photary/photary',
  'stackchat/stackchat',
  'mybase/mybase'
];

// Required dependencies for user persistence
const REQUIRED_DEPENDENCIES = `
# User persistence dependencies
sessionless = "0.1.1"
hex = "0.4"
uuid = { version = "1.0", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
`;

// User persistence Rust functions to add
const RUST_FUNCTIONS = [
  'generate_sessionless_keys',
  'stronghold_init', 
  'stronghold_get_record',
  'stronghold_set_record',
  'stronghold_clear_vault',
  'read_user_data_file',
  'write_user_data_file',
  'clear_user_data'
];

/**
 * Main function to add user persistence to all apps
 */
async function main() {
  console.log('🔐 Adding user persistence to Nullary apps...');
  
  const nullaryRoot = path.resolve(__dirname, '../../');
  
  for (const appPath of NULLARY_APPS) {
    const fullAppPath = path.join(nullaryRoot, appPath);
    
    if (!fs.existsSync(fullAppPath)) {
      console.log(`⏭️  Skipping ${appPath} (directory not found)`);
      continue;
    }
    
    console.log(`\n🔧 Processing ${appPath}...`);
    
    try {
      await updateApp(fullAppPath, appPath);
      console.log(`✅ ${appPath} updated successfully`);
    } catch (error) {
      console.error(`❌ Failed to update ${appPath}:`, error.message);
    }
  }
  
  console.log('\n🎉 User persistence integration complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the updated files in each app');
  console.log('2. Test the user persistence functionality');
  console.log('3. Update frontend code to use the new user persistence system');
  console.log('4. Consider implementing Tauri Stronghold for production security');
}

/**
 * Update a single app with user persistence
 */
async function updateApp(appPath, appName) {
  const cargoTomlPath = path.join(appPath, 'src-tauri', 'Cargo.toml');
  const libRsPath = path.join(appPath, 'src-tauri', 'src', 'lib.rs');
  const mainRsPath = path.join(appPath, 'src-tauri', 'src', 'main.rs');
  
  // Step 1: Update Cargo.toml
  if (fs.existsSync(cargoTomlPath)) {
    await updateCargoToml(cargoTomlPath);
  } else {
    console.warn(`⚠️  Cargo.toml not found at ${cargoTomlPath}`);
  }
  
  // Step 2: Update Rust backend (lib.rs or main.rs)
  if (fs.existsSync(libRsPath)) {
    await updateRustBackend(libRsPath, appName);
  } else if (fs.existsSync(mainRsPath)) {
    await updateRustBackend(mainRsPath, appName);
  } else {
    console.warn(`⚠️  No Rust backend file found for ${appName}`);
  }
  
  // Step 3: Copy user persistence Rust module
  await copyUserPersistenceModule(path.join(appPath, 'src-tauri', 'src'));
}

/**
 * Update Cargo.toml with required dependencies
 */
async function updateCargoToml(cargoTomlPath) {
  console.log('📦 Updating Cargo.toml dependencies...');
  
  let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
  
  // Check if dependencies already exist
  if (cargoContent.includes('sessionless =') && cargoContent.includes('hex =')) {
    console.log('   Dependencies already present');
    return;
  }
  
  // Add dependencies to the [dependencies] section
  if (cargoContent.includes('[dependencies]')) {
    // Find the [dependencies] section and add our dependencies
    const dependenciesIndex = cargoContent.indexOf('[dependencies]');
    const nextSectionIndex = cargoContent.indexOf('\n[', dependenciesIndex + 1);
    
    let insertionPoint;
    if (nextSectionIndex === -1) {
      // No next section, add at end
      insertionPoint = cargoContent.length;
    } else {
      // Insert before next section
      insertionPoint = nextSectionIndex;
    }
    
    cargoContent = cargoContent.slice(0, insertionPoint) + 
                   REQUIRED_DEPENDENCIES + 
                   cargoContent.slice(insertionPoint);
  } else {
    // No [dependencies] section, add it
    cargoContent += '\n[dependencies]' + REQUIRED_DEPENDENCIES;
  }
  
  fs.writeFileSync(cargoTomlPath, cargoContent);
  console.log('   ✅ Dependencies added to Cargo.toml');
}

/**
 * Update Rust backend with user persistence functions
 */
async function updateRustBackend(rustFilePath, appName) {
  console.log('🦀 Updating Rust backend...');
  
  let rustContent = fs.readFileSync(rustFilePath, 'utf8');
  
  // Check if user persistence is already integrated
  if (rustContent.includes('mod user_persistence') || rustContent.includes('generate_sessionless_keys')) {
    console.log('   User persistence already integrated');
    return;
  }
  
  // Add user persistence module import
  const moduleImport = '\n// User Persistence Module\nmod user_persistence;\nuse user_persistence::*;\n';
  
  // Find a good place to add the import (after existing imports)
  const importIndex = rustContent.lastIndexOf('use ');
  if (importIndex !== -1) {
    const lineEnd = rustContent.indexOf('\n', importIndex);
    rustContent = rustContent.slice(0, lineEnd) + moduleImport + rustContent.slice(lineEnd);
  } else {
    // No imports found, add at the beginning
    rustContent = moduleImport + rustContent;
  }
  
  // Add functions to invoke_handler
  const handlerMatch = rustContent.match(/\.invoke_handler\(tauri::generate_handler!\[([\s\S]*?)\]\)/);
  if (handlerMatch) {
    const existingFunctions = handlerMatch[1];
    const userPersistenceFunctions = RUST_FUNCTIONS.map(fn => `            ${fn}`).join(',\n');
    
    // Add user persistence functions to the handler
    const updatedFunctions = existingFunctions.trim() + ',\n\n            // User Persistence Functions\n' + userPersistenceFunctions;
    
    rustContent = rustContent.replace(
      handlerMatch[0],
      `.invoke_handler(tauri::generate_handler![\n${updatedFunctions}\n        ])`
    );
  } else {
    console.warn('   ⚠️  Could not find invoke_handler to update');
  }
  
  fs.writeFileSync(rustFilePath, rustContent);
  console.log('   ✅ Rust backend updated');
}

/**
 * Copy user persistence Rust module to app
 */
async function copyUserPersistenceModule(srcPath) {
  console.log('📁 Copying user persistence module...');
  
  const sourceModulePath = path.resolve(__dirname, '../rust/user-persistence.rs');
  const targetModulePath = path.join(srcPath, 'user_persistence.rs');
  
  if (!fs.existsSync(sourceModulePath)) {
    throw new Error('Source user persistence module not found');
  }
  
  // Copy the module
  fs.copyFileSync(sourceModulePath, targetModulePath);
  console.log('   ✅ User persistence module copied');
}

/**
 * Utility function to check if a string contains any of the given patterns
 */
function containsAny(text, patterns) {
  return patterns.some(pattern => text.includes(pattern));
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('User Persistence Integration Script');
  console.log('');
  console.log('Usage:');
  console.log('  node add-user-persistence.js           # Add to all apps');
  console.log('  node add-user-persistence.js [app]     # Add to specific app');
  console.log('');
  console.log('Examples:');
  console.log('  node add-user-persistence.js');
  console.log('  node add-user-persistence.js rhapsold/rhapsold');
  console.log('  node add-user-persistence.js ninefy/ninefy');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Check if specific app was requested
const specificApp = process.argv[2];
if (specificApp) {
  if (NULLARY_APPS.includes(specificApp)) {
    // Run for specific app only
    const nullaryRoot = path.resolve(__dirname, '../../');
    const fullAppPath = path.join(nullaryRoot, specificApp);
    
    console.log(`🔐 Adding user persistence to ${specificApp}...`);
    updateApp(fullAppPath, specificApp)
      .then(() => {
        console.log(`✅ ${specificApp} updated successfully`);
      })
      .catch(error => {
        console.error(`❌ Failed to update ${specificApp}:`, error.message);
        process.exit(1);
      });
  } else {
    console.error(`❌ Unknown app: ${specificApp}`);
    console.log('\nAvailable apps:');
    NULLARY_APPS.forEach(app => console.log(`  - ${app}`));
    process.exit(1);
  }
} else {
  // Run for all apps
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}