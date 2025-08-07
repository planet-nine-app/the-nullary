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
      covenant: 'https://dev.covenant.allyabase.com/'
    }
  },
  test: {
    name: 'Test Ecosystem',
    description: 'Local 3-base test ecosystem (localhost:5111-5122)',
    services: {
      sanora: 'http://localhost:5121/',
      bdo: 'http://localhost:5114/',
      dolores: 'http://localhost:5118/',
      fount: 'http://localhost:5117/',
      addie: 'http://localhost:5116/',
      pref: 'http://localhost:5113/',
      julia: 'http://localhost:5111/',
      continuebee: 'http://localhost:5112/',
      joan: 'http://localhost:5115/',
      aretha: 'http://localhost:5120/',
      minnie: 'http://localhost:5119/',
      covenant: 'http://localhost:5122/'
    }
  },
  local: {
    name: 'Local Development',
    description: 'Standard local development (localhost:3000-3011)',
    services: {
      sanora: 'http://localhost:7243/',
      bdo: 'http://localhost:3003/',
      dolores: 'http://localhost:3005/',
      fount: 'http://localhost:3002/',
      addie: 'http://localhost:3005/',
      pref: 'http://localhost:3004/',
      julia: 'http://localhost:3000/',
      continuebee: 'http://localhost:2999/',
      joan: 'http://localhost:3004/',
      aretha: 'http://localhost:7277/',
      minnie: 'http://localhost:2525/',
      covenant: 'http://localhost:3011/'
    }
  }
};

/**
 * Get current environment configuration
 * @returns {Object} Current environment config
 */
function getEnvironmentConfig() {
  const env = localStorage.getItem('nullary-env') || 'dev';
  const config = ENVIRONMENT_CONFIGS[env] || ENVIRONMENT_CONFIGS.dev;
  
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