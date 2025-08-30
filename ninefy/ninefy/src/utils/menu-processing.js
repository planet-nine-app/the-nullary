/**
 * Menu Processing Utilities
 * 
 * Handles menu tree to magistack conversion, card generation coordination,
 * and BDO upload orchestration for Ninefy menu catalog products.
 */

/**
 * Process a complete menu catalog product from form data to BDO storage
 * @param {Object} productData - Form data containing menu information
 * @param {string} userUuid - User UUID for authentication
 * @param {string} sanoraUrl - Sanora service URL
 * @returns {Object} Processing result with success status and details
 */
async function processMenuCatalogProduct(productData, userUuid, sanoraUrl) {
  console.log('🍽️ Starting menu catalog processing...');
  
  try {
    // Extract form data
    const menuTitle = productData.formData['Menu Title'] || 'Untitled Menu';
    const menuDescription = productData.formData['Menu Description'] || '';
    const menuType = productData.formData['Menu Type'] || 'restaurant';
    
    // Step 1: Parse menu data from file
    const menuTree = await parseMenuDataFromForm(productData);
    console.log('✅ Menu tree parsed successfully');
    
    // Step 2: Generate magistack cards
    const { cards, cardErrors, nestedCatalog } = await generateMagistackCards(menuTree, menuTitle);
    console.log(`✅ Generated ${cards.length} cards (${cardErrors.length} errors)`);
    
    // Step 3: Upload cards to BDO with unique keys
    const { uploadedCards, bdoPubKey } = await uploadCardsToStorage(cards, menuTitle, userUuid);
    console.log(`✅ Uploaded ${uploadedCards.length} cards to BDO`);
    
    // Step 4: Create master catalog in Sanora and BDO
    const catalogResult = await createMasterCatalog(menuTree, menuTitle, menuDescription, menuType, uploadedCards, bdoPubKey, userUuid, sanoraUrl);
    console.log('✅ Master catalog created');
    
    // Return comprehensive result
    return {
      success: true,
      productType: 'menu',
      title: menuTitle,
      catalogId: catalogResult?.catalogId || 'unknown',
      bdoId: catalogResult?.bdoId || 'unknown',
      bdoPubKey: bdoPubKey,
      firstCardBdoPubKey: uploadedCards.length > 0 ? uploadedCards[0].cardBdoPubKey : null,
      menuStats: {
        totalProducts: menuTree.products.length,
        totalCards: uploadedCards.length,
        failedCards: cardErrors.length
      },
      cardResults: {
        successful: uploadedCards.length,
        failed: cardErrors.length,
        details: {
          created: uploadedCards,
          errors: cardErrors
        }
      },
      catalogData: catalogResult?.catalogForBDO
    };
    
  } catch (error) {
    console.error('❌ Menu catalog processing failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

/**
 * Parse menu data from form file input
 * @param {Object} productData - Form data containing file
 * @returns {Object} Parsed menu tree structure
 */
async function parseMenuDataFromForm(productData) {
  // Get CSV/JSON data from form data (catalog field)
  let menuData = '';
  if (productData.formData && productData.formData['CSV or JSON File']) {
    const catalogFile = productData.formData['CSV or JSON File'];
    console.log('📁 CSV/JSON catalog file detected:', catalogFile);
    
    // Read file content
    if (catalogFile.file) {
      try {
        menuData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(catalogFile.file);
        });
        console.log('📄 File content loaded, length:', menuData.length);
      } catch (error) {
        console.error('❌ Error reading catalog file:', error);
        throw new Error('Failed to read catalog file content');
      }
    }
  }
  
  if (!menuData.trim()) {
    throw new Error('Menu data is required');
  }
  
  // Parse based on format
  const isJson = menuData.trim().startsWith('{') || menuData.trim().startsWith('[');
  
  let menuTree;
  if (isJson) {
    console.log('📄 Parsing JSON menu data...');
    try {
      menuTree = JSON.parse(menuData);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  } else {
    console.log('📊 Parsing CSV menu data...');
    menuTree = window.MenuCatalogUtils.parseCSVToMenuTree(menuData);
  }
  
  // Validate menu structure
  const validation = window.MenuCatalogUtils.validateMenuTree(menuTree);
  if (!validation.isValid) {
    throw new Error(`Menu validation failed: ${validation.errors.join(', ')}`);
  }
  
  console.log('📊 Menu stats:', validation.stats);
  return menuTree;
}

/**
 * Generate all magistack cards from menu tree
 * @param {Object} menuTree - Parsed menu tree structure
 * @param {string} menuTitle - Menu title for card headers
 * @returns {Object} Generated cards and errors
 */
async function generateMagistackCards(menuTree, menuTitle) {
  console.log('🎨 Creating SVG cards for menu items...');
  const createdCards = [];
  const cardErrors = [];
  
  // Create nested catalog structure for lookup spell
  console.log('🗺️ Creating nested catalog structure for lookup spell...');
  const nestedCatalog = createNestedCatalogFromProducts(menuTree.products);
  console.log('🗺️ Generated nested catalog:', nestedCatalog);
  
  // Create comprehensive list of all cards needed
  const allCardsNeeded = [];
  
  // Extract menu headers in proper order
  const menuHeaders = menuTree.menuHeaders || Object.keys(menuTree.menus).map(menuLevel => ({ name: menuLevel }));
  console.log(`📋 Found menu levels in order: ${menuHeaders.map(h => h.name).join(', ')}`);
  
  // Create menu selector cards for each level
  for (let i = 0; i < menuHeaders.length; i++) {
    const menuLevel = menuHeaders[i].name;
    const menuOptions = Object.keys(menuTree.menus[menuLevel]);
    
    const menuSelectorCard = {
      type: 'menu-selector',
      level: menuLevel,
      name: `Select ${menuLevel}`,
      isMenu: true,
      isSelector: true,
      options: menuOptions,
      menuData: {
        level: i,
        menuLevel: menuLevel,
        title: `Choose ${menuLevel}`,
        options: menuOptions.map(opt => ({
          name: opt,
          data: menuTree.menus[menuLevel][opt]
        }))
      }
    };
    
    allCardsNeeded.push(menuSelectorCard);
    console.log(`🗂️ Added menu selector: ${menuSelectorCard.name}`);
  }
  
  // Add product cards
  console.log('🛍️ Adding product cards...');
  for (const product of menuTree.products) {
    allCardsNeeded.push({
      type: 'product',
      name: product.name,
      isMenu: false,
      price: product.price,
      productData: product
    });
  }
  
  console.log(`🎯 Total cards needed: ${allCardsNeeded.length} (${menuHeaders.length} selectors + ${menuTree.products.length} products)`);
  
  // Generate cards using card generation utilities
  const { cards, errors } = await window.CardGeneration.generateAllCards(
    allCardsNeeded, 
    menuTitle, 
    menuTree, 
    nestedCatalog
  );
  
  return {
    cards,
    cardErrors: errors,
    nestedCatalog,
    allCardsNeeded
  };
}

/**
 * Create nested catalog structure for lookup spell from products array
 * Converts products like "adult two-hour $250" to nested map: {"adult": {"two-hour": {productId, bdoPubKey, ...}}}
 */
function createNestedCatalogFromProducts(products) {
  console.log('🗺️ Converting products to nested catalog map for lookup spell:', products.length);
  
  const catalogMap = {};
  
  for (const product of products) {
    // Parse product name to extract decision tree path
    const productName = product.name || '';
    const parts = productName.split(' ');
    
    if (parts.length >= 2) {
      let rider, timeSpan;
      
      // Handle different naming patterns
      if (parts.length === 3 && parts[2].startsWith('$')) {
        // Format: "adult two-hour $250"
        rider = parts[0];
        timeSpan = parts[1];
      } else if (parts.length >= 2) {
        // More complex parsing - find price indicator
        const priceIndex = parts.findIndex(part => part.startsWith('$'));
        if (priceIndex > 0) {
          rider = parts[0];
          timeSpan = parts.slice(1, priceIndex).join('-');
        } else {
          // No price found, assume first two parts are the path
          rider = parts[0];
          timeSpan = parts[1];
        }
      }
      
      if (rider && timeSpan) {
        // Ensure nested structure exists
        if (!catalogMap[rider]) {
          catalogMap[rider] = {};
        }
        
        // Store product data with both productId and bdoPubKey for navigation
        catalogMap[rider][timeSpan] = {
          productId: product.id,
          bdoPubKey: product.cardBdoPubKey, // Points to the product card for navigation
          price: product.price,
          name: product.name
        };
        
        console.log(`🗺️ Mapped "${rider}" -> "${timeSpan}" -> productId: ${product.id}`);
      }
    } else {
      console.warn(`⚠️ Could not parse product name into decision tree path: "${productName}"`);
    }
  }
  
  console.log('🗺️ Final nested catalog structure:', catalogMap);
  return catalogMap;
}

// Export for use in main application
window.MenuProcessing = {
  processMenuCatalogProduct,
  parseMenuDataFromForm,
  generateMagistackCards,
  createNestedCatalogFromProducts
};

console.log('🍽️ Menu Processing utilities loaded');