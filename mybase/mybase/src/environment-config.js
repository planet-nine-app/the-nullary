/**
 * Shared Environment Configuration for Nullary Apps
 * Provides centralized environment switching for all Planet Nine Nullary applications
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
      julia: 'https://dev.julia.allyabase.com/',
      continuebee: 'https://dev.continuebee.allyabase.com/',
      joan: 'https://dev.joan.allyabase.com/',
      aretha: 'https://dev.aretha.allyabase.com/',
      minnie: 'https://dev.minnie.allyabase.com/',
      covenant: 'https://dev.covenant.allyabase.com/',
      prof: 'https://dev.prof.allyabase.com/'
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
      julia: 'http://127.0.0.1:5111/',
      continuebee: 'http://127.0.0.1:5112/',
      joan: 'http://127.0.0.1:5115/',
      aretha: 'http://127.0.0.1:5120/',
      minnie: 'http://127.0.0.1:5119/',
      covenant: 'http://127.0.0.1:5122/',
      prof: 'http://127.0.0.1:5113/'
    }
  },
  local: {
    name: 'Local Development',
    description: 'Standard local development (127.0.0.1:3000-3011)',
    services: {
      sanora: 'http://127.0.0.1:7243/',
      bdo: 'http://127.0.0.1:3003/',
      dolores: 'http://127.0.0.1:3005/',
      fount: 'http://127.0.0.1:3002/',
      addie: 'http://127.0.0.1:3005/',
      pref: 'http://127.0.0.1:3004/',
      julia: 'http://127.0.0.1:3000/',
      continuebee: 'http://127.0.0.1:2999/',
      joan: 'http://127.0.0.1:3004/',
      aretha: 'http://127.0.0.1:7277/',
      minnie: 'http://127.0.0.1:2525/',
      covenant: 'http://127.0.0.1:3011/',
      prof: 'http://127.0.0.1:3007/'
    }
  }
};

/**
 * Get current environment configuration
 * @returns {Object} Current environment config
 */
function getEnvironmentConfig() {
  const env = localStorage.getItem('nullary-env') || 'dev';
  console.log(`🔍 Looking for environment: ${env}`);
  console.log(`🔍 Available environments:`, Object.keys(ENVIRONMENT_CONFIGS));
  
  const config = ENVIRONMENT_CONFIGS[env] || ENVIRONMENT_CONFIGS.dev;
  
  if (!config) {
    console.error(`❌ No config found for environment: ${env}`);
    console.log(`🔍 ENVIRONMENT_CONFIGS:`, ENVIRONMENT_CONFIGS);
    return { env: 'dev', services: {} };
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
function createEnvironmentControls(appName = 'nullary') {
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
      console.log(`🌍 Available environments for ${appName}:`);
      Object.entries(ENVIRONMENT_CONFIGS).forEach(([key, config]) => {
        console.log(`• ${key} - ${config.description}`);
      });
    },
    
    service: (serviceName) => {
      const url = getServiceUrl(serviceName);
      console.log(`🔗 ${serviceName}: ${url}`);
      return url;
    },
    
    test: () => {
      console.log(`🧪 Testing all service connections...`);
      const config = getEnvironmentConfig();
      Object.entries(config.services).forEach(([service, url]) => {
        console.log(`${service}: ${url}`);
      });
    }
  };
}

/**
 * Initialize environment controls for an app
 * @param {string} appName - Name of the app (ninefy, rhapsold, etc.)
 */
function initializeEnvironmentControls(appName) {
  const envKey = `${appName}Env`;
  window[envKey] = createEnvironmentControls(appName);
  
  // Also create a global nullaryEnv if it doesn't exist
  if (!window.nullaryEnv) {
    window.nullaryEnv = createEnvironmentControls('all-apps');
  }
  
  console.log(`✅ Environment controls initialized for ${appName}`);
  console.log(`Use ${envKey}.list() to see available environments`);
  console.log(`Use ${envKey}.switch('test') to switch to test environment`);
}

/**
 * Legacy compatibility - export functions that apps currently use
 */
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    getEnvironmentConfig,
    getServiceUrl,
    createEnvironmentControls,
    initializeEnvironmentControls,
    ENVIRONMENT_CONFIGS
  };
} else if (typeof window !== 'undefined') {
  // Browser environment - attach to window
  window.PlanetNineEnvironment = {
    getEnvironmentConfig,
    getServiceUrl,
    createEnvironmentControls,
    initializeEnvironmentControls,
    ENVIRONMENT_CONFIGS
  };
}

// Auto-initialize if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeEnvironmentControls('nullary');
    });
  } else {
    initializeEnvironmentControls('nullary');
  }
}