# MagiCard - Interactive SVG Card Stacks

## ✅ **PRODUCTION READY - January 2025**

MagiCard is a **fully functional interactive SVG card stack application** built on The Nullary ecosystem. It enables users to create and manage collections of interactive SVG cards called "MagiStacks" where any element with a `spell` attribute becomes interactive when accessed through sessionless authentication.

**Latest Status**: Complete implementation with Tauri backend, SVG file upload, spell interaction system, **cross-card BDO navigation**, and integration with The Nullary shared infrastructure.

## 🆕 **Major Update - January 2025: Complete Cross-Card Navigation System**

**Revolutionary Achievement**: MagiCard now features **complete cross-card navigation** using BDO (Big Dumb Object) storage, enabling seamless navigation between cards stored across different instances and sources!

### ✅ **Cross-Card Navigation Features**
- **🌐 Dynamic Card Fetching**: Cards not in local stack are automatically fetched from BDO
- **🔗 Real BDO Integration**: Uses actual BDO pubKeys for secure card references
- **📦 Automatic Card Import**: Fetched cards are added to current stack for future navigation
- **🎯 Smart Navigation**: First checks locally, then fetches from BDO if needed
- **⚡ Loading States**: Beautiful loading UI while fetching cards
- **❌ Error Handling**: Graceful error states when cards can't be found

### **Navigation Pattern**:
```xml
<!-- Navigation button in SVG -->
<rect spell="magicard" 
      spell-components='{"bdoPubKey":"actual_bdo_pubkey_here"}' 
      x="20" y="320" width="80" height="30"/>
<text spell="magicard" 
      spell-components='{"bdoPubKey":"actual_bdo_pubkey_here"}' 
      x="60" y="340">→ Next Card</text>
```

### **Complete Navigation Flow**:
1. **User clicks spell element** with `spell="magicard"` and bdoPubKey
2. **Local search** checks current stack for matching card
3. **BDO fetch** if card not found locally
4. **Display card** in preview with spell interactions enabled
5. **Auto-add to stack** for future local access

### **🆕 Menu Navigation System (January 2025)**:
**Streamlined Selector-to-Selector Navigation** for hierarchical menu cards:

- **Direct Column Navigation**: Menu selector cards navigate directly to the next column selector
- **No Intermediate Cards**: Eliminated "selection confirmation" cards for cleaner flow
- **Option Button Integration**: Each selector displays all options (adult, youth, reduced) as clickable buttons
- **Unified Navigation Target**: All options on a selector navigate to the same next column
- **Sequential Flow**: Left-to-right column progression: Selector → Next Selector → Products

**Menu Card Types**:
- **🗂️ Menu Selector Cards**: Display options with navigation to next column
- **🛍️ Product Cards**: Final destination showing purchasable items

**Navigation Example**:
```xml
<!-- Menu selector card with options -->
<rect spell="magicard" spell-components='{"bdoPubKey":"next_selector_pubkey"}'
      x="50" y="120" width="200" height="40" rx="8" 
      fill="#3498db" class="spell-element">
  <animate attributeName="fill" values="#3498db;#ecf0f1;#3498db" dur="2s" repeatCount="indefinite"/>
</rect>
<text spell="magicard" spell-components='{"bdoPubKey":"next_selector_pubkey"}'
      x="150" y="145" text-anchor="middle" fill="white" font-weight="bold">adult</text>
```

### **Technical Implementation**:
- **Backend Function**: `get_card_from_bdo(bdoPubKey)` with comprehensive authentication
- **Frontend Function**: `fetchAndDisplayCardFromBDO(bdoPubKey)` with error handling
- **Navigation Logic**: `navigateToCardViaBdoPubKey()` with smart local/remote detection
- **Card Integration**: Automatic addition to current stack with metadata tracking

## 🍽️ **Complete Menu Navigation Integration (January 2025)**

**Revolutionary Achievement**: MagiCard now provides **seamless integration with Ninefy's decision tree menu system**, enabling complex hierarchical navigation across menu selector cards and product cards!

### **✅ Ninefy Menu Integration**

**Complete Menu Card Support**:
- **Menu Selector Cards**: Display hierarchical navigation options (rider → time span)
- **Product Cards**: Final destination cards with purchase integration
- **Decision Tree Navigation**: Intelligent path building through user selections
- **Cross-Card Fetching**: Automatic BDO retrieval for cards not in local stack

**Integration Workflow**:
1. **Ninefy**: User uploads CSV menu → generates SVG cards → stores in BDO with unique pubKeys
2. **MagiCard**: User imports menu pubKey → navigates through menu structure → reaches products
3. **Universal Navigation**: All navigation powered by `spell="magicard"` with `bdoPubKey` references

