/**
 * Example: Ninefy Two-Column Layout Integration
 * Shows how to use the shared two-column layout with products on left, teleported content on right
 */

import { createTwoColumnLayout } from '../components/two-column-layout.js';
import { createProductCard, createCardGrid } from '../components/product-card.js';
import { createNavigationHUD, createNavigationManager } from '../components/navigation.js';
import { createThemeManager, MARKETPLACE_THEME } from '../utils/theme-system.js';
import { getProductsFromBases } from '../utils/base-discovery.js';
import { createLoadingSpinner, createEmptyState, showToast } from '../utils/common-ui.js';

/**
 * REPLACE THIS: Old ninefy main screen rendering
 * 
 * Instead of manual grid creation and product cards, use the two-column layout
 * with products on the left and teleported content on the right.
 */

// Initialize theme
const themeManager = createThemeManager('marketplace');
const currentTheme = themeManager.getCurrentTheme();

// Create two-column layout for ninefy
function createNinefyTwoColumnLayout() {
  const layout = createTwoColumnLayout({
    theme: currentTheme,
    leftColumn: {
      backgroundColor: currentTheme.colors.surface
    },
    rightColumn: {
      backgroundColor: currentTheme.colors.surface
    },
    teleportation: {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      cacheTimeout: 5 * 60 * 1000      // 5 minutes
    },
    responsive: true,
    gap: '24px'
  });

  // Set up the left column renderer for products
  layout.setLeftColumnRenderer(async (container) => {
    await renderProductsInLeftColumn(container);
  });

  // Handle teleported item clicks
  layout.element.addEventListener('teleported-item-click', (event) => {
    const { item } = event.detail;
    handleTeleportedItemClick(item);
  });

  return layout;
}

/**
 * Render products in the left column (ninefy's main content)
 */
