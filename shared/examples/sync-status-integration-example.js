/**
 * Sync Status Integration Example
 * 
 * Demonstrates how to use the sync status system across Nullary apps
 * instead of confusing error messages.
 */

import { syncStatusManager, createSyncStatusBanner, SYNC_STATUS } from '../utils/sync-status.js';
import { enhanceBaseCommandWithSyncTracking } from '../utils/base-command-sync-integration.js';
import { createBaseScreenWithSync } from '../screens/base-screen-with-sync.js';

/**
 * Complete integration example for any Nullary app
 */
export class SyncStatusIntegrationExample {
  constructor() {
    this.feedContainer = null;
    this.baseScreen = null;
    this.pullToRefreshHandler = null;
  }

  /**
   * Initialize sync status integration in your app
   * Call this during app startup
   */
  async initialize() {
    console.log('🔄 Initializing sync status integration...');

    // 1. Enhance base command with sync tracking
    if (window.baseCommand) {
      window.baseCommand = enhanceBaseCommandWithSyncTracking(window.baseCommand);
      console.log('✅ Base command enhanced with sync tracking');
    }

    // 2. Set up pull-to-refresh with sync status banner
    this.setupPullToRefreshWithBanner();

    // 3. Create enhanced base screen
    this.setupEnhancedBaseScreen();

    // 4. Subscribe to sync status changes for global updates
    syncStatusManager.subscribe((status) => {
      this.handleSyncStatusChange(status);
    });

    console.log('✅ Sync status integration complete');
  }

  /**
   * Set up pull-to-refresh with sync status banner
   */
  setupPullToRefreshWithBanner() {
    // Find or create feed container
    this.feedContainer = document.getElementById('feed-container') || document.body;

    // Create banner container at the top
    let bannerContainer = document.getElementById('sync-banner-container');
    if (!bannerContainer) {
      bannerContainer = document.createElement('div');
      bannerContainer.id = 'sync-banner-container';
      bannerContainer.style.cssText = `
        position: sticky;
        top: 0;
        z-index: 1000;
        background: white;
        padding: 0 10px;
      `;
      this.feedContainer.insertBefore(bannerContainer, this.feedContainer.firstChild);
    }

    // Set up pull-to-refresh functionality
    this.setupPullToRefresh();

    // Show initial sync status
    this.updateSyncBanner();
  }

  /**
   * Set up pull-to-refresh gesture
   */
  setupPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let refreshTriggered = false;

    const pullToRefreshIndicator = document.createElement('div');
    pullToRefreshIndicator.id = 'pull-to-refresh-indicator';
    pullToRefreshIndicator.style.cssText = `
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      font-size: 14px;
      color: #666;
      transition: all 0.3s ease;
      z-index: 1001;
    `;
    pullToRefreshIndicator.textContent = '🔄 Pull to refresh';
    this.feedContainer.appendChild(pullToRefreshIndicator);

    // Touch events for mobile
    this.feedContainer.addEventListener('touchstart', (e) => {
      if (this.feedContainer.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
        refreshTriggered = false;
      }
    });

