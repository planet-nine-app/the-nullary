/**
 * Example: Ninefy Navigation Integration
 * Shows how to replace ninefy's custom navigation with shared components
 */

// Instead of custom HUD creation, import shared navigation
import { createNavigationHUD, createNavigationManager } from '../components/navigation.js';
import { createThemeManager, MARKETPLACE_THEME } from '../utils/theme-system.js';
import { createLoadingSpinner, showToast, createEmptyState } from '../utils/common-ui.js';
import { createProductCard, createCardGrid } from '../components/product-card.js';
import { getAvailableBases, getProductsFromBases } from '../utils/base-discovery.js';

/**
 * REPLACE THIS: Original ninefy HUD creation
 * 
 * // Old way (in main.js around line 950)
 * function createHUD() {
 *   const hud = document.createElement('div');
 *   hud.id = 'hud';
 *   hud.style.cssText = `...lots of inline styles...`;
 *   
 *   // Manual button creation
 *   const screens = [
 *     { id: 'main', label: '🏪 Shop', title: 'Browse Products' },
 *     // ... more screens
 *   ];
 *   
 *   screens.forEach(screen => {
 *     // Manual button creation and event handling
 *   });
 *   
 *   return hud;
 * }
 * 
 * function navigateToScreen(screenId) {
 *   // Manual screen navigation logic
 * }
 */

/**
 * NEW WAY: Using shared components
 */

// Initialize theme management
const themeManager = createThemeManager('marketplace');
let currentTheme = themeManager.getCurrentTheme();

// Define screens
const screens = [
  { id: 'main', label: '🏪 Shop', title: 'Browse Products' },
  { id: 'browse', label: '🌐 Browse Base', title: 'Browse Base Products' },
  { id: 'upload', label: '📤 Upload', title: 'Upload Product' },
  { id: 'base', label: '⚙️ Base', title: 'Server Management' }
];

// Create navigation manager
const navManager = createNavigationManager({
  initialScreen: 'main',
  screens,
  theme: currentTheme,
  onNavigate: (screenId) => {
    console.log(`🧭 Navigating to screen: ${screenId}`);
    
    // Update app state (if you have global appState)
    if (window.appState) {
      window.appState.currentScreen = screenId;
    }
    
    // Render the screen
    renderCurrentScreen(screenId);
  }
});

// Create shared HUD component
function createSharedHUD() {
  return createNavigationHUD({
    appName: 'Ninefy',
    logoIcon: '🛍️',
    screens,
    theme: currentTheme,
    currentScreen: navManager.getCurrentScreen(),
    onNavigate: (screenId) => navManager.navigateTo(screenId)
  });
}

// Replace manual screen rendering with shared utilities
async function renderCurrentScreen(screenId) {
  const contentContainer = document.getElementById('app-content');
  if (!contentContainer) return;
  
  // Clear and show loading
  contentContainer.innerHTML = '';
  const spinner = createLoadingSpinner({ 
    text: `Loading ${screenId} screen...`,
    color: currentTheme.colors.accent 
  });
  contentContainer.appendChild(spinner);
  
  try {
    // Render specific screen
    await renderScreen(screenId, contentContainer);
    spinner.remove();
    
    // Update navigation state
    navManager.updateStatus('Ready', 'success');
    
  } catch (error) {
    console.error(`Failed to render screen ${screenId}:`, error);
    spinner.remove();
    
    // Show error state
    const errorState = createEmptyState({
      icon: '❌',
      title: 'Screen Error',
      description: `Failed to load ${screenId} screen. Please try again.`,
      actionText: 'Retry',
      onAction: () => renderCurrentScreen(screenId),
      theme: currentTheme
    });
    contentContainer.appendChild(errorState);
    
    navManager.updateStatus('Error loading screen', 'error');
  }
}

async function renderScreen(screenId, container) {
  switch (screenId) {
    case 'main':
      await renderMainScreen(container);
      break;
    case 'browse':
      await renderBrowseScreen(container);
      break;
    case 'upload':
      await renderUploadScreen(container);
      break;
    case 'base':
      await renderBaseScreen(container);
      break;
    default:
      throw new Error(`Unknown screen: ${screenId}`);
  }
}

/**
 * REPLACE THIS: Original product display logic
 * 
 * // Old way (scattered throughout main.js)
 * function createProductCard(productData) {
 *   const card = document.createElement('div');
 *   // ... lots of manual DOM creation
 *   return card;
 * }
 * 
 * async function getProductsFromBases() {
 *   // Manual product fetching logic
 * }
 */

/**
 * NEW WAY: Using shared components
 */

