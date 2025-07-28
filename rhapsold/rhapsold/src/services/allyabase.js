/**
 * Allyabase Service Integration for Rhapsold
 * Handles connection to allyabase backend services
 */

/**
 * Default allyabase configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:3000', // Default local allyabase instance
  services: {
    dolores: 3005, // Video/media storage
    pref: 3004,    // Preferences
    bdo: 3003,     // Big dumb objects
    fount: 3002    // MAGIC/rewards
  },
  timeout: 5000
};

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
  const serviceTests = Object.entries(config.services).map(async ([name, port]) => {
    try {
      const url = `http://localhost:${port}/health`;
      
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
        console.log(`✅ ${name} service available on port ${port}`);
      } else {
        connectionStatus.services[name] = false;
        console.warn(`⚠️ ${name} service unhealthy on port ${port}`);
      }
      
    } catch (error) {
      connectionStatus.services[name] = false;
      console.warn(`⚠️ ${name} service unavailable on port ${port}:`, error.message);
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
        const url = `http://localhost:${config.services.pref}/save`;
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
        const url = `http://localhost:${config.services.pref}/get/${key}`;
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
        const url = `http://localhost:${config.services.bdo}/save`;
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
        const url = `http://localhost:${config.services.bdo}/get/${id}`;
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
        const url = `http://localhost:${config.services.dolores}/upload`;
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
 * Export connection status
 */
export { connectionStatus };