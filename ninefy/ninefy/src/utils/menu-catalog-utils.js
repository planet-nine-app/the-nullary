/**
 * Menu Catalog Utilities
 * 
 * Handles CSV to JSON transformation and menu tree structure creation
 * for Ninefy menu catalog products.
 */

/**
 * Parse CSV content and convert to menu tree structure
 * @param {string} csvContent - Raw CSV content
 * @returns {Object} Menu tree structure with catalog metadata
 */
function parseCSVToMenuTree(csvContent) {
  try {
    console.log('🍽️ Parsing CSV content with hierarchical menu structure...');
    
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

    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // Parse header row to determine menu structure
    const headerColumns = parseCSVLine(lines[0]);
    const menuHeaders = [];
    let productColumnIndex = -1;

    // Find menu headers and product column
    for (let i = 1; i < headerColumns.length; i++) {
      const header = headerColumns[i].trim();
      if (header.toLowerCase() === 'product') {
        productColumnIndex = i;
        break;
      } else if (header) {
        menuHeaders.push({ name: header, index: i });
      }
    }

    if (menuHeaders.length === 0) {
      throw new Error('No menu headers found. Expected headers like "rider", "time span", etc.');
    }

    if (productColumnIndex === -1) {
      throw new Error('No "product" column found in header');
    }

    console.log(`📋 Found ${menuHeaders.length} menu levels:`, menuHeaders.map(h => h.name));
    console.log(`🛍️ Product column at index ${productColumnIndex}`);

    // Build menu structure from data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      
      // Skip empty rows
      if (columns.every(col => !col.trim())) continue;

      const result = parseHierarchicalRow(columns, menuHeaders, productColumnIndex);
      if (result) {
        addToHierarchicalMenuTree(catalog, result, menuHeaders);
      }
    }

    // Calculate metadata
    catalog.metadata.totalProducts = catalog.products.length;
    catalog.metadata.menuCount = Object.keys(catalog.menus).length;

    console.log(`✅ Parsed ${catalog.metadata.totalProducts} products across ${catalog.metadata.menuCount} menu levels`);
    console.log('🗂️ Menu structure:', JSON.stringify(catalog.menus, null, 2));
    
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
 * Parse a hierarchical menu row to extract menu selections and product info
 * @param {Array} columns - CSV columns for this row
 * @param {Array} menuHeaders - Menu header information
 * @param {number} productColumnIndex - Index of the product column
 * @returns {Object|null} Parsed row data or null if invalid
 */
function parseHierarchicalRow(columns, menuHeaders, productColumnIndex) {
  const menuSelections = {};
  let hasData = false;

  // Extract menu selections from columns
  for (const header of menuHeaders) {
    const value = columns[header.index]?.trim();
    if (value) {
      menuSelections[header.name] = value;
      hasData = true;
    }
  }

  // Extract product data if present
  let productData = null;
  const productValue = columns[productColumnIndex]?.trim();
  if (productValue) {
    productData = parseProductValue(productValue);
    hasData = true;
  }

  if (!hasData) {
    return null;
  }

  return {
    menuSelections,
    productData,
    hasMenuData: Object.keys(menuSelections).length > 0,
    hasProductData: productData !== null
  };
}

/**
 * Parse product value in format: "selection1+selection2+...+selectionN$price"
 * Supports "any" wildcard token for flexible matching
 * @param {string} productValue - Product value string
 * @returns {Object} Parsed product information
 */
function parseProductValue(productValue) {
  // Expected format: "adult+two-hour$250" or "chilaquiles verdes+any+any$17"
  const parts = productValue.split('$');
  if (parts.length !== 2) {
    console.warn('⚠️ Invalid product format, expected "selections$price":', productValue);
    return null;
  }

  const [selectionsStr, priceStr] = parts;
  const selections = selectionsStr.split('+').map(s => s.trim()).filter(s => s);
  
  // Parse price (convert to cents)
  let priceInCents = 0;
  const cleanPrice = priceStr.replace(/[$,]/g, '');
  const numericPrice = parseFloat(cleanPrice);
  if (!isNaN(numericPrice)) {
    priceInCents = Math.round(numericPrice * 100);
  }

  // Generate product name from selections (replace "any" with wildcard indicator)
  const displaySelections = selections.map(s => s === 'any' ? '*' : s);
  const productName = displaySelections.join(' ') + ` ${priceInCents}`;
  
  // Generate unique product ID (use original selections including "any")
  const productId = `menu_${selections.join('_')}_${priceInCents}_${generateRandomId()}`;

  return {
    selections,
    productName,
    price: priceInCents,
    productId,
    originalValue: productValue,
    hasWildcards: selections.includes('any')
  };
}

/**
 * Add parsed row data to the hierarchical menu tree structure
 * @param {Object} catalog - The catalog object to modify
 * @param {Object} rowData - Parsed row data
 * @param {Array} menuHeaders - Menu header information
 */
function addToHierarchicalMenuTree(catalog, rowData, menuHeaders) {
  const { menuSelections, productData, hasMenuData, hasProductData } = rowData;

  // Process menu structure building
  if (hasMenuData) {
    buildMenuStructure(catalog, menuSelections, menuHeaders);
  }

  // Process product data
  if (hasProductData && productData) {
    const product = {
      id: productData.productId,
      name: productData.productName,
      price: productData.price,
      category: 'menu-item',
      metadata: {
        selections: productData.selections,
        originalValue: productData.originalValue
      }
    };

    // Add to products array
    catalog.products.push(product);
  }
}

/**
 * Build the hierarchical menu structure based on headers and selections
 * @param {Object} catalog - The catalog object to modify
 * @param {Object} menuSelections - Selected menu values
 * @param {Array} menuHeaders - Menu header information
 */
function buildMenuStructure(catalog, menuSelections, menuHeaders) {
  // Create menu structure based on headers
  for (let i = 0; i < menuHeaders.length; i++) {
    const currentHeader = menuHeaders[i];
    const nextHeader = menuHeaders[i + 1];
    const headerName = currentHeader.name;
    const selection = menuSelections[headerName];

    if (!selection) continue;

    // Initialize menu if it doesn't exist
    if (!catalog.menus[headerName]) {
      catalog.menus[headerName] = {};
    }

    // Add the selection to this menu level
    if (!catalog.menus[headerName][selection]) {
      if (nextHeader) {
        // Has next level - point to next menu
        catalog.menus[headerName][selection] = {
          subMenu: nextHeader.name
        };
      } else {
        // Last level - point to product
        catalog.menus[headerName][selection] = {
          subMenu: 'product'
        };
      }
    }
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
 * Generate a random ID for uniqueness
 * @returns {string} Random ID
 */
function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
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
      },
      reduced: {
        title: 'Reduced Fare',
        submenus: {
          'two-hour': {
            title: 'Two Hour Pass',
            products: ['menu_reduced_two_hour_150_stu901']
          },
          day: {
            title: 'Day Pass',
            products: ['menu_reduced_day_250_vwx234']
          },
          month: {
            title: 'Monthly Pass',
            products: ['menu_reduced_month_2500_yz567']
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
      { id: 'menu_youth_month_2000_pqr678', name: 'youth month 2000', price: 2000, category: 'menu-item', metadata: { riderType: 'youth', timeSpan: 'month' } },
      { id: 'menu_reduced_two_hour_150_stu901', name: 'reduced two-hour 150', price: 150, category: 'menu-item', metadata: { riderType: 'reduced', timeSpan: 'two-hour' } },
      { id: 'menu_reduced_day_250_vwx234', name: 'reduced day 250', price: 250, category: 'menu-item', metadata: { riderType: 'reduced', timeSpan: 'day' } },
      { id: 'menu_reduced_month_2500_yz567', name: 'reduced month 2500', price: 2500, category: 'menu-item', metadata: { riderType: 'reduced', timeSpan: 'month' } }
    ],
    metadata: {
      totalProducts: 9,
      menuCount: 3,
      createdAt: new Date().toISOString()
    }
  };
}

// Export functions for use in main application
window.MenuCatalogUtils = {
  parseCSVToMenuTree,
  validateMenuTree,
  menuTreeToCSV,
  createSampleMenuTree
};

console.log('🍽️ Menu Catalog Utils loaded');