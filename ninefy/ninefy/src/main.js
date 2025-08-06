/**
 * Ninefy - Main Application Entry Point (No ES6 Modules)
 * A minimalist digital goods marketplace using SVG components
 */

// Tauri API for backend communication (with safety check)
let invoke = null;
let tauriInitialized = false;

// Initialize Tauri API when ready
function initializeTauri() {
  try {
    if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
      const { invoke: tauriInvoke } = window.__TAURI__.core;
      invoke = tauriInvoke;
      tauriInitialized = true;
      console.log('✅ Tauri API available');
      // Update global reference
      window.ninefyInvoke = invoke;
      return true;
    }
  } catch (error) {
console.error(error);
    // Silently fail and retry
  }
  return false;
}

// Retry Tauri initialization with exponential backoff
function retryTauriInit(maxAttempts = 20, attempt = 1) {
  if (initializeTauri()) {
    return; // Success!
  }
  
  if (attempt >= maxAttempts) {
    console.warn('⚠️ Tauri API not available after maximum attempts - running in browser mode');
    return;
  }
  
  const delay = Math.min(100 * attempt, 1000); // Cap at 1 second
  console.log(`🔄 Retrying Tauri initialization (attempt ${attempt}/${maxAttempts})...`);
  setTimeout(() => retryTauriInit(maxAttempts, attempt + 1), delay);
}

// Start initialization process
retryTauriInit();

// Make invoke available globally for other modules
window.ninefyInvoke = invoke;

// Product category SVG data URLs (URL-encoded)
const PRODUCT_IMAGES = {
  ebook: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%234a90e2'/%3E%3Crect x='80' y='50' width='240' height='150' fill='%23ffffff' rx='8'/%3E%3Cline x1='100' y1='80' x2='280' y2='80' stroke='%234a90e2' stroke-width='2'/%3E%3Cline x1='100' y1='100' x2='280' y2='100' stroke='%234a90e2' stroke-width='2'/%3E%3Cline x1='100' y1='120' x2='250' y2='120' stroke='%234a90e2' stroke-width='2'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3EE-Book%3C/text%3E%3C/svg%3E",
  
  music: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%23e74c3c'/%3E%3Ccircle cx='200' cy='125' r='60' fill='%23ffffff'/%3E%3Ccircle cx='200' cy='125' r='15' fill='%23e74c3c'/%3E%3Crect x='190' y='65' width='20' height='60' fill='%23e74c3c'/%3E%3Cpath d='M210 65 Q230 60 230 80 L230 100 Q230 120 210 115 Z' fill='%23e74c3c'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3EMusic%3C/text%3E%3C/svg%3E",
  
  software: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%2334495e'/%3E%3Crect x='50' y='60' width='300' height='130' fill='%23ffffff' rx='10'/%3E%3Crect x='60' y='70' width='280' height='20' fill='%2334495e'/%3E%3Ccircle cx='70' cy='80' r='5' fill='%23e74c3c'/%3E%3Ccircle cx='85' cy='80' r='5' fill='%23f39c12'/%3E%3Ccircle cx='100' cy='80' r='5' fill='%2327ae60'/%3E%3Ctext x='60' y='110' fill='%2334495e' font-family='monospace' font-size='12'%3E%3C/html%3E%3C%3C/text%3E%3Ctext x='60' y='125' fill='%2334495e' font-family='monospace' font-size='12'%3E  function() {%3C/text%3E%3Ctext x='60' y='140' fill='%2334495e' font-family='monospace' font-size='12'%3E    return true;%3C/text%3E%3Ctext x='60' y='155' fill='%2334495e' font-family='monospace' font-size='12'%3E  }%3C/text%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ESoftware%3C/text%3E%3C/svg%3E",
  
  course: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%23f39c12'/%3E%3Crect x='50' y='70' width='300' height='110' fill='%23ffffff' rx='5'/%3E%3Crect x='60' y='80' width='120' height='90' fill='%23f39c12' rx='3'/%3E%3Ctext x='120' y='130' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='36' font-weight='bold'%3E▶%3C/text%3E%3Cline x1='200' y1='90' x2='330' y2='90' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='110' x2='320' y2='110' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='130' x2='310' y2='130' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='150' x2='300' y2='150' stroke='%23f39c12' stroke-width='2'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ECourse%3C/text%3E%3C/svg%3E",
  
  template: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%239b59b6'/%3E%3Crect x='50' y='50' width='120' height='150' fill='%23ffffff' rx='8'/%3E%3Crect x='180' y='50' width='120' height='150' fill='%23ffffff' rx='8'/%3E%3Crect x='310' y='50' width='40' height='150' fill='%23ffffff' rx='8'/%3E%3Crect x='60' y='60' width='100' height='20' fill='%239b59b6'/%3E%3Crect x='60' y='90' width='80' height='8' fill='%23ecf0f1'/%3E%3Crect x='60' y='105' width='90' height='8' fill='%23ecf0f1'/%3E%3Crect x='60' y='120' width='70' height='8' fill='%23ecf0f1'/%3E%3Crect x='190' y='60' width='100' height='20' fill='%239b59b6'/%3E%3Crect x='190' y='90' width='80' height='8' fill='%23ecf0f1'/%3E%3Crect x='190' y='105' width='90' height='8' fill='%23ecf0f1'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ETemplate%3C/text%3E%3C/svg%3E",
  
  ticket: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%2327ae60'/%3E%3Crect x='60' y='80' width='280' height='90' fill='%23ffffff' rx='8'/%3E%3Cpath d='M190 80 Q200 90 190 100 Q200 110 190 120 Q200 130 190 140 Q200 150 190 160 Q200 170 190 170 L210 170 Q200 170 210 160 Q200 150 210 140 Q200 130 210 120 Q200 110 210 100 Q200 90 210 80 Z' fill='%2327ae60'/%3E%3Ctext x='125' y='105' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='12' font-weight='bold'%3EEVENT%3C/text%3E%3Ctext x='125' y='125' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='20' font-weight='bold'%3ETICKET%3C/text%3E%3Ctext x='125' y='145' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='10'%3EADMIT ONE%3C/text%3E%3Ctext x='275' y='115' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='10'%3E$50.00%3C/text%3E%3Ctext x='275' y='135' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='8'%3E#001234%3C/text%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ETicket%3C/text%3E%3C/svg%3E"
};

// No demo teleported content - production ready

// No sample products - production ready
const SAMPLE_PRODUCTS = [];

// No demo teleported content - production ready  
const TELEPORTED_CONTENT = [];

// Base management (adapted from screenary pattern)
const BASE_CONFIG = {
  HOME_BASE_URL: 'https://dev.bdo.allyabase.com/',
  CACHE_TIMEOUT: 600000, // 10 minutes
  PRODUCT_CACHE_TIMEOUT: 300000 // 5 minutes  
};

let basesCache = null;
let lastBaseRefresh = 0;
let productsCache = [];
let lastProductsRefresh = 0;

// Application state
const appState = {
  currentScreen: 'main',
  currentTheme: {
    colors: {
      primary: '#2c3e50',
      secondary: '#7f8c8d', 
      accent: '#e74c3c',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#2c3e50',
      border: '#ecf0f1',
      success: '#27ae60',
      warning: '#f39c12',
      info: '#3498db'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.6,
      headerSize: 32,
      productTitleSize: 24
    }
  },
  currentProduct: null,
  products: [],
  isLoading: true
};

/**
 * Create teleported content item (reused from rhapsold)
 */
