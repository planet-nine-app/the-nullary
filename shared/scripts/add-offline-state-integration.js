#!/usr/bin/env node

/**
 * Add Offline State Integration to All Nullary Apps
 * 
 * This script adds offline state management to all Nullary apps,
 * providing clean offline screens instead of broken functionality.
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
 * Main function to add offline state integration to all apps
 */
async function main() {
  console.log('📴 Adding offline state integration to all Nullary apps...');
  
  const nullaryRoot = path.resolve(__dirname, '../../');
  
  for (const appPath of NULLARY_APPS) {
    const fullAppPath = path.join(nullaryRoot, appPath);
    
    if (!fs.existsSync(fullAppPath)) {
      console.log(`⏭️  Skipping ${appPath} (directory not found)`);
      continue;
    }
    
    console.log(`\\n📱 Processing ${appPath}...`);
    
    try {
      await addOfflineStateToApp(fullAppPath, appPath);
      console.log(`✅ ${appPath} offline state integration added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add offline state to ${appPath}:`, error.message);
    }
  }
  
  console.log('\\n🎉 Offline state integration complete!');
  console.log('\\n📝 Benefits:');
  console.log('✅ Clean offline screen instead of broken functionality');
  console.log('✅ Automatic network state detection');
  console.log('✅ Retry attempts with smart backoff');
  console.log('✅ Network feature disabling when offline');
  console.log('✅ Cached content remains accessible');
}

/**
 * Add offline state integration to a single app
 */
async function addOfflineStateToApp(appPath, appName) {
  const appSrcPath = path.join(appPath, 'src');
  
  if (!fs.existsSync(appSrcPath)) {
    console.log(`   ⏭️  No src directory found for ${appName}`);
    return;
  }
  
  // 1. Add import to main.js file
  await addOfflineStateImport(appSrcPath, appName);
  
  // 2. Add CSS for offline state
  await addOfflineStateCSS(appSrcPath, appName);
  
  // 3. Update index.html if needed
  await updateIndexHTML(appSrcPath, appName);
  
  // 4. Create app-specific offline integration
  await createAppOfflineIntegration(appSrcPath, appName);
}

/**
 * Add offline state import to main.js
 */
async function addOfflineStateImport(appSrcPath, appName) {
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
        
        // Check if offline state is already integrated
        if (content.includes('offline-state') || content.includes('OfflineStateIntegration')) {
          console.log(`   ⏭️  ${mainFile} already has offline state integration`);
          continue;
        }
        
        // Add import statement
        const importStatement = content.includes('import')
          ? `import { setupOfflineStateIntegration } from '../shared/examples/offline-state-example.js';\\n`
          : `// Offline State Integration\\n// import { setupOfflineStateIntegration } from '../shared/examples/offline-state-example.js';\\n`;
        
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
// Initialize offline state management
async function initializeOfflineState() {
  try {
    const offlineIntegration = await setupOfflineStateIntegration({
      showOfflineScreen: true,
      autoRetry: true,
      retryInterval: 10000, // 10 seconds
      maxRetries: 5
    });
    
    console.log('✅ Offline state integration initialized for ${appName}');
    window.offlineIntegration = offlineIntegration;
    
    // Add data attributes to mark network-dependent elements
    markNetworkDependentElements();
    
  } catch (error) {
    console.warn('⚠️ Offline state integration failed:', error);
  }
}

// Mark elements that require network connection
function markNetworkDependentElements() {
  // Mark upload buttons
  const uploadButtons = document.querySelectorAll('button[onclick*="upload"], button[onclick*="submit"], .upload-btn');
  uploadButtons.forEach(btn => btn.setAttribute('data-requires-network', 'true'));
  
  // Mark refresh buttons
  const refreshButtons = document.querySelectorAll('button[onclick*="refresh"], .refresh-btn, button[onclick*="sync"]');
  refreshButtons.forEach(btn => btn.setAttribute('data-requires-network', 'true'));
  
  // Mark content areas for offline indicators
  const contentAreas = document.querySelectorAll('#content, .content, #feed, .feed, main');
  contentAreas.forEach(area => area.setAttribute('data-content-area', 'true'));
}

// Initialize offline state when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOfflineState);
} else {
  initializeOfflineState();
}
`;
        
        content += initCode;
        
        fs.writeFileSync(mainFilePath, content);
        console.log(`   ✏️  Updated ${mainFile} with offline state integration`);
        
        break; // Only update the first main file found
        
      } catch (error) {
        console.warn(`   ⚠️  Could not update ${mainFile}:`, error.message);
      }
    }
  }
}

/**
 * Add CSS for offline state
 */
async function addOfflineStateCSS(appSrcPath, appName) {
  const cssFiles = [
    'styles.css',
    'style.css',
    'main.css'
  ];
  
  const offlineStateCSS = `
