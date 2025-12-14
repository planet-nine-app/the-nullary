/**
 * Book Purchase Flow
 *
 * Handles purchasing books with:
 * - Payment processing via Addie
 * - Nineum assignment for digital artifact access
 * - CarrierBag integration
 * - Payee revenue distribution
 */

/**
 * Purchase a book and assign nineum for download access
 * @param {Object} bookBDO - Book BDO object
 * @param {Object} user - Fount user object
 * @param {Object} config - Environment configuration
 * @returns {Object} Purchase result with nineum
 */
async function purchaseBook(bookBDO, user, config) {
  console.log('🛒 Starting book purchase:', bookBDO.title);

  try {
    // Validate inputs
    if (!bookBDO || !bookBDO.uuid) {
      throw new Error('Invalid book BDO');
    }

    if (!user || !user.uuid) {
      throw new Error('User not initialized');
    }

    if (!config) {
      throw new Error('Environment configuration required');
    }

    const fountUrl = config.services?.fount || 'http://localhost:3006';
    const addieUrl = config.services?.addie || 'http://localhost:3001';

    // Step 1: Create payment intent with payee splits
    console.log('💳 Creating payment intent...');

    const payeeAmounts = calculatePayeeSplits(bookBDO);
    const paymentIntent = await createPaymentIntent(
      bookBDO,
      user,
      addieUrl,
      payeeAmounts
    );

    if (!paymentIntent || !paymentIntent.clientSecret) {
      throw new Error('Failed to create payment intent');
    }

    console.log('✅ Payment intent created:', paymentIntent.id);

    // Step 2: Process payment (would open Stripe modal in real app)
    console.log('💰 Processing payment...');

    // In a real implementation, this would:
    // 1. Open Stripe payment modal with paymentIntent.clientSecret
    // 2. Wait for user to complete payment via Stripe Elements
    // 3. Receive confirmation that payment succeeded
    // 4. Call window.PaymentTransferProcessor.processTransfers(paymentIntent.id, addieUrl)
    //    to distribute funds to all payees (Alice, Bob, etc.)

    // TODO: Integrate Stripe Elements modal for actual payment confirmation
    // For now, we'll simulate successful payment for development
    // When payment succeeds, call:
    // const transferResult = await window.PaymentTransferProcessor.processTransfers(
    //   paymentIntent.id,
    //   addieUrl
    // );
    // if (!transferResult.success) {
    //   console.error('Warning: Payment succeeded but transfers failed:', transferResult.error);
    // }

    // Step 3: Generate and assign nineum for download access
    console.log('💎 Generating nineum for download access...');

    const nineum = await createDownloadNineum(bookBDO, user, fountUrl);

    if (!nineum) {
      throw new Error('Failed to create download nineum');
    }

    console.log('✅ Nineum assigned:', nineum);

    // Step 4: Mark as purchased in carrier bag
    if (window.CarrierBag) {
      const marked = window.CarrierBag.markPurchased(bookBDO.uuid, nineum);
      if (marked) {
        console.log('✅ Marked as purchased in carrier bag');
      }
    }

    // Step 5: Return success result
    return {
      success: true,
      nineum,
      paymentIntent: paymentIntent.id,
      book: bookBDO,
      message: `Successfully purchased "${bookBDO.title}". Your download access nineum has been assigned!`
    };

  } catch (error) {
    console.error('❌ Purchase failed:', error);
    return {
      success: false,
      error: error.message,
      message: `Purchase failed: ${error.message}`
    };
  }
}

/**
 * Calculate payee splits from book BDO
 * @param {Object} bookBDO - Book BDO object with payees
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeSplits(bookBDO) {
  if (!bookBDO.payees || bookBDO.payees.length === 0) {
    console.log('ℹ️ No payees configured for this book');
    return [];
  }

  const totalAmount = bookBDO.price || 0;
  const splits = bookBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));

  console.log('💰 Payee splits:', splits);
  return splits;
}

/**
 * Create payment intent with Addie
 * @param {Object} bookBDO - Book BDO object
 * @param {Object} user - Fount user
 * @param {string} addieUrl - Addie service URL
 * @param {Array} payeeSplits - Array of payee splits
 * @returns {Object} Payment intent
 */
