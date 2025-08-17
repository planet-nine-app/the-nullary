#!/usr/bin/env node

/**
 * Add Sync Status Integration to All Nullary Apps
 * 
 * This script adds the sync status system to all Nullary apps,
 * replacing confusing error messages with visual sync indicators.
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
  'mybase/mybase',
  'covenant/covenant',
  'idothis/idothis'
];

/**
 * Main function to add sync status integration to all apps
 */
async function main() {
  console.log('🔄 Adding sync status integration to all Nullary apps...');
  
  const nullaryRoot = path.resolve(__dirname, '../../');
  
  for (const appPath of NULLARY_APPS) {
    const fullAppPath = path.join(nullaryRoot, appPath);
    
    if (!fs.existsSync(fullAppPath)) {
      console.log(`⏭️  Skipping ${appPath} (directory not found)`);
      continue;
    }
    
    console.log(`\\n🔧 Processing ${appPath}...`);
    
    try {
      await addSyncStatusToApp(fullAppPath, appPath);
      console.log(`✅ ${appPath} sync status integration added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add sync status to ${appPath}:`, error.message);
    }
  }
  
  console.log('\\n🎉 Sync status integration complete!');
  console.log('\\n📝 Benefits:');
  console.log('✅ No more confusing error messages');
  console.log('✅ Visual sync status with color-coded banners');
  console.log('✅ Per-base reachability indicators');
  console.log('✅ Pull-to-refresh with sync tracking');
  console.log('✅ Last sync time display');
}

/**
 * Add sync status integration to a single app
 */
async function addSyncStatusToApp(appPath, appName) {
  const appSrcPath = path.join(appPath, 'src');
  
  if (!fs.existsSync(appSrcPath)) {
    console.log(`   ⏭️  No src directory found for ${appName}`);
    return;
  }
  
  // 1. Add import to main.js file
  await addSyncStatusImport(appSrcPath, appName);
  
  // 2. Add CSS for sync status indicators
  await addSyncStatusCSS(appSrcPath, appName);
  
  // 3. Update index.html if needed
  await updateIndexHTML(appSrcPath, appName);
  
  // 4. Create app-specific sync integration
  await createAppSyncIntegration(appSrcPath, appName);
}

/**
 * Add sync status import to main.js
 */
async function addSyncStatusImport(appSrcPath, appName) {
  const mainFiles = [
    'main.js',
    'main-no-modules.js',
    'index.js'
  ];
  
  for (const mainFile of mainFiles) {
    const mainFilePath = path.join(appSrcPath, mainFile);
    
    if (fs.existsSync(mainFilePath)) {
      try {
        let content = fs.readFileSync(mainFilePath, 'utf8');
        
        // Check if sync status is already integrated
        if (content.includes('sync-status') || content.includes('SyncStatusIntegration')) {
          console.log(`   ⏭️  ${mainFile} already has sync status integration`);
          continue;
        }
        
        // Add import statement
        const importStatement = content.includes('import')
          ? `import { setupSyncStatusIntegration } from '../shared/examples/sync-status-integration-example.js';\\n`
          : `// Sync Status Integration\\n// import { setupSyncStatusIntegration } from '../shared/examples/sync-status-integration-example.js';\\n`;
        
        // Find best place to add import
        const importIndex = content.lastIndexOf('import ');
        if (importIndex !== -1) {
          const lineEnd = content.indexOf('\\n', importIndex);
          content = content.slice(0, lineEnd + 1) + importStatement + content.slice(lineEnd + 1);
        } else {
          content = importStatement + '\\n' + content;
        }
        
        // Add initialization code
        const initCode = `
// Initialize sync status integration
async function initializeSyncStatus() {
  try {
    // Wait for base command to be available
    let retries = 0;
    while (!window.baseCommand && retries < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (window.baseCommand) {
      const syncIntegration = await setupSyncStatusIntegration();
      console.log('✅ Sync status integration initialized for ${appName}');
      window.syncIntegration = syncIntegration;
    } else {
      console.warn('⚠️ Base command not available - sync status integration skipped');
    }
  } catch (error) {
    console.warn('⚠️ Sync status integration failed:', error);
  }
}

// Initialize sync status when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSyncStatus);
} else {
  initializeSyncStatus();
}
`;
        
        content += initCode;
        
        fs.writeFileSync(mainFilePath, content);
        console.log(`   ✏️  Updated ${mainFile} with sync status integration`);
        
        break; // Only update the first main file found
        
      } catch (error) {
        console.warn(`   ⚠️  Could not update ${mainFile}:`, error.message);
      }
    }
  }
}

/**
 * Add CSS for sync status indicators
 */
