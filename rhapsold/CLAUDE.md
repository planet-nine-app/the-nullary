# Rhapsold - Minimalist Blogging Platform

## Overview

Rhapsold is a minimalist blogging platform built on The Nullary ecosystem, showcasing the complete SVG-first architecture with layered UI system, scrollable feeds, and HUD overlays. It serves as both a functional blogging application and a reference implementation for building complex SVG-based Tauri apps.

## Architecture

### Core Philosophy
- **SVG-First UI**: All interface elements use SVG components instead of HTML/CSS
- **JSON Configuration**: Every component accepts JSON config objects with sensible defaults
- **Layered UI System**: Multi-layer architecture with scrollable feeds and transparent HUD overlays
- **Sanora Integration**: Complete blog management with file uploads and external URL support
- **Cross-Platform**: Built with Tauri for desktop deployment across all platforms

### Technology Stack
- **Frontend**: SVG components with embedded CSS, vanilla JavaScript (no ES6 modules)
- **Backend**: Complete allyabase ecosystem integration (Rust + Tauri)
- **Authentication**: sessionless protocol with secp256k1 cryptographic keys
- **Desktop**: Tauri v2.6.2 framework (Rust + Web) for cross-platform apps
- **Storage**: Full allyabase integration (Sanora, BDO, Dolores) + local storage for caching

## Project Structure

```
rhapsold/
├── src/
│   ├── index.html             # Main HTML entry point
│   ├── main-no-modules.js     # Application entry point (no ES6 modules)
│   ├── styles.css             # Global styles and theming
│   ├── components/
│   │   └── app.js             # App initialization (legacy)
│   ├── config/
│   │   └── theme.js           # Theme configuration (legacy)
│   ├── services/
│   │   └── allyabase.js       # Allyabase service integration (legacy)
│   └── shared/                # Local shared components
├── src-tauri/                 # Tauri configuration and Rust backend
│   ├── Cargo.toml             # Rust dependencies and allyabase crates
│   ├── tauri.conf.json        # Tauri v2 configuration
│   ├── src/
│   │   ├── main.rs            # Main Rust entry point
│   │   └── lib.rs             # Allyabase backend integration
│   └── target/                # Rust build artifacts
├── test-workflow.html         # Development testing interface
└── CLAUDE.md                  # This documentation
```

## Component Architecture

### Screen System (Four Complete Screens)

#### 1. Main Screen (`/shared/screens/main-screen.js`)
**Purpose**: Primary interface showing blog post previews from Sanora

**Features**:
- Grid layout with SVG-based blog preview cards
- Real-time search and filtering (by type, author, date)
- Sanora integration for fetching blog posts
- Create new post button with modal form
- Stats display and refresh functionality
- Layered UI with HUD overlay and scrollable feed

**Key Components Used**:
- `createBlogPreviewCard()` - SVG blog preview cards
- `createBlogCreationForm()` - Modal post creation
- `createLayeredUI()` - Multi-layer interface management
- `SanoraClient` - Blog data integration

#### 2. New Post Screen (`/shared/screens/new-post-screen.js`)
**Purpose**: Dedicated full-screen interface for creating blog posts

**Features**:
- Comprehensive blog creation form with dual modes:
  - **Hosted Mode**: Upload markdown/HTML content + images to Sanora
  - **External Mode**: Link to external blog URLs (displayed via iframe)
- File upload system with drag-and-drop support
- Live preview functionality
- Save drafts and publish workflow
- HUD controls (Back, Save, Publish) with keyboard shortcuts
- Form validation and error handling

**Keyboard Shortcuts**:
- `Ctrl+S` - Save draft
- `Ctrl+Enter` - Publish post
- `Escape` - Back to main (with confirmation)

#### 3. Post Reading Screen (`/shared/screens/post-reading-screen.js`)
**Purpose**: Dedicated full-screen interface for reading blog posts

