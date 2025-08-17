/**
 * Enhanced Base Screen with Sync Status Indicators
 * 
 * Shows base servers with visual sync status instead of confusing error messages.
 * Uses color-coded borders and status labels to indicate base reachability.
 */

import { createSVGContainer, createSVGElement, generateSVGId } from '../utils/svg-utils.js';
import { syncStatusManager, updateBaseWithSyncStatus } from '../utils/sync-status.js';
import { color } from '../themes/simple-theme.js';

/**
 * Create enhanced base screen with sync status indicators
 * @param {Object} config - Screen configuration
 * @returns {Object} Screen component with sync status
 */
export function createBaseScreenWithSync(config = {}) {
  const screen = {
    element: null,
    baseCommand: null,
    bases: [],
    
    // Configuration
    config: {
      title: 'Base Servers',
      width: 800,
      height: 600,
      showSyncStatus: true,
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
      ...config
    },
    
    // Methods
    initialize,
    refresh,
    updateSyncStatus,
    destroy
  };
  
  // Create the screen element
  screen.element = createScreenElement(screen.config);
  
  return screen;
}

/**
 * Create the main screen SVG element
 */
function createScreenElement(config) {
  const svg = createSVGContainer({
    width: config.width,
    height: config.height,
    viewBox: `0 0 ${config.width} ${config.height}`
  });
  
  svg.style.cssText = `
    background: ${color('white')};
    border: 1px solid ${color('lightGray')};
    border-radius: 8px;
    font-family: Arial, sans-serif;
  `;
  
  // Add screen title
  const title = createSVGElement('text', {
    x: 20,
    y: 30,
    'font-size': '18',
    'font-weight': 'bold',
    fill: color('black')
  });
  title.textContent = config.title;
  svg.appendChild(title);
  
  // Add sync status banner area
  const syncBannerArea = createSVGElement('foreignObject', {
    x: 20,
    y: 45,
    width: config.width - 40,
    height: 40
  });
  
  const syncBannerContainer = document.createElement('div');
  syncBannerContainer.id = 'sync-banner-container';
  syncBannerArea.appendChild(syncBannerContainer);
  svg.appendChild(syncBannerArea);
  
  // Add bases list area
  const basesArea = createSVGElement('foreignObject', {
    x: 20,
    y: 95,
    width: config.width - 40,
    height: config.height - 135
  });
  
  const basesContainer = document.createElement('div');
  basesContainer.id = 'bases-container';
  basesContainer.style.cssText = `
    height: 100%;
    overflow-y: auto;
    padding: 10px;
    background: ${color('lightGray')};
    border-radius: 4px;
  `;
  basesArea.appendChild(basesContainer);
  svg.appendChild(basesArea);
  
  // Add refresh button
  const refreshButton = createSVGElement('rect', {
    x: config.width - 80,
    y: 10,
    width: 60,
    height: 30,
    rx: 4,
    fill: color('primary'),
    cursor: 'pointer'
  });
  
  const refreshText = createSVGElement('text', {
    x: config.width - 50,
    y: 28,
    'text-anchor': 'middle',
    'font-size': '12',
    fill: color('white'),
    cursor: 'pointer'
  });
  refreshText.textContent = '🔄 Refresh';
  
  svg.appendChild(refreshButton);
  svg.appendChild(refreshText);
  
  // Add click handler for refresh
  [refreshButton, refreshText].forEach(element => {
    element.addEventListener('click', () => {
      const screen = element.closest('svg').screenInstance;
      if (screen) {
        screen.refresh(true); // Force refresh
      }
    });
  });
  
  return svg;
}

/**
 * Initialize the base screen
 * @param {Object} baseCommand - Base command instance
 */
async function initialize(baseCommand) {
  this.baseCommand = baseCommand;
  this.element.screenInstance = this;
  
  // Subscribe to sync status changes
  syncStatusManager.subscribe((status) => {
    this.updateSyncStatus(status);
  });
  
  // Load initial data
  await this.refresh();
  
  // Set up auto-refresh if enabled
  if (this.config.autoRefresh) {
    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, this.config.refreshInterval);
  }
}

/**
 * Refresh base data and update display
 * @param {boolean} forceRefresh - Force refresh from servers
 */
async function refresh(forceRefresh = false) {
  if (!this.baseCommand) {
    console.warn('Base command not initialized');
    return;
  }
  
  try {
    console.log('🔄 Refreshing base screen data...');
    
    // Get bases from base command
    this.bases = await this.baseCommand.getBases(forceRefresh);
    
    // Update the display
    this.updateBasesDisplay();
    
    // Update sync status
    const currentStatus = syncStatusManager.getStatus();
    this.updateSyncStatus(currentStatus);
    
  } catch (error) {
    console.error('Failed to refresh base screen:', error);
    
    // Show error state
    this.showError('Failed to load base servers. Check your connection and try again.');
  }
}

