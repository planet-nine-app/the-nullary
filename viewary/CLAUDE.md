# Viewary - Standalone Short-form Video Feed Application

## Overview

Viewary is a standalone short-form video application extracted from screenary, designed to provide a TikTok-style video viewing experience within the Planet Nine ecosystem. It focuses specifically on vertical video content with swipe navigation, autoplay functionality, and seamless integration with decentralized video feeds.

## Architecture

### Three-Screen Design

1. **Feed Screen**: Main vertical video feed with TikTok-style swipe navigation and autoplay
2. **Bases Screen**: Management of connected base servers with viewary-specific video tags
3. **Planet Nine Screen**: Ecosystem overview with animated Planet Nine logo

### Technology Stack

- **Frontend**: Tauri v2.x application in mobile-first design (400x700 default window)
- **Backend**: Rust with Planet Nine service integrations
- **UI Components**: Full-screen video player with SVG overlays and gesture support
- **Services**: BDO (storage), Dolores (video feeds), Sessionless (authentication)

## Key Features

### TikTok-Style Video Feed
- **Vertical Navigation**: Swipe up/down or use arrow keys to navigate between videos
- **Autoplay**: Videos automatically play when in viewport, pause when out of view
- **Progress Bars**: Visual progress indication at the top of each video
- **Tap to Play/Pause**: Tap center of video to toggle playback
- **Global Mute Control**: Mute/unmute all videos with persistent state
- **Auto-advance**: Automatically advance to next video when current video ends

### Advanced Video Functionality
- **Lazy Loading**: Videos load progressively as user scrolls through feed
- **Intersection Observers**: Performance-optimized viewport detection for autoplay
- **Error Handling**: Graceful error states for failed video loads
- **Mobile Gestures**: Full touch and swipe gesture support
- **Keyboard Controls**: Desktop keyboard navigation (arrows, spacebar, M for mute)
- **Video Metadata**: Display of title, description, author, and tags

### Base Management
- **Discovery**: View available base servers with video content focus
- **Join/Leave**: Interactive base connection management
- **Status Indicators**: Visual feedback for connected bases
- **Viewary Tags**: View video-specific content tags (comedy, education, entertainment, music, tutorials)
- **Content Filtering**: Bases show relevant video-focused tag collections

### Planet Nine Integration
- **Animated Logo**: SVG-based Planet Nine branding with pink/red theme
- **Ecosystem Overview**: Introduction to decentralized video network
- **Service Integration**: Direct connection to BDO and Dolores services for video content

## Shared Components

Viewary uses shared components from `/the-nullary/shared/` to maintain consistency across The Nullary ecosystem:

### Video Feed Components (`/shared/feeds/video-feed.js`)
- `createVideoElement()`: Full-featured TikTok-style video player
- `createVideoFeed()`: Complete feed management with intersection observers
- `createVideoFeedEmptyState()`: Empty state with refresh functionality
- `Gestures`: Touch and mouse swipe gesture handling utilities
- `setGlobalMute()`: Global mute state management
- `navigateToVideo()`: Programmatic video navigation

### Component Features
- **Full-Screen Video**: Container-fit video display with aspect ratio preservation
- **Overlay System**: Information overlays with author, tags, and descriptions
- **Progress Tracking**: Real-time progress bars with smooth animations
- **Gesture Recognition**: Swipe threshold detection for navigation
- **Performance Optimization**: Lazy loading and observer-based autoplay

## Development Patterns

### Environment Configuration

viewary supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
viewaryEnv.switch('test')
location.reload()

// Check current environment
viewaryEnv.current()

// List all environments
viewaryEnv.list()
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


### No-Modules Architecture
Viewary follows The Nullary's no-modules approach for Tauri compatibility:

```javascript
// Inline video feed components instead of imports
const VideoFeed = {
    createVideoElement(post, options = {}) {
        // Component implementation inline
    }
};
```

### Mobile-First Design
Optimized for mobile-style vertical video consumption:

```json
// Tauri window configuration
{
  "width": 400,
  "height": 700,
  "resizable": true,
  "minWidth": 350,
  "minHeight": 600
}
```

### Service Integration
Backend integrates with Planet Nine services for video content:

```rust
// Dolores for video feeds
let dolores_client = DoloresClient::new(dolores_url, sessionless)?;
let feed = dolores_client.get_feed(uuid, vec!["videos", "entertainment"]).await?;

// Filter for video-based content
let video_posts: Vec<_> = feed_items
    .into_iter()
    .filter(|item| {
        item.get("url").and_then(|u| u.as_str()).is_some() ||
        item.get("video_url").and_then(|u| u.as_str()).is_some()
    })
    .collect();
```

