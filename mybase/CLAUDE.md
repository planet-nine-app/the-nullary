# MyBase - Social Networking Platform

## Overview

MyBase is a comprehensive social networking platform built on the Planet Nine ecosystem, designed as a Facebook-like alternative that combines text posts, photos, and videos in a unified social feed. It's the central hub for social interaction within the Planet Nine network, emphasizing profile-based connections, base community management, and multi-format content sharing.

## Architecture

### Four-Screen Social Platform

1. **Feed Screen**: Unified social feed combining text, photo, and video posts from connected profiles
2. **Profile Screen**: Complete profile management with prof service integration
3. **Bases Screen**: Base server management with capacity limits and community stats
4. **Planet Nine Screen**: Ecosystem overview highlighting decentralized social networking

### Technology Stack

- **Frontend**: Tauri v2.x application with desktop-first design (1200x800 default window)
- **Backend**: Rust with complete Planet Nine service integrations
- **UI Components**: Modern CSS with card-based design and modal interfaces
- **Services**: Prof (profiles), BDO (storage), Dolores (feeds), Sessionless (authentication)
- **Spell System**: Universal castSpell.js and signCovenant.js integration with environment-aware service discovery

## Key Features

### Unified Social Feed
- **Multi-Content Types**: Seamlessly displays text posts, photo galleries, and video content
- **Profile-Based**: All posts are attributed to user profiles with avatars and names
- **Real-time Engagement**: Like, comment, and share counters with interactive buttons
- **Chronological Timeline**: Posts ordered by timestamp with "time ago" formatting
- **Rich Content Display**: Adaptive rendering based on post type with appropriate layouts

### Advanced Profile Management
- **Prof Service Integration**: Complete profile CRUD operations via prof service
- **Rich Profile Data**: Name, email, bio, skills, website, location, and profile images
- **Profile Creation Wizard**: Step-by-step profile setup for new users
- **Profile Display**: Beautiful profile cards with avatar, details, and skill tags
- **Image Support**: Profile image upload and display with fallback initials

### Base Community Management
- **Capacity Limits**: Enforced 999 profile limit and 999 post limit per base
- **Base Statistics**: Real-time display of profile count and post count
- **Join/Leave Functionality**: Interactive base membership with capacity checks
- **Base Discovery**: View available bases with descriptions and current stats
- **Community Health**: Visual indicators for base capacity and activity levels

### Multi-Format Post Creation
- **Text Posts**: Title, content, and tags with rich text display
- **Photo Posts**: Multiple image support with gallery layout and descriptions
- **Video Posts**: Video embedding with thumbnails, duration, and descriptions
- **Unified Creation Modal**: Single interface for creating all post types
- **Tag System**: Hashtag support for content categorization and discovery

## Service Integration

MyBase integrates with multiple Planet Nine services:

### Prof Service Integration (`prof-rs`)
- **Profile Management**: Complete CRUD operations for user profiles
- **Image Handling**: Profile image upload, storage, and authenticated URLs
- **PII Protection**: Secure handling of personal information
- **Authentication**: Sessionless-based profile access control

### Content Services
- **BDO**: File storage for images and media content
- **Dolores**: Feed aggregation and content distribution
- **Sessionless**: Cryptographic authentication for all operations

### Data Flow Architecture
```
User Authentication (sessionless) → Profile Creation (prof) → Content Creation (dolores/bdo) → Social Feed Display (unified)
```

## Development Patterns

### Environment Configuration

mybase supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
mybaseEnv.switch('test')
location.reload()

// Check current environment
mybaseEnv.current()

// List all environments
mybaseEnv.list()
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
MyBase follows The Nullary's no-modules approach for Tauri compatibility:

```javascript
// Inline service integration instead of imports
const appState = {
    currentProfile: null,
    socialPosts: [],
    bases: [],
    currentPostType: 'text'
};
```

### Service Integration Pattern
Backend integrates with Planet Nine services for social functionality:

```rust
// Prof service for profile management
let prof_client = ProfClient::new(prof_url)?;
let profile = prof_client.create_profile(sessionless, profile_data, image_data).await?;

// Unified post creation
match post_type {
    PostType::Text => create_text_post_internal(title, content, tags).await,
    PostType::Photo => create_photo_post_internal(title, description, images, tags).await,
    PostType::Video => create_video_post_internal(title, description, url, thumbnail, duration, tags).await,
}
```

### Capacity Management
Base limits enforced at the service level:

