# IDothis - Professional Discovery Platform

## Overview

IDothis is a professional discovery platform built on The Nullary ecosystem, designed to help users create professional profiles with their "I do this" specializations and discover other professionals through an intuitive Tinder-style swipeable interface. It focuses on profile-based professional networking with seamless form integration via Sanora's form-widget system.

## Architecture

### Core Philosophy
- **Professional Discovery**: Focus on "I do this" specializations for clear professional positioning
- **Swipeable Interface**: Tinder-style discovery to make professional networking engaging and intuitive
- **Form Widget Consistency**: Uses Sanora's form-widget system for consistent UX across Planet Nine
- **Profile-Centric**: Built around rich professional profiles with Prof service integration
- **Privacy-First**: Uses sessionless authentication and keeps PII separate via prof service

### Technology Stack
- **Frontend**: Vanilla JavaScript with modern CSS, no frameworks
- **Backend**: Complete Rust integration with Planet Nine services
- **Desktop**: Tauri v2.x framework for cross-platform deployment
- **Authentication**: sessionless protocol with secp256k1 cryptographic keys
- **Services**: prof (profiles), sanora (form-widgets), bdo (discovery), sessionless (authentication)

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
**Purpose**: Create and manage professional profiles using prof service and Sanora form-widget

**Features**:
- **Sanora Form-Widget Integration**: Uses `window.getForm()` for consistent form experience across Planet Nine
- **"I do this" Field**: Prominent professional specialization field for clear positioning
- **Profile Creation**: Full profile creation with name, email, bio, website, location, and image
- **Image Upload**: Profile image upload via form-widget's image field type with drag-and-drop support
- **Profile Editing**: Update any profile information with pre-populated form-widget
- **Profile Deletion**: Complete profile removal with confirmation
- **Real-time Display**: Live profile preview with formatted information

**Form-Widget Integration**:
```javascript
// Create form configuration for consistent Planet Nine UX
const formConfig = {
    "Name": { type: "text", required: true },
    "Email": { type: "text", required: true },
    "I do this": { type: "text", required: true },
    "Bio": { type: "textarea", charLimit: 500, required: false },
    "Website": { type: "text", required: false },
    "Location": { type: "text", required: false },
    "Profile Image": { type: "image", required: false }
};

// Handle form submission with widget data conversion
function handleProfileCreation(formData) {
    const profileData = {
        name: formData["Name"] || '',
        email: formData["Email"] || '',
        idothis: formData["I do this"] || '',
        bio: formData["Bio"] || '',
        website: formData["Website"] || '',
        location: formData["Location"] || ''
    };
    
    let imageData = null;
    if (formData["Profile Image"] && formData["Profile Image"].dataUrl) {
        imageData = formData["Profile Image"].dataUrl.split(',')[1];
    }
    
    createProfileFromData(profileData, imageData);
}

// Create and append the form widget
const formWidget = window.getForm(formConfig, handleProfileCreation);
container.appendChild(formWidget);
```

**Key Features**:
- Beautiful SVG-based forms with purple-to-green gradients
- Real-time validation with visual feedback
- Image upload with preview and drag-and-drop
- Character counting for bio field
- Consistent form experience with MyBase, Sanora, and other Planet Nine apps

### 2. Discover Screen (Swipeable Profile Feed)
**Purpose**: Discover other professionals through an intuitive Tinder-style swipeable interface

**Features**:
- **Professional Profile Cards**: Full-view cards showing complete professional information
- **Swipeable Interface**: Tinder-style swipe right (like/save) / left (pass/skip) interaction
- **Rich Profile Display**: Shows name, "I do this", location, bio, website, and profile image
- **Visual Feedback**: Real-time swipe indicators with color-coded feedback
- **Statistics Tracking**: Shows remaining, liked, and passed profile counts
- **Smooth Animations**: 300ms transitions with rotation and opacity effects
- **Stack Management**: 3-card visible stack with scaling and positioning effects

