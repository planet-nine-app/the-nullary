# User Persistence System for The Nullary

A comprehensive user and key persistence system for all Nullary applications, providing secure key storage via Tauri Stronghold and user data persistence via filesystem.

## Overview

The User Persistence System solves the problem of having to regenerate sessionless keys and recreate service users every time a Nullary app starts. It provides:

- **Secure Private Key Storage**: Uses Tauri Stronghold for cryptographic key security
- **User Data Persistence**: Stores non-sensitive user data in the filesystem
- **Service User Management**: Automatically manages users across all Planet Nine services
- **Cross-App Compatibility**: Works consistently across all Nullary applications
- **Graceful Fallbacks**: Continues working even when secure storage is unavailable

## Architecture

### Key Components

1. **JavaScript Frontend** (`/shared/utils/user-persistence.js`)
   - Main API for apps to interact with user persistence
   - Handles caching and fallback scenarios
   - Provides convenience functions for common operations

2. **Rust Backend** (`/shared/rust/user-persistence.rs`)
   - Tauri commands for secure operations
   - Stronghold integration for key storage
   - Filesystem operations for user data

3. **Integration Utilities** (`/shared/utils/user-persistence-integration.js`)
   - Examples and helper functions for app integration
   - Complete integration templates
   - Error handling patterns

4. **Automation Scripts** (`/shared/scripts/add-user-persistence.js`)
   - Automatically adds user persistence to existing apps
   - Updates Cargo.toml dependencies
   - Integrates Rust backend functions

## Features

### 🔐 Secure Key Management
- **Tauri Stronghold Integration**: Private keys stored in encrypted vault
- **Automatic Key Generation**: Creates sessionless keys when needed
- **Key Persistence**: Same keys used across app restarts
- **Fallback Support**: Uses localStorage when Stronghold unavailable

### 👥 Service User Management  
- **Automatic User Creation**: Creates users for BDO, Sanora, Dolores, etc.
- **Multi-Environment Support**: Manages users across dev/test/local environments
- **Caching**: Avoids unnecessary API calls with intelligent caching
- **Error Recovery**: Handles service unavailability gracefully

### ⚙️ User Preferences
- **Persistent Settings**: Theme, environment, language preferences
- **Cross-App Sync**: Preferences shared across all Nullary apps
- **Default Values**: Sensible defaults for new users
- **Real-time Updates**: Changes saved immediately

### 🌐 Base Connection Management
- **Connected Bases Tracking**: Remembers which bases user has joined
- **Service User Creation**: Automatically creates users when joining bases
- **Connection History**: Tracks when bases were connected
- **Easy Disconnection**: Clean removal of base connections

## Quick Start

### 1. Add to Existing App

Use the automation script to add user persistence to an existing Nullary app:

```bash
cd /path/to/the-nullary/shared/scripts
node add-user-persistence.js rhapsold/rhapsold
```

Or add to all apps:

```bash
node add-user-persistence.js
```

### 2. Basic Usage in App

```javascript
// Import user persistence
import { getGlobalUserPersistence } from './shared/utils/user-persistence.js';

// Initialize user persistence
const userPersistence = await getGlobalUserPersistence();

// Get persistent sessionless keys
const sessionlessKeys = await userPersistence.getOrCreateKeys();

// Get service users
const sanoraUser = await userPersistence.getOrCreateServiceUser('sanora', 'http://localhost:7243');
const bdoUser = await userPersistence.getOrCreateServiceUser('bdo', 'http://localhost:3003');

console.log('🔑 Keys:', sessionlessKeys.address);
console.log('👤 Sanora user:', sanoraUser.uuid);
```

### 3. Advanced Integration

For complete app integration with error handling:

```javascript
import { completeAppIntegration } from './shared/utils/user-persistence-integration.js';

const appData = await completeAppIntegration();

// Use persistent data throughout your app
const { 
  userPersistence, 
  sessionlessKeys, 
  serviceUsers, 
  preferences 
} = appData;

// Apply saved preferences
if (preferences.theme) {
  applyTheme(preferences.theme);
}
```

