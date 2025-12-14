/**
 * Course Purchase Flow
 *
 * Handles purchasing online courses with:
 * - Payment processing via Addie
 * - Lesson-by-lesson nineum assignment (1 nineum per lesson)
 * - Progressive access control
 * - CarrierBag integration
 * - Payee revenue distribution
 */

/**
 * Purchase a course and assign nineum for each lesson
 * @param {Object} courseBDO - Course BDO object
 * @param {Object} user - Fount user object
 * @param {Object} config - Environment configuration
 * @returns {Object} Purchase result with lesson nineum array
 */
async function purchaseCourse(courseBDO, user, config) {
  console.log('🛒 Starting course purchase:', courseBDO.title);
  console.log('📚 Lessons:', courseBDO.lessons?.length || 0);

  try {
    // Validate inputs
    if (!courseBDO || !courseBDO.uuid) {
      throw new Error('Invalid course BDO');
    }

    if (!courseBDO.lessons || courseBDO.lessons.length === 0) {
      throw new Error('Course has no lessons');
    }

    if (!user || !user.uuid) {
      throw new Error('User not initialized');
    }

    if (!config) {
      throw new Error('Environment configuration required');
    }

    const fountUrl = config.services?.fount || 'http://localhost:3006';
    const addieUrl = config.services?.addie || 'http://localhost:3001';

    const lessonCount = courseBDO.lessons.length;
    const totalAmount = courseBDO.price || 0;

    console.log('💰 Total amount:', `$${(totalAmount / 100).toFixed(2)}`);

    // Step 1: Create payment intent with payee splits
    console.log('💳 Creating payment intent...');

    const payeeAmounts = calculatePayeeSplits(courseBDO, totalAmount);
    const paymentIntent = await createPaymentIntent(
      courseBDO,
      user,
      addieUrl,
      totalAmount,
      payeeAmounts
    );

    if (!paymentIntent || !paymentIntent.clientSecret) {
      throw new Error('Failed to create payment intent');
    }

    console.log('✅ Payment intent created:', paymentIntent.id);

    // Step 2: Process payment (would open Stripe modal in real app)
    console.log('💰 Processing payment...');

    // Step 3: Generate and assign nineum for each lesson
    console.log('💎 Generating', lessonCount, 'nineum for lesson access...');

    const lessonNineum = await createLessonNineum(
      courseBDO,
      lessonCount,
      user,
      fountUrl
    );

    if (!lessonNineum || lessonNineum.length !== lessonCount) {
      throw new Error(`Failed to create ${lessonCount} lesson nineum`);
    }

    console.log('✅ Lesson nineum assigned:', lessonNineum);

    // Step 4: Mark as purchased in carrier bag with all lesson nineum
    if (window.CarrierBag) {
      const purchaseRecord = {
        ...courseBDO,
        lessonNineum: lessonNineum,
        purchasedAt: new Date().toISOString()
      };

      window.CarrierBag.save(purchaseRecord);
      console.log('✅ Course purchase saved to carrier bag');
    }

    // Step 5: Return success result
    return {
      success: true,
      lessonNineum: lessonNineum,
      lessonCount: lessonCount,
      totalAmount: totalAmount,
      paymentIntent: paymentIntent.id,
      course: courseBDO,
      message: `Successfully purchased "${courseBDO.title}". You now have access to all ${lessonCount} lessons!`
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
 * Calculate payee splits from course BDO
 * @param {Object} courseBDO - Course BDO object with payees
 * @param {number} totalAmount - Total amount in cents
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeSplits(courseBDO, totalAmount) {
  if (!courseBDO.payees || courseBDO.payees.length === 0) {
    console.log('ℹ️ No payees configured for this course');
    return [];
  }

  const splits = courseBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));

  console.log('💰 Payee splits:', splits);
  return splits;
}

/**
 * Create payment intent with Addie
 * @param {Object} courseBDO - Course BDO object
 * @param {Object} user - Fount user
 * @param {string} addieUrl - Addie service URL
 * @param {number} totalAmount - Total amount in cents
 * @param {Array} payeeSplits - Array of payee splits
 * @returns {Object} Payment intent
 */
async function createPaymentIntent(courseBDO, user, addieUrl, totalAmount, payeeSplits) {
  try {
    const description = `Course: ${courseBDO.title}`;

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
 * Create lesson access nineum (1 per lesson)
 * @param {Object} courseBDO - Course BDO object
 * @param {number} lessonCount - Number of lessons (nineum to create)
 * @param {Object} user - Fount user
 * @param {string} fountUrl - Fount service URL
 * @returns {Array<string>} Array of nineum strings (1 per lesson)
 */
async function createLessonNineum(courseBDO, lessonCount, user, fountUrl) {
  try {
    // Create a specific flavor of nineum for this course
    const flavor = generateFlavorFromUUID(courseBDO.uuid);

    console.log('📚 Creating', lessonCount, 'lesson nineum with flavor:', flavor);

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
        quantity: lessonCount
      });

      if (result && result.nineum && result.nineum.length === lessonCount) {
        return result.nineum;
      }

      throw new Error(`Expected ${lessonCount} nineum, got ${result?.nineum?.length || 0}`);
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
        quantity: lessonCount
      })
    });

    if (!response.ok) {
      throw new Error(`Nineum creation failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result && result.nineum && result.nineum.length === lessonCount) {
      return result.nineum;
    }

    throw new Error(`Expected ${lessonCount} nineum, got ${result?.nineum?.length || 0}`);

  } catch (error) {
    console.error('❌ Nineum creation error:', error);
    throw error;
  }
}

/**
 * Generate consistent nineum flavor from course UUID
 * @param {string} uuid - Course UUID
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
 * Get lesson video/materials with access check
 * @param {Object} courseBDO - Course BDO object
 * @param {string} lessonId - Lesson ID
 * @param {Object} user - Fount user object
 * @returns {Object|null} Lesson data if user has access, null otherwise
 */
function getLessonContent(courseBDO, lessonId, user) {
  // Find lesson
  const lesson = courseBDO.lessons?.find(l => l.id === lessonId);
  if (!lesson) {
    console.error('❌ Lesson not found:', lessonId);
    return null;
  }

  // Check access
  if (!window.CourseBDO?.hasLessonAccess(courseBDO, lessonId, user)) {
    console.log('🔒 Access denied to lesson:', lessonId);
    return null;
  }

  console.log('✅ Access granted to lesson:', lesson.title);
  return lesson;
}

/**
 * Get course progress for user
 * @param {Object} courseBDO - Course BDO object
 * @param {Object} user - Fount user object
 * @returns {Object} Progress information
 */
function getCourseProgress(courseBDO, user) {
  const totalLessons = courseBDO.lessons?.length || 0;
  const accessibleLessons = window.CourseBDO?.getAccessibleLessons(courseBDO, user) || [];
  const accessibleCount = accessibleLessons.length;

  const progress = totalLessons > 0 ? (accessibleCount / totalLessons) * 100 : 0;

  return {
    totalLessons,
    accessibleCount,
    progress: Math.round(progress),
    isComplete: progress === 100,
    accessibleLessons
  };
}

/**
 * Handle spell cast events from AdvanceKey course BDO
 * @param {string} spell - Spell name
 * @param {Object} spellComponent - Spell component data
 * @param {Object} courseBDO - Course BDO object
 * @param {Object} user - Fount user
 * @param {Object} config - Environment configuration
 */
async function handleCourseSpell(spell, spellComponent, courseBDO, user, config) {
  console.log('🪄 Handling course spell:', spell);

  switch (spell) {
    case 'saveToCarrierBag':
      if (window.CarrierBag) {
        const saved = window.CarrierBag.save(courseBDO);
        if (saved) {
          alert(`✅ Saved "${courseBDO.title}" to carrier bag!`);
        } else {
          alert(`❌ Failed to save to carrier bag`);
        }
      }
      break;

    case 'purchaseCourse':
      const result = await purchaseCourse(courseBDO, user, config);
      if (result.success) {
        alert(`✅ ${result.message}\n\n💎 ${result.lessonCount} lesson nineum assigned`);
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
  window.CoursePurchase = {
    purchase: purchaseCourse,
    calculateSplits: calculatePayeeSplits,
    handleSpell: handleCourseSpell,
    createLessonNineum,
    getLessonContent,
    getProgress: getCourseProgress
  };
}

console.log('📖 Course Purchase utilities loaded');