**Swipe Interactions**:
- **Swipe Right / Like**: Save profile for later (adds to liked profiles collection)
- **Swipe Left / Pass**: Skip profile (adds to passed profiles collection)
- **Mouse & Touch Support**: Works seamlessly on desktop and mobile devices
- **Visual Indicators**: Green "LIKE" and red "PASS" indicators during swipe gestures
- **Manual Controls**: Backup thumb up/down buttons for precise control

**Profile Card Layout**:
```javascript
// Complete profile information displayed in swipe cards
<div class="swipe-card">
    <div class="card-content">
        <div class="profile-header">
            <div class="profile-avatar">
                // Profile image or initials fallback
            </div>
            <div class="profile-info">
                <h3 class="profile-name">${profile.name}</h3>
                <p class="profile-idothis">${profile.idothis}</p>
                <p class="profile-location">📍 ${profile.location}</p>
            </div>
        </div>
        <div class="profile-bio">${profile.bio}</div>
        <div class="profile-website">
            <a href="${profile.website}">🌐 Website</a>
        </div>
        <div class="swipe-indicator left">PASS</div>
        <div class="swipe-indicator right">LIKE</div>
    </div>
</div>
```

**Swipe Logic Implementation**:
```javascript
// Swipe threshold detection and card animation
function swipeCard(card, direction) {
    const profileUuid = card.dataset.profileUuid;
    const profile = appState.profiles.find(p => p.uuid === profileUuid);
    
    if (profile) {
        if (direction === 'like') {
            appState.likedProfiles.push(profile); // Save for later
        } else {
            appState.passedProfiles.push(profile); // Skip
        }
    }
    
    // Animate card out with rotation
    const translateX = direction === 'like' ? '100vw' : '-100vw';
    const rotation = direction === 'like' ? '30' : '-30';
    card.style.transform = `translateX(${translateX}) rotate(${rotation}deg)`;
    card.style.opacity = '0';
    
    // Auto-advance to next profile
    appState.currentProfileIndex++;
    setTimeout(() => displaySwipeableProfiles(), 300);
}
```

### 3. Likes Screen
**Purpose**: View and manage all liked/saved profiles in a grid layout

**Features**:
- **Liked Profiles Grid**: Clean grid layout of all saved professional profiles
- **Quick Profile Access**: Direct links to websites and contact information
- **Profile Summary**: Name, specialization, location, and website for each liked profile
- **Visual Consistency**: Same avatar and styling as discovery cards
- **Empty State Handling**: Helpful messaging when no profiles have been liked yet

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

### Professional Profile Management ✅
- ✅ **Sanora Form-Widget Integration**: Uses `window.getForm()` for consistent UX across Planet Nine ecosystem
- ✅ **"I do this" Professional Field**: Prominent specialization field for clear professional positioning
- ✅ **Complete Profile CRUD**: Create, read, update, delete operations via Prof service
- ✅ **Image Upload**: Drag-and-drop image upload with base64 conversion through form-widget
- ✅ **PII Isolation**: Prof service integration with secure personal information handling
- ✅ **Form Validation**: Real-time validation with visual feedback via SVG form components
- ✅ **Pre-populated Editing**: Profile edit forms auto-fill with current profile data

### Swipeable Professional Discovery ✅
- ✅ **Tinder-Style Interface**: Intuitive swipe right (save) / left (skip) professional discovery
- ✅ **Full-View Profile Cards**: Complete professional information in beautiful card layout
- ✅ **Touch & Mouse Support**: Seamless interaction on desktop and mobile devices
- ✅ **Visual Swipe Indicators**: Real-time green "LIKE" and red "PASS" feedback
- ✅ **Smooth Animations**: 300ms transitions with rotation and opacity effects
- ✅ **Statistics Tracking**: Live counts of remaining, liked, and passed profiles
- ✅ **3-Card Stack Management**: Visible card stack with scaling and positioning effects
- ✅ **Auto-Advance**: Automatic progression to next profile after swipe decision

### Liked Profiles Management ✅
- ✅ **Saved Profiles Grid**: Clean grid layout of all liked professional profiles
- ✅ **Profile Persistence**: Profiles saved for later review and contact
- ✅ **Quick Access**: Direct links to websites and professional contact information
- ✅ **Visual Consistency**: Same avatar and styling system as discovery interface
- ✅ **Empty State Handling**: Helpful messaging and guidance for new users

