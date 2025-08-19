/**
 * Shared Menu Display Components
 * 
 * SVG-based components for displaying menu catalogs
 * across all Nullary applications.
 */

/**
 * Get color function with fallback
 * @param {string} colorName - Name of the color
 * @returns {string} Hex color value
 */
function getMenuColor(colorName) {
  if (window.color && typeof window.color === 'function') {
    return window.color(colorName);
  }
  
  // Fallback colors
  const colors = {
    primary: '#9b59b6',
    secondary: '#27ae60', 
    tertiary: '#e91e63',
    quaternary: '#f1c40f',
    inactive: '#95a5a6',
    background: '#ffffff',
    text: '#2c3e50'
  };
  
  return colors[colorName] || colors.primary;
}

/**
 * Create a menu catalog card for product feeds
 * @param {Object} menuCatalog - Menu catalog data
 * @param {Object} config - Configuration options
 * @returns {SVGElement} Menu catalog card
 */
function createMenuCatalogCard(menuCatalog, config = {}) {
  const {
    width = 300,
    height = 200,
    showPrice = true,
    onClick = null,
    showItemCount = true
  } = config;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.style.cursor = onClick ? 'pointer' : 'default';

  const itemCount = menuCatalog.metadata?.totalProducts || 0;
  const menuCount = menuCatalog.metadata?.menuCount || 0;

  svg.innerHTML = `
    <defs>
      <linearGradient id="menuCardGradient_${Math.random().toString(36).substr(2,9)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${getMenuColor('primary')}" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="${getMenuColor('secondary')}" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
    
    <!-- Card Background -->
    <rect x="10" y="10" width="${width - 20}" height="${height - 20}" 
          rx="12" fill="url(#menuCardGradient_${Math.random().toString(36).substr(2,9)})" 
          stroke="${getMenuColor('primary')}" stroke-width="2"/>
    
    <!-- Menu Icon -->
    <g transform="translate(25, 25)">
      <rect x="0" y="0" width="40" height="6" rx="3" fill="${getMenuColor('primary')}"/>
      <rect x="0" y="12" width="30" height="4" rx="2" fill="${getMenuColor('secondary')}"/>
      <rect x="0" y="20" width="35" height="4" rx="2" fill="${getMenuColor('secondary')}"/>
      <rect x="0" y="28" width="25" height="4" rx="2" fill="${getMenuColor('tertiary')}"/>
    </g>
    
    <!-- Title -->
    <text x="80" y="35" font-family="Arial, sans-serif" font-size="16" 
          font-weight="bold" fill="${getMenuColor('primary')}">${menuCatalog.title || 'Menu Catalog'}</text>
    
    <!-- Stats -->
    <text x="25" y="65" font-family="Arial, sans-serif" font-size="12" 
          fill="${getMenuColor('inactive')}">${itemCount} items</text>
    <text x="25" y="80" font-family="Arial, sans-serif" font-size="12" 
          fill="${getMenuColor('inactive')}">${menuCount} categories</text>
    
    <!-- Price (if menu has base price) -->
    ${showPrice && menuCatalog.basePrice ? `
      <text x="${width - 25}" y="35" font-family="Arial, sans-serif" font-size="14" 
            font-weight="bold" fill="${getMenuColor('secondary')}" text-anchor="end">
        $${(menuCatalog.basePrice / 100).toFixed(2)}+
      </text>
    ` : ''}
    
    <!-- Menu type indicator -->
    <rect x="25" y="${height - 35}" width="60" height="20" rx="10" 
          fill="${getMenuColor('tertiary')}" fill-opacity="0.2" 
          stroke="${getMenuColor('tertiary')}" stroke-width="1"/>
    <text x="55" y="${height - 22}" font-family="Arial, sans-serif" font-size="10" 
          font-weight="bold" fill="${getMenuColor('tertiary')}" text-anchor="middle">MENU</text>
    
    <!-- Click overlay -->
    ${onClick ? `<rect x="0" y="0" width="${width}" height="${height}" 
                        fill="transparent" style="cursor: pointer;"/>` : ''}
  `;

  if (onClick) {
    svg.addEventListener('click', () => onClick(menuCatalog));
  }

  return svg;
}

/**
 * Create a detailed menu structure display
 * @param {Object} menuCatalog - Menu catalog with structure
 * @param {Object} config - Configuration options
 * @returns {SVGElement} Menu structure display
 */
