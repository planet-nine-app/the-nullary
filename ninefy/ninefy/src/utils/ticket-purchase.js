/**
 * Ticket Purchase Flow
 *
 * Handles purchasing event tickets with:
 * - Quantity selection (multiple tickets)
 * - Payment processing via Addie
 * - Multiple nineum assignment (1 nineum per ticket)
 * - CarrierBag integration
 * - Payee revenue distribution
 */

// Track current ticket quantity in memory
let currentTicketQuantity = 1;

/**
 * Get current ticket quantity
 * @returns {number} Current quantity
 */
function getTicketQuantity() {
  return currentTicketQuantity;
}

/**
 * Set ticket quantity
 * @param {number} quantity - New quantity (min 1, max 10)
 * @returns {number} Actual quantity set
 */
function setTicketQuantity(quantity) {
  currentTicketQuantity = Math.max(1, Math.min(10, quantity));
  console.log('🎫 Ticket quantity set to:', currentTicketQuantity);
  return currentTicketQuantity;
}

/**
 * Increase ticket quantity
 * @returns {number} New quantity
 */
function increaseQuantity() {
  return setTicketQuantity(currentTicketQuantity + 1);
}

/**
 * Decrease ticket quantity
 * @returns {number} New quantity
 */
function decreaseQuantity() {
  return setTicketQuantity(currentTicketQuantity - 1);
}

/**
 * Update SVG display with new quantity and total price
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {number} quantity - New quantity
 */
function updateTicketDisplay(ticketBDO, quantity) {
  const quantityElement = document.getElementById('ticketQuantity');
  const totalPriceElement = document.getElementById('totalPrice');

  if (quantityElement) {
    quantityElement.textContent = quantity.toString();
  }

  if (totalPriceElement && ticketBDO.price) {
    const totalPrice = (ticketBDO.price * quantity) / 100;
    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
  }
}

/**
 * Purchase tickets and assign nineum for each ticket
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {number} quantity - Number of tickets to purchase
 * @param {Object} user - Fount user object
 * @param {Object} config - Environment configuration
 * @returns {Object} Purchase result with nineum array
 */
