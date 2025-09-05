/**
 * BDO Upload Utilities
 * 
 * Handles BDO storage operations for menu cards and catalog data,
 * including individual card uploads and master catalog storage.
 */

/**
 * Upload all generated cards to BDO storage
 * @param {Array} cards - Array of generated card objects
 * @param {string} menuTitle - Menu title for naming
 * @param {string} userUuid - User UUID for authentication
 * @returns {Object} Upload results with pubKeys and success status
 */
async function uploadCardsToStorage(cards, menuTitle, userUuid) {
  console.log('🌐 Uploading cards to BDO storage...');
  
  const uploadedCards = [];
  const uploadErrors = [];
  let masterBdoPubKey = null;
  
  // Upload each individual card to BDO
  console.log(`🎴 Uploading ${cards.length} individual cards to BDO...`);
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`🌐 Uploading card ${i + 1}/${cards.length}: ${card.name}`);
    
    try {
      // Upload individual card to BDO
      const cardUploadResult = await uploadIndividualCard(card, userUuid);
      
      if (!cardUploadResult.error) {
        // Add bdoUuid to the card for future updates
        card.cardBdoUuid = cardUploadResult.bdoUuid;
        
        uploadedCards.push({
          ...card,
          bdoUploadResult: cardUploadResult
        });
        console.log(`✅ Card "${card.name}" uploaded successfully to BDO`);
        console.log(`🔑 Card BDO pubKey: ${card.cardBdoPubKey}`);
        if (cardUploadResult.bdoUuid) {
          console.log(`🆔 Card BDO UUID: ${cardUploadResult.bdoUuid}`);
        }
      } else {
        console.error(`❌ Failed to upload card "${card.name}":`, cardUploadResult.error);
        uploadErrors.push({
          cardName: card.name,
          error: cardUploadResult.error
        });
      }
      
    } catch (error) {
      console.error(`❌ Exception uploading card "${card.name}":`, error);
      uploadErrors.push({
        cardName: card.name,
        error: error.message
      });
    }
  }
  
  // Generate master bdoPubKey for the entire menu
  try {
    if (window.ninefyInvoke || window.__TAURI__) {
      const invoke = window.ninefyInvoke || window.__TAURI__.core.invoke;
      const keyResult = await invoke('generate_menu_card_keys', { 
        menuName: menuTitle, 
        cardCount: 1 
      });
      if (keyResult && keyResult.length > 0) {
        masterBdoPubKey = keyResult[0];
        console.log(`🔑 Generated master menu bdoPubKey: ${masterBdoPubKey}`);
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to generate master bdoPubKey:', error);
    masterBdoPubKey = `demo_master_${Date.now().toString(36)}`;
  }
  
  if (!masterBdoPubKey) {
    masterBdoPubKey = `demo_master_${Date.now().toString(36)}`;
  }
  
  console.log(`🎯 Upload summary: ${uploadedCards.length} successful, ${uploadErrors.length} failed`);
  
  return {
    uploadedCards,
    uploadErrors,
    bdoPubKey: masterBdoPubKey
  };
}

/**
 * Upload individual card to BDO storage
 * @param {Object} card - Card object with SVG content
 * @param {string} userUuid - User UUID for authentication
 * @returns {Object} Upload result
 */
async function uploadIndividualCard(card, userUuid) {
  try {
    // Prepare card data for BDO storage
    const cardData = {
      cardName: card.name,
      cardType: card.type,
      svgContent: card.svg,
      metadata: {
        ...card.metadata,
        uploadedAt: new Date().toISOString(),
        userUuid: userUuid
      }
    };
    
    // Upload to BDO using backend function
    if (window.ninefyInvoke || window.__TAURI__) {
      const invoke = window.ninefyInvoke || window.__TAURI__.core.invoke;
      
      const result = await invoke('store_card_in_bdo', {
        cardBdoPubKey: card.cardBdoPubKey,
        cardName: card.name,
        svgContent: card.svg,
        cardType: card.type || 'unknown',
        menuName: card.membershipData?.title || card.menuData?.title || 'Unknown Menu'
      });
      
      if (result && !result.error) {
        console.log(`✅ BDO storage successful for card: ${card.name}`);
        console.log(`🔑 Stored with pubKey: ${card.cardBdoPubKey}`);
        console.log(`📦 Data uploaded: ${JSON.stringify(cardData).length} chars`);
        
        // Extract UUID from "bdo_user:{uuid}" format
        let bdoUuid = null;
        if (typeof result === 'string' && result.startsWith('bdo_user:')) {
          bdoUuid = result.replace('bdo_user:', '');
        }
        
        return {
          success: true,
          bdoPubKey: card.cardBdoPubKey,
          bdoUuid: bdoUuid,
          dataSize: JSON.stringify(cardData).length
        };
      } else {
        console.error(`❌ BDO storage failed for card: ${card.name}`, result);
        return {
          success: false,
          error: result?.error || 'Unknown BDO storage error'
        };
      }
    } else {
      // Fallback: localStorage storage
      console.log(`💾 Storing card "${card.name}" in localStorage (BDO unavailable)`);
      localStorage.setItem(`menu-card-${card.cardBdoPubKey}`, card.svg);
      
      return {
        success: true,
        bdoPubKey: card.cardBdoPubKey,
        storage: 'localStorage'
      };
    }
    
  } catch (error) {
    console.error(`❌ Error uploading card "${card.name}" to BDO:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create and upload master catalog to both Sanora and BDO
 * @param {Object} menuTree - Complete menu tree structure
 * @param {string} menuTitle - Menu title
 * @param {string} menuDescription - Menu description
 * @param {string} menuType - Menu type/category
 * @param {Array} uploadedCards - Successfully uploaded cards
 * @param {string} bdoPubKey - Master BDO pubKey
 * @param {string} userUuid - User UUID
 * @param {string} sanoraUrl - Sanora service URL
 * @returns {Object} Catalog creation result
 */
async function createMasterCatalog(menuTree, menuTitle, menuDescription, menuType, uploadedCards, bdoPubKey, userUuid, sanoraUrl) {
  console.log('📋 Creating master catalog...');
  
  try {
    // Prepare catalog data for BDO storage
    const catalogForBDO = {
      title: menuTree.title || menuTitle,
      description: menuDescription,
      menus: menuTree.menus,
      products: menuTree.products.map(p => ({
        id: p.id,
        cardBdoPubKey: p.cardBdoPubKey,
        name: p.name,
        price: p.price,
        category: p.category
      })),
      cards: uploadedCards,
      metadata: {
        ...menuTree.metadata,
        uploadedAt: new Date().toISOString(),
        totalCards: uploadedCards.length,
        firstCardBdoPubKey: uploadedCards.length > 0 ? uploadedCards[0].cardBdoPubKey : null
      }
    };
    
    // Upload master catalog to BDO
    let bdoResult = null;
    try {
      if (window.ninefyInvoke || window.__TAURI__) {
        const invoke = window.ninefyInvoke || window.__TAURI__.core.invoke;
        
        bdoResult = await invoke('store_menu_in_bdo', {
          pubkey: bdoPubKey,
          catalog_data: catalogForBDO
        });
        
        if (bdoResult && bdoResult.success) {
          console.log('✅ Master catalog uploaded to BDO successfully');
        } else {
          console.warn('⚠️ Master catalog BDO upload failed:', bdoResult);
        }
      }
    } catch (bdoError) {
      console.warn('⚠️ BDO upload error:', bdoError);
    }
    
    // Create catalog product in Sanora
    let catalogProductResult = null;
    try {
      if (window.ninefyInvoke || window.__TAURI__) {
        const invoke = window.ninefyInvoke || window.__TAURI__.core.invoke;
        
        catalogProductResult = await invoke('add_product', {
          uuid: userUuid,
          sanora_url: sanoraUrl,
          title: menuTitle,
          description: `Menu catalog with ${uploadedCards.length} cards (${menuTree.products.length} products). ${menuDescription}`,
          price: 0, // Catalog itself is free
          category: 'menu',
          bdo_pub_key: bdoPubKey
        });
        
        if (catalogProductResult && catalogProductResult.success) {
          console.log('✅ Catalog product created in Sanora successfully');
        } else {
          console.warn('⚠️ Sanora catalog product creation failed:', catalogProductResult);
        }
      }
    } catch (sanoraError) {
      console.warn('⚠️ Sanora product creation error:', sanoraError);
    }
    
    // Upload menu JSON as artifact
    try {
      const menuJsonBlob = new Blob([JSON.stringify(catalogForBDO, null, 2)], {
        type: 'application/json'
      });
      
      const menuJsonFile = new File([menuJsonBlob], `${menuTitle.replace(/[^a-zA-Z0-9]/g, '_')}_menu.json`, {
        type: 'application/json'
      });
      
      if (window.uploadArtifactToSanora) {
        const artifactUploadResult = await window.uploadArtifactToSanora(
          userUuid,
          sanoraUrl,
          menuTitle,
          menuJsonFile
        );
        
        if (artifactUploadResult.success) {
          console.log('✅ Menu JSON artifact uploaded successfully');
        } else {
          console.warn('⚠️ Menu JSON artifact upload failed:', artifactUploadResult.message);
        }
      }
    } catch (artifactError) {
      console.warn('⚠️ Failed to upload menu JSON artifact:', artifactError);
    }
    
    return {
      catalogId: catalogProductResult?.id || 'unknown',
      bdoId: bdoResult?.id || 'unknown',
      catalogForBDO: catalogForBDO
    };
    
  } catch (error) {
    console.error('❌ Master catalog creation failed:', error);
    throw error;
  }
}

// Export for use in main application
window.BDOUpload = {
  uploadCardsToStorage,
  uploadIndividualCard,
  createMasterCatalog
};

// Also make uploadCardsToStorage globally available for compatibility with menu system
window.uploadCardsToStorage = uploadCardsToStorage;

console.log('🌐 BDO Upload utilities loaded');
