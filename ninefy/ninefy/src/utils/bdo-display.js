/**
 * BDO Display Utilities
 *
 * Handles displaying BDO products in Nexus marketplace
 * Replaces Sanora template display with direct BDO rendering
 * Supports all BDO types: books, tickets, courses, memberships
 */

/**
 * Detect BDO type from object
 * @param {Object} bdo - BDO object
 * @returns {string} BDO type (book, ticket, course, membership)
 */
function detectBDOType(bdo) {
  if (!bdo || !bdo.type) {
    // Try to infer from structure
    if (bdo.lessons) return 'course';
    if (bdo.tiers) return 'membership';
    if (bdo.eventDate) return 'ticket';
    if (bdo.isbn || bdo.digitalArtifacts) return 'book';
    return 'unknown';
  }

  return bdo.type;
}

/**
 * Display BDO in container
 * @param {Object} bdo - BDO object (book, ticket, course, or membership)
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Display options
 * @returns {HTMLElement} Created display element
 */
function displayBDO(bdo, container, options = {}) {
  const {
    showDuplicateButton = true,
    user = null
  } = options;

  const bdoType = detectBDOType(bdo);
  console.log('📦 Displaying BDO:', bdoType, bdo.title || bdo.id);

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'bdo-display-wrapper';
  wrapper.style.cssText = `
    position: relative;
    margin: 20px;
    max-width: 400px;
  `;

  // Add SVG content
  if (bdo.svgContent) {
    wrapper.innerHTML = bdo.svgContent;
  } else {
    // Generate SVG if not present
    wrapper.innerHTML = generateBDOSVG(bdo, bdoType);
  }

  // Add duplicate button if enabled
  if (showDuplicateButton) {
    const duplicateBtn = createDuplicateButton(bdo, user);
    wrapper.appendChild(duplicateBtn);
  }

  // Add to container
  if (container) {
    container.appendChild(wrapper);
  }

  return wrapper;
}

/**
 * Generate SVG for BDO if not present
 * @param {Object} bdo - BDO object
 * @param {string} type - BDO type
 * @returns {string} SVG content
 */
function generateBDOSVG(bdo, type) {
  // Use appropriate generator based on type
  switch (type) {
    case 'book':
      return window.BookBDO?.generateBookSVG(bdo) || '<svg></svg>';
    case 'ticket':
      return window.TicketBDO?.generateTicketSVG(bdo) || '<svg></svg>';
    case 'course':
      return window.CourseBDO?.generateCourseSVG(bdo) || '<svg></svg>';
    case 'membership':
      return window.MembershipBDO?.generateMembershipSVG(bdo) || '<svg></svg>';
    default:
      return `<svg width="400" height="300"><text x="200" y="150" text-anchor="middle">Unknown BDO type: ${type}</text></svg>`;
  }
}

/**
 * Create duplicate button overlay
 * @param {Object} bdo - BDO object
 * @param {Object} user - Current user
 * @returns {HTMLElement} Duplicate button element
 */
function createDuplicateButton(bdo, user) {
  const button = document.createElement('button');
  button.className = 'bdo-duplicate-button';
  button.innerHTML = '🔄 Duplicate & Share (10% commission)';
  button.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.2s, box-shadow 0.2s;
    z-index: 100;
  `;

  button.onmouseover = () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  };

  button.onmouseout = () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  };

  button.onclick = async (e) => {
    e.stopPropagation();

    if (!user || !user.uuid) {
      alert('❌ Please sign in to duplicate this product');
      return;
    }

    // Cast duplication spell
    const result = await window.BDODuplication?.duplicate(bdo, user);

    if (result.success) {
      alert(`✅ ${result.message}\n\n😀 Share this emojicode:\n${result.emojicode}\n\n💰 You'll earn 10% on all sales!`);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  return button;
}

/**
 * Display multiple BDOs in grid
 * @param {Array} bdos - Array of BDO objects
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Display options
 */
function displayBDOGrid(bdos, container, options = {}) {
  // Clear container
  if (container) {
    container.innerHTML = '';
  }

  // Create grid wrapper
  const grid = document.createElement('div');
  grid.className = 'bdo-grid';
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 30px;
    padding: 20px;
  `;

  // Display each BDO
  bdos.forEach(bdo => {
    displayBDO(bdo, grid, options);
  });

  if (container) {
    container.appendChild(grid);
  }

  return grid;
}

/**
 * Filter BDOs by type
 * @param {Array} bdos - Array of BDO objects
 * @param {string} type - Type to filter (book, ticket, course, membership, or 'all')
 * @returns {Array} Filtered BDOs
 */
function filterBDOsByType(bdos, type) {
  if (type === 'all') return bdos;

  return bdos.filter(bdo => detectBDOType(bdo) === type);
}

/**
 * Get BDO summary info
 * @param {Object} bdo - BDO object
 * @returns {Object} Summary information
 */
function getBDOSummary(bdo) {
  const type = detectBDOType(bdo);

  const summary = {
    type: type,
    title: bdo.title || 'Untitled',
    price: bdo.price || 0,
    payeeCount: bdo.payees?.length || 0,
    hasEmojicode: !!bdo.emojicode
  };

  // Add type-specific info
  switch (type) {
    case 'book':
      summary.author = bdo.author;
      summary.artifactCount = bdo.digitalArtifacts?.length || 0;
      break;
    case 'ticket':
      summary.venue = bdo.venue;
      summary.eventDate = bdo.eventDate;
      summary.capacity = bdo.capacity;
      break;
    case 'course':
      summary.instructor = bdo.instructor;
      summary.lessonCount = bdo.lessons?.length || 0;
      summary.duration = bdo.duration;
      break;
    case 'membership':
      summary.organization = bdo.organization;
      summary.tierCount = bdo.tiers?.length || 0;
      break;
  }

  return summary;
}

/**
 * Search BDOs by title, author, or tags
 * @param {Array} bdos - Array of BDO objects
 * @param {string} query - Search query
 * @returns {Array} Matching BDOs
 */
function searchBDOs(bdos, query) {
  const lowerQuery = query.toLowerCase();

  return bdos.filter(bdo => {
    // Search in title
    if (bdo.title?.toLowerCase().includes(lowerQuery)) return true;

    // Search in author/instructor/organizer
    if (bdo.author?.toLowerCase().includes(lowerQuery)) return true;
    if (bdo.instructor?.toLowerCase().includes(lowerQuery)) return true;
    if (bdo.organizer?.toLowerCase().includes(lowerQuery)) return true;
    if (bdo.organization?.toLowerCase().includes(lowerQuery)) return true;

    // Search in tags
    if (bdo.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

    // Search in description
    if (bdo.description?.toLowerCase().includes(lowerQuery)) return true;

    return false;
  });
}

// Export functions
if (typeof window !== 'undefined') {
  window.BDODisplay = {
    display: displayBDO,
    displayGrid: displayBDOGrid,
    detectType: detectBDOType,
    filterByType: filterBDOsByType,
    getSummary: getBDOSummary,
    search: searchBDOs,
    createDuplicateButton
  };
}

console.log('📦 BDO Display utilities loaded');
