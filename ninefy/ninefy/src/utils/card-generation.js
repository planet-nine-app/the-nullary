/**
 * Card Generation Utilities
 * 
 * Handles SVG card creation for menu selectors and products,
 * including spell integration and navigation setup.
 */

/**
 * Generate all SVG cards for a menu catalog
 * @param {Array} allCardsNeeded - Array of card objects to generate
 * @param {string} menuTitle - Menu title for card headers
 * @param {Object} menuTree - Complete menu tree structure
 * @param {Object} nestedCatalog - Nested catalog for lookup spells
 * @returns {Object} Generated cards and any errors
 */
async function generateAllCards(allCardsNeeded, menuTitle, menuTree, nestedCatalog) {
  console.log('🎨 Generating all SVG cards...');
  
  const createdCards = [];
  const cardErrors = [];
  
  // First pass: Generate unique bdoPubKeys for ALL cards
  console.log('🔑 Generating unique bdoPubKeys for all cards...');
  let uniqueCardKeys = [];
  
  try {
    if (window.ninefyInvoke || window.__TAURI__) {
      const invoke = window.ninefyInvoke || window.__TAURI__.core.invoke;
      const keyResult = await invoke('generate_menu_card_keys', { count: allCardsNeeded.length });
      if (keyResult && keyResult.length > 0) {
        uniqueCardKeys = keyResult;
        console.log(`🔑 Generated ${uniqueCardKeys.length} unique sessionless keypairs`);
      }
    }
  } catch (error) {
    console.log('🎯 Error generating unique keys:', error);
  }
  
  // Fallback: generate demo keys if backend unavailable
  if (uniqueCardKeys.length === 0) {
    for (let i = 0; i < allCardsNeeded.length; i++) {
      uniqueCardKeys.push(`demo_card_${Date.now().toString(36)}_${i}`);
    }
  }
  
  // Assign unique keys to each card
  for (let i = 0; i < allCardsNeeded.length; i++) {
    const card = allCardsNeeded[i];
    card.cardBdoPubKey = uniqueCardKeys[i];
    console.log(`🔑 Assigned key ${i + 1}: ${card.cardBdoPubKey.substring(0, 12)}... to ${card.name}`);
  }
  
  // Log pubkey summary
  console.log('\n🔑 ===== CARD PUBKEY SUMMARY =====');
  console.log(`📋 Menu: ${menuTitle}`);
  console.log(`🎴 Total Cards: ${allCardsNeeded.length}`);
  allCardsNeeded.forEach((card, index) => {
    console.log(`   ${index + 1}. ${card.name} → ${card.cardBdoPubKey}`);
  });
  console.log('🔑 ==============================\n');
  
  // Second pass: Create SVG cards with proper navigation
  console.log('🎨 Creating SVG cards with navigation...');
  for (let i = 0; i < allCardsNeeded.length; i++) {
    const card = allCardsNeeded[i];
    const nextCard = findNextLogicalCard(card, allCardsNeeded, menuTree.menuHeaders);
    
    console.log(`🎯 Card ${i}: "${card.name}" (type: ${card.type}, level: ${card.level || 'none'})`);
    if (nextCard) {
      const nextIndex = allCardsNeeded.findIndex(c => c === nextCard);
      console.log(`🎯   → Links to card ${nextIndex}: "${nextCard.name}" (type: ${nextCard.type})`);
    } else {
      console.log(`🎯   → Links to: none`);
    }
    
    try {
      let cardSvg = '';
      
      if (card.type === 'menu-selector') {
        console.log(`🗂️ Creating menu selector card: ${card.name}`);
        cardSvg = createMenuSelectorSVG(card, allCardsNeeded, menuTitle, i, menuTree.decisionTree, nestedCatalog);
      } else if (card.type === 'product') {
        console.log(`🛍️ Creating product card: ${card.name} ($${card.price.toFixed(2)})`);
        cardSvg = createMenuItemSVG(card.productData, nextCard?.productData, menuTitle, i, allCardsNeeded.length);
      } else {
        console.log(`⚠️ Unknown card type: ${card.type} for card: ${card.name}`);
        continue;
      }
      
      if (cardSvg) {
        const cardData = {
          name: card.name,
          cardBdoPubKey: card.cardBdoPubKey,
          svg: cardSvg,
          type: card.type,
          metadata: card.metadata || {}
        };
        
        createdCards.push(cardData);
        
        // Enhanced logging for first few cards
        if (createdCards.length <= 3) {
          console.log(`🔍 CARD #${createdCards.length} DETAILS:`);
          console.log(`   Name: ${card.name}`);
          console.log(`   Type: ${card.type}`);
          console.log(`   Full pubKey: ${card.cardBdoPubKey}`);
          console.log(`   SVG length: ${cardSvg.length} chars`);
          console.log(`   SVG preview: ${cardSvg.substring(0, 100)}...`);
        }
      }
      
    } catch (cardError) {
      console.error(`❌ Failed to create SVG for card ${card.name}:`, cardError);
      cardErrors.push({
        cardName: card.name,
        cardType: card.type,
        error: cardError.message
      });
    }
  }
  
  return {
    cards: createdCards,
    errors: cardErrors
  };
}

