/**
 * Book BDO Utilities
 *
 * Handles creation and management of shareable book BDOs with:
 * - Product metadata
 * - Payee arrays for revenue sharing
 * - Two-button interface (save/purchase)
 * - Nineum assignment on purchase for digital artifact access
 */

/**
 * Example book product structure
 */
const EXAMPLE_BOOK = {
  id: 'book-the-digital-garden-001',
  uuid: null, // Will be generated via sessionless
  type: 'book',
  title: 'The Digital Garden: Cultivating Creativity in the Information Age',
  author: 'Sarah Chen',
  description: 'A philosophical exploration of how we organize, nurture, and share knowledge in the digital age. Learn to build your own digital garden and cultivate ideas that flourish.',
  coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
  price: 1999, // $19.99 in cents
  isbn: '978-1234567890',
  publisher: 'TechThought Press',
  publishDate: '2024-03-15',
  pages: 284,
  category: 'technology',
  tags: ['digital-garden', 'knowledge-management', 'creativity', 'productivity'],
  purchaseUrl: 'https://example.com/buy/digital-garden',
  metadata: {
    available: true,
    format: 'Hardcover & eBook',
    rating: 4.7,
    reviews: 342
  },

  // Shareable BDO specific fields
  payees: [], // Array of {pubKey: string, percentage: number}

  // Digital artifacts that purchasers can download
  digitalArtifacts: [
    {
      type: 'epub',
      url: 'https://example.com/artifacts/digital-garden.epub',
      fileSize: '2.4 MB',
      description: 'EPUB version for e-readers'
    },
    {
      type: 'pdf',
      url: 'https://example.com/artifacts/digital-garden.pdf',
      fileSize: '5.1 MB',
      description: 'PDF version with full color illustrations'
    },
    {
      type: 'mobi',
      url: 'https://example.com/artifacts/digital-garden.mobi',
      fileSize: '2.8 MB',
      description: 'Kindle MOBI format'
    }
  ],

  // SVG content for AdvanceKey display
  svgContent: null // Will be generated
};

/**
 * Generate SVG content for book BDO display in AdvanceKey
 * @param {Object} book - Book product object
 * @returns {string} SVG markup for display
 */
function generateBookSVG(book) {
  // Extract book details
  const title = book.title || 'Untitled Book';
  const author = book.author || 'Unknown Author';
  const price = book.price ? `$${(book.price / 100).toFixed(2)}` : 'Free';
  const coverImage = book.coverImage || '';

  // Word wrap title to fit in card
  const maxTitleLength = 40;
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

  // Generate SVG (400x600 standard book card size)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="bookBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#2c3e50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#34495e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="saveBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="purchaseBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#27ae60;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#229954;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="600" fill="url(#bookBg)" rx="10"/>

  <!-- Book cover image placeholder -->
  <rect x="50" y="30" width="300" height="400" fill="#1a1a1a" rx="5"/>
  ${coverImage ? `<image href="${coverImage}" x="50" y="30" width="300" height="400" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 5px)"/>` : ''}

  <!-- Book info section -->
  <text x="200" y="455" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[0] || ''}</text>
  ${titleLines[1] ? `<text x="200" y="475" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ecf0f1" text-anchor="middle">${titleLines[1]}</text>` : ''}
  <text x="200" y="495" font-family="Arial, sans-serif" font-size="14" fill="#bdc3c7" text-anchor="middle">by ${author}</text>
  <text x="200" y="515" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f39c12" text-anchor="middle">${price}</text>

  <!-- Two-button layout (Save | Purchase) -->
  <!-- Save button (left) -->
  <rect id="button1" data-spell="saveToCarrierBag" data-spell-component="bookBdo"
        x="30" y="540" width="165" height="45" fill="url(#saveBtn)" rx="8" style="cursor:pointer"/>
  <text x="112.5" y="568" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">💾 Save</text>

  <!-- Purchase button (right) -->
  <rect id="button2" data-spell="purchaseBook" data-spell-component="bookBdo"
        x="205" y="540" width="165" height="45" fill="url(#purchaseBtn)" rx="8" style="cursor:pointer"/>
  <text x="287.5" y="568" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle" pointer-events="none">🛒 Purchase</text>
</svg>`;
}

/**
 * Create a complete book BDO ready for sharing
 * @param {Object} bookData - Book product data
 * @param {Array} payees - Array of {pubKey, percentage} objects
 * @returns {Object} Complete BDO structure
 */
function createBookBDO(bookData, payees = []) {
  // Validate payees add up to 100%
  const totalPercentage = payees.reduce((sum, p) => sum + (p.percentage || 0), 0);
  if (payees.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
    console.warn(`⚠️ Payee percentages total ${totalPercentage}% instead of 100%`);
  }

  // Generate UUID if not provided
  const uuid = bookData.uuid || (window.sessionless ? window.sessionless.generateUUID() : 'temp-' + Date.now());

  // Create complete book object
  const book = {
    ...bookData,
    uuid,
    payees: [...payees], // Clone payees array
    svgContent: generateBookSVG(bookData)
  };

  console.log('📚 Created book BDO:', book.title);
  console.log('💰 Payees:', book.payees.length);

  return book;
}

/**
 * Add a payee to a book BDO
 * @param {Object} bookBDO - Book BDO object
 * @param {string} pubKey - Public key of payee
 * @param {number} percentage - Percentage of revenue (0-100)
 * @returns {Object} Updated book BDO
 */
function addPayee(bookBDO, pubKey, percentage) {
  if (!bookBDO.payees) {
    bookBDO.payees = [];
  }

  // Check if payee already exists
  const existingIndex = bookBDO.payees.findIndex(p => p.pubKey === pubKey);

  if (existingIndex >= 0) {
    // Update existing payee
    bookBDO.payees[existingIndex].percentage = percentage;
    console.log('✏️ Updated payee percentage:', pubKey.substring(0, 10) + '...', percentage + '%');
  } else {
    // Add new payee
    bookBDO.payees.push({ pubKey, percentage });
    console.log('➕ Added new payee:', pubKey.substring(0, 10) + '...', percentage + '%');
  }

  return bookBDO;
}

/**
 * Remove a payee from a book BDO
 * @param {Object} bookBDO - Book BDO object
 * @param {string} pubKey - Public key of payee to remove
 * @returns {Object} Updated book BDO
 */
function removePayee(bookBDO, pubKey) {
  if (!bookBDO.payees) {
    return bookBDO;
  }

  const originalLength = bookBDO.payees.length;
  bookBDO.payees = bookBDO.payees.filter(p => p.pubKey !== pubKey);

  if (bookBDO.payees.length < originalLength) {
    console.log('➖ Removed payee:', pubKey.substring(0, 10) + '...');
  }

  return bookBDO;
}

/**
 * Calculate payee amounts from total price
 * @param {Object} bookBDO - Book BDO object
 * @param {number} totalAmount - Total purchase amount in cents
 * @returns {Array} Array of {pubKey, amount} objects
 */
function calculatePayeeAmounts(bookBDO, totalAmount) {
  if (!bookBDO.payees || bookBDO.payees.length === 0) {
    return [];
  }

  return bookBDO.payees.map(payee => ({
    pubKey: payee.pubKey,
    percentage: payee.percentage,
    amount: Math.round((totalAmount * payee.percentage) / 100)
  }));
}

// Export functions
if (typeof window !== 'undefined') {
  window.BookBDO = {
    EXAMPLE_BOOK,
    generateBookSVG,
    createBookBDO,
    addPayee,
    removePayee,
    calculatePayeeAmounts
  };
}

console.log('📚 Book BDO utilities loaded');
