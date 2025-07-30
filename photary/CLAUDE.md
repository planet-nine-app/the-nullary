# Photary - Standalone Photo Feed Application

## Overview

Photary is a standalone photo feed application extracted from screenary, designed to focus specifically on photo viewing and discovery within the Planet Nine ecosystem. It provides a clean, minimal interface for browsing photo feeds from connected bases.

## Architecture

### Three-Screen Design

1. **Feed Screen**: Main photo feed with swipable multi-image posts
2. **Bases Screen**: Management of connected base servers
3. **Planet Nine Screen**: Ecosystem overview with animated logo

### Technology Stack

- **Frontend**: Tauri v2.x application with vanilla JavaScript (no ES6 modules)
- **Backend**: Rust with Planet Nine service integrations
- **UI Components**: SVG-first architecture using shared components
- **Services**: BDO (storage), Dolores (video/photo feeds), Sessionless (authentication)

## Key Features

### Photo Feed
- **Multi-image Support**: Posts can contain multiple images with navigation
- **Interactive Navigation**: Arrow buttons, dot indicators, touch/swipe gestures
- **Lazy Loading**: Performance optimization for large feeds
- **Real-time Updates**: Refresh capability with loading states

### Base Management
- **Discovery**: View available base servers with metadata
- **Join/Leave**: Interactive base connection management
- **Status Indicators**: Visual feedback for connected bases
- **Tag Filtering**: View photary-specific tags from each base

### Planet Nine Integration
- **Animated Logo**: SVG-based Planet Nine branding with orbital animations
- **Ecosystem Overview**: Introduction to the decentralized network
- **Service Integration**: Direct connection to BDO and Dolores services

## Shared Components

Photary uses shared components from `/the-nullary/shared/` to maintain consistency across The Nullary ecosystem:

### Photo Components (`/shared/feeds/photo-feed.js`)
- `createPhotaryRow()`: Multi-image photo post rendering
- `addPhotoInteractions()`: Touch/swipe/click navigation handling

### Base Management (`/shared/services/base-command.js`)
- `getBases()`: Retrieve available base servers
- `joinBase()` / `leaveBase()`: Base connection management
- `getFeed()`: Retrieve photo feeds from connected bases

## Development Patterns

### No-Modules Architecture
Photary follows The Nullary's no-modules approach for Tauri compatibility:

```javascript
// Inline shared components instead of imports
const sharedComponents = {
    createPhotaryRow(text, images = [], options = {}) {
        // Component implementation inline
    }
};
```

### Service Integration
Backend integrates with Planet Nine services:

```rust
// Dolores for photo feeds
let dolores_client = DoloresClient::new(dolores_url, sessionless)?;
let feed = dolores_client.get_feed(uuid, tags).await?;

// BDO for file storage
let bdo_client = BdoClient::new(bdo_url, sessionless)?;
let user = bdo_client.create_user().await?;
```

### Screen Management
Dynamic screen switching with state management:

```javascript
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen and load data
    const screen = document.getElementById(`${screenName}-screen`);
    screen.classList.add('active');
    loadScreenData(screenName);
}
```

## Component Structure

### Photo Post Display
Each photo post includes:
- **Multi-image carousel** with navigation controls
- **Touch/swipe gestures** for mobile interaction
- **Animated indicators** showing current image
- **Text content** with formatted descriptions
- **Responsive design** adapting to screen sizes

### Base Cards
Base server cards show:
- **Connection status** with visual indicators
- **Server metadata** (description, location, tags)
- **Action buttons** for joining/leaving
- **Photary-specific tags** for content filtering

## File Structure

```
photary/
├── src/
│   ├── main.js          # Main application logic
│   └── index.html       # Application shell
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs       # Backend service integration
│   │   ├── main.rs      # Tauri application entry
│   │   └── build.rs     # Build configuration
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
└── CLAUDE.md           # This documentation
```

## Key Dependencies

### Rust Backend
- `tauri`: Cross-platform application framework
- `serde`: Serialization/deserialization
- `bdo-rs`: BDO service client
- `dolores-rs`: Dolores service client
- `sessionless`: Authentication protocol

### JavaScript Frontend
- `@tauri-apps/api`: Tauri JavaScript API
- Vanilla JavaScript (no external dependencies)
- SVG-based UI components (inline)

## Development Workflow

1. **Start Development**: `npm run tauri dev`
2. **Build Application**: `npm run tauri build`
3. **Backend Changes**: Modify `src-tauri/src/lib.rs`
4. **Frontend Changes**: Modify `src/main.js` or `src/index.html`
5. **Shared Components**: Update in `/the-nullary/shared/` directory

## Integration Points

### With Screenary
- Shares photo feed components for consistency
- Common base management functionality
- Unified Planet Nine branding and theming

### With The Nullary Ecosystem
- Uses shared SVG component architecture
- Follows Tauri no-modules patterns
- Integrates with allyabase service infrastructure

### With Planet Nine Services
- **BDO**: File storage and user management
- **Dolores**: Photo/video feed aggregation
- **Sessionless**: Cryptographic authentication
- **Base Discovery**: Network service discovery

## Future Enhancements

- **Upload Capability**: Direct photo upload to connected bases
- **Advanced Filtering**: Tag-based feed filtering and search
- **Offline Support**: Local caching of feeds and images
- **Social Features**: Comments, reactions, sharing
- **Base Discovery**: Automatic discovery of nearby bases
- **Performance**: Virtual scrolling for very large feeds

## Testing

Testing follows Planet Nine patterns:
- Backend logic tested via Rust unit tests
- Frontend tested via Tauri development environment
- Integration tested against development allyabase services
- Mock data provided for offline development

Photary demonstrates the power of The Nullary's shared component architecture while providing a focused, high-quality photo browsing experience within the Planet Nine ecosystem.