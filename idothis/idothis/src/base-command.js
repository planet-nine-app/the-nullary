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
 * Join a base
 * Enhanced implementation supporting both object and string parameters
 * @param {Object|string} base - Base object or base name
 * @returns {boolean} Success status
 */
async function joinBase(base) {
  try {
    // Support both base object and base name
    if (typeof base === 'string') {
      const result = await invoke('join_base', { baseName: base });
      if (result && result.success) {
        // Refresh bases list
        lastBaseRefresh = 0;
        bases = null;
        await getBases();
        return true;
      }
      return false;
    }

    // Original object-based approach
    base.joined = true;
    await saveHomeBase(base);
    
    // Update bases array/object
    if (bases) {
      if (Array.isArray(bases)) {
        const existingBase = bases.find(b => b.name === base.name);
        if (existingBase) {
          existingBase.joined = true;
        }
      } else {
        // Object-based bases (MyBase pattern)
        for (let baseId in bases) {
          if (bases[baseId].name === base.name) {
            bases[baseId].joined = true;
          }
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Failed to join base:', err);
    return false;
  }
}

/**
 * Leave a base
 * Enhanced implementation supporting both object and string parameters
 * @param {Object|string} base - Base object or base name
 * @returns {boolean} Success status
 */
async function leaveBase(base) {
  try {
    // Support both base object and base name
    if (typeof base === 'string') {
      const result = await invoke('leave_base', { baseName: base });
      if (result && result.success) {
        // Refresh bases list
        lastBaseRefresh = 0;
        bases = null;
        await getBases();
        return true;
      }
      return false;
    }

    // Original object-based approach
    base.joined = false;
    
    // If this was the home base, clear it
    const homeBase = await getHomeBase();
    if (homeBase && homeBase.name === base.name) {
      await saveHomeBase(getDevBase());
    }
    
    // Update bases array/object
    if (bases) {
      if (Array.isArray(bases)) {
        const existingBase = bases.find(b => b.name === base.name);
        if (existingBase) {
          existingBase.joined = false;
        }
      } else {
        // Object-based bases (MyBase pattern)
        for (let baseId in bases) {
          if (bases[baseId].name === base.name) {
            bases[baseId].joined = false;
          }
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Failed to leave base:', err);
    return false;
  }
}

/**
 * Get feed from bases
 * @param {Function} callback - Callback function to handle feed data
 * @param {boolean} forceRefresh - Force refresh from server
 * @returns {Object} Feed data
 */
async function getFeed(callback, forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && _feed.length > 0 && (now - lastFeedRefresh) < LAST_FEED_THRESHOLD) {
    if (callback) callback(_feed);
    return _feed;
  }

  try {
    const homeBase = await getHomeBase();
    
    // Initialize backend users if needed
    if (!bdoUser) {
      try {
        bdoUser = await invoke('create_bdo_user', { bdoUrl: homeBase.dns.bdo });
      } catch (err) {
        console.warn('Failed to create BDO user:', err);
      }
    }
    
    if (!doloresUser) {
      try {
        doloresUser = await invoke('create_dolores_user', { doloresUrl: homeBase.dns.dolores });
      } catch (err) {
        console.warn('Failed to create Dolores user:', err);
      }
    }

    // Get feed data
    let feedData = {
      textPosts: [],
      imagePosts: [],
      videoPosts: []
    };

    try {
      // Get photo feed from Dolores
      const photoFeed = await invoke('get_feed', {
        uuid: doloresUser?.uuid,
        doloresUrl: homeBase.dns.dolores,
        tags: homeBase.soma.photary || ['photos']
      });
      
      if (photoFeed && photoFeed.length > 0) {
        feedData.imagePosts = photoFeed.map(item => ({
          uuid: item.uuid || generateId(),
          title: item.title || '',
          description: item.description || '',
          images: item.images || [item.url],
          timestamp: item.timestamp || Date.now(),
          author: item.author || 'Anonymous'
        }));
      }
    } catch (err) {
      console.warn('Failed to get photo feed:', err);
    }

    // No mock data - show empty state when no content available
    if (feedData.imagePosts.length === 0) {
      console.log('📦 No photo content available from connected bases');
    }

    _feed = feedData;
    lastFeedRefresh = now;
    
    if (callback) callback(_feed);
    return _feed;
    
  } catch (err) {
    console.error('Failed to get feed:', err);
    
    // Return empty feed with error info instead of mock data
    const emptyFeed = {
      textPosts: [],
      imagePosts: [],
      videoPosts: [],
      error: err.message,
      isEmpty: true,
      message: 'Unable to connect to base servers. Check your connection and try again.'
    };
    
    if (callback) callback(emptyFeed);
    return emptyFeed;
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