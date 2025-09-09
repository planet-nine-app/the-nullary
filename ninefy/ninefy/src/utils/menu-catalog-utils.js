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

      console.log(`🔍 Processing CSV row ${i}: [${columns.join(', ')}]`);
      const result = parseHierarchicalRow(columns, menuHeaders, productColumnIndex);
      if (result) {
        console.log(`🔍 Row ${i} parsed result:`, result);
        addToHierarchicalMenuTree(catalog, result, menuHeaders);
      } else {
        console.log(`⚠️ Row ${i} returned null result`);
      }
    }

    // Build decision tree for direct property lookup (json.adult.day)
    catalog.decisionTree = buildDecisionTree(catalog.products, menuHeaders);

    // Calculate metadata
    catalog.metadata.totalProducts = catalog.products.length;
    catalog.metadata.menuCount = Object.keys(catalog.menus).length;

    // Store the original menuHeaders order for proper navigation
    catalog.menuHeaders = menuHeaders;

    console.log(`✅ Parsed ${catalog.metadata.totalProducts} products across ${catalog.metadata.menuCount} menu levels`);
    console.log('🗂️ Menu structure:', JSON.stringify(catalog.menus, null, 2));
    console.log('🌳 Decision tree:', JSON.stringify(catalog.decisionTree, null, 2));
    
    // Debug menu structure keys for each level
    console.log('🔍 DEBUGGING MENU STRUCTURE:');
    for (const header of menuHeaders) {
      const menuLevel = header.name;
      const options = Object.keys(catalog.menus[menuLevel] || {});
      console.log(`🔍   ${menuLevel}: [${options.join(', ')}] (${options.length} options)`);
    }
    
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
  
  // Parse price (keep as dollars, don't convert to cents)
  let price = 0;
  const cleanPrice = priceStr.replace(/[$,]/g, '');
  const numericPrice = parseFloat(cleanPrice);
  if (!isNaN(numericPrice)) {
    price = numericPrice;
  }

  // Generate product name from selections (replace "any" with wildcard indicator)
  const displaySelections = selections.map(s => s === 'any' ? '*' : s);
  const productName = displaySelections.join(' ') + ` $${price}`;
  
  // Generate unique product ID (use original selections including "any")
  const productId = `menu_${selections.join('_')}_${price}_${generateRandomId()}`;

  return {
    selections,
    productName,
    price: price,
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

  // Process menu structure building from explicit menu columns
  if (hasMenuData) {
    buildMenuStructure(catalog, menuSelections, menuHeaders);
  }

  // Process product data and build menu structure from product selections
  if (hasProductData && productData) {
    // Build menu structure from product selections
    buildMenuStructureFromProductSelections(catalog, productData, menuHeaders);

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
 * Build menu structure from product selections (e.g. "adult+two-hour" creates both rider and time span menus)
 * @param {Object} catalog - The catalog object to modify
 * @param {Object} productData - Parsed product data with selections array
 * @param {Array} menuHeaders - Menu header information (e.g., [{name: "rider", index: 1}, {name: "time span", index: 2}])
 */
function buildMenuStructureFromProductSelections(catalog, productData, menuHeaders) {
  const { selections } = productData;
  
  // Map product selections to menu headers based on position
  // E.g., "adult+two-hour$250" -> selections: ["adult", "two-hour"]
  // menuHeaders: [{name: "rider", index: 1}, {name: "time span", index: 2}]
  // Result: rider="adult", time span="two-hour"
  
  console.log(`🔗 Building menu structure from product selections: [${selections.join(', ')}]`);
  
  for (let i = 0; i < menuHeaders.length && i < selections.length; i++) {
    const currentHeader = menuHeaders[i];
    const nextHeader = menuHeaders[i + 1];
    const headerName = currentHeader.name;
    const selection = selections[i];

    if (!selection || selection === 'any') continue;

    console.log(`📋 Processing menu level "${headerName}" with selection "${selection}"`);

    // Initialize menu if it doesn't exist
    if (!catalog.menus[headerName]) {
      catalog.menus[headerName] = {};
      console.log(`🆕 Created new menu level: ${headerName}`);
    }

    // Add the selection to this menu level
    if (!catalog.menus[headerName][selection]) {
      if (nextHeader && i + 1 < selections.length) {
        // Has next level - point to next menu
        catalog.menus[headerName][selection] = {
          subMenu: nextHeader.name
        };
        console.log(`🔗 ${headerName}["${selection}"] -> points to next menu: ${nextHeader.name}`);
      } else {
        // Last level - point to product
        catalog.menus[headerName][selection] = {
          subMenu: 'product'
        };
        console.log(`🛍️ ${headerName}["${selection}"] -> points to product`);
      }
    }
  }
}

/**
 * Build decision tree for direct property lookup (e.g., json.adult.day)
 * @param {Array} products - Array of product objects with selections
 * @param {Array} menuHeaders - Menu header information for ordering
 * @returns {Object} Decision tree object
 */
function buildDecisionTree(products, menuHeaders) {
  const tree = {};
  
  console.log('🌳 Building decision tree from products:', products.length);
  
  for (const product of products) {
    if (!product.metadata || !product.metadata.selections) {
      console.warn('⚠️ Product missing selections metadata:', product);
      continue;
    }
    
    const selections = product.metadata.selections;
    console.log(`🌿 Processing product with selections: [${selections.join(', ')}] -> $${product.price}`);
    
    // Navigate/create the tree structure based on selections
    let currentLevel = tree;
    
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      
      if (i === selections.length - 1) {
        // Last selection - store the product
        currentLevel[selection] = {
          product: product,
          price: product.price,
          productId: product.id,
          productName: product.name,
          selections: selections,
          // Add selection components for fount spell system
          selectionComponents: {
            selections: selections,
            price: product.price,
            productId: product.id,
            productName: product.name
          }
        };
        console.log(`  ✅ Added product at path: ${selections.join('.')}`);
      } else {
        // Intermediate selection - create nested object if needed
        if (!currentLevel[selection]) {
          currentLevel[selection] = {};
        }
        currentLevel = currentLevel[selection];
      }
    }
  }
  
  console.log('🌳 Decision tree built successfully');
  return tree;
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
    title: 'Sample Restaurant Menu Catalog',
    menus: {
      dish: {
        title: 'Dishes',
        submenus: {
          'chilaquiles verdes': {
            title: 'Chilaquiles Verdes',
            products: ['menu_chilaquiles_verdes_scrambled_no_dairy_17_abc123']
          },
          'chilaquiles rojos': {
            title: 'Chilaquiles Rojos', 
            products: ['menu_chilaquiles_rojos_over_medium_ish_no_onion_18_def456']
          },
          'migas': {
            title: 'Migas',
            products: ['menu_migas_scrambled_no_cheese_15_ghi789']
          }
        },
        products: []
      },
      egg: {
        title: 'Egg Preparation',
        submenus: {
          'scrambled': {
            title: 'Scrambled',
            products: ['menu_chilaquiles_verdes_scrambled_no_dairy_17_abc123']
          },
          'over medium-ish': {
            title: 'Over Medium-ish',
            products: ['menu_chilaquiles_rojos_over_medium_ish_no_onion_18_def456']
          },
          'no egg': {
            title: 'No Egg',
            products: ['menu_chilaquiles_encacahuajados_no_egg_no_cilantro_17_jkl012']
          }
        },
        products: []
      },
      exclusions: {
        title: 'Dietary Exclusions',
        submenus: {
          'no dairy': {
            title: 'No Dairy',
            products: ['menu_chilaquiles_verdes_scrambled_no_dairy_17_abc123']
          },
          'no onion': {
            title: 'No Onion',
            products: ['menu_chilaquiles_rojos_over_medium_ish_no_onion_18_def456']
          },
          'no cilantro': {
            title: 'No Cilantro',
            products: ['menu_chilaquiles_encacahuajados_no_egg_no_cilantro_17_jkl012']
          }
        },
        products: []
      }
    },
    products: [
      { id: 'menu_chilaquiles_verdes_scrambled_no_dairy_17_abc123', name: 'chilaquiles verdes scrambled no dairy $17', price: 17, category: 'menu-item', metadata: { dish: 'chilaquiles verdes', egg: 'scrambled', exclusions: 'no dairy' } },
      { id: 'menu_chilaquiles_rojos_over_medium_ish_no_onion_18_def456', name: 'chilaquiles rojos over medium-ish no onion $18', price: 18, category: 'menu-item', metadata: { dish: 'chilaquiles rojos', egg: 'over medium-ish', exclusions: 'no onion' } },
      { id: 'menu_chilaquiles_encacahuajados_no_egg_no_cilantro_17_jkl012', name: 'chilaquiles encacahuajados no egg no cilantro $17', price: 17, category: 'menu-item', metadata: { dish: 'chilaquiles encacahuajados', egg: 'no egg', exclusions: 'no cilantro' } },
      { id: 'menu_migas_scrambled_no_cheese_15_mno345', name: 'migas scrambled no cheese $15', price: 15, category: 'menu-item', metadata: { dish: 'migas', egg: 'scrambled', exclusions: 'no cheese' } }
    ],
    metadata: {
      totalProducts: 4,
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