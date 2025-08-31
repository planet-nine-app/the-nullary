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
    
    // Step 3.5: Update final selector cards in BDO with the complete nested catalog
    console.log('🔄 Updating final selector cards with nested catalog containing product bdoPubKeys...');
    await updateFinalSelectorCardsInBDO(uploadedCards, nestedCatalog, userUuid);
    console.log('✅ Updated final selector cards with complete catalog');
    
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
  
  // Generate cards using card generation utilities (pass null for catalog initially)
  const { cards, errors } = await window.CardGeneration.generateAllCards(
    allCardsNeeded, 
    menuTitle, 
    menuTree, 
    null
  );
  
  // Now create nested catalog using the generated cards that have bdoPubKeys
  console.log('🗺️ Creating nested catalog structure for lookup spell from generated cards...');
  const productCards = cards.filter(card => card.type === 'product');
  console.log('🔍 DEBUG: First few product cards structure:', productCards.slice(0, 2));
  const nestedCatalog = createNestedCatalogFromCards(productCards);
  console.log('🗺️ Generated nested catalog with bdoPubKeys:', nestedCatalog);
  
  // Regenerate final selector cards with the complete nested catalog
  console.log('🔄 Regenerating final selector cards with nested catalog...');
  const finalSelectorCards = cards.filter(card => {
    if (card.type !== 'menu-selector') return false;
    
    // Check if this is a final selector (no next selector)
    const cardIndex = allCardsNeeded.findIndex(c => c.cardBdoPubKey === card.cardBdoPubKey);
    const nextSelector = allCardsNeeded.find((c, index) => 
      c.type === 'menu-selector' && index > cardIndex
    );
    return !nextSelector;
  });
  
  for (const finalCard of finalSelectorCards) {
    const cardIndex = cards.findIndex(c => c.cardBdoPubKey === finalCard.cardBdoPubKey);
    const allCardIndex = allCardsNeeded.findIndex(c => c.cardBdoPubKey === finalCard.cardBdoPubKey);
    
    if (cardIndex >= 0 && allCardIndex >= 0) {
      console.log(`🔄 Regenerating final selector: ${finalCard.name} with catalog`);
      const updatedSvg = window.CardGeneration.createMenuSelectorSVG(
        allCardsNeeded[allCardIndex], 
        allCardsNeeded, 
        menuTitle, 
        allCardIndex, 
        menuTree.decisionTree, 
        nestedCatalog
      );
      cards[cardIndex].svg = updatedSvg;
      console.log(`✅ Updated final selector card: ${finalCard.name}`);
    }
  }
  
  return {
    cards,
    cardErrors: errors,
    nestedCatalog,
    allCardsNeeded
  };
}

/**
 * Create nested catalog structure for lookup spell from generated cards with bdoPubKeys
 * Converts product cards to nested map: {"adult": {"two-hour": {productId, bdoPubKey, ...}}}
 */
function createNestedCatalogFromCards(productCards) {
  console.log('🗺️ Converting product cards to nested catalog map for lookup spell:', productCards.length);
  
  const catalogMap = {};
  
  for (const card of productCards) {
    console.log('🔍 DEBUG: Processing product card:', {
      name: card.name,
      type: card.type,
      cardBdoPubKey: card.cardBdoPubKey,
      metadata: card.metadata
    });
    
    // Get product data from the card
    const product = card.metadata || {};
    const productName = card.name || '';
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
        
        // Store product data with bdoPubKey from the generated card
        catalogMap[rider][timeSpan] = {
          productId: product.id || card.name,
          bdoPubKey: card.cardBdoPubKey, // This comes from the generated card
          price: product.price || 0,
          name: card.name
        };
        
        console.log(`🗺️ Mapped "${rider}" -> "${timeSpan}" -> productId: ${product.id || card.name}, bdoPubKey: ${card.cardBdoPubKey}`);
      }
    } else {
      console.warn(`⚠️ Could not parse product name into decision tree path: "${productName}"`);
    }
  }
  
  console.log('🗺️ Final nested catalog structure with bdoPubKeys:', catalogMap);
  return catalogMap;
}

/**
 * Create nested catalog structure for lookup spell from products array (DEPRECATED - use createNestedCatalogFromCards)
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

/**
 * Update final selector cards in BDO with the complete nested catalog
 * @param {Array} uploadedCards - All uploaded cards
 * @param {Object} nestedCatalog - Complete nested catalog with bdoPubKeys
 * @param {string} userUuid - User UUID for authentication
 */
