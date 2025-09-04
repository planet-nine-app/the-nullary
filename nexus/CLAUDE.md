# Nexus Portal - Planet Nine Ecosystem Showcase

## Purpose

Nexus is the central Planet Nine ecosystem portal available in two versions:
1. **Web Portal** (`/public/` and `/server/`) - Express.js web interface for browser-based ecosystem demonstration
2. **Tauri App** (`/nexus/`) - Desktop application with three-screen interface for comprehensive feed management

Both serve as the "front door" to Planet Nine, showcasing how all services work together through elegant, unified interfaces.

## Key Context from Development

### Architecture
- **Web-based** (not Tauri) - Simple HTML/CSS/JS served by Express.js
- **SVG-First UI** - Following Nullary design principles but for browsers
- **Four Main Portals**: Content & Social, Communications, Shopping, Base Discovery
- **API Proxy** - Routes requests to allyabase services with graceful fallbacks
- **Spell System**: Universal castSpell.js and signCovenant.js integration with environment-aware service discovery

### Critical Development Lessons

#### 1. No helmet.js Security Middleware
**Issue**: helmet.js causes SSL/HTTPS enforcement that breaks local development
**Solution**: Completely removed helmet.js from dependencies and server code
**Why**: helmet.js adds headers like `Strict-Transport-Security` and `upgrade-insecure-requests` that force browsers to use HTTPS, causing SSL errors when serving from HTTP

#### 2. Use 127.0.0.1 Instead of localhost
**Issue**: Browser SSL errors when loading assets (CSS, JS files)
**Solution**: Always use `http://127.0.0.1:3333` instead of `http://localhost:3333`
**Why**: Some browsers auto-redirect localhost to HTTPS, causing SSL errors for assets

#### 3. Process Management 
**Issue**: Server restarting constantly in loops
**Solution**: Always kill existing processes before starting new ones
**Commands**: 
- `pkill -f "server.js"` - Kill existing servers
- `lsof -ti:3333` - Check port usage
- Use `npm start` not `npm run dev` to avoid auto-restart

#### 4. Portal Sizing
**Issue**: UI elements were "gigantic" and didn't fit in desktop windows
**Solution**: Optimized responsive design
- **Desktop**: Portal cards 180px (reduced from 280px)
- **Mobile**: Single column layout with 160px cards, 140px on small screens
- **Typography**: Reduced title from 3rem to 2.2rem, optimized margins

### Testing Integration

Nexus is integrated as **Phase 5** of the complete ecosystem test suite:
- Automatically starts server on port 3333
- Opens browser to `http://127.0.0.1:3333` 
- Tests all API endpoints with automated verification
- Provides visual demonstration for stakeholders
- Supports enhanced visual demo mode with `VISUAL_DEMO=true`

### File Structure
```
nexus/
├── public/                 # Web Portal Frontend (served statically)
│   ├── index.html         # Main portal page
│   ├── css/nexus.css      # Responsive styling
│   └── js/
│       ├── main.js        # Portal navigation
│       └── shared/api-client.js # Service integration
├── server/                # Express.js backend  
│   ├── server.js          # Main server (NO helmet.js)
│   └── package.json       # Dependencies (helmet removed)
├── nexus/                 # Tauri Desktop App
│   ├── src/
│   │   ├── index.html     # Three-screen interface
│   │   ├── main.js        # Feed management & navigation
│   │   ├── environment-config.js # Environment switching
│   │   └── base-command.js # Base server management
│   ├── src-tauri/         # Rust backend
│   │   ├── src/lib.rs     # Feed APIs & service integration
│   │   └── Cargo.toml     # Planet Nine service clients
│   ├── package.json       # Tauri dependencies
│   └── README.md          # Tauri app documentation
└── CLAUDE.md             # This file
```

### Key APIs
- `GET /api/ping` - Health check
- `GET /api/services/status` - All service health monitoring  
- `GET /api/bases/status` - Connected base status
- `GET /api/content/feed` - Real aggregated content from connected bases
- `GET /api/shopping/products` - Real product catalog from Ninefy marketplace

