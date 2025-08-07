/**
 * Allyabase Service Integration for Rhapsold
 * Handles connection to allyabase backend services
 */

/**
 * Configuration profiles for different environments
 */
const CONFIGS = {
  dev: {
    baseUrl: 'https://dev.sanora.allyabase.com', // Dev server
    services: {
      dolores: 'https://dev.dolores.allyabase.com', // Video/media storage
      pref: 'https://dev.pref.allyabase.com',      // Preferences  
      bdo: 'https://dev.bdo.allyabase.com',        // Big dumb objects
      fount: 'https://dev.fount.allyabase.com',    // MAGIC/rewards
      sanora: 'https://dev.sanora.allyabase.com'   // Product hosting
    },
    timeout: 5000
  },
  test: {
    baseUrl: 'http://localhost:5111', // Test Base 1 (leader)
    services: {
      dolores: 5118, // Video/media storage
      pref: 5113,    // Preferences  
      bdo: 5114,     // Big dumb objects
      fount: 5117,   // MAGIC/rewards
      sanora: 5121   // Product hosting
    },
    timeout: 5000
  },
  local: {
    baseUrl: 'http://localhost:3000', // Standard local allyabase
    services: {
      dolores: 3005, // Video/media storage
      pref: 3004,    // Preferences  
      bdo: 3003,     // Big dumb objects
      fount: 3002,   // MAGIC/rewards
      sanora: 7243   // Product hosting
    },
    timeout: 5000
  }
};

/**
 * Get environment-based configuration
 */
function getEnvironmentConfig() {
  // Try to get environment from Tauri or fallback methods
  let env = 'dev'; // default
  
  try {
    // Check if we're in Tauri and can access environment
    if (window.__TAURI__) {
      // For now, we'll check localStorage for manual override
      const storedEnv = localStorage.getItem('ninefy-env');
      if (storedEnv && CONFIGS[storedEnv]) {
        env = storedEnv;
      }
    }
    
    // Check URL parameters for quick switching (dev only)
    const urlParams = new URLSearchParams(window.location.search);
    const urlEnv = urlParams.get('env');
    if (urlEnv && CONFIGS[urlEnv]) {
      env = urlEnv;
      localStorage.setItem('ninefy-env', env); // Remember choice
    }
    
  } catch (error) {
    console.warn('Could not detect environment, using dev:', error);
  }
  
  const config = CONFIGS[env] || CONFIGS.dev;
  
  console.log(`🌐 Using ${env} environment configuration`);
  console.log(`📍 Base URL: ${config.baseUrl}`);
  
  return config;
}

/**
 * Default allyabase configuration
 */
const DEFAULT_CONFIG = getEnvironmentConfig();

/**
 * Allyabase client instance
 */
let allyabaseClient = null;

/**
 * Connection status
 */
let connectionStatus = {
  connected: false,
  services: {},
  lastCheck: null
};

/**
 * Connect to allyabase services
 * @param {Object} config - Custom configuration
 * @returns {Promise<Object>} Connection result
 */
export async function connectToAllyabase(config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  console.log('🌐 Connecting to allyabase...');
  
  try {
    // Check if we're in Tauri environment
    if (window.__TAURI__) {
      // Use Tauri's HTTP client
      const { fetch } = window.__TAURI__.http;
      console.log('🦀 Using Tauri HTTP client');
      
      // Test connection to main allyabase
      const response = await fetch(`${finalConfig.baseUrl}/health`, {
        method: 'GET',
        timeout: finalConfig.timeout
      });
      
      if (response.ok) {
        console.log('✅ Connected to allyabase main instance');
        connectionStatus.connected = true;
      }
      
    } else {
      // Use browser fetch
      console.log('🌐 Using browser fetch');
      
      const response = await fetch(`${finalConfig.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(finalConfig.timeout)
      });
      
      if (response.ok) {
        console.log('✅ Connected to allyabase main instance');
        connectionStatus.connected = true;
      }
    }
    
    // Test individual services
    await testServices(finalConfig);
    
    // Initialize client
    allyabaseClient = createClient(finalConfig);
    
    // Expose to global scope for convenience
    window.allyabase = allyabaseClient;
    
    connectionStatus.lastCheck = new Date();
    
    return {
      success: true,
      client: allyabaseClient,
      status: connectionStatus
    };
    
  } catch (error) {
    console.error('❌ Failed to connect to allyabase:', error);
    connectionStatus.connected = false;
    
    // Create offline client
    allyabaseClient = createOfflineClient();
    window.allyabase = allyabaseClient;
    
    throw new Error(`Could not connect to allyabase: ${error.message}`);
  }
}

/**
 * Test individual allyabase services
 * @param {Object} config - Configuration
 */
async function testServices(config) {
  const serviceTests = Object.entries(config.services).map(async ([name, serviceUrl]) => {
    try {
      // Handle both URL strings and port numbers
      const url = typeof serviceUrl === 'string' ? `${serviceUrl}/health` : `http://localhost:${serviceUrl}/health`;
      
      let response;
      if (window.__TAURI__) {
        const { fetch } = window.__TAURI__.http;
        response = await fetch(url, { timeout: 2000 });
      } else {
        response = await fetch(url, { 
          signal: AbortSignal.timeout(2000) 
        });
      }
      
      if (response.ok) {
        connectionStatus.services[name] = true;
        console.log(`✅ ${name} service available at ${url}`);
      } else {
        connectionStatus.services[name] = false;
        console.warn(`⚠️ ${name} service unhealthy at ${url}`);
      }
      
    } catch (error) {
      connectionStatus.services[name] = false;
      const url = typeof serviceUrl === 'string' ? serviceUrl : `localhost:${serviceUrl}`;
      console.warn(`⚠️ ${name} service unavailable at ${url}:`, error.message);
    }
  });
  
  await Promise.allSettled(serviceTests);
}

