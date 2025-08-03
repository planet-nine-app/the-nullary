# Ninefy - Digital Goods Marketplace

Ninefy is a minimalist digital goods marketplace built on The Nullary ecosystem, designed to facilitate the buying and selling of digital products like ebooks, music, software, courses, templates, and event tickets.

## Overview

Ninefy serves as a decentralized alternative to platforms like Gumroad, utilizing Planet Nine's infrastructure for true digital ownership and privacy-focused commerce. It focuses on:
- **Digital Commerce**: Streamlined buying and selling of digital goods
- **SVG Components**: Custom SVG-based UI elements for unique, scalable interface  
- **JSON Configuration**: Simple config objects for customizing marketplace appearance
- **allyabase Integration**: Decentralized backend using Sanora for products and Addie for payments
- **Tauri Framework**: Cross-platform desktop and mobile app

## Features

### Core Marketplace Functionality
- 🛍️ **Product Browsing**: Grid-based marketplace with category filtering
- 💰 **Commerce**: Complete buy/sell workflow with payment processing
- 🎨 **Product Categories**: Support for 6 digital product types
- 📱 **Cross-Platform**: Desktop and mobile via Tauri
- 🌐 **Decentralized**: Built on Planet Nine's distributed infrastructure

### Product Categories
- 📚 **E-Books**: Digital books and guides
- 🎵 **Music**: Audio files and soundtracks  
- 💻 **Software**: Applications and tools
- 🎓 **Courses**: Educational content and tutorials
- 🎨 **Templates**: Design templates and starter kits
- 🎫 **Tickets**: Event tickets and conference access

### SVG Component System
- Product cards with pricing and metadata display
- Interactive marketplace UI elements
- Category-specific visual icons
- Responsive design capabilities
- Commerce-focused styling and animations

### Seller Features
- Complete product upload interface
- Pricing and categorization tools
- Markdown support for rich descriptions
- File upload system for digital goods
- Product management dashboard

## Architecture

```
ninefy/
├── README.md
├── package.json
├── src-tauri/          # Rust backend
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
└── src/                # Frontend
    ├── index.html
    ├── main.js
    ├── styles.css
    ├── components/     # Ninefy-specific components
    ├── shared/         # Symlink to ../shared/
    ├── config/         # Configuration files
    └── assets/         # Static assets
```

## Screen Architecture

### 1. Main Screen (Shop)
Product marketplace with browsing, category filtering, and teleported content feed

### 2. Product Details Screen  
Comprehensive product information with purchase interface and rich descriptions

### 3. Upload Screen
Form for sellers to list digital products with pricing, categories, and file uploads

### 4. Base Screen
Universal server management for connecting to allyabase instances

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run tauri dev
   ```

3. **Build for Production**
   ```bash
   npm run tauri build
   ```

## Configuration

Ninefy uses JSON configuration for marketplace theming and behavior:

```javascript
// config/theme.json
{
  "commerce": {
    "currency": "USD",
    "priceFormat": "dollars",
    "categories": ["ebooks", "music", "software", "courses", "templates", "tickets"]
  },
  "typography": {
    "fontSize": 16,
    "fontFamily": "Inter, sans-serif",
    "priceColor": "#2ecc71",
    "titleColor": "#2c3e50"
  },
  "layout": {
    "gridColumns": 3,
    "cardSpacing": 20,
    "backgroundColor": "#f8f9fa"
  }
}
```

## SVG Components Usage

```javascript
import { createProductCard } from './components/marketplace.js';

// Create a product card
const productConfig = {
  title: "My Digital Product",
  price: 2999, // Price in cents
  category: "ebooks",
  description: "A great digital product",
  author: "John Doe",
  downloads: 150,
  rating: 4.8
};

const productCard = createProductCard(productConfig);
document.getElementById('marketplace').appendChild(productCard);
```

## Integration with allyabase

Ninefy connects to specialized allyabase services:
- **Sanora**: Product hosting and metadata storage
- **Addie**: Payment processing with transaction splitting
- **BDO**: File storage for digital product assets
- **Dolores**: Media storage for product images and previews
- **Fount**: MAGIC transaction processing

## Sample Products

The marketplace includes sample products across all categories:
- "The Complete JavaScript Handbook" ($49.99) - E-book
- "Ambient Focus - Productivity Soundtrack" ($19.99) - Music
- "React Component Library Starter" ($79.99) - Software
- "Mastering SVG Animations" ($89.99) - Course
- "Minimalist Landing Page Templates" ($29.99) - Templates
- "Planet Nine Developer Conference 2025" ($129.99) - Ticket

## Commerce Features

### For Buyers
- Browse products by category
- View detailed product information
- Secure checkout with MAGIC payments
- Download management and access

### For Sellers
- Upload digital products
- Set pricing and categories
- Rich product descriptions with Markdown
- Sales analytics and revenue tracking

## Customization

### Marketplace Themes
Customize the marketplace appearance:
- Product card layouts
- Category color schemes
- Pricing display formats
- Grid and list view options

### Product Categories
Add custom product categories:
- Define new product types
- Create category-specific icons
- Configure pricing models
- Set up file type associations

## Contributing

1. Follow The Nullary component architecture
2. Use SVG-based marketplace UI elements
3. Maintain JSON configuration patterns
4. Test commerce workflows thoroughly
5. Ensure allyabase service compatibility

## Comparison with Other Nullary Apps

Ninefy focuses on digital commerce while sharing The Nullary's core architecture with other apps like Rhapsold (blogging) and Screenary (social media). All apps use the same SVG component system and allyabase integration but are optimized for different use cases.