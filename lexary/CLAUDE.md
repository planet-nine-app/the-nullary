# Lexary - Standalone Text & Blog Feed Application

## Overview

Lexary is a standalone text and blog feed application extracted from screenary, designed to focus specifically on text-based content discovery and reading within the Planet Nine ecosystem. It provides a clean, minimal interface for browsing text posts, blog articles, and written content from connected bases.

## Architecture

### Four-Screen Design

1. **Feed Screen**: Main text/blog feed with SVG-rendered posts and multi-image support
2. **New Post Screen**: Text posting interface with title, content, and tags (January 2026)
3. **Bases Screen**: Management of connected base servers with lexary-specific tags
4. **Planet Nine Screen**: Ecosystem overview with animated Planet Nine logo

### Technology Stack

- **Frontend**: Tauri v2.x application with vanilla JavaScript (no ES6 modules)
- **Backend**: Rust with Planet Nine service integrations
- **UI Components**: SVG-first architecture using shared text feed components
- **Services**: BDO (storage), Dolores (text/blog feeds), Sessionless (authentication)

## Key Features

### Text Posting (January 2026)
- **Create Posts**: Users can create text posts with title, content, and tags through a dedicated posting UI
- **Post to Home Base**: Posts are saved to the user's connected Dolores instance via sessionless authentication
- **Form Validation**: Real-time validation ensures title and content are provided before posting
- **Auto-tagging**: Default "text" tag with support for custom comma-separated tags
- **Success Feedback**: Visual confirmation and automatic redirect to feed after successful post
- **Draft Preservation**: Form state preserved in app state during navigation

### Text Feed
- **Text-First Content**: Filters for text-based posts with minimal or no images
- **Rich Text Posts**: Support for blog posts with titles, content, tags, and author information
- **Multi-image Support**: Posts can contain optional images with navigation
- **Interactive Components**: SVG-based post rendering with embedded HTML text areas
- **Lazy Loading**: Performance optimization for large text feeds
- **Real-time Updates**: Refresh capability with loading states

### Base Management
- **Discovery**: View available base servers with metadata
- **Join/Leave**: Interactive base connection management
- **Status Indicators**: Visual feedback for connected bases
- **Lexary Tags**: View lexary-specific content tags from each base (tech, programming, blogs, etc.)
- **Content Filtering**: Bases show relevant text-focused tag collections

### Planet Nine Integration
- **Animated Logo**: SVG-based Planet Nine branding with orbital animations
- **Ecosystem Overview**: Introduction to the decentralized text content network
- **Service Integration**: Direct connection to BDO and Dolores services for text content

## Shared Components

Lexary uses shared components from `/the-nullary/shared/` to maintain consistency across The Nullary ecosystem:

### Text Feed Components (`/shared/feeds/text-feed.js`)
- `createTextRow()`: Multi-text post rendering with optional images
- `createTextPost()`: Text-only post creation
- `createBlogPost()`: Blog post with title and content
- `createTextFeedEmptyState()`: Empty state with refresh functionality
- `attachTextFeedLazyLoading()`: Performance optimization for text feeds

### Component Features
- **SVG-Based UI**: Vector graphics for crisp, scalable text post interfaces
- **JSON Configuration**: All components configured via simple JSON objects
- **Image Support**: Optional image galleries with navigation controls
- **Responsive Design**: Automatic scaling and viewport adaptation
- **Touch/Swipe**: Mobile-friendly gesture support for image navigation

## Development Patterns

### No-Modules Architecture
Lexary follows The Nullary's no-modules approach for Tauri compatibility:

```javascript
// Inline shared components instead of imports
const TextFeed = {
    createTextRow(text, images = [], options = {}) {
        // Component implementation inline
    }
};
```

### Service Integration
Backend integrates with Planet Nine services for text content:

```rust
// Dolores for text feeds
let dolores_client = DoloresClient::new(dolores_url, sessionless)?;
let feed = dolores_client.get_feed(uuid, vec!["text", "blogs"]).await?;

// Filter for text-based content
let text_posts: Vec<_> = feed_items
    .into_iter()
    .filter(|item| {
        let images = item.get("images").and_then(|i| i.as_array());
        images.is_none() || images.unwrap().is_empty()
    })
    .collect();
```