/**
 * Update sync status banner and base indicators
 * @param {Object} status - Current sync status
 */
function updateSyncStatus(status) {
  const syncBannerContainer = this.element.querySelector('#sync-banner-container');
  if (!syncBannerContainer) return;
  
  // Clear existing banner
  syncBannerContainer.innerHTML = '';
  
  if (this.config.showSyncStatus && status.lastAttempt) {
    // Create sync status banner
    const banner = createSyncStatusBanner(status);
    syncBannerContainer.appendChild(banner);
  }
  
  // Update base elements with sync status
  this.updateBaseSyncIndicators();
}

/**
 * Create sync status banner
 * @param {Object} status - Sync status
 * @returns {HTMLElement} Banner element
 */
function createSyncStatusBanner(status) {
  const banner = document.createElement('div');
  
  // Determine banner color and message
  let backgroundColor, textColor, message;
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };
  
  switch (status.status) {
    case 'success':
      backgroundColor = color('secondary'); // Green
      textColor = color('white');
      message = `✅ All bases synced ${formatTime(status.lastSuccess)}`;
      break;
      
    case 'partial':
      backgroundColor = color('quaternary'); // Yellow
      textColor = color('black');
      message = `⚠️ Partial sync ${formatTime(status.lastAttempt)} (${status.successfulBases}/${status.totalBases} bases)`;
      break;
      
    case 'failed':
      backgroundColor = color('cancel'); // Red
      textColor = color('white');
      message = `❌ Sync failed ${formatTime(status.lastAttempt)}`;
      break;
      
    default:
      backgroundColor = color('inactive'); // Gray
      textColor = color('white');
      message = '🔄 Pull to refresh';
  }
  
  banner.style.cssText = `
    background-color: ${backgroundColor};
    color: ${textColor};
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 8px;
  `;
  
  banner.textContent = message;
  return banner;
}

/**
 * Update bases display
 */