**Features**:
- Immersive reading experience with auto-hiding controls
- Support for both hosted content and external URLs via iframe
- Reading progress tracking with visual progress bar
- Fullscreen mode for distraction-free reading
- Share and bookmark functionality
- Scroll-based progress tracking
- Reading time estimation

**Keyboard Shortcuts**:
- `F` - Toggle fullscreen
- `S` - Share post
- `B` - Bookmark post
- `Space` - Toggle controls visibility
- `Escape` - Exit fullscreen or back to main

#### 4. Base Screen (`/shared/screens/base-screen.js`)
**Purpose**: Universal base server management (reusable across all Nullary apps)

**Features**:
- Interactive SVG feed showing connected base servers
- Expandable server rows with detailed information (lexary, photary, viewary)
- Join/Leave functionality with visual state changes
- Connection status indicators with glow effects
- Real-time updates and refresh capabilities
- Animated expansions and smooth transitions
- Integration with base-command.js patterns from screenary

## Core Components

### Blog Preview System
- **`createBlogPreviewCard()`** - SVG-based preview cards with hover effects
- **`createBlogPreviewGrid()`** - Responsive grid layout
- **`createBlogPreviewSkeleton()`** - Loading states with shimmer animations

### Blog Creation System  
- **`createBlogCreationForm()`** - Comprehensive dual-mode creation form
- **File Upload Support**: Images (JPEG, PNG, WebP), Content (MD, HTML, PDF, TXT)
- **Validation System**: Real-time form validation with error display
- **Preview Integration**: Live preview before publishing

### Blog Viewing System
- **`createBlogViewer()`** - Content viewer with markdown processing
- **`createModalBlogViewer()`** - Modal version for quick previews
- **Security Features**: HTML sanitization, iframe sandboxing
- **Content Processing**: Basic markdown to HTML conversion

### Sanora Integration (`/shared/utils/sanora-integration.js`)
- **`SanoraClient`** - Complete API client with sessionless authentication
- **File Upload Pipeline**: Images and content files to Sanora service
- **Blog Product Creation**: Transform blog posts into sellable Sanora products
- **Mock Client**: Development/testing support with sample data
- **Error Handling**: Comprehensive error handling and retry logic

### Layered UI System
- **Multi-layer Architecture**: Background, content, and HUD layers
- **Transparent Scrolling**: HUD overlays with transparent zones for scrolling
- **Event Forwarding**: Automatic scroll event forwarding between layers
- **Z-index Management**: Proper layer stacking and visibility control

## Backend Architecture

### Allyabase Integration

Rhapsold includes a complete Rust backend that integrates with the entire allyabase ecosystem, providing production-ready blog management capabilities.

#### Local Crates Dependencies
```toml
[dependencies.addie-rs]
path = "../../../../addie/src/client/rust/addie-rs"     # Payment processing

[dependencies.fount-rs] 
path = "../../../../fount/src/client/rust/fount-rs"    # MAGIC transactions

[dependencies.bdo-rs]
path = "../../../../bdo/src/client/rust/bdo-rs"        # Big Dumb Object storage

[dependencies.dolores-rs]
path = "../../../../dolores/src/client/rust/dolores-rs" # Media storage

[dependencies.sanora-rs]
path = "../../../../sanora/src/client/rust/sanora-rs"  # Product hosting
```

#### Backend Services (`src-tauri/src/lib.rs`)

**User Management Functions**:
- `create_fount_user()` - Create MAGIC transaction user
- `create_bdo_user()` - Create BDO storage user  
- `create_dolores_user(dolores_url)` - Create media storage user
- `create_sanora_user(sanora_url)` - Create blog product hosting user

**Base Server Management**:
- `get_bases(uuid, bdo_url)` - Retrieve available allyabase servers for connection
- Supports multiple base configurations and server switching

**Blog Management (Sanora Integration)**:
- `add_product(uuid, sanora_url, title, description, price)` - Create new blog post as product
- `get_sanora_user(uuid, sanora_url)` - Get user info including all blog products
- `get_orders_for_product_id(uuid, sanora_url, product_id)` - Get blog post orders/readers
- `add_order(uuid, sanora_url, order)` - Process blog post purchases/subscriptions

