/**
 * Environment Integration Utilities
 * Helper functions for integrating shared environment config into Nullary apps
 */

/**
 * Create HTML script tag for including environment config
 * @param {string} appName - Name of the app for environment controls
 * @returns {string} HTML script tag
 */
function getEnvironmentScriptTag(appName = 'nullary') {
  return `<script src="../shared/services/environment-config.js"></script>
<script>
// Auto-initialize environment controls for ${appName}
if (window.PlanetNineEnvironment) {
  window.PlanetNineEnvironment.initializeEnvironmentControls('${appName}');
}
</script>`;
}

/**
 * Create environment configuration snippet for apps
 * @param {string} appName - Name of the app
 * @returns {string} JavaScript code to add to apps
 */
function getEnvironmentCodeSnippet(appName = 'nullary') {
  return `
// Environment configuration for ${appName}
function getEnvironmentConfig() {
  if (window.PlanetNineEnvironment) {
    return window.PlanetNineEnvironment.getEnvironmentConfig();
  }
  
  // Fallback configuration if shared config not loaded
  const env = localStorage.getItem('nullary-env') || 'dev';
  const fallbackConfigs = {
    dev: {
      sanora: 'https://dev.sanora.allyabase.com/',
      bdo: 'https://dev.bdo.allyabase.com/',
      dolores: 'https://dev.dolores.allyabase.com/',
      fount: 'https://dev.fount.allyabase.com/',
      addie: 'https://dev.addie.allyabase.com/'
    },
    test: {
      sanora: 'http://localhost:5121/',
      bdo: 'http://localhost:5114/',
      dolores: 'http://localhost:5118/',
      fount: 'http://localhost:5117/',
      addie: 'http://localhost:5116/'
    },
    local: {
      sanora: 'http://localhost:7243/',
      bdo: 'http://localhost:3003/',
      dolores: 'http://localhost:3005/',
      fount: 'http://localhost:3002/',
      addie: 'http://localhost:3005/'
    }
  };
  
  const config = fallbackConfigs[env] || fallbackConfigs.dev;
  console.log('🌐 Using fallback config for', env, config);
  
  return { env, services: config, name: env };
}

function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  return config.services[serviceName] || config.services.sanora;
}
`;
}

/**
 * Create package.json environment scripts
 * @returns {Object} Scripts to add to package.json
 */
function getEnvironmentScripts() {
  return {
    "dev": "npm run dev:local",
    "dev:dev": "NULLARY_ENV=dev npm run tauri dev",
    "dev:test": "NULLARY_ENV=test npm run tauri dev", 
    "dev:local": "NULLARY_ENV=local npm run tauri dev",
    "build": "npm run tauri build",
    "build:dev": "NULLARY_ENV=dev npm run tauri build",
    "build:test": "NULLARY_ENV=test npm run tauri build",
    "build:local": "NULLARY_ENV=local npm run tauri build"
  };
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getEnvironmentScriptTag,
    getEnvironmentCodeSnippet,
    getEnvironmentScripts
  };
}

// Browser compatibility
if (typeof window !== 'undefined') {
  window.EnvironmentIntegration = {
    getEnvironmentScriptTag,
    getEnvironmentCodeSnippet,
    getEnvironmentScripts
  };
}