function updateBasesDisplay() {
  const basesContainer = this.element.querySelector('#bases-container');
  if (!basesContainer) return;
  
  // Clear existing bases
  basesContainer.innerHTML = '';
  
  if (!this.bases || this.bases.length === 0) {
    basesContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: ${color('inactive')};">
        <div style="font-size: 48px; margin-bottom: 15px;">🌐</div>
        <p><strong>No base servers found</strong></p>
        <p>Check your connection and try refreshing.</p>
      </div>
    `;
    return;
  }
  
  // Convert bases to array if needed
  const basesArray = Array.isArray(this.bases) ? this.bases : Object.values(this.bases);
  
  // Create base elements
  basesArray.forEach((base, index) => {
    const baseElement = this.createBaseElement(base, index);
    basesContainer.appendChild(baseElement);
  });
}

/**
 * Create individual base element
 * @param {Object} base - Base data
 * @param {number} index - Base index
 * @returns {HTMLElement} Base element
 */
function createBaseElement(base, index) {
  const baseDiv = document.createElement('div');
  baseDiv.className = 'base-element';
  baseDiv.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 8px 0;
    background: ${color('white')};
    border: 1px solid ${color('lightGray')};
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
  `;
  
  // Base info section
  const baseInfo = document.createElement('div');
  baseInfo.style.flex = '1';
  
  const baseName = document.createElement('div');
  baseName.style.cssText = `
    font-size: 16px;
    font-weight: bold;
    color: ${color('black')};
    margin-bottom: 4px;
  `;
  baseName.textContent = base.name || 'Unknown Base';
  
  const baseDescription = document.createElement('div');
  baseDescription.style.cssText = `
    font-size: 12px;
    color: ${color('inactive')};
    margin-bottom: 6px;
  `;
  baseDescription.textContent = base.description || 'No description available';
  
  // Services info
  const servicesInfo = document.createElement('div');
  servicesInfo.style.cssText = `
    font-size: 11px;
    color: ${color('inactive')};
  `;
  
  if (base.dns) {
    const serviceNames = Object.keys(base.dns);
    servicesInfo.textContent = `Services: ${serviceNames.join(', ')}`;
  }
  
  baseInfo.appendChild(baseName);
  baseInfo.appendChild(baseDescription);
  baseInfo.appendChild(servicesInfo);
  
  // Join/Leave button
  const actionButton = document.createElement('button');
  actionButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    margin-left: 10px;
    transition: all 0.2s ease;
  `;
  
  // Set button state based on joined status
  if (base.joined) {
    actionButton.textContent = 'Leave';
    actionButton.style.backgroundColor = color('cancel');
    actionButton.style.color = color('white');
  } else {
    actionButton.textContent = 'Join';
    actionButton.style.backgroundColor = color('primary');
    actionButton.style.color = color('white');
  }
  
  // Add button click handler
  actionButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    await this.handleBaseAction(base, actionButton);
  });
  
  baseDiv.appendChild(baseInfo);
  baseDiv.appendChild(actionButton);
  
  // Apply sync status indicators
  this.applyBaseSyncStatus(baseDiv, base);
  
  return baseDiv;
}

/**
 * Apply sync status indicators to base element
 * @param {HTMLElement} baseElement - Base DOM element
 * @param {Object} base - Base data
 */
function applyBaseSyncStatus(baseElement, base) {
  const baseStatus = syncStatusManager.getBaseStatus(base);
  
  // Update border based on sync status
  if (syncStatusManager.isBaseUnreachable(base)) {
    baseElement.style.borderColor = color('cancel'); // Red for unreachable
    baseElement.style.borderWidth = '2px';
  } else if (baseStatus.status === 'success') {
    baseElement.style.borderColor = color('secondary'); // Green for success
    baseElement.style.borderWidth = '2px';
  } else {
    baseElement.style.borderColor = color('lightGray'); // Default
    baseElement.style.borderWidth = '1px';
  }
  
  // Add sync status label
  const statusLabel = document.createElement('div');
  statusLabel.className = 'sync-status-label';
  statusLabel.style.cssText = `
    font-size: 10px;
    margin-top: 4px;
    font-weight: 500;
  `;
  
  if (syncStatusManager.isBaseUnreachable(base)) {
    statusLabel.style.color = color('cancel');
    const lastSuccess = baseStatus.lastSuccess;
    if (lastSuccess) {
      statusLabel.textContent = `⚠️ Last reached ${syncStatusManager.formatTimeSince(lastSuccess)}`;
    } else {
      statusLabel.textContent = '⚠️ Unreachable';
    }
  } else if (baseStatus.lastSuccess) {
    statusLabel.style.color = color('secondary');
    statusLabel.textContent = `✅ Last synced ${syncStatusManager.formatTimeSince(baseStatus.lastSuccess)}`;
  } else {
    statusLabel.style.color = color('inactive');
    statusLabel.textContent = '🔄 Not synced yet';
  }
  
  // Add to base info section
  const baseInfo = baseElement.querySelector('div');
  baseInfo.appendChild(statusLabel);
}

/**
 * Handle base join/leave actions
 * @param {Object} base - Base to act on
 * @param {HTMLElement} button - Action button
 */
async function handleBaseAction(base, button) {
  const originalText = button.textContent;
  button.textContent = '...';
  button.disabled = true;
  
  try {
    let success = false;
    
    if (base.joined) {
      success = await this.baseCommand.leaveBase(base);
    } else {
      success = await this.baseCommand.joinBase(base);
    }
    
    if (success) {
      // Refresh display to show updated state
      this.updateBasesDisplay();
    } else {
      throw new Error('Action failed');
    }
    
  } catch (error) {
    console.error('Base action failed:', error);
    button.textContent = originalText;
  }
  
  button.disabled = false;
}

/**
 * Update base sync indicators
 */
function updateBaseSyncIndicators() {
  const baseElements = this.element.querySelectorAll('.base-element');
  baseElements.forEach((element, index) => {
    const basesArray = Array.isArray(this.bases) ? this.bases : Object.values(this.bases);
    const base = basesArray[index];
    if (base) {
      this.applyBaseSyncStatus(element, base);
    }
  });
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showError(message) {
  const basesContainer = this.element.querySelector('#bases-container');
  if (basesContainer) {
    basesContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: ${color('cancel')};">
        <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
        <p><strong>Error</strong></p>
        <p>${message}</p>
      </div>
    `;
  }
}

/**
 * Destroy the screen and clean up
 */
function destroy() {
  // Clear auto-refresh interval
  if (this.refreshInterval) {
    clearInterval(this.refreshInterval);
    this.refreshInterval = null;
  }
  
  // Unsubscribe from sync status
  syncStatusManager.unsubscribe(this.updateSyncStatus);
  
  // Remove element
  if (this.element && this.element.parentNode) {
    this.element.parentNode.removeChild(this.element);
  }
}

// Export the enhanced base screen
export { createBaseScreenWithSync };