**Payment Processing (Addie Integration)**:
- `get_payment_intent_with_splits(amount, currency, payees)` - Multi-party payments
- `get_payment_intent_without_splits(amount, currency)` - Single payee payments
- Supports Stripe integration and MAGIC protocol transactions

**Media Management (Dolores Integration)**:
- `get_feed(uuid, dolores_url, tags)` - Retrieve media feeds with tagging
- Support for images, videos, and rich media content

**Development Utilities**:
- `dbg(log)` - Debug logging for development
- `get_sessionless()` - Sessionless authentication management

#### Authentication System

**Sessionless Protocol**:
- Uses secp256k1 cryptographic keys (no passwords/emails required)
- Default development key provided, overrideable via `PRIVATE_KEY` environment variable
- All API calls authenticated with cryptographic signatures
- Portable identity across all allyabase services

```rust
async fn get_sessionless() -> Result<Sessionless, String> {
    let private_key = env::var("PRIVATE_KEY").unwrap_or_else(|_| {
        String::from("b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496")
    });
    let sessionless = Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    Ok(sessionless)
}
```

#### Blog Product Workflow

**1. User Creation**:
```javascript
// Frontend calls backend
const sanoraUser = await invoke('create_sanora_user', { sanoraUrl: 'http://localhost:7243' });
```

**2. Blog Post Creation**:
```javascript
// Create blog as Sanora product
const product = await invoke('add_product', {
    uuid: sanoraUser.uuid,
    sanoraUrl: 'http://localhost:7243',
    title: 'My Blog Post',
    description: 'Blog post content...',
    price: 0  // Free blog post
});
```

**3. Blog Management**:
```javascript
// Get all user's blog posts
const user = await invoke('get_sanora_user', {
    uuid: sanoraUser.uuid,
    sanoraUrl: 'http://localhost:7243'
});
// user.products contains all blog posts
```

#### Error Handling

All backend functions include comprehensive error handling:
- Network connectivity issues
- Authentication failures  
- Service unavailability
- Invalid parameters
- Graceful degradation to offline mode

#### Development vs Production

**Development Mode**:
- Uses hardcoded development private key
- Connects to local allyabase services (localhost:7243, etc.)
- Debug logging enabled
- Mock data support

**Production Mode**:
- Environment variable-based private key (`PRIVATE_KEY`)
- Connects to production allyabase servers
- Optimized error handling
- Real payment processing

## Configuration

### Theme System
The app uses a comprehensive theme system defined in `/src/config/theme.js`:

```javascript
{
  colors: {
    primary: '#2c3e50',
    secondary: '#7f8c8d', 
    accent: '#3498db',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#2c3e50',
    // ... additional colors
  },
  typography: {
    fontFamily: 'Georgia, serif',
    fontSize: 16,
    lineHeight: 1.6,
    headerSize: 32,
    postTitleSize: 24
  }
}
```

### Sanora Configuration
Integration with Sanora service for blog storage:

```javascript
{
  baseUrl: 'http://127.0.0.1:7243',
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxContentSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedContentTypes: ['.md', '.html', '.txt', '.pdf']
}
```

## Teleportation Implementation

**Overview**: Rhapsold implements the complete Planet Nine teleportation protocol for cross-base content discovery, displaying teleported content in the right column of the main screen.

### Key Components

**Frontend Functions**:
- **`fetchTeleportedContentFromBases()`** - Main function that fetches teleported content from all connected bases
- **`getBasePubKeyForTeleportation(baseUrl)`** - Gets the base's public key for signature validation
- **`processTeleportedData(teleportedData, baseId, baseName, baseUrl)`** - Processes and parses teleported HTML content

**Backend Function**:
- **`teleport_content(bdo_url, teleport_url)`** - Rust function that uses BDO service to fetch content avoiding CORS