function createTeleportedItem(item) {
  const container = document.createElement('div');
  container.className = 'teleported-item';
  container.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border-left: 4px solid ${appState.currentTheme.colors.accent};
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  // Type indicator
  const typeIcon = {
    'link': '🔗',
    'image': '🖼️', 
    'video': '📹',
    'code': '💻'
  };

  // Header with type and source
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  header.innerHTML = `
    <span>${typeIcon[item.type] || '📄'} ${item.type}</span>
    <span>${new Date(item.timestamp).toLocaleDateString()}</span>
  `;

  // Title
  const title = document.createElement('h4');
  title.textContent = item.title;
  title.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: bold;
    color: ${appState.currentTheme.colors.primary};
    line-height: 1.3;
  `;

  // Description
  const description = document.createElement('p');
  description.textContent = item.description;
  description.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 12px;
    color: ${appState.currentTheme.colors.text};
    line-height: 1.4;
  `;

  // Source
  const source = document.createElement('div');
  source.textContent = item.source;
  source.style.cssText = `
    font-size: 11px;
    color: ${appState.currentTheme.colors.secondary};
    font-style: italic;
  `;

  // Add special content based on type
  if (item.type === 'image' && item.imageUrl) {
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.style.cssText = `
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
      margin: 8px 0;
    `;
    container.appendChild(img);
  }

  if (item.type === 'video' && item.thumbnail) {
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      position: relative;
      margin: 8px 0;
    `;
    
    const thumbnail = document.createElement('img');
    thumbnail.src = item.thumbnail;
    thumbnail.style.cssText = `
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    `;
    
    const playButton = document.createElement('div');
    playButton.innerHTML = '▶️';
    playButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    `;
    
    if (item.duration) {
      const duration = document.createElement('div');
      duration.textContent = item.duration;
      duration.style.cssText = `
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
      `;
      videoContainer.appendChild(duration);
    }
    
    videoContainer.appendChild(thumbnail);
    videoContainer.appendChild(playButton);
    container.appendChild(videoContainer);
  }

  if (item.type === 'code' && item.codePreview) {
    const codeBlock = document.createElement('pre');
    codeBlock.textContent = item.codePreview;
    codeBlock.style.cssText = `
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 8px;
      margin: 8px 0;
      font-size: 10px;
      font-family: 'Courier New', monospace;
      overflow-x: auto;
      white-space: pre;
    `;
    container.appendChild(codeBlock);
  }

  // Hover effects
  container.addEventListener('mouseenter', () => {
    container.style.transform = 'translateY(-2px)';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });

  container.addEventListener('mouseleave', () => {
    container.style.transform = 'translateY(0)';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });

  // Click handler
  container.addEventListener('click', () => {
    console.log('Teleported item clicked:', item.title);
    if (item.url) {
      alert(`Would open: ${item.url}`);
    }
  });

  container.appendChild(header);
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(source);

  return container;
}

// Base Management Functions (adapted from screenary pattern)
async function connectToHomeBase() {
  try {
    console.log('🏠 Connecting to home base:', BASE_CONFIG.HOME_BASE_URL);
    
    // Create BDO user on home base
    const bdoUser = await invoke('create_bdo_user');
    console.log('✅ BDO user created:', bdoUser);
    
    return {
      name: 'DEV',
      description: 'Development base for Ninefy marketplace',
      dns: {
        bdo: BASE_CONFIG.HOME_BASE_URL,
        sanora: 'https://dev.sanora.allyabase.com/',
        dolores: 'https://dev.dolores.allyabase.com/',
        addie: 'https://dev.addie.allyabase.com/',
        fount: 'https://dev.fount.allyabase.com/'
      },
      users: { bdo: bdoUser },
      joined: true,
      uuid: 'home-base'
    };
  } catch (err) {
    console.warn('⚠️ Failed to connect to home base:', err);
    return null;
  }
}

async function fetchBasesFromBDO() {
  try {
    const homeBase = await connectToHomeBase();
    if (!homeBase) return {};
    
    const bdoUser = homeBase.users.bdo;
    const updatedBases = await invoke('get_bases', {
      uuid: bdoUser.uuid, 
      bdoUrl: BASE_CONFIG.HOME_BASE_URL
    });
    
    console.log('📡 Fetched bases from BDO:', Object.keys(updatedBases || {}).length);
    return { [homeBase.uuid]: homeBase, ...(updatedBases || {}) };
  } catch (err) {
    console.error('❌ Failed to fetch bases:', err);
    return {};
  }
}

async function getAvailableBases() {
  const now = new Date().getTime();
  
  if (basesCache && (now - lastBaseRefresh < BASE_CONFIG.CACHE_TIMEOUT)) {
    console.log('📋 Using cached bases');
    return basesCache;
  }
  
  console.log('🔄 Refreshing bases from BDO...');
  basesCache = await fetchBasesFromBDO();
  lastBaseRefresh = now;
  
  return basesCache;
}

async function getProductsFromBases() {
  const now = new Date().getTime();
  
  if (productsCache.length > 0 && (now - lastProductsRefresh < BASE_CONFIG.PRODUCT_CACHE_TIMEOUT)) {
    console.log('📦 Using cached products');
    return productsCache;
  }
  
  console.log('🔄 Refreshing products from all bases...');
  
  const bases = await getAvailableBases();
  const allProducts = [];
  
  for (const [baseId, base] of Object.entries(bases)) {
    if (!base.dns?.sanora) continue;
    
    try {
      // Use the new /products/base endpoint (no authentication required)
      const products = await invoke('get_all_base_products', {
        sanoraUrl: base.dns.sanora
      });
      
      if (Array.isArray(products)) {
        allProducts.push(...products.map(p => ({...p, baseId, baseName: base.name})));
      } else if (products && typeof products === 'object') {
        const productArray = Object.values(products);
        allProducts.push(...productArray.map(p => ({...p, baseId, baseName: base.name})));
      }
    } catch (err) {
      console.warn(`⚠️ Failed to get products from ${base.name}:`, err);
    }
  }
  
  productsCache = allProducts;
  lastProductsRefresh = now;
  
  console.log(`📦 Loaded ${allProducts.length} products from ${Object.keys(bases).length} bases`);
  return allProducts;
}

/**
 * Format price in cents to dollars
 */
function formatPrice(priceInCents) {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
  const icons = {
    'ebook': '📚',
    'music': '🎵',
    'software': '💻',
    'course': '🎓',
    'template': '🎨',
    'ticket': '🎫'
  };
  return icons[category] || '📦';
}

/**
 * Simple markdown parser (reused from rhapsold)
 */
function parseMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;">');
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3 style="color: #2c3e50; margin: 20px 0 10px 0; font-size: 18px;">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="color: #2c3e50; margin: 24px 0 12px 0; font-size: 20px;">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 style="color: #2c3e50; margin: 28px 0 14px 0; font-size: 24px;">$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 12px; margin: 12px 0; overflow-x: auto; font-family: \'Courier New\', monospace; font-size: 14px; line-height: 1.4;"><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-family: \'Courier New\', monospace; font-size: 0.9em;">$1</code>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #e74c3c; margin: 12px 0; padding: 8px 16px; background: #f8f9fa; font-style: italic; color: #555;">$1</blockquote>');
  
  // Lists
  html = html.replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul style="margin: 12px 0; padding-left: 20px;">$1</ul>');
  
  // Checkboxes
  html = html.replace(/^✅ (.*$)/gm, '<div style="margin: 4px 0;"><span style="color: #27ae60;">✅</span> $1</div>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6;">');
  html = '<p style="margin: 12px 0; line-height: 1.6;">' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/g, '');
  
  return html;
}

/**
 * Create product card
 */
function createProductCard(product) {
  const cardContainer = document.createElement('div');
  cardContainer.className = 'product-card';
  cardContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 0;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    min-height: 400px;
    display: flex;
    flex-direction: column;
  `;
  
  // Featured image
  if (product.featuredImage) {
    const imageElement = document.createElement('img');
    imageElement.src = product.featuredImage;
    imageElement.style.cssText = `
      width: 100%;
      height: 200px;
      object-fit: cover;
    `;
    cardContainer.appendChild(imageElement);
  }
  
  // Card content
  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
  `;
  
  // Product metadata header
  const metaHeader = document.createElement('div');
  metaHeader.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  
  const categoryAuthor = document.createElement('span');
  categoryAuthor.textContent = `${getCategoryIcon(product.category)} ${product.category} • by ${product.author}`;
  
  const priceElement = document.createElement('span');
  priceElement.textContent = formatPrice(product.price);
  priceElement.style.cssText = `
    font-weight: bold;
    font-size: 16px;
    color: ${appState.currentTheme.colors.accent};
  `;
  
  metaHeader.appendChild(categoryAuthor);
  metaHeader.appendChild(priceElement);
  
  // Product title
  const titleElement = document.createElement('h3');
  titleElement.textContent = product.title;
  titleElement.style.cssText = `
    margin: 0 0 12px 0;
    color: ${appState.currentTheme.colors.primary};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.productTitleSize}px;
    line-height: 1.3;
  `;
  
  // Product description
  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = product.description;
  descriptionElement.style.cssText = `
    color: ${appState.currentTheme.colors.text};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    flex-grow: 1;
  `;
  
  // Product stats
  const statsContainer = document.createElement('div');
  statsContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  
  const leftStats = document.createElement('div');
  leftStats.innerHTML = `
    ⭐ ${product.rating} • 💾 ${product.downloadCount.toLocaleString()} downloads
  `;
  
  const rightStats = document.createElement('div');
  rightStats.innerHTML = `
    📁 ${product.fileSize} • ${product.fileType}
  `;
  
  statsContainer.appendChild(leftStats);
  statsContainer.appendChild(rightStats);
  
  // Tags
  if (product.tags && product.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;
    
    product.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.textContent = `#${tag}`;
      tagElement.style.cssText = `
        background: ${appState.currentTheme.colors.background};
        color: ${appState.currentTheme.colors.accent};
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      `;
      tagsContainer.appendChild(tagElement);
    });
    
    contentContainer.appendChild(tagsContainer);
  }
  
  // Add click handler to view product details
  cardContainer.addEventListener('click', () => {
    appState.currentProduct = product;
    navigateToScreen('details');
  });
  
  cardContainer.addEventListener('mouseenter', () => {
    cardContainer.style.transform = 'translateY(-4px)';
    cardContainer.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
  });
  
  cardContainer.addEventListener('mouseleave', () => {
    cardContainer.style.transform = 'translateY(0)';
    cardContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  });
  
  contentContainer.appendChild(metaHeader);
  contentContainer.appendChild(titleElement);
  contentContainer.appendChild(descriptionElement);
  contentContainer.appendChild(statsContainer);
  
  cardContainer.appendChild(contentContainer);
  
  return cardContainer;
}