### Screen Management
Dynamic screen switching with state management:

```javascript
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen and load data
    const screen = document.getElementById(`${screenName}-screen`);
    screen.classList.add('active');
    loadScreenData(screenName);
}
```

## Component Structure

### Text Post Display
Each text post includes:
- **Rich Typography**: Georgia serif font for readability
- **Title and Metadata**: Post title, author, and timestamp
- **Content Preview**: Truncated content with expand option
- **Tag System**: Categorization tags for content discovery
- **Optional Images**: Image carousel when available
- **SVG Rendering**: Vector-based post containers with gradients

### Base Cards
Base server cards show:
- **Connection Status**: Visual indicators for joined/available bases
- **Server Metadata**: Description, location, and content focus
- **Lexary Tags**: Text-specific content categories (tech, programming, blogs, stories)
- **Action Buttons**: Join/leave functionality with real-time updates

### Content Types
Lexary handles various text content types:
- **Blog Posts**: Full articles with titles and rich content
- **Text Posts**: Short-form written content
- **Discussion Posts**: Community conversations and threads
- **Technical Content**: Programming, tutorials, and documentation

## File Structure

```
lexary/
├── src/
│   ├── main.js          # Main application logic (no modules)
│   └── index.html       # Application shell with embedded CSS
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs       # Backend service integration
│   │   ├── main.rs      # Tauri application entry
│   │   └── build.rs     # Build configuration
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
├── CLAUDE.md           # This documentation
└── package.json        # Frontend dependencies
```

## Key Dependencies

### Rust Backend
- `tauri`: Cross-platform application framework
- `serde`: Serialization/deserialization
- `bdo-rs`: BDO service client for file storage
- `dolores-rs`: Dolores service client for text feeds
- `sessionless`: Authentication protocol

### JavaScript Frontend
- `@tauri-apps/api`: Tauri JavaScript API
- Vanilla JavaScript (no external dependencies)
- Inline SVG components for text rendering
- CSS3 with gradient backgrounds and animations

## Development Workflow

### Environment Configuration

Lexary supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
lexaryEnv.switch('test')
location.reload()

// Check current environment
lexaryEnv.current()

