/**
 * Offline State Management for The Nullary
 * 
 * Provides a clean offline screen instead of broken functionality when offline.
 * Shows friendly offline notification rather than making apps unusable.
 */

import { color } from '../themes/simple-theme.js';
import { syncStatusManager } from './sync-status.js';

/**
 * Offline State Manager
 */
export class OfflineStateManager {
  constructor() {
    this.isOffline = false;
    this.offlineScreen = null;
    this.callbacks = [];
    this.lastOnlineTime = Date.now();
    this.retryInterval = null;
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  /**
   * Initialize offline state management
   * @param {Object} config - Configuration options
   */
  initialize(config = {}) {
    this.config = {
      showOfflineScreen: true,
      autoRetry: true,
      retryInterval: 10000, // 10 seconds
      maxRetries: 5,
      persistLastState: true,
      ...config
    };

    // Set up network event listeners
    this.setupNetworkListeners();
    
    // Check initial online state
    this.checkNetworkStatus();
    
    console.log('🌐 Offline state management initialized');
  }

  /**
   * Set up network event listeners
   */
  setupNetworkListeners() {
    // Standard online/offline events
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Additional connectivity checks for more reliable detection
    this.setupConnectivityChecks();
  }

  /**
   * Set up additional connectivity checks
   * Sometimes browser online/offline events aren't reliable
   */
  setupConnectivityChecks() {
    // Periodic connectivity check
    setInterval(() => {
      if (navigator.onLine) {
        this.performConnectivityTest();
      }
    }, 30000); // Check every 30 seconds

    // Check on window focus (user returns to app)
    window.addEventListener('focus', () => {
      if (navigator.onLine) {
        this.performConnectivityTest();
      }
    });
  }

  /**
   * Perform actual connectivity test
   * Tests if we can reach the internet, not just if WiFi is connected
   */
  async performConnectivityTest() {
    try {
      // Try to fetch a small resource with cache-busting
      const response = await fetch('/favicon.ico?' + Date.now(), {
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      
      if (response.ok && this.isOffline) {
        this.handleOnline();
      }
    } catch (error) {
      if (!this.isOffline) {
        this.handleOffline();
      }
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    if (this.isOffline) return; // Already handling offline state
    
    this.isOffline = true;
    this.retryCount = 0;
    
    console.log('📴 App went offline');
    
    // Show offline screen
    if (this.config.showOfflineScreen) {
      this.showOfflineScreen();
    }
    
    // Start retry attempts
    if (this.config.autoRetry) {
      this.startRetryAttempts();
    }
    
    // Notify callbacks
    this.notifyCallbacks('offline');
  }

  /**
   * Handle going online
   */
  handleOnline() {
    if (!this.isOffline) return; // Already online
    
    this.isOffline = false;
    this.lastOnlineTime = Date.now();
    
    console.log('🌐 App came back online');
    
    // Hide offline screen
    this.hideOfflineScreen();
    
    // Stop retry attempts
    this.stopRetryAttempts();
    
    // Notify callbacks
    this.notifyCallbacks('online');
    
    // Trigger a sync to refresh content
    this.triggerOnlineSync();
  }

  /**
   * Check current network status
   */
  checkNetworkStatus() {
    if (navigator.onLine) {
      this.performConnectivityTest();
    } else {
      this.handleOffline();
    }
  }

  /**
   * Show offline screen
   */
  showOfflineScreen() {
    if (this.offlineScreen) return; // Already showing
    
    this.offlineScreen = this.createOfflineScreen();
    document.body.appendChild(this.offlineScreen);
    
    // Animate in
    setTimeout(() => {
      this.offlineScreen.style.opacity = '1';
    }, 10);
  }

  /**
   * Hide offline screen
   */
  hideOfflineScreen() {
    if (!this.offlineScreen) return;
    
    // Animate out
    this.offlineScreen.style.opacity = '0';
    
    setTimeout(() => {
      if (this.offlineScreen && this.offlineScreen.parentNode) {
        this.offlineScreen.parentNode.removeChild(this.offlineScreen);
      }
      this.offlineScreen = null;
    }, 300);
  }

  /**
   * Create offline screen element
   */
  createOfflineScreen() {
    const screen = document.createElement('div');
    screen.className = 'offline-screen';
    screen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(5px);
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: ${color('white')};
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    // Offline icon
    const icon = document.createElement('div');
    icon.style.cssText = `
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.8;
    `;
    icon.textContent = '📴';

    // Title
    const title = document.createElement('h2');
    title.style.cssText = `
      color: ${color('black')};
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
    `;
    title.textContent = 'You\'re Offline';

    // Message
    const message = document.createElement('p');
    message.style.cssText = `
      color: ${color('inactive')};
      margin: 0 0 24px 0;
      font-size: 16px;
      line-height: 1.5;
    `;
    message.innerHTML = `
      No internet connection detected.<br>
      Please check your connection and try again.
    `;

    // Last sync info
    const lastSyncInfo = this.createLastSyncInfo();
    
    // Retry button
    const retryButton = document.createElement('button');
    retryButton.style.cssText = `
      background: ${color('primary')};
      color: ${color('white')};
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 12px;
    `;
    retryButton.textContent = 'Try Again';
    
    retryButton.addEventListener('click', () => {
      this.checkNetworkStatus();
      this.updateRetryButton(retryButton);
    });

    // Status info
    const statusInfo = document.createElement('div');
    statusInfo.id = 'offline-status-info';
    statusInfo.style.cssText = `
      margin-top: 20px;
      font-size: 14px;
      color: ${color('inactive')};
    `;
    
    this.updateStatusInfo(statusInfo);

    // Assemble content
    content.appendChild(icon);
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(lastSyncInfo);
    content.appendChild(retryButton);
    content.appendChild(statusInfo);
    
    screen.appendChild(content);
    
    return screen;
  }

  /**
   * Create last sync information display
   */
  createLastSyncInfo() {
    const container = document.createElement('div');
    container.style.cssText = `
      background: ${color('lightGray')};
      border-radius: 6px;
      padding: 12px;
      margin: 16px 0;
      font-size: 14px;
    `;

    const syncStatus = syncStatusManager.getStatus();
    
    if (syncStatus.lastSuccess) {
      const timeSince = this.formatTimeSince(syncStatus.lastSuccess);
      container.innerHTML = `
        <div style="color: ${color('secondary')}; font-weight: 500;">
          ✅ Last synced ${timeSince}
        </div>
        <div style="color: ${color('inactive')}; font-size: 12px; margin-top: 4px;">
          You may have cached content available
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="color: ${color('inactive')}; font-weight: 500;">
          🔄 No recent sync data
        </div>
        <div style="color: ${color('inactive')}; font-size: 12px; margin-top: 4px;">
          Connect to the internet to load content
        </div>
      `;
    }

    return container;
  }

  /**
   * Update retry button state
   */
  updateRetryButton(button) {
    button.disabled = true;
    button.textContent = 'Checking...';
    
    setTimeout(() => {
      button.disabled = false;
      button.textContent = 'Try Again';
    }, 2000);
  }

  /**
   * Update status info
   */
  updateStatusInfo(statusElement) {
    if (!statusElement) return;
    
    const timeSinceOffline = this.formatTimeSince(Date.now() - (Date.now() - this.lastOnlineTime));
    
    if (this.retryCount > 0) {
      statusElement.innerHTML = `
        Offline for ${timeSinceOffline}<br>
        Retry attempts: ${this.retryCount}/${this.maxRetries}
      `;
    } else {
      statusElement.innerHTML = `Offline for ${timeSinceOffline}`;
    }
  }

  /**
   * Start automatic retry attempts
   */
  startRetryAttempts() {
    if (this.retryInterval) return; // Already running
    
    this.retryInterval = setInterval(() => {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retry attempt ${this.retryCount}/${this.maxRetries}`);
        this.performConnectivityTest();
        
        // Update status if offline screen is showing
        const statusInfo = document.getElementById('offline-status-info');
        if (statusInfo) {
          this.updateStatusInfo(statusInfo);
        }
      } else {
        // Max retries reached, slow down attempts
        clearInterval(this.retryInterval);
        this.retryInterval = setInterval(() => {
          this.performConnectivityTest();
        }, 60000); // Check every minute after max retries
      }
    }, this.config.retryInterval);
  }

  /**
   * Stop retry attempts
   */
  stopRetryAttempts() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    this.retryCount = 0;
  }

  /**
   * Trigger sync when coming back online
   */
  async triggerOnlineSync() {
    try {
      // Wait a moment for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Trigger a fresh sync if base command is available
      if (window.baseCommand && window.baseCommand.getFeed) {
        console.log('🔄 Triggering sync after coming back online');
        await window.baseCommand.getFeed(null, true); // Force refresh
      }
    } catch (error) {
      console.warn('Failed to sync after coming online:', error);
    }
  }

  /**
   * Format time since timestamp
   */
  formatTimeSince(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    return `${hours}h`;
  }

  /**
   * Subscribe to offline state changes
   */
  subscribe(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Unsubscribe from offline state changes
   */
  unsubscribe(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify callbacks of state changes
   */
  notifyCallbacks(state) {
    this.callbacks.forEach(callback => {
      try {
        callback(state, {
          isOffline: this.isOffline,
          lastOnlineTime: this.lastOnlineTime,
          retryCount: this.retryCount
        });
      } catch (error) {
        console.warn('Offline state callback error:', error);
      }
    });
  }

  /**
   * Get current offline state
   */
  getState() {
    return {
      isOffline: this.isOffline,
      lastOnlineTime: this.lastOnlineTime,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries
    };
  }

  /**
   * Manually set offline state (for testing)
   */
  setOfflineState(offline) {
    if (offline) {
      this.handleOffline();
    } else {
      this.handleOnline();
    }
  }

  /**
   * Destroy offline state manager
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    // Stop retry attempts
    this.stopRetryAttempts();
    
    // Hide offline screen
    this.hideOfflineScreen();
    
    // Clear callbacks
    this.callbacks = [];
  }
}

// Create global offline state manager
export const offlineStateManager = new OfflineStateManager();

/**
 * Quick setup function for apps
 */
export function setupOfflineState(config = {}) {
  offlineStateManager.initialize(config);
  return offlineStateManager;
}

/**
 * CSS styles for offline screen (can be added to app CSS)
 */
export const OFFLINE_SCREEN_CSS = `
/* Offline Screen Styles */
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
}

/* Animation keyframes */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.offline-screen > div {
  animation: fadeIn 0.3s ease;
}
`;

// Make available globally for browser console testing
if (typeof window !== 'undefined') {
  window.offlineStateManager = offlineStateManager;
  window.setupOfflineState = setupOfflineState;
}