    this.feedContainer.addEventListener('touchmove', (e) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 0 && pullDistance < 120) {
        e.preventDefault();
        pullToRefreshIndicator.style.top = `${-60 + (pullDistance * 0.5)}px`;
        
        if (pullDistance > 80 && !refreshTriggered) {
          pullToRefreshIndicator.textContent = '⬆️ Release to refresh';
          refreshTriggered = true;
        } else if (pullDistance <= 80 && refreshTriggered) {
          pullToRefreshIndicator.textContent = '🔄 Pull to refresh';
          refreshTriggered = false;
        }
      }
    });

    this.feedContainer.addEventListener('touchend', () => {
      if (isPulling && refreshTriggered) {
        this.triggerRefreshWithStatusTracking();
      }
      
      isPulling = false;
      refreshTriggered = false;
      pullToRefreshIndicator.style.top = '-60px';
      pullToRefreshIndicator.textContent = '🔄 Pull to refresh';
    });

    // Keyboard shortcut for desktop
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.triggerRefreshWithStatusTracking();
      }
    });
  }

  /**
   * Trigger refresh with sync status tracking
   */
  async triggerRefreshWithStatusTracking() {
    console.log('🔄 Triggering refresh with sync status tracking...');

    try {
      // Update banner to show syncing state
      this.showSyncingBanner();

      // Trigger actual refresh through base command
      if (window.baseCommand && window.baseCommand.getFeed) {
        await window.baseCommand.getFeed(null, true); // Force refresh
      }

      // Update banner will happen automatically via sync status callback

    } catch (error) {
      console.error('Refresh failed:', error);
      
      // Show error state briefly
      this.showErrorBanner(error.message);
      
      // Revert to normal banner after 3 seconds
      setTimeout(() => {
        this.updateSyncBanner();
      }, 3000);
    }
  }

  /**
   * Show syncing banner
   */
  showSyncingBanner() {
    const bannerContainer = document.getElementById('sync-banner-container');
    if (!bannerContainer) return;

    bannerContainer.innerHTML = '';
    
    const syncingBanner = document.createElement('div');
    syncingBanner.style.cssText = `
      background-color: #3498db;
      color: white;
      padding: 8px 16px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      border-radius: 4px;
      margin: 8px 0;
      animation: pulse 1.5s ease-in-out infinite alternate;
    `;
    syncingBanner.innerHTML = '🔄 Syncing...';
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        from { opacity: 0.7; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    bannerContainer.appendChild(syncingBanner);
  }

  /**
   * Show error banner
   */
  showErrorBanner(message) {
    const bannerContainer = document.getElementById('sync-banner-container');
    if (!bannerContainer) return;

    bannerContainer.innerHTML = '';
    
    const errorBanner = document.createElement('div');
    errorBanner.style.cssText = `
      background-color: #e74c3c;
      color: white;
      padding: 8px 16px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      border-radius: 4px;
      margin: 8px 0;
    `;
    errorBanner.textContent = `❌ ${message}`;
    
    bannerContainer.appendChild(errorBanner);
  }

  /**
   * Update sync status banner
   */
  updateSyncBanner() {
    const bannerContainer = document.getElementById('sync-banner-container');
    if (!bannerContainer) return;

    const status = syncStatusManager.getStatus();
    
    bannerContainer.innerHTML = '';
    
    if (status.lastAttempt) {
      const banner = createSyncStatusBanner(status);
      bannerContainer.appendChild(banner);
    }
  }

  /**
   * Set up enhanced base screen
   */
  setupEnhancedBaseScreen() {
    // This would typically be called when navigating to the base screen
    // For demonstration, we'll create it but not add to DOM
    this.baseScreen = createBaseScreenWithSync({
      title: 'My Base Servers',
      showSyncStatus: true,
      autoRefresh: true,
      refreshInterval: 30000
    });

    // Example of how to initialize it
    // await this.baseScreen.initialize(window.baseCommand);
    // document.getElementById('base-screen-container').appendChild(this.baseScreen.element);
  }

  /**
   * Handle global sync status changes
   */
  handleSyncStatusChange(status) {
    console.log('🔄 Sync status changed:', status);

    // Update banner
    this.updateSyncBanner();

    // Update base screen if visible
    if (this.baseScreen) {
      this.baseScreen.updateSyncStatus(status);
    }

    // You could also update other UI elements here
    this.updateNavigationIndicators(status);
  }

  /**
   * Update navigation or other UI elements based on sync status
   */
  updateNavigationIndicators(status) {
    // Example: Update a navigation icon or badge
    const navBaseIcon = document.querySelector('.nav-base-icon');
    if (navBaseIcon) {
      // Remove existing status classes
      navBaseIcon.classList.remove('sync-success', 'sync-partial', 'sync-failed');

      // Add appropriate status class
      switch (status.status) {
        case SYNC_STATUS.SUCCESS:
          navBaseIcon.classList.add('sync-success');
          break;
        case SYNC_STATUS.PARTIAL:
          navBaseIcon.classList.add('sync-partial');
          break;
        case SYNC_STATUS.FAILED:
          navBaseIcon.classList.add('sync-failed');
          break;
      }
    }
  }

  /**
   * Simulate sync operations for testing
   */
  async simulateSync() {
    console.log('🧪 Simulating sync operations...');

    // Create mock bases
    const mockBases = [
      { id: 'base1', name: 'Dev Base', joined: true },
      { id: 'base2', name: 'Test Base', joined: true },
      { id: 'base3', name: 'Community Base', joined: false }
    ];

    // Start sync
    syncStatusManager.startSync(mockBases.filter(b => b.joined));

    // Simulate base sync results
    await new Promise(resolve => setTimeout(resolve, 1000));
    syncStatusManager.recordBaseSuccess(mockBases[0], { contentCount: 25 });

    await new Promise(resolve => setTimeout(resolve, 1000));
    syncStatusManager.recordBaseFailure(mockBases[1], 'Connection timeout');

    // Complete sync
    syncStatusManager.completSync();

    console.log('✅ Sync simulation complete');
  }

  /**
   * Clean up integration
   */
  destroy() {
    // Unsubscribe from sync status
    syncStatusManager.unsubscribe(this.handleSyncStatusChange);

    // Clean up base screen
    if (this.baseScreen) {
      this.baseScreen.destroy();
    }

    // Remove event listeners
    if (this.pullToRefreshHandler) {
      document.removeEventListener('keydown', this.pullToRefreshHandler);
    }
  }
}

