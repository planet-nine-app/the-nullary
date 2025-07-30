# IDothis - Professional Showcase Platform

## Overview

IDothis is a professional showcase platform built on The Nullary ecosystem, designed to help users create profiles and showcase their products and services. It combines profile management via the Prof service with product listings via Sanora, featuring a unique swipable discovery feed for finding relevant services and products by tags.

## Architecture

### Core Philosophy
- **Profile + Product Integration**: Seamlessly connects personal profiles with professional offerings
- **Tag-Based Discovery**: Uses swipable feeds to help people discover relevant services and products
- **Cross-Service Integration**: Leverages both prof (PII-safe profiles) and sanora (product hosting)
- **Modern UX**: Tinder-style swipable interface for product discovery
- **Privacy-First**: Uses sessionless authentication and keeps PII separate via prof service

### Technology Stack
- **Frontend**: Vanilla JavaScript with modern CSS, no frameworks
- **Backend**: Complete Rust integration with Planet Nine services
- **Desktop**: Tauri v2.x framework for cross-platform deployment
- **Authentication**: sessionless protocol with secp256k1 cryptographic keys
- **Services**: prof (profiles), sanora (products), fount (payments), bdo (storage)

## Project Structure

```
idothis/
├── idothis/                    # Main Tauri application
│   ├── src/
│   │   ├── index.html         # Main HTML entry point
│   │   └── main.js            # Application JavaScript (no modules)
│   ├── src-tauri/             # Rust backend
│   │   ├── Cargo.toml         # Dependencies including all Planet Nine services
│   │   ├── tauri.conf.json    # Tauri v2 configuration
│   │   └── src/
│   │       ├── main.rs        # Tauri application entry point
│   │       └── lib.rs         # Backend service integrations
│   └── package.json           # Frontend dependencies
└── CLAUDE.md                  # This documentation
```

## Screen Architecture (Three Main Screens)

### 1. Profile Screen
**Purpose**: Create and manage user profiles using the prof service

**Features**:
- **Profile Creation**: Full profile creation with name, email, bio, skills, website, location
- **Image Upload**: Profile image upload with automatic processing via prof service
- **Profile Editing**: Update any profile information including image replacement
- **Profile Deletion**: Complete profile removal with confirmation
- **Real-time Display**: Live profile preview with formatted information

**Key Components**:
- Profile display card with formatted information
- Profile creation/editing form with validation
- Image upload with base64 conversion
- Profile image display with generated URLs

**Prof Service Integration**:
```javascript
// Create profile with image
const result = await invoke('create_profile', {
  profileData: {
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer...',
    skills: ['JavaScript', 'Rust'],
    website: 'https://johndoe.dev',
    location: 'San Francisco, CA'
  },
  imageData: base64ImageString
});
```

### 2. Products Screen
**Purpose**: Create and manage products/services using the sanora service

**Features**:
- **Product Creation**: Add products with title, description, pricing, categories, and tags
- **Product Management**: Edit and delete existing products
- **Tag System**: Comprehensive tagging for product discovery
- **Category Support**: Service, digital product, consultation, course, physical product
- **Pricing**: USD pricing with cent-based storage
- **Preview URLs**: Optional preview/demo links

**Product Categories**:
- 🛠️ **Service**: Professional services (consulting, development, design)
- 💻 **Digital Product**: Software, templates, digital downloads
- 💬 **Consultation**: One-on-one consulting sessions
- 🎓 **Course**: Educational content and training
- 📦 **Physical Product**: Tangible goods and merchandise

**Sanora Service Integration**:
```javascript
// Create product
const result = await invoke('create_product', {
  productData: {
    title: 'Web Development Service',
    description: 'Custom web development...',
    price: 5000, // $50.00 in cents
    category: 'service',
    tags: ['web', 'development', 'javascript'],
    content_type: 'service',
    preview_url: 'https://example.com/preview'
  }
});
```

### 3. Discover Screen (Swipable Feed)
**Purpose**: Discover products and services through tag-based swipable interface

**Features**:
- **Tag-Based Search**: Enter tags to find relevant products and services
- **Swipable Interface**: Tinder-style swipe right (like) / left (pass) interaction
- **Visual Feedback**: Real-time swipe indicators and animations
- **Statistics Tracking**: Shows remaining, liked, and passed counts
- **Product Details**: Full product information including pricing, tags, and author
- **Infinite Discovery**: Load more products with different tag combinations

**Swipe Interactions**:
- **Swipe Right / Like**: Add to liked products collection
- **Swipe Left / Pass**: Add to passed products collection
- **Mouse & Touch Support**: Works on desktop and mobile
- **Visual Indicators**: Color-coded feedback during swipe gestures
- **Smooth Animations**: Card transitions and stack management

**Tag-Based Discovery**:
```javascript
// Search by tags
const tags = ['web', 'design', 'development'];
const result = await invoke('get_products_by_tags', { tags });
```

## Backend Architecture

### Rust Service Integration