async function addSyncStatusCSS(appSrcPath, appName) {
  const cssFiles = [
    'styles.css',
    'style.css',
    'main.css'
  ];
  
  const syncStatusCSS = `
/* Sync Status Integration Styles */
.sync-status-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  margin: 8px 0;
  transition: all 0.3s ease;
}

.base-element {
  transition: border-color 0.3s ease, border-width 0.3s ease;
}

.base-element.unreachable {
  border-color: #e74c3c !important;
  border-width: 2px !important;
}

.base-element.synced {
  border-color: #27ae60 !important;
  border-width: 2px !important;
}

.sync-status-label {
  font-size: 11px;
  margin-top: 4px;
  font-weight: 500;
}

#pull-to-refresh-indicator {
  text-align: center;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

/* Navigation sync indicators */
.nav-base-icon.sync-success::after {
  content: '✅';
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 8px;
}

.nav-base-icon.sync-partial::after {
  content: '⚠️';
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 8px;
}

.nav-base-icon.sync-failed::after {
  content: '❌';
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sync-status-banner {
    margin: 4px 0;
    font-size: 12px;
  }
  
  #pull-to-refresh-indicator {
    font-size: 12px;
  }
}
`;
  
  for (const cssFile of cssFiles) {
    const cssFilePath = path.join(appSrcPath, cssFile);
    
    if (fs.existsSync(cssFilePath)) {
      try {
        let content = fs.readFileSync(cssFilePath, 'utf8');
        
        // Check if sync status CSS is already added
        if (content.includes('sync-status-banner')) {
          console.log(`   ⏭️  ${cssFile} already has sync status styles`);
          continue;
        }
        
        // Add sync status CSS
        content += syncStatusCSS;
        
        fs.writeFileSync(cssFilePath, content);
        console.log(`   🎨 Added sync status styles to ${cssFile}`);
        
        break; // Only update the first CSS file found
        
      } catch (error) {
        console.warn(`   ⚠️  Could not update ${cssFile}:`, error.message);
      }
    }
  }
}

/**
 * Update index.html if needed
 */
async function updateIndexHTML(appSrcPath, appName) {
  const htmlFiles = [
    'index.html',
    'main.html'
  ];
  
  for (const htmlFile of htmlFiles) {
    const htmlFilePath = path.join(appSrcPath, htmlFile);
    
    if (fs.existsSync(htmlFilePath)) {
      try {
        let content = fs.readFileSync(htmlFilePath, 'utf8');
        
        // Check if sync banner container already exists
        if (content.includes('sync-banner-container')) {
          console.log(`   ⏭️  ${htmlFile} already has sync banner container`);
          continue;
        }
        
        // Add sync banner container after body tag
        const bodyMatch = content.match(/<body[^>]*>/);
        if (bodyMatch) {
          const bodyIndex = bodyMatch.index + bodyMatch[0].length;
          const syncBannerHTML = `
    <!-- Sync Status Banner Container -->
    <div id="sync-banner-container"></div>
`;
          content = content.slice(0, bodyIndex) + syncBannerHTML + content.slice(bodyIndex);
          
          fs.writeFileSync(htmlFilePath, content);
          console.log(`   📄 Added sync banner container to ${htmlFile}`);
        }
        
        break; // Only update the first HTML file found
        
      } catch (error) {
        console.warn(`   ⚠️  Could not update ${htmlFile}:`, error.message);
      }
    }
  }
}

/**
 * Create app-specific sync integration file
 */