### Protocol Flow

1. **Discovery**: Get available bases from BDO with both `sanora` and `bdo` DNS entries
2. **Public Key Retrieval**: Get base's public key from Sanora user for validation
3. **URL Construction**: Build `allyabase://sanora/teleportable-products?pubKey={key}` URL
4. **Teleportation**: Call Tauri backend which uses BDO to fetch and validate content
5. **Processing**: Parse returned HTML to extract `<teleportal>` elements
6. **Display**: Show teleported items in right column with prices, descriptions, and metadata

### allyabase:// Protocol

The `allyabase://` protocol enables container networking in Docker environments:
- **Format**: `allyabase://sanora/teleportable-products`
- **Translation**: BDO translates to actual container URLs (e.g., `http://127.0.0.1:5121/`)
- **Benefits**: Avoids CORS, enables container networking, supports cryptographic validation

### Example Code

```javascript
// Fetch teleported content using allyabase:// protocol
const teleportableUrl = `allyabase://sanora/teleportable-products`;
const pubKey = await getBasePubKeyForTeleportation(base.dns.sanora);
const teleportUrl = `${teleportableUrl}?pubKey=${pubKey}`;

const teleportedData = await window.__TAURI__.core.invoke('teleport_content', {
    bdoUrl: base.dns.bdo,
    teleportUrl: teleportUrl
});

const processedItems = await processTeleportedData(teleportedData, baseId, base.name, base.dns.sanora);
```

### Testing Teleportation

Run with test environment to see real teleported content:
```bash
RHAPSOLD_ENV=test npm run tauri dev
```

Expected logs:
```
🔍 Teleporting from DEV - Sanora: http://127.0.0.1:5121/, BDO: http://127.0.0.1:5114/
🔗 Using allyabase:// protocol for container networking: allyabase://sanora/teleportable-products?pubKey=...
📄 Parsing teleported HTML content...
🔍 Found 1 teleportal elements
✅ Processed 1 teleported items from DEV
```

## Development Workflow

### Environment Configuration

Rhapsold supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
rhapsoldEnv.switch('test')
location.reload()

// Switch to dev server
rhapsoldEnv.switch('dev') 
location.reload()

// Check current environment
rhapsoldEnv.current()

// List all environments
rhapsoldEnv.list()
```

**Via Package Scripts**:
```bash
npm run dev:dev    # Dev server
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

### Running the Application

**Prerequisites**:
- Node.js 16+ and npm installed
- Rust toolchain installed  
- Local allyabase services running (optional, for backend testing)

1. **Tauri Development** (Recommended):
   ```bash
   cd rhapsold/rhapsold
   npm install  # Install Tauri CLI and dependencies
   
   # Development with different environments
   npm run dev:dev      # Dev server (default)
   npm run dev:test     # 3-base test ecosystem
   npm run dev:local    # Local development
   ```

2. **Build for Production**:
   ```bash
   # Production builds
   npm run build:dev    # Build for dev server
   npm run build:test   # Build for test ecosystem
   npm run build:local  # Build for local
   ```

3. **Backend Testing**:
   ```bash
   # Start local Sanora service (optional)
   cd ../../../../sanora
   node src/server/node/sanora.js
   
   # Test backend functions via Tauri dev tools console
   await invoke('create_sanora_user', { sanoraUrl: getServiceUrl('sanora') });
   ```

### JavaScript Architecture (No ES6 Modules)

**Important**: Rhapsold uses vanilla JavaScript without ES6 modules for maximum Tauri compatibility and simplified deployment.

#### Current Architecture:
```javascript
// ✅ All code in main-no-modules.js - no imports needed
// Functions are globally available
function createBlogPost(title, content) { /* ... */ }
function navigateToScreen(screenId) { /* ... */ }