function createMenuStructureDisplay(menuCatalog, config = {}) {
  const {
    width = 600,
    showPrices = true,
    expandable = true,
    onItemClick = null
  } = config;

  let currentY = 30;
  const elements = [];

  // Title
  elements.push(`
    <text x="20" y="${currentY}" font-family="Arial, sans-serif" font-size="20" 
          font-weight="bold" fill="${getMenuColor('primary')}">${menuCatalog.title || 'Menu'}</text>
  `);
  currentY += 40;

  // Render each menu section
  if (menuCatalog.menus) {
    Object.entries(menuCatalog.menus).forEach(([menuKey, menu]) => {
      // Section header
      elements.push(`
        <rect x="20" y="${currentY - 15}" width="${width - 40}" height="30" 
              rx="8" fill="${getMenuColor('primary')}" fill-opacity="0.1" 
              stroke="${getMenuColor('primary')}" stroke-width="1"/>
        <text x="30" y="${currentY + 5}" font-family="Arial, sans-serif" font-size="16" 
              font-weight="bold" fill="${getMenuColor('primary')}">${menu.title}</text>
      `);
      currentY += 40;

      // Direct products in this menu
      if (menu.products && menu.products.length > 0) {
        menu.products.forEach(productId => {
          const product = menuCatalog.products.find(p => p.id === productId);
          if (product) {
            elements.push(createMenuItemElement(product, 40, currentY, showPrices, onItemClick));
            currentY += 35;
          }
        });
      }

      // Submenus
      if (menu.submenus) {
        Object.entries(menu.submenus).forEach(([submenuKey, submenu]) => {
          // Submenu header
          elements.push(`
            <text x="40" y="${currentY}" font-family="Arial, sans-serif" font-size="14" 
                  font-weight="bold" fill="${getMenuColor('secondary')}">${submenu.title}</text>
          `);
          currentY += 25;

          // Submenu products
          if (submenu.products && submenu.products.length > 0) {
            submenu.products.forEach(productId => {
              const product = menuCatalog.products.find(p => p.id === productId);
              if (product) {
                elements.push(createMenuItemElement(product, 60, currentY, showPrices, onItemClick));
                currentY += 30;
              }
            });
          }
          currentY += 10; // Extra space after submenu
        });
      }

      currentY += 20; // Extra space after menu section
    });
  }

  const totalHeight = Math.max(currentY + 20, 200);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', totalHeight);

  const bgGradientId = `menuBg_${Math.random().toString(36).substr(2,9)}`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="${bgGradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${getMenuColor('primary')}" stop-opacity="0.02"/>
        <stop offset="100%" stop-color="${getMenuColor('secondary')}" stop-opacity="0.01"/>
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect x="0" y="0" width="${width}" height="${totalHeight}" 
          fill="url(#${bgGradientId})" stroke="${getMenuColor('inactive')}" stroke-width="1" rx="8"/>
    
    ${elements.join('')}
  `;

  return svg;
}

/**
 * Create a menu item element for structure display
 * @param {Object} product - Product data
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {boolean} showPrice - Whether to show price
 * @param {Function} onClick - Click handler
 * @returns {string} SVG markup for menu item
 */
function createMenuItemElement(product, x, y, showPrice, onClick) {
  const itemId = `menu-item-${product.id}`;
  const price = showPrice && product.price ? `$${(product.price / 100).toFixed(2)}` : '';

  return `
    <g id="${itemId}" ${onClick ? 'style="cursor: pointer;"' : ''}>
      <!-- Item background (hover effect) -->
      <rect x="${x - 5}" y="${y - 12}" width="500" height="25" 
            rx="4" fill="transparent" class="menu-item-hover"/>
      
      <!-- Item bullet -->
      <circle cx="${x + 5}" cy="${y - 2}" r="3" fill="${getMenuColor('tertiary')}"/>
      
      <!-- Item name -->
      <text x="${x + 15}" y="${y + 3}" font-family="Arial, sans-serif" font-size="12" 
            fill="${getMenuColor('text')}">${product.name}</text>
      
      <!-- Price -->
      ${price ? `
        <text x="520" y="${y + 3}" font-family="Arial, sans-serif" font-size="12" 
              font-weight="bold" fill="${getMenuColor('secondary')}" text-anchor="end">${price}</text>
      ` : ''}
      
      ${onClick ? `
        <rect x="${x - 5}" y="${y - 12}" width="500" height="25" 
              fill="transparent" onclick="handleMenuItemClick('${product.id}')"/>
      ` : ''}
    </g>
  `;
}

/**
 * Create a compact menu preview for product cards
 * @param {Object} menuCatalog - Menu catalog
 * @param {Object} config - Configuration
 * @returns {SVGElement} Menu preview
 */
function createMenuPreview(menuCatalog, config = {}) {
  const {
    width = 200,
    height = 150,
    maxItems = 5
  } = config;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  let itemCount = 0;
  const items = [];

  // Extract first few items for preview
  if (menuCatalog.menus) {
    Object.values(menuCatalog.menus).forEach(menu => {
      if (itemCount >= maxItems) return;

      if (menu.products) {
        menu.products.forEach(productId => {
          if (itemCount >= maxItems) return;
          const product = menuCatalog.products.find(p => p.id === productId);
          if (product) {
            items.push(product);
            itemCount++;
          }
        });
      }

      if (menu.submenus) {
        Object.values(menu.submenus).forEach(submenu => {
          if (itemCount >= maxItems) return;
          if (submenu.products) {
            submenu.products.forEach(productId => {
              if (itemCount >= maxItems) return;
              const product = menuCatalog.products.find(p => p.id === productId);
              if (product) {
                items.push(product);
                itemCount++;
              }
            });
          }
        });
      }
    });
  }

  const itemElements = items.map((item, index) => {
    const y = 25 + (index * 20);
    const price = item.price ? `$${(item.price / 100).toFixed(2)}` : '';
    return `
      <circle cx="15" cy="${y}" r="2" fill="${getMenuColor('tertiary')}"/>
      <text x="25" y="${y + 4}" font-family="Arial, sans-serif" font-size="10" 
            fill="${getMenuColor('text')}">${item.name.substring(0, 20)}${item.name.length > 20 ? '...' : ''}</text>
      ${price ? `
        <text x="${width - 10}" y="${y + 4}" font-family="Arial, sans-serif" font-size="10" 
              fill="${getMenuColor('secondary')}" text-anchor="end">${price}</text>
      ` : ''}
    `;
  }).join('');

  const remainingCount = (menuCatalog.metadata?.totalProducts || 0) - items.length;

  svg.innerHTML = `
    <!-- Background -->
    <rect x="5" y="5" width="${width - 10}" height="${height - 10}" 
          rx="8" fill="${getMenuColor('primary')}" fill-opacity="0.05" 
          stroke="${getMenuColor('inactive')}" stroke-width="1"/>
    
    <!-- Title -->
    <text x="10" y="20" font-family="Arial, sans-serif" font-size="12" 
          font-weight="bold" fill="${getMenuColor('primary')}">Menu Preview</text>
    
    <!-- Items -->
    ${itemElements}
    
    <!-- More items indicator -->
    ${remainingCount > 0 ? `
      <text x="25" y="${25 + (items.length * 20)}" font-family="Arial, sans-serif" font-size="10" 
            fill="${getMenuColor('inactive')}" font-style="italic">+${remainingCount} more items...</text>
    ` : ''}
  `;

  return svg;
}

/**
 * Create an interactive menu ordering interface
 * @param {Object} menuCatalog - Menu catalog
 * @param {Object} config - Configuration
 * @returns {SVGElement} Interactive menu
 */
function createInteractiveMenu(menuCatalog, config = {}) {
  const {
    width = 700,
    onOrderUpdate = null,
    allowQuantities = true,
    showTotal = true
  } = config;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('viewBox', `0 0 ${width} 400`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', 400);

  svg.innerHTML = `
    <!-- Background -->
    <rect x="10" y="10" width="${width - 20}" height="380" 
          rx="12" fill="${getMenuColor('primary')}" fill-opacity="0.02" 
          stroke="${getMenuColor('primary')}" stroke-width="2"/>
    
    <!-- Title -->
    <text x="30" y="40" font-family="Arial, sans-serif" font-size="18" 
          font-weight="bold" fill="${getMenuColor('primary')}">${menuCatalog.title}</text>
    
    <!-- Interactive menu notice -->
    <text x="30" y="70" font-family="Arial, sans-serif" font-size="12" 
          fill="${getMenuColor('inactive')}">Interactive ordering interface would appear here</text>
    
    <!-- Order button placeholder -->
    <rect x="30" y="340" width="120" height="35" rx="18" 
          fill="${getMenuColor('secondary')}" style="cursor: pointer;"/>
    <text x="90" y="360" font-family="Arial, sans-serif" font-size="14" 
          font-weight="bold" fill="white" text-anchor="middle">Order Now</text>
  `;

  return svg;
}

// Handle menu item clicks (global function for SVG onclick)
if (typeof window !== 'undefined') {
  window.handleMenuItemClick = function(productId) {
    console.log('Menu item clicked:', productId);
    // This would be implemented by the consuming app
    if (window.onMenuItemClick) {
      window.onMenuItemClick(productId);
    }
  };

  // Export functions for global use
  window.MenuDisplay = {
    createMenuCatalogCard,
    createMenuStructureDisplay,
    createMenuPreview,
    createInteractiveMenu,
    getMenuColor
  };
}

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createMenuCatalogCard,
    createMenuStructureDisplay,
    createMenuPreview,
    createInteractiveMenu,
    getMenuColor
  };
}

console.log('🍽️ Shared Menu Display Components loaded');