/**
 * Sync Status Management for The Nullary
 * 
 * Provides visual sync status indicators instead of confusing error messages.
 * Shows last sync time and success status through color-coded banners and base indicators.
 */

import { color } from '../themes/simple-theme.js';

/**
 * Sync status states
 */
export const SYNC_STATUS = {
  SUCCESS: 'success',      // All bases synced successfully - green
  PARTIAL: 'partial',      // Some bases failed - quaternary (yellow) 
  FAILED: 'failed'         // All bases failed - cancel (red)
};

/**
 * Default sync status object
 */
function createDefaultSyncStatus() {
  return {
    lastAttempt: null,
    lastSuccess: null,
    status: null,
    baseStatuses: {},  // baseId: { status, lastSuccess, lastAttempt, error }
    totalBases: 0,
    successfulBases: 0,
    failedBases: 0
  };
}

/**
 * Sync Status Manager
 */
export class SyncStatusManager {
  constructor() {
    this.syncStatus = this.loadSyncStatus();
    this.callbacks = [];
  }

  /**
   * Load sync status from localStorage
   */
  loadSyncStatus() {
    try {
      const stored = localStorage.getItem('nullary-sync-status');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load sync status:', err);
    }
    return createDefaultSyncStatus();
  }

  /**
   * Save sync status to localStorage
   */
  saveSyncStatus() {
    try {
      localStorage.setItem('nullary-sync-status', JSON.stringify(this.syncStatus));
    } catch (err) {
      console.warn('Failed to save sync status:', err);
    }
  }

  /**
   * Start a sync operation
   * @param {Array} bases - List of bases to sync
   */
  startSync(bases) {
    const now = Date.now();
    
    this.syncStatus.lastAttempt = now;
    this.syncStatus.totalBases = bases.length;
    this.syncStatus.successfulBases = 0;
    this.syncStatus.failedBases = 0;
    
    // Initialize base statuses
    bases.forEach(base => {
      const baseId = base.id || base.name || base.uuid;
      if (!this.syncStatus.baseStatuses[baseId]) {
        this.syncStatus.baseStatuses[baseId] = {};
      }
      this.syncStatus.baseStatuses[baseId].lastAttempt = now;
      this.syncStatus.baseStatuses[baseId].status = 'syncing';
    });
    
    this.saveSyncStatus();
    this.notifyCallbacks();
  }

  /**
   * Record base sync success
   * @param {Object} base - Base that synced successfully
   * @param {Object} data - Optional sync data
   */
  recordBaseSuccess(base, data = {}) {
    const baseId = base.id || base.name || base.uuid;
    const now = Date.now();
    
    if (!this.syncStatus.baseStatuses[baseId]) {
      this.syncStatus.baseStatuses[baseId] = {};
    }
    
    this.syncStatus.baseStatuses[baseId].status = SYNC_STATUS.SUCCESS;
    this.syncStatus.baseStatuses[baseId].lastSuccess = now;
    this.syncStatus.baseStatuses[baseId].error = null;
    this.syncStatus.baseStatuses[baseId].data = data;
    
    this.syncStatus.successfulBases++;
    
    this.updateOverallStatus();
    this.saveSyncStatus();
    this.notifyCallbacks();
  }

  /**
   * Record base sync failure
   * @param {Object} base - Base that failed to sync
   * @param {string} error - Error message
   */
  recordBaseFailure(base, error = 'Connection failed') {
    const baseId = base.id || base.name || base.uuid;
    
    if (!this.syncStatus.baseStatuses[baseId]) {
      this.syncStatus.baseStatuses[baseId] = {};
    }
    
    this.syncStatus.baseStatuses[baseId].status = SYNC_STATUS.FAILED;
    this.syncStatus.baseStatuses[baseId].error = error;
    
    this.syncStatus.failedBases++;
    
    this.updateOverallStatus();
    this.saveSyncStatus();
    this.notifyCallbacks();
  }

  /**
   * Complete sync operation
   */
  completSync() {
    this.updateOverallStatus();
    
    // Update last success if any bases succeeded
    if (this.syncStatus.successfulBases > 0) {
      this.syncStatus.lastSuccess = this.syncStatus.lastAttempt;
    }
    
    this.saveSyncStatus();
    this.notifyCallbacks();
  }

  /**
   * Update overall sync status based on base results
   */
  updateOverallStatus() {
    if (this.syncStatus.failedBases === 0 && this.syncStatus.successfulBases > 0) {
      // All bases succeeded
      this.syncStatus.status = SYNC_STATUS.SUCCESS;
    } else if (this.syncStatus.successfulBases > 0 && this.syncStatus.failedBases > 0) {
      // Some bases succeeded, some failed
      this.syncStatus.status = SYNC_STATUS.PARTIAL;
    } else if (this.syncStatus.failedBases > 0 && this.syncStatus.successfulBases === 0) {
      // All bases failed
      this.syncStatus.status = SYNC_STATUS.FAILED;
    }
  }

  /**
   * Get sync status for a specific base
   * @param {Object} base - Base to check
   * @returns {Object} Base sync status
   */
  getBaseStatus(base) {
    const baseId = base.id || base.name || base.uuid;
    return this.syncStatus.baseStatuses[baseId] || {
      status: null,
      lastSuccess: null,
      lastAttempt: null,
      error: null
    };
  }

  /**
   * Get overall sync status
   * @returns {Object} Current sync status
   */
  getStatus() {
    return { ...this.syncStatus };
  }

