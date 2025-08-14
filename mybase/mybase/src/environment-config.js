/**
 * Shared Environment Configuration for MyBase
 * Provides centralized environment switching for Planet Nine infrastructure
 */

// Environment configuration profiles
const ENVIRONMENT_CONFIGS = {
  dev: {
    name: 'Development Server',
    description: 'Production dev server (https://dev.*.allyabase.com)',
    services: {
      bdo: 'https://dev.bdo.allyabase.com/',
      dolores: 'https://dev.dolores.allyabase.com/',
      sanora: 'https://dev.sanora.allyabase.com/',
      pref: 'https://dev.pref.allyabase.com/',
      julia: 'https://dev.julia.allyabase.com/',
      continuebee: 'https://dev.continuebee.allyabase.com/',
      joan: 'https://dev.joan.allyabase.com/',
      fount: 'https://dev.fount.allyabase.com/',
      addie: 'https://dev.addie.allyabase.com/',
      aretha: 'https://dev.aretha.allyabase.com/',
      minnie: 'https://dev.minnie.allyabase.com/',
      covenant: 'https://dev.covenant.allyabase.com/'
    }
  },
  test: {
    name: 'Test Ecosystem',
    description: 'Local 3-base test ecosystem (127.0.0.1:5111-5122)',
    services: {
      bdo: 'http://127.0.0.1:5114/',
      dolores: 'http://127.0.0.1:5118/',
      sanora: 'http://127.0.0.1:5121/',
      pref: 'http://127.0.0.1:5113/',
      julia: 'http://127.0.0.1:5111/',
      continuebee: 'http://127.0.0.1:5112/',
      joan: 'http://127.0.0.1:5115/',
      fount: 'http://127.0.0.1:5117/',
      addie: 'http://127.0.0.1:5116/',
      aretha: 'http://127.0.0.1:5120/',
      minnie: 'http://127.0.0.1:5119/',
      covenant: 'http://127.0.0.1:5122/'
    }
  },
  local: {
    name: 'Local Development',
    description: 'Standard local development (127.0.0.1:3000-3011)',
    services: {
      bdo: 'http://127.0.0.1:3003/',
      dolores: 'http://127.0.0.1:3005/',
      sanora: 'http://127.0.0.1:7243/',
      pref: 'http://127.0.0.1:3004/',
      julia: 'http://127.0.0.1:3000/',
      continuebee: 'http://127.0.0.1:2999/',
      joan: 'http://127.0.0.1:3004/',
      fount: 'http://127.0.0.1:3002/',
      addie: 'http://127.0.0.1:3005/',
      aretha: 'http://127.0.0.1:7277/',
      minnie: 'http://127.0.0.1:2525/',
      covenant: 'http://127.0.0.1:3011/'
    }
  }
};

// Storage key for environment preference
const ENV_STORAGE_KEY = 'mybase-env';

/**
 * Get current environment configuration
 */
function getEnvironmentConfig() {
  const currentEnv = getCurrentEnvironment();
  return {
    env: currentEnv,
    ...ENVIRONMENT_CONFIGS[currentEnv]
  };
}

/**
 * Get current environment from localStorage or default to 'dev'
 */
function getCurrentEnvironment() {
  try {
    return localStorage.getItem(ENV_STORAGE_KEY) || 'dev';
  } catch (e) {
    console.warn('Failed to read environment from localStorage:', e);
    return 'dev';
  }
}

/**
 * Set current environment and persist to localStorage
 */
function setCurrentEnvironment(env) {
  if (!ENVIRONMENT_CONFIGS[env]) {
    throw new Error(`Invalid environment: ${env}. Valid options: ${Object.keys(ENVIRONMENT_CONFIGS).join(', ')}`);
  }
  
  try {
    localStorage.setItem(ENV_STORAGE_KEY, env);
    console.log(`Environment switched to: ${env} (${ENVIRONMENT_CONFIGS[env].name})`);
    return true;
  } catch (e) {
    console.error('Failed to save environment to localStorage:', e);
    return false;
  }
}

/**
 * Get URL for specific service in current environment
 */
function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  const url = config.services[serviceName];
  
  if (!url) {
    console.warn(`Service '${serviceName}' not found in environment '${config.env}'. Available services:`, Object.keys(config.services));
    return null;
  }
  
  return url;
}

/**
 * Browser console interface for environment switching
 */
window.mybaseEnv = {
  switch: (env) => {
    if (setCurrentEnvironment(env)) {
      console.log(`MyBase environment switched to: ${env}`);
      console.log('Reload the page to apply changes: location.reload()');
      return true;
    }
    return false;
  },
  
  current: () => {
    const config = getEnvironmentConfig();
    console.log(`Current environment: ${config.env} (${config.name})`);
    console.log('Services:', config.services);
    return config;
  },
  
  list: () => {
    console.log('Available environments:');
    Object.entries(ENVIRONMENT_CONFIGS).forEach(([key, config]) => {
      console.log(`  ${key}: ${config.name} - ${config.description}`);
    });
    return Object.keys(ENVIRONMENT_CONFIGS);
  }
};

// Log current environment on load
console.log(`🌐 MyBase Environment: ${getCurrentEnvironment()} (${ENVIRONMENT_CONFIGS[getCurrentEnvironment()].name})`);
console.log('Use mybaseEnv.switch("test") to change environments');

// Export functions for use in other modules
window.getEnvironmentConfig = getEnvironmentConfig;
window.getCurrentEnvironment = getCurrentEnvironment;
window.setCurrentEnvironment = setCurrentEnvironment;
window.getServiceUrl = getServiceUrl;