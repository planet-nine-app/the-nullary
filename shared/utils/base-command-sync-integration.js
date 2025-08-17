/**
 * Base Command Sync Integration
 * 
 * Enhances base-command.js with proper sync status tracking per base.
 * Provides visual feedback instead of confusing error messages.
 */

import { syncStatusManager, SYNC_STATUS } from './sync-status.js';

/**
 * Enhance base command with sync status tracking
 * @param {Object} baseCommand - Base command instance to enhance
 * @returns {Object} Enhanced base command with sync tracking
 */
export function enhanceBaseCommandWithSyncTracking(baseCommand) {
  
  // Store original functions
  const originalGetFeed = baseCommand.getFeed;
  const originalGetContentFromDolores = baseCommand.getContentFromDolores || null;
  const originalGetContentFromSanora = baseCommand.getContentFromSanora || null;
  
  /**
   * Enhanced getFeed with per-base sync tracking
   */
  baseCommand.getFeed = async function(callback, forceRefresh = false) {
    const now = Date.now();
    
    if (!forceRefresh && baseCommand._feed?.length > 0 && (now - baseCommand.lastFeedRefresh) < baseCommand.LAST_FEED_THRESHOLD) {
      if (callback) callback(baseCommand._feed);
      return baseCommand._feed;
    }

    console.log('🔄 Starting feed sync with status tracking...');

    try {
      // Get all available bases
      const allBases = await baseCommand.getBases();
      if (!allBases) {
        throw new Error('No bases available');
      }

      // Filter to only joined bases
      const joinedBases = [];
      if (Array.isArray(allBases)) {
        joinedBases.push(...allBases.filter(base => base.joined === true));
      } else {
        Object.values(allBases).forEach(base => {
          if (base.joined === true) {
            joinedBases.push(base);
          }
        });
      }

      console.log(`📊 Starting sync for ${joinedBases.length} joined bases`);
      
      // Start sync tracking
      syncStatusManager.startSync(joinedBases);
      
      if (joinedBases.length === 0) {
        console.log('📦 No joined bases - returning empty feed');
        const emptyFeed = {
          textPosts: [],
          imagePosts: [],
          videoPosts: [],
          isEmpty: true,
          message: 'No bases joined. Join bases to see their content in your feed.',
          joinedBasesCount: 0
        };
        
        baseCommand._feed = emptyFeed;
        baseCommand.lastFeedRefresh = now;
        if (callback) callback(baseCommand._feed);
        return baseCommand._feed;
      }

      // Aggregate feed data from all joined bases
      let aggregatedFeed = {
        textPosts: [],
        imagePosts: [],
        videoPosts: [],
        joinedBasesCount: joinedBases.length,
        baseSources: []
      };

      // Process each joined base with individual sync tracking
      for (const base of joinedBases) {
        console.log(`🔍 Syncing base: ${base.name}`);
        
        try {
          // Add base to sources list
          aggregatedFeed.baseSources.push({
            name: base.name,
            dns: base.dns,
            joined: base.joined
          });

          // Track content counts before sync
          const beforeImageCount = aggregatedFeed.imagePosts.length;
          const beforeTextCount = aggregatedFeed.textPosts.length;
          const beforeVideoCount = aggregatedFeed.videoPosts.length;

          // Get content from this base's services
          await Promise.allSettled([
            getContentFromDoloresWithTracking(base, aggregatedFeed),
            getContentFromSanoraWithTracking(base, aggregatedFeed),
          ]);
          
          // Calculate content retrieved from this base
          const imageCount = aggregatedFeed.imagePosts.length - beforeImageCount;
          const textCount = aggregatedFeed.textPosts.length - beforeTextCount;
          const videoCount = aggregatedFeed.videoPosts.length - beforeVideoCount;
          const totalContent = imageCount + textCount + videoCount;
          
          // Record success for this base
          syncStatusManager.recordBaseSuccess(base, {
            contentCount: totalContent,
            imageCount,
            textCount,
            videoCount,
            syncTime: Date.now()
          });
          
          console.log(`✅ Base ${base.name} synced successfully: ${totalContent} items`);
          
        } catch (err) {
          console.warn(`❌ Failed to sync base ${base.name}:`, err);
          
          // Record failure for this base
          syncStatusManager.recordBaseFailure(base, err.message || 'Sync failed');
          
          // Continue with other bases even if one fails
        }
      }

      // Sort all content by timestamp (newest first)
      aggregatedFeed.imagePosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      aggregatedFeed.textPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      aggregatedFeed.videoPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      console.log(`✅ Feed sync complete: ${aggregatedFeed.imagePosts.length} images, ${aggregatedFeed.textPosts.length} text, ${aggregatedFeed.videoPosts.length} videos`);

      // Complete sync tracking
      syncStatusManager.completSync();

      baseCommand._feed = aggregatedFeed;
      baseCommand.lastFeedRefresh = now;
      
      if (callback) callback(baseCommand._feed);
      return baseCommand._feed;
      
    } catch (err) {
      console.error('Failed to aggregate feed from joined bases:', err);
      
      // Record failure for all bases if we couldn't even start
      try {
        const bases = await baseCommand.getBases();
        const basesArray = Array.isArray(bases) ? bases : Object.values(bases);
        const joinedBases = basesArray.filter(base => base.joined);
        
        joinedBases.forEach(base => {
          syncStatusManager.recordBaseFailure(base, err.message || 'Feed sync failed');
        });
        
        syncStatusManager.completSync();
      } catch (baseError) {
        console.warn('Could not record base failures:', baseError);
      }
      
      // Return empty feed with error info
      const errorFeed = {
        textPosts: [],
        imagePosts: [],
        videoPosts: [],
        error: err.message,
        isEmpty: true,
        message: 'Unable to connect to joined bases. Check your connection and try again.',
        joinedBasesCount: 0
      };
      
      baseCommand._feed = errorFeed;
      baseCommand.lastFeedRefresh = now;
      if (callback) callback(errorFeed);
      return errorFeed;
    }
  };

  /**
   * Enhanced getContentFromDolores with error tracking
   */
  async function getContentFromDoloresWithTracking(base, aggregatedFeed) {
    if (!base.dns || !base.dns.dolores) {
      console.log(`⏭️ Base ${base.name} has no Dolores service`);
      return;
    }

    try {
      // Use original function if available, otherwise implement
      if (originalGetContentFromDolores) {
        await originalGetContentFromDolores.call(baseCommand, base, aggregatedFeed);
      } else {
        // Fallback implementation
        const doloresUser = await window.__TAURI__.core.invoke('create_dolores_user', { 
          doloresUrl: base.dns.dolores 
        });
        
        const photoFeed = await window.__TAURI__.core.invoke('get_feed', {
          uuid: doloresUser.uuid,
          doloresUrl: base.dns.dolores,
          tags: base.soma?.photary || ['photos']
        });
        
        if (photoFeed && photoFeed.length > 0) {
          const baseImages = photoFeed.map(item => ({
            uuid: item.uuid || baseCommand.generateId(),
            title: item.title || '',
            description: item.description || '',
            images: item.images || [item.url],
            timestamp: item.timestamp || Date.now(),
            author: item.author || 'Anonymous',
            baseName: base.name,
            baseSource: 'dolores'
          }));
          
          aggregatedFeed.imagePosts.push(...baseImages);
          console.log(`📸 Added ${baseImages.length} images from ${base.name} via Dolores`);
        }
      }
      
    } catch (err) {
      console.warn(`Failed to get Dolores content from ${base.name}:`, err);
      throw err; // Re-throw to be caught by base sync tracking
    }
  }

  /**
   * Enhanced getContentFromSanora with error tracking
   */
  async function getContentFromSanoraWithTracking(base, aggregatedFeed) {
    if (!base.dns || !base.dns.sanora) {
      console.log(`⏭️ Base ${base.name} has no Sanora service`);
      return;
    }

    try {
      // Use original function if available, otherwise implement
      if (originalGetContentFromSanora) {
        await originalGetContentFromSanora.call(baseCommand, base, aggregatedFeed);
      } else {
        // Fallback implementation
        const sanoraUser = await window.__TAURI__.core.invoke('create_sanora_user', { 
          sanoraUrl: base.dns.sanora 
        });
        
        const userData = await window.__TAURI__.core.invoke('get_sanora_user', {
          uuid: sanoraUser.uuid,
          sanoraUrl: base.dns.sanora
        });
        
        if (userData.products && userData.products.length > 0) {
          const blogPosts = userData.products
            .filter(product => product.tags && product.tags.some(tag => tag.toLowerCase().includes('blog')))
            .map(product => ({
              uuid: product.uuid || baseCommand.generateId(),
              title: product.title || 'Untitled',
              description: product.description || '',
              content: product.description,
              timestamp: product.created_at ? new Date(product.created_at).getTime() : Date.now(),
              author: 'Blogger',
              baseName: base.name,
              baseSource: 'sanora',
              price: product.price
            }));
          
          aggregatedFeed.textPosts.push(...blogPosts);
          console.log(`📝 Added ${blogPosts.length} blog posts from ${base.name} via Sanora`);
        }
      }
      
    } catch (err) {
      console.warn(`Failed to get Sanora content from ${base.name}:`, err);
      throw err; // Re-throw to be caught by base sync tracking
    }
  }

  return baseCommand;
}

/**
 * Apply sync status integration to base-command.js
 * Call this once when your app initializes
 */
export function applySyncStatusToBaseCommand() {
  if (window.baseCommand) {
    window.baseCommand = enhanceBaseCommandWithSyncTracking(window.baseCommand);
    console.log('✅ Base command enhanced with sync status tracking');
  } else {
    console.warn('⚠️ window.baseCommand not found - sync status integration skipped');
  }
}

// Auto-apply if baseCommand is already available
if (typeof window !== 'undefined' && window.baseCommand) {
  applySyncStatusToBaseCommand();
}