  /**
   * Check if a base is currently unreachable
   * @param {Object} base - Base to check
   * @returns {boolean} True if base is unreachable
   */
  isBaseUnreachable(base) {
    const baseStatus = this.getBaseStatus(base);
    return baseStatus.status === SYNC_STATUS.FAILED;
  }

  /**
   * Get formatted time since last sync
   * @param {number} timestamp - Timestamp to format
   * @returns {string} Formatted time string
   */
  formatTimeSince(timestamp) {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  /**
   * Subscribe to sync status changes
   * @param {Function} callback - Callback function
   */
  subscribe(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Unsubscribe from sync status changes
   * @param {Function} callback - Callback function to remove
   */
  unsubscribe(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify all subscribers of status changes
   */
  notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.syncStatus);
      } catch (err) {
        console.warn('Sync status callback error:', err);
      }
    });
  }

  /**
   * Reset sync status (for testing or fresh start)
   */
  reset() {
    this.syncStatus = createDefaultSyncStatus();
    this.saveSyncStatus();
    this.notifyCallbacks();
  }
}

// Create global sync status manager
export const syncStatusManager = new SyncStatusManager();

/**
 * Create sync status banner
 * @param {Object} status - Current sync status
 * @returns {HTMLElement} Banner element
 */
export function createSyncStatusBanner(status = null) {
  if (!status) {
    status = syncStatusManager.getStatus();
  }

  const banner = document.createElement('div');
  banner.className = 'sync-status-banner';
  
  // Determine banner color based on sync status
  let backgroundColor, textColor, message;
  
  switch (status.status) {
    case SYNC_STATUS.SUCCESS:
      backgroundColor = color('secondary'); // Green
      textColor = color('white');
      message = `✅ Synced ${syncStatusManager.formatTimeSince(status.lastSuccess)}`;
      break;
      
    case SYNC_STATUS.PARTIAL:
      backgroundColor = color('quaternary'); // Yellow
      textColor = color('black');
      message = `⚠️ Partial sync ${syncStatusManager.formatTimeSince(status.lastAttempt)} (${status.successfulBases}/${status.totalBases} bases)`;
      break;
      
    case SYNC_STATUS.FAILED:
      backgroundColor = color('cancel'); // Red
      textColor = color('white');
      message = `❌ Sync failed ${syncStatusManager.formatTimeSince(status.lastAttempt)}`;
      break;
      
    default:
      backgroundColor = color('inactive'); // Gray
      textColor = color('white');
      message = '🔄 Pull to refresh';
  }
  
  banner.style.cssText = `
    background-color: ${backgroundColor};
    color: ${textColor};
    padding: 8px 16px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    border-radius: 4px;
    margin: 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  `;
  
  banner.textContent = message;
  
  return banner;
}

/**
 * Update base UI element with sync status indicators
 * @param {HTMLElement} baseElement - Base DOM element
 * @param {Object} base - Base data
 */
export function updateBaseWithSyncStatus(baseElement, base) {
  const baseStatus = syncStatusManager.getBaseStatus(base);
  
  // Update border color based on reachability
  if (syncStatusManager.isBaseUnreachable(base)) {
    baseElement.style.borderColor = color('cancel'); // Red border for unreachable
    baseElement.style.borderWidth = '2px';
  } else if (baseStatus.status === SYNC_STATUS.SUCCESS) {
    baseElement.style.borderColor = color('secondary'); // Green border for success
    baseElement.style.borderWidth = '2px';
  } else {
    baseElement.style.borderColor = color('lightGray'); // Default border
    baseElement.style.borderWidth = '1px';
  }
  
  // Add or update sync status label
  let statusLabel = baseElement.querySelector('.sync-status-label');
  if (!statusLabel) {
    statusLabel = document.createElement('div');
    statusLabel.className = 'sync-status-label';
    statusLabel.style.cssText = `
      font-size: 11px;
      margin-top: 4px;
      font-weight: 500;
    `;
    baseElement.appendChild(statusLabel);
  }
  
  // Update status label content and color
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
}

/**
 * Example usage with base-command.js integration
 */
export function integrateWithBaseCommand(baseCommand) {
  // Wrap getFeed to track sync status
  const originalGetFeed = baseCommand.getFeed;
  
  baseCommand.getFeed = async function(callback, forceRefresh = false) {
    try {
      // Get bases for sync tracking
      const bases = await baseCommand.getBases();
      const basesArray = Array.isArray(bases) ? bases : Object.values(bases);
      const joinedBases = basesArray.filter(base => base.joined);
      
      // Start sync tracking
      syncStatusManager.startSync(joinedBases);
      
      // Call original getFeed
      const result = await originalGetFeed.call(this, callback, forceRefresh);
      
      // Track success for all bases (simplified - could be enhanced to track per base)
      joinedBases.forEach(base => {
        syncStatusManager.recordBaseSuccess(base, { contentCount: result.imagePosts?.length + result.textPosts?.length + result.videoPosts?.length || 0 });
      });
      
      syncStatusManager.completSync();
      
      return result;
      
    } catch (error) {
      // Track failure for all bases
      const bases = await baseCommand.getBases().catch(() => []);
      const basesArray = Array.isArray(bases) ? bases : Object.values(bases);
      const joinedBases = basesArray.filter(base => base.joined);
      
      joinedBases.forEach(base => {
        syncStatusManager.recordBaseFailure(base, error.message);
      });
      
      syncStatusManager.completSync();
      
      throw error;
    }
  };
  
  return baseCommand;
}

// Export utility functions
export {
  color,
  SYNC_STATUS as SyncStatus
};