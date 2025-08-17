#!/usr/bin/env node

/**
 * Sync Simple Theme to All Nullary Apps
 * 
 * This script copies the simple theme files to all Nullary applications
 * and optionally updates their existing theme imports.
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

/**
 * Main function to sync themes to all apps
 */
async function main() {
  console.log('🎨 Syncing simple theme to all Nullary apps...');
  
  const nullaryRoot = path.resolve(__dirname, '../../');
  const sharedThemesDir = path.resolve(__dirname, '../themes');
  const sharedUtilsDir = path.resolve(__dirname, '../utils');
  
  for (const appPath of NULLARY_APPS) {
    const fullAppPath = path.join(nullaryRoot, appPath);
    
    if (!fs.existsSync(fullAppPath)) {
      console.log(`⏭️  Skipping ${appPath} (directory not found)`);
      continue;
    }
    
    console.log(`\n🔧 Processing ${appPath}...`);
    
    try {
      await syncThemeToApp(fullAppPath, appPath, sharedThemesDir, sharedUtilsDir);
      console.log(`✅ ${appPath} theme synced successfully`);
    } catch (error) {
      console.error(`❌ Failed to sync theme to ${appPath}:`, error.message);
    }
  }
  
  console.log('\n🎉 Simple theme sync complete!');
  console.log('\n📝 Usage in your apps:');
  console.log('');
  console.log('// Import the simple theme');
  console.log('import { setupAppTheme, color, gradient } from \'./shared/simple-theme-integration.js\';');
  console.log('');
  console.log('// Initialize theme');
  console.log('setupAppTheme(\'blog\'); // or \'marketplace\', \'social\', etc.');
  console.log('');
  console.log('// Use colors');
  console.log('element.style.backgroundColor = color(\'primary\'); // Purple');
  console.log('element.style.background = gradient(\'primarySecondary\'); // Purple to green');
}

/**
 * Sync theme files to a single app
 */
async function syncThemeToApp(appPath, appName, sharedThemesDir, sharedUtilsDir) {
  const appSrcPath = path.join(appPath, 'src');
  const appSharedPath = path.join(appSrcPath, 'shared');
  
  // Create shared directory in app if it doesn't exist
  if (!fs.existsSync(appSharedPath)) {
    fs.mkdirSync(appSharedPath, { recursive: true });
    console.log(`   📁 Created shared directory`);
  }
  
  // Copy simple theme files
  const simpleThemePath = path.join(sharedThemesDir, 'simple-theme.js');
  const simpleThemeIntegrationPath = path.join(sharedUtilsDir, 'simple-theme-integration.js');
  
  if (fs.existsSync(simpleThemePath)) {
    fs.copyFileSync(simpleThemePath, path.join(appSharedPath, 'simple-theme.js'));
    console.log(`   📄 Copied simple-theme.js`);
  }
  
  if (fs.existsSync(simpleThemeIntegrationPath)) {
    fs.copyFileSync(simpleThemeIntegrationPath, path.join(appSharedPath, 'simple-theme-integration.js'));
    console.log(`   📄 Copied simple-theme-integration.js`);
  }
  
  // Update imports in main files if they exist
  await updateThemeImports(appSrcPath, appName);
}

/**
 * Update theme imports in app files
 */
async function updateThemeImports(appSrcPath, appName) {
  const mainFiles = [
    'main.js',
    'main-no-modules.js',
    'index.js',
    'app.js'
  ];
  
  for (const mainFile of mainFiles) {
    const mainFilePath = path.join(appSrcPath, mainFile);
    
    if (fs.existsSync(mainFilePath)) {
      try {
        let content = fs.readFileSync(mainFilePath, 'utf8');
        
        // Check if it already has simple theme import
        if (content.includes('simple-theme-integration')) {
          console.log(`   ⏭️  ${mainFile} already has simple theme import`);
          continue;
        }
        
        // Add import at the top (after existing imports)
        const importStatement = "import { setupAppTheme, color, gradient } from './shared/simple-theme-integration.js';\n";
        
        // Find a good place to add the import
        const importIndex = content.lastIndexOf('import ');
        if (importIndex !== -1) {
          const lineEnd = content.indexOf('\n', importIndex);
          content = content.slice(0, lineEnd + 1) + importStatement + content.slice(lineEnd + 1);
        } else {
          // No imports found, add at the beginning
          content = importStatement + '\n' + content;
        }
        
        // Add theme initialization comment
        const initComment = '\n// Initialize Planet Nine theme\n// setupAppTheme(); // Uncomment to enable simple theme\n';
        content += initComment;
        
        fs.writeFileSync(mainFilePath, content);
        console.log(`   ✏️  Updated ${mainFile} with theme import`);
        
        break; // Only update the first main file found
        
      } catch (error) {
        console.warn(`   ⚠️  Could not update ${mainFile}:`, error.message);
      }
    }
  }
}

