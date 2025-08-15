const { invoke } = window.__TAURI__.core;
const { create, mkdir, readTextFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs;

const LAST_FEED_THRESHOLD = 600000;
const LAST_BASE_THRESHOLD = 600000;

let bases;
let lastBaseRefresh = 0;
let bdoUser;
let doloresUser;
let _feed = [];
let lastFeedRefresh = 0;

// Function to get service URL with environment detection
function getMyBaseServiceUrl(service) {
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

// Function to get dynamic devBase with current environment URLs
function getDevBase() {
  const bdoUrl = getMyBaseServiceUrl('bdo');
  const doloresUrl = getMyBaseServiceUrl('dolores');
  
  console.log(`🏠 Creating devBase with dynamic URLs: bdo=${bdoUrl}, dolores=${doloresUrl}`);
  
  return {
    name: 'DEV',
    description: 'Development base for social networking. Includes social posts, profiles, and community features.',
    location: {
      latitude: 36.788,
      longitude: -119.417,
      postalCode: '94102'
    },
    soma: {
      lexary: [
        'social',
        'community'
      ],
      photary: [
        'photos',
        'social'
      ],
      viewary: [
        'videos',
        'social'
      ]
    },
    dns: {
      bdo: bdoUrl,
      dolores: doloresUrl
    },
    joined: true
  };
}

async function getHomeBase() {
  // Always use dynamic base with current environment URLs
  // This avoids file permission issues and ensures environment switches work immediately
  const dynamicBase = getDevBase();
  console.log('🆕 Using dynamic base with current environment URLs:', dynamicBase.dns);
  return dynamicBase;
};

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
};

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
};

async function getBases() {
  const now = new Date().getTime();
  console.log('Base refresh check - now:', now, 'lastRefresh:', lastBaseRefresh, 'threshold:', LAST_BASE_THRESHOLD);
  
  if(bases && (now - lastBaseRefresh < LAST_BASE_THRESHOLD)) {
    return bases;
  }
  
  bases = await fetchAndSaveBases();
  lastBaseRefresh = now;

  console.log('Discovered bases:', bases);
  return bases;
};

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
};

async function joinBase(baseName) {
  try {
    const result = await invoke('join_base', { baseName });
    if(result.success) {
      // Refresh bases list
      lastBaseRefresh = 0;
      bases = null;
      await getBases();
      return true;
    }
    return false;
  } catch(err) {
    console.error('Failed to join base:', err);
    return false;
  }
}

async function leaveBase(baseName) {
  try {
    const result = await invoke('leave_base', { baseName });
    if(result.success) {
      // Refresh bases list
      lastBaseRefresh = 0;
      bases = null;
      await getBases();
      return true;
    }
    return false;
  } catch(err) {
    console.error('Failed to leave base:', err);
    return false;
  }
}

// Export functions for use in MyBase
window.baseCommand = {
  getBases,
  connectToHomeBase,
  joinBase,
  leaveBase,
  fetchAndSaveBases
};

export default {
  getBases,
  connectToHomeBase,
  joinBase,
  leaveBase,
  fetchAndSaveBases
};