/**
 * Create HUD Navigation (adapted from rhapsold)
 */
function createHUD() {
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${appState.currentTheme.colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    z-index: 1000;
    font-family: ${appState.currentTheme.typography.fontFamily};
  `;
  
  // Left side - Logo
  const logo = document.createElement('div');
  logo.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    color: ${appState.currentTheme.colors.primary};
  `;
  logo.textContent = '🛒 Ninefy';
  
  // Center - Navigation buttons
  const nav = document.createElement('div');
  nav.style.cssText = `
    display: flex;
    gap: 10px;
  `;
  
  const screens = [
    { id: 'main', label: '🏪 Shop', title: 'Browse Products' },
    { id: 'browse', label: '🌐 Browse Base', title: 'Browse Base Products' },
    { id: 'details', label: '📄 Details', title: 'Product Details' },
    { id: 'upload', label: '📤 Upload', title: 'Upload Product' },
    { id: 'base', label: '⚙️ Base', title: 'Server Management' }
  ];
  
  screens.forEach(screen => {
    const button = document.createElement('button');
    button.id = `nav-${screen.id}`;
    button.textContent = screen.label;
    button.title = screen.title;
    button.style.cssText = `
      padding: 8px 16px;
      border: 1px solid ${appState.currentTheme.colors.border};
      border-radius: 4px;
      background: ${appState.currentScreen === screen.id ? appState.currentTheme.colors.accent : 'white'};
      color: ${appState.currentScreen === screen.id ? 'white' : appState.currentTheme.colors.text};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    button.addEventListener('click', () => navigateToScreen(screen.id));
    nav.appendChild(button);
  });
  
  // Right side - Status
  const status = document.createElement('div');
  status.id = 'hud-status';
  status.style.cssText = `
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  status.textContent = 'Ready';
  
  hud.appendChild(logo);
  hud.appendChild(nav);
  hud.appendChild(status);
  
  return hud;
}

/**
 * Navigate to a specific screen
 */
function navigateToScreen(screenId) {
  console.log(`🧭 Navigating to screen: ${screenId}`);
  appState.currentScreen = screenId;
  updateHUDButtons();
  renderCurrentScreen();
}

/**
 * Update HUD button states
 */
function updateHUDButtons() {
  const screens = ['main', 'browse', 'details', 'upload', 'base'];
  
  screens.forEach(screen => {
    const button = document.getElementById(`nav-${screen}`);
    if (button) {
      const isActive = appState.currentScreen === screen;
      button.style.background = isActive ? appState.currentTheme.colors.accent : 'white';
      button.style.color = isActive ? 'white' : appState.currentTheme.colors.text;
    }
  });
}

/**
 * Create Browse Base Screen (All Products on Base)
 */
function createBrowseBaseScreen() {
  const screen = document.createElement('div');
  screen.id = 'browse-base-screen';
  screen.className = 'screen';
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid ${appState.currentTheme.colors.background};
  `;
  header.innerHTML = `
    <h1 style="
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 12px;
      font-size: 2rem;
      font-family: ${appState.currentTheme.typography.fontFamily};
    ">🌐 Browse Base Products</h1>
    <p style="
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
      margin: 0;
    ">Discover digital products from other creators on this base</p>
  `;
  
  // Base selector
  const baseSelectorContainer = document.createElement('div');
  baseSelectorContainer.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
  `;
  
  const baseLabel = document.createElement('label');
  baseLabel.textContent = 'Select Base:';
  baseLabel.style.cssText = `
    font-weight: bold;
    color: ${appState.currentTheme.colors.primary};
  `;
  
  const baseSelect = document.createElement('select');
  baseSelect.id = 'base-selector';
  baseSelect.style.cssText = `
    padding: 8px 12px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
    background: white;
    min-width: 200px;
  `;
  
  // Load available bases from BDO
  async function populateBaseOptions() {
    try {
      const bases = await getAvailableBases();
      const baseEntries = Object.entries(bases);
      
      if (baseEntries.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No bases available';
        option.disabled = true;
        baseSelect.appendChild(option);
        return;
      }
      
      baseEntries.forEach(([baseId, base]) => {
        const option = document.createElement('option');
        option.value = base.dns?.sanora || '';
        option.textContent = `${base.name} - ${base.description || 'Marketplace base'}`;
        option.dataset.baseId = baseId;
        baseSelect.appendChild(option);
      });
      
      console.log(`📋 Loaded ${baseEntries.length} available bases`);
    } catch (err) {
      console.error('❌ Failed to load bases:', err);
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Failed to load bases';
      option.disabled = true;
      baseSelect.appendChild(option);
    }
  }
  
  // Populate base options on load
  populateBaseOptions();
  
  const loadButton = document.createElement('button');
  loadButton.textContent = 'Load Products';
  loadButton.style.cssText = `
    background: ${appState.currentTheme.colors.accent};
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
  `;
  
  baseSelectorContainer.appendChild(baseLabel);
  baseSelectorContainer.appendChild(baseSelect);
  baseSelectorContainer.appendChild(loadButton);
  
  // Products container
  const productsContainer = document.createElement('div');
  productsContainer.id = 'base-products-container';
  productsContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 20px;
  `;
  
  // Status message
  const statusMessage = document.createElement('div');
  statusMessage.id = 'browse-status';
  statusMessage.style.cssText = `
    text-align: center;
    padding: 40px;
    color: ${appState.currentTheme.colors.secondary};
    font-style: italic;
  `;
  statusMessage.textContent = 'Select a base and click "Load Products" to browse available products';
  
  // Load products function
  async function loadBaseProducts() {
    const selectedBase = baseSelect.value;
    if (!selectedBase) {
      alert('Please select a base');
      return;
    }
    
    loadButton.disabled = true;
    loadButton.textContent = 'Loading...';
    statusMessage.textContent = 'Loading products from base...';
    statusMessage.style.color = appState.currentTheme.colors.info;
    
    // Clear existing products
    productsContainer.innerHTML = '';
    
    try {
      console.log('🔄 Loading products from base:', selectedBase);
      
      // Try to fetch from backend using new /products/base endpoint
      try {
        const baseProducts = await invoke('get_all_base_products', {
          sanoraUrl: selectedBase
        });
        
        console.log('✅ Loaded base products:', baseProducts);
        
        // Handle both array and object formats from Sanora
        let productsArray = [];
        if (Array.isArray(baseProducts)) {
          productsArray = baseProducts;
        } else if (baseProducts && typeof baseProducts === 'object') {
          // Convert object format to array (Sanora returns products as object properties)
          productsArray = Object.values(baseProducts);
          console.log('🔄 Converted object format to array:', productsArray);
        }
        
        if (productsArray && productsArray.length > 0) {
          // Display products
          productsArray.forEach(productData => {
            // Convert Sanora product format to our display format
            console.log('🔍 Processing product data:', productData);
            
            const displayProduct = {
              id: productData.uuid || productData.productId || productData.id,
              title: productData.title || 'Untitled Product',
              description: productData.description || 'No description available',
              price: productData.price || 0,
              category: productData.category || 'ebook', // Default category
              author: productData.author || 'Anonymous',
              timestamp: productData.timestamp || productData.created_at || new Date().toISOString(),
              downloadCount: productData.downloadCount || productData.download_count || 0,
              rating: productData.rating || 4.5,
              tags: productData.tags || [],
              featuredImage: productData.image ? 
                `https://dev.sanora.allyabase.com/images/${productData.image}` : 
                PRODUCT_IMAGES[productData.category || 'ebook'],
              previewContent: productData.description || 'No preview available',
              fileSize: productData.fileSize || productData.file_size || 
                (productData.artifacts && productData.artifacts.length > 0 ? 
                  `${productData.artifacts.length} file(s)` : 'Unknown'),
              fileType: productData.fileType || productData.file_type || 
                (productData.artifacts && productData.artifacts.length > 0 ? 
                  productData.artifacts[0].split('.').pop().toUpperCase() : 'Digital Product')
            };
            
            console.log('✅ Created display product:', displayProduct);
            
            const productElement = createProductCard(displayProduct);
            productsContainer.appendChild(productElement);
          });
          
          statusMessage.textContent = `Found ${productsArray.length} products on this base`;
          statusMessage.style.color = appState.currentTheme.colors.success;
        } else {
          statusMessage.textContent = 'No products found on this base';
          statusMessage.style.color = appState.currentTheme.colors.secondary;
        }
        
      } catch (backendError) {
        console.warn('⚠️ Backend fetch failed, cannot connect to base:', backendError);
        
        // Show "connection failed" message instead of placeholder data
        const noConnectionElement = document.createElement('div');
        noConnectionElement.style.cssText = `
          padding: 40px 20px;
          text-align: center;
          color: ${appState.currentTheme.colors.secondary};
          font-family: ${appState.currentTheme.typography.fontFamily};
          font-size: 18px;
        `;
        noConnectionElement.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px;">🔌</div>
          <div style="font-weight: bold; margin-bottom: 8px;">Connection failed</div>
          <div style="font-size: 14px;">Could not connect to the selected base server</div>
          <div style="font-size: 14px; margin-top: 8px;">Please check your connection and try again</div>
        `;
        productsContainer.appendChild(noConnectionElement);
        
        statusMessage.textContent = `Base connection unavailable`;
        statusMessage.style.color = appState.currentTheme.colors.warning;
      }
      
    } catch (error) {
      console.error('❌ Failed to load base products:', error);
      statusMessage.textContent = 'Failed to load products from base';
      statusMessage.style.color = appState.currentTheme.colors.accent;
    } finally {
      loadButton.disabled = false;
      loadButton.textContent = 'Load Products';
    }
  }
  
  // Add event listener
  loadButton.addEventListener('click', loadBaseProducts);
  
  screen.appendChild(header);
  screen.appendChild(baseSelectorContainer);
  screen.appendChild(statusMessage);
  screen.appendChild(productsContainer);
  
  return screen;
}

/**
 * Create Main Screen (Product Marketplace)
 */
function createMainScreen() {
  const screen = document.createElement('div');
  screen.id = 'main-screen';
  screen.className = 'screen';
  screen.style.cssText = `
    display: flex;
    gap: 20px;
    height: calc(100vh - 80px);
    overflow: hidden;
  `;
  
  // Left column - Products (2/3 width)
  const productsColumn = document.createElement('div');
  productsColumn.className = 'products-column';
  productsColumn.style.cssText = `
    flex: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Products header
  const productsHeader = document.createElement('div');
  productsHeader.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid ${appState.currentTheme.colors.background};
  `;
  productsHeader.innerHTML = `
    <h1 style="
      margin: 0 0 8px 0;
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 2rem;
      font-weight: 600;
    ">Digital Marketplace</h1>
    <p style="
      margin: 0;
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
    ">Discover and purchase digital goods from creators worldwide</p>
  `;
  
  // Products container with scrolling
  const productsContainer = document.createElement('div');
  productsContainer.id = 'products-container';
  productsContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    grid-auto-rows: min-content;
    gap: 20px;
    align-content: start;
  `;
  
  // Custom scrollbar styling
  const scrollbarStyle = document.createElement('style');
  scrollbarStyle.textContent = `
    #products-container::-webkit-scrollbar {
      width: 8px;
    }
    #products-container::-webkit-scrollbar-track {
      background: ${appState.currentTheme.colors.background};
      border-radius: 4px;
    }
    #products-container::-webkit-scrollbar-thumb {
      background: ${appState.currentTheme.colors.secondary};
      border-radius: 4px;
    }
    #products-container::-webkit-scrollbar-thumb:hover {
      background: ${appState.currentTheme.colors.primary};
    }
  `;
  document.head.appendChild(scrollbarStyle);
  
  productsColumn.appendChild(productsHeader);
  productsColumn.appendChild(productsContainer);
  
  // Right column - Teleported content (1/3 width)
  const teleportedColumn = document.createElement('div');
  teleportedColumn.className = 'teleported-column';
  teleportedColumn.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    background: ${appState.currentTheme.colors.background};
    border-radius: 12px;
    padding: 20px;
    overflow: hidden;
  `;
  
  // Teleported header
  const teleportedHeader = document.createElement('div');
  teleportedHeader.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 15px;  
    border-bottom: 2px solid ${appState.currentTheme.colors.border};
  `;
  teleportedHeader.innerHTML = `
    <h2 style="
      margin: 0 0 8px 0;
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 1.5rem;
      font-weight: 600;
    ">🌐 Teleported</h2>
    <p style="
      margin: 0;
      color: ${appState.currentTheme.colors.secondary};
      font-size: 14px;
    ">Latest from the marketplace network</p>
  `;
  
  // Teleported container with scrolling
  const teleportedContainer = document.createElement('div');
  teleportedContainer.id = 'teleported-container';
  teleportedContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  `;
  
  teleportedColumn.appendChild(teleportedHeader);
  teleportedColumn.appendChild(teleportedContainer);
  
  screen.appendChild(productsColumn);
  screen.appendChild(teleportedColumn);
  
  return screen;
}

/**
 * Create Product Details Screen
 */
function createDetailsScreen() {
  const screen = document.createElement('div');
  screen.id = 'details-screen';
  screen.className = 'screen';
  
  if (appState.currentProduct) {
    const product = appState.currentProduct;
    
    // Display the selected product
    const productContainer = document.createElement('div');
    productContainer.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.8;
    `;
    
    // Product image
    if (product.featuredImage) {
      const imageElement = document.createElement('img');
      imageElement.src = product.featuredImage;
      imageElement.style.cssText = `
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 12px;
        margin-bottom: 30px;
      `;
      productContainer.appendChild(imageElement);
    }
    
    // Product header
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
    `;
    
    const titlePriceContainer = document.createElement('div');
    titlePriceContainer.style.cssText = `
      flex: 1;
    `;
    
    // Product title
    const title = document.createElement('h1');
    title.textContent = product.title;
    title.style.cssText = `
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: ${appState.currentTheme.typography.headerSize}px;
      margin: 0 0 10px 0;
      line-height: 1.3;
    `;
    
    // Price and category
    const priceCategory = document.createElement('div');
    priceCategory.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    `;
    
    const price = document.createElement('span');
    price.textContent = formatPrice(product.price);
    price.style.cssText = `
      font-size: 28px;
      font-weight: bold;
      color: ${appState.currentTheme.colors.accent};
    `;
    
    const category = document.createElement('span');
    category.textContent = `${getCategoryIcon(product.category)} ${product.category}`;
    category.style.cssText = `
      background: ${appState.currentTheme.colors.background};
      color: ${appState.currentTheme.colors.secondary};
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
    `;
    
    priceCategory.appendChild(price);
    priceCategory.appendChild(category);
    
    // Author and stats
    const authorStats = document.createElement('div');
    authorStats.style.cssText = `
      color: ${appState.currentTheme.colors.secondary};
      font-size: 14px;
      margin-bottom: 20px;
    `;
    authorStats.innerHTML = `
      by <strong>${product.author}</strong> • 
      ⭐ ${product.rating} • 
      💾 ${product.downloadCount.toLocaleString()} downloads • 
      📁 ${product.fileSize}
    `;
    
    titlePriceContainer.appendChild(title);
    titlePriceContainer.appendChild(priceCategory);
    titlePriceContainer.appendChild(authorStats);
    
    // Buy button
    const buyButton = document.createElement('button');
    buyButton.textContent = `Buy for ${formatPrice(product.price)}`;
    buyButton.style.cssText = `
      background: ${appState.currentTheme.colors.accent};
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: 20px;
    `;
    
    buyButton.addEventListener('mouseenter', () => {
      buyButton.style.transform = 'translateY(-2px)';
      buyButton.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.3)';
    });
    
    buyButton.addEventListener('mouseleave', () => {
      buyButton.style.transform = 'translateY(0)';
      buyButton.style.boxShadow = 'none';
    });
    
    buyButton.addEventListener('click', async () => {
      try {
        // Check if payment system is available
        if (!window.initializePayment) {
          alert('Payment system is not available. Please check your internet connection and try again.');
          return;
        }
        
        // Initialize Stripe payment for this product
        console.log('🛒 Initiating purchase for:', product.title);
        await window.initializePayment(product, product.price, 'usd');
      } catch (error) {
        console.error('❌ Payment initialization failed:', error);
        if (error.message.includes('Tauri not available')) {
          alert('Payment processing requires the Tauri desktop app. Please run the app via "npm run tauri dev".');
        } else if (error.message.includes('Stripe library not loaded')) {
          alert('Payment system is loading. Please wait a moment and try again.');
        } else {
          alert('Failed to initialize payment. Please check your connection and try again.');
        }
      }
    });
    
    headerContainer.appendChild(titlePriceContainer);
    headerContainer.appendChild(buyButton);
    
    // Product description
    const description = document.createElement('div');
    description.innerHTML = parseMarkdown(product.previewContent);
    description.style.cssText = `
      color: ${appState.currentTheme.colors.text};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 30px;
    `;
    
    // Tags
    if (product.tags && product.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 30px;
      `;
      
      product.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = `#${tag}`;
        tagElement.style.cssText = `
          background: ${appState.currentTheme.colors.background};
          color: ${appState.currentTheme.colors.accent};
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
        `;
        tagsContainer.appendChild(tagElement);
      });
      
      productContainer.appendChild(tagsContainer);
    }
    
    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back to Shop';
    backButton.style.cssText = `
      background: ${appState.currentTheme.colors.secondary};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 16px;
    `;
    backButton.addEventListener('click', () => {
      appState.currentProduct = null;
      navigateToScreen('main');
    });
    
    productContainer.appendChild(headerContainer);
    productContainer.appendChild(description);
    productContainer.appendChild(backButton);
    screen.appendChild(productContainer);
  } else {
    // No product selected
    screen.innerHTML = `
      <div style="
        text-align: center;
        padding: 100px 20px;
        color: ${appState.currentTheme.colors.secondary};
      ">
        <h1 style="
          color: ${appState.currentTheme.colors.primary};
          margin-bottom: 20px;
          font-size: 2rem;
        ">📄 Product Details</h1>
        <p>Select a product from the Shop to view its details here.</p>
      </div>
    `;
  }
  
  return screen;
}

