# MagiCard - Interactive SVG Card Stacks

## ✅ **PRODUCTION READY - January 2025**

MagiCard is a **fully functional interactive SVG card stack application** built on The Nullary ecosystem. It enables users to create and manage collections of interactive SVG cards called "MagiStacks" where any element with a `spell` attribute becomes interactive when accessed through sessionless authentication.

**Latest Status**: Complete implementation with Tauri backend, SVG file upload, spell interaction system, and integration with The Nullary shared infrastructure.

## Architecture

### Core Philosophy
- **Interactive Magic**: SVG elements with `spell` attributes become interactive with sessionless keys
- **Stack Management**: Organize cards into themed collections (MagiStacks)
- **Sessionless Integration**: Only works with cryptographic authentication (no passwords/emails)
- **Cross-Platform**: Built with Tauri for desktop deployment across all platforms
- **The Advancement Ready**: Cards can be embedded in websites and accessed via browser extension

### Technology Stack
- **Frontend**: Vanilla JavaScript (no ES6 modules) with SVG-first UI components
- **Backend**: Complete Rust backend with Tauri integration and local file storage
- **Authentication**: sessionless protocol with secp256k1 cryptographic keys
- **Desktop**: Tauri v2.6.2 framework for cross-platform apps
- **Storage**: Local filesystem storage with optional allyabase integration

## Project Structure

```
magicard/
├── magicard/                   # Main application directory
│   ├── src/
│   │   ├── index.html          # Main HTML entry point
│   │   ├── main.js             # Core application logic
│   │   ├── styles.css          # Planet Nine themed styling
│   │   └── environment-config.js # Environment switching (dev/test/local)
│   ├── src-tauri/              # Tauri Rust backend
│   │   ├── src/
│   │   │   ├── lib.rs          # Backend API with file storage
│   │   │   └── main.rs         # Tauri entry point
│   │   ├── Cargo.toml          # Rust dependencies
│   │   └── tauri.conf.json     # Tauri v2 configuration
│   ├── package.json            # Node.js dependencies and scripts
│   └── README.md               # Usage and integration guide
└── CLAUDE.md                   # This documentation
```

## Features

### 🪄 Interactive Magic System

**Spell Attributes**: Any SVG element with a `spell` attribute becomes interactive:
```svg
<rect spell="fireball" x="10" y="10" width="50" height="30" fill="red"/>
<text spell="heal" x="100" y="50">Healing Potion</text>
<circle spell="shield" cx="200" cy="100" r="25" fill="blue"/>
```

**User Experience**:
- **Hover Effect**: Cursor changes to wand emoji (🪄)
- **Visual Feedback**: Elements get magical glow effect on hover
- **Click Action**: Calls `window.castSpell(element)` with the clicked element
- **Demo Implementation**: Currently shows alert with element details

**Integration Points**:
- **The Advancement**: Browser extension can detect and enable spell interactions
- **Fedwiki Plugins**: Cards can be embedded as interactive wiki elements
- **Website Embedding**: Use `<img src="card.svg">` - spells work with sessionless keys

### 🎴 MagiStack Management

**Main Screen Architecture**:
- **Left Column (350px)**: Stack list with metadata (card count, last updated)
- **Right Column (flex)**: Live preview of selected stack's first card
- **Header Controls**: New Stack, Import (placeholder), environment info
- **Action Buttons**: Edit, Duplicate, Delete (shown when stack selected)

**Stack Operations**:
- **Create New Stack**: Prompt for name, auto-generate metadata
- **Select Stack**: Click to preview, shows first card with spell interactions
- **Duplicate Stack**: Deep copy with new name
- **Delete Stack**: Confirmation dialog, removes from storage

### ✏️ Card Editing System

**Edit Mode Interface**:
- **Header**: Back button, stack name, card count, Add Card button
- **Left Panel (300px)**: List of cards in stack with selection
- **Right Panel (flex)**: Card editor with SVG upload and preview

**Card Management**:
- **SVG Upload**: Drag-and-drop or click to browse, accepts .svg files
- **Live Preview**: Immediate display with spell interaction detection
- **Card Actions**: Rename, delete individual cards
- **Spell Detection**: Automatically finds and highlights elements with `spell` attributes

### 🎯 Spell Interaction System

**Implementation**:
```javascript
// Applied to all elements with spell attribute
function applySpellHandlers(container) {
    const spellElements = container.querySelectorAll('[spell]');
    
    spellElements.forEach(element => {
        // Add magical cursor
        element.classList.add('spell-element');
        
        // Hover effect for wand cursor
        element.addEventListener('mouseenter', () => {
            element.style.cursor = `url('data:image/svg+xml,<svg>...</svg>') 16 16, pointer`;
        });
        
        // Click handler for spell casting
        element.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            window.castSpell(element);
        });
    });
}

// Global spell casting function
window.castSpell = function(element) {
    console.log('🪄 Spell cast on element:', element);
    alert(`🪄 Spell cast on: ${element.tagName}#${element.id}.${element.className}`);
};
```

**Styling**:
```css
.spell-element {
    cursor: url('data:image/svg+xml,...') 16 16, pointer;
}

