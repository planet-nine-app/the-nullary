/**
 * Offline State Integration Example
 * 
 * Demonstrates how to add offline state management to Nullary apps.
 * Shows a clean offline screen instead of broken functionality when offline.
 */

import { offlineStateManager, setupOfflineState, OFFLINE_SCREEN_CSS } from '../utils/offline-state.js';
import { syncStatusManager } from '../utils/sync-status.js';

/**
 * Complete offline state integration example
 */
export class OfflineStateIntegrationExample {
  constructor() {
    this.initialized = false;
    this.statusIndicator = null;
  }

  /**
   * Initialize offline state management in your app
   */
  async initialize(config = {}) {
    if (this.initialized) return;
    
    console.log('📴 Initializing offline state management...');

    // 1. Set up offline state manager
    const offlineConfig = {
      showOfflineScreen: true,
      autoRetry: true,
      retryInterval: 10000, // 10 seconds
      maxRetries: 5,
      persistLastState: true,
      ...config
    };

    setupOfflineState(offlineConfig);

    // 2. Add CSS styles
    this.addOfflineCSS();

    // 3. Set up status indicator in navigation
    this.setupNavigationIndicator();

    // 4. Subscribe to offline state changes
    offlineStateManager.subscribe((state, details) => {
      this.handleOfflineStateChange(state, details);
    });

    // 5. Integrate with sync status
    this.integratWithSyncStatus();

    this.initialized = true;
    console.log('✅ Offline state management initialized');
  }

  /**
   * Add CSS styles for offline screen
   */
  addOfflineCSS() {
    // Check if CSS is already added
    if (document.querySelector('#offline-state-css')) return;

    const style = document.createElement('style');
    style.id = 'offline-state-css';
    style.textContent = OFFLINE_SCREEN_CSS;
    document.head.appendChild(style);
  }

  /**
   * Set up navigation indicator
   */
  setupNavigationIndicator() {
    // Create a small offline indicator that can be added to navigation
    this.statusIndicator = document.createElement('div');
    this.statusIndicator.id = 'offline-status-indicator';
    this.statusIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #27ae60;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      z-index: 1001;
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    this.statusIndicator.textContent = '🌐 Online';
    
    // Add to page (hidden initially)
    this.statusIndicator.style.opacity = '0';
    document.body.appendChild(this.statusIndicator);
    
    // Show briefly on load
    setTimeout(() => {
      this.statusIndicator.style.opacity = '1';
      setTimeout(() => {
        this.statusIndicator.style.opacity = '0';
      }, 2000);
    }, 1000);
  }

  /**
   * Handle offline state changes
   */
  handleOfflineStateChange(state, details) {
    console.log(`📶 Network state changed: ${state}`, details);

    // Update navigation indicator
    this.updateNavigationIndicator(state, details);

    // Handle app-specific offline/online logic
    if (state === 'offline') {
      this.handleGoingOffline(details);
    } else if (state === 'online') {
      this.handleComingOnline(details);
    }
  }

  /**
   * Update navigation indicator
   */
  updateNavigationIndicator(state, details) {
    if (!this.statusIndicator) return;

    if (state === 'offline') {
      this.statusIndicator.style.background = '#e74c3c';
      this.statusIndicator.textContent = '📴 Offline';
      this.statusIndicator.style.opacity = '1';
    } else {
      this.statusIndicator.style.background = '#27ae60';
      this.statusIndicator.textContent = '🌐 Online';
      this.statusIndicator.style.opacity = '1';
      
      // Hide after showing "back online" briefly
      setTimeout(() => {
        this.statusIndicator.style.opacity = '0';
      }, 3000);
    }
  }

  /**
   * Handle going offline
   */
  handleGoingOffline(details) {
    console.log('📴 App went offline, implementing offline behavior...');

    // Disable network-dependent features
    this.disableNetworkFeatures();
    
    // Enable offline mode for existing content
    this.enableOfflineMode();
    
    // Save current state
    this.saveOfflineState();
  }

  /**
   * Handle coming back online
   */
  handleComingOnline(details) {
    console.log('🌐 App came back online, resuming normal operation...');

    // Re-enable network features
    this.enableNetworkFeatures();
    
    // Disable offline mode
    this.disableOfflineMode();
    
    // Trigger content refresh
    this.triggerContentRefresh();
  }