/**
 * Upload image to Sanora using Tauri invoke
 */
async function uploadImageToSanora(uuid, sanoraUrl, title, imageFile) {
  console.log('🖼️ Attempting image upload to Sanora (Tauri)...');
  
  try {
    // Check if invoke is available
    if (!invoke) {
      console.log('⚠️ Tauri invoke not available, skipping image upload');
      return { success: false, message: 'Tauri not available', filename: null };
    }
    
    // Convert file to array buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    // Create message for signing
    const timestamp = Date.now().toString();
    const message = timestamp + uuid + title;
    
    // Create upload URL (adjust based on actual Sanora endpoints)
    const url = `${sanoraUrl.replace(/\/$/, '')}/user/${uuid}/product/${encodeURIComponent(title)}/image`;
    
    // Call Tauri function
    const result = await invoke('upload_image', {
      fileData: Array.from(fileData),
      fileName: imageFile.name,
      url: url,
      message: message,
      timestamp: timestamp
    });
    
    console.log('✅ Image uploaded successfully via Tauri');
    return { success: true, message: 'Upload successful', result: result };
    
  } catch (error) {
    console.log('⚠️ Image upload failed via Tauri:', error.message);
    return { success: false, message: error.message, filename: null };
  }
}

/**
 * Upload artifact to Sanora using Tauri invoke
 */
