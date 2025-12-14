# Grocary - Grocery Pickup App

## Overview

Grocary is a grocery pickup application built on The Nullary ecosystem that integrates with third-party grocery APIs, starting with Kroger. It provides a seamless interface for users to find stores, search products, and manage grocery pickup orders while leveraging Planet Nine's sessionless authentication and privacy-focused architecture.

## Architecture

### Core Philosophy
- **Privacy-First**: Uses sessionless authentication with cryptographic keys instead of personal information
- **Service Integration**: Acts as a bridge between Planet Nine apps and external grocery APIs
- **Cross-Platform**: Built with Tauri for desktop deployment across all platforms
- **Extensible**: Designed to support multiple grocery providers beyond Kroger

### Technology Stack
- **Frontend**: HTML, CSS, vanilla JavaScript with Tauri integration
- **Backend**: Rust with Tauri v2.6.2 + custom grocery service (Node.js/Express)
- **Authentication**: sessionless protocol with secp256k1 cryptographic keys
- **API Integration**: RESTful grocery service acting as OAuth2.0 proxy
- **External APIs**: Kroger API for store locations, product search, and cart management

## Project Structure

```
grocary/
├── grocary/                   # Main Tauri application
│   ├── src/
│   │   ├── index.html         # Main HTML interface
│   │   ├── main.js            # Application logic and API integration
│   │   ├── styles.css         # Styling and responsive design
│   │   └── assets/            # Static assets
│   ├── src-tauri/             # Tauri configuration and Rust backend
│   │   ├── Cargo.toml         # Rust dependencies
│   │   ├── tauri.conf.json    # Tauri v2 configuration
│   │   ├── src/
│   │   │   ├── main.rs        # Main Rust entry point
│   │   │   └── lib.rs         # Grocery service integration (planned)
│   │   └── icons/             # Application icons
│   └── package.json           # Node.js dependencies and scripts
└── CLAUDE.md                  # This documentation
```

## Grocery Service Integration

Grocary connects to a separate grocery microservice that handles OAuth2.0 flows and API proxying:

### Service Location
- **Path**: `/grocery/` (in project root, alongside other Planet Nine services)
- **Port**: 3007 (default)
- **Purpose**: OAuth2.0 proxy and API intermediary for external grocery services

### Service Architecture
```
grocery/
├── src/
│   ├── server/node/
│   │   ├── grocery.js           # Main Express server
│   │   ├── src/
│   │   │   ├── user/user.js     # User management with sessionless auth
│   │   │   ├── oauth/oauth.js   # OAuth2.0 flow handling
│   │   │   └── persistence/db.js # JSON file-based storage
│   │   └── package.json         # Service dependencies
│   └── client/javascript/
│       ├── grocery.js           # JavaScript client SDK
│       └── package.json         # Client dependencies
├── test/mocha/                  # Test suite (planned)
└── README.md                    # Service documentation
```

## Features

### Current Implementation ✅

**Frontend Interface**:
- ✅ Modern, responsive UI with gradient backgrounds and smooth animations
- ✅ Service connection status indicator with real-time health checking
- ✅ Account creation with sessionless authentication integration
- ✅ Kroger OAuth2.0 connection flow initiation
- ✅ Store locator with geolocation support
- ✅ Product search interface with real Kroger API results
- ✅ Local state persistence with localStorage
- ✅ Error handling and loading states

**Grocery Service Backend**:
- ✅ Express.js server with CORS and JSON parsing
- ✅ sessionless authentication integration for all endpoints
- ✅ User creation and management with cryptographic key mapping
- ✅ OAuth2.0 flow for Kroger API (authorization URL generation)
- ✅ OAuth callback handling and token storage
- ✅ OAuth status checking for connected accounts
- ✅ File-based persistence (JSON storage)
- ✅ Comprehensive error handling and validation

**Tauri Rust Backend** (January 2025):
- ✅ Complete sessionless cryptographic integration with secp256k1
- ✅ Real keypair generation using `sessionless::Sessionless::new()`
- ✅ Cryptographic signature creation with `serialize_compact()`
- ✅ HTTP proxy commands for all network calls (Tauri security requirement)
- ✅ Commands: `check_grocery_service`, `generate_keys`, `create_grocery_user`, `connect_kroger`
- ✅ Proper serialization of PublicKey (`.serialize()`), SecretKey (`.as_ref()`), Signature (`.serialize_compact()`)

