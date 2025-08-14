# Covenant GUI - Magical Contract Management Application

## Overview

Covenant GUI is a Nullary application for creating and managing magical covenant contracts with multi-party signatures, MAGIC spell integration, and beautiful SVG visualizations. It provides a complete graphical interface for the Planet Nine covenant service, enabling users to create contracts, invite participants, track progress, and visualize contract states.

## Current Status (January 2025)

### ✅ Completed Features

- **Complete Application Structure**: Full Tauri-based GUI application with Rust backend and JavaScript frontend
- **Environment Configuration**: Multi-environment support (dev/test/local) with browser console switching
- **Contract Creation Interface**: SVG-based form for creating contracts with participants and steps
- **Contract Management Dashboard**: List view with progress tracking and status indicators
- **Contract Visualization**: Integration with covenant service SVG generation
- **Multi-Instance Connection System**: URL-based connection sharing for different keypairs
- **Sessionless Authentication**: Full cryptographic authentication with unique key generation per instance
- **Real Service Integration**: Direct integration with existing covenant service via Rust client
- **Enhanced UUID Management**: Automatic clipboard copying, auto-insertion into forms, and comprehensive guidance
- **Improved Form Instructions**: Clear, detailed guidance for both participants and contract steps

### 🏗️ Architecture

#### Three-Screen Application
1. **Contracts Dashboard**: List and manage existing contracts with progress tracking
2. **Contract Creation**: Form-based contract creation with participants and steps
3. **Contract Viewer**: Detailed contract view with step signing and SVG visualization
4. **Connection Screen**: Multi-instance connection sharing for testing

#### Technology Stack
- **Frontend**: SVG-first UI following Nullary design principles with Sanora form-widget integration
- **Backend**: Tauri v2 with Rust integration to covenant service
- **Authentication**: Sessionless protocol with process-ID based unique keys
- **Services**: Direct covenant service integration with environment switching
- **Storage**: Server-side BDO storage via covenant service
- **Forms**: Dynamic form-widget loading from Sanora service for consistent UI

## Key Features

### Multi-Party Contract Management

- **Form-Widget Contract Creation**: Dynamic form loading from Sanora with consistent styling
- **Enhanced UUID Management**: Automatic clipboard copying, smart auto-insertion, and comprehensive user guidance
- **Intuitive Participant Entry**: Clear instructions, example UUIDs, and tips for gathering participant information
- **Step-by-Step Contract Design**: Detailed guidance for creating contract steps with milestone-based progression
- **Real-Time Validation**: Form-widget provides instant validation and visual feedback
- **Participant Management**: Multi-line textarea for participant UUIDs with proper parsing and helper tools
- **Sequential Step Execution**: Contract steps with individual signing requirements and clear progression tracking
- **Progress Tracking**: Visual progress bars and completion indicators
- **Status Management**: Active, completed, and pending contract states

### Cryptographic Security

- **Sessionless Authentication**: Each app instance has unique cryptographic keys
- **Dual Signature System**: Both general auth and step-specific signatures required
- **Multi-Instance Support**: Different PRIVATE_KEY environment variables for testing
- **Secure Communication**: All operations authenticated with covenant service

### Beautiful Visualizations

- **SVG Contract Display**: Server-generated beautiful contract visualizations
- **Theme Support**: Light and dark themes for contract SVG rendering
- **Progress Visualization**: Real-time progress bars and completion indicators
- **Interactive Elements**: Clickable contract cards and signing buttons

### Connection Sharing System

- **URL Generation**: Create shareable URLs for other app instances
- **Cross-Instance Communication**: Connect multiple app instances for testing
- **Unique Key Management**: Each instance maintains separate cryptographic identity
- **Self-Connection Prevention**: Validates against connecting to same instance

## Technical Implementation

### Environment Configuration

Supports three deployment environments:

```javascript
// Dev environment (default)
covenant: 'https://dev.covenant.allyabase.com/'

// Test environment (3-base ecosystem)
covenant: 'http://127.0.0.1:5122/'

// Local environment (standard local dev)
covenant: 'http://127.0.0.1:3011/'
```

#### Environment Switching

**Browser Console Commands (GUI)**:
```javascript
// Switch environments
covenantEnv.switch('test')
covenantEnv.switch('dev')
covenantEnv.switch('local')

// Check current environment
covenantEnv.current()

// List available environments
covenantEnv.list()
```

**Browser Console Commands (Web Viewer)**:
```javascript
// Environment info (server-determined)
covenantViewerEnv.current()
covenantViewerEnv.list()
covenantViewerEnv.switch('test') // Shows restart instructions
```

**Package Scripts**:
```bash
# Covenant GUI
npm run dev         # Dev server (default)
npm run dev:dev     # Dev server (explicit)
npm run dev:test    # Test ecosystem
npm run dev:local   # Local development

# Covenant Web Viewer
npm run dev         # Dev server (default)
npm run dev:dev     # Dev server (explicit)
npm run dev:test    # Test ecosystem
npm run dev:local   # Local development
```

### Multi-Instance Testing

