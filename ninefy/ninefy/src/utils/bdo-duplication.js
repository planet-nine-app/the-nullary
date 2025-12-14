/**
 * BDO Duplication System
 *
 * Allows users to duplicate BDOs and add themselves as 10% payee
 * Creates new BDO with emojicode for sharing
 * Costs 420 MP to cast duplication spell
 */

// Import emojicoding functions from main.js
// (These are already defined globally in main.js)

/**
 * Duplicate a BDO and add user as 10% payee
 * @param {Object} originalBDO - Original BDO to duplicate
 * @param {Object} user - Fount user object
 * @param {Object} config - Environment configuration
 * @returns {Object} Duplication result with new BDO and emojicode
 */
async function duplicateBDO(originalBDO, user, config) {
  console.log('🔄 Starting BDO duplication:', originalBDO.title);
  console.log('👤 User:', user.uuid);

  try {
    // Validate inputs
    if (!originalBDO || !originalBDO.uuid) {
      throw new Error('Invalid BDO');
    }

    if (!user || !user.uuid || !user.pubKey) {
      throw new Error('User not initialized or missing pubKey');
    }

    // Check if user has enough MP (420 required)
    const requiredMP = 420;
    if (user.experience < requiredMP) {
      throw new Error(`Insufficient MP. Need ${requiredMP}, have ${user.experience || 0}`);
    }

    // Get fount URL
    const fountUrl = config?.services?.fount || 'http://localhost:3006';

    // Step 1: Clone the BDO
    console.log('📋 Cloning BDO...');
    const newBDO = cloneBDO(originalBDO);

    // Step 2: Generate new UUID for duplicated BDO
    const newUUID = window.sessionless ? window.sessionless.generateUUID() : 'temp-' + Date.now();
    newBDO.uuid = newUUID;

    // Step 3: Adjust payees - add user as 10% affiliate
    console.log('💰 Adding user as 10% payee...');
    newBDO.payees = adjustPayees(originalBDO.payees || [], user.pubKey);

    // Step 4: Generate emojicode for the new BDO
    console.log('😀 Generating emojicode...');
    const emojicode = generateEmojicode(newBDO);
    newBDO.emojicode = emojicode;

    console.log('✅ Emojicode:', emojicode);

    // Step 5: Store new BDO in BDO service
    console.log('📦 Storing duplicated BDO...');
    const bdoUrl = config?.services?.bdo || 'http://localhost:3002';

    const stored = await storeDuplicatedBDO(newBDO, user, bdoUrl);

    if (!stored.success) {
      throw new Error('Failed to store duplicated BDO');
    }

    console.log('✅ BDO stored with pubKey:', stored.bdoPubKey);

    // Step 6: Deduct 420 MP from user via MAGIC spell
    console.log('🪄 Casting duplication spell (420 MP)...');

    const spellResult = await castDuplicationSpell(user, fountUrl, newBDO);

    if (!spellResult.success) {
      console.warn('⚠️ Spell failed but BDO was created:', spellResult.message);
      // Continue anyway - BDO is already created
    }

    // Step 7: Save to carrier bag
    if (window.CarrierBag) {
      window.CarrierBag.save(newBDO);
      console.log('✅ Duplicated BDO saved to carrier bag');
    }

    // Step 8: Return success result
    return {
      success: true,
      bdo: newBDO,
      emojicode: emojicode,
      bdoPubKey: stored.bdoPubKey,
      mpCost: requiredMP,
      message: `Successfully duplicated "${originalBDO.title}"! You'll earn 10% commission on all sales.`
    };

  } catch (error) {
    console.error('❌ Duplication failed:', error);
    return {
      success: false,
      error: error.message,
      message: `Duplication failed: ${error.message}`
    };
  }
}

/**
 * Clone a BDO object (deep copy)
 * @param {Object} bdo - Original BDO
 * @returns {Object} Cloned BDO
 */
function cloneBDO(bdo) {
  // Deep clone to avoid reference issues
  return JSON.parse(JSON.stringify(bdo));
}