async function uploadArtifactToSanora(uuid, sanoraUrl, title, artifactFile) {
  console.log('📄 Attempting artifact upload to Sanora (Tauri)...');
  
  try {
    // Check if invoke is available
    if (!invoke) {
      console.log('⚠️ Tauri invoke not available, skipping artifact upload');
      return { success: false, message: 'Tauri not available', filename: null };
    }
    
    // Convert file to array buffer
    const arrayBuffer = await artifactFile.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    // Determine artifact type from file extension
    const fileExtension = artifactFile.name.split('.').pop().toLowerCase();
    const artifactType = getArtifactType(fileExtension);
    
    // Create message for signing
    const timestamp = Date.now().toString();
    const message = timestamp + uuid + title;
    
    // Create upload URL (adjust based on actual Sanora endpoints)
    const url = `${sanoraUrl.replace(/\/$/, '')}/user/${uuid}/product/${encodeURIComponent(title)}/artifact`;
    
    // Call Tauri function
    const result = await invoke('upload_artifact', {
      fileData: Array.from(fileData),
      fileName: artifactFile.name,
      url: url,
      message: message,
      timestamp: timestamp,
      artifactType: artifactType
    });
    
    console.log('✅ Artifact uploaded successfully via Tauri');
    return { success: true, message: 'Upload successful', result: result };
    
  } catch (error) {
    console.log('⚠️ Artifact upload failed via Tauri:', error.message);
    return { success: false, message: error.message, filename: null };
  }
}

/**
 * Get artifact type from file extension
 */
function getArtifactType(extension) {
  const typeMap = {
    'epub': 'epub',
    'pdf': 'pdf',
    'md': 'md',
    'txt': 'txt',
    'zip': 'zip',
    'mp3': 'mp3',
    'mp4': 'mp4',
    'mov': 'mov',
    'avi': 'avi',
    'wav': 'wav',
    'doc': 'doc',
    'docx': 'docx',
    'png': 'png',
    'jpg': 'jpg',
    'jpeg': 'jpeg',
    'gif': 'gif'
  };
  
  return typeMap[extension] || 'unknown';
}

/**
 * Create Product Upload Form
 */
