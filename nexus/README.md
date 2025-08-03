# Nexus - Planet Nine Ecosystem Portal

Nexus is the central web portal that showcases the entire Planet Nine ecosystem, providing unified access to all applications and services through an elegant SVG-first interface.

## Overview

Nexus serves as the "front door" to Planet Nine, demonstrating how all the components work together:

- **Content & Social**: Aggregated feeds from rhapsold, lexary, photary, viewary, mybase
- **Communications**: Web-based StackChat interface for P2P messaging  
- **Shopping**: Cross-base product catalog from Sanora (Ninefy-style)
- **Base Discovery**: Connect to and manage allyabase instances

## Architecture

### Frontend (Public)
- **HTML/CSS/JS** - Simple web application (not Tauri)
- **SVG-First UI** - Following Nullary design principles
- **Responsive Design** - Works on desktop and mobile
- **Service Integration** - Real-time data from Planet Nine services

### Backend (Server)
- **Express.js** - Simple Node.js server
- **API Proxy** - Routes requests to allyabase services
- **Static Hosting** - Serves the portal files
- **Mock Data** - Graceful fallbacks when services unavailable

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 3. Open the Portal
Navigate to: http://127.0.0.1:3333

**Important**: Use `127.0.0.1` instead of `localhost` to avoid SSL/HTTPS issues in browsers.

## Project Structure

```
nexus/
├── public/                 # Frontend files
│   ├── index.html         # Main portal page
│   ├── content.html       # Content & social aggregation (planned)
│   ├── communications.html # StackChat web interface (planned)
│   ├── shopping.html      # Product catalog (planned)
│   ├── bases.html         # Base management (planned)
│   ├── css/
│   │   └── nexus.css      # Portal styles
│   └── js/
│       ├── main.js        # Portal navigation
│       └── shared/
│           └── api-client.js # Service integration
├── server/                # Backend server
│   ├── server.js          # Express server
│   ├── package.json       # Dependencies
│   └── routes/            # API routes (future)
└── README.md             # This file
```

## Features

### ✅ Implemented
- **Main Portal**: Four SVG portal cards with hover effects
- **Service Health**: Real-time service status checking
- **API Client**: Comprehensive client for Planet Nine services
- **Express Server**: Static hosting + API proxy
- **Responsive Design**: Mobile-friendly layout
- **Error Handling**: Graceful degradation when services unavailable

### 🚧 Planned
- **Content Aggregation**: Unified feed from all Nullary apps
- **Web StackChat**: Browser-based P2P messaging
- **Shopping Portal**: Cross-base product discovery
- **Base Management**: Visual base connection interface
- **Authentication**: Sessionless web integration

## API Endpoints

### Health & Status
- `GET /api/ping` - Server health check
- `GET /api/info` - Server information
- `GET /api/services/status` - All service status
- `POST /api/services/health` - Check specific services

### Base Management
- `GET /api/bases/status` - Connected bases
- `GET /api/bases/available` - Discoverable bases

### Content (Mock Data)
- `GET /api/content/feed` - Aggregated content feed
- `GET /api/shopping/products` - Product catalog
- `GET /api/communications/conversations` - Chat conversations

## Configuration

### Environment Variables
```bash
PORT=3333                    # Server port
NODE_ENV=development         # Environment mode
```

### Service URLs
Services are configured in `server/server.js`:
```javascript
const SERVICES = {
    julia: 'https://dev.julia.allyabase.com',
    bdo: 'https://dev.bdo.allyabase.com',
    // ... other services
};
```

## Development

### Adding New Portals
1. Create HTML file in `public/`
2. Add CSS styles in `public/css/nexus.css`
3. Create JavaScript logic in `public/js/`
4. Add API routes in `server/server.js`
5. Update navigation in `public/js/main.js`

### Testing Service Integration
```bash
# Test server health
curl http://localhost:3333/api/ping

# Test service status
curl http://localhost:3333/api/services/status

# Test with specific services
curl -X POST http://localhost:3333/api/services/health \
  -H "Content-Type: application/json" \
  -d '{"services": ["bdo", "fount"]}'
```

### Browser Development Tools
Access debug utilities in the browser console:
```javascript
// Check Nexus state
window.nexusDebug.state

// Test portal navigation
window.nexusDebug.navigateToPortal('content')

// Test API client
window.nexusAPI.ping()
```

## Integration with Planet Nine

