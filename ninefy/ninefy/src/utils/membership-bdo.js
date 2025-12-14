/**
 * Membership BDO Utilities
 *
 * Handles creation and management of shareable membership BDOs with:
 * - Multiple membership tiers (Basic, Premium, Elite, etc.)
 * - Tier-specific perks and benefits
 * - Payee arrays for revenue sharing
 * - Tier selector interface
 * - Tier-based nineum for perk validation
 */

/**
 * Example membership product structure
 */
const EXAMPLE_MEMBERSHIP = {
  id: 'membership-planet-nine-community-001',
  uuid: null, // Will be generated via sessionless
  type: 'membership',
  title: 'Planet Nine Developer Community',
  organization: 'Open Source Force',
  description: 'Join the Planet Nine developer community and get exclusive access to resources, support, events, and more. Choose the tier that fits your needs.',
  membershipImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
  category: 'community',
  tags: ['developer', 'community', 'support', 'events'],

  // Membership tiers
  tiers: [
    {
      id: 'tier-basic',
      name: 'Basic',
      description: 'Perfect for getting started',
      price: 990, // $9.90/month
      billingPeriod: 'monthly',
      order: 1,
      perks: [
        'Access to community forum',
        'Monthly newsletter',
        'Basic documentation',
        'Community events'
      ],
      limits: {
        apiCalls: 1000,
        storage: '1 GB',
        support: 'Community forum only'
      }
    },
    {
      id: 'tier-premium',
      name: 'Premium',
      description: 'Most popular for active developers',
      price: 2990, // $29.90/month
      billingPeriod: 'monthly',
      order: 2,
      featured: true, // Highlight this tier
      perks: [
        'Everything in Basic',
        'Priority support',
        'Advanced tutorials',
        'Private Discord channel',
        'Early access to features',
        'Quarterly virtual meetups'
      ],
      limits: {
        apiCalls: 10000,
        storage: '10 GB',
        support: 'Email within 24 hours'
      }
    },
    {
      id: 'tier-elite',
      name: 'Elite',
      description: 'For teams and power users',
      price: 9900, // $99.00/month
      billingPeriod: 'monthly',
      order: 3,
      perks: [
        'Everything in Premium',
        '1-on-1 consulting sessions',
        'Custom integration support',
        'Beta feature access',
        'Team collaboration tools',
        'Annual in-person conference ticket',
        'Exclusive swag package'
      ],
      limits: {
        apiCalls: 100000,
        storage: '100 GB',
        support: 'Priority Slack channel'
      }
    }
  ],

  metadata: {
    available: true,
    memberCount: 3421,
    rating: 4.9,
    reviews: 892,
    cancelAnytime: true,
    freeTrial: '14 days',
    benefits: [
      'Connect with thousands of developers',
      'Learn from experts',
      'Build better applications',
      'Stay ahead of the curve'
    ]
  },

  // Shareable BDO specific fields
  payees: [], // Array of {pubKey: string, percentage: number}

  // Tier nineum (1 nineum per active tier)
  // Used to validate member tier and perks
  tierNineum: {
    'tier-basic': null,
    'tier-premium': null,
    'tier-elite': null
  },

  // Current active tier for user
  activeTier: null,

  // SVG content for AdvanceKey display
  svgContent: null // Will be generated
};

/**
 * Generate SVG content for membership BDO display in AdvanceKey
 * Shows tier comparison with pricing and perks
 * @param {Object} membership - Membership product object
 * @returns {string} SVG markup for display
 */
