# Environment Configuration System for Nullary Apps

This document describes the shared environment configuration system that allows all Nullary apps to easily switch between different allyabase environments.

## Overview

All Nullary apps now support three environments:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

## Files

- **`/shared/services/environment-config.js`** - Shared configuration system
- **`/shared/utils/environment-integration.js`** - Integration utilities
- **`/shared/scripts/add-environment-config.js`** - Batch update script

## Usage in Apps

Each app now has environment switching functions available in the browser console:

### Console Commands

```javascript
// Switch environments
ninefyEnv.switch('test')      // Switch ninefy to test environment
rhapsoldEnv.switch('dev')     // Switch rhapsold to dev environment
lexaryEnv.switch('local')     // Switch lexary to local environment

// Check current environment
ninefyEnv.current()           // Show current ninefy environment
screenaryEnv.current()        // Show current screenary environment

// List available environments
ninefyEnv.list()              // List all available environments
```

### JavaScript API

```javascript
// Get current environment config
const config = getEnvironmentConfig();
console.log(config.env);        // 'dev', 'test', or 'local'
console.log(config.services);   // Object with service URLs

// Get specific service URL
const sanoraUrl = getServiceUrl('sanora');
const bdoUrl = getServiceUrl('bdo');
```

## Environment Details

### Dev Environment
```javascript
{
  sanora: 'https://dev.sanora.allyabase.com/',
  bdo: 'https://dev.bdo.allyabase.com/',
  dolores: 'https://dev.dolores.allyabase.com/',
  fount: 'https://dev.fount.allyabase.com/',
  addie: 'https://dev.addie.allyabase.com/',
  // ... all 12+ services
}
```

### Test Environment (3-Base Ecosystem)
```javascript
{
  sanora: 'http://localhost:5121/',
  bdo: 'http://localhost:5114/',
  dolores: 'http://localhost:5118/',
  fount: 'http://localhost:5117/',
  addie: 'http://localhost:5116/',
  // ... all services mapped to test ports
}
```

### Local Environment
```javascript
{
  sanora: 'http://localhost:7243/',
  bdo: 'http://localhost:3003/',
  dolores: 'http://localhost:3005/',
  fount: 'http://localhost:3002/',
  addie: 'http://localhost:3005/',
  // ... all services on local ports
}
```

## Apps Updated

✅ **ninefy** - Digital goods marketplace
✅ **rhapsold** - Minimalist blogging platform  
✅ **screenary** - Multi-purpose social app
✅ **blogary** - Traditional blogging
✅ **eventary** - Event management
✅ **grocary** - Grocery/shopping
✅ **idothis** - Business service listings
✅ **lexary** - Text/blog feed
✅ **mybase** - Social networking aggregation
✅ **photary** - Photo sharing
✅ **postary** - General posting
✅ **stackchat** - P2P messaging
✅ **viewaris** - Video sharing platform
✅ **viewary** - Video sharing

## Package.json Scripts

All apps now include environment-specific npm scripts:

```json
{
  "scripts": {
    "dev": "npm run dev:local",
    "dev:dev": "NULLARY_ENV=dev npm run tauri dev",
    "dev:test": "NULLARY_ENV=test npm run tauri dev", 
    "dev:local": "NULLARY_ENV=local npm run tauri dev",
    "build:dev": "NULLARY_ENV=dev npm run tauri build",
    "build:test": "NULLARY_ENV=test npm run tauri build",
    "build:local": "NULLARY_ENV=local npm run tauri build"
  }
}
```

## How It Works

1. **Storage**: Environment choice is saved in `localStorage` with key `nullary-env`
2. **Default**: Apps default to `dev` environment if nothing is stored
3. **Global Functions**: Each app exposes `getEnvironmentConfig()` and `getServiceUrl()`
4. **Console API**: Each app gets its own environment controls (e.g., `ninefyEnv`, `rhapsoldEnv`)

## Development Workflow

### Testing Against Your 3-Base Ecosystem
```bash
cd the-nullary/ninefy/ninefy
npm run tauri dev
# In browser console:
ninefyEnv.switch('test')
location.reload()
```

### Testing Against Dev Server
```bash
cd the-nullary/rhapsold/rhapsold  
npm run tauri dev
# In browser console:
rhapsoldEnv.switch('dev')
location.reload()
```

### Local Development
```bash
cd the-nullary/lexary/lexary
npm run tauri dev
# In browser console:
lexaryEnv.switch('local')
location.reload()
```

## Adding to New Apps

The environment configuration is automatically added to new apps. For manual integration:

1. **Add Environment Config**: Copy the config block from any existing app's `main.js`
2. **Update Package.json**: Add the environment scripts
3. **Replace Hardcoded URLs**: Use `getServiceUrl('serviceName')` instead of hardcoded URLs

## Benefits

- **Easy Testing**: Switch between local test ecosystem and production dev server
- **Development Flexibility**: Test against different service configurations  
- **Consistent API**: Same environment controls across all apps
- **No Code Changes**: Switch environments without editing source code
- **Persistent Choice**: Environment preference remembered across app restarts

## Technical Details

- **Fallback Support**: Apps work even if shared config fails to load
- **Service Discovery**: Automatic detection of available services
- **Port Mapping**: Complete mapping of test ecosystem port ranges (5111-5122)
- **URL Validation**: Proper URL formatting with trailing slashes
- **Error Handling**: Graceful fallbacks when services unavailable

This system enables seamless development and testing across the entire Planet Nine ecosystem, making it easy to validate apps against your local test infrastructure or the production dev servers.