async function renderProductsInLeftColumn(container) {
  try {
    // Create header for products section
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid ${currentTheme.colors.background};
    `;
    
    // Show loading state for products count
    header.innerHTML = `
      <h2 style="
        margin: 0 0 8px 0;
        color: ${currentTheme.colors.primary};
        font-size: 24px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        🛍️ Digital Marketplace
        <span style="
          font-size: 14px;
          background: ${currentTheme.colors.accent}20;
          color: ${currentTheme.colors.accent};
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: normal;
        ">Loading...</span>
      </h2>
      <p style="
        margin: 0;
        color: ${currentTheme.colors.secondary};
        font-size: 16px;
      ">Discover digital products from connected Planet Nine bases</p>
    `;
    
    container.appendChild(header);

    // Get products from bases
    const products = await getProductsFromBases();

    // Update header with product count
    const countBadge = header.querySelector('span');
    if (countBadge) {
      countBadge.textContent = `${products.length} products`;
    }

    if (products.length === 0) {
      const emptyState = createEmptyState({
        icon: '🛍️',
        title: 'No products found',
        description: 'No products available from connected bases. Try connecting to more bases or check back later.',
        actionText: 'Browse Bases',
        onAction: () => {
          // Navigate to browse base screen
          window.dispatchEvent(new CustomEvent('navigate-to-screen', { 
            detail: { screenId: 'browse' } 
          }));
        },
        theme: currentTheme
      });
      container.appendChild(emptyState);
      return;
    }

    // Create product grid
    const productGrid = createCardGrid({
      minCardWidth: '320px',
      gap: '20px',
      padding: '0'
    });

    // Add product cards
    products.forEach(product => {
      const card = createProductCard(product, {
        showPrice: true,
        showStats: true,
        showCategory: true,
        width: '100%'
      }, currentTheme, (clickedProduct) => {
        showProductDetails(clickedProduct);
      });
      
      productGrid.appendChild(card);
    });

    container.appendChild(productGrid);

    // Add floating stats
    addFloatingStats(container, products);

  } catch (error) {
    console.error('Failed to render products:', error);
    
    const errorState = createEmptyState({
      icon: '❌',
      title: 'Failed to load products',
      description: 'There was an error loading products. Please try again.',
      actionText: 'Retry',
      onAction: () => {
        // Trigger re-render
        window.location.reload();
      },
      theme: currentTheme
    });
    
    container.appendChild(errorState);
  }
}

/**
 * Add floating stats overlay
 */
function addFloatingStats(container, products) {
  const stats = document.createElement('div');
  stats.style.cssText = `
    position: sticky;
    top: 10px;
    right: 10px;
    background: ${currentTheme.colors.surface};
    border: 1px solid ${currentTheme.colors.border};
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    color: ${currentTheme.colors.secondary};
    margin: 10px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  `;

  const totalProducts = products.length;
  const bases = new Set(products.map(p => p.baseName)).size;
  const categories = new Set(products.map(p => p.category)).size;
  const freeProducts = products.filter(p => p.price === 0).length;

  stats.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 6px;">📊 Marketplace Stats</div>
    <div>• ${totalProducts} products from ${bases} bases</div>
    <div>• ${categories} categories available</div>
    <div>• ${freeProducts} free products</div>
  `;

  container.appendChild(stats);
}

/**
 * Handle product details view
 */
function showProductDetails(product) {
  console.log('Showing product details:', product);
  
  showToast({
    message: `Opening ${product.title}`,
    type: 'info'
  });

  // Navigate to details screen or show modal
  window.dispatchEvent(new CustomEvent('show-product-details', {
    detail: { product }
  }));
}

/**
 * Handle teleported content clicks (same for both ninefy and rhapsold)
 */
function handleTeleportedItemClick(item) {
  console.log('Teleported item clicked:', item);
  
  if (item.type === 'product') {
    // Handle product from another base
    showToast({
      message: `Viewing product from ${item.baseName}`,
      type: 'info'
    });
    
    // Could open in modal or navigate to external base
    showExternalProduct(item);
    
  } else if (item.type === 'blog') {
    // Handle blog post from another base
    showToast({
      message: `Opening blog post from ${item.baseName}`,
      type: 'info'
    });
    
    // Could open in reading mode or external link
    showExternalBlogPost(item);
  }
}

function showExternalProduct(product) {
  // Create modal or navigation to external product
  console.log('Show external product:', product);
  
  // For now, just show detailed toast
  showToast({
    message: `${product.title} - $${(product.price / 100).toFixed(2)} from ${product.baseName}`,
    type: 'success',
    duration: 4000
  });
}

function showExternalBlogPost(post) {
  // Create modal or navigation to external blog post
  console.log('Show external blog post:', post);
  
  // For now, just show detailed toast
  showToast({
    message: `"${post.title}" by ${post.author} (${post.readTime} min read)`,
    type: 'info',
    duration: 4000
  });
}

/**
 * Initialize ninefy with two-column layout
 */
export function initializeNinefyTwoColumn() {
  console.log('🛍️ Initializing Ninefy with two-column layout...');
  
  // Create navigation
  const screens = [
    { id: 'main', label: '🛍️ Marketplace', title: 'Digital Marketplace' },
    { id: 'browse', label: '🌐 Browse Base', title: 'Browse Base Products' },
    { id: 'upload', label: '📤 Upload', title: 'Upload Product' },
    { id: 'base', label: '⚙️ Base', title: 'Server Management' }
  ];

  const navManager = createNavigationManager({
    initialScreen: 'main',
    screens,
    theme: currentTheme,
    onNavigate: (screenId) => {
      handleNinefyNavigation(screenId);
    }
  });

  const hud = createNavigationHUD({
    appName: 'Ninefy',
    logoIcon: '🛍️',
    screens,
    theme: currentTheme,
    currentScreen: 'main',
    onNavigate: (screenId) => navManager.navigateTo(screenId)
  });

  // Create main layout
  const twoColumnLayout = createNinefyTwoColumnLayout();
  
  // Set up container
  const appContainer = document.getElementById('app') || document.body;
  appContainer.innerHTML = '';
  appContainer.appendChild(hud);
  
  const contentContainer = document.createElement('div');
  contentContainer.id = 'app-content';
  contentContainer.style.cssText = `
    margin-top: 60px;
    height: calc(100vh - 60px);
  `;
  contentContainer.appendChild(twoColumnLayout.element);
  
  appContainer.appendChild(contentContainer);

  // Set up event listeners
  window.addEventListener('navigate-to-screen', (event) => {
    navManager.navigateTo(event.detail.screenId);
  });

  window.addEventListener('show-product-details', (event) => {
    // Handle product details - could show modal or navigate
    console.log('Show product details requested:', event.detail.product);
  });

  console.log('✅ Ninefy two-column layout initialized');
  
  return {
    layout: twoColumnLayout,
    navigation: navManager,
    refreshProducts: () => twoColumnLayout.renderLeftColumn(),
    refreshTeleported: () => twoColumnLayout.refreshTeleportedContent()
  };
}

function handleNinefyNavigation(screenId) {
  console.log(`🧭 Ninefy navigating to: ${screenId}`);
  
  const contentContainer = document.getElementById('app-content');
  if (!contentContainer) return;

  switch (screenId) {
    case 'main':
      // Show two-column layout
      const layout = createNinefyTwoColumnLayout();
      contentContainer.innerHTML = '';
      contentContainer.appendChild(layout.element);
      break;
      
    case 'browse':
      // Show base browsing interface
      contentContainer.innerHTML = '<div style="padding: 20px;">Browse Base implementation</div>';
      break;
      
    case 'upload':
      // Show upload interface
      contentContainer.innerHTML = '<div style="padding: 20px;">Upload Product implementation</div>';
      break;
      
    case 'base':
      // Show base management
      contentContainer.innerHTML = '<div style="padding: 20px;">Base Management implementation</div>';
      break;
  }
}

/**
 * INTEGRATION NOTES FOR NINEFY:
 * 
 * 1. Replace the existing main screen grid layout with createNinefyTwoColumnLayout()
 * 2. The left column automatically renders products using getProductsFromBases()
 * 3. The right column automatically shows teleported content from the network
 * 4. Both columns are responsive and work together
 * 5. Teleported content includes products and blog posts from other bases
 * 
 * Key benefits:
 * - Consistent layout with rhapsold
 * - Automatic content discovery in right column
 * - Responsive design that works on mobile
 * - Built-in caching and refresh capabilities
 * - Unified event handling for teleported content
 * 
 * To integrate into existing ninefy:
 * - Replace renderMainScreen() with this two-column approach
 * - Remove manual product grid creation
 * - Use the shared layout component instead
 */

export {
  createNinefyTwoColumnLayout,
  renderProductsInLeftColumn,
  handleTeleportedItemClick,
  showProductDetails
};