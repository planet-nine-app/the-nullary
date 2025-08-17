/**
 * MASTER Base Command Service - Shared across all Nullary apps
 * Handles base server interactions with enhanced environment detection
 * 
 * Last Updated: January 2025
 * Used by: mybase, screenary, idothis, etc.
 */

const { invoke } = window.__TAURI__.core;
const { create, mkdir, readTextFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs;

const LAST_FEED_THRESHOLD = 600000; // 10 minutes
const LAST_BASE_THRESHOLD = 600000; // 10 minutes

let bases;
let lastBaseRefresh = 0;
let bdoUser;
let doloresUser;
let _feed = [];
let lastFeedRefresh = 0;

/**
 * Get service URL with enhanced environment detection
 * Uses multiple fallback methods for maximum compatibility
 */
function getBaseServiceUrl(service) {
  if (window.PlanetNineEnvironment) {
    const url = window.PlanetNineEnvironment.getServiceUrl(service);
    console.log(`🔧 base-command.js using PlanetNineEnvironment: service=${service}, url=${url}`);
    return url;
  }
  
  // Fallback to getServiceUrl if available
  if (window.getServiceUrl) {
    const url = window.getServiceUrl(service);
    console.log(`🔧 base-command.js using getServiceUrl fallback: service=${service}, url=${url}`);
    return url;
  }
  
  // Last resort fallback
  console.warn('🚨 No environment configuration available, using dev fallback');
  return service === 'dolores' ? 'https://dev.dolores.allyabase.com/' : 'https://dev.bdo.allyabase.com/';
}

/**
 * Get dynamic devBase with current environment URLs
 * Creates a base configuration using the current environment settings
 */
function getDevBase() {
  const bdoUrl = getBaseServiceUrl('bdo');
  const doloresUrl = getBaseServiceUrl('dolores');
  
  console.log(`🏠 Creating devBase with dynamic URLs: bdo=${bdoUrl}, dolores=${doloresUrl}`);
  
  return {
    name: 'DEV',
    description: 'Development base for testing. Automatically adapts to current environment.',
    location: {
      latitude: 36.788,
      longitude: -119.417,
      postalCode: '94102'
    },
    soma: {
      lexary: ['development', 'testing', 'planet-nine'],
      photary: ['screenshots', 'mockups', 'development'],
      viewary: ['demos', 'tutorials', 'development']
    },
    dns: {
      bdo: bdoUrl,
      dolores: doloresUrl
    },
    joined: true
  };
}

/**
 * Get home base configuration
 * Uses dynamic base with current environment URLs instead of file storage
 * @returns {Object} Home base configuration
 */
async function getHomeBase() {
  // Always use dynamic base with current environment URLs
  // This avoids file permission issues and ensures environment switches work immediately
  const dynamicBase = getDevBase();
  console.log('🆕 Using dynamic base with current environment URLs:', dynamicBase.dns);
  return dynamicBase;
}

/**
 * Save home base configuration
 * @param {Object} base - Base configuration to save
 */
async function saveHomeBase(base) {
  try {
    await mkdir('bases', { baseDir: BaseDirectory.AppCache, recursive: true });
    await writeTextFile('bases/home.json', JSON.stringify(base, null, 2), { baseDir: BaseDirectory.AppCache });
  } catch (err) {
    console.error('Failed to save home base:', err);
  }
}

/**
 * Enhanced base connection functionality
 * Connects to all services for a given base
 */
async function connectToBase(_base) {
  let base = JSON.parse(JSON.stringify(_base));
  for(var service in base.dns) {
    if(base.users && base.users[service] && base.users[service].uuid) {
      continue;
    }

    try {
      const result = await invoke('connect_to_service', {
        serviceUrl: base.dns[service],
        serviceName: service
      });
      
      if(!base.users) {
        base.users = {};
      }
      base.users[service] = result;
    } catch(err) {
      console.warn(`Failed to connect to ${service} at ${base.dns[service]}:`, err);
    }
  }

  return base;
}

/**
 * Fetch and save bases from BDO
 * Enhanced implementation from MyBase
 */
async function fetchAndSaveBases() {
  let homeBase = await getHomeBase();
  try {
    let bdoUser = homeBase.users && homeBase.users.bdo;
    if(!bdoUser) {
      homeBase = await connectToHomeBase();
      console.log('Connected homeBase:', homeBase);
      bdoUser = homeBase.users && homeBase.users.bdo;
    }
    let doloresUser = homeBase.users && homeBase.users.dolores;
    let bdoUrl = homeBase.dns && homeBase.dns.bdo;
    if(bdoUrl[bdoUrl.length - 1] !== '/') {
      bdoUrl += '/';
    }
    let updatedBases = await invoke('get_bases_from_bdo', {uuid: bdoUser.uuid, bdoUrl});

    for(var baseId in updatedBases) {
      updatedBases[baseId] = await connectToBase(updatedBases[baseId]);
      updatedBases[baseId].uuid = baseId;
    }

    // Skip file operations to avoid permission issues
    // In production, this would cache bases for performance
    const allBases = updatedBases;
    console.log('💾 Updated bases would be cached here (skipping due to permissions):', Object.keys(allBases));

    return allBases;
  } catch(err) {
    console.error('Base discovery failed, using fallback:', err);
    await connectToHomeBase();
    return { dev: getDevBase() };
  }
}

/**
 * Connect to home base
 * Enhanced implementation from MyBase
 */
async function connectToHomeBase() {
  try {    
    let homeBase = await getHomeBase();
    if(!homeBase.users) {
      homeBase = await connectToBase(homeBase);
      console.log('Connected to home base:', homeBase);
    }

    if(!bases) {
      bases = {};
    }

    const localId = Math.random() * 100000 + '';
    homeBase.localId = localId;
    bases[localId] = homeBase;

    try {
      await mkdir('', {baseDir: BaseDirectory.AppCache});
    } catch(err) { 
      console.log('Cache dir exists:', err);
    }

    try {
      await mkdir('bases', {baseDir: BaseDirectory.AppCache});
    } catch(err) { 
      console.log('Bases dir exists:', err);
    }

    // Skip saving bases to file to avoid permission issues
    // In production, this would save to cache for performance
    console.log('💾 Bases would be cached here (skipping due to permissions):', Object.keys(bases));

    return homeBase;
  } catch(err) {
    console.warn('Failed to connect to home base:', err);
    return getDevBase();
  }
}

/**
 * Get all available bases
 * Enhanced implementation combining both approaches
 * @param {boolean} forceRefresh - Force refresh from server
 * @returns {Array|Object} Array of base configurations or object with base IDs
 */
async function getBases(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && bases && (now - lastBaseRefresh) < LAST_BASE_THRESHOLD) {
    return bases;
  }

  console.log('Base refresh check - now:', now, 'lastRefresh:', lastBaseRefresh, 'threshold:', LAST_BASE_THRESHOLD);

  try {
    // Try BDO-based discovery first (MyBase pattern)
    const discoveredBases = await fetchAndSaveBases();
    if (discoveredBases && Object.keys(discoveredBases).length > 0) {
      bases = discoveredBases;
      lastBaseRefresh = now;
      console.log('Discovered bases:', bases);
      return bases;
    }

    // Fallback to simple backend call (original pattern)
    const result = await invoke('get_bases');
    if (result && result.length > 0) {
      bases = result;
    } else {
      // Final fallback to dev base
      bases = [getDevBase()];
    }
    
    lastBaseRefresh = now;
    return bases;
  } catch (err) {
    console.warn('Failed to get bases from backend, using dev base:', err);
    bases = [getDevBase()];
    lastBaseRefresh = now;
    return bases;
  }
}

