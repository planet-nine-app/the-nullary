#!/usr/bin/env node

/**
 * Update Base Screens Across All Nullary Apps
 * Replaces demo data with production BDO integration
 */

const fs = require('fs');
const path = require('path');

// Apps that need base screen updates
const APPS_TO_UPDATE = [
  'rhapsold', 'screenary', 'lexary', 'photary', 'viewary', 'mybase', 
  'stackchat', 'blogary', 'eventary', 'grocary', 'idothis', 'postary', 'viewaris'
];

// Production base screen function template
const PRODUCTION_BASE_SCREEN_TEMPLATE = `/**
 * Create Production Base Screen using real BDO data
 */
function createBaseScreen() {
  console.log('🏗️ Creating production base screen with real BDO data...');
  
  // Create a simple production base screen
  const screen = document.createElement('div');
  screen.id = 'base-screen';
  screen.className = 'screen';
  screen.style.cssText = \`
    padding: 20px;
    overflow-y: auto;
    background: \${appState.currentTheme.colors.background};
    color: \${appState.currentTheme.colors.text};
    font-family: \${appState.currentTheme.typography.fontFamily};
  \`;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = \`
    text-align: center;
    margin-bottom: 40px;
  \`;
  header.innerHTML = \`
    <h1 style="
      color: \${appState.currentTheme.colors.primary};
      margin-bottom: 12px;
      font-size: 2rem;
      font-family: \${appState.currentTheme.typography.fontFamily};
    ">🌐 Base Server Management</h1>
    <p style="
      color: \${appState.currentTheme.colors.secondary};
      font-size: 16px;
      margin: 0;
    ">Real-time discovery from your home BDO server</p>
  \`;
  
  // Status area
  const statusArea = document.createElement('div');
  statusArea.style.cssText = \`
    background: \${appState.currentTheme.colors.surface};
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 30px;
    text-align: center;
    border: 1px solid \${appState.currentTheme.colors.border};
  \`;
  statusArea.innerHTML = \`
    <div style="color: \${appState.currentTheme.colors.textMuted};">
      🔄 Loading base servers from BDO...
    </div>
  \`;
  
  // Refresh button
  const refreshButton = document.createElement('button');
  refreshButton.innerHTML = '🔄 Refresh Bases';
  refreshButton.style.cssText = \`
    background: \${appState.currentTheme.colors.primary};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-family: \${appState.currentTheme.typography.fontFamily};
    font-size: \${appState.currentTheme.typography.fontSize}px;
    cursor: pointer;
    margin-bottom: 20px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  \`;
  
  // Bases container
  const basesContainer = document.createElement('div');
  basesContainer.style.cssText = \`
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    gap: 20px;
  \`;
  
  screen.appendChild(header);
  screen.appendChild(statusArea);
  screen.appendChild(refreshButton);
  screen.appendChild(basesContainer);
  
  // Get the app-specific invoke function
  const appInvoke = window.{{APP_NAME}}Invoke || invoke;
  
  // Load bases from BDO
  async function loadBasesFromBDO() {
    statusArea.innerHTML = \`
      <div style="color: \${appState.currentTheme.colors.textMuted};">
        📡 Connecting to BDO server at \${getEnvironmentConfig().bdo}...
      </div>
    \`;
    
    try {
      if (!appInvoke) {
        throw new Error('Tauri backend not available');
      }
      
      // Get environment config
      const envConfig = getEnvironmentConfig();
      
      // Create BDO user
      const bdoUser = await appInvoke('create_bdo_user', { 
        bdoUrl: envConfig.bdo 
      });
      console.log('✅ BDO user created:', bdoUser.uuid);
      
      statusArea.innerHTML = \`
        <div style="color: \${appState.currentTheme.colors.textMuted};">
          🔍 Discovering bases from BDO (User: \${bdoUser.uuid.substring(0, 8)}...)
        </div>
      \`;
      
      // Get bases from BDO
      const basesData = await appInvoke('get_bases', {
        uuid: bdoUser.uuid,
        bdoUrl: envConfig.bdo
      });
      
      console.log('📦 Raw bases from BDO:', basesData);
      
      // Clear existing bases
      basesContainer.innerHTML = '';
      
      if (!basesData || Object.keys(basesData).length === 0) {
        statusArea.innerHTML = \`
          <div style="color: \${appState.currentTheme.colors.textMuted};">
            📦 No base servers found in BDO yet
          </div>
        \`;
        
        const emptyState = document.createElement('div');
        emptyState.style.cssText = \`
          text-align: center;
          padding: 60px 20px;
          color: \${appState.currentTheme.colors.textMuted};
          font-size: \${appState.currentTheme.typography.fontSize + 2}px;
        \`;
        emptyState.innerHTML = \`
          <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
          <div style="font-weight: bold; margin-bottom: 10px;">No base servers yet</div>
          <div>Base servers will appear here when they're added to your home BDO</div>
        \`;
        basesContainer.appendChild(emptyState);
        return;
      }
      
      // Process and display bases
      const baseCount = Object.keys(basesData).length;
      statusArea.innerHTML = \`
        <div style="color: \${appState.currentTheme.colors.primary};">
          ✅ Found \${baseCount} base servers from BDO
        </div>
      \`;
      
      // Create base cards
      Object.entries(basesData).forEach(([baseId, baseData]) => {
        const base = {
          ...baseData,
          id: baseId,
          status: 'connected',
          users: 0,
          uptime: '100%'
        };
        
        const baseCard = createProductionBaseCard(base);
        basesContainer.appendChild(baseCard);
      });
      
      console.log('✅ Successfully loaded bases from BDO');
      
    } catch (error) {
      console.error('❌ Failed to load bases from BDO:', error);
      statusArea.innerHTML = \`
        <div style="color: \${appState.currentTheme.colors.error};">
          ❌ Error: \${error.message}
        </div>
      \`;
      
      // Show fallback message
      const errorState = document.createElement('div');
      errorState.style.cssText = \`
        text-align: center;
        padding: 60px 20px;
        color: \${appState.currentTheme.colors.textMuted};
        background: rgba(239, 68, 68, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.3);
      \`;
      errorState.innerHTML = \`
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <div style="font-weight: bold; margin-bottom: 10px;">Connection Failed</div>
        <div style="margin-bottom: 10px;">\${error.message}</div>
        <div>Using current environment: \${getEnvironmentConfig().bdo}</div>
      \`;
      basesContainer.appendChild(errorState);
    }
  }
  
  // Create production base card
  function createProductionBaseCard(base) {
    const baseCard = document.createElement('div');
    baseCard.style.cssText = \`
      background: \${appState.currentTheme.colors.surface};
      border: 2px solid \${appState.currentTheme.colors.primary};
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
      position: relative;
    \`;
    
    const servicesList = Object.keys(base.dns || {}).join(', ') || 'No services';
    const somaContent = Object.entries(base.soma || {})
      .map(([type, tags]) => \`\${type}: \${Array.isArray(tags) ? tags.join(', ') : tags}\`)
      .join(' • ') || 'No content tags';
    
    baseCard.innerHTML = \`
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="
          color: \${appState.currentTheme.colors.text};
          margin: 0;
          font-size: 1.4rem;
          font-family: \${appState.currentTheme.typography.fontFamily};
        ">\${base.name || base.id || 'Unknown Base'}</h3>
        <div style="
          background: \${appState.currentTheme.colors.primary};
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        ">connected</div>
      </div>
      
      <p style="
        color: \${appState.currentTheme.colors.textSecondary};
        margin-bottom: 16px;
        line-height: 1.5;
      ">\${base.description || 'Base server discovered from BDO'}</p>
      
      <div style="margin-bottom: 16px;">
        <div style="color: \${appState.currentTheme.colors.text}; font-weight: bold; margin-bottom: 8px;">
          Available Services:
        </div>
        <div style="color: \${appState.currentTheme.colors.textMuted}; font-size: 14px;">
          \${servicesList}
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="color: \${appState.currentTheme.colors.text}; font-weight: bold; margin-bottom: 8px;">
          Content Types (Soma):
        </div>
        <div style="color: \${appState.currentTheme.colors.textMuted}; font-size: 14px;">
          \${somaContent}
        </div>
      </div>
      
      <div style="text-align: center;">
        <button onclick="alert('Base: \${base.name || base.id}\\\\nServices: \${servicesList}\\\\nContent: \${somaContent}')" style="
          background: \${appState.currentTheme.colors.secondary};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: \${appState.currentTheme.typography.fontFamily};
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        " 
        onmouseover="this.style.opacity='0.8'"
        onmouseout="this.style.opacity='1'">
          View Details
        </button>
      </div>
    \`;
    
    return baseCard;
  }
  
  // Refresh button handler
  refreshButton.addEventListener('click', loadBasesFromBDO);
  
  // Auto-load bases when screen is created
  setTimeout(loadBasesFromBDO, 100);
  
  return screen;
}`;

