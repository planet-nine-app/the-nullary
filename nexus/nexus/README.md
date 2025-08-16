# Nexus - Planet Nine Ecosystem Portal (Tauri App)

## Overview

Nexus is a comprehensive Planet Nine ecosystem portal built as a Tauri desktop application. It provides a unified interface for viewing feeds from all connected bases, managing base connections, and exploring the Planet Nine ecosystem.

## Features

### Three-Screen Architecture

1. **Main Screen - Feed Overview**
   - Feed previews for Dolores (social media), Products (Sanora), and Blogs (Sanora)
   - Click any preview to view the full feed
   - Real-time feed counts and status

2. **Bases Screen** 
   - Connected base servers with status indicators
   - Uses shared base-command.js for real base management
   - Join/leave functionality (when base-command supports it)

3. **Planet Nine Screen**
   - Animated Planet Nine logo with orbital elements
   - Ecosystem overview and philosophy
   - Beautiful visual introduction to the platform

### Feed Integration

- **Dolores Feed**: Social media posts, photos, videos
- **Products Feed**: Digital goods from Sanora marketplace
- **Blogs Feed**: Blog posts and articles from Sanora
- **Combined Feed**: All content types merged and sorted by timestamp

### Backend Integration

- Real Planet Nine service integration via Rust clients
- Mock data fallbacks for offline/development use
- BDO, Dolores, and Sanora client support
- Sessionless authentication integration

## Development

### Environment Support

Nexus supports three environments:

- **dev**: Production dev server (https://dev.*.allyabase.com)
- **test**: Local 3-base test ecosystem (localhost:5111-5122)
- **local**: Standard local development (localhost:3000-3007)

### Quick Start

```bash
# Install dependencies
npm install

# Run development (dev environment)
npm run dev

# Run with specific environment
npm run dev:test    # Test ecosystem
npm run dev:local   # Local development

# Build for production
npm run build
```

### Environment Switching

In the browser console while app is running:

```javascript
// Switch environments
nexusEnv.switch('test')
location.reload()

// Check current environment
nexusEnv.current()

// List available environments
nexusEnv.list()
```

## Architecture

### Frontend (src/)
- **index.html**: Three-screen interface with navigation
- **main.js**: Application logic, feed management, screen navigation
- **environment-config.js**: Environment switching and service URLs
- **base-command.js**: Shared base server management

### Backend (src-tauri/)
- **lib.rs**: Tauri commands for feed data and base management
- **Cargo.toml**: Dependencies including Planet Nine service clients
- Mock data generation for offline development
- Real service integration framework

### Shared Components

Uses Planet Nine shared components:
- Environment configuration system
- Base command functionality
- Consistent styling and interaction patterns

## API Functions

### Tauri Commands

- `get_feed_count(feed_type)` - Get count of posts for feed type
- `get_products_count()` - Get count of available products
- `get_blogs_count()` - Get count of available blog posts
- `get_dolores_feed()` - Fetch Dolores social media feed
- `get_products_feed()` - Fetch Sanora products feed
- `get_blogs_feed()` - Fetch Sanora blogs feed
- `get_bases()` - Get connected base servers

### Feed Types

- **dolores**: Social media posts with images and descriptions
- **products**: Marketplace items with prices and metadata
- **blogs**: Blog posts and articles with content
- **all**: Combined feed sorted by timestamp

## File Structure

```
nexus/
├── src/
│   ├── index.html              # Three-screen interface
│   ├── main.js                 # Application logic
│   ├── environment-config.js   # Environment management
│   └── base-command.js         # Base server management
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs              # Tauri backend with feed APIs
│   │   └── main.rs             # Entry point
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

## Integration Points

### With Other Nullary Apps
- Shares environment configuration system
- Uses same base-command.js patterns
- Consistent navigation and interaction patterns
- Can launch other apps or show their content

### With Planet Nine Services
- **BDO**: Base discovery and content storage
- **Dolores**: Social media feeds and content
- **Sanora**: Products and blog content
- **Sessionless**: Cryptographic authentication

## Future Enhancements

- Real-time feed updates and notifications
- Content creation capabilities (posting, product uploads)
- Cross-base content aggregation and discovery
- Advanced filtering and search functionality
- Integration with other Nullary applications
- Enhanced post-widget integration for rich content display

## Development Notes

- Uses no-modules JavaScript for Tauri compatibility
- Mock data provides realistic development experience
- Environment switching enables testing across infrastructures
- Shared components maintain consistency with ecosystem

Nexus serves as both a functional portal and a demonstration of Planet Nine's unified, interoperable architecture.