IDothis includes complete integration with the Planet Nine ecosystem:

#### Service Clients
- **prof-rs**: Profile management with PII isolation
- **sanora-rs**: Product hosting and management
- **addie-rs**: Payment processing (future)
- **fount-rs**: MAGIC transactions (future)
- **bdo-rs**: File storage (future)
- **dolores-rs**: Media storage (future)
- **sessionless**: Cryptographic authentication

#### Backend Functions (`src-tauri/src/lib.rs`)

**Profile Management**:
- `create_profile(profile_data, image_data)` - Create new profile with optional image
- `get_profile(uuid)` - Retrieve profile data
- `update_profile(profile_data, image_data)` - Update profile with optional new image
- `delete_profile()` - Delete profile and associated data
- `get_profile_image_url(uuid)` - Get authenticated image URL

**Product Management**:
- `create_product(product_data)` - Create new product/service
- `get_user_products()` - Get all user's products
- `get_products_by_tags(tags)` - Find products by tags for discovery feed
- `update_product(product_id, product_data)` - Update existing product
- `delete_product(product_id)` - Delete product

**Utilities**:
- `get_sessionless_info()` - Get authentication information
- `health_check()` - Service health status
- `dbg(message)` - Debug logging

### Data Structures

#### ProfileData
```rust
pub struct ProfileData {
    pub name: String,
    pub email: String,
    pub bio: Option<String>,
    pub skills: Option<Vec<String>>,
    pub website: Option<String>,
    pub location: Option<String>,
    pub additional_fields: HashMap<String, serde_json::Value>,
}
```

#### ProductData
```rust
pub struct ProductData {
    pub title: String,
    pub description: String,
    pub price: u64, // in cents
    pub tags: Vec<String>,
    pub category: String,
    pub preview_url: Option<String>,
    pub content_type: String,
}
```

### Authentication

IDothis uses sessionless authentication with a development private key:
```rust
// Development key (user-specific in production)
let private_key = env::var("PRIVATE_KEY").unwrap_or_else(|_| {
    String::from("b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496")
});
```

## Frontend Architecture

### No-Module JavaScript Design

IDothis uses vanilla JavaScript without ES6 modules for maximum Tauri compatibility:

```javascript
// Global app state
const appState = {
    currentScreen: 'profile',
    profile: null,
    products: [],
    sessionless: null,
    loading: false
};

// Screen management
function showScreen(screenName) {
    // Hide all screens, show requested screen
    // Update navigation state
    // Load screen-specific data
}
```

### Screen Management

Each screen is managed through a simple state system:
- **Profile Screen**: `profile-screen` with profile display and form
- **Products Screen**: `products-screen` with product list and form
- **Feed Screen**: `feed-screen` with swipable product discovery

### Swipable Feed Implementation

The discovery feed implements a custom swipable interface:

```javascript
function addSwipeListeners(card, product) {
    // Mouse and touch event handling
    // Drag gesture detection
    // Visual feedback during drag
    // Threshold-based swipe detection
    // Card animation and removal
}

function swipeCard(card, product, direction) {
    // Animate card out of view
    // Add to liked/passed collections
    // Show next card
    // Update statistics
}
```

**Key Features**:
- **Multi-input Support**: Mouse and touch events
- **Visual Feedback**: Real-time swipe indicators
- **Smooth Animations**: CSS transitions and transforms
- **Stack Management**: 3-card visible stack with auto-advance
- **Statistics**: Real-time tracking of swipe actions

## Configuration & Setup

### Prerequisites
- **Rust toolchain** for backend compilation
- **Node.js 16+** for frontend dependencies
- **Planet Nine services running**:
  - prof service on `localhost:3007`
  - sanora service on `localhost:7243`

### Installation

1. **Install dependencies**:
   ```bash
   cd idothis/idothis
   npm install
   ```

2. **Run in development**:
   ```bash
   npm run tauri:dev
   ```

3. **Build for production**:
   ```bash
   npm run tauri:build
   ```

### Service Configuration

Edit `src-tauri/src/lib.rs` to configure service URLs:

```rust
// Prof service URL
let prof_client = ProfClient::new("http://localhost:3007".to_string())

// Sanora service URL  
let sanora_client = SanoraClient::new("http://localhost:7243".to_string(), sessionless)
```

### Environment Variables

```bash
# Optional: Custom private key (defaults to development key)
export PRIVATE_KEY="your_private_key_hex"
```

## Key Features Implemented

### Profile Management ✅
- ✅ Complete profile CRUD operations
- ✅ Image upload with base64 conversion
- ✅ Prof service integration with PII isolation
- ✅ Form validation and error handling
- ✅ Real-time profile display updates

### Product Management ✅
- ✅ Product creation with comprehensive metadata
- ✅ Tag system for categorization and discovery
- ✅ Category-based organization
- ✅ Pricing in USD with cent precision
- ✅ Sanora service integration
- ✅ Product editing and deletion