async function renderMainScreen(container) {
  try {
    // Show loading state
    const loadingState = createEmptyState({
      icon: '🔄',
      title: 'Loading Products',
      description: 'Fetching products from connected bases...',
      theme: currentTheme
    });
    container.appendChild(loadingState);
    
    // Get products using shared discovery
    const products = await getProductsFromBases();
    loadingState.remove();
    
    if (products.length === 0) {
      // Show empty state using shared component
      const emptyState = createEmptyState({
        icon: '📦',
        title: 'No products yet',
        description: 'Products will appear here when they\'re added to connected bases',
        actionText: 'Browse Bases',
        onAction: () => navManager.navigateTo('browse'),
        theme: currentTheme
      });
      container.appendChild(emptyState);
      return;
    }
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${currentTheme.colors.background};
    `;
    header.innerHTML = `
      <h1 style="
        color: ${currentTheme.colors.primary};
        margin-bottom: 12px;
        font-size: 2.5rem;
        font-family: ${currentTheme.typography.fontFamily};
      ">🛍️ Digital Marketplace</h1>
      <p style="
        color: ${currentTheme.colors.secondary};
        font-size: 18px;
        margin: 0;
      ">Discover ${products.length} products from ${new Set(products.map(p => p.baseName)).size} connected bases</p>
    `;
    
    // Create product grid using shared component
    const grid = createCardGrid({ 
      minCardWidth: '350px',
      gap: '20px',
      padding: '0'
    });
    
    // Create product cards using shared component
    products.forEach(product => {
      const card = createProductCard(product, {
        showPrice: true,
        showStats: true,
        showCategory: true
      }, currentTheme, (clickedProduct) => {
        showProductDetails(clickedProduct);
      });
      
      grid.appendChild(card);
    });
    
    container.appendChild(header);
    container.appendChild(grid);
    
  } catch (error) {
    console.error('Failed to render main screen:', error);
    throw error;
  }
}

async function renderBrowseScreen(container) {
  try {
    // Get available bases using shared discovery
    const bases = await getAvailableBases();
    const baseEntries = Object.entries(bases);
    
    if (baseEntries.length === 0) {
      const emptyState = createEmptyState({
        icon: '🌐',
        title: 'No bases available',
        description: 'Could not discover any base servers. Check your connection.',
        actionText: 'Retry',
        onAction: () => renderCurrentScreen('browse'),
        theme: currentTheme
      });
      container.appendChild(emptyState);
      return;
    }
    
    // Create base selection interface
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${currentTheme.colors.background};
    `;
    header.innerHTML = `
      <h1 style="color: ${currentTheme.colors.primary}; font-family: ${currentTheme.typography.fontFamily};">🌐 Browse Base Servers</h1>
      <p style="color: ${currentTheme.colors.secondary};">Discovered ${baseEntries.length} available base servers</p>
    `;
    
    container.appendChild(header);
    
    // Create base cards
    const baseGrid = createCardGrid({ minCardWidth: '300px' });
    
    baseEntries.forEach(([baseId, base]) => {
      const baseCard = createBaseCard(baseId, base);
      baseGrid.appendChild(baseCard);
    });
    
    container.appendChild(baseGrid);
    
  } catch (error) {
    console.error('Failed to render browse screen:', error);
    throw error;
  }
}

function createBaseCard(baseId, base) {
  const card = document.createElement('div');
  card.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid ${currentTheme.colors.border};
  `;
  
  card.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: ${currentTheme.colors.primary};">${base.name}</h3>
    <p style="margin: 0 0 15px 0; color: ${currentTheme.colors.secondary}; font-size: 14px;">${base.description || 'Base server'}</p>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
      ${base.tags?.map(tag => `<span style="
        background: ${currentTheme.colors.accent}20;
        color: ${currentTheme.colors.accent};
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
      ">${tag}</span>`).join('') || ''}
    </div>
    <div style="font-size: 12px; color: ${currentTheme.colors.secondary};">
      Sanora: ${base.dns?.sanora ? '✅' : '❌'}
    </div>
  `;
  
  card.addEventListener('click', () => {
    loadProductsFromBase(baseId, base);
  });
  
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  });
  
  return card;
}

async function loadProductsFromBase(baseId, base) {
  if (!base.dns?.sanora) {
    showToast({
      message: 'This base does not have Sanora service available',
      type: 'error'
    });
    return;
  }
  
  showToast({
    message: `Loading products from ${base.name}...`,
    type: 'info'
  });
  
  try {
    // Here you would load products from specific base
    // For now, just show a notification
    showToast({
      message: `Found products from ${base.name}`,
      type: 'success'
    });
    
  } catch (error) {
    console.error('Failed to load products from base:', error);
    showToast({
      message: `Failed to load products from ${base.name}`,
      type: 'error'
    });
  }
}

function renderUploadScreen(container) {
  // Upload screen implementation using existing ninefy upload logic
  // but with shared UI components for consistency
  
  const emptyState = createEmptyState({
    icon: '📤',
    title: 'Product Upload',
    description: 'Upload screen implementation goes here',
    theme: currentTheme
  });
  
  container.appendChild(emptyState);
}

async function renderBaseScreen(container) {
  // Use shared base screen component
  try {
    const { createBaseScreen } = await import('../screens/base-screen.js');
    
    const baseScreen = createBaseScreen({
      title: 'Base Server Management',
      theme: currentTheme
    });
    
    await baseScreen.initialize();
    container.appendChild(baseScreen.element);
    
  } catch (error) {
    console.error('Failed to load base screen:', error);
    const emptyState = createEmptyState({
      icon: '⚙️',
      title: 'Base Management Unavailable',
      description: 'Could not load base server management interface',
      theme: currentTheme
    });
    container.appendChild(emptyState);
  }
}

function showProductDetails(product) {
  // Show product details (existing ninefy logic)
  console.log('Showing product details:', product);
  showToast({
    message: `Viewing ${product.title}`,
    type: 'info'
  });
}

/**
 * INTEGRATION NOTES:
 * 
 * 1. Replace the manual HUD creation in ninefy's main.js with createSharedHUD()
 * 2. Replace manual navigation logic with navManager
 * 3. Replace manual product card creation with shared createProductCard()
 * 4. Replace manual base discovery with shared getAvailableBases()
 * 5. Use shared UI components for loading states, empty states, etc.
 * 
 * The main changes needed in ninefy's main.js:
 * 
 * - Remove createHUD() function
 * - Remove navigateToScreen() function
 * - Remove updateHUDButtons() function
 * - Remove manual product card creation
 * - Import and use shared components instead
 * 
 * This reduces ninefy's main.js from ~2000 lines to ~500 lines while
 * gaining consistent theming, better error handling, and cross-app compatibility.
 */

export {
  createSharedHUD,
  navManager,
  renderCurrentScreen,
  themeManager,
  currentTheme
};