function generateMembershipSVG(membership) {
  // Extract membership details
  const title = membership.title || 'Untitled Membership';
  const organization = membership.organization || 'Organization';
  const membershipImage = membership.membershipImage || '';
  const tiers = membership.tiers || [];

  // Word wrap title
  const maxTitleLength = 35;
  const titleLines = [];
  const words = title.split(' ');
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxTitleLength) {
      titleLines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  if (currentLine) titleLines.push(currentLine.trim());

  // Generate tier cards (show up to 3 tiers)
  const tierCards = tiers.slice(0, 3).map((tier, idx) => {
    const x = 30 + (idx * 120);
    const y = titleLines[2] ? 370 : titleLines[1] ? 350 : 330;
    const isFeatured = tier.featured;
    const price = `$${(tier.price / 100).toFixed(0)}`;

    return `
  <!-- Tier ${idx + 1}: ${tier.name} -->
  <rect x="${x}" y="${y}" width="110" height="220"
        fill="${isFeatured ? '#3498db' : '#2c3e50'}"
        stroke="${isFeatured ? '#2980b9' : '#7f8c8d'}"
        stroke-width="${isFeatured ? '3' : '2'}"
        rx="8"/>

  ${isFeatured ? `<rect x="${x}" y="${y}" width="110" height="25" fill="#f39c12" rx="8"/>
  <text x="${x + 55}" y="${y + 17}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">POPULAR</text>` : ''}

  <text x="${x + 55}" y="${y + (isFeatured ? 45 : 25)}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${tier.name}</text>
  <text x="${x + 55}" y="${y + (isFeatured ? 65 : 45)}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#f39c12" text-anchor="middle">${price}</text>
  <text x="${x + 55}" y="${y + (isFeatured ? 80 : 60)}" font-family="Arial, sans-serif" font-size="9" fill="#95a5a6" text-anchor="middle">/month</text>

  <!-- Perks (show first 4) -->
  ${tier.perks.slice(0, 4).map((perk, perkIdx) => {
    const perkY = y + (isFeatured ? 100 : 80) + (perkIdx * 25);
    const shortPerk = perk.length > 14 ? perk.substring(0, 13) + '...' : perk;
    return `<text x="${x + 10}" y="${perkY}" font-family="Arial, sans-serif" font-size="8" fill="#bdc3c7">✓ ${shortPerk}</text>`;
  }).join('')}

  ${tier.perks.length > 4 ? `<text x="${x + 55}" y="${y + (isFeatured ? 200 : 180)}" font-family="Arial, sans-serif" font-size="8" fill="#7f8c8d" text-anchor="middle">+${tier.perks.length - 4} more</text>` : ''}

  <!-- Select button -->
  <rect id="selectTier${idx}" data-spell="selectMembershipTier" data-spell-component='{"tierId":"${tier.id}"}'
        x="${x + 10}" y="${y + 195}" width="90" height="20"
        fill="${isFeatured ? '#27ae60' : '#3498db'}"
        rx="4" style="cursor:pointer"/>
  <text x="${x + 55}" y="${y + 209}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">Select</text>`;
  }).join('');

  // Generate SVG (400x650)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="650" viewBox="0 0 400 650">
  <defs>
    <linearGradient id="membershipBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#34495e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="saveBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="650" fill="url(#membershipBg)" rx="10"/>

  <!-- Membership image -->
  <rect x="50" y="30" width="300" height="140" fill="#1a1a1a" rx="5"/>
  ${membershipImage ? `<image href="${membershipImage}" x="50" y="30" width="300" height="140" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 5px)"/>` : ''}

  <!-- Membership info -->
  <text x="200" y="195" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[0] || ''}</text>
  ${titleLines[1] ? `<text x="200" y="215" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[1]}</text>` : ''}
  ${titleLines[2] ? `<text x="200" y="235" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[2]}</text>` : ''}

  <text x="200" y="${titleLines[2] ? 260 : titleLines[1] ? 240 : 220}" font-family="Arial, sans-serif" font-size="14" fill="#bdc3c7" text-anchor="middle">by ${organization}</text>

  <!-- Member count -->
  <text x="200" y="${titleLines[2] ? 285 : titleLines[1] ? 265 : 245}" font-family="Arial, sans-serif" font-size="12" fill="#95a5a6" text-anchor="middle">👥 ${membership.metadata?.memberCount || 0} members</text>

  <!-- Tier comparison heading -->
  <text x="200" y="${titleLines[2] ? 325 : titleLines[1] ? 305 : 285}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ecf0f1" text-anchor="middle">Choose Your Tier</text>

  <!-- Tier cards -->
  ${tierCards}

  <!-- Save button (bottom) -->
  <rect id="button1" data-spell="saveToCarrierBag" data-spell-component="membershipBdo"
        x="125" y="595" width="150" height="40" fill="url(#saveBtn)" rx="8" style="cursor:pointer"/>
  <text x="200" y="620" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">💾 Save for Later</text>