/**
 * Find the next logical card in the navigation sequence
 * @param {Object} currentCard - Current card object
 * @param {Array} allCards - Array of all cards
 * @param {Array} menuHeaders - Menu headers for ordering
 * @returns {Object|null} Next card or null
 */
function findNextLogicalCard(currentCard, allCards, menuHeaders) {
  // Menu selector cards navigate to the next selector or to products
  if (currentCard.type === 'menu-selector') {
    // Find next selector card
    const nextSelector = allCards.find(c => 
      c.type === 'menu-selector' && 
      c !== currentCard && 
      allCards.indexOf(c) > allCards.indexOf(currentCard)
    );
    
    if (nextSelector) {
      console.log(`🔗 ${currentCard.name} → ${nextSelector.name}`);
      return nextSelector;
    } else {
      console.log(`🔗 ${currentCard.name} → products (final selector)`);
      return null; // Final selector - no next card
    }
  }
  
  // Product cards don't navigate further
  if (currentCard.type === 'product') {
    console.log(`🔗 ${currentCard.name} → no navigation (product card)`);
    return null;
  }
  
  console.log(`🔗 ${currentCard.name} → no next card found`);
  return null;
}

/**
 * Create SVG content for a menu selector card
 * @param {Object} card - Card object with selector information
 * @param {Array} allCards - All cards for navigation references
 * @param {string} menuTitle - Menu title
 * @param {number} index - Card index
 * @param {Object} decisionTree - Decision tree structure
 * @param {Object} catalogForLookup - Nested catalog for lookup spells
 * @returns {string} SVG content as string
 */
