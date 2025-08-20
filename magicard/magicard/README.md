# MagiCard - Interactive SVG Card Stacks

🪄 **Interactive SVG card stacks with spell casting** - built on The Nullary ecosystem

## Overview

MagiCard is a unique application for creating and managing interactive SVG card collections called "MagiStacks". Each card can contain SVG elements with `spell` attributes that become interactive when accessed through sessionless authentication via The Advancement or direct allyabase integration.

## Key Features

### ✨ Interactive Magic System
- **Spell Attributes**: Any SVG element with a `spell` attribute becomes interactive
- **Visual Feedback**: Hover shows wand cursor (🪄), click triggers `window.castSpell(element)`
- **Sessionless Authentication**: Interactive elements only work with valid cryptographic keys
- **Integration Ready**: Works with The Advancement browser extension and fedwiki plugins

### 🎴 MagiStack Management
- **Stack Creation**: Organize cards into themed collections
- **Card Upload**: Support for SVG file uploads with drag-and-drop
- **Live Preview**: Real-time preview of interactive card elements
- **Editing Interface**: Comprehensive card and stack management

### 🏗️ Architecture
- **SVG-First UI**: Built entirely with SVG components following The Nullary patterns
- **Tauri Backend**: Cross-platform desktop app with Rust backend
- **Local Storage**: File-based storage with optional allyabase integration
- **Environment Switching**: Support for dev/test/local environments

## Usage

### Main Screen
- **Left Column**: List of all MagiStacks with metadata
- **Right Column**: Preview of selected stack's first card
- **Actions**: Create, edit, duplicate, delete stacks

### Editing Mode
- **Card List**: Manage cards within a stack
- **SVG Upload**: Drag-and-drop or click to upload SVG files
- **Live Preview**: See spell elements highlighted with interactive cursors
- **Card Actions**: Rename, delete, reorder cards

### Interactive Elements
```svg
<!-- Example spell element -->
<rect spell="fireball" x="10" y="10" width="50" height="30" fill="red"/>
<text spell="heal" x="100" y="50">Healing Potion</text>

<!-- Card navigation elements -->
<rect card-navigate="MyStack_FireCard" base-url="http://127.0.0.1:5114/" x="200" y="10" width="100" height="30" fill="blue"/>
<text card-navigate="AnotherStack_IceCard" x="300" y="50">Navigate to Ice Card</text>
```

When viewed with sessionless keys:
- **Spell Elements**: Hover shows 🪄 cursor, click calls `window.castSpell(element)`
- **Navigation Elements**: Click navigates to card via BDO using the specified `card-navigate` key

## Installation

### Prerequisites
- Node.js 16+ and npm
- Rust toolchain 
- Tauri CLI: `npm install -g @tauri-apps/cli`

### Setup
```bash
# Navigate to MagiCard directory
cd the-nullary/magicard/magicard

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Environment Configuration
Switch between environments using browser console:
```javascript
// Switch to test ecosystem
magicardEnv.switch('test')
location.reload()

// Switch to dev server
magicardEnv.switch('dev')
location.reload()

// Check current environment
magicardEnv.current()
```

## Integration with Planet Nine

### The Advancement Integration
MagiCards can be embedded in websites and accessed through The Advancement browser extension:
1. Upload MagiCard SVGs to a web server
2. Use as `<img src="path/to/card.svg">` in HTML
3. The Advancement detects spell attributes and enables interaction
4. Users with sessionless keys can cast spells on elements

### Fedwiki Plugin Potential
Cards can be integrated as fedwiki plugins:
- Export cards as standalone SVG files
- Fedwiki plugins can load and display cards
- Spell interactions work through plugin's sessionless integration
- Enables collaborative card games and interactive storytelling

### Allyabase Storage
Optional integration with allyabase services:
- **BDO**: Store card collections in distributed storage
- **Sanora**: Host cards as purchasable products
- **Julia**: Enable multiplayer card interactions
- **Sessionless**: Cryptographic authentication for spell casting

## Technical Details

### Backend API (Rust/Tauri)
- `save_magistack(name, cards)` - Save stack to storage
- `load_magistack(name)` - Load stack from storage  
- `list_magistacks()` - Get all available stacks
- `delete_magistack(name)` - Delete a stack
- `save_card_svg(stack, card, svg)` - Save individual card SVG and post to BDO
- `load_card_svg(stack, card)` - Load individual card SVG
- `get_card_from_bdo(card_key)` - Retrieve card from current base's BDO
- `navigate_to_card(base_url, card_key)` - Navigate to card via specific base's BDO
- `list_cards_in_bdo()` - List all cards available in BDO

### Frontend Architecture
- **No ES6 Modules**: Uses vanilla JavaScript for Tauri compatibility
- **SVG Components**: Leverages shared Nullary component system
- **Environment System**: Full dev/test/local environment switching
- **Theme Integration**: Planet Nine color scheme and typography

### Storage Format

**Local Stack Format**:
```json
{
  "name": "My Magic Stack",
  "cards": [
    {
      "name": "Fire Spell",
      "svg": "<svg>...</svg>",
      "bdoKey": "My_Magic_Stack_Fire_Spell",
      "created_at": "2025-01-19T..."
    }
  ],
  "created_at": "2025-01-19T...",
  "updated_at": "2025-01-19T..."
}
```

**BDO Card Format**:
```json
{
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\">...</svg>"
}
```

Cards are stored in BDO with keys like `StackName_CardName` for cross-base navigation.

## Development

### File Structure
```
magicard/
├── src/
│   ├── index.html              # Main HTML entry point
│   ├── main.js                 # Application logic
│   ├── styles.css              # Styling and themes
│   └── environment-config.js   # Environment configuration
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs              # Rust backend with allyabase integration
│   │   └── main.rs             # Tauri entry point
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
└── README.md                   # This file
```

### Adding New Features
1. **Spell Actions**: Extend `window.castSpell()` function for different spell types
2. **Card Templates**: Create pre-built SVG templates with common spell patterns
3. **Multiplayer**: Integrate with Julia for real-time collaborative spell casting
4. **Marketplace**: Use Sanora to sell and share card collections
5. **Animation**: Add SVG animations triggered by spell interactions

### Shared Code Integration
MagiCard follows The Nullary patterns:
- Uses shared SVG components from `/shared/components/`
- Follows environment configuration from `/shared/services/`
- Integrates with shared theme system
- Compatible with base discovery and user persistence systems

## Future Enhancements

### Interactive Spell System
- **Spell Types**: Different spell categories (attack, defense, utility)
- **Mana System**: Resource management for spell casting
- **Cooldowns**: Time-based restrictions on spell usage
- **Combo System**: Chain spells together for enhanced effects

### Social Features
- **Shared Stacks**: Export/import stacks between users
- **Collaborative Editing**: Real-time collaborative stack creation
- **Tournaments**: Organized competitive spell casting events
- **Rating System**: Community rating of card collections

### Advanced Integration
- **Game Engine**: Full card game mechanics
- **AR Support**: Augmented reality card viewing
- **Voice Commands**: Voice-activated spell casting
- **AI Opponents**: Computer-controlled spell casting opponents

## License

MIT License - Built on the Planet Nine ecosystem

## Contributing

MagiCard is part of The Nullary ecosystem. Contributions should follow established patterns and integrate with shared infrastructure. See `/shared/INTEGRATION-GUIDE.md` for development guidelines.