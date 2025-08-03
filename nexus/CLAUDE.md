# Nexus Portal - Planet Nine Ecosystem Showcase

## Purpose

Nexus is the central web portal that visually demonstrates the complete Planet Nine ecosystem. It serves as the "front door" to Planet Nine, showcasing how all services work together through an elegant, unified interface.

## Key Context from Development

### Architecture
- **Web-based** (not Tauri) - Simple HTML/CSS/JS served by Express.js
- **SVG-First UI** - Following Nullary design principles but for browsers
- **Four Main Portals**: Content & Social, Communications, Shopping, Base Discovery
- **API Proxy** - Routes requests to allyabase services with graceful fallbacks

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
├── public/                 # Frontend (served statically)
│   ├── index.html         # Main portal page
│   ├── css/nexus.css      # Responsive styling
│   └── js/
│       ├── main.js        # Portal navigation
│       └── shared/api-client.js # Service integration
├── server/                # Express.js backend  
│   ├── server.js          # Main server (NO helmet.js)
│   └── package.json       # Dependencies (helmet removed)
└── CLAUDE.md             # This file
```

### Key APIs
- `GET /api/ping` - Health check
- `GET /api/services/status` - All service health monitoring  
- `GET /api/bases/status` - Connected base status
- `GET /api/content/feed` - Mock aggregated content
- `GET /api/shopping/products` - Mock product catalog

### Development Commands
```bash
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
- **Mock data integration** demonstrating cross-base content aggregation
- **Professional interface** ready for stakeholder presentations
- **Browser automation** for automated screenshot capture

### Future Enhancements
- Real content aggregation from Dolores
- Web-based StackChat P2P messaging interface
- Shopping cart with Sanora integration
- Base management with visual connection interface
- Sessionless authentication integration

## Usage in Ecosystem Testing

Nexus is the visual centerpiece of Planet Nine ecosystem demonstration:

1. **Automated Launch**: Test script starts server and opens browser
2. **Service Validation**: Real-time health monitoring of all 12+ services
3. **Stakeholder Demo**: Professional interface for showcasing ecosystem
4. **Cross-Base Demo**: Shows content/messaging across multiple bases
5. **Error Handling**: Graceful degradation when services unavailable

This provides concrete visual proof that the Planet Nine ecosystem delivers a user experience comparable to mainstream platforms while maintaining privacy and decentralization principles.