// Backend integration via Tauri invoke
const user = await invoke('create_sanora_user', { sanoraUrl: 'http://localhost:7243' });
```

#### Backend Integration Pattern:
```javascript
// Call Rust backend functions from JavaScript
async function createUser() {
    try {
        const user = await invoke('create_sanora_user', { 
            sanoraUrl: 'http://localhost:7243' 
        });
        console.log('User created:', user);
        return user;
    } catch (error) {
        console.error('Failed to create user:', error);
        // Fallback to local storage or offline mode
    }
}
```

#### HTML Module Loading:
```html
<!-- ✅ Correct - Module script with defer -->
<script type="module" src="main.js" defer></script>
```

#### Key Differences from Web Apps:
- **No HTTP Server Required**: Tauri loads files directly from the filesystem
- **Relative Imports Work**: Use `../../shared/` to access shared components
- **No Symlink Dependencies**: Direct file references instead of symbolic links
- **MIME Types Handled**: Tauru automatically serves `.js` files with correct MIME types

#### Common Issues and Solutions:
1. **"text/html is not a valid JavaScript MIME type"**
   - **Cause**: Opening `index.html` directly in browser instead of using Tauri
   - **Solution**: Always use `npm run tauri dev` for development

2. **Module Import Errors**
   - **Cause**: Incorrect relative paths to shared components
   - **Solution**: Use `../../shared/` prefix for shared component imports

3. **Component Not Found**
   - **Cause**: Missing or incorrect import paths
   - **Solution**: Verify file exists at `the-nullary/shared/components/` or `the-nullary/shared/utils/`

### Testing Workflow
The `test-workflow.html` provides a development interface for testing:
- Component loading verification
- Form creation and submission testing
- Post conversion workflow testing
- Mock Sanora integration testing

### Key Development Patterns

#### Screen Navigation
```javascript
// Example screen switching
const mainScreen = createMainScreen();
await mainScreen.initialize(sessionlessKeys);

mainScreen.onPostClick((post) => {
  const readingScreen = createPostReadingScreen(post);
  readingScreen.initialize();
  // Handle screen transition
});
```

#### Sanora Integration
```javascript
// Initialize Sanora client
const sanoraClient = new SanoraClient();
await sanoraClient.initialize(sessionlessKeys);

// Create blog post
const result = await sanoraClient.createBlogProduct({
  title: 'My Blog Post',
  description: 'Post description',
  author: 'Author Name',
  previewImageFile: imageFile,
  contentFile: markdownFile,
  type: 'hosted'
});
```

#### Component Usage
```javascript
// Create blog preview card
const previewCard = createBlogPreviewCard(blogPost, {
  width: 400,
  height: 320,
  hoverEnabled: true
}, (post) => {
  // Handle click
});

