/**
 * Shared Menu Utilities
 * 
 * Handles menu catalog processing, reconstruction, and display
 * across all Nullary applications.
 */

/**
 * Parse CSV content and convert to menu tree structure
 * @param {string} csvContent - Raw CSV content
 * @returns {Object} Menu tree structure with catalog metadata
 */
function parseCSVToMenuTree(csvContent) {
  try {
    console.log('🍽️ Parsing CSV content to menu tree...');
    
    const lines = csvContent.trim().split('\n');
    const catalog = {
      title: '',
      menus: {},
      products: [],
      metadata: {
        totalProducts: 0,
        menuCount: 0,
        createdAt: new Date().toISOString()
      }
    };

    // Skip header if it exists (detect by checking if first row has "rider", "time span", etc.)
    const startIndex = lines[0].toLowerCase().includes('rider') || 
                     lines[0].toLowerCase().includes('time') || 
                     lines[0].toLowerCase().includes('product') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      
      // Skip empty rows
      if (columns.every(col => !col.trim())) continue;

      const result = parseMenuRow(columns);
      if (result) {
        addToMenuTree(catalog, result);
      }
    }

    // Calculate metadata
    catalog.metadata.totalProducts = catalog.products.length;
    catalog.metadata.menuCount = Object.keys(catalog.menus).length;

    console.log(`✅ Parsed ${catalog.metadata.totalProducts} products across ${catalog.metadata.menuCount} menus`);
    
    return catalog;
    
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

/**
 * Parse a single CSV line, handling quoted values and commas
 * @param {string} line - Single CSV line
 * @returns {Array} Array of column values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parse a single menu row to extract hierarchy and product info
 * @param {Array} columns - CSV columns for this row
 * @returns {Object|null} Parsed row data or null if invalid
 */
function parseMenuRow(columns) {
  // Expected format: [empty, rider_type, time_span, product_name, price, additional_cols...]
  if (columns.length < 4) {
    console.warn('⚠️ Skipping row with insufficient columns:', columns);
    return null;
  }

  const [, riderType, timeSpan, productName, price, ...additionalCols] = columns;

  // Must have product name to be valid
  if (!productName?.trim()) {
    return null;
  }

  // Parse price (remove currency symbols, convert to cents)
  let priceInCents = 0;
  if (price?.trim()) {
    const cleanPrice = price.replace(/[$,]/g, '');
    const numPrice = parseFloat(cleanPrice);
    if (!isNaN(numPrice)) {
      priceInCents = Math.round(numPrice * 100); // Convert to cents
    }
  }

  return {
    riderType: riderType?.trim() || '',
    timeSpan: timeSpan?.trim() || '',
    productName: productName.trim(),
    price: priceInCents,
    additionalData: additionalCols.filter(col => col?.trim())
  };
}

/**
 * Add parsed row data to the menu tree structure
 * @param {Object} catalog - The catalog object to modify
 * @param {Object} rowData - Parsed row data
 */
function addToMenuTree(catalog, rowData) {
  const { riderType, timeSpan, productName, price, additionalData } = rowData;

  // Create product object
  const product = {
    id: generateProductId(productName),
    name: productName,
    price: price,
    category: 'menu-item',
    metadata: {
      riderType: riderType,
      timeSpan: timeSpan,
      additionalData: additionalData
    }
  };

  // Add to products array
  catalog.products.push(product);

  // Build menu hierarchy
  if (riderType) {
    // Initialize rider type menu if it doesn't exist
    if (!catalog.menus[riderType]) {
      catalog.menus[riderType] = {
        title: riderType,
        submenus: {},
        products: []
      };
    }

    if (timeSpan) {
      // Initialize time span submenu if it doesn't exist
      if (!catalog.menus[riderType].submenus[timeSpan]) {
        catalog.menus[riderType].submenus[timeSpan] = {
          title: timeSpan,
          products: []
        };
      }
      
      // Add product to time span submenu
      catalog.menus[riderType].submenus[timeSpan].products.push(product.id);
    } else {
      // Add product directly to rider type menu
      catalog.menus[riderType].products.push(product.id);
    }
  } else {
    // Create a default menu for products without categories
    if (!catalog.menus['uncategorized']) {
      catalog.menus['uncategorized'] = {
        title: 'Other Items',
        submenus: {},
        products: []
      };
    }
    catalog.menus['uncategorized'].products.push(product.id);
  }
}

/**
 * Generate a unique product ID from the product name
 * @param {string} productName - The product name
 * @returns {string} Unique product ID
 */
function generateProductId(productName) {
  return 'menu_' + productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + 
    '_' + Date.now().toString(36);
}

/**
 * Validate menu tree structure
 * @param {Object} catalog - The catalog object to validate
 * @returns {Object} Validation result with success flag and errors
 */
function validateMenuTree(catalog) {
  const errors = [];
  const warnings = [];

  try {
    // Check required structure
    if (!catalog.title && !catalog.menus) {
      errors.push('Catalog must have either a title or menus');
    }

    if (!catalog.products || !Array.isArray(catalog.products)) {
      errors.push('Catalog must have a products array');
    }

    if (!catalog.menus || typeof catalog.menus !== 'object') {
      errors.push('Catalog must have a menus object');
    }

    // Validate products
    if (catalog.products) {
      catalog.products.forEach((product, index) => {
        if (!product.id) {
          errors.push(`Product at index ${index} missing ID`);
        }
        if (!product.name) {
          errors.push(`Product at index ${index} missing name`);
        }
        if (typeof product.price !== 'number' || product.price < 0) {
          warnings.push(`Product "${product.name}" has invalid price: ${product.price}`);
        }
      });
    }

    // Validate menu structure
    if (catalog.menus) {
      Object.entries(catalog.menus).forEach(([menuKey, menu]) => {
        if (!menu.title) {
          warnings.push(`Menu "${menuKey}" missing title`);
        }
        
        if (!menu.products || !Array.isArray(menu.products)) {
          warnings.push(`Menu "${menuKey}" missing products array`);
        }

        // Check if referenced products exist
        if (menu.products) {
          menu.products.forEach(productId => {
            const productExists = catalog.products.some(p => p.id === productId);
            if (!productExists) {
              errors.push(`Menu "${menuKey}" references non-existent product ID: ${productId}`);
            }
          });
        }

        // Validate submenus
        if (menu.submenus) {
          Object.entries(menu.submenus).forEach(([submenuKey, submenu]) => {
            if (!submenu.title) {
              warnings.push(`Submenu "${menuKey}.${submenuKey}" missing title`);
            }
            
            if (submenu.products) {
              submenu.products.forEach(productId => {
                const productExists = catalog.products.some(p => p.id === productId);
                if (!productExists) {
                  errors.push(`Submenu "${menuKey}.${submenuKey}" references non-existent product ID: ${productId}`);
                }
              });
            }
          });
        }
      });
    }

    const isValid = errors.length === 0;
    
    if (isValid) {
      console.log('✅ Menu tree validation passed');
      if (warnings.length > 0) {
        console.warn('⚠️ Validation warnings:', warnings);
      }
    } else {
      console.error('❌ Menu tree validation failed:', errors);
    }

    return {
      isValid,
      errors,
      warnings,
      stats: {
        totalProducts: catalog.products?.length || 0,
        totalMenus: Object.keys(catalog.menus || {}).length,
        totalSubmenus: Object.values(catalog.menus || {})
          .reduce((count, menu) => count + Object.keys(menu.submenus || {}).length, 0)
      }
    };

  } catch (error) {
    console.error('❌ Error during menu tree validation:', error);
    return {
      isValid: false,
      errors: [`Validation error: ${error.message}`],
      warnings: [],
      stats: { totalProducts: 0, totalMenus: 0, totalSubmenus: 0 }
    };
  }
}

/**
 * Convert menu tree back to CSV format
 * @param {Object} catalog - The catalog object
 * @returns {string} CSV content
 */
function menuTreeToCSV(catalog) {
  const lines = [];
  
  // Add header
  lines.push(',rider,time span,product,price');
  
  // Process each menu
  Object.entries(catalog.menus || {}).forEach(([menuKey, menu]) => {
    if (menu.products && menu.products.length > 0) {
      // Direct products in main menu
      menu.products.forEach(productId => {
        const product = catalog.products.find(p => p.id === productId);
        if (product) {
          const price = (product.price / 100).toFixed(2);
          lines.push(`,${menuKey},,${product.name},${price}`);
        }
      });
    }

    // Submenu products
    Object.entries(menu.submenus || {}).forEach(([submenuKey, submenu]) => {
      if (submenu.products && submenu.products.length > 0) {
        submenu.products.forEach(productId => {
          const product = catalog.products.find(p => p.id === productId);
          if (product) {
            const price = (product.price / 100).toFixed(2);
            lines.push(`,${menuKey},${submenuKey},${product.name},${price}`);
          }
        });
      }
    });
  });

  return lines.join('\n');
}

/**
 * Detect if products belong to a menu catalog
 * @param {Array} products - Array of products
 * @returns {Object} Detection result with menu products and regular products
 */
function detectMenuProducts(products) {
  const menuProducts = [];
  const regularProducts = [];
  const menuCatalogs = new Map();

  products.forEach(product => {
    if (product.category === 'menu-item' && product.metadata?.menuCatalogId) {
      menuProducts.push(product);
      
      const catalogId = product.metadata.menuCatalogId;
      if (!menuCatalogs.has(catalogId)) {
        menuCatalogs.set(catalogId, []);
      }
      menuCatalogs.get(catalogId).push(product);
    } else if (product.category === 'menu' && product.metadata?.menuStructure) {
      // This is a menu catalog product itself
      menuCatalogs.set(product.id, {
        catalog: product,
        structure: product.metadata.menuStructure
      });
    } else {
      regularProducts.push(product);
    }
  });

  return {
    menuProducts,
    regularProducts,
    menuCatalogs,
    hasMenus: menuCatalogs.size > 0
  };
}

/**
 * Reconstruct menu from individual products and BDO structure
 * @param {Array} menuItems - Individual menu item products
 * @param {Object} menuStructure - BDO-stored menu structure
 * @returns {Object} Reconstructed menu catalog
 */
function reconstructMenu(menuItems, menuStructure) {
  try {
    const catalog = {
      ...menuStructure,
      products: menuItems
    };

    // Update product references in menu structure to use actual product data
    if (catalog.menus) {
      Object.values(catalog.menus).forEach(menu => {
        if (menu.products) {
          menu.products = menu.products.map(productId => {
            const item = menuItems.find(p => p.id === productId || p.metadata?.originalId === productId);
            return item ? item.id : productId;
          });
        }

        if (menu.submenus) {
          Object.values(menu.submenus).forEach(submenu => {
            if (submenu.products) {
              submenu.products = submenu.products.map(productId => {
                const item = menuItems.find(p => p.id === productId || p.metadata?.originalId === productId);
                return item ? item.id : productId;
              });
            }
          });
        }
      });
    }

    return catalog;
  } catch (error) {
    console.error('❌ Error reconstructing menu:', error);
    return null;
  }
}

/**
 * Create a sample menu tree for testing
 * @returns {Object} Sample catalog
 */
function createSampleMenuTree() {
  return {
    title: 'Sample Transit Pass Catalog',
    menus: {
      adult: {
        title: 'Adult Passes',
        submenus: {
          'two-hour': {
            title: 'Two Hour Pass',
            products: ['menu_adult_two_hour_250_abc123']
          },
          day: {
            title: 'Day Pass',
            products: ['menu_adult_day_500_def456']
          },
          month: {
            title: 'Monthly Pass',
            products: ['menu_adult_month_10000_ghi789']
          }
        },
        products: []
      },
      youth: {
        title: 'Youth Passes',
        submenus: {
          'two-hour': {
            title: 'Two Hour Pass',
            products: ['menu_youth_two_hour_100_jkl012']
          },
          day: {
            title: 'Day Pass',
            products: ['menu_youth_day_200_mno345']
          },
          month: {
            title: 'Monthly Pass',
            products: ['menu_youth_month_2000_pqr678']
          }
        },
        products: []
      }
    },
    products: [
      { id: 'menu_adult_two_hour_250_abc123', name: 'adult two-hour 250', price: 250, category: 'menu-item', metadata: { riderType: 'adult', timeSpan: 'two-hour' } },
      { id: 'menu_adult_day_500_def456', name: 'adult day 500', price: 500, category: 'menu-item', metadata: { riderType: 'adult', timeSpan: 'day' } },
      { id: 'menu_adult_month_10000_ghi789', name: 'adult month 10000', price: 10000, category: 'menu-item', metadata: { riderType: 'adult', timeSpan: 'month' } },
      { id: 'menu_youth_two_hour_100_jkl012', name: 'youth two-hour 100', price: 100, category: 'menu-item', metadata: { riderType: 'youth', timeSpan: 'two-hour' } },
      { id: 'menu_youth_day_200_mno345', name: 'youth day 200', price: 200, category: 'menu-item', metadata: { riderType: 'youth', timeSpan: 'day' } },
      { id: 'menu_youth_month_2000_pqr678', name: 'youth month 2000', price: 2000, category: 'menu-item', metadata: { riderType: 'youth', timeSpan: 'month' } }
    ],
    metadata: {
      totalProducts: 6,
      menuCount: 2,
      createdAt: new Date().toISOString()
    }
  };
}

// Export for use in applications
if (typeof window !== 'undefined') {
  window.MenuUtils = {
    parseCSVToMenuTree,
    validateMenuTree,
    menuTreeToCSV,
    createSampleMenuTree,
    detectMenuProducts,
    reconstructMenu
  };
}

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSVToMenuTree,
    validateMenuTree,
    menuTreeToCSV,
    createSampleMenuTree,
    detectMenuProducts,
    reconstructMenu
  };
}

console.log('🍽️ Shared Menu Utils loaded');