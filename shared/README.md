# Shared Components for The Nullary

This directory contains shared components and utilities that can be used across all the-nullary applications (ninefy, rhapsold, blogary, eventary, postary, screenary, viewaris, wikiary, etc.).

## Architecture

### Component Philosophy
All shared components follow these principles:
- **JSON Configuration**: Simple config objects for customization
- **Modular Design**: Self-contained components with clear interfaces
- **Theme Integration**: Consistent theming across all applications
- **Cross-App Compatibility**: Components work across all Nullary apps
- **Progressive Enhancement**: Graceful degradation when services unavailable

### Component Categories
1. **Navigation Components**: HUD overlays, navigation systems, screen management
2. **Content Components**: Product cards, blog cards, content display
3. **UI Components**: Loading states, modals, status messages, empty states
4. **Utility Systems**: Theme management, base discovery, environment configuration
5. **Form Components**: Input forms, validation, submission handling
6. **Screen Components**: Complete screen implementations (base management, etc.)

## Core Components

### Navigation System (`components/navigation.js`)
- `createNavigationHUD()` - Application header with navigation
- `updateNavigationButtons()` - Button state management
- `createNavigationManager()` - Full navigation state management

### Product/Content Cards (`components/product-card.js`)
- `createProductCard()` - Marketplace product cards (ninefy)
- `createBlogPostCard()` - Blog post cards (rhapsold)
- `createCardGrid()` - Responsive grid containers

### Two-Column Layout (`components/two-column-layout.js`)
- `createTwoColumnLayout()` - Shared layout with main content left, teleported content right
- Left column: App-specific content (products for ninefy, blog posts for rhapsold)
- Right column: Teleported content discovery from Planet Nine network
- Responsive design with mobile optimizations

### Common UI Patterns (`utils/common-ui.js`)
- `createLoadingSpinner()` - Loading indicators
- `createEmptyState()` - Empty state displays
- `createStatusMessage()` - Status notifications
- `createModal()` - Modal dialogs
- `showToast()` - Toast notifications
- `showConfirmDialog()` - Confirmation dialogs

### Theme System (`utils/theme-system.js`)
- Multiple themes: Default, Marketplace, Blog, Dark, High Contrast
- `createThemeManager()` - Theme switching and management
- `applyTheme()` - Apply themes to elements
- Theme-aware button and input styles

### Base Discovery (`utils/base-discovery.js`)
- `getAvailableBases()` - Discover allyabase servers
- `getProductsFromBases()` - Aggregate content from multiple bases
- `normalizeBaseProduct()` - Standardize product data
- Intelligent caching and HTTP fallbacks

## Usage Examples

### Navigation Setup
```javascript
import { createNavigationHUD, createNavigationManager } from './shared/components/navigation.js';

const screens = [
  { id: 'main', label: '🏪 Shop', title: 'Browse Products' },
  { id: 'upload', label: '📤 Upload', title: 'Upload Product' },
  { id: 'base', label: '⚙️ Base', title: 'Server Management' }
];

const navManager = createNavigationManager({
  initialScreen: 'main',
  screens,
  theme: currentTheme,
  onNavigate: (screenId) => renderScreen(screenId)
});

const hud = createNavigationHUD({
  appName: 'Ninefy',
  logoIcon: '🛍️',
  screens,
  theme: currentTheme,
  onNavigate: (screenId) => navManager.navigateTo(screenId)
});

document.body.appendChild(hud);
```

### Two-Column Layout
```javascript
import { createTwoColumnLayout } from './shared/components/two-column-layout.js';

// Create layout with app-specific left column and shared teleported right column
const layout = createTwoColumnLayout({
  theme: currentTheme,
  responsive: true,
  gap: '24px'
});

// Set left column content renderer
layout.setLeftColumnRenderer(async (container) => {
  // For ninefy: render products
  // For rhapsold: render blog posts
  // Container is automatically managed
  await renderMainContent(container);
});

// Initialize teleported content in right column
await layout.initializeTeleportedContent();

// Handle teleported item clicks
layout.element.addEventListener('teleported-item-click', (event) => {
  const { item } = event.detail;
  handleDiscoveredContent(item);
});

document.body.appendChild(layout.element);
```

### Product Cards
```javascript
import { createProductCard, createCardGrid } from './shared/components/product-card.js';

const grid = createCardGrid({ minCardWidth: '350px' });

products.forEach(product => {
  const card = createProductCard(product, {
    showPrice: true,
    showStats: true,
    showCategory: true
  }, theme, (product) => {
    // Handle click
    showProductDetails(product);
  });
  
  grid.appendChild(card);
});

document.body.appendChild(grid);
```

### Theme Management
```javascript
import { createThemeManager, THEMES } from './shared/utils/theme-system.js';

const themeManager = createThemeManager('marketplace');

// Switch themes
themeManager.setTheme('dark');

// Listen for theme changes
themeManager.onThemeChange((newTheme) => {
  console.log('Theme changed to:', newTheme.name);
  updateUIWithTheme(newTheme);
});

const currentTheme = themeManager.getCurrentTheme();
```

