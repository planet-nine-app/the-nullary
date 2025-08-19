/**
 * Menu Integration for Rhapsold
 * 
 * Integrates menu catalog display and reconstruction
 * with existing Rhapsold architecture.
 */

// Import shared menu utilities (will be loaded via script tag)
// import { detectMenuProducts, reconstructMenu } from '../shared/utils/menu-utils.js';
// import { createMenuCatalogCard, createMenuStructureDisplay } from '../shared/components/menu-display.js';

/**
 * Process products to detect and reconstruct menus
 * @param {Array} products - Array of products from Sanora
 * @returns {Object} Processed result with menus and regular products
 */
function processProductsForMenus(products) {
  if (!window.MenuUtils) {
    console.warn('⚠️ Menu utilities not loaded, treating all products as regular');
    return {
      regularProducts: products,
      menuCatalogs: [],
      hasMenus: false
    };
  }

  const detection = window.MenuUtils.detectMenuProducts(products);
  const reconstructedMenus = new Map();

  // Try to reconstruct menus from detected menu products
  if (detection.hasMenus) {
    console.log('🍽️ Found menu products, attempting reconstruction...');
    
    detection.menuCatalogs.forEach((catalogData, catalogId) => {
      if (catalogData.structure && catalogData.catalog) {
        // This is a complete menu catalog
        const menuItems = detection.menuProducts.filter(p => 
          p.metadata?.menuCatalogId === catalogId
        );
        
        const reconstructed = window.MenuUtils.reconstructMenu(menuItems, catalogData.structure);
        if (reconstructed) {
          reconstructedMenus.set(catalogId, {
            catalog: catalogData.catalog,
            menu: reconstructed,
            items: menuItems
          });
          console.log(`✅ Reconstructed menu: ${catalogId}`);
        }
      }
    });
  }

  return {
    regularProducts: detection.regularProducts,
    menuCatalogs: Array.from(reconstructedMenus.values()),
    menuProducts: detection.menuProducts,
    hasMenus: reconstructedMenus.size > 0
  };
}

/**
 * Create menu catalog cards for the main screen
 * @param {Array} menuCatalogs - Array of reconstructed menu catalogs
 * @param {Function} onMenuClick - Click handler for menus
 * @returns {Array} Array of SVG menu cards
 */
function createMenuCards(menuCatalogs, onMenuClick = null) {
  if (!window.MenuDisplay) {
    console.warn('⚠️ Menu display components not loaded');
    return [];
  }

  return menuCatalogs.map(({ catalog, menu }) => {
    const card = window.MenuDisplay.createMenuCatalogCard(menu, {
      width: 300,
      height: 200,
      showPrice: true,
      showItemCount: true,
      onClick: onMenuClick ? () => onMenuClick(catalog, menu) : null
    });

    // Add some metadata for identification
    card.setAttribute('data-menu-id', catalog.id);
    card.setAttribute('data-menu-title', menu.title || catalog.title);
    
    return card;
  });
}

/**
 * Create a detailed menu display for reading screen
 * @param {Object} menuCatalog - Reconstructed menu catalog
 * @param {Object} config - Display configuration
 * @returns {SVGElement} Menu structure display
 */
function createDetailedMenuDisplay(menuCatalog, config = {}) {
  if (!window.MenuDisplay) {
    console.warn('⚠️ Menu display components not loaded');
    return null;
  }

  return window.MenuDisplay.createMenuStructureDisplay(menuCatalog.menu, {
    width: config.width || 600,
    showPrices: config.showPrices !== false,
    expandable: config.expandable !== false,
    onItemClick: config.onItemClick || null
  });
}

/**
 * Check if a product is a menu catalog
 * @param {Object} product - Product to check
 * @returns {boolean} True if product is a menu catalog
 */
function isMenuCatalog(product) {
  return product.category === 'menu' && 
         product.metadata && 
         product.metadata.menuStructure;
}

/**
 * Check if a product is a menu item
 * @param {Object} product - Product to check
 * @returns {boolean} True if product is a menu item
 */
function isMenuItem(product) {
  return product.category === 'menu-item' && 
         product.metadata && 
         product.metadata.menuCatalogId;
}

/**
 * Get menu preview text for a menu catalog
 * @param {Object} menuCatalog - Menu catalog
 * @returns {string} Preview text
 */