</svg>`;
}

/**
 * Create a complete membership BDO ready for sharing
 * @param {Object} membershipData - Membership product data
 * @param {Array} payees - Array of {pubKey, percentage} objects
 * @returns {Object} Complete BDO structure
 */
function createMembershipBDO(membershipData, payees = []) {
  // Validate payees add up to 100%
  const totalPercentage = payees.reduce((sum, p) => sum + (p.percentage || 0), 0);
  if (payees.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
    console.warn(`⚠️ Payee percentages total ${totalPercentage}% instead of 100%`);
  }

  // Generate UUID if not provided
  const uuid = membershipData.uuid || (window.sessionless ? window.sessionless.generateUUID() : 'temp-' + Date.now());

  // Initialize tier nineum object
  const tierNineum = {};
  if (membershipData.tiers) {
    membershipData.tiers.forEach(tier => {
      tierNineum[tier.id] = null;
    });
  }

  // Create complete membership object
  const membership = {
    ...membershipData,
    uuid,
    payees: [...payees],
    tierNineum: tierNineum,
    activeTier: null,
    svgContent: generateMembershipSVG(membershipData)
  };

  console.log('👥 Created membership BDO:', membership.title);
  console.log('🎯 Tiers:', membership.tiers?.length || 0);
  console.log('💰 Payees:', membership.payees.length);

  return membership;
}

/**
 * Add a payee to a membership BDO
 * @param {Object} membershipBDO - Membership BDO object
 * @param {string} pubKey - Public key of payee
 * @param {number} percentage - Percentage of revenue (0-100)
 * @returns {Object} Updated membership BDO
 */
function addPayee(membershipBDO, pubKey, percentage) {
  if (!membershipBDO.payees) {
    membershipBDO.payees = [];
  }

  const existingIndex = membershipBDO.payees.findIndex(p => p.pubKey === pubKey);

  if (existingIndex >= 0) {
    membershipBDO.payees[existingIndex].percentage = percentage;
    console.log('✏️ Updated payee percentage:', pubKey.substring(0, 10) + '...', percentage + '%');
  } else {
    membershipBDO.payees.push({ pubKey, percentage });
    console.log('➕ Added new payee:', pubKey.substring(0, 10) + '...', percentage + '%');
  }

  return membershipBDO;
}

/**
 * Remove a payee from a membership BDO
 * @param {Object} membershipBDO - Membership BDO object
 * @param {string} pubKey - Public key of payee to remove
 * @returns {Object} Updated membership BDO
 */
function removePayee(membershipBDO, pubKey) {
  if (!membershipBDO.payees) {
    return membershipBDO;
  }

  const originalLength = membershipBDO.payees.length;
  membershipBDO.payees = membershipBDO.payees.filter(p => p.pubKey !== pubKey);

  if (membershipBDO.payees.length < originalLength) {
    console.log('➖ Removed payee:', pubKey.substring(0, 10) + '...');
  }

  return membershipBDO;
}

/**
 * Calculate payee amounts from membership price
 * @param {Object} membershipBDO - Membership BDO object
 * @param {number} totalAmount - Total amount in cents
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeAmounts(membershipBDO, totalAmount) {
  if (!membershipBDO.payees || membershipBDO.payees.length === 0) {
    return [];
  }

  return membershipBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));
}

/**
 * Get tier by ID
 * @param {Object} membershipBDO - Membership BDO object
 * @param {string} tierId - Tier ID
 * @returns {Object|null} Tier object or null
 */
function getTier(membershipBDO, tierId) {
  if (!membershipBDO.tiers) return null;
  return membershipBDO.tiers.find(t => t.id === tierId) || null;
}

/**
 * Check if user has active membership tier
 * @param {Object} membershipBDO - Membership BDO object
 * @param {string} tierId - Tier ID to check
 * @param {Object} user - Fount user object
 * @returns {boolean} True if user has this tier
 */
function hasTierAccess(membershipBDO, tierId, user) {
  if (!membershipBDO.tierNineum || !membershipBDO.tierNineum[tierId]) {
    return false;
  }

  if (!user || !user.nineum || !Array.isArray(user.nineum)) {
    return false;
  }

  const tierNineum = membershipBDO.tierNineum[tierId];
  return tierNineum && user.nineum.includes(tierNineum);
}

/**
 * Get user's active tier
 * @param {Object} membershipBDO - Membership BDO object
 * @param {Object} user - Fount user object
 * @returns {Object|null} Active tier object or null
 */
function getActiveTier(membershipBDO, user) {
  if (!membershipBDO.tiers) return null;

  for (const tier of membershipBDO.tiers) {
    if (hasTierAccess(membershipBDO, tier.id, user)) {
      return tier;
    }
  }

  return null;
}

/**
 * Check if user has access to specific perk
 * @param {Object} membershipBDO - Membership BDO object
 * @param {string} perkName - Perk to check
 * @param {Object} user - Fount user object
 * @returns {boolean} True if user has access to this perk
 */
function hasPerkAccess(membershipBDO, perkName, user) {
  const activeTier = getActiveTier(membershipBDO, user);
  if (!activeTier) return false;

  return activeTier.perks.includes(perkName);
}

// Export functions
if (typeof window !== 'undefined') {
  window.MembershipBDO = {
    EXAMPLE_MEMBERSHIP,
    generateMembershipSVG,
    createMembershipBDO,
    addPayee,
    removePayee,
    calculatePayeeAmounts,
    getTier,
    hasTierAccess,
    getActiveTier,
    hasPerkAccess
  };
}

console.log('👥 Membership BDO utilities loaded');
