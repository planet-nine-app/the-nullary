/**
 * Ticket BDO Utilities
 *
 * Handles creation and management of shareable ticket BDOs with:
 * - Event metadata
 * - Quantity selector for multiple ticket purchases
 * - Payee arrays for revenue sharing
 * - Two-button interface (save/purchase)
 * - Nineum assignment on purchase for ticket access
 */

/**
 * Example ticket product structure
 */
const EXAMPLE_TICKET = {
  id: 'ticket-planet-nine-conf-2025',
  uuid: null, // Will be generated via sessionless
  type: 'ticket',
  title: 'Planet Nine Developer Conference 2025',
  organizer: 'Open Source Force',
  description: 'Join us for 3 days of talks, workshops, and networking with the Planet Nine community. Learn about the latest in decentralized protocols, MAGIC spells, and allyabase architecture.',
  eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
  price: 12900, // $129.00 per ticket
  venue: 'San Francisco Convention Center',
  address: '747 Howard St, San Francisco, CA 94103',
  eventDate: '2025-06-15',
  eventTime: '09:00 AM',
  duration: '3 days',
  capacity: 500,
  availableTickets: 500,
  category: 'conference',
  tags: ['developer', 'blockchain', 'decentralized', 'networking'],

  metadata: {
    available: true,
    transferable: true,
    refundable: false,
    ageRestriction: '18+',
    includedPerks: [
      'All conference sessions',
      'Workshop access',
      'Networking events',
      'Conference swag bag',
      'Lunch & refreshments'
    ]
  },

  // Shareable BDO specific fields
  payees: [], // Array of {pubKey: string, percentage: number}

  // Ticket access (each ticket gets unique nineum)
  // Purchaser receives N nineum for N tickets
  ticketNineum: [], // Populated after purchase

  // SVG content for AdvanceKey display
  svgContent: null // Will be generated
};

/**
 * Generate SVG content for ticket BDO display in AdvanceKey
 * Includes quantity selector (- [qty] +) and two buttons (Save | Purchase)
 * @param {Object} ticket - Ticket product object
 * @returns {string} SVG markup for display
 */