async function createAppSyncIntegration(appSrcPath, appName) {
  const integrationPath = path.join(appSrcPath, 'sync-integration.js');
  
  if (fs.existsSync(integrationPath)) {
    console.log(`   ⏭️  sync-integration.js already exists`);
    return;
  }
  
  const appSpecificIntegration = `/**
 * ${appName} Sync Status Integration
 * 
 * App-specific sync status configuration and handlers.
 * Generated automatically by add-sync-status-integration.js
 */

import { syncStatusManager, SYNC_STATUS } from '../shared/utils/sync-status.js';
import { enhanceBaseCommandWithSyncTracking } from '../shared/utils/base-command-sync-integration.js';

/**
 * ${appName}-specific sync configuration
 */
const SYNC_CONFIG = {
  // Pull-to-refresh settings
  pullToRefresh: {
    enabled: true,
    threshold: 80,
    maxDistance: 120
  },
  
  // Auto-refresh settings
  autoRefresh: {
    enabled: true,
    interval: 30000 // 30 seconds
  },
  
  // Banner settings
  banner: {
    position: 'top',
    sticky: true,
    showOnAllScreens: true
  },
  
  // Base screen settings
  baseScreen: {
    showSyncStatus: true,
    borderIndicators: true,
    statusLabels: true
  }
};

/**
 * Initialize sync status for ${appName}
 */
export async function initialize${appName}SyncStatus() {
  console.log('🔄 Initializing ${appName} sync status...');
  
  try {
    // Wait for base command
    await waitForBaseCommand();
    
    // Enhance base command with sync tracking
    if (window.baseCommand) {
      window.baseCommand = enhanceBaseCommandWithSyncTracking(window.baseCommand);
    }
    
    // Set up app-specific sync handlers
    setupAppSpecificHandlers();
    
    // Subscribe to sync status changes
    syncStatusManager.subscribe(handleSyncStatusChange);
    
    console.log('✅ ${appName} sync status initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize ${appName} sync status:', error);
  }
}

/**
 * Wait for base command to be available
 */
async function waitForBaseCommand(maxRetries = 50) {
  let retries = 0;
  while (!window.baseCommand && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (!window.baseCommand) {
    throw new Error('Base command not available after waiting');
  }
}

/**
 * Set up app-specific sync handlers
 */
function setupAppSpecificHandlers() {
  // ${appName}-specific sync handling can be added here
  
  // Example: Custom sync success handler
  const originalRecordSuccess = syncStatusManager.recordBaseSuccess;
  syncStatusManager.recordBaseSuccess = function(base, data) {
    // Call original
    originalRecordSuccess.call(this, base, data);
    
    // ${appName}-specific success handling
    console.log(\`✅ \${base.name} synced in ${appName}\`, data);
  };
}

/**
 * Handle sync status changes for ${appName}
 */
function handleSyncStatusChange(status) {
  console.log('🔄 ${appName} sync status changed:', status.status);
  
  // Update app-specific UI based on sync status
  switch (status.status) {
    case SYNC_STATUS.SUCCESS:
      // All bases synced successfully
      updateAppUI('success', status);
      break;
      
    case SYNC_STATUS.PARTIAL:
      // Some bases failed
      updateAppUI('partial', status);
      break;
      
    case SYNC_STATUS.FAILED:
      // All bases failed
      updateAppUI('failed', status);
      break;
  }
}

/**
 * Update ${appName} UI based on sync status
 */
function updateAppUI(syncStatus, status) {
  // App-specific UI updates can be added here
  
  // Example: Update title or favicon
  const title = document.title;
  const baseTitle = title.replace(/^[✅⚠️❌] /, '');
  
  switch (syncStatus) {
    case 'success':
      document.title = \`✅ \${baseTitle}\`;
      break;
    case 'partial':
      document.title = \`⚠️ \${baseTitle}\`;
      break;
    case 'failed':
      document.title = \`❌ \${baseTitle}\`;
      break;
  }
}

/**
 * Get ${appName} sync configuration
 */
export function get${appName}SyncConfig() {
  return { ...SYNC_CONFIG };
}

/**
 * Clean up ${appName} sync integration
 */
export function cleanup${appName}SyncStatus() {
  syncStatusManager.unsubscribe(handleSyncStatusChange);
  console.log('🧹 ${appName} sync status cleaned up');
}

// Auto-initialize if loaded
if (typeof window !== 'undefined') {
  window.initialize${appName}SyncStatus = initialize${appName}SyncStatus;
}
`;
  
  try {
    fs.writeFileSync(integrationPath, appSpecificIntegration);
    console.log(`   📄 Created sync-integration.js`);
  } catch (error) {
    console.warn(`   ⚠️  Could not create sync-integration.js:`, error.message);
  }
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log(`
🔄 Sync Status Integration Script
=================================

This script adds visual sync status indicators to all Nullary apps,
replacing confusing error messages with user-friendly feedback.

Usage:
  node add-sync-status-integration.js              # Add to all apps
  node add-sync-status-integration.js [app]        # Add to specific app
  node add-sync-status-integration.js --help       # Show this help

Examples:
  node add-sync-status-integration.js
  node add-sync-status-integration.js rhapsold/rhapsold

Features Added:
✅ Color-coded sync status banners (green/yellow/red)
✅ Per-base reachability indicators
✅ Pull-to-refresh with sync tracking
✅ Last sync time display
✅ Visual base status on base screen
✅ No more confusing error messages

The integration includes:
- Automatic sync tracking enhancement
- Pull-to-refresh with visual feedback
- Base screen with sync indicators
- App-specific configuration files
- CSS styles for visual indicators
  `);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Check if specific app was requested
const specificApp = process.argv[2];
if (specificApp && !specificApp.startsWith('--')) {
  if (NULLARY_APPS.includes(specificApp)) {
    // Run for specific app only
    const nullaryRoot = path.resolve(__dirname, '../../');
    const fullAppPath = path.join(nullaryRoot, specificApp);
    
    console.log(`🔄 Adding sync status integration to ${specificApp}...`);
    addSyncStatusToApp(fullAppPath, specificApp)
      .then(() => {
        console.log(`✅ ${specificApp} sync status integration added successfully`);
      })
      .catch(error => {
        console.error(`❌ Failed to add sync status to ${specificApp}:`, error.message);
        process.exit(1);
      });
  } else {
    console.error(`❌ Unknown app: ${specificApp}`);
    console.log('\\nAvailable apps:');
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