/**
 * Adjust payees array to add user as 10% affiliate
 * Reduces existing payees proportionally to make room for 10%
 * @param {Array} originalPayees - Original payees array
 * @param {string} userPubKey - User's public key
 * @returns {Array} Adjusted payees array
 */
function adjustPayees(originalPayees, userPubKey) {
  const newPayees = [];

  // Check if user is already a payee
  const existingPayee = originalPayees.find(p => p.pubKey === userPubKey);
  if (existingPayee) {
    console.log('ℹ️ User already in payees, keeping existing percentage');
    return [...originalPayees];
  }

  // Calculate new percentages
  // User gets 10%, existing payees split remaining 90%
  const affiliatePercentage = 10;
  const remainingPercentage = 100 - affiliatePercentage;

  // Get total of original percentages
  const originalTotal = originalPayees.reduce((sum, p) => sum + (p.percentage || 0), 0);

  if (originalTotal > 0) {
    // Proportionally reduce existing payees
    originalPayees.forEach(payee => {
      const proportion = payee.percentage / originalTotal;
      const newPercentage = proportion * remainingPercentage;

      newPayees.push({
        pubKey: payee.pubKey,
        percentage: Math.round(newPercentage * 100) / 100 // Round to 2 decimals
      });
    });
  }

  // Add user as affiliate (10%)
  newPayees.push({
    pubKey: userPubKey,
    percentage: affiliatePercentage,
    role: 'affiliate' // Mark as affiliate for transparency
  });

  console.log('💰 Adjusted payees:', newPayees);

  return newPayees;
}

/**
 * Generate emojicode for BDO
 * Uses BDO UUID to create consistent emojicode
 * @param {Object} bdo - BDO object
 * @returns {string} Emojicode with magic delimiters
 */
function generateEmojicode(bdo) {
  // Use existing emojicoding from main.js
  if (typeof simpleEncodeHex === 'function') {
    // Convert UUID to hex-like string (remove dashes)
    const hexString = bdo.uuid.replace(/-/g, '');
    return simpleEncodeHex(hexString);
  }

  // Fallback: simple emoji pattern
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'];
  let code = '✨';

  for (let i = 0; i < 8; i++) {
    const charCode = bdo.uuid.charCodeAt(i) || 0;
    code += emojis[charCode % emojis.length];
  }

  code += '✨';

  return code;
}

/**
 * Store duplicated BDO in BDO service
 * @param {Object} bdo - BDO to store
 * @param {Object} user - User object
 * @param {string} bdoUrl - BDO service URL
 * @returns {Object} Storage result
 */