```rust
const MAX_PROFILES_PER_BASE: usize = 999;
const MAX_POSTS_PER_BASE: usize = 999;

// Check capacity before joining base
if base.profile_count >= MAX_PROFILES_PER_BASE {
    return Err(format!("Base {} is at capacity ({} profiles)", base_name, MAX_PROFILES_PER_BASE));
}
```

## Component Structure

### Social Post Display
Each post includes:
- **Author Header**: Profile avatar, name, timestamp, and post type badge
- **Content Area**: Adaptive display for text, images, or video based on post type
- **Tag System**: Hashtag display with consistent styling
- **Engagement Bar**: Like, comment, and share buttons with counters
- **Responsive Layout**: Optimized for desktop social browsing

### Profile Management
Profile components include:
- **Profile Cards**: Large avatar, name, bio, and detailed information
- **Creation Wizard**: Step-by-step form for new profile setup
- **Skill Tags**: Visual representation of user skills and interests
- **Contact Information**: Website, location, and email display
- **Action Buttons**: Edit profile, view posts, and management options

### Base Management
Base server cards show:
- **Capacity Indicators**: Visual progress bars for profile and post limits
- **Community Stats**: Real-time member and content counts
- **Status Badges**: Joined/available status with appropriate styling
- **Action Controls**: Join/leave buttons with capacity-aware enabling
- **Description Cards**: Rich information about each base community

## File Structure

```
mybase/
├── src/
│   ├── main.js              # Main social application logic (no modules)
│   ├── index.html           # Application shell with social-focused CSS
│   ├── environment-config.js # Environment switching (dev/test/local)
│   ├── base-command.js      # Base discovery and management
│   ├── form-widget.js       # Sanora form widget for post creation
│   └── post-widget.js       # Dolores post widget for post display
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs           # Backend service integration with prof
│   │   ├── main.rs          # Tauri application entry
│   │   └── build.rs         # Build configuration
│   ├── Cargo.toml           # Rust dependencies including prof-rs
│   └── tauri.conf.json      # Tauri desktop configuration
├── CLAUDE.md               # This documentation
└── package.json            # Frontend dependencies
```

## Key Dependencies

### Rust Backend
- `tauri`: Cross-platform application framework
- `serde`: Serialization/deserialization with datetime support
- `prof-rs`: Profile service client for user management
- `bdo-rs`: File storage service client
- `dolores-rs`: Content feed service client
- `sessionless`: Authentication protocol
- `chrono`: DateTime handling for timestamps

### JavaScript Frontend
- `@tauri-apps/api`: Tauri JavaScript API
- Vanilla JavaScript (no external dependencies)
- CSS3 with card-based design system
- Modal interfaces for content creation

## Development Workflow

### Environment Configuration

mybase supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
mybaseEnv.switch('test')
location.reload()

// Check current environment
mybaseEnv.current()

// List all environments
mybaseEnv.list()
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
5. **Profile Service**: Ensure prof service running on `localhost:3007`

## Data Models

### Profile Data Structure
```javascript
{
    uuid: "profile-uuid",
    name: "Alice Developer",
    email: "alice@example.com",
    bio: "Software developer passionate about decentralized technology",
    skills: ["Rust", "JavaScript", "React"],
    website: "https://alice.dev",
    location: "San Francisco, CA",
    image_url: "https://example.com/profile.jpg",
    created_at: "2025-01-01T00:00:00Z",
    additional_fields: {}
}
```

### Social Post Structure
```javascript
{
    uuid: "post-uuid",
    post_type: "Text" | "Photo" | "Video",
    author: ProfileData,
    content: {
        type: "Text",
        title: "Optional title",
        content: "Post content",
        tags: ["tag1", "tag2"]
    },
    timestamp: "2025-01-01T00:00:00Z",
    likes: 42,
    comments: 5,
    shares: 2
}
```

### Base Data Structure
```javascript
{
    name: "DEV",
    description: "Development base for testing social features",
    profile_count: 50,
    post_count: 250,
    joined: true,
    soma: {
        lexary: ["social", "tech", "programming"],
        photary: ["photos", "social"],
        viewary: ["videos", "social", "entertainment"]
    }
}
```

## User Experience

### Social Feed Navigation
- **Unified Timeline**: Single feed showing all content types
- **Profile-Centric**: Every post shows author information
- **Engagement Actions**: Interactive like, comment, share buttons
- **Content Adaptation**: Different layouts for text, photos, videos
- **Real-time Updates**: Fresh content loading and refresh capabilities

