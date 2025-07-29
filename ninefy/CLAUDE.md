# Ninefy - Digital Goods Marketplace

## Overview

Ninefy is a minimalist digital goods marketplace built on The Nullary ecosystem, designed to facilitate the buying and selling of digital products like ebooks, music, software, courses, templates, and event tickets. It serves as a decentralized alternative to platforms like Gumroad, utilizing Planet Nine's infrastructure for true digital ownership and privacy-focused commerce.

## Architecture

### Core Philosophy
- **Digital Commerce First**: Focused on selling and distributing digital goods
- **Decentralized Marketplace**: Built on allyabase infrastructure for true digital ownership
- **SVG-First UI**: All interface elements use SVG components instead of HTML/CSS
- **Sanora Integration**: Uses Sanora service for product hosting and transactions
- **Cross-Platform**: Built with Tauri for desktop deployment across all platforms

### Technology Stack
- **Frontend**: SVG components with embedded CSS, vanilla JavaScript (no ES6 modules)
- **Backend**: Complete allyabase ecosystem integration (Rust + Tauri)
- **Authentication**: sessionless protocol with secp256k1 cryptographic keys
- **Desktop**: Tauri v2.6.2 framework (Rust + Web) for cross-platform apps
- **Storage**: Full allyabase integration (Sanora for products, Addie for payments) + local storage for caching

## Project Structure

```
ninefy/
├── src/
│   ├── index.html             # Main HTML entry point
│   ├── main-no-modules.js     # Application entry point (no ES6 modules)
│   ├── styles.css             # Global styles and theming
├── src-tauri/                 # Tauri configuration and Rust backend
│   ├── Cargo.toml             # Rust dependencies and allyabase crates
│   ├── tauri.conf.json        # Tauri v2 configuration
│   ├── src/
│   │   ├── main.rs            # Main Rust entry point
│   │   └── lib.rs             # Allyabase backend integration
│   └── target/                # Rust build artifacts
└── CLAUDE.md                  # This documentation
```

## Screen Architecture (Four Complete Screens)

### 1. Main Screen (Shop)
**Purpose**: Product marketplace with browsing and discovery

**Features**:
- Grid layout with product cards displaying category, price, ratings, and stats
- Real-time product browsing with custom SVG category icons
- Teleported content feed (1/3 right column) for marketplace network updates
- Click-to-view product details
- Support for 6 product categories: ebooks, music, software, courses, templates, tickets

**Product Categories**:
- 📚 **E-Books**: Digital books and guides
- 🎵 **Music**: Audio files and soundtracks  
- 💻 **Software**: Applications and tools
- 🎓 **Courses**: Educational content and tutorials
- 🎨 **Templates**: Design templates and starter kits
- 🎫 **Tickets**: Event tickets and conference access

### 2. Product Details Screen
**Purpose**: Detailed product information and purchase interface

**Features**:
- Full product information display with pricing, description, and metadata
- Markdown parsing for rich product descriptions
- Author information, download counts, ratings, and file information
- Purchase button with payment integration placeholder
- Tag system for product categorization
- Back navigation to main shop

### 3. Upload Screen (Product Creation)
**Purpose**: Form for sellers to upload and list their digital products

**Features**:
- Comprehensive product upload form with validation
- Category selection with visual icons
- Price input with dollar formatting
- Rich text description with Markdown support
- File upload section (placeholder for actual file handling)
- Tag input for product categorization
- Form persistence and validation
- Integration with localStorage (placeholder for Sanora backend)

### 4. Base Screen (Server Management)
**Purpose**: Universal base server management (shared with rhapsold)

**Features**:
- Interactive server connection management
- Server status indicators and information
- Service availability display (sanora, bdo, dolores, addie, fount)
- Connection/disconnection functionality
- Reused across all Nullary applications

## Key Components

### Product Management
- **`createProductCard()`** - SVG-based product cards with hover effects and metadata
- **`formatPrice()`** - Price formatting from cents to dollars
- **`getCategoryIcon()`** - Category-specific emoji icons
- **Product Categories**: Support for 6 distinct product types with custom SVG graphics

### Content Creation
- **`createProductUploadForm()`** - Comprehensive product upload interface
- **Form Validation**: Real-time validation with error handling
- **Markdown Support**: Rich text descriptions with markdown parsing
- **File Upload**: Placeholder system for digital product files

### Commerce Features
- **Pricing System**: Cent-based pricing with dollar display formatting
- **Product Metadata**: Download counts, ratings, file sizes, and author information
- **Purchase Flow**: Buy button integration (placeholder for payment processing)

### Shared Components (Reused from Rhapsold)
- **`createTeleportedItem()`** - Teleported content display
- **`parseMarkdown()`** - Markdown to HTML conversion
- **`createBaseCard()`** - Base server management cards
- **`createHUD()`** - Navigation system with screen switching

## Sample Data

### Product Examples
The app includes 6 sample products showcasing different categories:

1. **"The Complete JavaScript Handbook"** ($49.99) - E-book with code examples
2. **"Ambient Focus - Productivity Soundtrack"** ($19.99) - Music collection
3. **"React Component Library Starter"** ($79.99) - Software development tool
4. **"Mastering SVG Animations"** ($89.99) - Video course with exercises
5. **"Minimalist Landing Page Templates"** ($29.99) - Design templates
6. **"Planet Nine Developer Conference 2025"** ($129.99) - Event ticket

### Teleported Content
Marketplace-focused content includes:
- Digital commerce trends and insights
- Sanora architecture documentation
- Ninefy tutorial videos
- MAGIC payment integration guides
- Product upload API examples

## Backend Integration

### Allyabase Services
- **Sanora**: Primary service for product hosting, metadata, and transactions
- **Addie**: Payment processing with MAGIC protocol integration
- **BDO**: File storage for digital product assets
- **Dolores**: Media storage for images and promotional content
- **Fount**: MAGIC transaction processing for payments

### Rust Backend Functions
All the same backend functions from rhapsold are available:
- `add_product()` - Create new products in Sanora
- `get_sanora_user()` - Retrieve seller account and product listings
- `get_payment_intent_with_splits()` - Multi-party payment processing
- `create_sanora_user()` - New seller account creation
- File upload and management functions

## Development

### Running the Application

```bash
cd ninefy/ninefy
npm install
npm run tauri dev  # Start development
npm run tauri build  # Production build
```

### Key Features Implemented

✅ **Complete Four-Screen Architecture** (Shop, Details, Upload, Base)
✅ **Product Categories** with custom SVG graphics for each type
✅ **Comprehensive Upload Form** with validation and markdown support
✅ **Product Details View** with purchase interface and rich content
✅ **Teleported Content Feed** for marketplace network updates
✅ **Base Server Management** (shared with rhapsold)
✅ **Price Formatting** and commerce-focused UI elements
✅ **localStorage Integration** for product persistence
✅ **Responsive Design** with hover effects and smooth animations

### Shared Code with Rhapsold

Ninefy maximizes code reuse with rhapsold:
- **Base Screen**: Identical server management interface
- **Teleported Content**: Shared teleportation feed system
- **Markdown Parser**: Same rich text processing
- **HUD Navigation**: Similar navigation pattern with different screens
- **Theme System**: Consistent styling and color schemes
- **Backend Integration**: Same Rust allyabase functions

### Commerce-Specific Features

- **Product Categories**: 6 distinct types with appropriate SVG graphics
- **Pricing System**: Cent-based storage with dollar display
- **Purchase Flow**: Buy buttons with payment integration placeholders
- **Seller Tools**: Complete product upload and management interface
- **Marketplace Feed**: Commerce-focused teleported content

## Current Status

### Completed Features ✅

**Frontend**:
- ✅ Complete four-screen marketplace architecture
- ✅ Product browsing with grid layout and category filtering
- ✅ Detailed product view with purchase interface
- ✅ Comprehensive product upload form for sellers
- ✅ Teleported content feed for marketplace updates
- ✅ Base server management (shared with rhapsold)

**Backend Preparation**:
- ✅ Full Rust backend with allyabase integration ready
- ✅ Sanora product management functions
- ✅ Payment processing with Addie
- ✅ File upload preparation for digital goods
- ✅ sessionless authentication system

### Integration Opportunities

**Immediate Next Steps**:
- Connect upload form to `add_product()` backend function
- Integrate `get_sanora_user()` for seller dashboards
- Connect purchase buttons to `get_payment_intent_with_splits()`
- Implement file upload to BDO/Dolores services
- Add user account management and seller profiles

**Advanced Features**:
- Shopping cart functionality
- Order history and download management
- Seller analytics and revenue tracking
- Product reviews and rating system
- Search and filtering capabilities
- Categories and tag-based discovery

## Comparison with Rhapsold

| Feature | Rhapsold (Blogging) | Ninefy (Marketplace) |
|---------|-------------------|---------------------|
| **Primary Use** | Writing and reading blog posts | Buying and selling digital goods |
| **Main Screen** | Blog post feed | Product marketplace |
| **Content Type** | Blog posts with markdown | Digital products with pricing |
| **Creation Screen** | Blog post editor | Product upload form |
| **Details Screen** | Reading mode | Product details + purchase |
| **Monetization** | Free/paid blog posts | Product sales with pricing |
| **File Types** | Text, images, external URLs | All digital goods (ZIP, PDF, MP3, etc.) |

## Architecture Benefits

1. **Code Reuse**: Maximizes shared components between apps
2. **Consistent UX**: Similar navigation and interaction patterns
3. **Scalable Backend**: Same allyabase integration works for both use cases
4. **Decentralized Commerce**: True digital ownership via Planet Nine
5. **Privacy-First**: No personal data collection, cryptographic authentication
6. **Cross-Platform**: Desktop app deployment via Tauri

Ninefy demonstrates how The Nullary's SVG-first architecture can be adapted for different use cases while maintaining code reuse and consistency. It provides a complete digital marketplace solution built on decentralized infrastructure.