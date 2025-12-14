/**
 * Carrier Bag Utilities
 *
 * Manages saving and retrieving shareable BDOs (books, products, etc.)
 * Users can save BDOs they want to purchase later or share with others
 */

const CARRIER_BAG_KEY = 'ninefyCarrierBag';

/**
 * Get all items from carrier bag
 * @returns {Array} Array of saved BDO items
 */
function getCarrierBag() {
  try {
    const stored = localStorage.getItem(CARRIER_BAG_KEY);
    if (!stored) return [];

    const bag = JSON.parse(stored);
    console.log('👜 Retrieved carrier bag:', bag.length, 'items');
    return bag;
  } catch (error) {
    console.error('❌ Error reading carrier bag:', error);
    return [];
  }
}

/**
 * Save an item to carrier bag
 * @param {Object} item - BDO item to save (book, product, etc.)
 * @returns {boolean} Success status
 */
function saveToCarrierBag(item) {
  try {
    if (!item || !item.uuid) {
      console.error('❌ Invalid item - missing uuid');
      return false;
    }

    const bag = getCarrierBag();

    // Check if item already exists
    const existingIndex = bag.findIndex(i => i.uuid === item.uuid);

    if (existingIndex >= 0) {
      console.log('ℹ️ Item already in carrier bag:', item.title || item.uuid);
      return true; // Already saved, still success
    }

    // Add timestamp
    const itemWithTimestamp = {
      ...item,
      savedAt: new Date().toISOString()
    };

    bag.push(itemWithTimestamp);
    localStorage.setItem(CARRIER_BAG_KEY, JSON.stringify(bag));

    console.log('✅ Saved to carrier bag:', item.title || item.uuid);
    console.log('👜 Carrier bag now contains:', bag.length, 'items');

    return true;
  } catch (error) {
    console.error('❌ Error saving to carrier bag:', error);
    return false;
  }
}

/**
 * Remove an item from carrier bag
 * @param {string} uuid - UUID of item to remove
 * @returns {boolean} Success status
 */
function removeFromCarrierBag(uuid) {
  try {
    const bag = getCarrierBag();
    const originalLength = bag.length;

    const filtered = bag.filter(item => item.uuid !== uuid);

    if (filtered.length === originalLength) {
      console.warn('⚠️ Item not found in carrier bag:', uuid);
      return false;
    }

    localStorage.setItem(CARRIER_BAG_KEY, JSON.stringify(filtered));
    console.log('✅ Removed from carrier bag:', uuid);
    console.log('👜 Carrier bag now contains:', filtered.length, 'items');

    return true;
  } catch (error) {
    console.error('❌ Error removing from carrier bag:', error);
    return false;
  }
}

/**
 * Get a specific item from carrier bag
 * @param {string} uuid - UUID of item to retrieve
 * @returns {Object|null} Item or null if not found
 */
function getFromCarrierBag(uuid) {
  const bag = getCarrierBag();
  return bag.find(item => item.uuid === uuid) || null;
}

/**
 * Clear entire carrier bag
 * @returns {boolean} Success status
 */
function clearCarrierBag() {
  try {
    localStorage.removeItem(CARRIER_BAG_KEY);
    console.log('🗑️ Cleared carrier bag');
    return true;
  } catch (error) {
    console.error('❌ Error clearing carrier bag:', error);
    return false;
  }
}

/**
 * Get purchased items (items with nineum assigned)
 * This checks the user's nineum array for permissions to download digital artifacts
 * @param {Object} user - Fount user object with nineum array
 * @returns {Array} Array of purchased items with download access
 */
function getPurchasedItems(user) {
  if (!user || !user.nineum || !Array.isArray(user.nineum)) {
    console.log('ℹ️ No user nineum found');
    return [];
  }

  const bag = getCarrierBag();
  const purchased = [];

  for (const item of bag) {
    if (item.purchasedNineum && user.nineum.includes(item.purchasedNineum)) {
      purchased.push(item);
    }
  }

  console.log('🎁 Found', purchased.length, 'purchased items with download access');
  return purchased;
}

/**
 * Mark an item as purchased by adding nineum
 * @param {string} uuid - UUID of item that was purchased
 * @param {string} nineum - Nineum string granting download access
 * @returns {boolean} Success status
 */
function markAsPurchased(uuid, nineum) {
  try {
    const bag = getCarrierBag();
    const itemIndex = bag.findIndex(item => item.uuid === uuid);

    if (itemIndex < 0) {
      console.error('❌ Item not found in carrier bag:', uuid);
      return false;
    }

    bag[itemIndex].purchasedNineum = nineum;
    bag[itemIndex].purchasedAt = new Date().toISOString();

    localStorage.setItem(CARRIER_BAG_KEY, JSON.stringify(bag));

    console.log('✅ Marked as purchased:', uuid);
    console.log('💎 Nineum assigned:', nineum);

    return true;
  } catch (error) {
    console.error('❌ Error marking as purchased:', error);
    return false;
  }
}

/**
 * Get digital artifacts for a purchased item
 * Checks if user has the required nineum for download access
 * @param {string} uuid - UUID of purchased item
 * @param {Object} user - Fount user object with nineum array
 * @returns {Array|null} Array of digital artifacts or null if no access
 */
function getDigitalArtifacts(uuid, user) {
  const item = getFromCarrierBag(uuid);

  if (!item) {
    console.error('❌ Item not found:', uuid);
    return null;
  }

  if (!item.purchasedNineum) {
    console.log('ℹ️ Item not purchased yet:', uuid);
    return null;
  }

  if (!user || !user.nineum || !user.nineum.includes(item.purchasedNineum)) {
    console.error('❌ User does not have required nineum for download access');
    return null;
  }

  console.log('✅ Download access granted for:', item.title || uuid);
  return item.digitalArtifacts || [];
}

// Export functions
if (typeof window !== 'undefined') {
  window.CarrierBag = {
    get: getCarrierBag,
    save: saveToCarrierBag,
    remove: removeFromCarrierBag,
    getItem: getFromCarrierBag,
    clear: clearCarrierBag,
    getPurchased: getPurchasedItems,
    markPurchased: markAsPurchased,
    getArtifacts: getDigitalArtifacts
  };
}

console.log('👜 Carrier Bag utilities loaded');