### Performance Optimization
Advanced performance features for smooth video playback:

```javascript
// Video intersection observer for autoplay
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const video = entry.target.querySelector('video');
        if (entry.isIntersecting) {
            video.play().catch(() => console.log('Autoplay failed'));
        } else {
            video.pause();
        }
    });
}, { threshold: 0.5 });

// Lazy loading observer for performance
const loadObserver = new IntersectionObserver(
    function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                video.src = video.dataset.src;
                observer.unobserve(video);
            }
        });
    }, 
    { rootMargin: '2000px 0px 2000px 0px' }
);
```

## Component Structure

### Video Player Display
Each video includes:
- **Full-screen Container**: 100vh height with black background
- **Video Element**: Responsive video with object-fit contain
- **Progress Bar**: Top-positioned progress indicator
- **Tap Area**: Full-screen touch area for play/pause
- **Control Overlay**: Mute button with circular design
- **Info Overlay**: Title, author, description, and tags
- **Loading/Error States**: Graceful handling of video load failures

### Base Cards
Base server cards show:
- **Connection Status**: Visual indicators for joined/available bases
- **Server Metadata**: Description and video content focus
- **Viewary Tags**: Video-specific categories (comedy, education, entertainment, music, tutorials, vlogs)
- **Action Buttons**: Join/leave functionality with real-time updates

### Content Types
Viewary handles various video content types:
- **Short-form Videos**: TikTok-style vertical videos under 60 seconds
- **Educational Content**: Tutorials, explanations, and how-to videos
- **Entertainment**: Comedy, music, dance, and viral content
- **User-Generated**: Community-created content from connected bases

## File Structure

```
viewary/
├── src/
│   ├── main.js          # Main application logic (no modules)
│   └── index.html       # Application shell with video-optimized CSS
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs       # Backend service integration
│   │   ├── main.rs      # Tauri application entry
│   │   └── build.rs     # Build configuration
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri mobile-first configuration
├── CLAUDE.md           # This documentation
└── package.json        # Frontend dependencies
```

## Key Dependencies

### Rust Backend
- `tauri`: Cross-platform application framework
- `serde`: Serialization/deserialization
- `bdo-rs`: BDO service client for file storage
- `dolores-rs`: Dolores service client for video feeds
- `sessionless`: Authentication protocol

### JavaScript Frontend
- `@tauri-apps/api`: Tauri JavaScript API
- Vanilla JavaScript (no external dependencies)
- Inline video feed components with gesture support
- CSS3 with mobile-first responsive design

## Development Workflow

### Environment Configuration

viewary supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
viewaryEnv.switch('test')
location.reload()

// Check current environment
viewaryEnv.current()

// List all environments
viewaryEnv.list()
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


1. **Start Development**: `npm run tauri dev`
2. **Build Application**: `npm run tauri build`
3. **Backend Changes**: Modify `src-tauri/src/lib.rs`
4. **Frontend Changes**: Modify `src/main.js` or `src/index.html`
5. **Shared Components**: Update in `/the-nullary/shared/feeds/video-feed.js`

## Content Model

### Video Post Structure
```javascript
{
    uuid: "video-1",
    title: "Rust Programming Tutorial",
    description: "Learn Rust programming from scratch",
    url: "./sample1.mp4",
    thumbnail: "https://img.youtube.com/vi/sample1/maxresdefault.jpg",
    duration: 600, // seconds
    timestamp: 1642534800000,
    author: "CodeMaster",
    tags: ["programming", "rust", "tutorial"]
}
```

### Base Configuration
```javascript
{
    name: "DEV",
    description: "Development base for testing",
    soma: {
        lexary: ["tech", "programming"],
        photary: ["cats", "photography"],
        viewary: ["comedy", "education", "entertainment"]
    },
    dns: {
        bdo: "https://dev.bdo.allyabase.com/",
        dolores: "https://dev.dolores.allyabase.com/"
    },
    joined: true
}
```

## User Experience

### Video Navigation
- **Swipe Up**: Next video (mobile)
- **Swipe Down**: Previous video (mobile)
- **Arrow Keys**: Navigate videos (desktop)
- **Spacebar**: Play/pause current video (desktop)
- **M Key**: Toggle mute (desktop)
- **Tap Video**: Play/pause toggle
- **Auto-advance**: Next video when current ends