### Base Discovery
```javascript
import { getAvailableBases, getProductsFromBases } from './shared/utils/base-discovery.js';

// Discover available base servers
const bases = await getAvailableBases();
console.log('Available bases:', Object.keys(bases));

// Get products from all bases
const products = await getProductsFromBases();
console.log('Products from all bases:', products.length);
```

### Common UI Patterns
```javascript
import { createLoadingSpinner, createEmptyState, showToast } from './shared/utils/common-ui.js';

// Show loading
const spinner = createLoadingSpinner({ text: 'Loading products...' });
container.appendChild(spinner);

// Show empty state
const emptyState = createEmptyState({
  icon: '📦',
  title: 'No products yet',
  description: 'Products will appear here when they\'re added to your marketplace',
  actionText: 'Add Product',
  onAction: () => navigateToUpload()
});

// Show toast notification
showToast({
  message: 'Product uploaded successfully!',
  type: 'success',
  duration: 3000
});
```

## File Structure
```
shared/
├── README.md                          # This documentation
├── README-ENVIRONMENT.md              # Environment configuration guide
├── README-BASE-SCREEN-PRODUCTION.md   # Base screen documentation
├── components/
│   ├── navigation.js                  # Navigation and HUD system
│   ├── product-card.js                # Product and content cards
│   ├── base-screen-production.js      # Production base management
│   ├── blog-creation-form.js          # Blog creation forms
│   ├── blog-preview.js                # Blog preview components
│   ├── blog-viewer.js                 # Blog viewing components
│   ├── feed.js                        # Content feed components
│   ├── forms.js                       # Form components
│   ├── hud.js                         # HUD overlay system
│   ├── swipable-feed.js               # Swipable content feeds
│   └── text.js                        # Text rendering components
├── screens/
│   ├── base-screen.js                 # Universal base management screen
│   ├── main-screen.js                 # Main content screen
│   ├── new-post-screen.js             # Content creation screen
│   └── post-reading-screen.js         # Content reading screen
├── utils/
│   ├── common-ui.js                   # Common UI patterns and utilities
│   ├── theme-system.js                # Theme management system
│   ├── base-discovery.js              # Base server discovery utilities
│   ├── environment-integration.js     # Environment configuration
│   ├── form-utils.js                  # Form creation and handling
│   ├── layered-ui.js                  # Multi-layer UI management
│   ├── post-creator.js                # Content creation utilities
│   ├── sanora-integration.js          # Sanora service integration
│   └── svg-utils.js                   # SVG creation helpers
├── services/
│   ├── base-command.js                # Base server commands
│   ├── base-discovery.js              # Base discovery service
│   └── environment-config.js          # Environment configuration
├── feeds/
│   ├── photo-feed.js                  # Photo content feeds
│   ├── text-feed.js                   # Text content feeds
│   └── video-feed.js                  # Video content feeds
└── scaffolding/
    └── app-scaffolding.js             # Application scaffolding system
```

## Integration with Nullary Apps

### Import Patterns
```javascript
// ES6 modules (recommended)
import { createProductCard } from '../../shared/components/product-card.js';
import { getAvailableBases } from '../../shared/utils/base-discovery.js';

// Relative imports from app directories
import { createNavigationHUD } from './shared/components/navigation.js';
```

### Environment Integration
All apps support unified environment switching:
```javascript
// Browser console commands (available in all apps)
ninefyEnv.switch('test');    // Switch ninefy to test ecosystem
rhapsoldEnv.switch('dev');   // Switch rhapsold to dev servers

// Programming API
const config = getEnvironmentConfig();
const sanoraUrl = getServiceUrl('sanora');
```

### Cross-App Compatibility
Components are designed to work across different app types:
- **Ninefy (Marketplace)**: Uses product cards, commerce themes, payment integration
- **Rhapsold (Blogging)**: Uses blog cards, reading themes, content creation
- **Screenary (Social)**: Uses social cards, activity feeds, real-time updates
- **All Apps**: Use navigation, base management, theme system, discovery utilities

## Development Workflow

### Adding New Shared Components
1. Create component in appropriate `components/` directory
2. Follow JSON configuration pattern
3. Include theme integration support
4. Add usage examples to documentation
5. Test across multiple apps (ninefy + rhapsold minimum)

### Testing Shared Components
1. Test in both ninefy and rhapsold
2. Verify theme switching works correctly
3. Test environment switching (dev/test/local)
4. Ensure graceful degradation when services unavailable
5. Test responsive behavior across screen sizes

### Best Practices
1. **Consistent APIs**: All components should accept similar config patterns
2. **Theme Support**: Always integrate with the theme system
3. **Error Handling**: Graceful degradation when services fail
4. **Performance**: Consider caching and lazy loading for large datasets
5. **Accessibility**: Include proper ARIA labels and keyboard navigation

This shared component system enables rapid development of new Nullary applications while maintaining consistency and code reuse across the entire ecosystem.