function generateTicketSVG(ticket) {
  // Extract ticket details
  const title = ticket.title || 'Untitled Event';
  const organizer = ticket.organizer || 'Unknown Organizer';
  const price = ticket.price ? `$${(ticket.price / 100).toFixed(2)}` : 'Free';
  const eventImage = ticket.eventImage || '';
  const venue = ticket.venue || 'TBA';
  const eventDate = ticket.eventDate ? new Date(ticket.eventDate).toLocaleDateString() : 'TBA';
  const eventTime = ticket.eventTime || '';

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

  // Generate SVG (400x650 to accommodate quantity selector)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="650" viewBox="0 0 400 650">
  <defs>
    <linearGradient id="ticketBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#34495e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="saveBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="purchaseBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#27ae60;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#229954;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="quantityBtn" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#7f8c8d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#95a5a6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="650" fill="url(#ticketBg)" rx="10"/>

  <!-- Event image -->
  <rect x="50" y="30" width="300" height="180" fill="#1a1a1a" rx="5"/>
  ${eventImage ? `<image href="${eventImage}" x="50" y="30" width="300" height="180" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 5px)"/>` : ''}

  <!-- Event info section -->
  <text x="200" y="235" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[0] || ''}</text>
  ${titleLines[1] ? `<text x="200" y="255" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[1]}</text>` : ''}
  ${titleLines[2] ? `<text x="200" y="275" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[2]}</text>` : ''}

  <text x="200" y="${titleLines[2] ? 300 : titleLines[1] ? 280 : 260}" font-family="Arial, sans-serif" font-size="14" fill="#bdc3c7" text-anchor="middle">by ${organizer}</text>

  <!-- Event details -->
  <text x="200" y="${titleLines[2] ? 330 : titleLines[1] ? 310 : 290}" font-family="Arial, sans-serif" font-size="13" fill="#95a5a6" text-anchor="middle">📍 ${venue}</text>
  <text x="200" y="${titleLines[2] ? 350 : titleLines[1] ? 330 : 310}" font-family="Arial, sans-serif" font-size="13" fill="#95a5a6" text-anchor="middle">📅 ${eventDate} • ${eventTime}</text>

  <!-- Price per ticket -->
  <text x="200" y="${titleLines[2] ? 380 : titleLines[1] ? 360 : 340}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f39c12" text-anchor="middle">${price} per ticket</text>

  <!-- Quantity Selector -->
  <text x="200" y="${titleLines[2] ? 415 : titleLines[1] ? 395 : 375}" font-family="Arial, sans-serif" font-size="14" fill="#bdc3c7" text-anchor="middle">Quantity:</text>

  <!-- Decrease button -->
  <rect id="decreaseQty" data-spell="decreaseTicketQuantity" data-spell-component="ticketBdo"
        x="110" y="${titleLines[2] ? 425 : titleLines[1] ? 405 : 385}" width="40" height="40" fill="url(#quantityBtn)" rx="6" style="cursor:pointer"/>
  <text x="130" y="${titleLines[2] ? 452 : titleLines[1] ? 432 : 412}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">−</text>

  <!-- Quantity display -->
  <rect x="160" y="${titleLines[2] ? 425 : titleLines[1] ? 405 : 385}" width="80" height="40" fill="#2c3e50" stroke="#7f8c8d" stroke-width="2" rx="6"/>
  <text id="ticketQuantity" x="200" y="${titleLines[2] ? 452 : titleLines[1] ? 432 : 412}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ecf0f1" text-anchor="middle">1</text>

  <!-- Increase button -->
  <rect id="increaseQty" data-spell="increaseTicketQuantity" data-spell-component="ticketBdo"
        x="250" y="${titleLines[2] ? 425 : titleLines[1] ? 405 : 385}" width="40" height="40" fill="url(#quantityBtn)" rx="6" style="cursor:pointer"/>
  <text x="270" y="${titleLines[2] ? 452 : titleLines[1] ? 432 : 412}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">+</text>

  <!-- Total price display -->
  <text x="200" y="${titleLines[2] ? 490 : titleLines[1] ? 470 : 450}" font-family="Arial, sans-serif" font-size="14" fill="#95a5a6" text-anchor="middle">Total:</text>
  <text id="totalPrice" x="200" y="${titleLines[2] ? 510 : titleLines[1] ? 490 : 470}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#f39c12" text-anchor="middle">${price}</text>

  <!-- Two-button layout (Save | Purchase) -->
  <!-- Save button (left) -->
  <rect id="button1" data-spell="saveToCarrierBag" data-spell-component="ticketBdo"
        x="30" y="590" width="165" height="45" fill="url(#saveBtn)" rx="8" style="cursor:pointer"/>
  <text x="112.5" y="618" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">💾 Save</text>

  <!-- Purchase button (right) -->
  <rect id="button2" data-spell="purchaseTickets" data-spell-component="ticketBdo"
        x="205" y="590" width="165" height="45" fill="url(#purchaseBtn)" rx="8" style="cursor:pointer"/>
  <text x="287.5" y="618" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">🎫 Purchase</text>
</svg>`;
}

/**
 * Create a complete ticket BDO ready for sharing
 * @param {Object} ticketData - Ticket product data
 * @param {Array} payees - Array of {pubKey, percentage} objects
 * @returns {Object} Complete BDO structure
 */
function createTicketBDO(ticketData, payees = []) {
  // Validate payees add up to 100%
  const totalPercentage = payees.reduce((sum, p) => sum + (p.percentage || 0), 0);
  if (payees.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
    console.warn(`⚠️ Payee percentages total ${totalPercentage}% instead of 100%`);
  }

  // Generate UUID if not provided
  const uuid = ticketData.uuid || (window.sessionless ? window.sessionless.generateUUID() : 'temp-' + Date.now());

  // Create complete ticket object
  const ticket = {
    ...ticketData,
    uuid,
    payees: [...payees], // Clone payees array
    ticketNineum: [], // Will be populated on purchase
    svgContent: generateTicketSVG(ticketData)
  };

  console.log('🎫 Created ticket BDO:', ticket.title);
  console.log('💰 Payees:', ticket.payees.length);

  return ticket;
}

/**
 * Add a payee to a ticket BDO
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {string} pubKey - Public key of payee
 * @param {number} percentage - Percentage of revenue (0-100)
 * @returns {Object} Updated ticket BDO
 */
function addPayee(ticketBDO, pubKey, percentage) {
  if (!ticketBDO.payees) {
    ticketBDO.payees = [];
  }

  const existingIndex = ticketBDO.payees.findIndex(p => p.pubKey === pubKey);

  if (existingIndex >= 0) {
    ticketBDO.payees[existingIndex].percentage = percentage;
    console.log('✏️ Updated payee percentage:', pubKey.substring(0, 10) + '...', percentage + '%');
  } else {
    ticketBDO.payees.push({ pubKey, percentage });
    console.log('➕ Added new payee:', pubKey.substring(0, 10) + '...', percentage + '%');
  }

  return ticketBDO;
}

/**
 * Remove a payee from a ticket BDO
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {string} pubKey - Public key of payee to remove
 * @returns {Object} Updated ticket BDO
 */
function removePayee(ticketBDO, pubKey) {
  if (!ticketBDO.payees) {
    return ticketBDO;
  }

  const originalLength = ticketBDO.payees.length;
  ticketBDO.payees = ticketBDO.payees.filter(p => p.pubKey !== pubKey);

  if (ticketBDO.payees.length < originalLength) {
    console.log('➖ Removed payee:', pubKey.substring(0, 10) + '...');
  }

  return ticketBDO;
}

/**
 * Calculate payee amounts from total price
 * @param {Object} ticketBDO - Ticket BDO object
 * @param {number} totalAmount - Total purchase amount in cents
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeAmounts(ticketBDO, totalAmount) {
  if (!ticketBDO.payees || ticketBDO.payees.length === 0) {
    return [];
  }

  return ticketBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));
}

// Export functions
if (typeof window !== 'undefined') {
  window.TicketBDO = {
    EXAMPLE_TICKET,
    generateTicketSVG,
    createTicketBDO,
    addPayee,
    removePayee,
    calculatePayeeAmounts
  };
}

console.log('🎫 Ticket BDO utilities loaded');