**Client SDK**:
- ✅ JavaScript client library for grocery service integration
- ✅ sessionless signature generation and authentication
- ✅ User management methods (create, get, delete)
- ✅ OAuth flow initiation and status checking
- ✅ Browser and Node.js compatibility

## Technical Implementation Notes

### sessionless Cryptography in Rust

The Tauri backend uses the `sessionless` crate (v0.1.1) which wraps `secp256k1` for cryptographic operations:

**Key Generation**:
```rust
let sessionless = sessionless::Sessionless::new();
let private_key_hex = hex::encode(sessionless.private_key().as_ref());  // SecretKey: 32 bytes
let public_key_hex = hex::encode(sessionless.public_key().serialize()); // PublicKey: 33 bytes (compressed)
```

**Signature Creation**:
```rust
let timestamp = chrono::Utc::now().timestamp_millis();
let message = timestamp.to_string();
let signature = sessionless.sign(message.as_bytes());
let signature_hex = hex::encode(signature.serialize_compact());  // Signature: 64 bytes
```

**Key Reconstruction from Hex**:
```rust
let private_key_bytes = hex::decode(&private_key_hex)?;
let private_key = sessionless::PrivateKey::from_slice(&private_key_bytes)?;
let sessionless = sessionless::Sessionless::from_private_key(private_key);
```

**Critical Methods**:
- `PublicKey::serialize()` → `[u8; 33]` (compressed public key)
- `SecretKey::as_ref()` → `&[u8; 32]` (private key bytes reference)
- `SecretKey::from_slice()` → `Result<SecretKey, Error>` (construct from bytes)
- `Signature::serialize_compact()` → `[u8; 64]` (ECDSA compact signature)

### Tauri Security Architecture

**All HTTP requests must go through Rust commands** - JavaScript `fetch()` is blocked by Tauri's security model:

```javascript
// ❌ WRONG - fetch() doesn't work in Tauri
const response = await fetch('http://localhost:3007/user/create', { ... });

// ✅ CORRECT - Use Tauri invoke
const result = await window.__TAURI__.core.invoke('create_grocery_user', {
  serviceUrl: 'http://127.0.0.1:5118',
  privateKeyHex: keys.privateKey
});
```

**Rust Command Pattern**:
```rust
#[command]
async fn create_grocery_user(service_url: String, private_key_hex: String) -> Result<String, String> {
    // Generate sessionless signature
    // Make HTTP request with reqwest
    // Return JSON string result
}
```

### Planned Enhancements 🚧

**Kroger API Integration**:
- 🚧 Store locator API integration (find stores by location)
- 🚧 Product search and catalog browsing
- 🚧 Shopping cart management and manipulation
- 🚧 Order placement and pickup scheduling
- 🚧 Price comparison and promotional offers
- 🚧 Inventory checking and availability

**Advanced Features**:
- 🚧 Multiple grocery provider support (beyond Kroger)
- 🚧 Shopping list management with persistence
- 🚧 Favorites and frequently purchased items
- 🚧 Pickup scheduling and time slot management
- 🚧 Order history and receipt management
- 🚧 Push notifications for order status updates
- 🚧 Loyalty program integration

**Planet Nine Integration**:
- 🚧 MAGIC protocol integration for payments
- 🚧 Addie integration for transaction splitting
- 🚧 BDO integration for data storage and synchronization
- 🚧 Julia integration for peer-to-peer messaging about grocery lists
- 🚧 Pref integration for user preferences and settings

## API Endpoints

### Grocery Service Endpoints

#### User Management

**`PUT /user/create`** - Create grocery service user
```javascript
{
  "pubKey": "sessionless_public_key",
  "timestamp": 1234567890,
  "signature": "sessionless_signature"
}
```

**`GET /user/:uuid`** - Get user information
- Query params: `timestamp`, `signature`

**`DELETE /user/:uuid`** - Delete user account
- Body: `timestamp`, `signature`

#### OAuth Integration