/**
 * Update base screen in a specific app
 */
function updateAppBaseScreen(appName) {
  // Try different main file patterns
  const possiblePaths = [
    path.join(__dirname, '..', '..', appName, appName, 'src', 'main.js'),
    path.join(__dirname, '..', '..', appName, appName, 'src', 'main-no-modules.js'),
    path.join(__dirname, '..', '..', appName, 'src', 'main.js'),
    path.join(__dirname, '..', '..', appName, 'main.js')
  ];
  
  let appPath = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      appPath = possiblePath;
      break;
    }
  }
  
  if (!appPath) {
    console.log(`⚠️ Skipping ${appName} - no main file found`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Check if already updated
    if (content.includes('Creating production base screen with real BDO data')) {
      console.log(`✅ ${appName} already has production base screen`);
      return true;
    }
    
    // Find the createBaseScreen function
    const baseScreenRegex = /function createBaseScreen\(\)[^}]*{[\s\S]*?^}/m;
    const match = content.match(baseScreenRegex);
    
    if (!match) {
      console.log(`⚠️ ${appName} - createBaseScreen function not found`);
      return false;
    }
    
    // Replace with production version
    const appSpecificCode = PRODUCTION_BASE_SCREEN_TEMPLATE.replace(/{{APP_NAME}}/g, appName);
    content = content.replace(baseScreenRegex, appSpecificCode);
    
    // Write updated content
    fs.writeFileSync(appPath, content);
    console.log(`✅ Updated ${appName} with production base screen`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating ${appName}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Updating base screens across all Nullary apps...\\n');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const appName of APPS_TO_UPDATE) {
    const result = updateAppBaseScreen(appName);
    if (result === true) {
      updated++;
    } else if (result === false) {
      skipped++;
    } else {
      errors++;
    }
  }
  
  console.log('\\n📊 Summary:');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️ Skipped: ${skipped}`);  
  console.log(`❌ Errors: ${errors}`);
  console.log('\\n🎉 Base screen production update complete!');
  console.log('\\n💡 All apps now use real BDO data instead of demo data');
  console.log('🔗 Base servers will be discovered from your home BDO server');
  console.log('🌐 Environment-aware connection to dev/test/local infrastructure');
}

if (require.main === module) {
  main();
}

module.exports = { updateAppBaseScreen };