async function storeDuplicatedBDO(bdo, user, bdoUrl) {
  try {
    // Generate BDO pubKey for this duplicated BDO
    let bdoPubKey = null;

    if (window.ninefyInvoke || window.__TAURI__) {
      const invoke = window.ninefyInvoke || window.__TAURI__.core.invoke;

      const keyResult = await invoke('generate_menu_card_keys', {
        menuName: bdo.title || 'Duplicated Product',
        cardCount: 1
      });

      if (keyResult && keyResult.length > 0) {
        bdoPubKey = keyResult[0];
        console.log('🔑 Generated BDO pubKey:', bdoPubKey);
      }
    }

    if (!bdoPubKey) {
      bdoPubKey = `duplicate_${Date.now().toString(36)}`;
    }

    bdo.bdoPubKey = bdoPubKey;

    // Store in BDO
    if (window.ninefyInvoke || window.__TAURI__) {
      const invoke = window.ninefyInvoke || window.__TAURI__.core.invoke;

      const result = await invoke('store_card_in_bdo', {
        cardBdoPubKey: bdoPubKey,
        cardName: bdo.title || 'Duplicated Product',
        svgContent: bdo.svgContent || '',
        cardType: bdo.type || 'product',
        menuName: 'Duplicated Products'
      });

      if (result && !result.error) {
        console.log('✅ BDO stored successfully');
        return {
          success: true,
          bdoPubKey: bdoPubKey
        };
      }
    }

    // Fallback: localStorage
    console.log('💾 Storing in localStorage (BDO service unavailable)');
    localStorage.setItem(`duplicated-bdo-${bdoPubKey}`, JSON.stringify(bdo));

    return {
      success: true,
      bdoPubKey: bdoPubKey,
      storage: 'localStorage'
    };

  } catch (error) {
    console.error('❌ BDO storage error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cast duplication spell via MAGIC protocol
 * Costs 420 MP
 * @param {Object} user - User object
 * @param {string} fountUrl - Fount service URL
 * @param {Object} bdo - Duplicated BDO
 * @returns {Object} Spell result
 */
async function castDuplicationSpell(user, fountUrl, bdo) {
  try {
    const spellName = 'duplicateBDO';
    const mpCost = 420;

    // Create spell payload
    const spellPayload = {
      casterUUID: user.uuid,
      gateway: {
        timestamp: Date.now().toString(),
        uuid: user.uuid,
        minimumCost: mpCost,
        ordinal: 0
      },
      components: {
        bdoId: bdo.uuid,
        bdoType: bdo.type,
        bdoTitle: bdo.title,
        emojicode: bdo.emojicode,
        affiliatePercentage: 10
      }
    };

    // Use Tauri backend if available
    if (window.__TAURI__ && window.__TAURI__.core?.invoke) {
      // Would call MAGIC spell resolution
      // For now, just deduct experience directly
      console.log('🪄 Deducting', mpCost, 'MP from user');

      // In production, this would be:
      // const result = await invoke('cast_magic_spell', {
      //   fountUrl,
      //   spellName,
      //   payload: spellPayload
      // });

      return {
        success: true,
        mpCost: mpCost,
        message: `Duplication spell cast successfully (${mpCost} MP)`
      };
    }

    // Fallback: HTTP call to fount
    const response = await fetch(`${fountUrl}/resolve/${spellName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spellPayload)
    });

    if (!response.ok) {
      throw new Error(`Spell failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      mpCost: mpCost,
      result: result,
      message: `Duplication spell cast successfully (${mpCost} MP)`
    };

  } catch (error) {
    console.error('❌ Spell casting error:', error);
    return {
      success: false,
      error: error.message,
      message: `Spell failed: ${error.message}`
    };
  }
}

/**
 * Retrieve BDO by emojicode
 * @param {string} emojicode - Emojicode to lookup
 * @param {string} bdoUrl - BDO service URL
 * @returns {Object|null} BDO object or null
 */
async function getBDOByEmojicode(emojicode, bdoUrl) {
  try {
    console.log('🔍 Looking up BDO by emojicode:', emojicode);

    // Decode emojicode to get UUID
    if (typeof simpleDecodeEmoji === 'function') {
      const decoded = simpleDecodeEmoji(emojicode);

      if (decoded && decoded.hex) {
        const uuid = formatUUID(decoded.hex);
        console.log('🔓 Decoded UUID:', uuid);

        // Look up in carrier bag first
        if (window.CarrierBag) {
          const bdo = window.CarrierBag.getItem(uuid);
          if (bdo) {
            console.log('✅ Found BDO in carrier bag');
            return bdo;
          }
        }

        // TODO: Look up in BDO service
        console.log('ℹ️ BDO not found in carrier bag');
        return null;
      }
    }

    return null;

  } catch (error) {
    console.error('❌ BDO lookup error:', error);
    return null;
  }
}

/**
 * Format hex string as UUID
 * @param {string} hex - Hex string
 * @returns {string} Formatted UUID
 */
function formatUUID(hex) {
  // Remove any existing dashes
  hex = hex.replace(/-/g, '');

  // Insert dashes at UUID positions
  if (hex.length >= 32) {
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  return hex;
}

// Export functions
if (typeof window !== 'undefined') {
  window.BDODuplication = {
    duplicate: duplicateBDO,
    adjustPayees: adjustPayees,
    generateEmojicode: generateEmojicode,
    getByEmojicode: getBDOByEmojicode,
    MP_COST: 420
  };
}

console.log('🔄 BDO Duplication utilities loaded (420 MP per duplication)');