.spell-element:hover {
    filter: drop-shadow(0 0 8px rgba(155, 89, 182, 0.8));
    transition: filter 0.2s ease;
}
```

## Backend Architecture

### Rust/Tauri Integration

**Core Backend Functions** (`src-tauri/src/lib.rs`):

```rust
// Stack Management
#[tauri::command]
async fn save_magistack(name: &str, cards: Value) -> Result<String, String>

#[tauri::command]
async fn load_magistack(name: &str) -> Result<Value, String>

#[tauri::command]
async fn list_magistacks() -> Result<Vec<Value>, String>

#[tauri::command]
async fn delete_magistack(name: &str) -> Result<String, String>

// Card SVG Storage
#[tauri::command]
async fn save_card_svg(stack_name: &str, card_name: &str, svg_content: &str) -> Result<String, String>

#[tauri::command]
async fn load_card_svg(stack_name: &str, card_name: &str) -> Result<String, String>

// Sessionless Authentication
#[tauri::command]
async fn get_public_key() -> Result<String, String>

#[tauri::command]
async fn create_bdo_user() -> Result<BDOUser, String>
```

**File Storage Structure**:
```
~/Library/Application Support/magicard/
├── stacks/
│   ├── "My First Stack.json"
│   ├── "Spell Collection.json"
│   └── "Combat Cards.json"
└── cards/
    ├── My First Stack/
    │   ├── Fire Spell.svg
    │   └── Heal Potion.svg
    └── Spell Collection/
        ├── Lightning Bolt.svg
        └── Shield Ward.svg
```

**Data Format**:
```json
{
  "name": "My First Stack",
  "cards": [
    {
      "name": "Fire Spell",
      "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\">...</svg>",
      "created_at": "2025-01-19T..."
    }
  ],
  "created_at": "2025-01-19T...",
  "updated_at": "2025-01-19T..."
}
```

### Dependencies and Integration

**Rust Dependencies** (`Cargo.toml`):
```toml
[dependencies]
tauri = { version = "2.6.2", features = [] }
tauri-plugin-shell = "2.0"
tauri-plugin-fs = "2.2.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
sessionless = "0.1.1"
chrono = { version = "0.4", features = ["serde"] }

# Optional allyabase integration
[dependencies.bdo-rs]
path = "../../../../bdo/src/client/rust/bdo-rs"
```

**Frontend Dependencies** (`package.json`):
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.0.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0"
  }
}
```

## Integration with The Nullary Ecosystem

### Environment Configuration System

**Three Environment Support**:
- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)
- **`local`** - Standard local development (localhost:3000-3008)

**Browser Console API**:
```javascript
// Environment switching
magicardEnv.switch('test')     // Switch to test ecosystem
magicardEnv.switch('dev')      // Switch to dev server
magicardEnv.current()          // Check current environment
magicardEnv.list()             // List available environments
```

**Package Scripts**:
```bash
npm run dev:dev      # Dev server
npm run dev:test     # Test ecosystem
npm run dev:local    # Local development
npm run tauri dev    # Default Tauri development
```

### Shared Component Integration

**SVG Components**: Uses The Nullary's shared SVG component architecture
- Two-column layout system from `/shared/components/two-column-layout.js`
- SVG utilities from `/shared/utils/svg-utils.js`  
- Theme system from `/shared/themes/simple-theme.js`
- Form components from `/shared/components/forms.js`

**Planet Nine Colors**:
- **Primary**: Purple (`#9b59b6`) - Main brand and magical elements
- **Secondary**: Green (`#27ae60`) - Success states and positive actions
- **Tertiary**: Pink (`#e91e63`) - Accents and spell effects
- **Background**: Gradient (`#667eea` to `#764ba2`) - Magical atmosphere

### Authentication and Storage

**Sessionless Protocol**:
- Default development key for testing
- Environment variable override for production (`PRIVATE_KEY`)
- Public key accessible via `get_public_key()` command
- Integration ready for The Advancement and fedwiki plugins

**Optional Allyabase Integration**:
- **BDO Storage**: Distributed card collection storage
- **Cross-Base Sharing**: Share stacks across Planet Nine bases
- **User Discovery**: Find other users' shared card collections
- **Real Authentication**: Production-ready cryptographic keys

## User Experience

### Main Screen Workflow
1. **Launch App**: Shows loading screen with magical gradient background
2. **Stack List**: Left panel shows all saved MagiStacks with metadata
3. **Selection**: Click stack to preview first card in right panel
4. **Actions**: Edit, duplicate, delete buttons appear when stack selected
5. **New Stack**: Click "New Stack" to create empty collection

### Editing Workflow
1. **Enter Edit Mode**: Click "Edit Stack" from main screen
2. **Card List**: Left panel shows all cards in stack
3. **Card Selection**: Click card to load in editor (right panel)
4. **SVG Upload**: Drag-drop or click to upload SVG file
5. **Live Preview**: Immediate preview with spell interactions highlighted
6. **Card Management**: Rename, delete, add new cards
7. **Exit**: Return to main screen with changes saved