/**
 * Create allyabase client
 * @param {Object} config - Configuration
 * @returns {Object} Client instance
 */
function createClient(config) {
  return {
    // Preferences service
    async savePref(key, value) {
      try {
        const baseUrl = typeof config.services.pref === 'string' ? config.services.pref : `http://localhost:${config.services.pref}`;
        const url = `${baseUrl}/save`;
        const response = await makeRequest(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        });
        
        return response;
      } catch (error) {
        console.error('❌ Failed to save preference:', error);
        // Fallback to localStorage
        localStorage.setItem(`rhapsold-${key}`, JSON.stringify(value));
        return { success: true, fallback: true };
      }
    },
    
    async getPref(key) {
      try {
        const baseUrl = typeof config.services.pref === 'string' ? config.services.pref : `http://localhost:${config.services.pref}`;
        const url = `${baseUrl}/get/${key}`;
        const response = await makeRequest(url);
        
        return response.value;
      } catch (error) {
        console.error('❌ Failed to get preference:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem(`rhapsold-${key}`);
        return stored ? JSON.parse(stored) : null;
      }
    },
    
    // Big Dumb Object service for posts
    async saveBDO(data) {
      try {
        const baseUrl = typeof config.services.bdo === 'string' ? config.services.bdo : `http://localhost:${config.services.bdo}`;
        const url = `${baseUrl}/save`;
        const response = await makeRequest(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        return response;
      } catch (error) {
        console.error('❌ Failed to save BDO:', error);
        // Fallback to localStorage
        const id = Date.now().toString();
        localStorage.setItem(`rhapsold-post-${id}`, JSON.stringify(data));
        return { success: true, id, fallback: true };
      }
    },
    
    async getBDO(id) {
      try {
        const baseUrl = typeof config.services.bdo === 'string' ? config.services.bdo : `http://localhost:${config.services.bdo}`;
        const url = `${baseUrl}/get/${id}`;
        const response = await makeRequest(url);
        
        return response;
      } catch (error) {
        console.error('❌ Failed to get BDO:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem(`rhapsold-post-${id}`);
        return stored ? JSON.parse(stored) : null;
      }
    },
    
    // Media service (dolores)
    async saveMedia(mediaData) {
      try {
        const baseUrl = typeof config.services.dolores === 'string' ? config.services.dolores : `http://localhost:${config.services.dolores}`;
        const url = `${baseUrl}/upload`;
        const response = await makeRequest(url, {
          method: 'POST',
          body: mediaData // FormData for file uploads
        });
        
        return response;
      } catch (error) {
        console.error('❌ Failed to save media:', error);
        throw error;
      }
    },
    
    // Utility methods
    getConnectionStatus() {
      return connectionStatus;
    },
    
    async testConnection() {
      try {
        await testServices(config);
        return connectionStatus;
      } catch (error) {
        console.error('❌ Connection test failed:', error);
        return { connected: false, error: error.message };
      }
    }
  };
}

/**
 * Create offline client with localStorage fallbacks
 * @returns {Object} Offline client instance
 */
function createOfflineClient() {
  console.log('📴 Creating offline client with localStorage fallbacks');
  
  return {
    async savePref(key, value) {
      localStorage.setItem(`rhapsold-${key}`, JSON.stringify(value));
      return { success: true, offline: true };
    },
    
    async getPref(key) {
      const stored = localStorage.getItem(`rhapsold-${key}`);
      return stored ? JSON.parse(stored) : null;
    },
    
    async saveBDO(data) {
      const id = Date.now().toString();
      localStorage.setItem(`rhapsold-post-${id}`, JSON.stringify({
        ...data,
        id,
        created: new Date().toISOString(),
        offline: true
      }));
      return { success: true, id, offline: true };
    },
    
    async getBDO(id) {
      const stored = localStorage.getItem(`rhapsold-post-${id}`);
      return stored ? JSON.parse(stored) : null;
    },
    
    async saveMedia(mediaData) {
      throw new Error('Media upload not available in offline mode');
    },
    
    getConnectionStatus() {
      return { connected: false, offline: true, services: {} };
    },
    
    async testConnection() {
      return { connected: false, offline: true };
    }
  };
}

/**
 * Make HTTP request with appropriate client
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
async function makeRequest(url, options = {}) {
  if (window.__TAURI__) {
    const { fetch } = window.__TAURI__.http;
    const response = await fetch(url, {
      timeout: 5000,
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.data;
  } else {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

/**
 * Get client instance
 * @returns {Object|null} Current client
 */
export function getClient() {
  return allyabaseClient;
}

/**
 * Check if connected to allyabase
 * @returns {boolean} Connection status
 */
export function isConnected() {
  return connectionStatus.connected;
}

/**
 * Switch environment configuration
 * @param {string} env - Environment to switch to (dev, test, local)
 */
export function switchEnvironment(env) {
  if (!CONFIGS[env]) {
    console.error(`❌ Unknown environment: ${env}. Available: ${Object.keys(CONFIGS).join(', ')}`);
    return false;
  }
  
  localStorage.setItem('ninefy-env', env);
  console.log(`🔄 Environment switched to ${env}. Please refresh the app.`);
  return true;
}

/**
 * Get current environment
 */
export function getCurrentEnvironment() {
  const storedEnv = localStorage.getItem('ninefy-env');
  return storedEnv || 'dev';
}

/**
 * Export connection status and configs for debugging
 */
export { connectionStatus, CONFIGS };