**`POST /user/:uuid/oauth/kroger/authorize`** - Initiate Kroger OAuth
```javascript
{
  "timestamp": 1234567890,
  "signature": "sessionless_signature"
}
```

**`GET /oauth/kroger/callback`** - OAuth callback (automatic)
- Handles authorization code exchange for access tokens

**`GET /user/:uuid/oauth/status`** - Check OAuth connection status
- Query params: `timestamp`, `signature`

### Frontend API Integration

```javascript
// Check service status
const response = await fetch('http://localhost:3007/health');

// Create user account
const user = await fetch('http://localhost:3007/user/create', {
  method: 'PUT',
  body: JSON.stringify({ pubKey, timestamp, signature })
});

// Initiate Kroger connection
const authResult = await fetch(`http://localhost:3007/user/${uuid}/oauth/kroger/authorize`, {
  method: 'POST',
  body: JSON.stringify({ timestamp, signature })
});
```

## Configuration

### Environment Variables

**Grocery Service**:
```bash
KROGER_CLIENT_ID=your_kroger_client_id
KROGER_CLIENT_SECRET=your_kroger_client_secret
KROGER_REDIRECT_URI=http://localhost:3007/oauth/kroger/callback
SUBDOMAIN=dev
DB_DIR=./data
```

**Development Setup**:
- Service runs on `http://localhost:3007`
- OAuth callbacks handled automatically
- JSON file storage in `./data/grocery-users.json`
- CORS enabled for frontend development

### Kroger API Configuration

To enable Kroger integration:

1. **Register at Kroger Developer Portal**:
   - Visit `https://developer.kroger.com`
   - Create developer account and application
   - Obtain client ID and client secret

2. **Configure OAuth Scopes**:
   - `profile.compact` - Basic user profile access
   - `cart.basic:write` - Shopping cart management
   - Additional scopes as needed for features

3. **Set Redirect URI**:
   - Development: `http://localhost:3007/oauth/kroger/callback`
   - Production: Configure appropriate domain

## Development Workflow

### Environment Configuration

grocary supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
grocaryEnv.switch('test')
location.reload()

// Check current environment
grocaryEnv.current()

// List all environments
grocaryEnv.list()
```

**Via Package Scripts**:
```bash
npm run dev:dev    # Dev server (default)
npm run dev:test   # Test ecosystem  
npm run dev:local  # Local development
```

#### Programming API
```javascript
// Get current environment config
const config = getEnvironmentConfig();
console.log(config.env);        // 'dev', 'test', or 'local'
console.log(config.services);   // Service URLs

// Get specific service URL
const sanoraUrl = getServiceUrl('sanora');
const bdoUrl = getServiceUrl('bdo');
```


### Prerequisites
- Node.js 16+ and npm installed
- Rust toolchain installed
- Kroger API credentials (optional for basic testing)

### Running the Application

### Environment Configuration

grocary supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
grocaryEnv.switch('test')
location.reload()

// Check current environment
grocaryEnv.current()

// List all environments
grocaryEnv.list()
```

**Via Package Scripts**:
```bash
npm run dev:dev    # Dev server (default)
npm run dev:test   # Test ecosystem  
npm run dev:local  # Local development
```

#### Programming API
```javascript
// Get current environment config
const config = getEnvironmentConfig();
console.log(config.env);        // 'dev', 'test', or 'local'
console.log(config.services);   // Service URLs

// Get specific service URL
const sanoraUrl = getServiceUrl('sanora');
const bdoUrl = getServiceUrl('bdo');
```


1. **Start Grocery Service**:
   ```bash
   cd grocery/src/server/node
   npm install
   export KROGER_CLIENT_ID="your_client_id"
   export KROGER_CLIENT_SECRET="your_client_secret"
   npm start
   ```

2. **Start Tauri App**:
   ```bash
   cd the-nullary/grocary/grocary
   npm install
   npm run tauri dev
   ```

3. **Test Integration**:
   - App should show "Connected" status for grocery service
   - Create user account to test sessionless authentication
   - Try Kroger OAuth flow (requires valid API credentials)

### Testing Workflow

**Development Testing**:
- Service health checking works without credentials
- User creation with real sessionless authentication
- UI interactions and state management
- Error handling for offline/unavailable services