### **✅ Clean SVG Generation Compatibility**

**Critical Technical Fix**:
- **Problem**: Ninefy product cards included XML declaration headers causing triple-escaping
- **Solution**: Standardized SVG generation to match menu cards (no XML declaration)
- **Result**: Perfect compatibility between Ninefy-generated cards and MagiCard display

**Before (Broken)**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">
  <!-- Triple-escaped content causing display errors -->
```

**After (Working)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">
  <!-- Clean content displays perfectly -->
```

### **✅ Advanced Spell Navigation**

**Three Spell Types Supported**:

**1. Selection Spells** (Menu Navigation):
```xml
<rect spell="selection" 
      spell-components='{"selection":"adult","level":0,"bdoPubKey":"next_selector"}' 
      x="50" y="120" width="200" height="40"/>
```
- Stores user choice in magistack
- Navigates to next menu level
- Preserves selection path for final lookup

**2. Lookup Spells** (Product Resolution):
```xml
<rect spell="lookup"
      spell-components='{"catalog":{...},"selection":"day","level":1}' 
      x="50" y="170" width="200" height="40"/>
```
- Uses magistack selections to resolve products
- Navigates from menu path to specific product
- Integrates with Ninefy's nested catalog structure

**3. MagiCard Spells** (Cross-Card Navigation):
```xml
<rect spell="magicard"
      spell-components='{"bdoPubKey":"actual_bdo_pubkey"}'
      x="20" y="320" width="80" height="30"/>
```
- Fetches cards from BDO storage
- Seamless navigation between any cards
- Automatic stack integration for future access

### **✅ Production Integration Features**

**Real BDO Integration**:
- **Cryptographic Security**: All cards stored with unique sessionless keypairs
- **Public Access**: Cards stored with `pub=true` for cross-application access
- **Authentication**: Proper BDO authentication using consistent `card_context`
- **Error Handling**: Graceful degradation when cards can't be fetched

**Universal Navigation System**:
- **castSpell.js Integration**: Uses fount-served universal spell system
- **BDO Bridge Interface**: Standardized `window.castSpellBridge` for card retrieval
- **Environment Support**: Works across dev/test/local configurations
- **Cross-Platform**: Functions in both Tauri applications and browser environments

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

**Seed Testing System**: Built-in seed MagiStack for testing:
- **🌱 Seed Stack Button**: Creates "spell_test_stack" with interactive spell cards
- **Testing Cards**: Fire Spell, Ice Spell, Lightning Spell (from `/test-cards/` directory)
- **Interactive Elements**: Each card has multiple `spell` attributes and cross-card navigation
- **BDO Integration Testing**: Helps debug menu import and storage issues with realistic card data
- **Navigation Testing**: Cards include `spell="magicard"` elements with `spell-components` for cross-card linking
- **Development Workflow**: Complete spell interaction testing without manual card creation

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
- **Header Controls**: New Stack, Seed Stack, Import Menu, BDO Cards, Import (placeholder), environment info
- **BDO PubKey Display**: Shows importable pubKey for selected stack with copy button
- **Action Buttons**: Edit, Duplicate, Delete (shown when stack selected)

**Stack Operations**:
- **Create New Stack**: Prompt for name, auto-generate metadata
- **Create Seed Stack**: One-click creation of test stack with Fire, Ice, Lightning spell cards
- **Select Stack**: Click to preview, shows first card with spell interactions and BDO pubkey
- **Copy BDO PubKey**: Click-to-copy functionality for sharing stacks between instances
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

### 🔑 BDO PubKey Display System

**Cross-Instance Sharing**: Every selected stack shows its BDO pubkey for import into other MagiCard instances:

**Features**:
- **Auto-Generated Keys**: Combines sessionless pubkey with stack name for consistency
- **Visual Display**: Monospace font in styled container underneath preview
- **One-Click Copy**: Copy button with visual feedback (green "✅ Copied!" state)
- **Clipboard Integration**: Uses modern clipboard API with fallback for older browsers
- **Stack-Specific**: Each stack gets unique pubkey for precise identification

**Implementation**:
```javascript
// Generate consistent pubkey for stack
async function updateBdoPubKeyDisplay() {
    const sessionlessPubKey = await window.__TAURI__.core.invoke('get_public_key');
    const stackPubKey = `${sessionlessPubKey.substring(0, 20)}_${currentStack.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    // Display with copy functionality
}

// Copy to clipboard with visual feedback
async function copyBdoPubKey() {
    await navigator.clipboard.writeText(pubKey);
    // Show success state
}
```

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

// Seed Testing (uses actual test spell cards)
#[tauri::command]
async fn create_seed_magistack() -> Result<String, String>

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