/**
 * Join a base (local-only operation)
 * Updates the joined status for a base in local storage and memory
 * @param {Object|string} base - Base object or base name/ID
 * @returns {boolean} Success status
 */
async function joinBase(base) {
  try {
    console.log('🔗 Joining base:', typeof base === 'string' ? base : base.name);
    
    let targetBase = null;
    
    // Find the base to join
    if (typeof base === 'string') {
      // Find base by name or ID
      if (bases) {
        if (Array.isArray(bases)) {
          targetBase = bases.find(b => b.name === base || b.id === base);
        } else {
          // Object-based bases (MyBase pattern)
          targetBase = bases[base] || Object.values(bases).find(b => b.name === base);
        }
      }
      
      if (!targetBase) {
        console.warn('Base not found:', base);
        return false;
      }
    } else {
      // Use provided base object
      targetBase = base;
    }

    // Update joined status locally
    targetBase.joined = true;
    
    // Update in bases collection
    if (bases) {
      if (Array.isArray(bases)) {
        const existingBase = bases.find(b => b.name === targetBase.name);
        if (existingBase) {
          existingBase.joined = true;
        }
      } else {
        // Object-based bases (MyBase pattern)
        for (let baseId in bases) {
          if (bases[baseId].name === targetBase.name) {
            bases[baseId].joined = true;
          }
        }
      }
    }
    
    // Save to local storage (if this becomes the home base)
    try {
      await saveHomeBase(targetBase);
    } catch (err) {
      console.warn('Could not save home base (non-critical):', err);
    }
    
    console.log('✅ Successfully joined base:', targetBase.name);
    return true;
    
  } catch (err) {
    console.error('Failed to join base:', err);
    return false;
  }
}

