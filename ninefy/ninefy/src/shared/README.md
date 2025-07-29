# Shared SVG Components for The Nullary

This directory contains shared SVG components that can be used across all the-nullary applications (blogary, eventary, postary, screenary, viewaris, wikiary).

## Architecture

### Component Structure
All SVG components follow this pattern:
- **JSON Configuration**: Simple config object for customization
- **SVG Generation**: JavaScript functions that create SVG elements
- **Encapsulated Styling**: CSS embedded within SVG `<style>` elements
- **Reusability**: Components work across all Tauri apps

### Configuration Philosophy
- Minimal config objects with sensible defaults
- Flexible sizing (width, height, viewBox)
- Color theming support
- Typography controls
- Layout options

### Component Types
1. **Text Components**: Simple text rendering with styling
2. **Layout Components**: Containers and positioning
3. **Interactive Components**: Buttons, links, forms
4. **Media Components**: Images, videos, audio
5. **Decorative Components**: Borders, backgrounds, effects

## Usage Pattern

```javascript
// Import component
import { createTextComponent } from './shared/components/text.js';

// Configure component
const config = {
  text: "Hello World",
  fontSize: 24,
  color: "#333",
  fontFamily: "Arial",
  width: 200,
  height: 60
};

// Generate SVG
const svgElement = createTextComponent(config);

// Add to DOM
document.body.appendChild(svgElement);
```

## File Structure
```
shared/
├── README.md
├── components/
│   ├── text.js          # Text rendering
│   ├── layout.js        # Containers & positioning  
│   ├── buttons.js       # Interactive buttons
│   ├── media.js         # Images, videos
│   └── decorative.js    # Borders, backgrounds
├── utils/
│   ├── colors.js        # Color utilities
│   ├── typography.js    # Font utilities
│   └── svg-utils.js     # SVG creation helpers
└── themes/
    ├── default.js       # Default theme
    ├── dark.js          # Dark theme
    └── light.js         # Light theme
```

## Integration with Tauri Apps
Each the-nullary app can import and use these components:
- Copy shared folder to each app during build
- Import components as ES modules
- Configure via JSON from allyabase
- Render directly to DOM or save as SVG files