### Visual Design
- **Dark Theme**: Black background for immersive video viewing
- **Pink Accent**: #ff0050 brand color for UI elements
- **Minimal Interface**: Focus on video content with subtle overlays
- **Mobile-first**: Optimized for portrait orientation and touch interaction

### Performance Features
- **Smooth Scrolling**: Hardware-accelerated scroll with snap points
- **Lazy Loading**: Progressive video loading as user scrolls
- **Memory Management**: Unload off-screen videos to conserve memory
- **Battery Optimization**: Pause videos when app is backgrounded

## Integration Points

### With Screenary
- Shares video feed components for consistency
- Common base management functionality
- Unified Planet Nine branding with video-specific theming
- Gesture handling and video playback architecture

### With The Nullary Ecosystem
- Uses shared video component architecture
- Follows Tauri no-modules patterns
- Integrates with allyabase service infrastructure
- Consistent mobile-first design principles

### With Planet Nine Services
- **BDO**: File storage and user management
- **Dolores**: Video feed aggregation with content filtering
- **Sessionless**: Cryptographic authentication
- **Base Discovery**: Network service discovery for video content

## Content Discovery

### Tag-Based Filtering
Viewary focuses on video-relevant tags:
- **Entertainment**: comedy, music, dance, viral, memes
- **Educational**: tutorials, education, learning, howto
- **Creative**: art, music, performance, creativity
- **Technical**: programming, tech, development, science

### Content Curation
- **Video Focus**: Prioritizes visual content over text-heavy posts
- **Quality Control**: Filters for properly formatted video content
- **Performance Optimization**: Ensures smooth playback across devices
- **Duration Optimization**: Favors short-form content for mobile consumption

## Future Enhancements

### Immediate Roadmap
- **Video Upload**: Direct video upload to connected bases
- **Creation Tools**: Basic video editing and filters
- **Social Features**: Comments, likes, and sharing functionality
- **Offline Support**: Cache videos for offline viewing
- **Advanced Filters**: Content filtering by duration, quality, popularity

### Advanced Features
- **Creator Tools**: Analytics, monetization, and audience insights
- **Live Streaming**: Real-time video broadcasting to bases
- **Collaborative Features**: Duets, reactions, and video responses
- **AI Features**: Content recommendations and automated tagging
- **Cross-Platform**: iOS and Android mobile apps

### Social Features
- **Following System**: Subscribe to specific creators across bases
- **Collections**: Curated video playlists and favorites
- **Engagement**: Like, comment, and share video content
- **Discovery**: Trending videos and creator recommendations
- **Community**: Video challenges and collaborative content

## Performance Considerations

### Video-Optimized Rendering
- **Hardware Acceleration**: GPU-accelerated video decoding
- **Progressive Loading**: Load videos as needed to reduce bandwidth
- **Format Optimization**: Support for modern video codecs
- **Adaptive Quality**: Automatic quality adjustment based on connection

### Mobile Optimization
- **Battery Efficiency**: Optimized video playback for battery conservation
- **Touch Performance**: Responsive gesture handling for smooth navigation
- **Memory Management**: Intelligent caching and cleanup of video resources
- **Network Awareness**: Adapt behavior based on connection quality

## Testing

Testing follows Planet Nine patterns:
- **Backend Logic**: Rust unit tests for service integration
- **Frontend Testing**: Tauri development environment testing
- **Integration Testing**: Against development allyabase services
- **Video Testing**: Mock video posts with various formats and qualities
- **Performance Testing**: Load testing with large video feeds

## Accessibility

### Video Accessibility
- **Audio Control**: Clear mute/unmute indicators and functionality
- **Visual Indicators**: Progress bars and loading states for all users
- **Keyboard Support**: Full keyboard navigation for desktop users
- **Screen Reader**: Proper semantic markup for video content
- **Motion Sensitivity**: Respect user preferences for reduced motion

### Content Accessibility
- **High Contrast**: Support for high contrast viewing modes
- **Focus Management**: Clear focus indicators and navigation paths
- **Audio Alternatives**: Support for captions and video descriptions
- **Gesture Alternatives**: Keyboard shortcuts for all touch gestures

Viewary demonstrates the power of focused, single-content-type applications while maintaining the full richness of The Nullary's shared component architecture. It provides a premium short-form video experience within the Planet Nine ecosystem, emphasizing smooth playback, intuitive navigation, and decentralized content discovery.