/**
 * Quick setup function for easy integration
 */
export async function setupSyncStatusIntegration() {
  const integration = new SyncStatusIntegrationExample();
  await integration.initialize();
  return integration;
}

/**
 * Usage instructions and examples
 */
export function showSyncStatusUsage() {
  console.log(`
🔄 Sync Status Integration Usage
===============================

1. Basic Integration:
   import { setupSyncStatusIntegration } from './shared/examples/sync-status-integration-example.js';
   
   // During app initialization
   const syncIntegration = await setupSyncStatusIntegration();

2. Manual Integration:
   import { syncStatusManager, enhanceBaseCommandWithSyncTracking } from './shared/utils/sync-status.js';
   
   // Enhance base command
   window.baseCommand = enhanceBaseCommandWithSyncTracking(window.baseCommand);
   
   // Subscribe to status changes
   syncStatusManager.subscribe((status) => {
     console.log('Sync status:', status);
   });

3. Visual Indicators:
   - Green banner: All bases synced successfully
   - Yellow banner: Some bases failed (partial sync)
   - Red banner: All bases failed
   - Base borders: Red for unreachable, green for recently synced

4. Pull-to-Refresh:
   - Pull down on mobile to trigger sync
   - Ctrl+R (Cmd+R) on desktop to refresh
   - Shows sync progress with colored banners

5. Base Screen Integration:
   import { createBaseScreenWithSync } from './shared/screens/base-screen-with-sync.js';
   
   const baseScreen = createBaseScreenWithSync({
     showSyncStatus: true,
     autoRefresh: true
   });
   
   await baseScreen.initialize(window.baseCommand);

Benefits:
- No confusing error messages
- Visual sync status instead of technical errors
- Per-base reachability indicators
- Persistent sync history
- User-friendly feedback
  `);
}

// Auto-show usage if in browser console
if (typeof window !== 'undefined') {
  window.setupSyncStatusIntegration = setupSyncStatusIntegration;
  window.showSyncStatusUsage = showSyncStatusUsage;
  console.log('🔄 Sync Status Integration loaded. Run showSyncStatusUsage() for instructions.');
}

export default SyncStatusIntegrationExample;