### Swipable Discovery Feed ✅
- ✅ Tag-based product search
- ✅ Tinder-style swipe interface
- ✅ Mouse and touch support
- ✅ Visual swipe indicators
- ✅ Statistics tracking (liked/passed)
- ✅ Smooth animations and transitions
- ✅ Card stack management

### Technical Features ✅
- ✅ Complete Rust backend with Planet Nine integration
- ✅ Sessionless authentication
- ✅ No-module JavaScript for Tauri compatibility
- ✅ Responsive design with modern CSS
- ✅ Error handling and user feedback
- ✅ Real-time UI updates

## Use Cases

### For Service Providers
1. **Create Profile**: Set up professional profile with skills and experience
2. **Add Services**: List consulting, development, design, or other services
3. **Tag Products**: Use relevant tags for better discoverability
4. **Manage Offerings**: Edit pricing, descriptions, and availability

### For Service Seekers
1. **Discover Services**: Use tag-based search to find relevant providers
2. **Swipe Interface**: Quickly browse through available services
3. **Like/Pass System**: Build curated lists of interesting services
4. **View Profiles**: See provider information and expertise

### Professional Categories
- **Developers**: Web development, mobile apps, software consulting
- **Designers**: UI/UX design, graphic design, branding services
- **Consultants**: Business consulting, technical advisory, coaching
- **Creators**: Content creation, photography, video production
- **Educators**: Course creation, tutoring, workshop facilitation

## Integration Points

### Prof Service Integration
- **Profile Storage**: All personal information stored in prof service
- **Image Handling**: Profile images processed and optimized by prof
- **PII Isolation**: Personal data kept separate from product information
- **Privacy Protection**: Email and contact info not shared across services

### Sanora Service Integration
- **Product Hosting**: All products stored as Sanora products
- **Pricing System**: Uses Sanora's cent-based pricing
- **Product Management**: Full CRUD operations via Sanora API
- **Future Payments**: Ready for MAGIC/Addie payment integration

### Cross-Service Data Flow
```
User Profile (prof) → Product Creation (sanora) → Discovery Feed (tags) → Purchase (future: addie)
```

## Future Enhancements

### Immediate Roadmap
- **Real Sanora Integration**: Replace mock data with actual Sanora queries
- **Enhanced Search**: Advanced filtering by price, category, location
- **User Interactions**: Follow users, save favorites, direct messaging
- **Payment Integration**: Complete purchase flow with MAGIC/Addie
- **Rich Media**: Support for product images and videos

### Advanced Features
- **Social Features**: User connections, recommendations, reviews
- **Analytics**: View counts, interaction metrics, performance insights
- **Mobile App**: React Native or Flutter mobile version
- **Notifications**: Real-time updates for likes, purchases, messages
- **Collaboration**: Team profiles, shared services, partnerships

### Business Features
- **Subscription Services**: Recurring payments for ongoing services
- **Marketplace Tools**: Advanced seller dashboard, inventory management
- **Communication**: Built-in chat, video calls, project management
- **Verification**: Profile verification, skill assessments, badges
- **Internationalization**: Multi-language support, currency conversion

## Development Workflow

### Adding New Screens
1. Add screen div to `createAppStructure()`
2. Add navigation button with `data-screen` attribute
3. Implement `loadScreenData()` case for new screen
4. Add backend functions if needed

### Adding New Product Categories
1. Update `ProductData` struct in `lib.rs`
2. Add category option to product form in `main.js`
3. Update validation and display logic
4. Add category-specific icons or styling

### Extending Profile Fields
1. Update `ProfileData` struct for new required fields
2. Add form fields to profile creation/editing
3. Update display logic in `displayProfile()`
4. Maintain prof service compatibility

## Security Considerations

### Profile Data Protection
- Personal information (email, location) stored only in prof service
- Images processed server-side to remove metadata
- Profile access requires authenticated requests
- No cross-service sharing of PII data

### Product Data Security
- Product information stored in sanora service
- Tag-based queries prevent data leakage
- Authentication required for product management
- Pricing stored in secure cent format

### Authentication Security
- Uses sessionless cryptographic signatures
- No passwords or shared secrets
- Time-stamped requests prevent replay attacks
- Private keys stored securely (configurable)

### Input Validation
- All form inputs validated client and server-side
- File uploads restricted by type and size
- SQL injection prevention through parameterized queries
- XSS prevention through proper input sanitization

## Performance Considerations

### Frontend Optimization
- No large JavaScript frameworks
- Efficient DOM manipulation
- Smooth CSS animations with hardware acceleration
- Lazy loading of images and content

### Backend Optimization
- Efficient Rust implementations
- Minimal service calls
- Caching strategies for frequently accessed data
- Optimized database queries

### Mobile Performance
- Touch-optimized swipe gestures
- Responsive design for various screen sizes
- Efficient image loading and caching
- Battery-conscious animation strategies

IDothis demonstrates how to build a modern, professional platform using the Planet Nine ecosystem while maintaining privacy, security, and excellent user experience through innovative interface design.