function createProductUploadForm() {
  const formContainer = document.createElement('div');
  formContainer.className = 'product-form';
  formContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    margin: 20px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;
  
  // Title input
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Product title...';
  titleInput.id = 'product-title';
  titleInput.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.productTitleSize}px;
    font-weight: bold;
  `;
  
  // Category select
  const categorySelect = document.createElement('select');
  categorySelect.id = 'product-category';
  categorySelect.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    background: white;
  `;
  
  const categories = [
    { value: '', label: 'Select category...' },
    { value: 'ebook', label: '📚 E-Book' },
    { value: 'music', label: '🎵 Music' },
    { value: 'software', label: '💻 Software' },
    { value: 'course', label: '🎓 Course' },
    { value: 'template', label: '🎨 Template' },
    { value: 'ticket', label: '🎫 Ticket' }
  ];
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.label;
    if (!cat.value) option.disabled = true;
    categorySelect.appendChild(option);
  });
  
  // Price input
  const priceContainer = document.createElement('div');
  priceContainer.style.cssText = `
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  `;
  
  const priceLabel = document.createElement('span');
  priceLabel.textContent = '$';
  priceLabel.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    margin-right: 8px;
  `;
  
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.placeholder = '29.99';
  priceInput.id = 'product-price';
  priceInput.step = '0.01';
  priceInput.min = '0';
  priceInput.style.cssText = `
    flex: 1;
    padding: 12px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
  `;
  
  priceContainer.appendChild(priceLabel);
  priceContainer.appendChild(priceInput);
  
  // Description textarea
  const descriptionTextarea = document.createElement('textarea');
  descriptionTextarea.placeholder = 'Product description and details...\n\nMarkdown supported:\n• **bold** and *italic*\n• # Headers\n• ![Image](url)\n• `code` and ```code blocks```\n• > blockquotes\n• ✅ checkboxes';
  descriptionTextarea.id = 'product-description';
  descriptionTextarea.rows = 12;
  descriptionTextarea.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.fontSize}px;
    line-height: ${appState.currentTheme.typography.lineHeight};
    resize: vertical;
  `;
  
  // Product Image Upload Section
  const imageSection = document.createElement('div');
  imageSection.style.cssText = `
    margin-bottom: 20px;
    text-align: center;
  `;
  
  const imageSectionTitle = document.createElement('div');
  imageSectionTitle.style.cssText = `
    color: ${appState.currentTheme.colors.secondary};
    margin-bottom: 15px;
    font-weight: bold;
  `;
  imageSectionTitle.innerHTML = `🖼️ <strong>Product Image</strong>`;
  
  const imageUploadButton = document.createElement('button');
  imageUploadButton.style.cssText = `
    background: ${appState.currentTheme.colors.accent};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 25px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: ${appState.currentTheme.typography.fontFamily};
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  `;
  imageUploadButton.innerHTML = `📷 Select Product Image`;
  
  imageUploadButton.addEventListener('mouseenter', () => {
    imageUploadButton.style.backgroundColor = `${appState.currentTheme.colors.accent}dd`;
  });
  
  imageUploadButton.addEventListener('mouseleave', () => {
    imageUploadButton.style.backgroundColor = appState.currentTheme.colors.accent;
  });
  
  const imageFormatsText = document.createElement('div');
  imageFormatsText.style.cssText = `
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
    margin-bottom: 15px;
  `;
  imageFormatsText.innerHTML = `<em>Supported: PNG, JPG, JPEG (recommended: 800x600px)</em>`;
  
  // Create hidden image input
  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.accept = '.png,.jpg,.jpeg';
  imageInput.style.display = 'none';
  
  // Image upload state
  let uploadedImage = null;
  
  // Image preview area
  const imagePreviewContainer = document.createElement('div');
  imagePreviewContainer.style.cssText = `
    margin-top: 15px;
    padding: 15px;
    border-radius: 8px;
    background: ${appState.currentTheme.colors.background};
    display: none;
    text-align: center;
  `;
  
  function updateImageDisplay() {
    if (!uploadedImage) {
      imagePreviewContainer.style.display = 'none';
      return;
    }
    
    imagePreviewContainer.style.display = 'block';
    imagePreviewContainer.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; color: ${appState.currentTheme.colors.text};">
        Selected Image:
      </div>
      <div style="font-size: 14px; color: ${appState.currentTheme.colors.secondary};">
        📷 ${uploadedImage.name} (${(uploadedImage.size / 1024 / 1024).toFixed(2)} MB)
      </div>
    `;
    validateForm(); // Check form validation when image changes
  }
  
  // Image input change handler
  imageInput.addEventListener('change', (e) => {
    console.log('🖼️ Image input change event triggered');
    
    if (e.target.files.length > 0) {
      uploadedImage = e.target.files[0];
      console.log('🖼️ Image selected:', uploadedImage.name);
      updateImageDisplay();
    }
  });
  
  // Image upload button click handler
  imageUploadButton.addEventListener('click', () => {
    console.log('🖱️ Image upload button clicked');
    imageInput.click();
  });
  
  imageSection.appendChild(imageSectionTitle);
  imageSection.appendChild(imageUploadButton);
  imageSection.appendChild(imageFormatsText);
  imageSection.appendChild(imageInput);
  imageSection.appendChild(imagePreviewContainer);

  // File Artifacts Upload Section
  const fileSection = document.createElement('div');
  fileSection.style.cssText = `
    margin-bottom: 20px;
    text-align: center;
  `;
  
  const fileSectionTitle = document.createElement('div');
  fileSectionTitle.style.cssText = `
    color: ${appState.currentTheme.colors.secondary};
    margin-bottom: 15px;
    font-weight: bold;
  `;
  fileSectionTitle.innerHTML = `📁 <strong>Product Files</strong>`;
  
  const uploadButton = document.createElement('button');
  uploadButton.style.cssText = `
    background: ${appState.currentTheme.colors.accent};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 15px 30px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: ${appState.currentTheme.typography.fontFamily};
    display: inline-flex;
    align-items: center;
    gap: 10px;
  `;
  uploadButton.innerHTML = `📦 Select Product Files`;
  
  uploadButton.addEventListener('mouseenter', () => {
    uploadButton.style.backgroundColor = `${appState.currentTheme.colors.accent}dd`;
  });
  
  uploadButton.addEventListener('mouseleave', () => {
    uploadButton.style.backgroundColor = appState.currentTheme.colors.accent;
  });
  
  const supportedFormatsText = document.createElement('div');
  supportedFormatsText.style.cssText = `
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
    margin-top: 8px;
  `;
  supportedFormatsText.innerHTML = `<em>Supported: ZIP, PDF, MP3, MP4, EPUB, MOBI, and more</em>`;
  
  fileSection.appendChild(fileSectionTitle);
  fileSection.appendChild(uploadButton);
  fileSection.appendChild(supportedFormatsText);
  
  // Create hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = '.zip,.pdf,.mp3,.mp4,.epub,.mobi,.txt,.doc,.docx,.png,.jpg,.jpeg';
  fileInput.style.display = 'none';
  
  // File upload state
  let uploadedFiles = [];
  
  // Add file display area
  const fileListContainer = document.createElement('div');
  fileListContainer.style.cssText = `
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
    background: ${appState.currentTheme.colors.background};
    display: none;
  `;
  
  function updateFileDisplay() {
    if (uploadedFiles.length === 0) {
      fileListContainer.style.display = 'none';
    } else {
      fileListContainer.style.display = 'block';
      fileListContainer.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; color: ${appState.currentTheme.colors.text};">
          Selected Files (${uploadedFiles.length}):
        </div>
        ${uploadedFiles.map(file => `
          <div style="font-size: 12px; color: ${appState.currentTheme.colors.secondary}; margin-bottom: 2px;">
            📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        `).join('')}
      `;
    }
    validateForm(); // Check form validation when files change
  }

  // Form validation function
  function validateForm() {
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const price = parseFloat(priceInput.value);
    const description = descriptionTextarea.value.trim();
    
    const isValid = (
      title.length >= 3 &&
      category !== '' &&
      !isNaN(price) && price > 0 &&
      description.length > 0 &&
      uploadedImage !== null &&
      uploadedFiles.length > 0
    );
    
    // Update submit button state
    if (submitButton) {
      if (isValid) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
        submitButton.style.background = appState.currentTheme.colors.accent;
      } else {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
        submitButton.style.cursor = 'not-allowed';
        submitButton.style.background = appState.currentTheme.colors.secondary;
      }
    }
    
    return isValid;
  }
  
  // File input change handler
  fileInput.addEventListener('change', (e) => {
    console.log('📁 File input change event triggered');
    console.log('📁 Files from input:', e.target.files);
    
    const files = Array.from(e.target.files);
    console.log('📁 Files array created from input:', files);
    console.log('📁 File names from input:', files.map(f => f.name));
    
    uploadedFiles = [...uploadedFiles, ...files];
    console.log('📁 Total uploaded files after input:', uploadedFiles.length);
    
    updateFileDisplay();
    validateForm(); // Check form validation when files change
    console.log('✅ File display updated and form validated from input');
  });
  
  // Click handler for upload button
  uploadButton.addEventListener('click', () => {
    console.log('🖱️ Upload button clicked - opening file dialog');
    fileInput.click();
  });
  
  // Store references for later event listener setup after DOM integration
  formContainer.fileSection = fileSection;
  // No longer using drag and drop - file selection is handled by the button click
  formContainer.setupDragAndDrop = function() {
    console.log('🔧 File upload button is ready - no drag and drop needed');
  };
  
  // Append file input and display to file section
  fileSection.appendChild(fileInput);
  fileSection.appendChild(fileListContainer);
  
  // Tags input
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.placeholder = 'Tags (comma-separated): javascript, tutorial, beginner';
  tagsInput.id = 'product-tags';
  tagsInput.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
  `;
  
  // Submit and Clear buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 15px;
  `;
  
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Upload Product';
  submitButton.style.cssText = `
    background: ${appState.currentTheme.colors.accent};
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    flex: 1;
  `;
  
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear Form';
  clearButton.style.cssText = `
    background: ${appState.currentTheme.colors.secondary};
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    cursor: pointer;
    flex: 1;
  `;
  
  // Add event handlers
  submitButton.addEventListener('click', async function() {
    console.log('🔄 Submit button clicked - starting product upload');
    
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const price = parseFloat(priceInput.value);
    const description = descriptionTextarea.value.trim();
    const tags = tagsInput.value.trim();
    
    console.log('📝 Form data collected:', {
      title,
      category,
      price,
      description: description.substring(0, 50) + '...',
      tags,
      uploadedFilesCount: uploadedFiles.length,
      hasImage: !!uploadedImage
    });
    
    // Form validation is handled by the validateForm function and submit button state
    // The button should only be enabled when all required fields are valid
    
    if (!validateForm()) {
      console.log('❌ Form validation failed - submit should be disabled');
      return;
    }
    
    console.log('✅ Form validation passed - proceeding with upload');
    
    // Disable submit button while processing
    submitButton.disabled = true;
    submitButton.textContent = 'Uploading...';
    
    try {
      // First try to upload to Sanora backend
      console.log('🔄 Uploading product to Sanora...');
      
      const sanoraUrl = 'https://dev.sanora.allyabase.com/'; // Dev Sanora base
      const priceInCents = Math.round(price * 100);
      
      console.log('💰 Price converted to cents:', priceInCents);
      console.log('🌐 Connecting to Sanora URL:', sanoraUrl);
      
      try {
        // Try to upload to Sanora if available
        let uploadedToSanora = false;
        let sanoraResult = null;
        
        console.log('🔍 Checking if invoke is available:', !!invoke);
        
        if (invoke) {
          console.log('👤 Creating Sanora user first...');
          try {
            // Step 1: Create a Sanora user
            const sanoraUser = await invoke('create_sanora_user', {
              sanoraUrl: sanoraUrl
            });
            console.log('✅ Sanora user created:', sanoraUser);
            
            // Store user UUID for later use
            appState.lastCreatedUserUuid = sanoraUser.uuid;
            
            // Step 2: Add product metadata
            console.log('📤 Step 2: Adding product metadata...');
            sanoraResult = await invoke('add_product', {
              uuid: sanoraUser.uuid,
              sanoraUrl: sanoraUrl,
              title: title,
              description: description,
              price: priceInCents
            });
            console.log('✅ Product metadata uploaded:', sanoraResult);
            
            // Step 3: Upload product image if available
            if (uploadedImage) {
              console.log('🖼️ Step 3: Uploading product image...');
              const imageResult = await uploadImageToSanora(sanoraUser.uuid, sanoraUrl, title, uploadedImage);
              if (imageResult.success) {
                console.log('✅ Product image uploaded successfully');
              } else {
                console.log('⚠️ Product image upload skipped:', imageResult.message);
              }
            }
            
            // Step 4: Upload product artifacts (files)
            if (uploadedFiles.length > 0) {
              console.log('📦 Step 4: Uploading product artifacts...');
              for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                console.log(`📄 Uploading artifact ${i + 1}/${uploadedFiles.length}: ${file.name}`);
                const artifactResult = await uploadArtifactToSanora(sanoraUser.uuid, sanoraUrl, title, file);
                if (artifactResult.success) {
                  console.log(`✅ Artifact ${i + 1} uploaded successfully`);
                } else {
                  console.log(`⚠️ Artifact ${i + 1} upload skipped:`, artifactResult.message);
                }
              }
            }
            
            uploadedToSanora = true;
          } catch (sanoraError) {
            console.warn('⚠️ Sanora upload failed:', sanoraError);
            console.error('🔴 Sanora error details:', sanoraError);
          }
        } else {
          console.warn('⚠️ invoke not available - skipping Sanora upload');
        }
        
        // Calculate total file size
        const totalFileSize = uploadedFiles.reduce((total, file) => total + file.size, 0);
        const fileSizeMB = (totalFileSize / 1024 / 1024).toFixed(2);
        
        // Create product data object
        const productData = {
          id: sanoraResult?.id || Date.now().toString(),
          title: title,
          description: description,
          price: priceInCents,
          category: category,
          author: 'You',
          timestamp: new Date().toISOString(),
          downloadCount: 0,
          rating: 0,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          featuredImage: PRODUCT_IMAGES[category] || PRODUCT_IMAGES.ebook,
          previewContent: description,
          fileSize: `${fileSizeMB} MB`,
          fileType: uploadedFiles.length === 1 ? uploadedFiles[0].name.split('.').pop().toUpperCase() : 'Mixed Files',
          fileCount: uploadedFiles.length,
          files: uploadedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream'
          })),
          sanoraId: sanoraResult?.id,
          available: true
        };
        
        // Save to localStorage
        const currentProducts = JSON.parse(localStorage.getItem('ninefy-products') || '[]');
        currentProducts.unshift(productData);
        localStorage.setItem('ninefy-products', JSON.stringify(currentProducts));
        
        const message = uploadedToSanora 
          ? 'Product uploaded successfully to Sanora!' 
          : 'Product saved locally (backend unavailable)';
        alert(message);
        
      } catch (generalError) {
        console.error('❌ Unexpected error during product upload:', generalError);
        alert('Unexpected error occurred. Please try again.');
      }
      
      // Clear form
      titleInput.value = '';
      categorySelect.value = '';
      priceInput.value = '';
      descriptionTextarea.value = '';
      tagsInput.value = '';
      uploadedFiles = [];
      updateFileDisplay();
      
      // Navigate back to main screen
      navigateToScreen('main');
      
    } catch (error) {
      console.error('❌ Product upload failed:', error);
      alert('Failed to upload product. Please try again.');
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Upload Product';
    }
  });
  
  clearButton.addEventListener('click', function() {
    titleInput.value = '';
    categorySelect.value = '';
    priceInput.value = '';
    descriptionTextarea.value = '';
    tagsInput.value = '';
    uploadedFiles = [];
    updateFileDisplay();
  });
  
  buttonContainer.appendChild(submitButton);
  buttonContainer.appendChild(clearButton);
  
  // Append all elements
  formContainer.appendChild(titleInput);
  formContainer.appendChild(categorySelect);
  formContainer.appendChild(priceContainer);
  formContainer.appendChild(descriptionTextarea);
  formContainer.appendChild(imageSection);
  formContainer.appendChild(fileSection);
  formContainer.appendChild(tagsInput);
  formContainer.appendChild(buttonContainer);
  
  // Add real-time validation event listeners
  titleInput.addEventListener('input', validateForm);
  categorySelect.addEventListener('change', validateForm);
  priceInput.addEventListener('input', validateForm);
  descriptionTextarea.addEventListener('input', validateForm);
  
  // Initialize form validation state (disabled by default)
  validateForm();
  
  // Debug: Confirm fileSection is now in DOM
  console.log('🔍 After appending to formContainer:');
  console.log('🔍 fileSection in DOM:', document.contains(fileSection));
  console.log('🔍 formContainer in DOM:', document.contains(formContainer));
  console.log('🔍 fileSection parent:', fileSection.parentElement);
  
  return formContainer;
}

