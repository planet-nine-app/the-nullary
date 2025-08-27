/**
 * Environment Configuration for MagiCard
 * Adapted from shared nullary environment configuration
 */

// Environment configuration profiles
const ENVIRONMENT_CONFIGS = {
  dev: {
    name: 'Development Server',
    description: 'Production dev server (https://dev.*.allyabase.com)',
    services: {
      sanora: 'https://dev.sanora.allyabase.com/',
      bdo: 'https://dev.bdo.allyabase.com/',
      dolores: 'https://dev.dolores.allyabase.com/',
      fount: 'https://dev.fount.allyabase.com/',
      addie: 'https://dev.addie.allyabase.com/',
      pref: 'https://dev.pref.allyabase.com/',
      prof: 'https://dev.prof.allyabase.com/',
      julia: 'https://dev.julia.allyabase.com/',
      continuebee: 'https://dev.continuebee.allyabase.com/',
      joan: 'https://dev.joan.allyabase.com/',
      aretha: 'https://dev.aretha.allyabase.com/',
      minnie: 'https://dev.minnie.allyabase.com/',
      covenant: 'https://dev.covenant.allyabase.com/'
    }
  },
  test: {
    name: 'Test Ecosystem',
    description: 'Local 3-base test ecosystem (127.0.0.1:5111-5122)',
    services: {
      sanora: 'http://127.0.0.1:5121/',
      bdo: 'http://127.0.0.1:5114/',
      dolores: 'http://127.0.0.1:5118/',
      fount: 'http://127.0.0.1:5117/',
      addie: 'http://127.0.0.1:5116/',
      pref: 'http://127.0.0.1:5113/',
      prof: 'http://127.0.0.1:5113/',
      julia: 'http://127.0.0.1:5111/',
      continuebee: 'http://127.0.0.1:5112/',
      joan: 'http://127.0.0.1:5115/',
      aretha: 'http://127.0.0.1:5120/',
      minnie: 'http://127.0.0.1:5119/',
      covenant: 'http://127.0.0.1:5122/'
    }
  },
  local: {
    name: 'Local Development',
    description: 'Standard local development (127.0.0.1)',
    services: {
      sanora: 'http://127.0.0.1:7243/',
      bdo: 'http://127.0.0.1:3003/',
      dolores: 'http://127.0.0.1:3007/',
      fount: 'http://127.0.0.1:3006/',
      addie: 'http://127.0.0.1:3005/',
      pref: 'http://127.0.0.1:3002/',
      prof: 'http://127.0.0.1:3008/',
      julia: 'http://127.0.0.1:3000/',
      continuebee: 'http://127.0.0.1:2999/',
      joan: 'http://127.0.0.1:3004/',
      aretha: 'http://127.0.0.1:7277/',
      minnie: 'http://127.0.0.1:2525/',
      covenant: 'http://127.0.0.1:3011/'
    }
  }
};

/**
 * Get current environment configuration
 * @returns {Object} Environment configuration with { env, name, description, services }
 */
function getEnvironmentConfig() {
  // First try to get environment from Tauri backend (MAGICARD_ENV)
  let env = 'dev';
  
  if (typeof window !== 'undefined' && window.__TAURI__) {
    try {
      // Try to get environment from Rust backend synchronously via cache
      if (window._magicardEnvCache) {
        env = window._magicardEnvCache;
      } else {
        // Fall back to localStorage for browser console switching
        env = localStorage.getItem('nullary-env') || 'dev';
      }
    } catch (error) {
      console.warn('⚠️ Could not get environment from Tauri backend, using localStorage');
      env = localStorage.getItem('nullary-env') || 'dev';
    }
  } else {
    // Not in Tauri environment, use localStorage
    env = localStorage.getItem('nullary-env') || 'dev';
  }
  
  console.log(`🔍 MagiCard environment: ${env}`);
  const config = ENVIRONMENT_CONFIGS[env] || ENVIRONMENT_CONFIGS.dev;
  
  if (!config) {
    console.error(`❌ No config found for environment: ${env}`);
    return { env: 'dev', services: ENVIRONMENT_CONFIGS.dev.services, name: 'Development Server (fallback)' };
  }
  
  console.log(`🌐 Using ${env} environment: ${config.name}`);
  return {
    env,
    ...config
  };
}

/**
 * Get service URL for current environment
 * @param {string} serviceName - Name of the service (sanora, bdo, etc.)
 * @returns {string} Service URL
 */
function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  const url = config.services[serviceName];
  
  if (!url) {
    console.warn(`⚠️ Unknown service: ${serviceName}. Available: ${Object.keys(config.services).join(', ')}`);
    return config.services.sanora; // fallback to sanora
  }
  
  return url;
}

/**
 * Environment switching functions for browser console
 */
function createEnvironmentControls(appName = 'magicard') {
  return {
    switch: (env) => {
      if (!ENVIRONMENT_CONFIGS[env]) {
        console.error(`❌ Unknown environment: ${env}. Available: ${Object.keys(ENVIRONMENT_CONFIGS).join(', ')}`);
        return false;
      }
      localStorage.setItem('nullary-env', env);
      console.log(`🔄 ${appName} environment switched to ${env}. Refresh app to apply changes.`);
      console.log(`Run: location.reload() to refresh`);
      return true;
    },
    
    current: () => {
      const config = getEnvironmentConfig();
      console.log(`🌐 Current environment: ${config.env} (${config.name})`);
      console.log(`📍 Services:`, config.services);
      return config;
    },
    
    list: () => {
      console.log('🌐 Available environments:');
      Object.entries(ENVIRONMENT_CONFIGS).forEach(([key, config]) => {
        console.log(`  ${key}: ${config.name} - ${config.description}`);
      });
      return Object.keys(ENVIRONMENT_CONFIGS);
    }
  };
}

/**
 * Initialize environment configuration from Tauri backend
 */
async function initializeEnvironmentFromBackend() {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    try {
      const backendEnv = await window.__TAURI__.core.invoke('get_env_config');
      console.log(`🔧 MagiCard backend environment: ${backendEnv}`);
      
      // Cache the backend environment
      window._magicardEnvCache = backendEnv;
      
      console.log(`✅ MagiCard environment synchronized with backend: ${backendEnv}`);
      return backendEnv;
    } catch (error) {
      console.warn('⚠️ Could not get environment from Tauri backend:', error);
      console.warn('📝 Make sure MAGICARD_ENV environment variable is set if not using default');
      
      // Fall back to localStorage
      const fallbackEnv = localStorage.getItem('nullary-env') || 'dev';
      window._magicardEnvCache = fallbackEnv;
      return fallbackEnv;
    }
  }
  return 'dev';
}

// Initialize environment controls for MagiCard
if (typeof window !== 'undefined') {
  window.ENVIRONMENT_CONFIGS = ENVIRONMENT_CONFIGS;
  window.getEnvironmentConfig = getEnvironmentConfig;
  window.getServiceUrl = getServiceUrl;
  window.createEnvironmentControls = createEnvironmentControls;
  window.initializeEnvironmentFromBackend = initializeEnvironmentFromBackend;

  // Create MagiCard-specific environment controls
  window.magicardEnv = createEnvironmentControls('magicard');
  
  console.log('🪄 MagiCard environment controls initialized');
  console.log('🔧 Available in console: magicardEnv.switch("test"), magicardEnv.current(), magicardEnv.list()');
  
  // Note: Environment initialization is now handled explicitly in HTML before castSpell loading
}