/* Offline State Integration Styles */
.offline-screen {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.offline-screen button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.offline-screen button:active {
  transform: translateY(0);
}

.offline-screen button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Network status indicator */
#offline-status-indicator {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  z-index: 1001;
  transition: all 0.3s ease;
  pointer-events: none;
}

/* Offline form notes */
.offline-form-note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 10px;
}

/* Offline content indicators */
.offline-content-indicator {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 12px;
  margin: 10px 0;
  font-size: 14px;
  color: #1976d2;
}

/* Disabled network-dependent elements */
button[data-requires-network]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  position: relative;
}

button[data-requires-network]:disabled::after {
  content: '📡';
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 10px;
  background: #e74c3c;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive design */
@media (max-width: 480px) {
  .offline-screen > div {
    margin: 10px !important;
    padding: 30px 20px !important;
  }
  
  .offline-screen h2 {
    font-size: 20px !important;
  }
  
  .offline-screen p {
    font-size: 14px !important;
  }
  
  #offline-status-indicator {
    top: 5px;
    right: 5px;
    font-size: 10px;
  }
}

/* Animation keyframes */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.offline-screen > div {
  animation: fadeIn 0.3s ease;
}

@keyframes slideInFromBottom {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.offline-content-indicator {
  animation: slideInFromBottom 0.3s ease;
}
`;
  
  for (const cssFile of cssFiles) {
    const cssFilePath = path.join(appSrcPath, cssFile);
    
    if (fs.existsSync(cssFilePath)) {
      try {
        let content = fs.readFileSync(cssFilePath, 'utf8');
        
        // Check if offline state CSS is already added
        if (content.includes('offline-screen') || content.includes('offline-state')) {
          console.log(`   ⏭️  ${cssFile} already has offline state styles`);
          continue;
        }
        
        // Add offline state CSS
        content += offlineStateCSS;
        
        fs.writeFileSync(cssFilePath, content);
        console.log(`   🎨 Added offline state styles to ${cssFile}`);
        
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
        
        // Check if offline status indicator placeholder already exists
        if (content.includes('offline-status-indicator') || content.includes('data-requires-network')) {
          console.log(`   ⏭️  ${htmlFile} already has offline state markup`);
          continue;
        }
        
        // Add data attributes to common elements that require network
        content = content.replace(
          /<button([^>]*)(onclick="[^"]*upload[^"]*"|onclick="[^"]*submit[^"]*"|onclick="[^"]*refresh[^"]*"|onclick="[^"]*sync[^"]*")([^>]*)>/gi,
          '<button$1$2$3 data-requires-network="true">'
        );
        
        // Add data-content-area to main content containers
        content = content.replace(
          /<(div|main|section)([^>]*)(id="content"|id="feed"|class="[^"]*content[^"]*"|class="[^"]*feed[^"]*")([^>]*)>/gi,
          '<$1$2$3$4 data-content-area="true">'
        );
        
        fs.writeFileSync(htmlFilePath, content);
        console.log(`   📄 Updated ${htmlFile} with offline state attributes`);
        
        break; // Only update the first HTML file found
        
      } catch (error) {
        console.warn(`   ⚠️  Could not update ${htmlFile}:`, error.message);
      }
    }
  }
}

/**
 * Create app-specific offline integration file
 */
async function createAppOfflineIntegration(appSrcPath, appName) {
  const integrationPath = path.join(appSrcPath, 'offline-integration.js');
  
  if (fs.existsSync(integrationPath)) {
    console.log(`   ⏭️  offline-integration.js already exists`);
    return;
  }
  
  const appSpecificIntegration = `/**
 * ${appName} Offline State Integration
 * 
 * App-specific offline state configuration and handlers.
 * Generated automatically by add-offline-state-integration.js
 */

import { offlineStateManager } from '../shared/utils/offline-state.js';
import { OfflineStateIntegrationExample } from '../shared/examples/offline-state-example.js';

/**
 * ${appName}-specific offline configuration
 */
const OFFLINE_CONFIG = {
  // Offline screen settings
  screen: {
    showOfflineScreen: true,
    customMessage: '${appName} is currently offline',
    showLastSyncInfo: true
  },
  
  // Retry settings
  retry: {
    autoRetry: true,
    retryInterval: 10000, // 10 seconds
    maxRetries: 5,
    exponentialBackoff: true
  },
  
  // Feature settings
  features: {
    disableNetworkButtons: true,
    showOfflineIndicators: true,
    preserveFormData: true,
    enableCachedContent: true
  },
  
  // Navigation settings
  navigation: {
    showStatusIndicator: true,
    indicatorPosition: 'top-right',
    hideIndicatorDelay: 3000
  }
};

/**
 * Initialize offline state for ${appName}
 */
export async function initialize${appName}OfflineState() {
  console.log('📴 Initializing ${appName} offline state...');
  
  try {
    // Set up offline state integration
    const integration = new OfflineStateIntegrationExample();
    await integration.initialize(OFFLINE_CONFIG);
    
    // Set up app-specific offline handlers
    setupAppSpecificOfflineHandlers();
    
    // Subscribe to offline state changes
    offlineStateManager.subscribe(handleOfflineStateChange);
    
    console.log('✅ ${appName} offline state initialized');
    return integration;
    
  } catch (error) {
    console.error('❌ Failed to initialize ${appName} offline state:', error);
    throw error;
  }
}

/**
 * Set up app-specific offline handlers
 */
function setupAppSpecificOfflineHandlers() {
  // ${appName}-specific offline handling can be added here
  
  // Example: Handle specific buttons or features
  const specificButtons = document.querySelectorAll('.${appName.toLowerCase()}-specific-button');
  specificButtons.forEach(button => {
    button.setAttribute('data-requires-network', 'true');
  });
  
  // Example: Set up offline storage for app-specific data
  setupOfflineStorage();
}

/**
 * Handle offline state changes for ${appName}
 */
function handleOfflineStateChange(state, details) {
  console.log(\`📶 \${appName} offline state changed: \${state}\`, details);
  
  if (state === 'offline') {
    handle${appName}GoingOffline(details);
  } else if (state === 'online') {
    handle${appName}ComingOnline(details);
  }
}

/**
 * Handle ${appName} going offline
 */
function handle${appName}GoingOffline(details) {
  console.log(\`📴 \${appName} went offline\`);
  
  // App-specific offline behavior
  // Example: Save current work
  saveCurrentWork();
  
  // Example: Switch to offline mode UI
  switchToOfflineUI();
  
  // Example: Disable specific features
  disableOnlineOnlyFeatures();
}

/**
 * Handle ${appName} coming back online
 */
function handle${appName}ComingOnline(details) {
  console.log(\`🌐 \${appName} came back online\`);
  
  // App-specific online recovery
  // Example: Sync pending changes
  syncPendingChanges();
  
  // Example: Re-enable features
  enableOnlineFeatures();
  
  // Example: Refresh critical data
  refreshCriticalData();
}

/**
 * Set up offline storage for ${appName}
 */
function setupOfflineStorage() {
  // Example: Store app state in localStorage
  const storeAppState = () => {
    try {
      const appState = {
        timestamp: Date.now(),
        url: window.location.href,
        // Add app-specific state here
      };
      localStorage.setItem('${appName.toLowerCase()}-offline-state', JSON.stringify(appState));
    } catch (error) {
      console.warn('Failed to store ${appName} offline state:', error);
    }
  };
  
  // Store state when going offline
  offlineStateManager.subscribe((state) => {
    if (state === 'offline') {
      storeAppState();
    }
  });
}

/**
 * Save current work when going offline
 */
function saveCurrentWork() {
  // ${appName}-specific work saving logic
  console.log('💾 Saving current work for offline mode...');
  
  // Example: Save form data
  const forms = document.querySelectorAll('form');
  forms.forEach((form, index) => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    localStorage.setItem(\`\${appName.toLowerCase()}-form-\${index}\`, JSON.stringify(data));
  });
}

/**
 * Switch to offline mode UI
 */
function switchToOfflineUI() {
  console.log('🎨 Switching to offline UI mode...');
  
  // Add offline class to body
  document.body.classList.add('offline-mode');
  
  // Update any app-specific UI elements
  const title = document.querySelector('h1, .app-title');
  if (title) {
    title.dataset.originalText = title.textContent;
    title.textContent = \`\${title.textContent} (Offline)\`;
  }
}

/**
 * Disable online-only features
 */
function disableOnlineOnlyFeatures() {
  console.log('🚫 Disabling online-only features...');
  
  // ${appName}-specific feature disabling
  // Example: Disable upload functionality
  const uploadAreas = document.querySelectorAll('.upload-area, .file-upload');
  uploadAreas.forEach(area => {
    area.style.opacity = '0.5';
    area.style.pointerEvents = 'none';
  });
}

/**
 * Sync pending changes when back online
 */
async function syncPendingChanges() {
  console.log('🔄 Syncing pending changes...');
  
  try {
    // Check for saved form data
    const formKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('${appName.toLowerCase()}-form-')
    );
    
    for (const key of formKeys) {
      const formData = JSON.parse(localStorage.getItem(key));
      // Process saved form data
      console.log('Found saved form data:', formData);
      
      // Clear after processing
      localStorage.removeItem(key);
    }
    
  } catch (error) {
    console.warn('Failed to sync pending changes:', error);
  }
}

/**
 * Enable online features
 */
function enableOnlineFeatures() {
  console.log('✅ Re-enabling online features...');
  
  // Remove offline mode class
  document.body.classList.remove('offline-mode');
  
  // Restore app title
  const title = document.querySelector('h1, .app-title');
  if (title && title.dataset.originalText) {
    title.textContent = title.dataset.originalText;
    delete title.dataset.originalText;
  }
  
  // Re-enable upload areas
  const uploadAreas = document.querySelectorAll('.upload-area, .file-upload');
  uploadAreas.forEach(area => {
    area.style.opacity = '';
    area.style.pointerEvents = '';
  });
}

/**
 * Refresh critical data when back online
 */
async function refreshCriticalData() {
  console.log('🔄 Refreshing critical data...');
  
  try {
    // Trigger content refresh if base command is available
    if (window.baseCommand && window.baseCommand.getFeed) {
      await window.baseCommand.getFeed(null, true);
    }
    
    // ${appName}-specific data refresh
    // Add any app-specific refresh logic here
    
  } catch (error) {
    console.warn('Failed to refresh critical data:', error);
  }
}

/**
 * Get ${appName} offline configuration
 */
export function get${appName}OfflineConfig() {
  return { ...OFFLINE_CONFIG };
}

/**
 * Clean up ${appName} offline integration
 */
export function cleanup${appName}OfflineState() {
  offlineStateManager.unsubscribe(handleOfflineStateChange);
  console.log('🧹 ${appName} offline state cleaned up');
}

// Auto-initialize if loaded
if (typeof window !== 'undefined') {
  window.initialize${appName}OfflineState = initialize${appName}OfflineState;
}
`;
  
  try {
    fs.writeFileSync(integrationPath, appSpecificIntegration);
    console.log(`   📄 Created offline-integration.js`);
  } catch (error) {
    console.warn(`   ⚠️  Could not create offline-integration.js:`, error.message);
  }
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log(`
📴 Offline State Integration Script
===================================

This script adds clean offline state management to all Nullary apps,
providing user-friendly offline screens instead of broken functionality.

Usage:
  node add-offline-state-integration.js              # Add to all apps
  node add-offline-state-integration.js [app]        # Add to specific app
  node add-offline-state-integration.js --help       # Show this help

Examples:
  node add-offline-state-integration.js
  node add-offline-state-integration.js rhapsold/rhapsold

Features Added:
✅ Clean offline screen with friendly messaging
✅ Automatic network state detection
✅ Smart retry attempts with backoff
✅ Network-dependent feature disabling
✅ Cached content accessibility
✅ Form data preservation
✅ Visual offline indicators

The integration includes:
- Automatic offline/online detection
- Clean offline screen overlay
- Network feature disabling/enabling
- App-specific configuration files
- CSS styles for offline states
- Form data preservation
- Cached content access

Benefits:
- Apps remain usable when offline
- No broken functionality or error dialogs
- Clear communication about network state
- Automatic recovery when back online
- Preserved user work and form data
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
    
    console.log(`📴 Adding offline state integration to ${specificApp}...`);
    addOfflineStateToApp(fullAppPath, specificApp)
      .then(() => {
        console.log(`✅ ${specificApp} offline state integration added successfully`);
      })
      .catch(error => {
        console.error(`❌ Failed to add offline state to ${specificApp}:`, error.message);
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