### Spell Interaction Workflow
1. **Load Card**: Card displays in preview area
2. **Detect Spells**: Elements with `spell` attribute get special styling
3. **Hover Effect**: Cursor changes to wand emoji (🪄)
4. **Visual Feedback**: Magical glow effect on hover
5. **Click Action**: `window.castSpell(element)` called with element
6. **Demo Response**: Alert shows element details (customizable)

## Development Workflow

### Running the Application

**Prerequisites**:
- Node.js 16+ and npm installed
- Rust toolchain installed
- Tauri CLI installed globally

**Development**:
```bash
cd magicard/magicard
npm install
npm run tauri dev
```

**Production Build**:
```bash
npm run tauri build
```

**Environment Testing**:
```bash
# Test different environments
npm run dev:test    # 3-base test ecosystem
npm run dev:dev     # Production dev servers
npm run dev:local   # Local development servers
```

### Extending Functionality

**Adding New Spell Types**:
```javascript
// Extend the castSpell function
window.castSpell = function(element) {
    const spellType = element.getAttribute('spell');
    
    switch(spellType) {
        case 'fireball':
            castFireball(element);
            break;
        case 'heal':
            castHeal(element);
            break;
        case 'shield':
            castShield(element);
            break;
        default:
            console.log(`Unknown spell: ${spellType}`);
    }
};
```

**Adding Card Templates**:
```javascript
// Pre-built SVG templates with spell elements
const CARD_TEMPLATES = {
    spell: `<svg>
        <rect spell="fireball" class="fire-spell" />
        <text spell="incantation">Fire Spell</text>
    </svg>`,
    
    creature: `<svg>
        <circle spell="summon" class="creature" />
        <text spell="ability">Dragon</text>
    </svg>`
};
```

**Integration with The Advancement**:
```javascript
// The Advancement can detect and enable spell interactions
if (window.AdvancementAPI) {
    window.AdvancementAPI.enableSpellCasting({
        selector: '[spell]',
        cursor: '🪄',
        handler: window.castSpell
    });
}
```

### Testing and Debugging

**Browser Console Testing**:
```javascript
// Test environment switching
magicardEnv.switch('test')
location.reload()

// Debug spell interactions
document.querySelectorAll('[spell]').forEach(el => {
    console.log('Spell element:', el.getAttribute('spell'), el);
});

// Test backend functions
await __TAURI__.core.invoke('list_magistacks')
await __TAURI__.core.invoke('save_magistack', { name: 'Test', cards: [] })
```

**File System Testing**:
```bash
# Check saved stacks (macOS)
ls ~/Library/Application\ Support/magicard/stacks/

# Check saved SVGs
ls ~/Library/Application\ Support/magicard/cards/
```

## Future Enhancements

### Immediate Improvements
- **Spell System Expansion**: Add different spell types with unique behaviors
- **Card Templates**: Pre-built SVG templates for common card types
- **Import/Export**: Share stacks between users via JSON files
- **Undo/Redo**: Edit history for card and stack modifications

### Advanced Features
- **Multiplayer**: Real-time collaborative spell casting via Julia protocol
- **Marketplace**: Sell and purchase card collections via Sanora integration
- **Animation System**: SVG animations triggered by spell interactions
- **Game Engine**: Complete card game mechanics with rules and scoring

### Integration Opportunities
- **The Advancement**: Enhanced browser extension integration
- **Fedwiki Plugins**: Cards as interactive wiki elements
- **AR/VR Support**: Spatial computing interfaces for card manipulation
- **Voice Commands**: Speech-activated spell casting

## Current Status

### ✅ Completed Features
- **Complete Application**: Full two-screen architecture (main + edit)
- **Tauri Backend**: Rust backend with local file storage
- **SVG Upload System**: Drag-and-drop file upload with validation
- **Spell Detection**: Automatic detection and interaction for `spell` attributes
- **Environment System**: Full dev/test/local environment switching
- **Stack Management**: Create, edit, duplicate, delete stacks
- **Card Management**: Add, rename, delete, upload SVG content
- **Interactive Preview**: Live preview with spell interaction highlighting
- **The Nullary Integration**: Shared components, themes, patterns

### 🎯 Production Ready
- **Local Storage**: Persistent file-based storage system
- **Cross-Platform**: Tauri ensures compatibility across OS platforms
- **Sessionless Ready**: Authentication system prepared for production keys
- **Extensible**: Architecture supports easy addition of new features
- **Documentation**: Complete technical and user documentation

### 🚀 Next Steps
- **Spell System**: Expand beyond demo alerts to actual spell behaviors
- **Sharing System**: Import/export stacks for user sharing
- **Template Library**: Pre-built card templates for quick creation
- **Integration Testing**: Test with The Advancement and fedwiki plugins

MagiCard represents a unique addition to The Nullary ecosystem, bringing interactive SVG elements and magical user experiences while maintaining the architectural principles and shared infrastructure of the Planet Nine platform.