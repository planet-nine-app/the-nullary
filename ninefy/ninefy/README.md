# Rhapsold - The Nullary Blogging Platform

Rhapsold is a minimalist blogging platform built on The Nullary ecosystem, using allyabase for backend services and shared SVG components for the UI.

## Overview

Rhapsold focuses on pure writing and reading experiences without distractions. It uses:
- **SVG Components**: Custom SVG-based UI elements for unique, scalable interface
- **JSON Configuration**: Simple config objects for customizing appearance and behavior
- **allyabase Integration**: Anonymous, sessionless backend for posts and preferences
- **Tauri Framework**: Cross-platform desktop and mobile app

## Features

### Core Functionality
- ✍️ **Writing**: Distraction-free writing interface
- 📖 **Reading**: Clean, typography-focused reading experience  
- 🎨 **Customization**: JSON-configurable themes and layouts
- 🌐 **Federation**: Connect to other allyabase instances
- 📱 **Cross-Platform**: Desktop and mobile via Tauri

### SVG Component System
- Text rendering with advanced typography
- Layout containers and positioning
- Interactive buttons and controls
- Responsive design capabilities
- Theme-based styling

### Blog Features
- Multiple post formats (text, image, mixed)
- Tag-based organization
- Search and filtering
- Export capabilities
- Draft management

## Architecture

```
rhapsold/
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
    ├── components/     # Rhapsold-specific components
    ├── shared/         # Symlink to ../shared/
    ├── config/         # Configuration files
    └── assets/         # Static assets
```

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

Rhapsold uses JSON configuration for theming and behavior:

```javascript
// config/theme.json
{
  "typography": {
    "fontSize": 18,
    "fontFamily": "Georgia, serif",
    "lineHeight": 1.6,
    "color": "#2c3e50"
  },
  "layout": {
    "maxWidth": 800,
    "padding": 40,
    "backgroundColor": "#ffffff"
  },
  "components": {
    "buttons": {
      "style": "minimal",
      "accentColor": "#3498db"
    }
  }
}
```

## SVG Components Usage

```javascript
import { createTextComponent } from './shared/components/text.js';

// Create a blog title
const titleConfig = {
  text: "My Blog Post",
  fontSize: 32,
  fontFamily: "Georgia, serif",
  color: "#2c3e50",
  textAlign: "center",
  width: 600,
  height: 80
};

const titleSVG = createTextComponent(titleConfig);
document.body.appendChild(titleSVG);
```

## Integration with allyabase

Rhapsold connects to allyabase services:
- **dolores**: Store and retrieve blog posts
- **pref**: Save user preferences and themes
- **bdo**: Store media and attachments
- **sessionless**: Anonymous authentication

## Customization

### Themes
Create custom themes by modifying JSON configurations:
- Typography settings
- Color schemes  
- Layout parameters
- Component styling

### Components
Extend functionality with custom SVG components:
- Custom post layouts
- Interactive elements
- Data visualizations
- Animations

## Contributing

1. Follow The Nullary component architecture
2. Use SVG-based UI elements
3. Maintain JSON configuration patterns
4. Test across desktop and mobile
5. Ensure allyabase compatibility