#### Running Multiple Instances
```bash
# First instance (default keys)
npm run tauri dev

# Second instance (different keys)
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef npm run tauri dev

# Test environment
COVENANT_ENV=test npm run tauri dev
```

#### Connection Flow
1. **Instance A**: Generate connection URL via "🔗 Connect" screen
2. **Instance B**: Process connection URL to establish shared participant identity
3. **Contract Creation**: Either instance can create contracts with both participants
4. **Multi-Party Signing**: Each instance can sign contract steps with their unique keys

### Backend Integration

#### Rust Backend Functions
```rust
// Contract management
create_contract(title, description, participants, steps) -> String
get_contracts() -> Vec<CovenantConnection>
get_contract(contract_uuid) -> Contract
sign_step(contract_uuid, step_id) -> bool

// Visualization
get_contract_svg(contract_uuid, theme) -> String

// Multi-instance support
get_user_info() -> (String, String)  // UUID, public key
generate_connection_url() -> String
process_connection_url(url) -> String
```

#### Sessionless Integration
- **Unique Keys**: Process-ID based key generation prevents conflicts
- **User UUID**: Consistent UUID generation for each app instance
- **Authentication**: All covenant service calls authenticated with sessionless signatures
- **Multi-Party Support**: Each instance maintains separate cryptographic identity

### SVG-First UI Architecture

#### Component Structure
- **createSVGContainer()**: Standard SVG canvas with theme colors
- **createSVGText()**: Themed text elements with typography
- **createSVGRect()**: Rounded rectangles with theme integration
- **createSVGButton()**: Interactive buttons with hover effects
- **createContractCard()**: Contract list items with progress indicators

#### Screen Components
- **createContractsScreen()**: Main dashboard with contract list
- **createContractCreationScreen()**: Form-based contract creation
- **createContractViewScreen()**: Detailed contract view with signing
- **createConnectionScreen()**: Multi-instance connection management

#### Theme System
```javascript
const theme = {
    colors: {
        primary: '#64b5f6',      // Blue accent
        secondary: '#81c784',    // Green success
        background: '#1a1a2e',   // Dark background
        surface: '#16213e',      // Card surfaces
        accent: '#ffb74d',       // Orange highlights
        text: '#ffffff',         // Primary text
        textSecondary: '#b0bec5' // Secondary text
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        titleSize: 24,
        headerSize: 18,
        bodySize: 14,
        smallSize: 12
    }
}
```

## Service Integration

### Covenant Service Features

The GUI leverages the complete covenant service infrastructure:

- **Contract CRUD**: Create, read, update, delete contracts
- **Multi-Party Signatures**: Dual signature system for enhanced security
- **MAGIC Spell Integration**: Automatic spell execution on step completion
- **BDO Storage**: Persistent contract storage via BDO service
- **SVG Visualization**: Server-generated beautiful contract visualizations
- **Progress Tracking**: Real-time contract and step completion status

### API Integration Patterns

```javascript
// Contract creation with sessionless auth
const contractUuid = await invoke('create_contract', {
    title: 'Freelance Contract',
    description: 'Web development project',
    participants: ['uuid-1', 'uuid-2'],
    steps: ['Proposal', 'Development', 'Delivery']
});

// Step signing with dual authentication
const result = await invoke('sign_step', {
    contractUuid: 'contract-uuid',
    stepId: 'step-1'
});

// SVG visualization retrieval
const svg = await invoke('get_contract_svg', {
    contractUuid: 'contract-uuid',
    theme: 'dark'
});
```

## File Structure

```
covenant/
├── covenant/
│   ├── src/
│   │   ├── main-no-imports.js         # Main SVG-first application (no ES6 modules)
│   │   ├── covenant-form-config.json  # Form-widget configuration for contract creation
│   │   └── index.html                 # Application shell
│   ├── src-tauri/
│   │   ├── src/
│   │   │   ├── lib.rs                 # Rust backend with covenant integration
│   │   │   └── main.rs                # Tauri entry point
│   │   ├── Cargo.toml                 # Rust dependencies
│   │   └── tauri.conf.json            # Tauri configuration
│   ├── package.json                   # NPM configuration with env scripts
│   └── CLAUDE.md                      # This documentation
└── README.md                          # Project overview
```

## Dependencies

### Rust Backend
- `tauri`: Cross-platform application framework
- `covenant-rs`: Covenant service client SDK
- `sessionless`: Cryptographic authentication
- `serde`: Data serialization
- `chrono`: DateTime handling
- `uuid`: Unique identifier generation
- `reqwest`: HTTP client

### JavaScript Frontend
- `@tauri-apps/api`: Tauri JavaScript API (no ES6 modules)
- Vanilla JavaScript with SVG manipulation
- Environment configuration embedded directly (no imports)
- No external UI frameworks (following Nullary principles)

## Usage Workflows

### Creating a New Contract

1. **Launch Application**: `npm run tauri dev`
2. **Contract Creation**: Click "➕ New Contract" button
3. **Get Your UUID**: Click "Copy My UUID" button to automatically copy your UUID and insert it into the participants field
4. **Add Participants**: Paste other participants' UUIDs, one per line (ask them to share their UUIDs with you)
5. **Define Contract Steps**: Enter contract steps one per line - each step becomes a milestone that participants can sign individually
6. **Example Steps**:
   ```
   Proposal and scope agreement
   Initial payment (50%)
   Development phase begins
   Code review and testing
   Final delivery and documentation
   Final payment (50%)
   Project completion
   ```