### Service Dependencies
- **BDO**: File storage for content and media
- **Fount**: MAGIC protocol for payments and rewards
- **Julia**: P2P messaging infrastructure
- **Dolores**: Content feed aggregation
- **Sanora**: Product hosting and commerce
- **Continuebee**: Client state verification

### Cross-Base Functionality
Nexus demonstrates Planet Nine's interoperability by:
- Aggregating content from multiple bases
- Enabling cross-base messaging via StackChat
- Showing products from all connected Sanora instances
- Managing connections to different allyabase deployments

## Deployment

### Development Deployment
```bash
npm run dev
```
Runs on http://localhost:3333 with auto-reload

### Production Deployment
```bash
npm start
```

For production, consider:
- **Reverse Proxy**: nginx or Apache for SSL/performance
- **Process Manager**: PM2 for stability
- **Environment**: Proper NODE_ENV=production
- **Monitoring**: Health checks and logging

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3333
CMD ["npm", "start"]
```

## Security

### Implemented
- **Helmet.js**: Security headers
- **CORS**: Cross-origin request controls
- **Rate Limiting**: API request throttling
- **Input Validation**: JSON parsing limits

### Additional Considerations
- **HTTPS**: Use reverse proxy for SSL
- **Authentication**: Sessionless integration for user auth
- **Content Security Policy**: Restrict external resources
- **API Security**: Rate limiting and input validation

## Performance

### Optimizations
- **Static Caching**: Express static file serving
- **API Caching**: Client-side caching for service data
- **Graceful Degradation**: Works offline with cached data
- **Lazy Loading**: Portal content loaded on-demand

### Monitoring
- Service health checking with retries
- Client-side error tracking
- API response time monitoring
- Browser performance metrics

## Contributing

### Code Style
- **ES6+ JavaScript**: Modern syntax throughout
- **SVG-First**: Vector graphics for scalable UI
- **Mobile-First**: Responsive design principles
- **Accessibility**: ARIA labels and keyboard navigation

### Testing
```bash
# Test server startup
npm test

# Manual testing checklist
- [ ] All four portals load
- [ ] Service status updates
- [ ] Responsive design works
- [ ] Error handling graceful
- [ ] API endpoints respond
```

## Roadmap

### Phase 1: Core Portal ✅
- Main portal with four sections
- Service health monitoring
- Basic server and API client
- Responsive design

### Phase 2: Content Integration 🚧
- Real content aggregation from Dolores
- Cross-base feed display
- Content filtering and search
- Real-time updates

### Phase 3: Interactive Features 📋
- Web-based StackChat interface
- Shopping cart and checkout
- Base joining/leaving workflow
- User authentication

### Phase 4: Advanced Features 📋
- Offline support with service workers
- Push notifications for messages
- Advanced base discovery
- Performance optimization

## Troubleshooting

### Common Issues

#### SSL/HTTPS Errors Loading Assets
**Problem**: Browser shows SSL errors for CSS, JS, or other asset files  
**Solution**: 
- Use `http://127.0.0.1:3333` instead of `http://localhost:3333`
- Ensure server is running without helmet.js (removed for development)
- Clear browser cache and hard refresh

#### Server Restarting Constantly
**Problem**: Server keeps restarting in a loop  
**Solution**:
- Kill existing processes: `pkill -f "server.js"`
- Check for port conflicts: `lsof -ti:3333`
- Use `npm start` not `npm run dev` to avoid auto-restart
- Ensure only one server instance is running

#### Portal Sizing Issues
**Problem**: UI elements are "gigantic" or don't fit in window  
**Solution**: 
- Desktop portal cards are 180px (reduced from 280px)
- Mobile layout uses single column with 160px cards
- Check CSS media queries in `public/css/nexus.css`

#### Service Status Shows Unavailable
**Problem**: All services show as unavailable or failing  
**Solution**:
- This is expected for `dev.*.allyabase.com` services (may be down)
- Portal uses mock data gracefully when services unavailable
- Check network connectivity if needed

### Development Notes
- **No helmet.js**: Removed to prevent SSL/HTTPS enforcement issues
- **127.0.0.1 vs localhost**: Use numeric IP to avoid browser HTTPS redirects
- **Process Management**: Always kill existing processes before starting new ones
- **Port 3333**: Default port, ensure it's not in use by other services

## License

MIT License - See Planet Nine ecosystem license for details.

---

**Nexus** - *Your gateway to the Planet Nine ecosystem*

*Demonstrating privacy-first, interoperable alternatives to Big Tech platforms*