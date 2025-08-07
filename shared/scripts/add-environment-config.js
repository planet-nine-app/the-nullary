#!/usr/bin/env node

/**
 * Batch Environment Configuration Script
 * Adds environment switching support to all Nullary apps
 */

const fs = require('fs');
const path = require('path');

// Environment configuration template
const ENV_CONFIG_TEMPLATE = (appName) => `
// Environment configuration for ${appName}
function getEnvironmentConfig() {
  const env = localStorage.getItem('nullary-env') || 'dev';
  
  const configs = {
    dev: {
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
    },
    test: {
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
    },
    local: {
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
  };
  
  const config = configs[env] || configs.dev;
  return { env, services: config, name: env };
}

function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  return config.services[serviceName] || config.services.sanora;
}

// Environment switching functions for browser console
window.${appName}Env = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(\`❌ Unknown environment: \${env}. Available: dev, test, local\`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(\`🔄 ${appName} environment switched to \${env}. Refresh app to apply changes.\`);
    console.log(\`Run: location.reload() to refresh\`);
    return true;
  },
  current: () => {
    const config = getEnvironmentConfig();
    console.log(\`🌐 Current environment: \${config.env}\`);
    console.log(\`📍 Services:\`, config.services);
    return config;
  },
  list: () => {
    console.log('🌍 Available environments for ${appName}:');
    console.log('• dev - https://dev.*.allyabase.com (production dev server)');
    console.log('• test - localhost:5111-5122 (3-base test ecosystem)');
    console.log('• local - localhost:3000-3007 (local development)');
  }
};

// Make functions globally available
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;
`;

// Package.json scripts template
const PACKAGE_SCRIPTS = {
  "dev": "npm run dev:local",
  "dev:dev": "NULLARY_ENV=dev npm run tauri dev",
  "dev:test": "NULLARY_ENV=test npm run tauri dev", 
  "dev:local": "NULLARY_ENV=local npm run tauri dev",
  "build": "npm run tauri build",
  "build:dev": "NULLARY_ENV=dev npm run tauri build",
  "build:test": "NULLARY_ENV=test npm run tauri build",
  "build:local": "NULLARY_ENV=local npm run tauri build"
};

// Apps to update (excluding those already done)
const APPS_TO_UPDATE = [
  'blogary', 'eventary', 'grocary', 'idothis', 'lexary', 'mybase', 
  'photary', 'postary', 'stackchat', 'viewaris', 'viewary', 'wikiary'
];

function updateApp(appName) {
  const appPath = path.join(__dirname, '..', '..', appName, appName);
  
  if (!fs.existsSync(appPath)) {
    console.log(`⚠️ Skipping ${appName} - directory not found`);
    return false;
  }

  const mainJsPath = path.join(appPath, 'src', 'main.js');
  
  if (!fs.existsSync(mainJsPath)) {
    console.log(`⚠️ Skipping ${appName} - main.js not found`);
    return false;
  }

  try {
    // Read existing main.js
    let mainContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Skip if already has environment config
    if (mainContent.includes('getEnvironmentConfig')) {
      console.log(`✅ ${appName} already has environment config`);
      return true;
    }

    // Add environment config after imports or at the beginning
    const envConfig = ENV_CONFIG_TEMPLATE(appName);
    
    if (mainContent.includes('import ')) {
      // ES6 modules - add after imports
      const lines = mainContent.split('\n');
      const lastImportIndex = lines.findLastIndex(line => line.startsWith('import '));
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, envConfig);
        mainContent = lines.join('\n');
      }
    } else {
      // No modules - add at the beginning after comments
      const lines = mainContent.split('\n');
      let insertIndex = 0;
      
      // Skip initial comments
      while (insertIndex < lines.length && 
             (lines[insertIndex].startsWith('//') || 
              lines[insertIndex].startsWith('/*') || 
              lines[insertIndex].startsWith(' *') ||
              lines[insertIndex].trim() === '')) {
        insertIndex++;
      }
      
      lines.splice(insertIndex, 0, envConfig);
      mainContent = lines.join('\n');
    }

    // Write updated content
    fs.writeFileSync(mainJsPath, mainContent);
    
    // Update package.json if it exists
    const packageJsonPath = path.join(appPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add environment scripts
      packageJson.scripts = { ...packageJson.scripts, ...PACKAGE_SCRIPTS };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    console.log(`✅ Updated ${appName}`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${appName}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Batch updating Nullary apps with environment configuration...\n');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const appName of APPS_TO_UPDATE) {
    const result = updateApp(appName);
    if (result === true) updated++;
    else if (result === false) skipped++;
    else errors++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n🎉 Environment configuration added to all apps!`);
  console.log(`\nUsage in any app:`);
  console.log(`• {appName}Env.switch('test') - Switch to test environment`);
  console.log(`• {appName}Env.current() - Show current environment`);
  console.log(`• {appName}Env.list() - List available environments`);
}

if (require.main === module) {
  main();
}

module.exports = { updateApp, ENV_CONFIG_TEMPLATE, PACKAGE_SCRIPTS };