### Profile Management Flow
1. **Profile Check**: Automatic profile detection on app launch
2. **Creation Wizard**: Step-by-step profile setup for new users
3. **Profile Display**: Rich profile cards with all user information
4. **Edit Capabilities**: Update profile information and images
5. **Post History**: View user's content history and statistics

### Base Community Features
- **Capacity Awareness**: Visual indicators for base limits
- **Community Health**: Statistics showing active members and content
- **Join Process**: Seamless base joining with capacity checks
- **Discovery**: Browse available bases with descriptions and stats

## Content Creation

### Widget-Based Post Creation System
MyBase uses Planet Nine widget components for an integrated post creation and display experience:

#### Sanora Form Widget Integration
- **Widget Source**: Uses `form-widget.js` from Sanora service for consistent form experience
- **Modal Integration**: Form widget loads in create post modal with proper styling
- **Field Configuration**: Configurable form fields (Title, Content, Tags) with validation
- **Submission Handling**: Direct integration with Dolores generic post endpoint
- **UX Consistency**: Same form experience across all Planet Nine applications

```javascript
// Form widget configuration
const formConfig = {
    "Title": { type: "text", required: false },
    "Content": { type: "textarea", charLimit: 1000, required: true },
    "Tags": { type: "text", required: false }
};

// Widget initialization
const formWidget = window.getForm(formConfig, handlePostSubmission);
container.appendChild(formWidget);
```

#### Dolores Post Widget Integration
- **Widget Source**: Uses `post-widget.js` from Dolores service for rich post display
- **Event Components**: Supports complex post layouts with images, descriptions, dates, addresses
- **Spacer System**: Advanced layout control with spacer elements for bottom-anchored content
- **Builder Pattern**: Chainable PostWidgetBuilder for programmatic post construction

```javascript
// Post widget builder example
const post = new PostWidgetBuilder(container, { debug: true })
    .name('Social Media Post')
    .description('Post content and description...')
    .spacer() // Push content to bottom
    .button('Interact')
    .build();
```

### Post Creation Workflow
1. **FAB Access**: Floating action button opens create post modal
2. **Form Widget**: Sanora form widget provides consistent input experience  
3. **Content Entry**: Title, content, and tags with real-time validation
4. **Dolores Integration**: Posts submitted to `/user/:uuid/post` endpoint
5. **Widget Display**: Posts rendered using Dolores post-widget for consistent styling
6. **Feed Integration**: New posts appear immediately in social feed

## Integration Points

### With Prof Service
- **Profile CRUD**: Complete profile management lifecycle
- **Image Handling**: Profile image upload and authenticated access
- **Authentication**: Sessionless-based secure profile operations
- **PII Protection**: Secure handling of personal information

### With The Nullary Ecosystem
- **Shared Architecture**: Consistent with other Nullary applications
- **Service Integration**: Unified approach to Planet Nine services
- **Design System**: Consistent styling and interaction patterns
- **No-Modules Pattern**: Tauri-compatible JavaScript architecture

### With Planet Nine Services
- **BDO**: File storage for images and media content
- **Dolores**: Content feed aggregation, post storage, and widget components
- **Sanora**: Form widget components for consistent input experience
- **Sessionless**: Cryptographic authentication for all operations
- **Base Discovery**: Network service discovery for social connections

### Widget Component System
MyBase demonstrates Planet Nine's widget component strategy:

#### Cross-Service Widget Usage
- **Sanora Form Widget**: Provides consistent form experience across applications
- **Dolores Post Widget**: Rich post display with event-style layouts
- **Shared CSS Integration**: Widgets integrate seamlessly with MyBase styling
- **Modal Compatibility**: Widgets work within modal dialogs and main UI

#### Widget Loading Pattern
```html
<!-- Widget scripts loaded in index.html -->
<script src="form-widget.js"></script>
<script src="post-widget.js"></script>

<!-- Widgets initialized in main.js -->
<script>
// Form widget for post creation
const formWidget = window.getForm(formConfig, handleSubmission);

// Post widget for display
const postWidget = new PostWidgetBuilder(container)
    .name('Post Title')
    .description('Content...')
    .build();
</script>
```

#### Widget Integration Benefits
- **Consistency**: Same form/post experience across Planet Nine apps
- **Maintainability**: Widget updates improve all applications simultaneously  
- **Modularity**: Applications can mix and match widgets as needed
- **Styling**: Widgets adapt to host application's CSS and themes

## Capacity Management