**Full Integration Testing** (Requires Kroger API credentials):
- Real OAuth2.0 flow with Kroger
- Store locator functionality
- Product search and catalog access
- Shopping cart operations

### Common Development Tasks

**Adding New Grocery Providers**:
1. Extend OAuth configuration in `grocery/src/server/node/src/oauth/oauth.js`
2. Add provider-specific API integration
3. Update frontend UI to support multiple providers
4. Add provider selection in user interface

**Enhancing sessionless Integration**:
1. Enhance sessionless authentication with advanced key management
2. Implement proper signature verification
3. Add key management and persistence
4. Integrate with Planet Nine keychain services

## Security Considerations

### Authentication & Authorization
- **sessionless Protocol**: Uses secp256k1 cryptographic signatures instead of passwords
- **No Personal Data**: No email addresses or personal information required
- **Token Security**: OAuth tokens stored securely and encrypted at rest
- **API Key Management**: External API credentials managed via environment variables

### Data Privacy
- **Local Storage**: User data stored locally when possible
- **Encrypted Transit**: All API communications over HTTPS
- **Token Refresh**: Automatic OAuth token refresh and rotation
- **Data Minimization**: Only collect necessary data for grocery functionality

### API Security
- **Request Signing**: All grocery service requests signed with sessionless
- **Timestamp Validation**: Requests include timestamps to prevent replay attacks
- **CORS Configuration**: Appropriate CORS settings for development and production
- **Input Validation**: Comprehensive validation of all user inputs and API responses

## Integration Points

### Planet Nine Services
- **sessionless**: Cryptographic authentication for all requests
- **Grocery Service**: Custom microservice for OAuth and API proxying
- **Future**: Addie (payments), BDO (storage), Julia (messaging), Pref (settings)

### External APIs
- **Kroger API**: Store locations, product catalog, cart management, orders
- **Future Providers**: Integration points for additional grocery services
- **Geolocation**: Browser geolocation API for store finding

### Tauri Integration
- **File System**: Local storage for caching and offline support
- **Shell**: Opening external OAuth URLs in system browser
- **Notifications**: Order status and pickup reminders (planned)

## Current Status

### Completed ✅
- ✅ Complete grocery service implementation with sessionless authentication
- ✅ OAuth2.0 flow for Kroger API integration
- ✅ Tauri application with modern UI and responsive design
- ✅ Service health monitoring and connection status
- ✅ **Real sessionless key generation with secp256k1 cryptography** (January 2025)
- ✅ **Complete Rust backend with HTTP proxy commands** (January 2025)
- ✅ **Proper cryptographic signature serialization** (January 2025)
- ✅ Store locator interface with geolocation support
- ✅ Product search interface and results display
- ✅ State persistence and error handling
- ✅ Client SDK for service integration
- ✅ Environment configuration (dev/test/local) support

### In Progress 🚧
- 🚧 Debugging service-side signature verification (receiving 403 auth errors)
- 🚧 Kroger API integration (store locator, product search)
- 🚧 Shopping cart functionality
- 🚧 Order placement and pickup scheduling

### Future Roadmap 🔮
- 🔮 Multiple grocery provider support
- 🔮 MAGIC protocol payment integration
- 🔮 Enhanced Planet Nine service integration
- 🔮 Mobile app deployment via Tauri
- 🔮 Offline shopping list management
- 🔮 Social features for sharing grocery lists

## Contributing

### Code Style
- Follow existing Planet Nine service patterns
- Use sessionless authentication for all API calls
- Implement comprehensive error handling
- Add unit tests for new functionality

### Adding Features
1. **Frontend**: Add UI components following existing design patterns
2. **Service**: Extend grocery service with new endpoints
3. **Integration**: Update client SDK for new functionality
4. **Testing**: Add both unit tests and integration tests

### API Provider Integration
1. **OAuth Setup**: Configure OAuth2.0 flow for new provider
2. **API Mapping**: Map provider APIs to standard grocery service interface
3. **Error Handling**: Implement provider-specific error handling
4. **Documentation**: Update API documentation and examples

Grocary demonstrates how Planet Nine applications can seamlessly integrate with external services while maintaining privacy and user control through sessionless authentication and modular service architecture.