/**
 * Create example usage file
 */
function createExampleUsage() {
  const exampleContent = `// Planet Nine Simple Theme Usage Examples

// 1. Initialize theme in your app
import { setupAppTheme, color, gradient } from './shared/simple-theme-integration.js';

// Setup theme for your app type
setupAppTheme('blog');        // For Rhapsold
setupAppTheme('marketplace'); // For Ninefy  
setupAppTheme('social');      // For Screenary
setupAppTheme('default');     // For other apps

// 2. Use colors in your code
element.style.backgroundColor = color('primary');    // Purple
element.style.color = color('secondary');           // Green
element.style.borderColor = color('tertiary');      // Pink
element.style.backgroundColor = color('quaternary'); // Yellow

// Cancel and inactive states
cancelButton.style.backgroundColor = color('cancel');   // Red
disabledButton.style.backgroundColor = color('inactive'); // Gray

// 3. Use gradients
element.style.background = gradient('primarySecondary');  // Purple to green
element.style.background = gradient('rainbow');          // All colors
element.style.background = gradient('sunset');           // Pink to yellow

// 4. Create themed components
import { createThemedButton, createThemedCard, createThemedInput } from './shared/simple-theme-integration.js';

const primaryButton = createThemedButton('Save', 'primary');
const cancelButton = createThemedButton('Cancel', 'cancel');
const card = createThemedCard();
const input = createThemedInput('Enter text...', 'text');

// 5. SVG theming
import { applySVGTheme } from './shared/simple-theme-integration.js';
applySVGTheme(svgElement, 'primary'); // Colors SVG with primary color

// That's it! Simple and easy to use.`;
  
  const examplePath = path.resolve(__dirname, '../SIMPLE-THEME-EXAMPLES.js');
  fs.writeFileSync(examplePath, exampleContent);
  console.log('📋 Created usage examples file');
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('Simple Theme Sync Script');
  console.log('');
  console.log('Usage:');
  console.log('  node sync-simple-theme.js              # Sync to all apps');
  console.log('  node sync-simple-theme.js [app]        # Sync to specific app');
  console.log('  node sync-simple-theme.js --examples   # Create usage examples');
  console.log('');
  console.log('Examples:');
  console.log('  node sync-simple-theme.js');
  console.log('  node sync-simple-theme.js rhapsold/rhapsold');
  console.log('  node sync-simple-theme.js --examples');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

if (process.argv.includes('--examples')) {
  createExampleUsage();
  process.exit(0);
}

// Check if specific app was requested
const specificApp = process.argv[2];
if (specificApp && !specificApp.startsWith('--')) {
  if (NULLARY_APPS.includes(specificApp)) {
    // Run for specific app only
    const nullaryRoot = path.resolve(__dirname, '../../');
    const fullAppPath = path.join(nullaryRoot, specificApp);
    const sharedThemesDir = path.resolve(__dirname, '../themes');
    const sharedUtilsDir = path.resolve(__dirname, '../utils');
    
    console.log(`🎨 Syncing simple theme to ${specificApp}...`);
    syncThemeToApp(fullAppPath, specificApp, sharedThemesDir, sharedUtilsDir)
      .then(() => {
        console.log(`✅ ${specificApp} theme synced successfully`);
      })
      .catch(error => {
        console.error(`❌ Failed to sync theme to ${specificApp}:`, error.message);
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