// Create layered UI
const layeredUI = createLayeredUI({
  layers: [
    { id: 'background', type: 'div', zIndex: 1 },
    { id: 'feed', type: 'feed', zIndex: 100 },
    { id: 'hud', type: 'hud', zIndex: 1000 }
  ]
});
```

## Features

### Blog Management
- **Dual Content Support**: Hosted content (uploaded to Sanora) and external links
- **Rich Media**: Image uploads with preview and validation
- **Content Formats**: Markdown, HTML, PDF, and plain text support
- **Pricing Support**: Free and paid blog posts via Sanora
- **Metadata Management**: Author, dates, descriptions, and tags

### User Experience
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: SVG-based animations and transitions
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Graceful error handling with user feedback
- **Keyboard Navigation**: Comprehensive keyboard shortcuts
- **Accessibility**: Screen reader support and high contrast mode

### Performance
- **Virtual Scrolling**: Efficient handling of large blog lists
- **Lazy Loading**: On-demand content loading
- **Caching**: Local storage for blog previews and user data
- **Optimized Rendering**: SVG-based rendering for crisp graphics

## Integration Points

### Allyabase Services
- **BDO**: Big Dumb Object storage for blog content
- **Dolores**: Media storage for images and videos
- **Pref**: User preferences and settings
- **Sanora**: Product hosting for blog posts

### sessionless Authentication
- **Cryptographic Keys**: secp256k1 key-based authentication
- **No Personal Data**: No emails, passwords, or personal information required
- **Portable Identity**: Keys work across all Planet Nine services

### Cross-App Compatibility
- **Shared Components**: All components work in other Nullary apps
- **Base Screen**: Universal server management across apps
- **Theme System**: Consistent theming across the ecosystem
- **Component Library**: Reusable SVG components for rapid development

## Current Status

### Completed Features ✅

**Frontend (No ES6 Modules)**:
- ✅ Complete four-screen architecture (Main, New Post, Reading, Base)  
- ✅ HUD navigation system with fixed header and screen switching
- ✅ Simplified JavaScript without ES6 modules for Tauri compatibility
- ✅ Click-to-read functionality with immersive reading mode
- ✅ Local storage persistence for blog posts
- ✅ Responsive design with hover effects and transitions
- ✅ Theme system and configuration management
- ✅ Error handling and loading states
- ✅ **Real blog post loading from Sanora services** via `get_all_base_products()`
- ✅ **Teleported content in right column** using Planet Nine teleportation protocol

**Backend (Complete Allyabase Integration)**:
- ✅ Full Rust backend with all allyabase crates (addie, fount, bdo, dolores, sanora)
- ✅ Sessionless authentication with secp256k1 cryptographic keys
- ✅ Sanora integration for blog product creation and management
- ✅ Payment processing with Addie (splits and single payee)
- ✅ Base server management and discovery via BDO
- ✅ Media storage integration via Dolores
- ✅ MAGIC transaction support via Fount
- ✅ Comprehensive error handling and graceful degradation
- ✅ Development and production configuration support
- ✅ Tauri v2.6.2 compatibility with tauri-plugin-shell and tauri-plugin-fs
- ✅ **Teleportation function** (`teleport_content`) for cross-base content discovery via BDO

### Future Enhancements

**Frontend Integration**:
- **Backend Integration**: Connect frontend to Rust backend functions  
- **Real Blog Creation**: Use `add_product()` instead of localStorage
- **User Management**: Integrate `create_sanora_user()` for real accounts
- **Base Server UI**: Complete base screen with `get_bases()` integration
- **Payment UI**: Add payment forms using Addie integration
- **Media Upload**: File upload integration with Dolores backend

**Advanced Features**:
- **Comments System**: Integration with julia for peer-to-peer messaging
- **Payment Integration**: Enhanced pricing with MAGIC transactions
- **Collaborative Editing**: Real-time collaborative post editing
- **Analytics**: Reading analytics and engagement metrics  
- **SEO Optimization**: Enhanced meta tags and social sharing
- **Offline Support**: Offline reading and draft management
- **Plugin System**: Extensible plugin architecture
- **Export Features**: PDF export and backup functionality

## Best Practices

### Component Development
1. **JSON Configuration First**: Every component accepts configuration objects
2. **SVG Elements**: Use SVG instead of HTML/CSS for UI components
3. **Responsive Behavior**: Support multiple screen sizes and orientations
4. **Theme Integration**: Use theme colors and typography consistently
5. **Error Handling**: Implement graceful error handling and user feedback

### Performance Optimization
1. **Virtual Scrolling**: Use for large lists and feeds
2. **Lazy Loading**: Load content on-demand
3. **Caching**: Cache frequently accessed data locally
4. **Debouncing**: Debounce search and filter inputs
5. **Memory Management**: Clean up event listeners and timers

### Security Considerations
1. **Input Validation**: Validate all user inputs and file uploads
2. **Content Sanitization**: Sanitize HTML content from external sources
3. **Iframe Sandboxing**: Use sandbox attributes for external content
4. **File Type Validation**: Restrict allowed file types and sizes
5. **sessionless Integration**: Use cryptographic authentication properly

Rhapsold demonstrates the full potential of The Nullary's SVG-first architecture, providing a modern, performant, and beautiful blogging experience while serving as a reference implementation for other applications in the ecosystem.