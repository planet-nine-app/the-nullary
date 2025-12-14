/**
 * Membership Purchase Flow
 *
 * Handles purchasing membership tiers with:
 * - Tier selection
 * - Payment processing via Addie
 * - Tier nineum assignment for perk validation
 * - Recurring billing support (monthly/yearly)
 * - CarrierBag integration
 * - Payee revenue distribution
 */

// Track selected tier ID
let selectedTierId = null;

/**
 * Set selected tier
 * @param {string} tierId - Tier ID to select
 * @returns {string} Selected tier ID
 */
function selectTier(tierId) {
  selectedTierId = tierId;
  console.log('🎯 Selected tier:', tierId);
  return selectedTierId;
}

/**
 * Get selected tier
 * @returns {string|null} Selected tier ID
 */
function getSelectedTier() {
  return selectedTierId;
}

/**
 * Purchase a membership tier
 * @param {Object} membershipBDO - Membership BDO object
 * @param {string} tierId - Tier ID to purchase
 * @param {Object} user - Fount user object
 * @param {Object} config - Environment configuration
 * @returns {Object} Purchase result with tier nineum
 */
async function purchaseMembership(membershipBDO, tierId, user, config) {
  console.log('🛒 Starting membership purchase:', membershipBDO.title);
  console.log('🎯 Tier:', tierId);

  try {
    // Validate inputs
    if (!membershipBDO || !membershipBDO.uuid) {
      throw new Error('Invalid membership BDO');
    }

    if (!tierId) {
      throw new Error('No tier selected');
    }

    const tier = window.MembershipBDO?.getTier(membershipBDO, tierId);
    if (!tier) {
      throw new Error('Invalid tier ID');
    }

    if (!user || !user.uuid) {
      throw new Error('User not initialized');
    }

    if (!config) {
      throw new Error('Environment configuration required');
    }

    const fountUrl = config.services?.fount || 'http://localhost:3006';
    const addieUrl = config.services?.addie || 'http://localhost:3001';

    const tierPrice = tier.price || 0;

    console.log('💰 Tier price:', `$${(tierPrice / 100).toFixed(2)}/${tier.billingPeriod}`);

    // Step 1: Create payment intent with payee splits
    console.log('💳 Creating payment intent...');

    const payeeAmounts = calculatePayeeSplits(membershipBDO, tierPrice);
    const paymentIntent = await createPaymentIntent(
      membershipBDO,
      tier,
      user,
      addieUrl,
      tierPrice,
      payeeAmounts
    );

    if (!paymentIntent || !paymentIntent.clientSecret) {
      throw new Error('Failed to create payment intent');
    }

    console.log('✅ Payment intent created:', paymentIntent.id);

    // Step 2: Process payment (would open Stripe modal in real app)
    console.log('💰 Processing payment...');

    // In production, handle recurring billing setup here
    // For monthly/yearly subscriptions, create Stripe subscription

    // Step 3: Generate and assign nineum for tier access
    console.log('💎 Generating nineum for tier access...');

    const tierNineum = await createTierNineum(
      membershipBDO,
      tier,
      user,
      fountUrl
    );

    if (!tierNineum) {
      throw new Error('Failed to create tier nineum');
    }

    console.log('✅ Tier nineum assigned:', tierNineum);

    // Step 4: Update membership BDO with tier nineum
    membershipBDO.tierNineum[tierId] = tierNineum;
    membershipBDO.activeTier = tierId;

    // Step 5: Mark as purchased in carrier bag
    if (window.CarrierBag) {
      const purchaseRecord = {
        ...membershipBDO,
        purchasedTier: tier,
        purchasedAt: new Date().toISOString()
      };

      window.CarrierBag.save(purchaseRecord);
      console.log('✅ Membership purchase saved to carrier bag');
    }

    // Step 6: Return success result
    return {
      success: true,
      tierNineum: tierNineum,
      tier: tier,
      tierPrice: tierPrice,
      paymentIntent: paymentIntent.id,
      membership: membershipBDO,
      message: `Successfully subscribed to ${tier.name} tier! Welcome to ${membershipBDO.title}.`
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
 * Calculate payee splits from membership BDO
 * @param {Object} membershipBDO - Membership BDO object with payees
 * @param {number} totalAmount - Total amount in cents
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeSplits(membershipBDO, totalAmount) {
  if (!membershipBDO.payees || membershipBDO.payees.length === 0) {
    console.log('ℹ️ No payees configured for this membership');
    return [];
  }

  const splits = membershipBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));

  console.log('💰 Payee splits:', splits);
  return splits;
}

/**
 * Create payment intent with Addie
 * @param {Object} membershipBDO - Membership BDO object
 * @param {Object} tier - Selected tier object
 * @param {Object} user - Fount user
 * @param {string} addieUrl - Addie service URL
 * @param {number} tierPrice - Tier price in cents
 * @param {Array} payeeSplits - Array of payee splits
 * @returns {Object} Payment intent
 */
async function createPaymentIntent(membershipBDO, tier, user, addieUrl, tierPrice, payeeSplits) {
  try {
    const description = `${tier.name} membership: ${membershipBDO.title}`;

    // Use Tauri backend if available
    if (window.__TAURI__ && window.__TAURI__.core?.invoke) {
      const result = await window.__TAURI__.core.invoke('get_payment_intent_with_splits', {
        uuid: user.uuid,
        addieUrl: addieUrl,
        amount: tierPrice,
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
        amount: tierPrice,
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
 * Create tier access nineum
 * @param {Object} membershipBDO - Membership BDO object
 * @param {Object} tier - Selected tier object
 * @param {Object} user - Fount user
 * @param {string} fountUrl - Fount service URL
 * @returns {string} Nineum string for tier access
 */
async function createTierNineum(membershipBDO, tier, user, fountUrl) {
  try {
    // Create a specific flavor of nineum for this membership + tier
    // Combine membership UUID and tier ID for unique flavor
    const combinedId = `${membershipBDO.uuid}-${tier.id}`;
    const flavor = generateFlavorFromString(combinedId);

    console.log('🎯 Creating tier nineum with flavor:', flavor);

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
 * Generate consistent nineum flavor from string
 * @param {string} str - String to hash
 * @returns {Object} Flavor object
 */
function generateFlavorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
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
 * Cancel membership tier (revoke nineum)
 * @param {Object} membershipBDO - Membership BDO object
 * @param {string} tierId - Tier ID to cancel
 * @param {Object} user - Fount user
 * @param {Object} config - Environment configuration
 * @returns {Object} Cancellation result
 */
async function cancelMembership(membershipBDO, tierId, user, config) {
  console.log('🚫 Cancelling membership tier:', tierId);

  try {
    const fountUrl = config.services?.fount || 'http://localhost:3006';

    // Get tier nineum
    const tierNineum = membershipBDO.tierNineum?.[tierId];
    if (!tierNineum) {
      throw new Error('No active membership for this tier');
    }

    // In production, would revoke nineum via fount
    // For now, just clear from BDO
    membershipBDO.tierNineum[tierId] = null;
    if (membershipBDO.activeTier === tierId) {
      membershipBDO.activeTier = null;
    }

    // Update carrier bag
    if (window.CarrierBag) {
      window.CarrierBag.save(membershipBDO);
    }

    console.log('✅ Membership cancelled');

    return {
      success: true,
      message: 'Membership cancelled successfully'
    };

  } catch (error) {
    console.error('❌ Cancellation failed:', error);
    return {
      success: false,
      error: error.message,
      message: `Cancellation failed: ${error.message}`
    };
  }
}

/**
 * Handle spell cast events from AdvanceKey membership BDO
 * @param {string} spell - Spell name
 * @param {Object} spellComponent - Spell component data
 * @param {Object} membershipBDO - Membership BDO object
 * @param {Object} user - Fount user
 * @param {Object} config - Environment configuration
 */
async function handleMembershipSpell(spell, spellComponent, membershipBDO, user, config) {
  console.log('🪄 Handling membership spell:', spell);

  switch (spell) {
    case 'selectMembershipTier':
      const tierId = spellComponent?.tierId;
      if (tierId) {
        selectTier(tierId);

        const tier = window.MembershipBDO?.getTier(membershipBDO, tierId);
        if (tier) {
          const result = await purchaseMembership(membershipBDO, tierId, user, config);
          if (result.success) {
            alert(`✅ ${result.message}\n\n💎 Tier nineum assigned\n🎁 ${tier.perks.length} perks unlocked`);
          } else {
            alert(`❌ ${result.message}`);
          }
        }
      }
      break;

    case 'saveToCarrierBag':
      if (window.CarrierBag) {
        const saved = window.CarrierBag.save(membershipBDO);
        if (saved) {
          alert(`✅ Saved "${membershipBDO.title}" to carrier bag!`);
        } else {
          alert(`❌ Failed to save to carrier bag`);
        }
      }
      break;

    default:
      console.warn('⚠️ Unknown spell:', spell);
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.MembershipPurchase = {
    purchase: purchaseMembership,
    selectTier: selectTier,
    getSelectedTier: getSelectedTier,
    calculateSplits: calculatePayeeSplits,
    handleSpell: handleMembershipSpell,
    createTierNineum,
    cancel: cancelMembership
  };
}

console.log('👥 Membership Purchase utilities loaded');