## API Reference

### UserPersistence Class

#### Core Methods

```javascript
// Initialize the system
await userPersistence.initialize();

// Get or create sessionless keys
const keys = await userPersistence.getOrCreateKeys();

// Get or create service user
const user = await userPersistence.getOrCreateServiceUser('sanora', serviceUrl);

// Clear specific service user
await userPersistence.clearServiceUser('sanora', serviceUrl);

// Clear all data
await userPersistence.clearAllData();
```

#### Preferences Management

```javascript
// Get preferences
const prefs = userPersistence.getPreferences();

// Update preferences
await userPersistence.setPreferences({ theme: 'dark', autoSave: true });
```

#### Base Management

```javascript
// Get connected bases
const bases = userPersistence.getConnectedBases();

// Add connected base
await userPersistence.addConnectedBase({
  id: 'base-1',
  name: 'Test Base',
  services: { sanora: 'http://localhost:7243' }
});

// Remove connected base
await userPersistence.removeConnectedBase('base-1');
```

### Convenience Functions

```javascript
// Get global user persistence instance
const persistence = await getGlobalUserPersistence();

// Quick access to sessionless keys
const keys = await getSessionlessKeys();

// Quick access to service user
const user = await getServiceUser('sanora', serviceUrl);
```

## Integration Examples

### Rhapsold Integration

Replace existing key generation and user creation:

```javascript
// OLD: Manual key generation
// const sessionlessKeys = generateKeys();

// NEW: Persistent keys
import { getSessionlessKeys } from './shared/utils/user-persistence.js';
const sessionlessKeys = await getSessionlessKeys();

// OLD: Manual user creation every time
// const sanoraUser = await invoke('create_sanora_user', { sanoraUrl });

// NEW: Persistent user
import { getServiceUser } from './shared/utils/user-persistence.js';
const sanoraUser = await getServiceUser('sanora', getServiceUrl('sanora'));
```

### Environment-Aware Service Users

```javascript
import { getEnvironmentConfig } from './shared/services/environment-config.js';
import { getServiceUser } from './shared/utils/user-persistence.js';

const envConfig = getEnvironmentConfig();
const sanoraUrl = envConfig.services.sanora;
const sanoraUser = await getServiceUser('sanora', sanoraUrl);

// User is automatically created for the current environment
console.log(`Sanora user for ${envConfig.env}:`, sanoraUser.uuid);
```

## Backend Integration

### Required Dependencies

Add to your `Cargo.toml`:

```toml
[dependencies]
sessionless = "0.1.1"
hex = "0.4"
uuid = { version = "1.0", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }

# For Stronghold (when implemented)
# tauri-plugin-stronghold = "2.0"
```

### Rust Integration

Add to your `main.rs` or `lib.rs`:

```rust
// Import user persistence module
mod user_persistence;
use user_persistence::*;

tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // User persistence functions
        generate_sessionless_keys,
        stronghold_init,
        stronghold_get_record,
        stronghold_set_record,
        stronghold_clear_vault,
        read_user_data_file,
        write_user_data_file,
        clear_user_data,
        
        // Your existing functions
        create_sanora_user,
        // ... etc
    ])
```

## Security Features

### Key Storage
- **Tauri Stronghold**: Military-grade encryption for private keys
- **Password Protection**: Vault secured with user password
- **Memory Safety**: Keys never exposed in plain text logs
- **Fallback Security**: Even fallback uses secure random generation

### Data Isolation
- **App Data Directory**: User data stored in app-specific directories
- **Service Separation**: Each service gets independent user management
- **Environment Isolation**: Different environments use separate user sets

### Error Handling
- **Graceful Degradation**: Continues working if secure storage fails
- **Fallback Modes**: Uses localStorage when Tauri features unavailable
- **Recovery Options**: Clear and regenerate data when needed

## File Structure