### Development Commands
```bash

### Environment Configuration

nexus supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
nexusEnv.switch('test')
location.reload()

// Check current environment
nexusEnv.current()

// List all environments
nexusEnv.list()
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

# Install dependencies  
cd server && npm install

# Start server (production mode)
npm start

# Kill existing processes
pkill -f "server.js"

# Test server
curl http://127.0.0.1:3333/api/ping
```

### Common Issues & Solutions

#### SSL/HTTPS Errors
- **Symptoms**: "SSL error occurred and a secure connection cannot be made" for CSS/JS
- **Solution**: Use `127.0.0.1:3333` and ensure no helmet.js

#### Server Won't Start
- **Symptoms**: Port already in use errors
- **Solution**: `pkill -f "server.js"` then restart

#### Portal Cards Too Big
- **Symptoms**: UI doesn't fit in window
- **Solution**: Check CSS media queries, cards should be 180px desktop, 160px mobile

### Visual Demonstration Features

The portal serves as a comprehensive showcase:
- **Real-time service monitoring** with health percentages
- **Interactive SVG portals** with hover effects and animations  
- **Real data integration** demonstrating cross-base content aggregation
- **Professional interface** ready for stakeholder presentations
- **Browser automation** for automated screenshot capture

### Future Enhancements
- Real content aggregation from Dolores
- Web-based StackChat P2P messaging interface
- Shopping cart with Sanora integration
- Base management with visual connection interface
- Sessionless authentication integration

## Usage in Ecosystem Testing

### Environment Configuration

nexus supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
nexusEnv.switch('test')
location.reload()

// Check current environment
nexusEnv.current()

// List all environments
nexusEnv.list()
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


Nexus is the visual centerpiece of Planet Nine ecosystem demonstration:

1. **Automated Launch**: Test script starts server and opens browser
2. **Service Validation**: Real-time health monitoring of all 12+ services
3. **Stakeholder Demo**: Professional interface for showcasing ecosystem
4. **Cross-Base Demo**: Shows content/messaging across multiple bases
5. **Error Handling**: Graceful degradation when services unavailable

This provides concrete visual proof that the Planet Nine ecosystem delivers a user experience comparable to mainstream platforms while maintaining privacy and decentralization principles.

## Tauri Desktop Application

### Three-Screen Interface

The Nexus Tauri app provides a comprehensive desktop experience with three main screens:

1. **Main Screen - Feed Overview**: 
   - Feed previews for Dolores (social), Products (Sanora), and Blogs (Sanora)
   - Real-time feed counts and click-to-view functionality
   - Combined "All Content" view with unified feed display

2. **Bases Screen**:
   - Connected base servers with real-time status indicators
   - Uses shared base-command.js for consistent base management
   - Join/leave functionality and base discovery

3. **Planet Nine Screen**:
   - Animated Planet Nine logo with orbital elements
   - Ecosystem overview and philosophy
   - Beautiful visual introduction to the platform

### Feed Integration

- **Real Backend Integration**: Tauri Rust backend with Planet Nine service clients (BDO, Dolores, Sanora)
- **Mock Data Fallbacks**: Realistic development experience when services unavailable
- **Post-Widget Rendering**: Uses simplified post-widget style for consistent content display
- **Environment Switching**: Full support for dev/test/local environments

### Development Commands

```bash
# Tauri Desktop App
cd nexus/nexus
npm install

# Run with environment switching
npm run dev         # Dev server (default)
npm run dev:test    # 3-base test ecosystem  
npm run dev:local   # Local development

# Build desktop app
npm run build
```

### Key Features

- **Environment Configuration**: Uses shared environment-config.js with browser console switching
- **Base Management**: Integrates shared base-command.js for unified base server handling
- **Feed Aggregation**: Combines content from multiple sources with proper sorting and filtering
- **Offline Support**: Graceful degradation with informative placeholder content
- **Real Service Integration**: Framework for connecting to actual Planet Nine services

The Tauri version complements the web portal by providing a native desktop experience with deeper integration into the Planet Nine service ecosystem, while maintaining the same visual design principles and user experience patterns.