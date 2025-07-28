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
- **Frontend**: SVG components with embedded CSS, vanilla JavaScript
- **Backend**: Sanora service integration for blog storage and management
- **Authentication**: sessionless protocol with secp256k1 cryptographic keys
- **Desktop**: Tauri framework (Rust + Web) for cross-platform apps
- **Storage**: Sanora (lightweight product hosting) + local storage for caching

## Project Structure

```
rhapsold/
├── src/
│   ├── main.js                 # Main application entry point
│   ├── components/
│   │   └── app.js             # App initialization
│   ├── config/
│   │   └── theme.js           # Theme configuration
│   ├── services/
│   │   └── allyabase.js       # Allyabase service integration
│   └── shared/                # Symlink to /the-nullary/shared/
├── src-tauri/                 # Tauri configuration and Rust code
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/main.rs
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

## Development Workflow

### Running the Application

1. **Tauri Development** (Recommended):
   ```bash
   cd rhapsold/rhapsold
   npm install
   npm run tauri dev
   ```

2. **Build for Production**:
   ```bash
   npm run tauri build
   ```

3. **Browser Development** (Testing only):
   ```bash
   cd rhapsold/rhapsold/src
   # Serve files locally for component testing
   python -m http.server 8000
   # Open http://localhost:8000/debug-test.html
   ```

### JavaScript Module Loading in Tauri

**Important**: Rhapsold follows the Tauri pattern for loading JavaScript modules locally without requiring HTTP servers. This is different from web applications:

#### Correct Import Patterns:
```javascript
// ✅ Correct - Relative imports from shared directory
import { createTextComponent } from '../../shared/components/text.js';
import { createBlogUI } from '../../shared/utils/layered-ui.js';

// ✅ Correct - Local app components  
import { initializeApp } from './components/app.js';
import { loadTheme } from './config/theme.js';
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
- ✅ Complete four-screen architecture (Main, New Post, Reading, Base)
- ✅ SVG-first component system with JSON configuration
- ✅ Layered UI with transparent scrolling HUD overlays
- ✅ Comprehensive blog creation and editing workflow
- ✅ Sanora integration for blog storage and management
- ✅ Dual content support (hosted + external URLs)
- ✅ File upload system with validation
- ✅ Reading progress tracking and immersive reading mode
- ✅ Search and filtering capabilities
- ✅ Responsive design and accessibility features
- ✅ Keyboard shortcuts and navigation
- ✅ Theme system and configuration management
- ✅ Error handling and loading states
- ✅ Mock data support for development

### Future Enhancements
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