### Form-Widget Ecosystem Integration ✅
- ✅ **Cross-Service Consistency**: Same form experience as MyBase, Sanora, and all Planet Nine apps
- ✅ **SVG-Based Forms**: Beautiful vector-based forms with purple-to-green gradients
- ✅ **Widget Component Loading**: Proper script loading and initialization in Tauri environment
- ✅ **Data Format Conversion**: Seamless conversion between widget data and profile data formats
- ✅ **Image Field Integration**: Full image upload support through form-widget's image field type

### Technical Features ✅
- ✅ **Complete Rust Backend**: Prof service integration with sessionless authentication
- ✅ **Environment Configuration**: Support for dev/test/local environments with instant switching
- ✅ **No-Module JavaScript**: Tauri-compatible vanilla JavaScript architecture
- ✅ **Responsive Design**: Modern CSS with mobile-first responsive design principles
- ✅ **Error Handling**: Comprehensive error handling and user feedback systems
- ✅ **Mock Profile System**: Built-in mock profiles for testing and demonstration

## Use Cases

### For Professionals
1. **Create Professional Profile**: Set up profile with "I do this" specialization, bio, and contact information
2. **Professional Positioning**: Use the "I do this" field to clearly communicate your core professional offering
3. **Visual Branding**: Upload professional profile image through intuitive drag-and-drop interface
4. **Contact Information**: Include website and location for professional networking and opportunities
5. **Profile Management**: Update and refine professional information as your career evolves

### For Networking & Discovery
1. **Discover Professionals**: Use intuitive swipe interface to browse through professional profiles
2. **Quick Decisions**: Swipe right to save interesting professionals, left to pass
3. **Build Professional Network**: Create curated collection of liked professionals for follow-up
4. **Contact Management**: Access saved profiles with direct links to websites and contact information
5. **Professional Exploration**: Discover new specializations and professional approaches through browsing

### Professional Specializations
- **"I do Web Development"**: Front-end, back-end, full-stack development
- **"I do UI/UX Design"**: User interface design, user experience consulting, prototyping
- **"I do Business Consulting"**: Strategy consulting, operations optimization, market analysis
- **"I do Content Creation"**: Writing, photography, video production, social media
- **"I do Data Analysis"**: Business intelligence, data science, analytics consulting
- **"I do Project Management"**: Agile coaching, team leadership, process optimization

## Integration Points

### Sanora Form-Widget Integration
- **Consistent UX**: Uses `window.getForm()` to provide the same form experience as MyBase, Sanora, and all Planet Nine applications
- **SVG-Based Forms**: Beautiful vector-based forms with purple-to-green gradients and real-time validation
- **Image Upload**: Full drag-and-drop image upload support through form-widget's image field type
- **Data Conversion**: Seamless conversion between widget data format and IDothis profile data structure
- **Script Loading**: Proper widget script loading in Tauri environment via index.html

### Prof Service Integration
- **"I do this" Field**: Custom professional specialization field stored as additional_fields in Prof service
- **Profile CRUD**: Complete profile management lifecycle with sessionless authentication
- **Image Handling**: Profile image upload with base64 conversion and authenticated URL generation
- **PII Isolation**: Secure handling of personal information with Prof service's privacy-first architecture
- **Environment Support**: Works across dev/test/local environments with automatic service URL switching

### Cross-Service Data Flow
```
Professional Profile Creation (prof + form-widget) → Profile Discovery (swipeable interface) → Professional Networking (liked profiles)
```

## Future Enhancements

### Immediate Roadmap
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

### Environment Configuration

idothis supports three environments for connecting to different allyabase infrastructures:

- **`dev`** - Production dev server (https://dev.*.allyabase.com)
- **`test`** - Local 3-base test ecosystem (localhost:5111-5122)  
- **`local`** - Standard local development (localhost:3000-3007)

#### Environment Switching

**Via Browser Console** (while app is running):
```javascript
// Switch to test ecosystem
idothisEnv.switch('test')
location.reload()

// Check current environment
idothisEnv.current()

// List all environments
idothisEnv.list()
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