7. **Create Contract**: Click "✨ Create Contract" to submit
8. **View Results**: Contract appears in dashboard with "Pending" status

### Multi-Instance Collaboration

1. **Instance Setup**:
   ```bash
   # Terminal 1 (Alice)
   npm run tauri dev
   
   # Terminal 2 (Bob) 
   PRIVATE_KEY=different-key npm run tauri dev
   ```

2. **Connection Establishment**:
   - Alice: Click "🔗 Connect" → "📤 Generate URL"
   - Bob: Click "🔗 Connect" → Paste Alice's URL → "🔗 Process URL"

3. **Contract Creation**:
   - Either party creates contract with both UUIDs as participants
   - Both parties can view and sign contract steps

4. **Step Signing**:
   - Each party signs steps independently with their unique keys
   - Progress tracked in real-time across both instances

### Contract Visualization

1. **View Contract**: Click any contract card in dashboard
2. **Generate SVG**: Click "🎨 View SVG" button
3. **Theme Selection**: SVG generated with dark theme by default
4. **Modal Display**: Beautiful contract visualization in overlay modal
5. **Export Options**: SVG can be saved or shared as needed

## Testing & Development

### Required Services Setup

#### Local Sanora for Form-Widget
The covenant GUI requires local sanora to be running for form-widget functionality:

```bash
# Start local sanora service (if not already running)
cd /Users/zachbabb/Work/planet-nine/sanora
node src/server/node/sanora.js

# Copy form-widget files to expected location (one-time setup)
mkdir -p src/server/node/sanora/public
cp public/* src/server/node/sanora/public/
```

**Form-Widget Endpoints**:
- CSS: http://127.0.0.1:7243/form-widget.css
- JS: http://127.0.0.1:7243/form-widget.js

### Multi-Instance Testing

**Test Scenarios**:
- Different environments (dev/test/local)
- Multiple participants with unique keys
- Contract creation and step signing workflows
- SVG visualization generation
- Connection URL sharing and processing

**Environment Testing**:
```bash
# Test against 3-base ecosystem
COVENANT_ENV=test npm run tauri dev

# Test against dev servers
COVENANT_ENV=dev npm run tauri dev

# Test with local services
COVENANT_ENV=local npm run tauri dev
```

### Debugging Features

**Browser Console Access**:
```javascript
// Environment management
covenantEnv.switch('test')
covenantEnv.current()

// Service URL checking
getServiceUrl('covenant')
getEnvironmentConfig()
```

**Backend Logging**: Rust backend provides detailed console logging for:
- Contract operations
- Authentication flows
- Environment configuration
- Error handling

## Future Enhancements

### Immediate Roadmap

- **Public BDO Integration**: Store contract state in public BDO for cross-service access
- **Web Interface**: Create web-based covenant viewer for public contract display
- **Enhanced MAGIC**: Advanced MAGIC spell configuration in contract creation
- **Mobile Support**: Tauri mobile compilation for iOS/Android

### Advanced Features

- **Rich Contract Templates**: Pre-built contract templates for common use cases
- **Notification System**: Real-time notifications for contract updates
- **Advanced Permissions**: Granular permission controls for contract operations
- **Audit Trail**: Complete history of contract changes and signatures
- **Integration Hub**: Connect with other Planet Nine services (Sanora, MAGIC, etc.)

### UI/UX Improvements

- **Drag & Drop**: Drag-and-drop step reordering
- **Participant Search**: UUID lookup and participant management
- **Contract Cloning**: Duplicate existing contracts as templates
- **Bulk Operations**: Batch contract management operations
- **Advanced Filtering**: Search and filter contracts by various criteria

## Integration with Planet Nine

### Service Dependencies
- **Covenant Service**: Core contract management and authentication
- **BDO Service**: Persistent storage for contract data
- **MAGIC Service**: Spell execution on contract completion
- **Sessionless**: Cryptographic authentication protocol

### Nullary Ecosystem
- **Consistent Architecture**: Follows Nullary SVG-first design principles
- **Environment Management**: Unified environment switching across all apps
- **Shared Components**: Can leverage shared Nullary components when needed
- **Cross-App Integration**: Can reference contracts from other Nullary applications

## Important Tauri v2 Configuration

**CRITICAL**: For Tauri v2 apps, you MUST include `"withGlobalTauri": true` in the `app` object of `tauri.conf.json`:

```json
{
  "app": {
    "withGlobalTauri": true,  // Required for window.__TAURI__ API access
    "windows": [...]
  }
}
```

Without this setting, the Tauri API will not be injected into `window.__TAURI__`, causing all `invoke` calls to fail with "invoke is not a function" errors.

Covenant GUI represents a complete implementation of the covenant service interface, providing users with an intuitive way to create, manage, and visualize magical contracts while maintaining the cryptographic security and decentralized principles of the Planet Nine ecosystem.