/**
 * Create Upload Screen
 */
function createUploadScreen() {
  const screen = document.createElement('div');
  screen.id = 'upload-screen';
  screen.className = 'screen';
  
  // Create header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1 style="
      text-align: center;
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 20px;
      font-size: 2rem;
    ">Upload Your Product</h1>
    <p style="
      text-align: center;
      color: ${appState.currentTheme.colors.secondary};
      margin-bottom: 30px;
    ">Share your digital goods with the Ninefy marketplace</p>
  `;
  
  // Create form
  const formContainer = createProductUploadForm();
  
  screen.appendChild(header);
  screen.appendChild(formContainer);
  
  // Setup drag and drop after DOM integration
  screen.setupDragAndDrop = function() {
    if (formContainer.setupDragAndDrop) {
      formContainer.setupDragAndDrop();
    }
  };
  
  return screen;
}

/**
 * Create base server card (reused from rhapsold)
 */
function createBaseCard(base) {
  const card = document.createElement('div');
  card.className = 'base-card';
  card.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid ${getStatusColor(base.status)};
    transition: all 0.2s ease;
    cursor: pointer;
  `;
  
  // Status indicator
  const statusEmoji = {
    'connected': '🟢',
    'available': '🟡', 
    'limited': '🟠',
    'offline': '🔴'
  };
  
  // Type emoji
  const typeEmoji = {
    'development': '🛠️',
    'production': '🏭',
    'community': '👥',
    'privacy': '🔒',
    'research': '🔬'
  };
  
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">${typeEmoji[base.type] || '🌐'}</span>
        <div>
          <h3 style="
            margin: 0 0 4px 0;
            color: ${appState.currentTheme.colors.primary};
            font-size: 18px;
            font-weight: 600;
          ">${base.name}</h3>
          <p style="
            margin: 0;
            color: ${appState.currentTheme.colors.secondary};
            font-size: 12px;
            font-family: monospace;
          ">${base.url}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
          color: ${getStatusColor(base.status)};
        ">
          ${statusEmoji[base.status]} ${base.status.toUpperCase()}
        </div>
        <div style="
          font-size: 11px;
          color: ${appState.currentTheme.colors.secondary};
        ">
          ${base.users.toLocaleString()} users
        </div>
      </div>
    </div>
    
    <p style="
      margin: 0 0 16px 0;
      color: ${appState.currentTheme.colors.text};
      font-size: 14px;
      line-height: 1.4;
    ">${base.description}</p>
    
    <div style="
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    ">
      ${base.services.map(service => `
        <span style="
          background: ${appState.currentTheme.colors.background};
          color: ${appState.currentTheme.colors.accent};
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        ">${service}</span>
      `).join('')}
    </div>
    
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid ${appState.currentTheme.colors.background};
    ">
      <div style="
        font-size: 12px;
        color: ${appState.currentTheme.colors.secondary};
      ">
        Uptime: ${base.uptime}
      </div>
      <button style="
        background: ${base.status === 'connected' ? appState.currentTheme.colors.secondary : appState.currentTheme.colors.accent};
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
      ">
        ${base.status === 'connected' ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  `;
  
  // Hover effects
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  });
  
  // Click handler
  card.addEventListener('click', () => {
    console.log('Base clicked:', base.name);
    alert(`Would ${base.status === 'connected' ? 'disconnect from' : 'connect to'} ${base.name}`);
  });
  
  return card;
}

/**
 * Get status color
 */
function getStatusColor(status) {
  const colors = {
    'connected': '#10b981',
    'available': '#f59e0b',
    'limited': '#f97316', 
    'offline': '#ef4444'
  };
  return colors[status] || '#6b7280';
}

/**
 * Create Base Screen (Server Management) - reused from rhapsold
 */
function createBaseScreen() {
  const screen = document.createElement('div');
  screen.id = 'base-screen';
  screen.className = 'screen';
  screen.style.cssText = `
    padding: 20px;
    overflow-y: auto;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 40px;
  `;
  header.innerHTML = `
    <h1 style="
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 12px;
      font-size: 2rem;
      font-family: ${appState.currentTheme.typography.fontFamily};
    ">🌐 Base Server Management</h1>
    <p style="
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
      margin: 0;
    ">Connect to allyabase servers across the decentralized network</p>
  `;
  
  // Bases container
  const basesContainer = document.createElement('div');
  basesContainer.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    gap: 20px;
  `;
  
  // Placeholder base data (same as rhapsold)
  const placeholderBases = [
    {
      name: 'Dev Sanora Base',
      url: 'https://dev.sanora.allyabase.com/',
      status: 'connected',
      type: 'development',
      services: ['sanora', 'bdo', 'dolores', 'addie', 'fount'],
      description: 'Development Sanora base for testing digital goods marketplace',
      users: 25,
      uptime: '99.5%'
    },
    {
      name: 'Local Development',
      url: 'http://localhost:7243',
      status: 'available',
      type: 'development',
      services: ['sanora', 'bdo', 'dolores', 'addie', 'fount'],
      description: 'Local development environment for testing',
      users: 1,
      uptime: '99.9%'
    },
    {
      name: 'Planet Nine Alpha',
      url: 'https://alpha.allyabase.com',
      status: 'connected', 
      type: 'production',
      services: ['sanora', 'bdo', 'dolores', 'addie', 'fount', 'julia'],
      description: 'Main Planet Nine production cluster',
      users: 15420,
      uptime: '99.8%'
    },
    {
      name: 'Community Beta',
      url: 'https://beta.community.allyabase.com',
      status: 'available',
      type: 'community',
      services: ['sanora', 'bdo', 'dolores'],
      description: 'Community-run server for beta testing',
      users: 892,
      uptime: '98.5%'
    },
    {
      name: 'Privacy-First Base',
      url: 'https://privacy.allyabase.org',
      status: 'available',
      type: 'privacy',
      services: ['sanora', 'bdo', 'julia'],
      description: 'Enhanced privacy and encryption focus',
      users: 3241,
      uptime: '99.2%'
    },
    {
      name: 'Academic Research',
      url: 'https://research.edu.allyabase.net',
      status: 'limited',
      type: 'research', 
      services: ['bdo', 'dolores'],
      description: 'University research cluster (restricted access)',
      users: 156,
      uptime: '97.1%'
    }
  ];
  
  placeholderBases.forEach(base => {
    const baseCard = createBaseCard(base);
    basesContainer.appendChild(baseCard);
  });
  
  screen.appendChild(header);
  screen.appendChild(basesContainer);
  
  return screen;
}

/**
 * Render the current screen
 */
function renderCurrentScreen() {
  const contentContainer = document.getElementById('screen-content');
  if (!contentContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  
  // Create the appropriate screen
  let screen;
  switch (appState.currentScreen) {
    case 'main':
      screen = createMainScreen();
      // Load products after screen is added to DOM
      setTimeout(async () => {
        await loadProducts();
      }, 10);
      break;
    case 'browse':
      screen = createBrowseBaseScreen();
      break;
    case 'details':
      screen = createDetailsScreen();
      break;
    case 'upload':
      screen = createUploadScreen();
      break;
    case 'base':
      screen = createBaseScreen();
      break;
    default:
      screen = createMainScreen();
      appState.currentScreen = 'main';
  }
  
  contentContainer.appendChild(screen);
  
  // Setup any screen-specific functionality after DOM integration
  if (screen.setupDragAndDrop) {
    setTimeout(() => {
      screen.setupDragAndDrop();
    }, 10);
  }
}

/**
 * Load products and teleported content
 */
async function loadProducts() {
  console.log('🛒 Loading products and teleported content...');
  
  try {
    // Load products from localStorage and connected bases
    const localProducts = JSON.parse(localStorage.getItem('ninefy-products') || '[]');
    
    // Get products from all connected bases
    const baseProducts = await getProductsFromBases();
    
    const allProducts = [...localProducts, ...baseProducts];
    
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
      // Clear existing content
      productsContainer.innerHTML = '';
      
      if (allProducts.length === 0) {
        // Show "no data yet" message for products
        const noDataElement = document.createElement('div');
        noDataElement.style.cssText = `
          padding: 40px 20px;
          text-align: center;
          color: ${appState.currentTheme.colors.secondary};
          font-family: ${appState.currentTheme.typography.fontFamily};
          font-size: 18px;
        `;
        noDataElement.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
          <div style="font-weight: bold; margin-bottom: 8px;">No products yet</div>
          <div style="font-size: 14px;">Products will appear here when they're added to your marketplace</div>
        `;
        productsContainer.appendChild(noDataElement);
      } else {
        allProducts.forEach(productData => {
          const productElement = createProductCard(productData);
          productsContainer.appendChild(productElement);
        });
      }
      
      console.log(`🛒 Loaded ${allProducts.length} products (${localProducts.length} local + ${baseProducts.length} from bases)`);
    }
    
    // Load teleported content
    const teleportedContainer = document.getElementById('teleported-container');
    if (teleportedContainer) {
      // Clear existing content
      teleportedContainer.innerHTML = '';
      
      if (TELEPORTED_CONTENT.length === 0) {
        // Show "no data yet" message for teleported content
        const noDataElement = document.createElement('div');
        noDataElement.style.cssText = `
          padding: 40px 20px;
          text-align: center;
          color: ${appState.currentTheme.colors.secondary};
          font-family: ${appState.currentTheme.typography.fontFamily};
          font-size: 18px;
        `;
        noDataElement.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
          <div style="font-weight: bold; margin-bottom: 8px;">No teleported content yet</div>
          <div style="font-size: 14px;">Teleported content from other bases will appear here</div>
        `;
        teleportedContainer.appendChild(noDataElement);
      } else {
        TELEPORTED_CONTENT.forEach(item => {
          const teleportedElement = createTeleportedItem(item);
          teleportedContainer.appendChild(teleportedElement);
        });
      }
      
      console.log(`🌐 Loaded ${TELEPORTED_CONTENT.length} teleported items`);
    }
    
  } catch (error) {
    console.warn('⚠️ Could not load content:', error);
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
      appState.isLoading = false;
    }, 500);
  }
}

/**
 * Initialize the application
 */
async function init() {
  try {
    console.log('🛒 Initializing Ninefy...');
    
    // Get the main app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }
    
    // Clear existing content
    appContainer.innerHTML = '';
    
    // Create HUD
    const hud = createHUD();
    document.body.appendChild(hud);
    
    // Create main layout with screen system
    const mainLayout = document.createElement('div');
    mainLayout.style.cssText = `
      max-width: 1200px;
      margin: 80px auto 20px auto;
      padding: 20px;
      font-family: ${appState.currentTheme.typography.fontFamily};
    `;
    
    // Create screen content container
    const screenContent = document.createElement('div');
    screenContent.id = 'screen-content';
    screenContent.className = 'screen-content';
    
    mainLayout.appendChild(screenContent);
    appContainer.appendChild(mainLayout);
    
    // Initialize with main screen
    renderCurrentScreen();
    
    // Hide loading screen
    hideLoadingScreen();
    
    console.log('✅ Ninefy initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Ninefy:', error);
    
    // Hide loading screen even on error
    hideLoadingScreen();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

console.log('🛒 Ninefy main module loaded');