/**
 * Leave a base (local-only operation)
 * Updates the joined status for a base in local storage and memory
 * @param {Object|string} base - Base object or base name/ID
 * @returns {boolean} Success status
 */
async function leaveBase(base) {
  try {
    console.log('🔗 Leaving base:', typeof base === 'string' ? base : base.name);
    
    let targetBase = null;
    
    // Find the base to leave
    if (typeof base === 'string') {
      // Find base by name or ID
      if (bases) {
        if (Array.isArray(bases)) {
          targetBase = bases.find(b => b.name === base || b.id === base);
        } else {
          // Object-based bases (MyBase pattern)
          targetBase = bases[base] || Object.values(bases).find(b => b.name === base);
        }
      }
      
      if (!targetBase) {
        console.warn('Base not found:', base);
        return false;
      }
    } else {
      // Use provided base object
      targetBase = base;
    }

    // Update joined status locally
    targetBase.joined = false;
    
    // Update in bases collection
    if (bases) {
      if (Array.isArray(bases)) {
        const existingBase = bases.find(b => b.name === targetBase.name);
        if (existingBase) {
          existingBase.joined = false;
        }
      } else {
        // Object-based bases (MyBase pattern)
        for (let baseId in bases) {
          if (bases[baseId].name === targetBase.name) {
            bases[baseId].joined = false;
          }
        }
      }
    }
    
    // If this was the home base, switch to dev base
    try {
      const homeBase = await getHomeBase();
      if (homeBase && homeBase.name === targetBase.name) {
        console.log('🏠 Leaving home base, switching to dev base');
        await saveHomeBase(getDevBase());
      }
    } catch (err) {
      console.warn('Could not update home base (non-critical):', err);
    }
    
    console.log('✅ Successfully left base:', targetBase.name);
    return true;
    
  } catch (err) {
    console.error('Failed to leave base:', err);
    return false;
  }
}

/**
 * Get feed from joined bases only
 * Aggregates content from all bases where joined = true
 * @param {Function} callback - Callback function to handle feed data
 * @param {boolean} forceRefresh - Force refresh from server
 * @returns {Object} Feed data from joined bases
 */
async function getFeed(callback, forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && _feed.length > 0 && (now - lastFeedRefresh) < LAST_FEED_THRESHOLD) {
    if (callback) callback(_feed);
    return _feed;
  }

  console.log('🔄 Aggregating content from joined bases...');

  try {
    // Get all available bases
    const allBases = await getBases();
    if (!allBases) {
      throw new Error('No bases available');
    }

    // Filter to only joined bases
    const joinedBases = [];
    if (Array.isArray(allBases)) {
      joinedBases.push(...allBases.filter(base => base.joined === true));
    } else {
      // Object-based bases (MyBase pattern)
      Object.values(allBases).forEach(base => {
        if (base.joined === true) {
          joinedBases.push(base);
        }
      });
    }

    console.log(`📊 Found ${joinedBases.length} joined bases for content aggregation`);
    
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
      
      _feed = emptyFeed;
      lastFeedRefresh = now;
      if (callback) callback(_feed);
      return _feed;
    }

    // Aggregate feed data from all joined bases
    let aggregatedFeed = {
      textPosts: [],
      imagePosts: [],
      videoPosts: [],
      joinedBasesCount: joinedBases.length,
      baseSources: []
    };

    // Process each joined base
    for (const base of joinedBases) {
      console.log(`🔍 Getting content from joined base: ${base.name}`);
      
      try {
        // Add base to sources list
        aggregatedFeed.baseSources.push({
          name: base.name,
          dns: base.dns,
          joined: base.joined
        });

        // Get content from this base's services
        await Promise.allSettled([
          getContentFromDolores(base, aggregatedFeed),
          getContentFromSanora(base, aggregatedFeed),
          // Add other content sources as needed
        ]);
        
      } catch (err) {
        console.warn(`Failed to get content from base ${base.name}:`, err);
        // Continue with other bases even if one fails
      }
    }

    // Sort all content by timestamp (newest first)
    aggregatedFeed.imagePosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    aggregatedFeed.textPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    aggregatedFeed.videoPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    console.log(`✅ Content aggregation complete: ${aggregatedFeed.imagePosts.length} images, ${aggregatedFeed.textPosts.length} text, ${aggregatedFeed.videoPosts.length} videos`);

    _feed = aggregatedFeed;
    lastFeedRefresh = now;
    
    if (callback) callback(_feed);
    return _feed;
    
  } catch (err) {
    console.error('Failed to aggregate feed from joined bases:', err);
    
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
    
    _feed = errorFeed;
    lastFeedRefresh = now;
    if (callback) callback(errorFeed);
    return errorFeed;
  }
}

