/**
 * Base Discovery Service for The Nullary
 * Production-ready base server discovery using BDO
 * Follows screenary's proven patterns but with improvements
 */

// Cache configuration
const CACHE_DURATION = {
  bases: 10 * 60 * 1000,      // 10 minutes for base list
  connections: 5 * 60 * 1000   // 5 minutes for connection status
};

let cachedBases = null;
let lastBaseRefresh = 0;
let homeBaseCache = null;

/**
 * Get environment configuration for BDO URLs
 * Assumes getEnvironmentConfig() is available globally
 */
function getEnvConfig() {
  if (typeof getEnvironmentConfig === 'function') {
    return getEnvironmentConfig();
  }
  // Fallback to dev environment
  return {
    bdo: 'https://dev.bdo.allyabase.com/',
    dolores: 'https://dev.dolores.allyabase.com/',
    sanora: 'https://dev.sanora.allyabase.com/'
  };
}

/**
 * Default home base configuration - uses environment-aware URLs
 */
function getDefaultHomeBase() {
  const envConfig = getEnvConfig();
  
  return {
    name: 'DEV',
    description: 'Development base for testing. Connected to current environment.',
    location: {
      latitude: 36.788,
      longitude: -119.417,
      postalCode: '94102'
    },
    soma: {
      lexary: ['development', 'testing', 'programming'],
      photary: ['screenshots', 'diagrams', 'dev-photos'],
      viewary: ['demos', 'tutorials', 'dev-videos']
    },
    dns: {
      bdo: envConfig.bdo,
      dolores: envConfig.dolores,
      sanora: envConfig.sanora
    },
    joined: true,
    connected: true
  };
}

/**
 * Get home base configuration
 * Uses Tauri filesystem if available, otherwise localStorage
 */