### Base Limits Implementation
MyBase enforces strict capacity limits to ensure healthy community sizes:

#### Profile Limits (999 per base)
- **Join Prevention**: Cannot join bases at profile capacity
- **Visual Indicators**: Progress bars showing current vs. maximum capacity
- **Status Updates**: Real-time capacity monitoring
- **Graceful Degradation**: Clear messaging when bases are full

#### Post Limits (999 per base)
- **Content Throttling**: Prevent content overload in bases
- **Quality Focus**: Encourage thoughtful posting over quantity
- **Community Health**: Maintain manageable content volumes
- **Fair Distribution**: Equal opportunity for all community members

### Capacity Monitoring
```rust
pub struct BaseStats {
    pub profile_count: usize,
    pub post_count: usize,
    pub max_profiles: usize,    // 999
    pub max_posts: usize,       // 999
    pub can_add_profile: bool,
    pub can_add_post: bool,
}
```

## Future Enhancements

### Immediate Roadmap
- **Enhanced Profile Editing**: Full profile update interface with image upload
- **Post Interactions**: Implement like, comment, and share functionality
- **Search and Discovery**: Find profiles and content across bases
- **Notification System**: Real-time updates for social interactions

### Advanced Social Features
- **Friend Connections**: Follow/follower system across bases
- **Private Messaging**: Direct messaging between users
- **Groups and Communities**: Create focused discussion groups
- **Content Moderation**: Community-driven content management
- **Privacy Controls**: Granular visibility settings for posts and profiles

### Rich Media Features
- **Video Streaming**: Native video playback and streaming
- **Image Galleries**: Advanced image viewing with zoom and navigation
- **Live Streaming**: Real-time video broadcasting
- **Story Features**: Temporary content sharing
- **Media Upload**: Direct file upload from desktop applications

### Community Management
- **Moderator Tools**: Base administrators with management capabilities
- **Community Guidelines**: Customizable rules and enforcement
- **Analytics Dashboard**: Community health and engagement metrics
- **Event Management**: Community events and announcements
- **Reputation System**: Trust and reputation scoring

## Performance Considerations

### Social Feed Optimization
- **Lazy Loading**: Progressive content loading as user scrolls
- **Image Optimization**: Responsive images with appropriate sizing
- **Content Caching**: Smart caching of frequently accessed content
- **Pagination**: Efficient loading of large social feeds

### Profile Management
- **Profile Caching**: Cache frequently accessed profile information
- **Image Optimization**: Compressed profile images with multiple sizes
- **Batch Operations**: Efficient bulk profile operations
- **Search Indexing**: Fast profile search and discovery

## Testing

Testing follows Planet Nine patterns:
- **Backend Logic**: Rust unit tests for service integration
- **Frontend Testing**: Tauri development environment testing
- **Integration Testing**: Against development prof/dolores services
- **Social Features**: Real social interactions and content creation
- **Capacity Testing**: Base limit enforcement and edge cases

## Accessibility

### Social Accessibility
- **Screen Reader Support**: Proper semantic markup for social content
- **Keyboard Navigation**: Full keyboard accessibility for all features
- **Focus Management**: Clear focus indicators and navigation paths
- **High Contrast**: Support for high contrast viewing modes
- **Text Scaling**: Responsive text sizing for readability

### Content Accessibility
- **Alt Text**: Image descriptions for screen readers
- **Video Captions**: Support for video captioning (future)
- **Color Independence**: Information not conveyed by color alone
- **Motion Sensitivity**: Respect user preferences for reduced motion

## Security Considerations

### Profile Security
- **Sessionless Authentication**: Cryptographic key-based access control
- **PII Protection**: Secure handling of personal information via prof service
- **Data Isolation**: Profile data separated from content data
- **Access Control**: Authenticated requests for all profile operations

### Content Security
- **Content Validation**: Server-side validation of all user-generated content
- **XSS Prevention**: Proper sanitization of user input
- **CSRF Protection**: Cross-site request forgery prevention
- **File Upload Security**: Secure handling of image and media uploads

### Community Safety
- **Capacity Enforcement**: Prevent community overload and abuse
- **Rate Limiting**: Prevent spam and excessive posting
- **Content Moderation**: Tools for community self-moderation
- **Privacy Controls**: User control over content visibility

MyBase represents the evolution of social networking within the Planet Nine ecosystem, combining the best aspects of traditional social media with the privacy, security, and decentralization principles of the Planet Nine network. It serves as the central hub for social interaction while maintaining user control and community health through innovative capacity management and service integration.