// List all environments
lexaryEnv.list()
```

**Via Package Scripts**:
```bash
npm run dev:dev    # Dev server (default)
npm run dev:test   # Test ecosystem  
npm run dev:local  # Local development
```

### Development Commands

1. **Start Development**: 
   ```bash
   npm run dev:dev      # Dev server (default)
   npm run dev:test     # 3-base test ecosystem  
   npm run dev:local    # Local development
   ```

2. **Build Application**: 
   ```bash
   npm run build:dev    # Build for dev server
   npm run build:test   # Build for test ecosystem
   npm run build:local  # Build for local
   ```

3. **Backend Changes**: Modify `src-tauri/src/lib.rs`
4. **Frontend Changes**: Modify `src/main.js` or `src/index.html`
5. **Shared Components**: Update in `/the-nullary/shared/feeds/text-feed.js`

## Content Model

### Text Post Structure
```javascript
{
    uuid: "text-1",
    title: "Getting Started with Rust",
    description: "A comprehensive guide to learning Rust programming language",
    content: "Full article content...",
    images: [], // Optional image array
    timestamp: 1642534800000,
    author: "RustEnthusiast",
    tags: ["programming", "rust", "tutorial"]
}
```

### Base Configuration
```javascript
{
    name: "DEV",
    description: "Development base for testing",
    soma: {
        lexary: ["tech", "programming", "blogs"],
        photary: ["cats", "photography"],
        viewary: ["thevids", "entertainment"]
    },
    dns: {
        bdo: "https://dev.bdo.allyabase.com/",
        dolores: "https://dev.dolores.allyabase.com/"
    },
    joined: true
}
```

## Integration Points

### With Screenary
- Shares text feed components for consistency
- Common base management functionality
- Unified Planet Nine branding and theming
- SVG-based post rendering architecture

### With The Nullary Ecosystem
- Uses shared SVG component architecture
- Follows Tauri no-modules patterns
- Integrates with allyabase service infrastructure
- Consistent styling and user experience

### With Planet Nine Services
- **BDO**: File storage and user management
- **Dolores**: Text/blog feed aggregation with filtering
- **Sessionless**: Cryptographic authentication
- **Base Discovery**: Network service discovery

## Content Discovery

### Tag-Based Filtering
Lexary focuses on text-relevant tags:
- **Technical**: programming, tech, development, tutorials
- **Literary**: blogs, stories, writing, literature
- **Academic**: research, science, education, analysis
- **Community**: discussion, community, social, opinions

### Content Curation
- **Quality Focus**: Prioritizes well-written, substantial content
- **Author Attribution**: Proper crediting and author information
- **Timestamp Ordering**: Chronological feed with latest content first
- **Relevance Filtering**: Text-first content with minimal visual distractions

## Future Enhancements

### Immediate Roadmap
- **Reading Mode**: Distraction-free full-screen reading experience
- **Bookmarking**: Save interesting posts for later reading
- **Search**: Full-text search across connected bases
- **Offline Reading**: Cache posts for offline access
- **Typography Controls**: User-configurable fonts and reading preferences

### Advanced Features
- **Author Following**: Subscribe to specific writers across bases
- **Collections**: Curated reading lists and topic collections
- **Comments**: Discussion threads on text posts
- **Publishing**: Direct publishing to connected bases
- **Cross-Referencing**: Link discovery between related posts

### Social Features
- **Reading Progress**: Track reading habits and preferences
- **Recommendations**: AI-powered content discovery
- **Reading Groups**: Shared reading experiences and discussions
- **Annotations**: Private and public note-taking on posts
- **Export**: Save posts in various formats (PDF, ePub, Markdown)

## Performance Considerations

### Text-Optimized Rendering
- **SVG Efficiency**: Vector-based rendering for crisp text at any zoom level
- **Lazy Loading**: Images loaded only when needed
- **Virtual Scrolling**: Handle large feeds without performance degradation
- **Content Caching**: Smart caching of frequently accessed posts

### Mobile Optimization
- **Touch-Friendly**: Large touch targets and swipe gestures
- **Responsive Typography**: Readable text across screen sizes
- **Bandwidth Efficiency**: Text-first loading with optional image enhancement
- **Battery Conscious**: Minimal animations and efficient rendering

## Testing

Testing follows Planet Nine patterns:
- **Backend Logic**: Rust unit tests for service integration
- **Frontend Testing**: Tauri development environment testing
- **Integration Testing**: Against development allyabase services
- **Content Testing**: Real text posts with various formatting scenarios

## Accessibility

### Reading Accessibility
- **High Contrast**: Support for high contrast reading modes
- **Font Scaling**: User-configurable text size and line spacing
- **Screen Reader**: Proper semantic markup for assistive technology
- **Keyboard Navigation**: Full keyboard accessibility for all functions

### Content Accessibility
- **Plain Text Fallbacks**: SVG content with text alternatives
- **Focus Management**: Clear focus indicators and navigation
- **Color Independence**: Information not conveyed by color alone
- **Motion Sensitivity**: Reduced motion options for animations

## Posting Implementation (January 2026)

### Backend Architecture

**Dolores-rs Client** (`/dolores/src/client/rust/dolores-rs/src/lib.rs`):
```rust
pub async fn put_post(&self, uuid: &str, post: serde_json::Value)
    -> Result<DoloresUser, Box<dyn std::error::Error>> {
    let timestamp = Self::get_timestamp();
    let message = format!("{}{}", timestamp, uuid);
    let signature = self.sessionless.sign(&message).to_hex();

    let payload = json!({
        "timestamp": timestamp,
        "post": post,
        "signature": signature
    });

    let url = format!("{}user/{}/post", self.base_url, uuid);
    let res = self.put(&url, serde_json::Value::Object(payload)).await?;
    let user: DoloresUser = res.json().await?;

    Ok(user)
}
```

**Lexary Tauri Command** (`/the-nullary/lexary/lexary/src-tauri/src/lib.rs`):
```rust
#[command]
pub async fn create_post(
    dolores_url: Option<String>,
    title: String,
    content: String,
    tags: Option<Vec<String>>
) -> ServiceResponse<serde_json::Value> {
    let sessionless = get_sessionless().await?;

    let post = serde_json::json!({
        "title": title,
        "content": content,
        "tags": tags.unwrap_or_else(|| vec!["text".to_string()]),
        "author": sessionless.public_key.to_hex(),
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "uuid": sessionless::generate_uuid()
    });

    dolores_client.put_post(&sessionless.uuid, post).await
}
```

### Frontend Implementation

**New Post Screen** (`/the-nullary/lexary/lexary/src/main.js`):
- Form with title input, content textarea, and tags input
- Real-time validation before submission
- Status messages (loading, success, error)
- Auto-clear and redirect after successful post

**Posting Flow**:
1. User clicks "✏️ New Post" navigation button
2. Form loads with preserved draft state (if any)
3. User fills title, content, and optional tags
4. Click "Publish Post" triggers validation
5. Frontend calls `create_post` Tauri command
6. Backend creates post object with author and timestamp
7. Dolores-rs client PUTs post to Dolores service
8. Success confirmation shown, then redirect to feed
9. New post appears in feed after refresh

**Dolores Endpoint** (`PUT /user/:uuid/post`):
- Validates sessionless signature (message: `timestamp + uuid`)
- Saves post to Redis via `db.savePost()`
- Returns updated user object

### Post Object Structure
```javascript
{
  "title": "Getting Started with Rust",
  "content": "Rust is a systems programming language...",
  "tags": ["text", "programming", "rust"],
  "author": "02a1b2c3d4e5f6...", // Public key hex
  "timestamp": 1736521200000,
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Signature Authentication
- **Message**: `timestamp + userUUID`
- **Signed by**: User's sessionless private key
- **Verified by**: Dolores backend using stored public key
- **Used for**: All post creation requests

## Critical Fixes (January 10, 2026)

### Fixed API Mismatch Issues

**1. Feed API Call Fix**:
- **Problem**: dolores-rs `get_feed` expects `&str` for tags, but lexary was passing `Vec<String>`
- **Fix**: Join tags with "+" separator: `tags.join("+")`
- **Location**: `/the-nullary/lexary/lexary/src-tauri/src/lib.rs:205`

**2. Feed Struct Handling Fix**:
- **Problem**: Code treated `Feed` struct as `Vec`, but it has `allPosts` field
- **Fix**: Access `feed.allPosts` instead of iterating over `feed` directly
- **Location**: `/the-nullary/lexary/lexary/src-tauri/src/lib.rs:210`

**3. Feed Integration Fix**:
- **Problem**: Local posts saved via `db.savePost()` were never returned in feed
- **Fix**: Updated Dolores `/user/:uuid/feed` endpoint to include `db.getPosts()` in combined feed
- **Location**: `/dolores/src/server/node/dolores.js:298-299`

**4. User Key Management Fix**:
- **Problem**: All users shared same hardcoded development private key
- **Fix**: Generate unique key per session, support `LEXARY_PRIVATE_KEY` env var for persistence
- **Location**: `/the-nullary/lexary/lexary/src-tauri/src/lib.rs:54-79`

### User Identity Management

Users now get unique identities:
```bash
# First run generates new key
Generating new Lexary user key...
New key generated. Set LEXARY_PRIVATE_KEY=abc123... to persist this identity
Public Key: 02def456...
UUID: uuid-789...

# Persist identity across sessions
export LEXARY_PRIVATE_KEY=abc123...
npm run dev
```

## Last Updated
January 10, 2026 - **BREAKING FIXES**: Fixed critical API mismatches, feed integration, and user identity management. Local posts now appear in feed. Each user gets unique posting identity (persisted via LEXARY_PRIVATE_KEY env var).

Lexary demonstrates the power of focusing on a single content type while maintaining the full richness of The Nullary's shared component architecture. It provides a premium reading AND writing experience for text content within the Planet Nine ecosystem, emphasizing quality writing and distraction-free consumption.