/**
 * Get content from a base's Dolores service
 * @param {Object} base - Base configuration
 * @param {Object} aggregatedFeed - Feed object to append content to
 */
async function getContentFromDolores(base, aggregatedFeed) {
  if (!base.dns || !base.dns.dolores) {
    console.log(`⏭️ Base ${base.name} has no Dolores service`);
    return;
  }

  try {
    // Create Dolores user for this base if needed
    const doloresUser = await invoke('create_dolores_user', { 
      doloresUrl: base.dns.dolores 
    });
    
    // Get photo feed from this base's Dolores
    const photoFeed = await invoke('get_feed', {
      uuid: doloresUser.uuid,
      doloresUrl: base.dns.dolores,
      tags: base.soma?.photary || ['photos']
    });
    
    if (photoFeed && photoFeed.length > 0) {
      const baseImages = photoFeed.map(item => ({
        uuid: item.uuid || generateId(),
        title: item.title || '',
        description: item.description || '',
        images: item.images || [item.url],
        timestamp: item.timestamp || Date.now(),
        author: item.author || 'Anonymous',
        baseName: base.name,
        baseSource: 'dolores'
      }));
      
      aggregatedFeed.imagePosts.push(...baseImages);
      console.log(`📸 Added ${baseImages.length} images from ${base.name}`);
    }
    
  } catch (err) {
    console.warn(`Failed to get Dolores content from ${base.name}:`, err);
  }
}

/**
 * Get content from a base's Sanora service
 * @param {Object} base - Base configuration  
 * @param {Object} aggregatedFeed - Feed object to append content to
 */
async function getContentFromSanora(base, aggregatedFeed) {
  if (!base.dns || !base.dns.sanora) {
    console.log(`⏭️ Base ${base.name} has no Sanora service`);
    return;
  }

  try {
    // Create Sanora user for this base if needed
    const sanoraUser = await invoke('create_sanora_user', { 
      sanoraUrl: base.dns.sanora 
    });
    
    // Get products/content from this base's Sanora
    const userData = await invoke('get_sanora_user', {
      uuid: sanoraUser.uuid,
      sanoraUrl: base.dns.sanora
    });
    
    if (userData.products && userData.products.length > 0) {
      // Filter for blog-type content
      const blogPosts = userData.products
        .filter(product => product.tags && product.tags.some(tag => tag.toLowerCase().includes('blog')))
        .map(product => ({
          uuid: product.uuid || generateId(),
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
      console.log(`📝 Added ${blogPosts.length} blog posts from ${base.name}`);
    }
    
  } catch (err) {
    console.warn(`Failed to get Sanora content from ${base.name}:`, err);
  }
}

/**
 * Create professional empty state for photo feeds
 * @returns {Array} Empty array - apps should handle empty state display
 */
function createEmptyPhotoFeed() {
  return [];
}

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
}

/**
 * Refresh feed data
 * @param {Function} callback - Callback function
 * @returns {Object} Fresh feed data
 */
async function refreshFeed(callback) {
  return await getFeed(callback, true);
}

/**
 * Get specific feed type
 * @param {string} type - Feed type ('photos', 'videos', 'text')
 * @param {Function} callback - Callback function
 * @returns {Array} Feed items
 */
async function getFeedByType(type, callback) {
  const feed = await getFeed();
  
  let items = [];
  switch (type) {
    case 'photos':
    case 'photary':
      items = feed.imagePosts || [];
      break;
    case 'videos':
    case 'viewary':
      items = feed.videoPosts || [];
      break;
    case 'text':
    case 'lexary':
      items = feed.textPosts || [];
      break;
    default:
      items = [...(feed.imagePosts || []), ...(feed.videoPosts || []), ...(feed.textPosts || [])];
  }
  
  if (callback) callback(items);
  return items;
}

// Export the base command interface
const baseCommand = {
  // Base management
  getBases,
  getHomeBase,
  saveHomeBase,
  joinBase,
  leaveBase,
  
  // Enhanced base management from MyBase
  connectToBase,
  connectToHomeBase,
  fetchAndSaveBases,
  
  // Feed management
  getFeed,
  refreshFeed,
  getFeedByType,
  
  // Utilities
  generateId
};

// For MyBase compatibility - also export as window.baseCommand
if (typeof window !== 'undefined') {
  window.baseCommand = baseCommand;
}

export default baseCommand;