  /**
   * Disable network-dependent features
   */
  disableNetworkFeatures() {
    // Disable buttons that require network
    const networkButtons = document.querySelectorAll('[data-requires-network]');
    networkButtons.forEach(button => {
      button.disabled = true;
      button.dataset.originalTitle = button.title || '';
      button.title = 'Requires internet connection';
    });

    // Add offline indicators to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const offlineNote = document.createElement('div');
      offlineNote.className = 'offline-form-note';
      offlineNote.style.cssText = `
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        margin-bottom: 10px;
      `;
      offlineNote.textContent = '⚠️ You are offline. Form submissions will be saved locally.';
      form.insertBefore(offlineNote, form.firstChild);
    });
  }

  /**
   * Enable network features
   */
  enableNetworkFeatures() {
    // Re-enable network buttons
    const networkButtons = document.querySelectorAll('[data-requires-network]');
    networkButtons.forEach(button => {
      button.disabled = false;
      button.title = button.dataset.originalTitle || '';
    });

    // Remove offline form notes
    const offlineNotes = document.querySelectorAll('.offline-form-note');
    offlineNotes.forEach(note => note.remove());
  }

  /**
   * Enable offline mode for content viewing
   */
  enableOfflineMode() {
    // Add offline mode indicator to content areas
    const contentAreas = document.querySelectorAll('[data-content-area]');
    contentAreas.forEach(area => {
      const offlineIndicator = document.createElement('div');
      offlineIndicator.className = 'offline-content-indicator';
      offlineIndicator.style.cssText = `
        background: #e3f2fd;
        border-left: 4px solid #2196f3;
        padding: 12px;
        margin: 10px 0;
        font-size: 14px;
        color: #1976d2;
      `;
      offlineIndicator.innerHTML = `
        📱 <strong>Offline Mode</strong> - Showing cached content only
      `;
      area.insertBefore(offlineIndicator, area.firstChild);
    });
  }

  /**
   * Disable offline mode
   */
  disableOfflineMode() {
    // Remove offline content indicators
    const offlineIndicators = document.querySelectorAll('.offline-content-indicator');
    offlineIndicators.forEach(indicator => indicator.remove());
  }

  /**
   * Save current state for offline use
   */
  saveOfflineState() {
    try {
      const currentState = {
        timestamp: Date.now(),
        url: window.location.href,
        scrollPosition: window.scrollY,
        formData: this.captureFormData()
      };
      
      localStorage.setItem('nullary-offline-state', JSON.stringify(currentState));
      console.log('💾 Offline state saved');
    } catch (error) {
      console.warn('Failed to save offline state:', error);
    }
  }

  /**
   * Capture form data for offline storage
   */
  captureFormData() {
    const formData = {};
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form, index) => {
      const data = new FormData(form);
      formData[`form_${index}`] = Object.fromEntries(data.entries());
    });
    
    return formData;
  }

  /**
   * Trigger content refresh when back online
   */
  async triggerContentRefresh() {
    try {
      // Wait for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh content through base command if available
      if (window.baseCommand && window.baseCommand.getFeed) {
        console.log('🔄 Refreshing content after coming back online');
        await window.baseCommand.getFeed(null, true);
      }
      
      // Show success message
      this.showOnlineMessage();
      
    } catch (error) {
      console.warn('Failed to refresh content after coming online:', error);
    }
  }

  /**
   * Show brief "back online" message
   */
  showOnlineMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    message.textContent = '🌐 Back online - Content refreshed';
    
    document.body.appendChild(message);
    
    // Animate in
    setTimeout(() => {
      message.style.opacity = '1';
      message.style.transform = 'translateY(-10px)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transform = 'translateY(0)';
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Integrate with sync status system
   */
  integratWithSyncStatus() {
    // Subscribe to sync status to provide better offline context
    syncStatusManager.subscribe((syncStatus) => {
      if (offlineStateManager.isOffline) {
        // Update offline screen with sync status if it's showing
        const offlineScreen = document.querySelector('.offline-screen');
        if (offlineScreen) {
          this.updateOfflineScreenWithSyncStatus(offlineScreen, syncStatus);
        }
      }
    });
  }

  /**
   * Update offline screen with sync status information
   */
  updateOfflineScreenWithSyncStatus(offlineScreen, syncStatus) {
    const lastSyncContainer = offlineScreen.querySelector('[data-last-sync]');
    if (!lastSyncContainer) return;

    if (syncStatus.lastSuccess) {
      const timeSince = this.formatTimeSince(syncStatus.lastSuccess);
      lastSyncContainer.innerHTML = `
        <div style="color: #27ae60; font-weight: 500;">
          ✅ Last synced ${timeSince}
        </div>
        <div style="color: #666; font-size: 12px; margin-top: 4px;">
          ${syncStatus.successfulBases || 0} of ${syncStatus.totalBases || 0} bases were reachable
        </div>
      `;
    }
  }

  /**
   * Format time since timestamp
   */
  formatTimeSince(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  /**
   * Simulate offline state for testing
   */
  simulateOffline() {
    console.log('🧪 Simulating offline state...');
    offlineStateManager.setOfflineState(true);
  }

  /**
   * Simulate online state for testing
   */
  simulateOnline() {
    console.log('🧪 Simulating online state...');
    offlineStateManager.setOfflineState(false);
  }

  /**
   * Get current offline state
   */
  getOfflineState() {
    return offlineStateManager.getState();
  }

  /**
   * Destroy offline state integration
   */
  destroy() {
    // Unsubscribe from offline state changes
    offlineStateManager.unsubscribe(this.handleOfflineStateChange);
    
    // Remove status indicator
    if (this.statusIndicator && this.statusIndicator.parentNode) {
      this.statusIndicator.parentNode.removeChild(this.statusIndicator);
    }
    
    // Remove CSS
    const cssElement = document.querySelector('#offline-state-css');
    if (cssElement) {
      cssElement.remove();
    }
    
    this.initialized = false;
    console.log('🧹 Offline state integration destroyed');
  }
}

/**
 * Quick setup function for easy integration
 */
export async function setupOfflineStateIntegration(config = {}) {
  const integration = new OfflineStateIntegrationExample();
  await integration.initialize(config);
  return integration;
}

/**
 * Usage instructions
 */
export function showOfflineStateUsage() {
  console.log(`
📴 Offline State Integration Usage
=================================

1. Basic Integration:
   import { setupOfflineStateIntegration } from '../shared/examples/offline-state-example.js';
   
   // During app initialization
   const offlineIntegration = await setupOfflineStateIntegration();

2. Custom Configuration:
   const offlineIntegration = await setupOfflineStateIntegration({
     showOfflineScreen: true,
     autoRetry: true,
     retryInterval: 10000,  // 10 seconds
     maxRetries: 5
   });

3. Manual Control:
   import { offlineStateManager } from '../shared/utils/offline-state.js';
   
   // Subscribe to state changes
   offlineStateManager.subscribe((state, details) => {
     console.log('Network state:', state, details);
   });
   
   // Check current state
   const isOffline = offlineStateManager.getState().isOffline;

4. Testing:
   // Simulate offline state
   window.offlineIntegration.simulateOffline();
   
   // Simulate back online
   window.offlineIntegration.simulateOnline();

Features:
- Clean offline screen instead of broken functionality
- Automatic retry attempts with backoff
- Network-dependent feature disabling
- Last sync time display
- Integration with sync status system
- Responsive design for mobile and desktop

Benefits:
- Apps remain usable when offline
- Clear communication about network state
- Automatic recovery when back online
- Cached content remains accessible
- No broken functionality or error dialogs
  `);
}

// Make available globally for browser console testing
if (typeof window !== 'undefined') {
  window.setupOfflineStateIntegration = setupOfflineStateIntegration;
  window.showOfflineStateUsage = showOfflineStateUsage;
  window.OfflineStateIntegrationExample = OfflineStateIntegrationExample;
  
  console.log('📴 Offline State Integration loaded. Run showOfflineStateUsage() for instructions.');
}

export default OfflineStateIntegrationExample;