async function getHomeBase() {
  if (homeBaseCache) {
    return homeBaseCache;
  }

  try {
    // Try Tauri filesystem first
    if (window.__TAURI__ && window.__TAURI__.fs) {
      const { readTextFile, BaseDirectory } = window.__TAURI__.fs;
      const homeBaseData = await readTextFile('bases/home.json', { baseDir: BaseDirectory.AppCache });
      homeBaseCache = JSON.parse(homeBaseData);
      return homeBaseCache;
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('nullary-home-base');
    if (stored) {
      homeBaseCache = JSON.parse(stored);
      return homeBaseCache;
    }
  } catch (error) {
    console.warn('📦 Could not load home base, using default:', error.message);
  }
  
  homeBaseCache = getDefaultHomeBase();
  return homeBaseCache;
}

/**
 * Save home base configuration
 */
async function saveHomeBase(base) {
  try {
    homeBaseCache = base;
    
    // Try Tauri filesystem first
    if (window.__TAURI__ && window.__TAURI__.fs) {
      const { writeTextFile, mkdir, BaseDirectory } = window.__TAURI__.fs;
      
      try {
        await mkdir('bases', { baseDir: BaseDirectory.AppCache, recursive: true });
        await writeTextFile('bases/home.json', JSON.stringify(base, null, 2), { baseDir: BaseDirectory.AppCache });
        console.log('✅ Home base saved to filesystem');
        return true;
      } catch (fsError) {
        console.warn('⚠️ Filesystem save failed, falling back to localStorage:', fsError);
      }
    }
    
    // Fallback to localStorage
    localStorage.setItem('nullary-home-base', JSON.stringify(base));
    console.log('✅ Home base saved to localStorage');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to save home base:', error);
    return false;
  }
}

/**
 * Connect to a base server and create necessary user accounts
 */
async function connectToBase(base) {
  console.log('🔌 Connecting to base:', base.name);
  
  if (!window.__TAURI__ || !window.__TAURI__.core) {
    console.warn('⚠️ Tauri not available - cannot create backend users');
    return { ...base, connected: false };
  }
  
  const { invoke } = window.__TAURI__.core;
  const connectedBase = { ...base };
  connectedBase.users = connectedBase.users || {};
  
  // Connect to each service
  for (const [service, url] of Object.entries(base.dns || {})) {
    if (connectedBase.users[service]?.uuid) {
      continue; // Already connected
    }
    
    try {
      const invokeFunction = `create_${service}_user`;
      const urlParam = `${service}Url`;
      const serviceUrl = url.endsWith('/') ? url : url + '/';
      
      console.log(`🔄 Creating ${service} user at ${serviceUrl}`);
      
      const user = await invoke(invokeFunction, { [urlParam]: serviceUrl });
      
      if (user && user.uuid) {
        connectedBase.users[service] = user;
        console.log(`✅ Connected to ${service}: ${user.uuid}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to connect to ${service}:`, error.message);
      // Continue with other services even if one fails
    }
  }
  
  connectedBase.connected = Object.keys(connectedBase.users).length > 0;
  connectedBase.joined = true;
  
  return connectedBase;
}

/**
 * Fetch bases from BDO using the proven screenary pattern
 */
async function fetchBasesFromBDO() {
  console.log('🌐 Fetching bases from BDO...');
  
  if (!window.__TAURI__ || !window.__TAURI__.core) {
    console.warn('⚠️ Tauri not available - using fallback bases');
    return { 'home': getDefaultHomeBase() };
  }
  
  const { invoke } = window.__TAURI__.core;
  
  try {
    // Get or create home base connection
    let homeBase = await getHomeBase();
    
    // Ensure home base has BDO user
    if (!homeBase.users?.bdo?.uuid) {
      console.log('🔄 Connecting to home base...');
      homeBase = await connectToBase(homeBase);
      await saveHomeBase(homeBase);
    }
    
    const bdoUser = homeBase.users.bdo;
    if (!bdoUser?.uuid) {
      throw new Error('Failed to create BDO user');
    }
    
    // Fetch bases from BDO
    const bdoUrl = homeBase.dns.bdo.endsWith('/') ? homeBase.dns.bdo : homeBase.dns.bdo + '/';
    console.log('📡 Getting bases from:', bdoUrl, 'with user:', bdoUser.uuid);
    
    const fetchedBases = await invoke('get_bases', { 
      uuid: bdoUser.uuid, 
      bdoUrl: bdoUrl 
    });
    
    console.log('📦 Raw bases from BDO:', fetchedBases);
    
    if (!fetchedBases || typeof fetchedBases !== 'object') {
      throw new Error('Invalid bases response from BDO');
    }
    
    // Process and connect to each base
    const connectedBases = {};
    
    for (const [baseId, baseData] of Object.entries(fetchedBases)) {
      try {
        console.log(`🔄 Processing base ${baseId}:`, baseData);
        
        const connectedBase = await connectToBase(baseData);
        connectedBase.id = baseId;
        connectedBases[baseId] = connectedBase;
        
        console.log(`✅ Base ${baseId} processed successfully`);
      } catch (error) {
        console.error(`❌ Failed to process base ${baseId}:`, error);
        // Still include the base but mark as disconnected
        connectedBases[baseId] = {
          ...baseData,
          id: baseId,
          connected: false,
          joined: false
        };
      }
    }
    
    // Always include home base
    connectedBases['home'] = homeBase;
    
    console.log('🎉 Successfully fetched', Object.keys(connectedBases).length, 'bases');
    return connectedBases;
    
  } catch (error) {
    console.error('❌ Failed to fetch bases from BDO:', error);
    
    // Return fallback bases on error
    const fallbackBases = {
      'home': getDefaultHomeBase(),
      'error-fallback': {
        id: 'error-fallback',
        name: 'Connection Error',
        description: `Failed to fetch bases: ${error.message}. Using fallback configuration.`,
        connected: false,
        joined: false,
        dns: {},
        soma: {}
      }
    };
    
    return fallbackBases;
  }
}

/**
 * Get all available bases with intelligent caching
 */
async function getBases(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && cachedBases && (now - lastBaseRefresh) < CACHE_DURATION.bases) {
    console.log('📋 Using cached bases');
    return cachedBases;
  }
  
  console.log('🔄 Refreshing bases from BDO...');
  
  try {
    cachedBases = await fetchBasesFromBDO();
    lastBaseRefresh = now;
    
    // Save to localStorage for offline access
    localStorage.setItem('nullary-cached-bases', JSON.stringify(cachedBases));
    localStorage.setItem('nullary-bases-timestamp', now.toString());
    
    return cachedBases;
    
  } catch (error) {
    console.error('❌ Failed to get bases:', error);
    
    // Try to use localStorage cache as last resort
    const storedBases = localStorage.getItem('nullary-cached-bases');
    const storedTimestamp = localStorage.getItem('nullary-bases-timestamp');
    
    if (storedBases && storedTimestamp) {
      const age = now - parseInt(storedTimestamp);
      console.log(`⚠️ Using stale cached bases (${Math.round(age / 60000)} minutes old)`);
      cachedBases = JSON.parse(storedBases);
      return cachedBases;
    }
    
    // Final fallback
    cachedBases = { 'home': getDefaultHomeBase() };
    return cachedBases;
  }
}

/**
 * Join a base server
 */
async function joinBase(base) {
  console.log('🤝 Joining base:', base.name);
  
  try {
    const connectedBase = await connectToBase(base);
    
    // Update cached bases
    if (cachedBases && base.id) {
      cachedBases[base.id] = connectedBase;
      
      // Update localStorage
      localStorage.setItem('nullary-cached-bases', JSON.stringify(cachedBases));
    }
    
    console.log('✅ Successfully joined base:', base.name);
    return connectedBase;
    
  } catch (error) {
    console.error('❌ Failed to join base:', error);
    throw error;
  }
}

/**
 * Leave a base server
 */
async function leaveBase(base) {
  console.log('👋 Leaving base:', base.name);
  
  try {
    // Update cached bases
    if (cachedBases && base.id) {
      cachedBases[base.id] = {
        ...cachedBases[base.id],
        joined: false,
        connected: false
      };
      
      // Update localStorage
      localStorage.setItem('nullary-cached-bases', JSON.stringify(cachedBases));
    }
    
    console.log('✅ Successfully left base:', base.name);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to leave base:', error);
    throw error;
  }
}

/**
 * Get bases as array (for compatibility with feed components)
 */
async function getBasesArray(forceRefresh = false) {
  const basesObj = await getBases(forceRefresh);
  return Object.values(basesObj).map(base => ({
    ...base,
    // Ensure consistent structure
    id: base.id || base.name,
    connected: base.connected !== false,
    joined: base.joined !== false
  }));
}

/**
 * Clear all caches (useful for debugging)
 */
function clearCache() {
  cachedBases = null;
  lastBaseRefresh = 0;
  homeBaseCache = null;
  localStorage.removeItem('nullary-cached-bases');
  localStorage.removeItem('nullary-bases-timestamp');
  localStorage.removeItem('nullary-home-base');
  console.log('🧹 Base discovery cache cleared');
}

// Export the base discovery interface
const baseDiscovery = {
  // Base management
  getBases,
  getBasesArray,
  getHomeBase,
  saveHomeBase,
  joinBase,
  leaveBase,
  connectToBase,
  
  // Utilities
  clearCache,
  getDefaultHomeBase
};

export default baseDiscovery;