async function createPaymentIntent(bookBDO, user, addieUrl, payeeSplits) {
  try {
    // Use Tauri backend if available
    if (window.__TAURI__ && window.__TAURI__.core?.invoke) {
      const result = await window.__TAURI__.core.invoke('get_payment_intent_with_splits', {
        uuid: user.uuid,
        addieUrl: addieUrl,
        amount: bookBDO.price,
        description: `Purchase: ${bookBDO.title}`,
        splits: payeeSplits.map(s => ({
          destination: s.pubKey,
          amount: s.amount
        }))
      });

      return result;
    }

    // Fallback: direct HTTP call
    const response = await fetch(`${addieUrl}/payment/intent-with-splits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: user.uuid,
        amount: bookBDO.price,
        currency: 'usd',
        description: `Purchase: ${bookBDO.title}`,
        splits: payeeSplits.map(s => ({
          destination: s.pubKey,
          amount: s.amount
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Payment intent failed: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Payment intent error:', error);
    throw error;
  }
}

/**
 * Create download access nineum for purchased book
 * @param {Object} bookBDO - Book BDO object
 * @param {Object} user - Fount user
 * @param {string} fountUrl - Fount service URL
 * @returns {string} Nineum string
 */
async function createDownloadNineum(bookBDO, user, fountUrl) {
  try {
    // Create a specific flavor of nineum for this book
    // Use book UUID to generate consistent flavor
    const flavor = generateFlavorFromUUID(bookBDO.uuid);

    // Use Tauri backend if available
    if (window.__TAURI__ && window.__TAURI__.core?.invoke) {
      const result = await window.__TAURI__.core.invoke('grant_flavored_nineum', {
        uuid: user.uuid,
        fountUrl: fountUrl,
        charge: flavor.charge,
        direction: flavor.direction,
        rarity: flavor.rarity,
        size: flavor.size,
        texture: flavor.texture,
        shape: flavor.shape,
        quantity: 1
      });

      if (result && result.nineum && result.nineum.length > 0) {
        return result.nineum[0];
      }

      throw new Error('No nineum returned from grant');
    }

    // Fallback: direct HTTP call
    const response = await fetch(`${fountUrl}/user/${user.uuid}/nineum`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        charge: flavor.charge,
        direction: flavor.direction,
        rarity: flavor.rarity,
        size: flavor.size,
        texture: flavor.texture,
        shape: flavor.shape,
        quantity: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Nineum creation failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result && result.nineum && result.nineum.length > 0) {
      return result.nineum[0];
    }

    throw new Error('No nineum returned from grant');

  } catch (error) {
    console.error('❌ Nineum creation error:', error);
    throw error;
  }
}

/**
 * Generate consistent nineum flavor from book UUID
 * This ensures the same book always gets the same flavor
 * @param {string} uuid - Book UUID
 * @returns {Object} Flavor object with charge, direction, rarity, size, texture, shape
 */
function generateFlavorFromUUID(uuid) {
  // Use simple hash of UUID to pick flavor attributes
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  const charges = ['01', '02']; // positive, negative
  const directions = ['01', '02', '03', '04', '05', '06']; // n, s, e, w, up, down
  const rarities = ['01', '02', '03', '04', '05', '06', '09']; // common to nine
  const sizes = ['01', '02', '03', '04', '05', '06', '07', '08'];
  const textures = ['01', '02', '03', '04', '05', '06', '07', '08'];
  const shapes = ['01', '02', '03', '04', '05', '06', '07', '08'];

  return {
    charge: charges[Math.abs(hash) % charges.length],
    direction: directions[Math.abs(hash >> 2) % directions.length],
    rarity: rarities[Math.abs(hash >> 4) % rarities.length],
    size: sizes[Math.abs(hash >> 6) % sizes.length],
    texture: textures[Math.abs(hash >> 8) % textures.length],
    shape: shapes[Math.abs(hash >> 10) % shapes.length]
  };
}

/**
 * Handle spell cast events from AdvanceKey two-button BDO
 * @param {string} spell - Spell name
 * @param {Object} spellComponent - Spell component data
 * @param {Object} bookBDO - Book BDO object
 * @param {Object} user - Fount user
 * @param {Object} config - Environment configuration
 */
async function handleBookSpell(spell, spellComponent, bookBDO, user, config) {
  console.log('🪄 Handling book spell:', spell);

  switch (spell) {
    case 'saveToCarrierBag':
      if (window.CarrierBag) {
        const saved = window.CarrierBag.save(bookBDO);
        if (saved) {
          alert(`✅ Saved "${bookBDO.title}" to carrier bag!`);
        } else {
          alert(`❌ Failed to save to carrier bag`);
        }
      }
      break;

    case 'purchaseBook':
      const result = await purchaseBook(bookBDO, user, config);
      if (result.success) {
        alert(`✅ ${result.message}\n\n💎 Nineum: ${result.nineum}`);
      } else {
        alert(`❌ ${result.message}`);
      }
      break;

    default:
      console.warn('⚠️ Unknown spell:', spell);
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.BookPurchase = {
    purchase: purchaseBook,
    calculateSplits: calculatePayeeSplits,
    handleSpell: handleBookSpell,
    createDownloadNineum
  };
}

console.log('🛒 Book Purchase utilities loaded');
