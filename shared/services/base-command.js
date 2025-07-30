/**
 * Shared Base Command Service
 * Handles base server interactions for all Nullary apps
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

// Development base configuration
const devBase = {
  name: 'DEV',
  description: 'Development base for testing. May be unstable.',
  location: {
    latitude: 36.788,
    longitude: -119.417,
    postalCode: '94102'
  },
  soma: {
    lexary: ['science', 'books'],
    photary: ['cats', 'photography'],
    viewary: ['thevids', 'entertainment']
  },
  dns: {
    bdo: 'https://dev.bdo.allyabase.com/',
    dolores: 'https://dev.dolores.allyabase.com/'
  },
  joined: true
};

/**
 * Get home base configuration
 * @returns {Object} Home base configuration
 */
async function getHomeBase() {
  try {
    const homeBase = await readTextFile('bases/home.json', { baseDir: BaseDirectory.AppCache });
    return JSON.parse(homeBase);
  } catch (err) {
    console.warn('No home base found, using dev base:', err);
    return devBase;
  }
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
 * Get all available bases
 * @param {boolean} forceRefresh - Force refresh from server
 * @returns {Array} Array of base configurations
 */
async function getBases(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && bases && (now - lastBaseRefresh) < LAST_BASE_THRESHOLD) {
    return bases;
  }

  try {
    // Try to get bases from backend
    const result = await invoke('get_bases');
    if (result && result.length > 0) {
      bases = result;
    } else {
      // Fallback to dev base
      bases = [devBase];
    }
    
    lastBaseRefresh = now;
    return bases;
  } catch (err) {
    console.warn('Failed to get bases from backend, using dev base:', err);
    bases = [devBase];
    lastBaseRefresh = now;
    return bases;
  }
}

/**
 * Join a base
 * @param {Object} base - Base to join
 * @returns {boolean} Success status
 */
async function joinBase(base) {
  try {
    base.joined = true;
    await saveHomeBase(base);
    
    // Update bases array
    if (bases) {
      const existingBase = bases.find(b => b.name === base.name);
      if (existingBase) {
        existingBase.joined = true;
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
 * @param {Object} base - Base to leave
 * @returns {boolean} Success status
 */
async function leaveBase(base) {
  try {
    base.joined = false;
    
    // If this was the home base, clear it
    const homeBase = await getHomeBase();
    if (homeBase && homeBase.name === base.name) {
      await saveHomeBase(devBase);
    }
    
    // Update bases array
    if (bases) {
      const existingBase = bases.find(b => b.name === base.name);
      if (existingBase) {
        existingBase.joined = false;
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

    // Add mock data for development
    if (feedData.imagePosts.length === 0) {
      feedData.imagePosts = generateMockPhotoFeed();
    }

    _feed = feedData;
    lastFeedRefresh = now;
    
    if (callback) callback(_feed);
    return _feed;
    
  } catch (err) {
    console.error('Failed to get feed:', err);
    
    // Return mock data on error
    const mockFeed = {
      textPosts: [],
      imagePosts: generateMockPhotoFeed(),
      videoPosts: []
    };
    
    if (callback) callback(mockFeed);
    return mockFeed;
  }
}

/**
 * Generate mock photo feed for development
 * @returns {Array} Mock photo posts
 */
function generateMockPhotoFeed() {
  return [
    {
      uuid: 'mock-1',
      title: 'Beautiful Sunset',
      description: 'A stunning sunset over the mountains, captured during a hiking trip last weekend.',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800'
      ],
      timestamp: Date.now() - 3600000,
      author: 'NaturePhotographer'
    },
    {
      uuid: 'mock-2',
      title: 'City Architecture',
      description: 'Modern architectural marvels in the downtown district.',
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
      ],
      timestamp: Date.now() - 7200000,
      author: 'UrbanExplorer'
    },
    {
      uuid: 'mock-3',
      title: 'Ocean Waves',
      description: 'Peaceful waves crashing on the shore during golden hour.',
      images: [
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800'
      ],
      timestamp: Date.now() - 10800000,
      author: 'SeaLover'
    },
    {
      uuid: 'mock-4',
      title: 'Forest Trail',
      description: 'A serene walking path through an old growth forest.',
      images: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800'
      ],
      timestamp: Date.now() - 14400000,
      author: 'ForestWanderer'
    }
  ];
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
  
  // Feed management
  getFeed,
  refreshFeed,
  getFeedByType,
  
  // Utilities
  generateId
};

export default baseCommand;