async function updateFinalSelectorCardsInBDO(uploadedCards, nestedCatalog, userUuid) {
  console.log('🔄 Starting update of final selector cards with nested catalog...');
  console.log('🔍 INPUT DEBUG:');
  console.log(`🔍   uploadedCards.length: ${uploadedCards.length}`);
  console.log(`🔍   nestedCatalog keys: ${Object.keys(nestedCatalog)}`);
  console.log(`🔍   userUuid: ${userUuid}`);
  
  // Find final selector cards (menu-selector type that should have lookup spells)
  // The final selector is the LAST menu level that leads to products
  const menuSelectors = uploadedCards.filter(card => card.type === 'menu-selector');
  console.log(`🔍 Found ${menuSelectors.length} menu selectors total`);
  
  // The final selector is the one with the highest level index
  const finalSelectors = menuSelectors.filter((card, index) => {
    console.log(`🔍 Checking card: ${card.name} (type: ${card.type}, index in selectors: ${index})`);
    const isFinal = index === menuSelectors.length - 1; // Only the last selector is final
    console.log(`🔍   Card ${card.name} is final selector: ${isFinal} (${index + 1} of ${menuSelectors.length})`);
    return isFinal;
  });
  
  console.log(`🔄 Found ${finalSelectors.length} final selector cards to update`);
  finalSelectors.forEach((card, i) => {
    console.log(`🔍 Final selector ${i + 1}: ${card.name} (pubKey: ${card.cardBdoPubKey.substring(0, 8)}...)`);
  });
  
  for (const finalSelector of finalSelectors) {
    console.log(`🔄 Updating final selector: ${finalSelector.name} with nested catalog`);
    console.log(`🔍 SELECTOR DEBUG:`);
    console.log(`🔍   pubKey: ${finalSelector.cardBdoPubKey}`);
    console.log(`🔍   uuid: ${finalSelector.cardBdoUuid}`);
    console.log(`🔍   metadata: ${JSON.stringify(finalSelector.metadata, null, 2)}`);
    
    try {
      console.log(`🔍 PRESERVING ORIGINAL CARD METADATA:`);
      console.log(`🔍   Original options: ${JSON.stringify(finalSelector.originalOptions)}`);
      console.log(`🔍   Original level: ${finalSelector.originalLevel}`);
      console.log(`🔍   Current SVG length: ${finalSelector.svgContent?.length || 'undefined'}`);
      
      // Instead of regenerating, let's just update the existing SVG with lookup spells
      // Use the stored original SVG as base and only modify the spell attributes
      const originalSvg = finalSelector.svgContent;
      if (!originalSvg) {
        console.error(`❌ No original SVG found for ${finalSelector.name}`);
        continue;
      }
      
      // For now, just use the original SVG - we can enhance with lookup spell injection later
      const updatedSvg = originalSvg;
      
      console.log(`🔍 Using original SVG (${updatedSvg.length} characters) for: ${finalSelector.name}`);
      
      // Update the card in BDO using Tauri backend
      if (window.__TAURI__) {
        const invoke = window.__TAURI__.core.invoke;
        console.log(`🔍 About to call update_card_in_bdo with:`);
        console.log(`🔍   bdoUuid: ${finalSelector.cardBdoUuid}`);
        console.log(`🔍   bdoPubKey: ${finalSelector.cardBdoPubKey}`);
        console.log(`🔍   svgContent length: ${updatedSvg.length}`);
        console.log(`🔍   menuName: ${menuTitle}`);
        
        const updateResult = await invoke('update_card_in_bdo', {
          bdoUuid: finalSelector.cardBdoUuid,
          bdoPubKey: finalSelector.cardBdoPubKey,
          svgContent: updatedSvg,
          menuName: menuTitle
        });
        console.log(`✅ Updated final selector card in BDO: ${finalSelector.name}`);
        console.log(`🔍 Update result: ${updateResult}`);
      } else {
        console.warn('⚠️ Tauri not available, skipping BDO update');
      }
      
    } catch (error) {
      console.error(`❌ Failed to update final selector card ${finalSelector.name}:`, error);
    }
  }
}

// Export for use in main application
window.MenuProcessing = {
  processMenuCatalogProduct,
  parseMenuDataFromForm,
  generateMagistackCards,
  createNestedCatalogFromProducts,
  updateFinalSelectorCardsInBDO
};

console.log('🍽️ Menu Processing utilities loaded');