function createMenuSelectorSVG(card, allCards, menuTitle, index, decisionTree, catalogForLookup = null) {
  console.log(`🔍 DEBUG: createMenuSelectorSVG called for "${card.name}" with catalogForLookup:`, catalogForLookup);
  
  const cardWidth = 300;
  const cardHeight = 400;
  
  // Find the next selector card for navigation (all options go to the same next selector)
  const nextSelectorCard = allCards.find(c => 
    c.type === 'menu-selector' && 
    c !== card && 
    allCards.indexOf(c) > allCards.indexOf(card)
  );
  
  const nextBdoPubKey = nextSelectorCard ? nextSelectorCard.cardBdoPubKey : null;
  const isFinalSelector = !nextSelectorCard; // No more selectors = final level
  console.log(`🔗 Selector "${card.name}" will navigate to: ${nextSelectorCard ? nextSelectorCard.name : 'products'}`);
  console.log(`🔍 Is final selector (needs lookup spell): ${isFinalSelector}`);
  
  // Create option buttons directly from the selector card's options
  const optionButtons = card.options.map((option, optIndex) => {
    console.log(`🔘 Creating option button for: ${option}`);
    
    const y = 120 + (optIndex * 50);
    const buttonColor = optIndex % 2 === 0 ? '#3498db' : '#9b59b6';
    
    // For final selector, use lookup spell; for others, use selection spell
    let spellType, spellComponents;
    
    console.log(`🔍 DEBUG: isFinalSelector=${isFinalSelector}, catalogForLookup exists=${!!catalogForLookup}, option=${option}`);
    
    if (isFinalSelector && catalogForLookup) {
      // Final selector: option buttons trigger lookup with this selection
      console.log(`🔍 Creating lookup spell button for final selector option: ${option}`);
      spellType = "lookup";
      spellComponents = {
        catalog: catalogForLookup,
        selection: option,
        level: card.level,
        selectorType: 'menu',
        menuTitle: menuTitle
      };
    } else {
      // Non-final selector: option buttons trigger navigation
      console.log(`🔗 Creating selection spell button for navigation option: ${option}`);
      spellType = "selection";
      spellComponents = {
        selection: option,
        level: card.level,
        selectorType: 'menu',
        menuTitle: menuTitle,
        // Add decision tree context if available
        ...(decisionTree && decisionTree[option] ? {
          decisionTreePath: option,
          hasSubSelection: typeof decisionTree[option] === 'object' && !decisionTree[option].product
        } : {}),
        // Add navigation bdoPubKey for castSpell navigation
        ...(nextBdoPubKey ? { bdoPubKey: nextBdoPubKey } : {})
      };
    }
    
    // Create spell attributes
    let spellAttributes = `spell="${spellType}" spell-components='${JSON.stringify(spellComponents)}'`;
    
    return `
      <rect ${spellAttributes}
            x="50" y="${y}" width="200" height="40" rx="8" 
            fill="${buttonColor}" stroke="${buttonColor}" 
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;" 
            class="spell-element">
        <animate attributeName="fill" values="${buttonColor};#ecf0f1;${buttonColor}" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text ${spellAttributes}
            x="150" y="${y + 25}" text-anchor="middle" fill="white" font-size="14" font-weight="bold" 
            class="spell-element" 
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;">
        ${option}
      </text>`;
  }).join('');

  // Note: For final selector, lookup spell is now embedded in the option buttons themselves

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" card-name="${card.name}">
      <!-- Background -->
      <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" fill="#2c3e50" stroke="#34495e" stroke-width="2" rx="12"/>
      
      <!-- Header -->
      <rect x="10" y="10" width="${cardWidth - 20}" height="60" fill="#34495e" rx="8"/>
      <text x="150" y="35" text-anchor="middle" fill="#ecf0f1" font-size="14" font-weight="bold">${menuTitle}</text>
      <text x="150" y="55" text-anchor="middle" fill="#bdc3c7" font-size="18" font-weight="bold">${card.name}</text>
      
      <!-- Menu Options -->
      ${optionButtons}
      
      <!-- Footer -->
      <text x="150" y="${cardHeight - 30}" text-anchor="middle" fill="#7f8c8d" font-size="10">
        Card ${index + 1} - Menu Selector${isFinalSelector ? ' (Final Level)' : ''}
      </text>
      <text x="150" y="${cardHeight - 15}" text-anchor="middle" fill="#7f8c8d" font-size="10">
        ${isFinalSelector ? 'Click option to find your product' : 'Choose an option to continue'}
      </text>
    </svg>
  `;
}

/**
 * Create SVG content for a menu item/product card
 * @param {Object} product - Product object with details
 * @param {Object} nextProduct - Next product for navigation (optional)
 * @param {string} menuTitle - Menu title
 * @param {number} index - Card index
 * @param {number} total - Total cards
 * @returns {string} SVG content as string
 */
function createMenuItemSVG(product, nextProduct, menuTitle, index, total) {
  const cardWidth = 300;
  const cardHeight = 400;
  const nextBdoPubKey = nextProduct ? nextProduct.cardBdoPubKey : null;
  
  // Format price for display
  const priceDisplay = `$${product.price.toFixed(2)}`;
  
  // Create navigation to next product if available
  let navigationButton = '';
  if (nextBdoPubKey) {
    navigationButton = `
      <rect spell="magicard" spell-components='{"bdoPubKey":"${nextBdoPubKey}"}'
            x="20" y="320" width="80" height="30" rx="8" 
            fill="#27ae60" stroke="#229954" stroke-width="2"
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;"
            class="spell-element">
        <animate attributeName="fill" values="#27ae60;#2ecc71;#27ae60" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text spell="magicard" spell-components='{"bdoPubKey":"${nextBdoPubKey}"}'
            x="60" y="340" text-anchor="middle" fill="white" font-size="10" font-weight="bold"
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;"
            class="spell-element">→ Next</text>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" card-name="${card.name}">
      <!-- Background -->
      <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" fill="#2c3e50" stroke="#34495e" stroke-width="2" rx="12"/>
      
      <!-- Header -->
      <rect x="10" y="10" width="${cardWidth - 20}" height="60" fill="#34495e" rx="8"/>
      <text x="150" y="35" text-anchor="middle" fill="#ecf0f1" font-size="14" font-weight="bold">${menuTitle}</text>
      <text x="150" y="55" text-anchor="middle" fill="#bdc3c7" font-size="18" font-weight="bold">Product</text>
      
      <!-- Product Info -->
      <rect x="20" y="90" width="260" height="180" fill="#34495e" rx="8"/>
      
      <!-- Product Name -->
      <text x="150" y="115" text-anchor="middle" fill="#ecf0f1" font-size="16" font-weight="bold">
        ${product.name}
      </text>
      
      <!-- Price Display -->
      <rect x="100" y="130" width="100" height="30" fill="#e74c3c" rx="6"/>
      <text x="150" y="150" text-anchor="middle" fill="white" font-size="14" font-weight="bold">
        ${priceDisplay}
      </text>
      
      <!-- Product ID (for Sanora integration) -->
      <text x="150" y="180" text-anchor="middle" fill="#bdc3c7" font-size="10">
        ID: ${product.id}
      </text>
      
      <!-- Product selections path -->
      <text x="150" y="200" text-anchor="middle" fill="#95a5a6" font-size="9">
        ${product.metadata?.selections?.join(' → ') || 'N/A'}
      </text>
      
      <!-- Navigation -->
      ${navigationButton}
      
      <!-- Footer -->
      <text x="150" y="${cardHeight - 30}" text-anchor="middle" fill="#7f8c8d" font-size="10">
        Product Card ${index + 1} of ${total}
      </text>
      <text x="150" y="${cardHeight - 15}" text-anchor="middle" fill="#7f8c8d" font-size="10">
        Ready for purchase via Sanora
      </text>
    </svg>
  `;
}

// Export for use in main application
window.CardGeneration = {
  generateAllCards,
  createMenuSelectorSVG,
  createMenuItemSVG,
  findNextLogicalCard
};

console.log('🎨 Card Generation utilities loaded');