async function purchaseTickets(ticketBDO, quantity, user, config) {
  console.log('🛒 Starting ticket purchase:', ticketBDO.title);
  console.log('🎫 Quantity:', quantity);

  try {
    // Validate inputs
    if (!ticketBDO || !ticketBDO.uuid) {
      throw new Error('Invalid ticket BDO');
    }

    if (!user || !user.uuid) {
      throw new Error('User not initialized');
    }

    if (!config) {
      throw new Error('Environment configuration required');
    }

    if (quantity < 1 || quantity > 10) {
      throw new Error('Quantity must be between 1 and 10');
    }

    const fountUrl = config.services?.fount || 'http://localhost:3006';
    const addieUrl = config.services?.addie || 'http://localhost:3001';

    // Calculate total amount
    const totalAmount = ticketBDO.price * quantity;
    console.log('💰 Total amount:', `$${(totalAmount / 100).toFixed(2)}`);

    // Step 1: Create payment intent with payee splits
    console.log('💳 Creating payment intent...');

    const payeeAmounts = calculatePayeeSplits(ticketBDO, totalAmount);
    const paymentIntent = await createPaymentIntent(
      ticketBDO,
      user,
      addieUrl,
      totalAmount,
      quantity,
      payeeAmounts
    );

    if (!paymentIntent || !paymentIntent.clientSecret) {
      throw new Error('Failed to create payment intent');
    }

    console.log('✅ Payment intent created:', paymentIntent.id);

    // Step 2: Process payment (would open Stripe modal in real app)
    console.log('💰 Processing payment...');

    // Step 3: Generate and assign nineum for each ticket
    console.log('💎 Generating', quantity, 'nineum for ticket access...');

    const nineumArray = await createTicketNineum(ticketBDO, quantity, user, fountUrl);

    if (!nineumArray || nineumArray.length !== quantity) {
      throw new Error(`Failed to create ${quantity} ticket nineum`);
    }

    console.log('✅ Nineum assigned:', nineumArray);

    // Step 4: Mark as purchased in carrier bag with all nineum
    if (window.CarrierBag) {
      // Store ticket purchase with all nineum
      const purchaseRecord = {
        ...ticketBDO,
        quantity,
        totalAmount,
        ticketNineum: nineumArray,
        purchasedAt: new Date().toISOString()
      };

      // Save/update in carrier bag
      window.CarrierBag.save(purchaseRecord);
      console.log('✅ Ticket purchase saved to carrier bag');
    }

    // Step 5: Return success result
    return {
      success: true,
      nineum: nineumArray,
      quantity,
      totalAmount,
      paymentIntent: paymentIntent.id,
      ticket: ticketBDO,
      message: `Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''} for "${ticketBDO.title}". Your ${quantity} access nineum have been assigned!`
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
 * Calculate payee splits from ticket BDO and total amount
 * @param {Object} ticketBDO - Ticket BDO object with payees
 * @param {number} totalAmount - Total amount in cents
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeSplits(ticketBDO, totalAmount) {
  if (!ticketBDO.payees || ticketBDO.payees.length === 0) {
    console.log('ℹ️ No payees configured for this ticket');
    return [];
  }

  const splits = ticketBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));

  console.log('💰 Payee splits:', splits);
  return splits;
}

/**
 * Create payment intent with Addie
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {Object} user - Fount user
 * @param {string} addieUrl - Addie service URL
 * @param {number} totalAmount - Total amount in cents
 * @param {number} quantity - Number of tickets
 * @param {Array} payeeSplits - Array of payee splits
 * @returns {Object} Payment intent
 */
async function createPaymentIntent(ticketBDO, user, addieUrl, totalAmount, quantity, payeeSplits) {
  try {
    const description = `${quantity} ticket${quantity > 1 ? 's' : ''}: ${ticketBDO.title}`;

    // Use Tauri backend if available
    if (window.__TAURI__ && window.__TAURI__.core?.invoke) {
      const result = await window.__TAURI__.core.invoke('get_payment_intent_with_splits', {
        uuid: user.uuid,
        addieUrl: addieUrl,
        amount: totalAmount,
        description: description,
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
        amount: totalAmount,
        currency: 'usd',
        description: description,
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
 * Create ticket access nineum (1 per ticket)
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {number} quantity - Number of tickets (nineum to create)
 * @param {Object} user - Fount user
 * @param {string} fountUrl - Fount service URL
 * @returns {Array<string>} Array of nineum strings
 */
async function createTicketNineum(ticketBDO, quantity, user, fountUrl) {
  try {
    // Create a specific flavor of nineum for this ticket
    const flavor = generateFlavorFromUUID(ticketBDO.uuid);

    console.log('🎫 Creating', quantity, 'nineum with flavor:', flavor);

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
        quantity: quantity
      });

      if (result && result.nineum && result.nineum.length === quantity) {
        return result.nineum;
      }

      throw new Error(`Expected ${quantity} nineum, got ${result?.nineum?.length || 0}`);
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
        quantity: quantity
      })
    });

    if (!response.ok) {
      throw new Error(`Nineum creation failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result && result.nineum && result.nineum.length === quantity) {
      return result.nineum;
    }

    throw new Error(`Expected ${quantity} nineum, got ${result?.nineum?.length || 0}`);

  } catch (error) {
    console.error('❌ Nineum creation error:', error);
    throw error;
  }
}

/**
 * Generate consistent nineum flavor from ticket UUID
 * @param {string} uuid - Ticket UUID
 * @returns {Object} Flavor object
 */
function generateFlavorFromUUID(uuid) {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
    hash = hash & hash;
  }

  const charges = ['01', '02'];
  const directions = ['01', '02', '03', '04', '05', '06'];
  const rarities = ['01', '02', '03', '04', '05', '06', '09'];
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
 * Handle spell cast events from AdvanceKey ticket BDO
 * @param {string} spell - Spell name
 * @param {Object} spellComponent - Spell component data
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {Object} user - Fount user
 * @param {Object} config - Environment configuration
 */
async function handleTicketSpell(spell, spellComponent, ticketBDO, user, config) {
  console.log('🪄 Handling ticket spell:', spell);

  switch (spell) {
    case 'increaseTicketQuantity':
      const newQtyInc = increaseQuantity();
      updateTicketDisplay(ticketBDO, newQtyInc);
      break;

    case 'decreaseTicketQuantity':
      const newQtyDec = decreaseQuantity();
      updateTicketDisplay(ticketBDO, newQtyDec);
      break;

    case 'saveToCarrierBag':
      if (window.CarrierBag) {
        const saved = window.CarrierBag.save(ticketBDO);
        if (saved) {
          alert(`✅ Saved "${ticketBDO.title}" to carrier bag!`);
        } else {
          alert(`❌ Failed to save to carrier bag`);
        }
      }
      break;

    case 'purchaseTickets':
      const quantity = getTicketQuantity();
      const result = await purchaseTickets(ticketBDO, quantity, user, config);
      if (result.success) {
        alert(`✅ ${result.message}\n\n💎 Nineum (${result.nineum.length}):\n${result.nineum.slice(0, 3).join('\n')}${result.nineum.length > 3 ? '\n...' : ''}`);
        // Reset quantity to 1 after successful purchase
        setTicketQuantity(1);
        updateTicketDisplay(ticketBDO, 1);
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
  window.TicketPurchase = {
    purchase: purchaseTickets,
    getQuantity: getTicketQuantity,
    setQuantity: setTicketQuantity,
    increase: increaseQuantity,
    decrease: decreaseQuantity,
    updateDisplay: updateTicketDisplay,
    calculateSplits: calculatePayeeSplits,
    handleSpell: handleTicketSpell,
    createTicketNineum
  };
}

console.log('🎫 Ticket Purchase utilities loaded');