function getMenuPreviewText(menuCatalog) {
  const { menu } = menuCatalog;
  const itemCount = menu.metadata?.totalProducts || 0;
  const menuCount = menu.metadata?.menuCount || 0;
  
  if (itemCount === 0) {
    return 'Empty menu';
  }
  
  return `${itemCount} items across ${menuCount} categories`;
}

/**
 * Format menu for blog post display
 * @param {Object} menuCatalog - Menu catalog
 * @returns {Object} Formatted display data
 */
function formatMenuForDisplay(menuCatalog) {
  const { catalog, menu } = menuCatalog;
  
  return {
    id: catalog.id,
    title: menu.title || catalog.title || 'Menu',
    description: getMenuPreviewText(menuCatalog),
    type: 'menu',
    category: 'menu',
    price: catalog.price || 0,
    author: catalog.author || 'Unknown',
    publishDate: catalog.publishDate || catalog.createdAt,
    imageUrl: catalog.imageUrl || catalog.previewImage,
    metadata: {
      isMenu: true,
      itemCount: menu.metadata?.totalProducts || 0,
      menuCount: menu.metadata?.menuCount || 0,
      originalCatalog: catalog,
      menuStructure: menu
    }
  };
}

/**
 * Enhanced blog preview card creator that handles menus
 * @param {Object} post - Post/product data (could be blog or menu)
 * @param {Object} config - Configuration options
 * @param {Function} onPostClick - Click handler
 * @returns {SVGElement} Blog preview card
 */
function createEnhancedBlogPreviewCard(post, config, onPostClick) {
  // If this is a menu, format it specially
  if (post.metadata?.isMenu) {
    const menuCard = createMenuCards([{
      catalog: post.metadata.originalCatalog,
      menu: post.metadata.menuStructure
    }], onPostClick)[0];
    
    // Add blog-like styling to match other cards
    if (menuCard) {
      menuCard.style.marginBottom = '20px';
      menuCard.classList.add('blog-preview-card', 'menu-preview-card');
    }
    
    return menuCard;
  }
  
  // For regular blog posts, use the existing function
  return window.createBlogPreviewCard ? 
    window.createBlogPreviewCard(post, config, onPostClick) : 
    null;
}

/**
 * Initialize menu integration
 * Called when page loads and menu utilities are available
 */
function initializeMenuIntegration() {
  console.log('🍽️ Initializing menu integration for Rhapsold...');
  
  // Check if menu utilities are loaded
  if (!window.MenuUtils || !window.MenuDisplay) {
    console.error('❌ Menu utilities not loaded, skipping menu integration');
    return false;
  }
  
  // Override the existing product processing if it exists
  if (window.processProductsForDisplay) {
    const originalProcessor = window.processProductsForDisplay;
    window.processProductsForDisplay = function(products) {
      // First, process for menus
      const menuResult = processProductsForMenus(products);
      
      // Convert menu catalogs to blog-like display format
      const menuDisplayData = menuResult.menuCatalogs.map(formatMenuForDisplay);
      
      // Combine with regular products
      const allDisplayData = [...menuDisplayData, ...menuResult.regularProducts];
      
      // Call original processor if it exists
      if (originalProcessor && typeof originalProcessor === 'function') {
        return originalProcessor(allDisplayData);
      }
      
      return allDisplayData;
    };
    
    console.log('✅ Enhanced product processing with menu support');
  }
  
  // Override blog preview card creation
  if (window.createBlogPreviewCard) {
    window.createOriginalBlogPreviewCard = window.createBlogPreviewCard;
    window.createBlogPreviewCard = createEnhancedBlogPreviewCard;
    console.log('✅ Enhanced blog preview cards with menu support');
  }
  
  // Add global menu functions
  window.rhapsoldMenus = {
    processProductsForMenus,
    createMenuCards,
    createDetailedMenuDisplay,
    isMenuCatalog,
    isMenuItem,
    getMenuPreviewText,
    formatMenuForDisplay
  };
  
  console.log('✅ Menu integration initialized for Rhapsold');
  return true;
}

// Export for global use
window.initializeMenuIntegration = initializeMenuIntegration;
window.processProductsForMenus = processProductsForMenus;
window.createMenuCards = createMenuCards;
window.createDetailedMenuDisplay = createDetailedMenuDisplay;

console.log('🍽️ Rhapsold menu integration loaded');