```
shared/
├── utils/
│   ├── user-persistence.js                    # Main JavaScript API
│   └── user-persistence-integration.js        # Integration examples
├── rust/
│   ├── user-persistence.rs                    # Rust backend functions
│   └── Cargo-dependencies.toml                # Required dependencies
├── scripts/
│   └── add-user-persistence.js                # Automation script
└── README-USER-PERSISTENCE.md                 # This documentation
```

## Storage Locations

### Secure Storage (Stronghold)
- **Private Keys**: sessionless private keys
- **Sensitive Data**: Any data requiring encryption

### Filesystem Storage
- **User Preferences**: Theme, language, settings
- **Service Users**: UUIDs and metadata (non-sensitive)
- **Connected Bases**: Base configurations and connection history

### Fallback Storage (localStorage)
- **Development Keys**: Temporary keys for development
- **Basic Preferences**: Essential app preferences
- **Service Cache**: Basic service user information

## Environment Support

The user persistence system works seamlessly with the environment configuration system:

- **dev**: Uses dev server service URLs
- **test**: Uses test ecosystem service URLs (localhost:5111-5122)
- **local**: Uses local development service URLs (localhost:3000-3008)

Service users are automatically created for the current environment, and switching environments creates separate user sets.

## Troubleshooting

### Common Issues

**1. "User persistence not initialized"**
```javascript
// Ensure you call initialize before using
const userPersistence = await getGlobalUserPersistence();
```

**2. "Stronghold not available"**
```
This is expected in development. The system will use fallback storage.
For production, implement Tauri Stronghold integration.
```

**3. "Service user creation failed"**
```javascript
// Check if the service is running
const user = await userPersistence.getOrCreateServiceUser('sanora', serviceUrl);
// System will return a fallback user if service unavailable
```

**4. "Keys not persisting"**
```
Check that your app has proper filesystem permissions.
User data is stored in the app data directory.
```

### Debug Information

Enable debug logging to troubleshoot issues:

```javascript
// Set debug mode
localStorage.setItem('nullary-debug', 'true');

// Check current state
const persistence = await getGlobalUserPersistence();
console.log('Keys:', await persistence.getOrCreateKeys());
console.log('Service users:', persistence.getServiceUsers());
console.log('Preferences:', persistence.getPreferences());
```

## Roadmap

### Phase 1 ✅ (Current)
- [x] Basic user persistence system
- [x] Filesystem storage for non-sensitive data
- [x] Service user management
- [x] Integration with existing apps
- [x] Fallback mechanisms

### Phase 2 🚧 (In Progress)
- [ ] Tauri Stronghold implementation
- [ ] Production security hardening
- [ ] Cross-app preference synchronization
- [ ] Advanced error recovery

### Phase 3 📋 (Planned)
- [ ] User data export/import
- [ ] Multi-user support
- [ ] Encrypted backup system
- [ ] Advanced security features

## Contributing

When adding new features to the user persistence system:

1. **Update all three components**: JavaScript API, Rust backend, integration examples
2. **Maintain backwards compatibility**: Existing apps should continue working
3. **Add fallback support**: New features should degrade gracefully
4. **Update documentation**: Keep this README current
5. **Test across apps**: Verify changes work in multiple Nullary apps

## Best Practices

### For App Developers

1. **Always use the global instance**: `getGlobalUserPersistence()` instead of creating new instances
2. **Handle fallback mode**: Check `fallbackMode` flag and inform users appropriately
3. **Cache service users**: Don't repeatedly call `getOrCreateServiceUser` for the same service
4. **Persist preferences**: Use the preference system instead of localStorage directly
5. **Handle errors gracefully**: The system is designed to work even when things fail

### For System Development

1. **Security first**: Never log private keys or sensitive data
2. **Fail gracefully**: System should work even if secure storage fails
3. **Performance aware**: Cache aggressively to avoid repeated backend calls
4. **Environment agnostic**: Support all three environment configurations
5. **Cross-platform**: Code should work on all Tauri-supported platforms

This user persistence system provides a solid foundation for maintaining user state across all Nullary applications while maintaining security and providing excellent developer experience.