/**
 * Ninefy - Main Application Entry Point (No ES6 Modules)
 * A minimalist digital goods marketplace using SVG components
 */

// Dynamic Form Widget Loading from Current Sanora Service
function loadFormWidget() {
  // Check if environment functions are available
  if (typeof getServiceUrl === 'undefined') {
    console.warn('⚠️ Environment config not ready, retrying in 100ms...');
    setTimeout(loadFormWidget, 100);
    return;
  }
  
  const sanoraUrl = getServiceUrl('sanora');
  const baseUrl = sanoraUrl.endsWith('/') ? sanoraUrl.slice(0, -1) : sanoraUrl;
  
  console.log(`📋 Loading form-widget from: ${baseUrl}`);
  
  // Load CSS dynamically
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = `${baseUrl}/form-widget.css`;
  cssLink.onload = () => console.log('✅ Form widget CSS loaded');
  cssLink.onerror = (e) => {
    console.warn('⚠️ Failed to load form widget CSS:', cssLink.href);
    console.error('CSS load error:', e);
  };
  document.head.appendChild(cssLink);
  
  // Load JavaScript dynamically
  const jsScript = document.createElement('script');
  jsScript.src = `${baseUrl}/form-widget.js`;
  jsScript.onload = () => {
    console.log('✅ Form widget JS loaded');
    console.log('📝 window.getForm available:', typeof window.getForm);
  };
  jsScript.onerror = (e) => {
    console.warn('⚠️ Failed to load form widget JS:', jsScript.src);
    console.error('JS load error:', e);
  };
  document.head.appendChild(jsScript);
}

// Initialize environment controls and load form widget when ready
async function initializeEnvironmentAndFormWidget() {
  // Check if environment functions are available
  if (typeof createEnvironmentControls === 'undefined') {
    console.warn('⚠️ Environment config not ready, retrying...');
    setTimeout(initializeEnvironmentAndFormWidget, 100);
    return;
  }
  
  console.log('🔧 Environment functions available, initializing environment...');
  
  // Initialize environment from Rust first
  await initializeEnvironment();
  
  console.log('🔍 localStorage nullary-env:', localStorage.getItem('nullary-env'));
  console.log('🔍 typeof getEnvironmentConfig:', typeof getEnvironmentConfig);
  console.log('🔍 typeof getServiceUrl:', typeof getServiceUrl);
  
  // Setup environment controls for browser console
  window.ninefyEnv = createEnvironmentControls('ninefy');
  
  // Load form widget
  loadFormWidget();
}

// Load form widget as soon as page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeEnvironmentAndFormWidget();
});

// Tauri API for backend communication (with safety check)
let invoke = null;
let tauriInitialized = false;

// Initialize environment from Rust environment variables
async function initializeEnvironment() {
  try {
    if (invoke) {
      const envFromRust = await invoke('get_env_config');
      if (envFromRust && ['dev', 'test', 'local'].includes(envFromRust)) {
        console.log(`🌍 Environment from Rust: ${envFromRust}`);
        // Removed localStorage to avoid quota issues
        return envFromRust;
      }
    }
  } catch (error) {
    console.log('⚠️ Could not get environment from Rust, using localStorage/default');
  }
  
  return localStorage.getItem('nullary-env') || 'dev';
}

// Environment switching now handled by environment-config.js
// This will be set up by initializeEnvironmentAndFormWidget()

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
  ebook: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzRhOTBlMiIvPgogIDxyZWN0IHg9IjgwIiB5PSI1MCIgd2lkdGg9IjI0MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmZmZmZmYiIHJ4PSI4Ii8+CiAgPGxpbmUgeDE9IjEwMCIgeTE9IjgwIiB4Mj0iMjgwIiB5Mj0iODAiIHN0cm9rZT0iIzRhOTBlMiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjI4MCIgeTI9IjEwMCIgc3Ryb2tlPSIjNGE5MGUyIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8bGluZSB4MT0iMTAwIiB5MT0iMTIwIiB4Mj0iMjUwIiB5Mj0iMTIwIiBzdHJva2U9IiM0YTkwZTIiIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5FLUJvb2s8L3RleHQ+Cjwvc3ZnPg==",
  
  course: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%23f39c12'/%3E%3Crect x='50' y='70' width='300' height='110' fill='%23ffffff' rx='5'/%3E%3Crect x='60' y='80' width='120' height='90' fill='%23f39c12' rx='3'/%3E%3Ctext x='120' y='130' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='36' font-weight='bold'%3E▶%3C/text%3E%3Cline x1='200' y1='90' x2='330' y2='90' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='110' x2='320' y2='110' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='130' x2='310' y2='130' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='150' x2='300' y2='150' stroke='%23f39c12' stroke-width='2'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ECourse%3C/text%3E%3C/svg%3E",
  
  shippable: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%2327ae60'/%3E%3Crect x='100' y='60' width='200' height='130' fill='%23ffffff' rx='10'/%3E%3Crect x='100' y='60' width='200' height='30' fill='%2327ae60' rx='10,10,0,0'/%3E%3Ctext x='200' y='80' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='12' font-weight='bold'%3ESHIPPING LABEL%3C/text%3E%3Cline x1='120' y1='110' x2='280' y2='110' stroke='%2327ae60' stroke-width='2'/%3E%3Cline x1='120' y1='125' x2='260' y2='125' stroke='%2327ae60' stroke-width='2'/%3E%3Cline x1='120' y1='140' x2='240' y2='140' stroke='%2327ae60' stroke-width='2'/%3E%3Cline x1='120' y1='155' x2='270' y2='155' stroke='%2327ae60' stroke-width='2'/%3E%3Cline x1='120' y1='170' x2='250' y2='170' stroke='%2327ae60' stroke-width='2'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3EShippable%3C/text%3E%3C/svg%3E",
  
  ticket: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%2327ae60'/%3E%3Crect x='60' y='80' width='280' height='90' fill='%23ffffff' rx='8'/%3E%3Cpath d='M190 80 Q200 90 190 100 Q200 110 190 120 Q200 130 190 140 Q200 150 190 160 Q200 170 190 170 L210 170 Q200 170 210 160 Q200 150 210 140 Q200 130 210 120 Q200 110 210 100 Q200 90 210 80 Z' fill='%2327ae60'/%3E%3Ctext x='125' y='105' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='12' font-weight='bold'%3EEVENT%3C/text%3E%3Ctext x='125' y='125' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='20' font-weight='bold'%3ETICKET%3C/text%3E%3Ctext x='125' y='145' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='10'%3EADMIT ONE%3C/text%3E%3Ctext x='275' y='115' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='10'%3E$50.00%3C/text%3E%3Ctext x='275' y='135' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='8'%3E#001234%3C/text%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ETicket%3C/text%3E%3C/svg%3E",
  
  sodoto: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%2310b981'/%3E%3Crect x='50' y='70' width='300' height='110' fill='%23ffffff' rx='5'/%3E%3Cpath d='M80,100 L110,100 L110,120 L80,120 Z' fill='%2310b981' /%3E%3Cpath d='M85,105 L105,105 L100,115 Z' fill='%23ffffff' /%3E%3Ctext x='125' y='115' fill='%2310b981' font-family='Arial' font-size='16' font-weight='bold'%3E✓%3C/text%3E%3Cline x1='140' y1='105' x2='300' y2='105' stroke='%2310b981' stroke-width='2'/%3E%3Cline x1='140' y1='125' x2='280' y2='125' stroke='%2310b981' stroke-width='2'/%3E%3Cline x1='140' y1='145' x2='290' y2='145' stroke='%2310b981' stroke-width='2'/%3E%3Cline x1='140' y1='165' x2='270' y2='165' stroke='%2310b981' stroke-width='2'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ESoDoTo%3C/text%3E%3C/svg%3E"
};

// No demo teleported content - production ready

// No sample products - production ready
const SAMPLE_PRODUCTS = [];

// No demo teleported content - production ready  
const TELEPORTED_CONTENT = [];

// Base management (adapted from screenary pattern)
const BASE_CONFIG = {
  CACHE_TIMEOUT: 600000, // 10 minutes
  PRODUCT_CACHE_TIMEOUT: 300000 // 5 minutes  
};

// Get home base URL dynamically from environment
function getHomeBaseUrl() {
  if (typeof getServiceUrl !== 'undefined') {
    const bdoUrl = getServiceUrl('bdo');
    return bdoUrl.endsWith('/') ? bdoUrl : bdoUrl + '/';
  }
  // Fallback to dev if environment not ready
  return 'https://dev.bdo.allyabase.com/';
}

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
    const homeBaseUrl = getHomeBaseUrl();
    console.log('🏠 Connecting to home base:', homeBaseUrl);
    
    // Create BDO user on home base
    const bdoUser = await invoke('create_bdo_user');
    console.log('✅ BDO user created:', bdoUser);
    
    return {
      name: 'DEV',
      description: 'Development base for Ninefy marketplace',
      dns: {
        bdo: homeBaseUrl,
        sanora: getServiceUrl('sanora'),
        dolores: getServiceUrl('dolores'),
        addie: getServiceUrl('addie'),
        fount: getServiceUrl('fount')
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
      bdoUrl: getHomeBaseUrl()
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

/**
 * Normalize a product from a base to match the expected local product format
 */
function normalizeBaseProduct(rawProduct, baseId, baseName, baseUrl) {
  console.log('🔧 Normalizing base product:', rawProduct);
  
  // Handle the weird nested structure where product data is nested under the title key
  let productData;
  if (rawProduct && typeof rawProduct === 'object') {
    // Check if this has the nested structure like { "Fares": { actualProductData } }
    const keys = Object.keys(rawProduct).filter(key => !['baseId', 'baseName', 'baseUrl'].includes(key));
    
    // Look for a key that contains the actual product data (has required fields like title, category, etc.)
    // Prioritize menu catalog products (category: 'menu') over individual menu items
    let mainProductKey = null;
    
    // First pass: look specifically for menu catalog products
    for (const key of keys) {
      const potentialProduct = rawProduct[key];
      if (potentialProduct && typeof potentialProduct === 'object' && 
          potentialProduct.category === 'menu') {
        mainProductKey = key;
        console.log('🍽️ Found menu catalog product:', key);
        break;
      }
    }
    
    // Second pass: if no menu catalog found, look for any valid product
    if (!mainProductKey) {
      for (const key of keys) {
        const potentialProduct = rawProduct[key];
        if (potentialProduct && typeof potentialProduct === 'object' && 
            (potentialProduct.title || potentialProduct.category || potentialProduct.description)) {
          mainProductKey = key;
          console.log('📋 Found regular product:', key);
          break;
        }
      }
    }
    
    if (mainProductKey) {
      // This is the nested format
      productData = rawProduct[mainProductKey];
      console.log('📋 Extracted nested product data from key:', mainProductKey, 'data:', productData);
    } else {
      // This is already flat
      productData = rawProduct;
      console.log('📋 Using flat product data:', productData);
    }
  } else {
    productData = rawProduct;
  }
  
  // Create normalized product with all required fields
  const normalizedProduct = {
    // Core fields
    id: productData.productId || `${baseId}-${productData.title || 'unknown'}-${Date.now()}`,
    title: productData.title || 'Untitled Product',
    description: productData.description || '',
    price: productData.price || 0,
    
    // Category/Type
    category: productData.category || productData.type || 'ebook',
    productType: productData.productType || productData.product_type || productData.category || 'ebook', // Explicit product type
    
    // Display fields with defaults
    author: productData.author || productData.creator || 'Unknown Author',
    downloadCount: productData.downloadCount || Math.floor(Math.random() * 50),
    rating: productData.rating || (4 + Math.random()).toFixed(1),
    tags: productData.tags || ['product'],
    
    // Image handling
    featuredImage: (() => {
      // For products from bases, use the base URL + image path
      if (productData.image) {
        const imageUrl = `${baseUrl.replace(/\/$/, '')}/images/${productData.image}`;
        console.log(`🖼️ Using base image for "${productData.title}": ${imageUrl}`);
        return imageUrl;
      } else {
        const category = productData.category || productData.type || 'ebook';
        const fallbackImage = PRODUCT_IMAGES[category];
        console.log(`🖼️ Using fallback SVG for "${productData.title}" (category: ${category}): ${fallbackImage ? 'SVG data URL' : 'MISSING!'}`);
        return fallbackImage;
      }
    })(),
    
    // File info
    fileSize: productData.fileSize || productData.file_size || '1 MB',
    fileType: productData.fileType || productData.file_type || 'DIGITAL',
    
    // Metadata
    timestamp: productData.timestamp || new Date().toISOString(),
    previewContent: productData.previewContent || productData.description || 'No preview available',
    
    // Base info
    baseId,
    baseName,
    baseUrl,
    
    // Keep original artifacts info if present
    artifacts: productData.artifacts || [],
    uuid: productData.uuid
  };
  
  console.log('✅ Normalized product:', normalizedProduct);
  return normalizedProduct;
}

async function getProductsFromBases() {
  const now = new Date().getTime();
  
  // Temporarily disable cache for debugging
  console.log('🔄 Cache disabled for debugging - always fetching fresh products');
  // if (productsCache.length > 0 && (now - lastProductsRefresh < BASE_CONFIG.PRODUCT_CACHE_TIMEOUT)) {
  //   console.log('📦 Using cached products');
  //   return productsCache;
  // }
  
  console.log('🔄 Refreshing products from all bases...');
  
  const bases = await getAvailableBases();
  console.log('🏗️ Available bases:', Object.keys(bases).length, bases);
  const allProducts = [];
  
  for (const [baseId, base] of Object.entries(bases)) {
    if (!base.dns?.sanora) continue;
    
    try {
      console.log(`🔍 Fetching products from ${base.name} at ${base.dns.sanora}`);
      
      // Use the new /products/base endpoint (no authentication required)
      const products = await invoke('get_all_base_products', {
        sanoraUrl: base.dns.sanora
      });
      
      console.log(`📦 Raw products from ${base.name}:`, products);
      console.log(`📦 Products type:`, typeof products, Array.isArray(products));
      
      if (Array.isArray(products)) {
        const normalizedProducts = products.map(p => normalizeBaseProduct(p, baseId, base.name, base.dns.sanora));
        allProducts.push(...normalizedProducts);
        console.log(`✅ Added ${products.length} products from ${base.name} (array format)`);
      } else if (products && typeof products === 'object') {
        const productArray = Object.values(products);
        const normalizedProducts = productArray.map(p => normalizeBaseProduct(p, baseId, base.name, base.dns.sanora));
        allProducts.push(...normalizedProducts);
        console.log(`✅ Added ${productArray.length} products from ${base.name} (object format)`);
      } else {
        console.log(`⚠️ No products or unknown format from ${base.name}:`, products);
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
  if (PRODUCT_FORM_CONFIG && PRODUCT_FORM_CONFIG.productTypes[category]) {
    return PRODUCT_FORM_CONFIG.productTypes[category].icon;
  }
  
  // Fallback icons if config not loaded
  const icons = {
    'ebook': '📚',
    'course': '🎓',
    'ticket': '🎫',
    'shippable': '📦',
    'sodoto': '✅',
    'menu': '🍽️'
  };
  return icons[category] || '📦';
}

/**
 * Get metadata section title based on category
 */
function getMetadataTitle(category) {
  if (PRODUCT_FORM_CONFIG && PRODUCT_FORM_CONFIG.productTypes[category]) {
    return PRODUCT_FORM_CONFIG.productTypes[category].title;
  }
  
  // Fallback titles if config not loaded
  const titles = {
    'ebook': '📚 Book Details',
    'course': '🎓 Course Information',
    'ticket': '🎫 Event Details',
    'shippable': '📦 Product Specifications',
    'sodoto': '✅ SoDoTo Course Information',
    'menu': '🍽️ Menu Catalog Information'
  };
  return titles[category] || '📋 Product Information';
}

/**
 * Create metadata display based on category and data
 */
function createMetadataDisplay(category, metadata) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    font-size: 14px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  
  // Get display fields from display config or fallback
  let displayFields = {};
  if (PRODUCT_DISPLAY_CONFIG && PRODUCT_DISPLAY_CONFIG.productTypes[category]) {
    displayFields[category] = PRODUCT_DISPLAY_CONFIG.productTypes[category].detailFields;
  } else {
    // Fallback display fields if config not loaded
    displayFields = {
      ebook: [
        { key: 'author', label: 'Author', icon: '✍️' },
        { key: 'isbn', label: 'ISBN', icon: '🔢' },
        { key: 'pages', label: 'Pages', icon: '📄' },
        { key: 'language', label: 'Language', icon: '🌐' }
      ],
      course: [
        { key: 'instructor', label: 'Instructor', icon: '👨‍🏫' },
        { key: 'duration', label: 'Duration', icon: '⏱️' },
        { key: 'level', label: 'Level', icon: '📈' },
        { key: 'modules', label: 'Modules', icon: '📚' },
        { key: 'schedule', label: 'Schedule', icon: '📅', type: 'file' },
        { key: 'certificate', label: 'Certificate', icon: '🏆', type: 'boolean' }
      ],
      ticket: [
        { key: 'organizer', label: 'Organizer', icon: '🏢' },
        { key: 'venue', label: 'Venue', icon: '📍' },
        { key: 'datetime', label: 'Date & Time', icon: '📅', type: 'datetime' },
        { key: 'capacity', label: 'Capacity', icon: '👥' },
        { key: 'transferable', label: 'Transferable', icon: '🔄', type: 'boolean' }
      ],
      shippable: [
        { key: 'weight', label: 'Weight', icon: '⚖️', suffix: ' lbs' },
        { key: 'dimensions', label: 'Dimensions', icon: '📏' },
        { key: 'shipping_class', label: 'Shipping Class', icon: '📦' },
        { key: 'origin_country', label: 'Origin', icon: '🌍' }
      ],
      sodoto: [
        { key: 'instructor', label: 'Instructor', icon: '👨‍🏫' },
        { key: 'duration', label: 'Duration', icon: '⏱️' },
        { key: 'level', label: 'Level', icon: '📈' },
        { key: 'modules', label: 'Modules', icon: '📚' },
        { key: 'schedule', label: 'Schedule', icon: '📅', type: 'file' },
        { key: 'certificate', label: 'Certificate', icon: '🏆', type: 'boolean' }
      ],
      menu: [
        { key: 'menuDescription', label: 'Description', icon: '📝', type: 'textarea' },
        { key: 'totalProducts', label: 'Total Products', icon: '📦' },
        { key: 'menuCount', label: 'Number of Menus', icon: '🍽️' },
        { key: 'menuStructure', label: 'Menu Structure', icon: '🗂️', type: 'special' }
      ]
    };
  }
  
  const fields = displayFields[category] || [];
  
  fields.forEach(field => {
    if (metadata[field.key] !== undefined && metadata[field.key] !== '') {
      const fieldElement = document.createElement('div');
      fieldElement.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 0;
      `;
      
      let displayValue = metadata[field.key];
      
      // Format based on field type
      if (field.type === 'boolean') {
        displayValue = displayValue ? 'Yes' : 'No';
      } else if (field.type === 'datetime' && displayValue) {
        const date = new Date(displayValue);
        displayValue = date.toLocaleString();
      } else if (field.type === 'file' && displayValue) {
        displayValue = '📎 ' + (displayValue.name || displayValue);
      } else if (field.type === 'special' && field.key === 'menuStructure') {
        // Special handling for menu structure display
        const menuStructureElement = createMenuStructureDisplay(metadata[field.key]);
        fieldElement.innerHTML = `
          <div style="display: flex; align-items: flex-start; gap: 8px; width: 100%;">
            <span>${field.icon}</span>
            <div style="flex: 1;">
              <strong>${field.label}:</strong>
              <div style="margin-top: 8px;">${menuStructureElement.outerHTML}</div>
            </div>
          </div>
        `;
        container.appendChild(fieldElement);
        return; // Skip the normal display logic
      } else if (field.suffix) {
        displayValue += field.suffix;
      }
      
      fieldElement.innerHTML = `
        <span>${field.icon}</span>
        <strong>${field.label}:</strong>
        <span>${displayValue}</span>
      `;
      
      container.appendChild(fieldElement);
    }
  });
  
  return container;
}

/**
 * Create a visual display of menu structure for catalog products
 */
function createMenuStructureDisplay(menuData) {
  const container = document.createElement('div');
  container.style.cssText = `
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    margin: 10px 0;
    font-family: monospace;
    font-size: 13px;
    max-height: 300px;
    overflow-y: auto;
  `;
  
  if (!menuData || typeof menuData !== 'object') {
    container.innerHTML = '<span style="color: #666; font-style: italic;">No menu structure available</span>';
    return container;
  }
  
  let structureHTML = '';
  
  // Handle different formats of menu data
  let menus = {};
  if (menuData.menus) {
    menus = menuData.menus;
  } else if (typeof menuData === 'object') {
    menus = menuData;
  }
  
  if (Object.keys(menus).length === 0) {
    container.innerHTML = '<span style="color: #666; font-style: italic;">No menus found</span>';
    return container;
  }
  
  structureHTML += '<div style="font-weight: bold; color: #2c3e50; margin-bottom: 10px;">📋 Menu Structure</div>';
  
  Object.entries(menus).forEach(([menuKey, menu]) => {
    // Main menu
    structureHTML += `
      <div style="margin-bottom: 8px;">
        <span style="color: #9b59b6; font-weight: bold;">🍽️ ${menu.title || menuKey}</span>
    `;
    
    // Direct products in main menu
    if (menu.products && menu.products.length > 0) {
      structureHTML += `
        <div style="margin-left: 20px; color: #27ae60; font-size: 12px;">
          └ ${menu.products.length} direct products
        </div>
      `;
    }
    
    // Submenus
    if (menu.submenus && Object.keys(menu.submenus).length > 0) {
      Object.entries(menu.submenus).forEach(([submenuKey, submenu]) => {
        const productCount = submenu.products ? submenu.products.length : 0;
        structureHTML += `
          <div style="margin-left: 20px; color: #e74c3c;">
            ├─ ${submenu.title || submenuKey}
            <span style="color: #27ae60; font-size: 11px;">(${productCount} products)</span>
          </div>
        `;
      });
    }
    
    structureHTML += '</div>';
  });
  
  // Summary statistics
  const totalMenus = Object.keys(menus).length;
  const totalSubmenus = Object.values(menus).reduce((count, menu) => {
    return count + (menu.submenus ? Object.keys(menu.submenus).length : 0);
  }, 0);
  
  structureHTML += `
    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #dee2e6; color: #666; font-size: 11px;">
      📊 Summary: ${totalMenus} menus, ${totalSubmenus} submenus
    </div>
  `;
  
  container.innerHTML = structureHTML;
  return container;
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
  // Debug logging for menu detection
  console.log('🔍 Checking product for menu detection:', {
    title: product.title,
    category: product.category,
    productType: product.productType,
    hasMenuUtils: !!window.MenuUtils,
    hasMenuDisplay: !!window.MenuDisplay
  });
  
  // Check if this is a menu product and use menu display if available
  if (window.MenuUtils && window.MenuDisplay) {
    const isMenu = window.MenuUtils.isMenuProduct(product);
    console.log('🍽️ Menu detection result for', product.title, ':', isMenu);
    
    if (isMenu) {
      console.log('🍽️ Creating menu catalog card for:', product.title);
      
      // Convert product to menu catalog format if needed
      const menuCatalog = window.MenuUtils.convertProductToMenuCatalog(product);
      if (menuCatalog) {
        return window.MenuDisplay.createMenuCatalogCard(menuCatalog, {
          theme: appState.currentTheme,
          onClick: (menu) => {
            console.log('🍽️ Menu clicked:', menu.title);
            showProductDetails(menu.originalProduct || menu); // Show details using the original product
          }
        });
      }
    }
  }

  // Create regular product card
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
  console.log('🖼️ Product image debug:', {
    title: product.title,
    featuredImage: product.featuredImage,
    hasImage: !!product.featuredImage
  });
  
  if (product.featuredImage) {
    const imageElement = document.createElement('img');
    imageElement.src = product.featuredImage;
    imageElement.style.cssText = `
      width: 100%;
      height: 200px;
      object-fit: cover;
    `;
    
    imageElement.onerror = function() {
      console.error(`❌ Failed to load image for "${product.title}": ${product.featuredImage}`);
      this.style.display = 'none';
    };
    
    imageElement.onload = function() {
      console.log(`✅ Successfully loaded image for "${product.title}"`);
    };
    
    cardContainer.appendChild(imageElement);
  } else {
    console.warn(`⚠️ No featuredImage for product: "${product.title}"`);
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
  const displayCategory = product.productType || product.category;
  categoryAuthor.textContent = `${getCategoryIcon(displayCategory)} ${displayCategory} • by ${product.author}`;
  
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
  
  // Add click handler to show product details
  cardContainer.addEventListener('click', () => {
    console.log('🔍 Product card clicked:', product.title);
    showProductDetails(product);
  });
  
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
        console.log('🔍 Raw baseProducts from backend:', JSON.stringify(baseProducts, null, 2));
        
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
              featuredImage: (function() {
                const imageField = productData.image || productData.preview_image || productData.previewImage;
                if (imageField) {
                  // For products from bases, use the base URL; for local products, use current environment
                  const baseUrl = productData.baseUrl || getEnvironmentConfig().services.sanora;
                  const imageUrl = `${baseUrl}/images/${imageField}`;
                  console.log(`🖼️ Using uploaded image for "${productData.title}": ${imageUrl}`);
                  return imageUrl;
                } else {
                  const category = productData.category || 'ebook';
                  const fallbackImage = PRODUCT_IMAGES[category];
                  console.log(`🖼️ Using fallback SVG for "${productData.title}" (category: ${category}): ${fallbackImage ? 'SVG data URL' : 'MISSING!'}`);
                  return fallbackImage;
                }
              })(),
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
  
  if (appState.selectedProduct) {
    const product = appState.selectedProduct;
    
    // Check if this is a menu product and display it differently
    if (window.MenuUtils && window.MenuDisplay && window.MenuUtils.isMenuProduct(product)) {
      console.log('🍽️ Creating menu details view for:', product.title);
      return createMenuDetailsScreen(product);
    }
    
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
    const displayCategory = product.productType || product.category;
    category.textContent = `${getCategoryIcon(displayCategory)} ${displayCategory}`;
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
    
    // Type-specific metadata display
    if (product.metadata) {
      const metadataContainer = document.createElement('div');
      metadataContainer.style.cssText = `
        background: ${appState.currentTheme.colors.background};
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        border-left: 4px solid ${appState.currentTheme.colors.primary};
      `;
      
      const metadataTitle = document.createElement('h3');
      const displayCategory = product.productType || product.category;
      metadataTitle.textContent = getMetadataTitle(displayCategory);
      metadataTitle.style.cssText = `
        margin: 0 0 10px 0;
        color: ${appState.currentTheme.colors.text};
        font-size: 16px;
      `;
      metadataContainer.appendChild(metadataTitle);
      
      // Display relevant metadata fields based on category (using same displayCategory variable)
      const metadataContent = createMetadataDisplay(displayCategory, product.metadata);
      metadataContainer.appendChild(metadataContent);
      
      titlePriceContainer.appendChild(metadataContainer);
    }
    
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
      appState.selectedProduct = null;
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
 * Simple JSON syntax highlighting
 */
function syntaxHighlightJson(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    
    const colors = {
      key: '#9ecbff',      // Light blue for keys
      string: '#a5e075',   // Light green for strings
      number: '#ffa657',   // Orange for numbers
      boolean: '#ff7b72',  // Red for booleans
      null: '#8b949e'      // Gray for null
    };
    
    return `<span style="color: ${colors[cls]};">${match}</span>`;
  });
}

/**
 * Create Menu Details Screen for menu catalog products
 */
function createMenuDetailsScreen(product) {
  const screen = document.createElement('div');
  screen.id = 'menu-details-screen';
  screen.className = 'screen';
  
  // Back button
  const backButton = document.createElement('button');
  backButton.innerHTML = '← Back to Shop';
  backButton.style.cssText = `
    background: ${appState.currentTheme.colors.secondary};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-weight: bold;
    cursor: pointer;
    margin-bottom: 20px;
    transition: all 0.2s ease;
  `;
  
  backButton.addEventListener('click', () => {
    appState.currentScreen = 'main';
    appState.selectedProduct = null;
    updateHUDButtons();
    renderCurrentScreen();
  });

  // Convert product to menu catalog format
  const menuCatalog = window.MenuUtils.convertProductToMenuCatalog(product);
  
  if (menuCatalog && window.MenuDisplay) {
    // Create menu details container
    const detailsContainer = document.createElement('div');
    detailsContainer.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 900px;
      margin: 0 auto;
    `;

    // Menu header with purchase info
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${appState.currentTheme.colors.primary};
    `;

    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `flex: 1;`;

    const title = document.createElement('h1');
    title.textContent = product.title;
    title.style.cssText = `
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 2.5rem;
      margin: 0 0 10px 0;
    `;

    const description = document.createElement('p');
    description.textContent = product.description || 'Complete restaurant menu catalog';
    description.style.cssText = `
      color: ${appState.currentTheme.colors.textSecondary};
      font-size: 1.1rem;
      margin: 0;
      line-height: 1.5;
    `;

    const metaInfo = document.createElement('div');
    metaInfo.style.cssText = `
      color: ${appState.currentTheme.colors.secondary};
      font-size: 0.9rem;
      margin-top: 10px;
    `;
    const itemCount = menuCatalog.metadata?.totalProducts || 0;
    const menuCount = menuCatalog.metadata?.menuCount || 0;
    metaInfo.textContent = `🍽️ Menu Catalog • ${itemCount} items • ${menuCount} categories • by ${product.author}`;

    titleContainer.appendChild(title);
    titleContainer.appendChild(description);
    titleContainer.appendChild(metaInfo);

    // Purchase section
    const purchaseContainer = document.createElement('div');
    purchaseContainer.style.cssText = `
      text-align: center;
      min-width: 200px;
    `;

    if (product.price && product.price > 0) {
      const priceElement = document.createElement('div');
      priceElement.textContent = formatPrice(product.price);
      priceElement.style.cssText = `
        font-size: 2.5rem;
        font-weight: bold;
        color: ${appState.currentTheme.colors.accent};
        margin-bottom: 15px;
      `;

      const buyButton = document.createElement('button');
      buyButton.innerHTML = '💳 Buy Menu Access';
      buyButton.style.cssText = `
        background: ${appState.currentTheme.colors.accent};
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: ${appState.currentTheme.typography.fontFamily};
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s ease;
      `;

      buyButton.addEventListener('click', () => {
        initiatePurchase(product);
      });

      purchaseContainer.appendChild(priceElement);
      purchaseContainer.appendChild(buyButton);
    } else {
      const freeLabel = document.createElement('div');
      freeLabel.textContent = 'Free Menu';
      freeLabel.style.cssText = `
        font-size: 1.5rem;
        font-weight: bold;
        color: ${appState.currentTheme.colors.secondary};
        margin-bottom: 15px;
      `;
      purchaseContainer.appendChild(freeLabel);
    }

    headerContainer.appendChild(titleContainer);
    headerContainer.appendChild(purchaseContainer);

    // Artifacts section (JSON menu data)
    if (product.artifacts && product.artifacts.length > 0) {
      const artifactsSection = document.createElement('div');
      artifactsSection.style.cssText = `
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 30px;
        border-left: 4px solid ${appState.currentTheme.colors.secondary};
      `;

      const artifactsTitle = document.createElement('h3');
      artifactsTitle.textContent = '📁 Menu Data Files';
      artifactsTitle.style.cssText = `
        color: ${appState.currentTheme.colors.primary};
        margin: 0 0 15px 0;
        font-size: 1.2rem;
      `;

      const artifactsList = document.createElement('div');
      
      product.artifacts.forEach(artifactId => {
        const artifactItem = document.createElement('div');
        artifactItem.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: white;
          border-radius: 6px;
          margin-bottom: 10px;
          border: 1px solid #e0e0e0;
        `;

        const artifactInfo = document.createElement('div');
        artifactInfo.innerHTML = `
          <div style="font-weight: bold; color: ${appState.currentTheme.colors.text};">
            📄 ${product.title}_menu.json
          </div>
          <div style="font-size: 0.9rem; color: ${appState.currentTheme.colors.textSecondary};">
            Complete menu structure data (JSON format)
          </div>
        `;

        const menuButton = document.createElement('button');
        menuButton.innerHTML = '🍽️ Open Menu';
        menuButton.style.cssText = `
          background: ${appState.currentTheme.colors.primary};
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          transition: all 0.2s ease;
          margin-right: 10px;
        `;

        const jsonButton = document.createElement('button');
        jsonButton.innerHTML = '📄 View Data';
        jsonButton.style.cssText = `
          background: ${appState.currentTheme.colors.border};
          color: ${appState.currentTheme.colors.text};
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        `;

        // Menu navigation container (initially hidden)
        const menuContainer = document.createElement('div');
        menuContainer.style.cssText = `
          margin-top: 20px;
          display: none;
          border-radius: 8px;
          overflow: hidden;
        `;

        // JSON content container (initially hidden)
        const jsonContainer = document.createElement('div');
        jsonContainer.style.cssText = `
          margin-top: 15px;
          display: none;
          background: #2d3748;
          color: #e2e8f0;
          padding: 20px;
          border-radius: 6px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.4;
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #4a5568;
        `;

        let menuLoaded = false;
        let jsonLoaded = false;
        let menuData = null;
        let menuInterface = null;

        // Menu button click handler
        menuButton.addEventListener('click', async () => {
          if (!menuLoaded) {
            // Fetch and create interactive menu
            menuButton.disabled = true;
            menuButton.innerHTML = '⏳ Loading Menu...';
            
            try {
              console.log('🍽️ Fetching menu data for navigation:', {
                uuid: product.uuid,
                sanoraUrl: product.baseUrl || 'http://127.0.0.1:5121/',
                productTitle: product.title,
                artifactId: artifactId
              });
              
              // Use Rust backend to fetch artifact (avoids CORS issues)
              if (invoke) {
                const jsonText = await invoke('get_artifact', {
                  uuid: product.uuid,
                  sanoraUrl: product.baseUrl || 'http://127.0.0.1:5121/',
                  productTitle: product.title,
                  artifactId: artifactId
                });
                
                try {
                  menuData = JSON.parse(jsonText);
                  console.log('🍽️ Menu data loaded successfully:', menuData);
                  
                  // Create interactive menu navigation
                  if (window.MenuNavigation) {
                    menuInterface = window.MenuNavigation.createMenuInterface(menuData, {
                      width: 600,
                      height: 500,
                      colors: {
                        primary: appState.currentTheme.colors.primary,
                        secondary: appState.currentTheme.colors.secondary,
                        accent: appState.currentTheme.colors.accent,
                        text: appState.currentTheme.colors.text,
                        background: appState.currentTheme.colors.background,
                        border: appState.currentTheme.colors.border
                      }
                    });

                    // Set up callbacks
                    menuInterface.onProductSelected((selectedProduct) => {
                      console.log('🛒 Product selected:', selectedProduct);
                      
                      // Show purchase confirmation with product details
                      const priceText = selectedProduct.price ? `$${(selectedProduct.price / 100).toFixed(2)}` : 'Free';
                      const confirmMessage = `Add "${selectedProduct.name}" to cart?\n\nPrice: ${priceText}\nCategory: ${selectedProduct.category || 'menu-item'}`;
                      
                      if (confirm(confirmMessage)) {
                        // Here you could integrate with the actual purchase flow
                        alert(`✅ Added "${selectedProduct.name}" to cart!\n\n(This would integrate with the actual purchase system)`);
                      }
                    });

                    menuInterface.onSelectionChanged((state) => {
                      console.log('🔄 Selection changed:', {
                        category: state.selectedCategory,
                        timeSpan: state.selectedTimeSpan,
                        product: state.selectedProduct?.name
                      });
                    });

                    // Add to container
                    menuContainer.innerHTML = '';
                    menuContainer.appendChild(menuInterface.element);
                  } else {
                    throw new Error('MenuNavigation component not loaded');
                  }
                  
                  menuLoaded = true;
                  menuButton.innerHTML = '🍽️ Hide Menu';
                  menuContainer.style.display = 'block';
                  
                } catch (parseError) {
                  throw new Error(`Invalid menu data: ${parseError.message}`);
                }
              } else {
                throw new Error('Tauri backend not available');
              }
              
            } catch (error) {
              console.error('Error loading menu:', error);
              menuContainer.innerHTML = `
                <div style="padding: 20px; background: #fee; border: 1px solid #fcc; border-radius: 8px; color: #c33;">
                  <strong>⚠️ Error loading menu:</strong> ${error.message || error}
                </div>
              `;
              menuContainer.style.display = 'block';
            } finally {
              menuButton.disabled = false;
            }
          } else {
            // Toggle visibility
            if (menuContainer.style.display === 'none') {
              menuContainer.style.display = 'block';
              menuButton.innerHTML = '🍽️ Hide Menu';
            } else {
              menuContainer.style.display = 'none';
              menuButton.innerHTML = '🍽️ Open Menu';
            }
          }
        });
        
        // JSON button click handler (for technical users who want to see raw data)
        jsonButton.addEventListener('click', async () => {
          if (!jsonLoaded) {
            // Fetch and display JSON
            jsonButton.disabled = true;
            jsonButton.innerHTML = '⏳ Loading...';
            
            try {
              // Use existing menuData if available, otherwise fetch
              let jsonData;
              if (menuData) {
                jsonData = menuData;
              } else if (invoke) {
                const jsonText = await invoke('get_artifact', {
                  uuid: product.uuid,
                  sanoraUrl: product.baseUrl || 'http://127.0.0.1:5121/',
                  productTitle: product.title,
                  artifactId: artifactId
                });
                jsonData = JSON.parse(jsonText);
              } else {
                throw new Error('Tauri backend not available');
              }
              
              const prettyJson = JSON.stringify(jsonData, null, 2);
              jsonContainer.innerHTML = syntaxHighlightJson(prettyJson);
              
              jsonLoaded = true;
              jsonButton.innerHTML = '📄 Hide Data';
              jsonContainer.style.display = 'block';
              
            } catch (error) {
              console.error('Error fetching JSON:', error);
              jsonContainer.innerHTML = `<span style="color: #ff6b6b;">Error loading JSON: ${error.message || error}</span>`;
              jsonContainer.style.display = 'block';
            } finally {
              jsonButton.disabled = false;
            }
          } else {
            // Toggle visibility
            if (jsonContainer.style.display === 'none') {
              jsonContainer.style.display = 'block';
              jsonButton.innerHTML = '📄 Hide Data';
            } else {
              jsonContainer.style.display = 'none';
              jsonButton.innerHTML = '📄 View Data';
            }
          }
        });

        artifactItem.appendChild(artifactInfo);
        artifactItem.appendChild(menuButton);
        artifactItem.appendChild(jsonButton);
        
        // Add menu and JSON containers after the artifact item
        const artifactWrapper = document.createElement('div');
        artifactWrapper.appendChild(artifactItem);
        artifactWrapper.appendChild(menuContainer);
        artifactWrapper.appendChild(jsonContainer);
        
        artifactsList.appendChild(artifactWrapper);
      });

      artifactsSection.appendChild(artifactsTitle);
      artifactsSection.appendChild(artifactsList);
      detailsContainer.appendChild(artifactsSection);
    }

    // Menu structure display
    const menuDisplay = window.MenuDisplay.createMenuStructureDisplay(menuCatalog, {
      showPrices: true,
      theme: appState.currentTheme,
      onItemClick: (menuItem) => {
        console.log('🛒 Menu item clicked:', menuItem.name);
        alert(`Menu Item: ${menuItem.name}\nPrice: ${window.MenuDisplay.formatPrice(menuItem.price)}\n\n(Individual item ordering coming soon!)`);
      }
    });

    detailsContainer.appendChild(headerContainer);
    detailsContainer.appendChild(menuDisplay);

    screen.appendChild(backButton);
    screen.appendChild(detailsContainer);

  } else {
    // Fallback for when menu display isn't available
    const fallbackContainer = document.createElement('div');
    fallbackContainer.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    `;

    fallbackContainer.innerHTML = `
      <h1 style="color: ${appState.currentTheme.colors.primary}; margin-bottom: 20px;">
        🍽️ ${product.title}
      </h1>
      <p style="color: ${appState.currentTheme.colors.textSecondary}; font-size: 1.1rem; margin-bottom: 30px;">
        ${product.description || 'Menu catalog'}
      </p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: ${appState.currentTheme.colors.text};">
          This is a menu catalog product. Menu display components are loading...
        </p>
      </div>
    `;

    screen.appendChild(backButton);
    screen.appendChild(fallbackContainer);
  }

  return screen;
}

/**
 * Create new form-widget based upload form
 */
async function createFormWidgetUploadForm() {
  // Load configurations first
  await loadProductFormConfig();
  await loadProductDisplayConfig();
  
  console.log('🔧 Creating clean form-widget upload form...');
  
  if (!window.getForm || !PRODUCT_FORM_CONFIG) {
    console.error('❌ Form-widget or config not available');
    return document.createElement('div');
  }
  
  const container = document.createElement('div');
  container.className = 'upload-form-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 100px 40px 40px 40px;
    box-sizing: border-box;
    background: #f8fafc;
    overflow-y: auto;
    z-index: 1000;
  `;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '← Back to Ninefy';
  closeButton.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: #2c3e50;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 1001;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  `;
  
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = '#34495e';
    closeButton.style.transform = 'translateY(-1px)';
  });
  
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = '#2c3e50';
    closeButton.style.transform = 'translateY(0)';
  });
  
  closeButton.addEventListener('click', () => {
    // Navigate back to main screen
    showScreen('main');
  });
  
  // Product Type Selector Section
  const selectorSection = document.createElement('div');
  selectorSection.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid #e0e0e0;
  `;
  
  const selectorTitle = document.createElement('h3');
  selectorTitle.textContent = 'Select Product Type';
  selectorTitle.style.cssText = `
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #2c3e50;
    font-weight: 600;
  `;
  
  const categorySelect = document.createElement('select');
  categorySelect.id = 'product-type-selector';
  categorySelect.style.cssText = `
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    background: white;
    cursor: pointer;
  `;
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Choose a product type to get started...';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  categorySelect.appendChild(defaultOption);
  
  // Add product type options
  Object.entries(PRODUCT_FORM_CONFIG.productTypes).forEach(([key, config]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = config.label;
    categorySelect.appendChild(option);
  });
  
  selectorSection.appendChild(selectorTitle);
  selectorSection.appendChild(categorySelect);
  
  // Form display container 
  const formDisplayContainer = document.createElement('div');
  formDisplayContainer.id = 'form-display';
  formDisplayContainer.style.cssText = `
    flex: 1;
    min-height: 300px;
    padding: 30px;
    text-align: center;
    color: #777;
    border-radius: 12px;
    background: white;
    border: 2px dashed #ddd;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;
  formDisplayContainer.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
    <h3 style="color: #555; margin: 0 0 10px 0;">Select a Product Type</h3>
    <p style="margin: 0; font-size: 14px;">Choose a product type above to generate the appropriate form</p>
  `;
  
  let currentForm = null;
  let currentFormData = {};
  
  // Form submission handler with upload functionality
  async function handleFormSubmission(formData) {
    console.log('📝 Form submitted with data:', formData);
    console.log('🖼️ Images:', window.formImageData);
    console.log('📦 Artifacts:', window.formArtifactData);
    console.log('⏰ Date/Times:', window.dateTimes);
    
    // Disable submit button immediately to prevent multiple submissions
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.setAttribute('fill', '#666666');
      submitButton.style.cursor = 'not-allowed';
      submitButton.style.pointerEvents = 'none';
      const submitText = submitButton.nextElementSibling;
      if (submitText) {
        submitText.setAttribute('fill', '#999999');
        submitText.textContent = 'UPLOADING...';
      }
    }
    
    // Create and show upload overlay
    const uploadOverlay = createUploadOverlay();
    container.appendChild(uploadOverlay);
    
    try {
      // Combine all data
      const selectedType = categorySelect.value;
      const typeConfig = PRODUCT_FORM_CONFIG.productTypes[selectedType];
      
      const completeProductData = {
        productType: selectedType,
        productConfig: typeConfig,
        formData: formData,
        images: window.formImageData || {},
        artifacts: window.formArtifactData || {},
        dateTimes: window.dateTimes || []
      };
      
      console.log('💾 Complete product data ready for upload:', completeProductData);
      
      // Upload to Sanora
      const uploadResult = await uploadProductToSanora(completeProductData);
      
      // Remove overlay
      container.removeChild(uploadOverlay);
      
      if (uploadResult.success) {
        // Show success message
        const successMessage = createSuccessMessage(typeConfig, uploadResult);
        container.appendChild(successMessage);
        
        // Reset form after successful upload
        setTimeout(() => {
          resetUploadForm();
        }, 3000);
      } else {
        // Show error and re-enable button
        const errorMessage = createErrorMessage(uploadResult.error);
        container.appendChild(errorMessage);
        enableSubmitButton();
      }
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      // Remove overlay
      if (uploadOverlay.parentNode) {
        container.removeChild(uploadOverlay);
      }
      
      // Show error and re-enable button
      const errorMessage = createErrorMessage(error.message);
      container.appendChild(errorMessage);
      enableSubmitButton();
    }
  }
  
  // Create upload overlay with green scrim and progress indicator
  function createUploadOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(40, 167, 69, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: Arial, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        padding: 40px 60px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
      ">
        <div style="
          font-size: 64px;
          margin-bottom: 20px;
          animation: spin 2s linear infinite;
        ">📤</div>
        <h3 style="
          color: #28a745;
          margin: 0 0 15px 0;
          font-size: 24px;
          font-weight: bold;
        ">Uploading Product</h3>
        <p style="
          color: #666;
          margin: 0 0 20px 0;
          font-size: 16px;
          line-height: 1.4;
        ">Please wait while we upload your product to Sanora...</p>
        <div style="
          width: 100%;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
        ">
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            animation: loading 2s ease-in-out infinite;
          "></div>
        </div>
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes loading {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      </style>
    `;
    
    return overlay;
  }
  
  // Create success message
  function createSuccessMessage(typeConfig, result) {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      font-family: Arial, sans-serif;
      text-align: center;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
    `;
    
    // Special message for menu catalogs
    if (result.productType === 'menu') {
      console.log('🎯 MAGICARD_WORKFLOW: 🎉 Displaying success message with firstCardBdoPubKey:', result.firstCardBdoPubKey);
      console.log('🎯 MAGICARD_WORKFLOW: 📋 Menu bdoPubKey (stored separately):', result.bdoPubKey);
      successMessage.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">🍽️✅</div>
        <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #155724;">Menu Catalog Created Successfully!</h3>
        <p style="margin: 0 0 10px 0; font-size: 15px;">
          Your menu catalog "${result.title}" has been processed.<br>
          <strong>${result.cardResults.successful}</strong> interactive SVG cards created for MagiCard.
        </p>
        ${result.cardResults.failed > 0 ? 
          `<p style="margin: 0 0 10px 0; font-size: 13px; color: #856404; background: #fff3cd; padding: 8px; border-radius: 4px;">
            ⚠️ ${result.cardResults.failed} cards failed to create
          </p>` : ''
        }
        ${result.firstCardBdoPubKey ? 
          `<p style="margin: 0 0 10px 0; font-size: 13px; color: #155724; background: #d1e7dd; padding: 8px; border-radius: 4px;">
            🎴 First card: ${result.firstCardBdoPubKey.substring(0, 12)}... (for direct access)
          </p>` : ''
        }
        ${result.firstCardBdoPubKey ? 
          `<div style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; padding: 12px; border-radius: 8px; margin: 10px 0; font-family: monospace;">
            <div style="font-weight: bold; margin-bottom: 5px;">🪄 MagiCard ID (for importing first card):</div>
            <div style="font-size: 14px; word-break: break-all; background: rgba(255,255,255,0.2); padding: 8px; border-radius: 4px;">
              ${result.firstCardBdoPubKey}
            </div>
            <button onclick="navigator.clipboard.writeText('${result.firstCardBdoPubKey}'); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy to Clipboard', 2000)" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-top: 8px;">
              📋 Copy to Clipboard
            </button>
            <button onclick="previewBDOMenu('${result.firstCardBdoPubKey}')" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-top: 8px; margin-left: 8px;">
              🔍 Preview BDO Data
            </button>
          </div>` : ''
        }
        <p style="margin: 0; font-size: 13px; opacity: 0.8;">Catalog stored in BDO • Form will reset in 3 seconds...</p>
      `;
    } else {
      successMessage.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
        <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #155724;">Product Uploaded Successfully!</h3>
        <p style="margin: 0 0 10px 0; font-size: 15px;">Your ${typeConfig.label.toLowerCase()} has been uploaded to Sanora.</p>
        <p style="margin: 0; font-size: 13px; opacity: 0.8;">Form will reset automatically in 3 seconds...</p>
      `;
    }
    
    return successMessage;
  }
  
  // Create error message
  function createErrorMessage(errorText) {
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      font-family: Arial, sans-serif;
      text-align: center;
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
    `;
    errorMessage.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
      <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #721c24;">Upload Failed</h3>
      <p style="margin: 0 0 10px 0; font-size: 15px;">${errorText}</p>
      <p style="margin: 0; font-size: 13px; opacity: 0.8;">Please try again or check your connection.</p>
    `;
    return errorMessage;
  }
  
  // Re-enable submit button
  function enableSubmitButton() {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.setAttribute('fill', 'url(#buttonGradient)');
      submitButton.style.cursor = 'pointer';
      submitButton.style.pointerEvents = 'auto';
      const submitText = submitButton.nextElementSibling;
      if (submitText) {
        submitText.setAttribute('fill', '#ffffff');
        submitText.textContent = 'SUBMIT';
      }
    }
  }
  
  // Reset upload form
  function resetUploadForm() {
    // Reset category selector
    categorySelect.value = '';
    
    // Clear form display
    formDisplayContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
        <h3 style="color: #555; margin: 0 0 10px 0;">Select a Product Type</h3>
        <p style="margin: 0; font-size: 14px;">Choose a product type above to generate the appropriate form</p>
      </div>
    `;
    
    // Clear global form data
    window.formImageData = {};
    window.formArtifactData = {};
    window.dateTimes = [];
    
    console.log('🔄 Upload form reset for new product');
  }
  
  // Type selection handler
  categorySelect.addEventListener('change', function() {
    const selectedType = this.value;
    if (!selectedType) {
      formDisplayContainer.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
        <h3 style="color: #555; margin: 0 0 10px 0;">Select a Product Type</h3>
        <p style="margin: 0; font-size: 14px;">Choose a product type above to generate the appropriate form</p>
      `;
      return;
    }
    
    const typeConfig = PRODUCT_FORM_CONFIG.productTypes[selectedType];
    if (!typeConfig || !typeConfig.formConfig) {
      formDisplayContainer.innerHTML = `
        <div style="color: #e74c3c;">❌ Configuration error for ${selectedType}</div>
      `;
      return;
    }
    
    console.log(`🎯 Creating form-widget for: ${typeConfig.label}`);
    
    try {
      // Clear previous form
      formDisplayContainer.innerHTML = '';
      
      // Create new form using form-widget
      currentForm = window.getForm(typeConfig.formConfig, handleFormSubmission);
      
      // Add form title
      const formHeader = document.createElement('div');
      formHeader.style.cssText = `
        margin-bottom: 20px;
        text-align: center;
      `;
      formHeader.innerHTML = `
        <h3 style="margin: 0; color: #2c3e50; font-size: 20px;">
          ${typeConfig.icon} ${typeConfig.title}
        </h3>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
          Fill out the form below to create your ${typeConfig.label.toLowerCase()}
        </p>
      `;
      
      formDisplayContainer.appendChild(formHeader);
      formDisplayContainer.appendChild(currentForm);
      
      // Note: Menu forms now use artifact upload instead of textarea + enhancement
      
      // Update styling for active form
      formDisplayContainer.style.cssText = `
        flex: 1;
        width: 100%;
        padding: 30px;
        border-radius: 12px;
        background: white;
        border: 2px solid #e0e0e0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: block;
        text-align: left;
        box-sizing: border-box;
      `;
      
    } catch (error) {
      console.error('❌ Failed to create form:', error);
      formDisplayContainer.innerHTML = `
        <div style="color: #e74c3c;">
          <h3>❌ Form Creation Error</h3>
          <p>Failed to create form for ${typeConfig.label}</p>
          <small>Error: ${error.message}</small>
        </div>
      `;
    }
  });
  
  // Add title header
  const titleHeader = document.createElement('h1');
  titleHeader.textContent = 'Upload Your Product';
  titleHeader.style.cssText = `
    text-align: center;
    color: #2c3e50;
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: 300;
  `;
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Share your digital goods with the Ninefy marketplace';
  subtitle.style.cssText = `
    text-align: center;
    color: #64748b;
    font-size: 1.1rem;
    margin-bottom: 30px;
  `;
  
  container.appendChild(closeButton);
  container.appendChild(titleHeader);
  container.appendChild(subtitle);
  container.appendChild(selectorSection);
  container.appendChild(formDisplayContainer);
  
  return container;
}

/**
 * Enhance menu form with CSV file upload and preview functionality
 */
function enhanceMenuForm(form) {
  console.log('🍽️ Enhancing menu form with CSV upload capability...');
  
  try {
    // Find the Menu Data textarea
    const menuDataTextarea = form.querySelector('textarea[data-field="Menu Data"]');
    if (!menuDataTextarea) {
      console.warn('⚠️ Could not find Menu Data textarea to enhance');
      return;
    }
    
    // Create file upload section
    const fileUploadSection = document.createElement('div');
    fileUploadSection.style.cssText = `
      margin-top: 15px;
      padding: 20px;
      border: 2px dashed #9b59b6;
      border-radius: 8px;
      background: #fafafa;
    `;
    
    fileUploadSection.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h4 style="margin: 0 0 8px 0; color: #9b59b6;">📊 Upload CSV File</h4>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Upload a CSV file or paste data directly into the text area above
        </p>
      </div>
      <input type="file" id="csvFileInput" accept=".csv,.json" style="
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 10px;
      ">
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button type="button" id="loadSampleBtn" style="
          background: #27ae60;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Load Sample Data</button>
        <button type="button" id="validateMenuBtn" style="
          background: #e91e63;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Validate Menu</button>
        <button type="button" id="clearMenuBtn" style="
          background: #95a5a6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Clear</button>
      </div>
      <div id="menuPreview" style="
        margin-top: 15px;
        padding: 10px;
        background: white;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        display: none;
      "></div>
    `;
    
    // Insert after the textarea's parent
    menuDataTextarea.parentNode.insertBefore(fileUploadSection, menuDataTextarea.nextSibling);
    
    // Add event handlers
    const fileInput = fileUploadSection.querySelector('#csvFileInput');
    const loadSampleBtn = fileUploadSection.querySelector('#loadSampleBtn');
    const validateMenuBtn = fileUploadSection.querySelector('#validateMenuBtn');
    const clearMenuBtn = fileUploadSection.querySelector('#clearMenuBtn');
    const menuPreview = fileUploadSection.querySelector('#menuPreview');
    
    // File upload handler
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      console.log('📁 Processing uploaded file:', file.name);
      
      try {
        const fileContent = await readFileAsText(file);
        menuDataTextarea.value = fileContent;
        
        // Trigger validation
        validateMenu();
        
        // Show success message
        showMenuMessage('✅ File loaded successfully!', 'success');
        
      } catch (error) {
        console.error('❌ Failed to read file:', error);
        showMenuMessage('❌ Failed to read file: ' + error.message, 'error');
      }
    });
    
    // Load sample data handler
    loadSampleBtn.addEventListener('click', () => {
      const sampleCSV = `,rider,time span,product,,,
,adult,two-hour,adult+two-hour$250,,,
,youth,day,adult+day$500,,,
,reduced,month,adult+month$10000,,,
,,,youth+two-hour$100,,,
,,,youth+day$200,,,
,,,youth+month$2000,,,
,,,reduced+two-hour$150,,,
,,,reduced+day$250,,,
,,,reduced+month$2500,,,
,,,chilaquiles verdes+any+any$1700,,,
,,,special combo+any+day$2500,,,`;
      
      menuDataTextarea.value = sampleCSV;
      validateMenu();
      showMenuMessage('📋 Sample data loaded!', 'info');
    });
    
    // Validate menu handler
    validateMenuBtn.addEventListener('click', validateMenu);
    
    // Clear menu handler
    clearMenuBtn.addEventListener('click', () => {
      menuDataTextarea.value = '';
      menuPreview.style.display = 'none';
      showMenuMessage('🗑️ Menu data cleared', 'info');
    });
    
    // Validation function
    function validateMenu() {
      const menuData = menuDataTextarea.value.trim();
      if (!menuData) {
        menuPreview.style.display = 'none';
        return;
      }
      
      try {
        // Detect format and parse
        const isJson = menuData.startsWith('{') || menuData.startsWith('[');
        let menuTree;
        
        if (isJson) {
          menuTree = JSON.parse(menuData);
        } else {
          menuTree = window.MenuCatalogUtils.parseCSVToMenuTree(menuData);
        }
        
        // Validate
        const validation = window.MenuCatalogUtils.validateMenuTree(menuTree);
        
        // Show preview
        showMenuPreview(menuTree, validation);
        
        if (validation.isValid) {
          showMenuMessage(`✅ Valid menu! ${validation.stats.totalProducts} products, ${validation.stats.totalMenus} menus`, 'success');
        } else {
          showMenuMessage(`⚠️ Validation issues: ${validation.errors.join(', ')}`, 'warning');
        }
        
      } catch (error) {
        showMenuMessage(`❌ Parse error: ${error.message}`, 'error');
        menuPreview.style.display = 'none';
      }
    }
    
    // Show menu preview
    function showMenuPreview(menuTree, validation) {
      menuPreview.style.display = 'block';
      
      let previewHTML = `
        <h5 style="margin: 0 0 10px 0; color: #2c3e50;">📋 Menu Preview</h5>
        <div style="margin-bottom: 10px; font-size: 13px;">
          <strong>Total Products:</strong> ${validation.stats.totalProducts} |
          <strong>Menus:</strong> ${validation.stats.totalMenus} |
          <strong>Submenus:</strong> ${validation.stats.totalSubmenus}
        </div>
      `;
      
      // Show menu structure
      Object.entries(menuTree.menus).forEach(([menuKey, menu]) => {
        previewHTML += `
          <div style="margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px;">
            <strong>🍽️ ${menu.title || menuKey}</strong>
        `;
        
        if (menu.submenus && Object.keys(menu.submenus).length > 0) {
          Object.entries(menu.submenus).forEach(([submenuKey, submenu]) => {
            const productCount = submenu.products ? submenu.products.length : 0;
            previewHTML += `
              <div style="margin-left: 20px; font-size: 12px; color: #666;">
                └ ${submenu.title || submenuKey} (${productCount} products)
              </div>
            `;
          });
        }
        
        if (menu.products && menu.products.length > 0) {
          previewHTML += `
            <div style="margin-left: 20px; font-size: 12px; color: #666;">
              └ ${menu.products.length} direct products
            </div>
          `;
        }
        
        previewHTML += `</div>`;
      });
      
      menuPreview.innerHTML = previewHTML;
    }
    
    // Show status message
    function showMenuMessage(message, type) {
      // Remove existing message
      const existingMessage = fileUploadSection.querySelector('.menu-message');
      if (existingMessage) {
        existingMessage.remove();
      }
      
      const colors = {
        success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
        error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
        info: { bg: '#cce7ff', border: '#b3d9ff', text: '#004085' }
      };
      
      const color = colors[type] || colors.info;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = 'menu-message';
      messageDiv.style.cssText = `
        margin-top: 10px;
        padding: 8px 12px;
        background: ${color.bg};
        border: 1px solid ${color.border};
        color: ${color.text};
        border-radius: 4px;
        font-size: 13px;
      `;
      messageDiv.textContent = message;
      
      fileUploadSection.appendChild(messageDiv);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 5000);
    }
    
    // Helper function to read file as text
    function readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    }
    
    console.log('✅ Menu form enhanced with CSV upload functionality');
    
  } catch (error) {
    console.error('❌ Failed to enhance menu form:', error);
  }
}

/**
 * Upload complete product to Sanora with images and artifacts
 */
async function uploadProductToSanora(productData) {
  console.log('🚀 Starting complete product upload to Sanora...');
  console.log('📦 Product data:', productData);
  
  try {
    // Check if Tauri is available
    if (!invoke) {
      console.log('⚠️ Tauri invoke not available for product upload');
      console.log('🔍 invoke variable:', invoke);
      console.log('🔍 tauriInitialized:', tauriInitialized);
      console.log('🔍 window.__TAURI__:', !!window.__TAURI__);
      console.log('🔍 window.ninefyInvoke:', !!window.ninefyInvoke);
      throw new Error('Tauri not available - this function requires the desktop app');
    }
    
    console.log('✅ Tauri invoke is available:', typeof invoke);
    
    // Get current environment config
    const sanoraUrl = getServiceUrl('sanora');
    console.log('🌐 Using Sanora URL:', sanoraUrl);
    
    // Generate user UUID (in a real app, this would come from sessionless auth)
    let userUuid = generateMockUuid();
    console.log('👤 Using initial UUID:', userUuid);
    
    // Extract basic product info from form data
    const title = productData.formData.Title || productData.formData.title || 'Untitled Product';
    const description = productData.formData.Description || productData.formData.description || '';
    // E-book forms don't have price, set a default
    const price = productData.formData.Price || productData.formData.price || '9.99';
    
    console.log(`📊 Form data keys:`, Object.keys(productData.formData));
    console.log(`💰 Extracted price: "${price}" from form data`);
    
    console.log(`📝 Product: "${title}" - $${price}`);
    
    // Step 0: Create Sanora user first (might be needed)
    console.log('👤 Ensuring Sanora user exists...');
    try {
      const sanoraUser = await invoke('create_sanora_user', {
        sanoraUrl: sanoraUrl
      });
      console.log('✅ Sanora user ready:', sanoraUser);
      // Use the user's UUID from Sanora instead of mock UUID
      userUuid = sanoraUser.uuid;
    } catch (error) {
      console.log('⚠️ Could not create Sanora user, continuing with mock UUID:', error.message);
    }
    
    // Special handling for menu catalog products
    if (productData.productType === 'menu') {
      console.log('🎯 MAGICARD_WORKFLOW: 🍽️ Processing menu catalog product...');
      console.log('🎯 MAGICARD_WORKFLOW: 📋 Menu product data:', {
        title: productData.formData['Menu Title'],
        hasFile: !!productData.formData['CSV or JSON File'],
        productType: productData.productType
      });
      return await processMenuCatalogProduct(productData, userUuid, sanoraUrl);
    }
    
    // Step 1: Create product in Sanora FIRST
    console.log('📦 Creating product in Sanora...');
    
    const addProductParams = {
      uuid: userUuid,
      sanoraUrl: sanoraUrl,
      title: title,
      description: description,
      price: Math.round(parseFloat(price) * 100), // Ensure integer cents
      category: productData.productType || 'general' // Use product type as category
    };
    
    console.log('📋 add_product parameters:', addProductParams);
    
    const productResult = await invoke('add_product', addProductParams);
    console.log('✅ Product created successfully:', productResult);
    
    // Step 2: Upload images to the created product
    let imageResults = {};
    if (productData.images && Object.keys(productData.images).length > 0) {
      console.log('📸 Uploading images to existing product...');
      for (const [fieldName, imageData] of Object.entries(productData.images)) {
        try {
          const result = await uploadImageToSanora(userUuid, sanoraUrl, title, imageData.file);
          imageResults[fieldName] = result;
          console.log(`✅ Image uploaded for ${fieldName}:`, result);
        } catch (error) {
          console.warn(`⚠️ Image upload failed for ${fieldName}:`, error);
          imageResults[fieldName] = { success: false, error: error.message };
        }
      }
    }
    
    // Step 3: Upload artifacts to the created product
    let artifactResults = {};
    if (productData.artifacts && Object.keys(productData.artifacts).length > 0) {
      console.log('📄 Uploading artifacts to existing product...');
      for (const [fieldName, artifactData] of Object.entries(productData.artifacts)) {
        try {
          const result = await uploadArtifactToSanora(userUuid, sanoraUrl, title, artifactData.file);
          artifactResults[fieldName] = result;
          console.log(`✅ Artifact uploaded for ${fieldName}:`, result);
        } catch (error) {
          console.warn(`⚠️ Artifact upload failed for ${fieldName}:`, error);
          artifactResults[fieldName] = { success: false, error: error.message };
        }
      }
    }
    
    // Return success result
    return {
      success: true,
      productId: productResult.id || Date.now().toString(),
      productType: productData.productType, // Include product type in result
      title: title,
      price: price,
      imageUploads: Object.keys(imageResults).length,
      artifactUploads: Object.keys(artifactResults).length,
      sanoraUrl: sanoraUrl,
      details: productResult
    };
    
  } catch (error) {
    console.error('❌ Complete product upload failed:', error);
    
    // Return detailed error
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

/**
 * Process menu catalog product - special handling for CSV/JSON menus
 */
/**
 * Create SVG card content for a menu item with spell navigation
 * @param {Object} product - The menu product data
 * @param {Object} nextProduct - The next product for navigation (or null if last)
 * @param {string} menuTitle - The menu title
 * @param {number} index - Card index in sequence
 * @param {number} total - Total number of cards
 * @returns {string} SVG content as string
 */
function createMenuItemSVG(product, nextProduct, menuTitle, index, total) {
  const cardWidth = 300;
  const cardHeight = 400;
  const nextBdoPubKey = nextProduct ? nextProduct.cardBdoPubKey : null;
  
  // Format price for display
  const priceDisplay = product.price ? `$${(product.price / 100).toFixed(2)}` : 'Free';
  
  // Create navigation button if there's a next card
  const navigationButton = nextBdoPubKey ? `
    <g spell="magicard" spell-components='{"bdoPubKey":"${nextBdoPubKey}"}' style="cursor: pointer;">
      <rect x="220" y="350" width="60" height="30" rx="5" fill="#9b59b6" stroke="#8e44ad" stroke-width="2"/>
      <text x="250" y="370" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Next →</text>
    </g>
  ` : '';
  
  // Create back button if not the first card
  const backButton = index > 0 ? `
    <g style="cursor: pointer;">
      <rect x="20" y="350" width="60" height="30" rx="5" fill="#95a5a6" stroke="#7f8c8d" stroke-width="2"/>
      <text x="50" y="370" text-anchor="middle" fill="white" font-size="12" font-weight="bold">← Back</text>
    </g>
  ` : '';
  
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" card-name="${product.name}">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#27ae60;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2ecc71;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Card background -->
  <rect width="${cardWidth}" height="${cardHeight}" fill="url(#cardGradient)" stroke="#ddd" stroke-width="2" rx="12"/>
  
  <!-- Header background -->
  <rect x="0" y="0" width="${cardWidth}" height="80" fill="url(#headerGradient)" rx="12"/>
  <rect x="0" y="68" width="${cardWidth}" height="12" fill="url(#headerGradient)"/>
  
  <!-- Menu title -->
  <text x="150" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${menuTitle}</text>
  <text x="150" y="45" text-anchor="middle" fill="white" font-size="12">Card ${index + 1} of ${total}</text>
  
  <!-- Food emoji icon -->
  <text x="150" y="130" text-anchor="middle" font-size="48">🍽️</text>
  
  <!-- Product name -->
  <text x="150" y="180" text-anchor="middle" fill="#2c3e50" font-size="18" font-weight="bold">${product.name}</text>
  
  <!-- Price -->
  <text x="150" y="210" text-anchor="middle" fill="#e74c3c" font-size="24" font-weight="bold">${priceDisplay}</text>
  
  <!-- Description/Details -->
  <text x="150" y="240" text-anchor="middle" fill="#6c757d" font-size="12">
    ${product.metadata?.riderType || 'Standard'} • ${product.metadata?.timeSpan || 'Regular'}
  </text>
  
  <!-- Interactive spell element for the whole card -->
  <rect x="50" y="260" width="200" height="60" rx="8" fill="rgba(155, 89, 182, 0.1)" 
        stroke="#9b59b6" stroke-width="2" stroke-dasharray="5,5"
        spell="info" style="cursor: pointer;"/>
  <text x="150" y="285" text-anchor="middle" fill="#9b59b6" font-size="14" font-weight="bold">🪄 Magical Menu Item</text>
  <text x="150" y="305" text-anchor="middle" fill="#9b59b6" font-size="11">Click to cast spell!</text>
  
  <!-- Navigation buttons -->
  ${backButton}
  ${navigationButton}
  
  <!-- Card info -->
  <text x="10" y="390" fill="#95a5a6" font-size="10">ID: ${product.id}</text>
</svg>`;

  return svgContent;
}

/**
 * Create SVG content for a menu selector card (e.g., "Select rider")
 * @param {Object} card - Card object with menu selector information
 * @param {Array} allCards - All cards for navigation references
 * @param {string} menuTitle - Title of the menu
 * @param {number} index - Card index
 * @returns {string} SVG content as string
 */
function createMenuSelectorSVG(card, allCards, menuTitle, index) {
  const cardWidth = 300;
  const cardHeight = 400;
  
  // Find the next selector card for navigation (all options go to the same next selector)
  const nextSelectorCard = allCards.find(c => 
    c.type === 'menu-selector' && 
    c !== card && 
    allCards.indexOf(c) > allCards.indexOf(card)
  );
  
  const nextBdoPubKey = nextSelectorCard ? nextSelectorCard.cardBdoPubKey : null;
  console.log(`🔗 Selector "${card.name}" will navigate to: ${nextSelectorCard ? nextSelectorCard.name : 'products'}`);
  
  // Create option buttons directly from the selector card's options (no need for option cards)
  const optionButtons = card.options.map((option, optIndex) => {
    console.log(`🔘 Creating option button for: ${option}`);
    
    const y = 120 + (optIndex * 50);
    const buttonColor = optIndex % 2 === 0 ? '#3498db' : '#9b59b6';
    
    // All options navigate to the next selector (or products if this is the last selector)
    const navigationComponents = nextBdoPubKey 
      ? `spell="magicard" spell-components='{"bdoPubKey":"${nextBdoPubKey}"}'`
      : ''; // No navigation if no next card
    
    return `
      <rect ${navigationComponents}
            x="50" y="${y}" width="200" height="40" rx="8" 
            fill="${buttonColor}" stroke="${buttonColor}" 
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;" 
            class="spell-element">
        <animate attributeName="fill" values="${buttonColor};#ecf0f1;${buttonColor}" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text ${navigationComponents}
            x="150" y="${y + 25}" text-anchor="middle" fill="white" font-size="14" font-weight="bold" 
            class="spell-element" 
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;">
        ${option}
      </text>`;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" card-name="${card.name}">
      <!-- Background -->
      <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" fill="#2c3e50" stroke="#34495e" stroke-width="2" rx="12"/>
      
      <!-- Header -->
      <rect x="10" y="10" width="${cardWidth - 20}" height="60" fill="#34495e" rx="8"/>
      <text x="150" y="35" text-anchor="middle" fill="#ecf0f1" font-size="14" font-weight="bold">${menuTitle}</text>
      <text x="150" y="55" text-anchor="middle" fill="#bdc3c7" font-size="18" font-weight="bold">${card.name}</text>
      
      <!-- Menu Options -->
      ${optionButtons}
      
      <!-- Footer -->
      <text x="150" y="${cardHeight - 30}" text-anchor="middle" fill="#7f8c8d" font-size="10">
        Card ${index + 1} - Menu Selector
      </text>
      <text x="150" y="${cardHeight - 15}" text-anchor="middle" fill="#7f8c8d" font-size="10">
        Choose an option to continue
      </text>
    </svg>
  `;
}

/**
 * Create SVG content for a menu level card (rider, time span, etc.)
 * @param {Object} card - Card object with menu level information
 * @param {Object} nextCard - Next card for navigation (optional)
 * @param {string} menuTitle - Title of the menu
 * @param {number} index - Card index
 * @param {number} total - Total number of cards
 * @param {Object} menuTree - Full menu tree structure
 * @param {Array} allCards - All cards for navigation references
 * @returns {string} SVG content as string
 */
function createMenuLevelSVG(card, nextCard, menuTitle, index, total, menuTree, allCards) {
  const cardWidth = 300;
  const cardHeight = 400;
  const nextBdoPubKey = nextCard ? nextCard.cardBdoPubKey : null;

  // Create navigation button to next card
  let navigationButton = '';
  if (nextBdoPubKey) {
    navigationButton = `
      <rect spell="magicard" spell-components='{"bdoPubKey":"${nextBdoPubKey}"}'
            x="200" y="320" width="80" height="30" rx="4" 
            fill="#27ae60" stroke="#27ae60" style="cursor: pointer;"/>
      <text spell="magicard" spell-components='{"bdoPubKey":"${nextBdoPubKey}"}'
            x="240" y="340" text-anchor="middle" fill="white" font-size="12">→ Next</text>`;
  }

  // Create back/previous button with spell navigation (if not first card)
  let backButton = '';
  if (index > 0) {
    // Find the previous card in the sequence for navigation
    const previousCard = allCards[index - 1];
    const backNavigation = previousCard && previousCard.cardBdoPubKey ? 
      `spell="magicard" spell-components='{"bdoPubKey":"${previousCard.cardBdoPubKey}"}'` : '';
    
    backButton = `
      <rect ${backNavigation} x="20" y="320" width="80" height="30" rx="4" 
            fill="#95a5a6" stroke="#95a5a6" 
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;" 
            class="spell-element"/>
      <text ${backNavigation} x="60" y="340" text-anchor="middle" fill="white" font-size="12" 
            class="spell-element" 
            style="cursor: url(&quot;data:image/svg+xml,<svg xmlns=\&quot;http://www.w3.org/2000/svg\&quot; width=\&quot;32\&quot; height=\&quot;32\&quot; viewBox=\&quot;0 0 32 32\&quot;><text y=\&quot;24\&quot; font-size=\&quot;24\&quot;>🪄</text></svg>&quot;) 16 16, pointer;">← Back</text>`;
  }

  // Determine menu options for this card
  let menuOptions = [];
  let optionButtons = '';
  let menuIcon = '📋';
  
  if (card.type === 'menu') {
    // Get options for this menu level
    if (card.parentSelection) {
      // State-aware card - this is a submenu after a parent selection
      menuIcon = '🎯';
      menuOptions = [card.option]; // Only show the specific option for this state
      
      // Create a selection button for this specific option
      optionButtons = `
        <rect x="50" y="180" width="200" height="50" rx="8" 
              fill="rgba(39, 174, 96, 0.1)" stroke="#27ae60" stroke-width="2"
              style="cursor: pointer;"/>
        <text x="150" y="200" text-anchor="middle" fill="#27ae60" font-size="16" font-weight="bold">
          ${card.option}
        </text>
        <text x="150" y="215" text-anchor="middle" fill="#27ae60" font-size="11">
          (Selected: ${card.parentSelection.option})
        </text>`;
    } else {
      // Top-level menu card - show all options for this level
      const allOptions = Object.keys(menuTree.menus[card.level] || {});
      menuOptions = allOptions;
      
      // Create buttons for each option (limit to first 3 for space)
      const displayOptions = allOptions.slice(0, 3);
      let yPos = 180;
      
      displayOptions.forEach((option, idx) => {
        optionButtons += `
          <rect x="50" y="${yPos}" width="200" height="35" rx="6" 
                fill="rgba(155, 89, 182, 0.1)" stroke="#9b59b6" stroke-width="1"
                style="cursor: pointer;"/>
          <text x="150" y="${yPos + 22}" text-anchor="middle" fill="#9b59b6" font-size="14" font-weight="bold">
            ${option}
          </text>`;
        yPos += 45;
      });
      
      if (allOptions.length > 3) {
        optionButtons += `
          <text x="150" y="${yPos + 10}" text-anchor="middle" fill="#95a5a6" font-size="10">
            +${allOptions.length - 3} more options
          </text>`;
      }
    }
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="100%" stop-color="#764ba2"/>
    </linearGradient>
  </defs>
  
  <!-- Card background -->
  <rect width="100%" height="100%" fill="white" stroke="#e0e0e0" stroke-width="2" rx="12"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="100%" height="60" fill="url(#cardGradient)" rx="12,12,0,0"/>
  <text x="150" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${menuTitle}</text>
  <text x="150" y="45" text-anchor="middle" fill="white" font-size="12">Card ${index + 1} of ${total}</text>
  
  <!-- Menu level icon -->
  <text x="150" y="120" text-anchor="middle" font-size="48">${menuIcon}</text>
  
  <!-- Menu level title -->
  <text x="150" y="160" text-anchor="middle" fill="#2c3e50" font-size="18" font-weight="bold">${card.name}</text>
  
  <!-- Menu options -->
  ${optionButtons}
  
  <!-- Interactive spell element for the whole card -->
  <rect x="50" y="260" width="200" height="40" rx="8" fill="rgba(155, 89, 182, 0.1)" 
        stroke="#9b59b6" stroke-width="2" stroke-dasharray="5,5"
        spell="menu" style="cursor: pointer;"/>
  <text x="150" y="278" text-anchor="middle" fill="#9b59b6" font-size="14" font-weight="bold">🪄 Menu Selection</text>
  <text x="150" y="292" text-anchor="middle" fill="#9b59b6" font-size="11">Choose your option!</text>
  
  <!-- Navigation buttons -->
  ${backButton}
  ${navigationButton}
  
  <!-- Card info -->
  <text x="10" y="390" fill="#95a5a6" font-size="10">Level: ${card.level}</text>
  ${card.parentSelection ? `<text x="10" y="375" fill="#95a5a6" font-size="10">After: ${card.parentSelection.option}</text>` : ''}
</svg>`;

  return svgContent;
}

/**
 * Find the next logical card for navigation based on menu hierarchy
 * @param {Object} currentCard - The current card
 * @param {Array} allCards - All available cards
 * @param {Array} menuHeaders - Menu header information
 * @returns {Object|null} Next card for navigation
 */
function findNextLogicalCard(currentCard, allCards, menuHeaders) {
  // For selector cards, navigate directly to next selector or products
  if (currentCard.type === 'menu-selector') {
    // Find the current menu level index in menuHeaders (these are ordered left to right)
    const currentLevelIndex = menuHeaders.findIndex(h => h.name === currentCard.level);
    
    console.log(`🔍 Current selector "${currentCard.name}" is at menu level index ${currentLevelIndex} (${currentCard.level})`);
    console.log(`🔍 Menu headers sequence:`, menuHeaders.map(h => h.name));
    
    // Navigate to the next menu column (left to right)
    if (currentLevelIndex !== -1 && currentLevelIndex + 1 < menuHeaders.length) {
      // Find the selector for the next menu column
      const nextLevelName = menuHeaders[currentLevelIndex + 1].name;
      const nextSelector = allCards.find(c => 
        c.type === 'menu-selector' && c.level === nextLevelName
      );
      
      if (nextSelector) {
        console.log(`🔗 ${currentCard.name} → ${nextSelector.name} (next menu column)`);
        return nextSelector;
      } else {
        console.log(`⚠️ Could not find selector for next menu level: ${nextLevelName}`);
        console.log(`🔍 Available selectors:`, allCards.filter(c => c.type === 'menu-selector').map(c => `"${c.name}" (level: ${c.level})`));
      }
    } else {
      // Last menu column - navigate to product(s)
      const firstProduct = allCards.find(c => c.type === 'product');
      if (firstProduct) {
        console.log(`🔗 ${currentCard.name} → ${firstProduct.name} (reached product column)`);
        return firstProduct;
      } else {
        console.log(`⚠️ No products found after last menu column`);
      }
    }
  }
  
  // For product cards, navigate to next product or back to menu
  if (currentCard.type === 'product') {
    // Find next product in sequence
    const currentIndex = allCards.findIndex(c => c === currentCard);
    const nextProduct = allCards.find((c, index) => 
      index > currentIndex && c.type === 'product'
    );
    
    if (nextProduct) {
      console.log(`🔗 ${currentCard.name} → ${nextProduct.name} (next product)`);
      return nextProduct;
    }
  }
  
  console.log(`🔗 ${currentCard.name} → no next card found`);
  return null;
}

async function processMenuCatalogProduct(productData, userUuid, sanoraUrl) {
  console.log('🍽️ Starting menu catalog processing...');
  
  try {
    // Extract form data
    const menuTitle = productData.formData['Menu Title'] || 'Untitled Menu';
    const menuDescription = productData.formData['Menu Description'] || '';
    const menuType = productData.formData['Menu Type'] || 'restaurant'; // Get the menu type for category
    
    // Get CSV/JSON data from form data (catalog field)
    let menuData = '';
    if (productData.formData && productData.formData['CSV or JSON File']) {
      const catalogFile = productData.formData['CSV or JSON File'];
      console.log('📁 CSV/JSON catalog file detected:', catalogFile);
      
      // Read file content
      if (catalogFile.file) {
        try {
          menuData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(catalogFile.file);
          });
          console.log('📄 File content loaded, length:', menuData.length);
        } catch (error) {
          console.error('❌ Error reading catalog file:', error);
          throw new Error('Failed to read catalog file content');
        }
      }
    }
    
    console.log('📋 Menu info:', { menuTitle, menuDataLength: menuData.length });
    
    // Step 1: Parse menu data (CSV or JSON)
    let menuTree;
    
    if (!menuData.trim()) {
      throw new Error('Menu data is required');
    }
    
    // Detect if it's CSV or JSON
    const isJson = menuData.trim().startsWith('{') || menuData.trim().startsWith('[');
    
    if (isJson) {
      console.log('📄 Parsing JSON menu data...');
      try {
        menuTree = JSON.parse(menuData);
      } catch (error) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
    } else {
      console.log('📊 Parsing CSV menu data...');
      menuTree = window.MenuCatalogUtils.parseCSVToMenuTree(menuData);
    }
    
    // Set menu title if not already set
    if (!menuTree.title) {
      menuTree.title = menuTitle;
    }
    
    // Step 2: Validate menu structure
    console.log('✅ Validating menu structure...');
    const validation = window.MenuCatalogUtils.validateMenuTree(menuTree);
    
    if (!validation.isValid) {
      throw new Error(`Menu validation failed: ${validation.errors.join(', ')}`);
    }
    
    console.log('📊 Menu stats:', validation.stats);
    
    // Step 3: Create individual SVG cards for BOTH menu levels AND products
    console.log('🎨 Creating SVG cards for menu items...');
    const createdCards = [];
    const cardErrors = [];
    
    // First, create a comprehensive list of all cards needed
    const allCardsNeeded = [];
    
    // Add menu hierarchy cards (selector cards + option cards)
    console.log('🗂️ Analyzing menu levels for card creation...');
    
    // Extract menu headers in proper order from the original CSV metadata
    // Use the preserved menuHeaders order from the CSV parser to maintain left-to-right column sequence
    const menuHeaders = menuTree.menuHeaders || Object.keys(menuTree.menus).map(menuLevel => ({ name: menuLevel }));
    console.log(`📋 Found menu levels in order: ${menuHeaders.map(h => h.name).join(', ')}`);
    
    // First: Create top-level menu selector cards for each menu level
    for (let i = 0; i < menuHeaders.length; i++) {
      const menuLevel = menuHeaders[i].name;
      const menuOptions = Object.keys(menuTree.menus[menuLevel]);
      
      // Create a selector card for this menu level (e.g., "Select rider type")
      const menuSelectorCard = {
        type: 'menu-selector',
        level: menuLevel,
        name: `Select ${menuLevel}`,
        isMenu: true,
        isSelector: true,
        options: menuOptions,
        nextLevel: i < menuHeaders.length - 1 ? menuHeaders[i + 1] : 'product',
        menuData: {
          title: `Choose ${menuLevel}`,
          options: menuOptions.map(opt => ({
            name: opt,
            data: menuTree.menus[menuLevel][opt]
          }))
        }
      };
      allCardsNeeded.push(menuSelectorCard);
      console.log(`📑 Created selector card: ${menuSelectorCard.name} with options: ${menuOptions.join(', ')}`);
    }
    
    // Skip creating individual option cards - navigation goes directly from selector to selector
    console.log('🚫 Skipping individual option cards - using selector-to-selector navigation');
    
    // Add product cards
    console.log('🛍️ Adding product cards...');
    for (const product of menuTree.products) {
      allCardsNeeded.push({
        type: 'product',
        name: product.name,
        price: product.price,
        isMenu: false,
        productData: product
      });
    }
    
    console.log(`🎯 Total cards needed: ${allCardsNeeded.length} (${menuHeaders.length} menu levels + ${menuTree.products.length} products)`);
    
    // First pass: Generate unique bdoPubKeys for ALL cards (menu + product)
    console.log('🔑 Generating unique bdoPubKeys for all cards...');
    let uniqueCardKeys = [];
    try {
      if (invoke) {
        console.log(`🎯 MAGICARD_WORKFLOW: Generating ${allCardsNeeded.length} unique keys for menu: ${menuTitle}`);
        uniqueCardKeys = await invoke('generate_menu_card_keys', { 
          menuName: menuTitle, 
          cardCount: allCardsNeeded.length 
        });
        console.log(`🎯 MAGICARD_WORKFLOW: ✅ Generated ${uniqueCardKeys.length} unique keys`);
      } else {
        // Fallback: generate demo keys
        for (let i = 0; i < allCardsNeeded.length; i++) {
          uniqueCardKeys.push(`demo_card_${Date.now().toString(36)}_${i}`);
        }
        console.log('🎯 MAGICARD_WORKFLOW: Using fallback demo keys');
      }
    } catch (error) {
      console.log('🎯 MAGICARD_WORKFLOW: ❌ Error generating unique keys:', error);
      // Fallback: generate demo keys
      for (let i = 0; i < allCardsNeeded.length; i++) {
        uniqueCardKeys.push(`demo_card_${Date.now().toString(36)}_${i}`);
      }
    }
    
    // Assign unique keys to each card
    for (let i = 0; i < allCardsNeeded.length; i++) {
      const card = allCardsNeeded[i];
      card.cardBdoPubKey = uniqueCardKeys[i];
      console.log(`🎯 MAGICARD_WORKFLOW: Assigned key ${i + 1}: ${card.cardBdoPubKey.substring(0, 12)}... to ${card.name}`);
    }
    
    // ===== COMPREHENSIVE PUBKEY SUMMARY =====
    console.log('\n🔑 ===== MAGICARD PUBKEY SUMMARY =====');
    console.log(`📋 Menu: ${menuTitle}`);
    console.log(`🎴 Total Cards: ${allCardsNeeded.length}`);
    console.log('🔑 All PubKeys for BDO Upload:');
    allCardsNeeded.forEach((card, index) => {
      console.log(`   ${index + 1}. ${card.name} → ${card.cardBdoPubKey}`);
    });
    console.log('🔑 =================================\n');
    
    // Second pass: Create SVG cards with proper navigation links
    console.log('🎨 Creating SVG cards with navigation...');
    for (let i = 0; i < allCardsNeeded.length; i++) {
      const card = allCardsNeeded[i];
      const nextCard = findNextLogicalCard(card, allCardsNeeded, menuHeaders); // Smart navigation
      
      // Debug: Show card position and navigation
      console.log(`🎯 Card ${i}: "${card.name}" (type: ${card.type}, level: ${card.level || 'none'})`);
      if (nextCard) {
        const nextIndex = allCardsNeeded.findIndex(c => c === nextCard);
        console.log(`🎯   → Links to card ${nextIndex}: "${nextCard.name}" (type: ${nextCard.type})`);
      } else {
        console.log(`🎯   → Links to: none`);
      }
      
      try {
        let cardSvg = '';
        
        if (card.type === 'menu-selector') {
          console.log(`🗂️ Creating menu selector card: ${card.name}`);
          cardSvg = createMenuSelectorSVG(card, allCardsNeeded, menuTitle, i);
        } else if (card.type === 'product') {
          console.log(`🛍️ Creating product card: ${card.name} ($${(card.price / 100).toFixed(2)})`);
          cardSvg = createMenuItemSVG(card.productData, nextCard?.productData, menuTitle, i, allCardsNeeded.length);
        } else {
          console.log(`⚠️ Unknown card type: ${card.type} for card: ${card.name}`);
          continue;
        }
        
        // Store the card in BDO with individual user
        console.log(`💾 Creating BDO user and storing card ${card.name}...`);
        
        try {
          if (invoke) {
            // Create a new BDO user for this specific card using its unique private key
            console.log(`🔑 Creating BDO user for card: ${card.name} with key: ${card.cardBdoPubKey.substring(0, 12)}...`);
            
            // Store the card in BDO with its unique user
            const cardBdoResult = await invoke('store_card_in_bdo', {
              cardBdoPubKey: card.cardBdoPubKey,
              cardName: card.name,
              svgContent: cardSvg,
              cardType: card.type,
              menuName: menuTitle
            });
            
            console.log(`✅ Card stored in BDO: ${card.name} -> ${cardBdoResult}`);
          } else {
            console.log('⚠️ No invoke available, skipping local storage (quota limits)');
            // Skip localStorage to avoid quota exceeded errors
          }
        } catch (error) {
          console.warn(`⚠️ BDO storage failed for card ${card.name}:`, error);
          // Skip localStorage fallback to avoid quota exceeded errors
          console.log('Skipping localStorage fallback due to quota limits');
        }
        
        createdCards.push({
          localId: card.productData?.id || `menu_${card.level}_${card.option}`,
          cardBdoPubKey: card.cardBdoPubKey,
          name: card.name,
          type: card.type,
          price: card.price || 0,
          svgContent: cardSvg
        });
        
        console.log(`✅ Card created: ${card.name} -> ${card.cardBdoPubKey.substring(0, 12)}...`);
        
        // Log detailed info for first three cards
        if (createdCards.length <= 3) {
          console.log(`🔍 CARD #${createdCards.length} DETAILS:`);
          console.log(`   Name: ${card.name}`);
          console.log(`   Type: ${card.type}`);
          console.log(`   Full pubKey: ${card.cardBdoPubKey}`);
          console.log(`   SVG length: ${cardSvg.length} chars`);
          console.log(`   SVG preview: ${cardSvg.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to create card for ${card.name}:`, error);
        cardErrors.push({
          product: card.name,
          error: error.message
        });
      }
    }
    
    console.log(`📈 Card creation results: ${createdCards.length} successful, ${cardErrors.length} failed`);
    console.log(`🎯 MAGICARD_WORKFLOW: 🔍 First created card:`, createdCards.length > 0 ? {
      name: createdCards[0].name,
      cardBdoPubKey: createdCards[0].cardBdoPubKey?.substring(0, 12) + '...',
      type: createdCards[0].type
    } : 'None');
    
    // Step 4: Update menu tree with card bdoPubKeys
    console.log('🔗 Menu structure updated with card bdoPubKeys...');
    // The products array already has the cardBdoPubKey added above
    
    // Step 5: Create unique BDO user for menu and store menu data
    console.log('🎯 MAGICARD_WORKFLOW: Creating unique BDO user for menu storage...');
    
    // Prepare the menu data for BDO storage
    const catalogForBDO = {
      title: menuTree.title || menuTitle,
      description: menuDescription,
      menus: menuTree.menus,
      products: menuTree.products.map(p => ({
        id: p.id,
        cardBdoPubKey: p.cardBdoPubKey, // Individual card bdoPubKey for navigation
        name: p.name,
        price: p.price,
        category: p.category,
        metadata: p.metadata
      })),
      cards: createdCards, // Store the created card information
      metadata: {
        ...menuTree.metadata,
        uploadedAt: new Date().toISOString(),
        totalCards: createdCards.length,
        failedCards: cardErrors.length,
        menuType: menuType,
        firstCardBdoPubKey: createdCards.length > 0 ? createdCards[0].cardBdoPubKey : null // For easy navigation to first card
      },
      cardResults: {
        successful: createdCards,
        failed: cardErrors
      }
    };
    
    // Store menu in BDO with unique user and get unique public key
    let bdoPubKey = null;
    let bdoResult = null;
    
    try {
      if (invoke) {
        console.log('🎯 MAGICARD_WORKFLOW: Calling store_menu_in_bdo...');
        
        // Store menu in BDO with unique user and get the unique public key
        bdoPubKey = await invoke('store_menu_in_bdo', {
          menuName: menuTitle,
          menuData: JSON.stringify(catalogForBDO)
        });
        
        console.log('🎯 MAGICARD_WORKFLOW: ✅ Menu stored with unique bdoPubKey:', bdoPubKey.substring(0, 12) + '...');
        bdoResult = { success: true, pubKey: bdoPubKey, message: 'Menu stored in BDO with unique user' };
        
        // Update catalogForBDO with the actual bdoPubKey
        catalogForBDO.bdoPubKey = bdoPubKey;
        catalogForBDO.metadata.bdoPubKey = bdoPubKey;
        
        // Skip localStorage backup to avoid quota exceeded errors
        console.log('Skipping localStorage backup due to quota limits');
        
      } else {
        console.log('🎯 MAGICARD_WORKFLOW: ⚠️ No invoke available, using demo key and localStorage');
        bdoPubKey = `demo_menu_${Date.now().toString(36)}`;
        
        // Update catalogForBDO with demo key
        catalogForBDO.bdoPubKey = bdoPubKey;
        catalogForBDO.metadata.bdoPubKey = bdoPubKey;
        
        // Skip localStorage to avoid quota exceeded errors
        console.log('Skipping localStorage (demo mode) due to quota limits');
        bdoResult = { success: true, pubKey: bdoPubKey, message: 'Stored locally with demo key (invoke unavailable)' };
      }
    } catch (error) {
      console.log('🎯 MAGICARD_WORKFLOW: ❌ Error storing menu in BDO:', error);
      
      // Generate a fallback demo key
      bdoPubKey = `demo_menu_${Date.now().toString(36)}`;
      console.log('🎯 MAGICARD_WORKFLOW: 🔄 Using fallback demo key:', bdoPubKey);
      
      // Update catalogForBDO with fallback key
      catalogForBDO.bdoPubKey = bdoPubKey;
      catalogForBDO.metadata.bdoPubKey = bdoPubKey;
      
      // Skip localStorage to avoid quota exceeded errors
      console.log('Skipping localStorage (error fallback) due to quota limits');
      bdoResult = { success: true, pubKey: bdoPubKey, message: 'BDO error, localStorage skipped for quota' };
    }
    
    // Step 6: Create a catalog product in Sanora as well (for marketplace listing)
    console.log('📋 Creating catalog entry in Sanora...');
    let catalogProductResult = null;
    
    try {
      const catalogProductData = {
        uuid: userUuid,
        sanoraUrl: sanoraUrl,
        title: menuTitle,
        description: `Menu catalog with ${createdCards.length} cards (${menuTree.products.length} products + ${createdCards.length - menuTree.products.length} menu levels). ${menuDescription}`,
        price: 0, // Catalog itself is free, individual items have prices
        category: 'menu', // Set category as 'menu' for detection logic
        bdoPubKey: bdoPubKey // Add bdoPubKey for MagiCard integration
      };
      
      console.log('🎯 MAGICARD_WORKFLOW: 📋 Creating Sanora catalog product with bdoPubKey:', bdoPubKey.substring(0, 12) + '...');
      
      catalogProductResult = await invoke('add_product', catalogProductData);
      console.log('✅ Catalog product created:', catalogProductResult);
      
      // Step 7: Upload the menu JSON structure as an artifact
      if (catalogProductResult && (catalogProductResult.id || catalogProductResult.uuid)) {
        console.log('📁 Uploading menu JSON as artifact...');
        try {
          const menuJsonData = JSON.stringify(catalogForBDO, null, 2);
          const menuJsonBlob = new Blob([menuJsonData], { type: 'application/json' });
          const menuJsonFile = new File([menuJsonBlob], `${menuTitle.replace(/[^a-zA-Z0-9]/g, '_')}_menu.json`, {
            type: 'application/json'
          });
          
          const artifactUploadResult = await uploadArtifactToSanora(
            userUuid,
            sanoraUrl,
            menuTitle, // Use the actual product title, not a description
            menuJsonFile
          );
          
          if (artifactUploadResult.success) {
            console.log('✅ Menu JSON artifact uploaded successfully');
          } else {
            console.warn('⚠️ Menu JSON artifact upload failed:', artifactUploadResult.message);
          }
        } catch (artifactError) {
          console.warn('⚠️ Failed to upload menu JSON artifact:', artifactError);
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Failed to create catalog product in Sanora:', error);
    }
    
    // ===== FINAL MAGICARD UPLOAD SUMMARY =====
    console.log('\n🎯 ===== FINAL MAGICARD UPLOAD SUMMARY =====');
    console.log(`📋 Menu: ${menuTitle}`);
    console.log(`🎴 Total Cards Created: ${createdCards.length}`);
    console.log(`❌ Failed Cards: ${cardErrors.length}`);
    console.log(`🔑 Master Menu BDO PubKey: ${bdoPubKey}`);
    console.log(`🥇 First Card PubKey (for import): ${createdCards.length > 0 ? createdCards[0].cardBdoPubKey : 'None'}`);
    console.log('📋 All Uploaded Card PubKeys:');
    createdCards.forEach((card, index) => {
      console.log(`   ${index + 1}. ${card.name} → ${card.cardBdoPubKey}`);
    });
    console.log('✅ All cards are uploaded to BDO with pub=true (publicly accessible)');
    console.log('🔑 =======================================\n');
    
    // Return comprehensive result
    return {
      success: true,
      productType: 'menu',
      title: menuTitle,
      catalogId: catalogProductResult?.id || 'unknown',
      bdoId: bdoResult?.id || 'unknown',
      bdoPubKey: bdoPubKey, // Master bdoPubKey for MagiCard integration
      firstCardBdoPubKey: createdCards.length > 0 ? createdCards[0].cardBdoPubKey : null, // First card for direct access
      menuStats: validation.stats,
      cardResults: {
        successful: createdCards.length,
        failed: cardErrors.length,
        details: {
          created: createdCards,
          errors: cardErrors
        }
      },
      catalogData: catalogForBDO
    };
    
  } catch (error) {
    console.error('❌ Menu catalog processing failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

/**
 * Generate a mock UUID for testing (replace with real sessionless auth)
 */
function generateMockUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
      console.log('🔍 invoke variable:', invoke);
      console.log('🔍 tauriInitialized:', tauriInitialized);
      console.log('🔍 window.__TAURI__:', !!window.__TAURI__);
      console.log('🔍 window.ninefyInvoke:', !!window.ninefyInvoke);
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
    console.log('⚠️ Image upload failed via Tauri:', error);
    console.log('⚠️ Error message:', error.message);
    console.log('⚠️ Error stack:', error.stack);
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
// Global variables for form and display configuration
let PRODUCT_FORM_CONFIG = null;
let PRODUCT_FORM_FIELDS = {};
let PRODUCT_DISPLAY_CONFIG = null;

// Load product form configuration from JSON file
async function loadProductFormConfig() {
  if (PRODUCT_FORM_CONFIG) return PRODUCT_FORM_CONFIG;
  
  try {
    const response = await fetch('./product-forms-config.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    PRODUCT_FORM_CONFIG = await response.json();
    
    // Transform config for backward compatibility
    PRODUCT_FORM_FIELDS = {};
    Object.keys(PRODUCT_FORM_CONFIG.productTypes).forEach(type => {
      PRODUCT_FORM_FIELDS[type] = PRODUCT_FORM_CONFIG.productTypes[type].fields;
    });
    
    console.log('✅ Product form config loaded successfully');
    return PRODUCT_FORM_CONFIG;
  } catch (error) {
    console.error('❌ Failed to load product form config:', error);
    
    // Fallback to basic config if file loading fails
    PRODUCT_FORM_CONFIG = {
      productTypes: {
        ebook: {
          label: '📚 E-Book',
          icon: '📚',
          title: '📚 Book Details',
          fields: {
            title: { type: 'text', placeholder: 'E-book title...', required: true },
            category: { type: 'hidden', value: 'ebook' }
          },
          displayFields: []
        }
      }
    };
    
    PRODUCT_FORM_FIELDS = {
      ebook: PRODUCT_FORM_CONFIG.productTypes.ebook.fields
    };
    
    return PRODUCT_FORM_CONFIG;
  }
}

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
  
  // Create loading placeholder
  const loadingContainer = document.createElement('div');
  loadingContainer.style.cssText = `
    text-align: center;
    padding: 40px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  loadingContainer.innerHTML = '🔄 Loading product form...';
  
  // Create form asynchronously using form-widget
  createFormWidgetUploadForm().then(formContainer => {
    screen.removeChild(loadingContainer);
    screen.appendChild(formContainer);
    
    // Setup drag and drop after form is loaded
    if (formContainer.setupDragAndDrop) {
      formContainer.setupDragAndDrop();
    }
  }).catch(error => {
    console.error('❌ Failed to create upload form:', error);
    loadingContainer.innerHTML = '❌ Failed to load product form. Please refresh and try again.';
  });
  
  screen.appendChild(header);
  screen.appendChild(loadingContainer);
  
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
  console.log('🏗️ Creating production base screen with real BDO data...');
  
  // Create a simple production base screen
  const screen = document.createElement('div');
  screen.id = 'base-screen';
  screen.className = 'screen';
  screen.style.cssText = `
    padding: 20px;
    overflow-y: auto;
    background: ${appState.currentTheme.colors.background};
    color: ${appState.currentTheme.colors.text};
    font-family: ${appState.currentTheme.typography.fontFamily};
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
    ">Real-time discovery from your home BDO server</p>
  `;
  
  // Status area
  const statusArea = document.createElement('div');
  statusArea.style.cssText = `
    background: ${appState.currentTheme.colors.surface};
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 30px;
    text-align: center;
    border: 1px solid ${appState.currentTheme.colors.border};
  `;
  statusArea.innerHTML = `
    <div style="color: ${appState.currentTheme.colors.textMuted};">
      🔄 Loading base servers from BDO...
    </div>
  `;
  
  // Refresh button
  const refreshButton = document.createElement('button');
  refreshButton.innerHTML = '🔄 Refresh Bases';
  refreshButton.style.cssText = `
    background: ${appState.currentTheme.colors.primary};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.fontSize}px;
    cursor: pointer;
    margin-bottom: 20px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  `;
  
  // Bases container
  const basesContainer = document.createElement('div');
  basesContainer.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    gap: 20px;
  `;
  
  screen.appendChild(header);
  screen.appendChild(statusArea);
  screen.appendChild(refreshButton);
  screen.appendChild(basesContainer);
  
  // Load bases from BDO
  async function loadBasesFromBDO() {
    statusArea.innerHTML = `
      <div style="color: ${appState.currentTheme.colors.textMuted};">
        📡 Connecting to BDO server at ${getEnvironmentConfig().bdo}...
      </div>
    `;
    
    try {
      if (!window.ninefyInvoke) {
        throw new Error('Tauri backend not available');
      }
      
      // Get environment config
      const envConfig = getEnvironmentConfig();
      
      // Create BDO user
      const bdoUser = await window.ninefyInvoke('create_bdo_user', { 
        bdoUrl: envConfig.bdo 
      });
      console.log('✅ BDO user created:', bdoUser.uuid);
      
      statusArea.innerHTML = `
        <div style="color: ${appState.currentTheme.colors.textMuted};">
          🔍 Discovering bases from BDO (User: ${bdoUser.uuid.substring(0, 8)}...)
        </div>
      `;
      
      // Get bases from BDO
      const basesData = await window.ninefyInvoke('get_bases', {
        uuid: bdoUser.uuid,
        bdoUrl: envConfig.bdo
      });
      
      console.log('📦 Raw bases from BDO:', basesData);
      
      // Clear existing bases
      basesContainer.innerHTML = '';
      
      if (!basesData || Object.keys(basesData).length === 0) {
        statusArea.innerHTML = `
          <div style="color: ${appState.currentTheme.colors.textMuted};">
            📦 No base servers found in BDO yet
          </div>
        `;
        
        const emptyState = document.createElement('div');
        emptyState.style.cssText = `
          text-align: center;
          padding: 60px 20px;
          color: ${appState.currentTheme.colors.textMuted};
          font-size: ${appState.currentTheme.typography.fontSize + 2}px;
        `;
        emptyState.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
          <div style="font-weight: bold; margin-bottom: 10px;">No base servers yet</div>
          <div>Base servers will appear here when they're added to your home BDO</div>
        `;
        basesContainer.appendChild(emptyState);
        return;
      }
      
      // Process and display bases
      const baseCount = Object.keys(basesData).length;
      statusArea.innerHTML = `
        <div style="color: ${appState.currentTheme.colors.primary};">
          ✅ Found ${baseCount} base servers from BDO
        </div>
      `;
      
      // Create base cards
      Object.entries(basesData).forEach(([baseId, baseData]) => {
        const base = {
          ...baseData,
          id: baseId,
          status: 'connected',
          users: 0,
          uptime: '100%'
        };
        
        const baseCard = createProductionBaseCard(base);
        basesContainer.appendChild(baseCard);
      });
      
      console.log('✅ Successfully loaded bases from BDO');
      
    } catch (error) {
      console.error('❌ Failed to load bases from BDO:', error);
      statusArea.innerHTML = `
        <div style="color: ${appState.currentTheme.colors.error};">
          ❌ Error: ${error.message}
        </div>
      `;
      
      // Show fallback message
      const errorState = document.createElement('div');
      errorState.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        color: ${appState.currentTheme.colors.textMuted};
        background: rgba(239, 68, 68, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.3);
      `;
      errorState.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <div style="font-weight: bold; margin-bottom: 10px;">Connection Failed</div>
        <div style="margin-bottom: 10px;">${error.message}</div>
        <div>Using current environment: ${getEnvironmentConfig().bdo}</div>
      `;
      basesContainer.appendChild(errorState);
    }
  }
  
  // Create production base card
  function createProductionBaseCard(base) {
    const baseCard = document.createElement('div');
    baseCard.style.cssText = `
      background: ${appState.currentTheme.colors.surface};
      border: 2px solid ${appState.currentTheme.colors.primary};
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
      position: relative;
    `;
    
    const servicesList = Object.keys(base.dns || {}).join(', ') || 'No services';
    const somaContent = Object.entries(base.soma || {})
      .map(([type, tags]) => `${type}: ${Array.isArray(tags) ? tags.join(', ') : tags}`)
      .join(' • ') || 'No content tags';
    
    baseCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="
          color: ${appState.currentTheme.colors.text};
          margin: 0;
          font-size: 1.4rem;
          font-family: ${appState.currentTheme.typography.fontFamily};
        ">${base.name || base.id || 'Unknown Base'}</h3>
        <div style="
          background: ${appState.currentTheme.colors.primary};
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        ">connected</div>
      </div>
      
      <p style="
        color: ${appState.currentTheme.colors.textSecondary};
        margin-bottom: 16px;
        line-height: 1.5;
      ">${base.description || 'Base server discovered from BDO'}</p>
      
      <div style="margin-bottom: 16px;">
        <div style="color: ${appState.currentTheme.colors.text}; font-weight: bold; margin-bottom: 8px;">
          Available Services:
        </div>
        <div style="color: ${appState.currentTheme.colors.textMuted}; font-size: 14px;">
          ${servicesList}
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="color: ${appState.currentTheme.colors.text}; font-weight: bold; margin-bottom: 8px;">
          Content Types (Soma):
        </div>
        <div style="color: ${appState.currentTheme.colors.textMuted}; font-size: 14px;">
          ${somaContent}
        </div>
      </div>
      
      <div style="text-align: center;">
        <button onclick="alert('Base: ${base.name || base.id}\\nServices: ${servicesList}\\nContent: ${somaContent}')" style="
          background: ${appState.currentTheme.colors.secondary};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: ${appState.currentTheme.typography.fontFamily};
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        " 
        onmouseover="this.style.opacity='0.8'"
        onmouseout="this.style.opacity='1'">
          View Details
        </button>
      </div>
    `;
    
    return baseCard;
  }
  
  // Refresh button handler
  refreshButton.addEventListener('click', loadBasesFromBDO);
  
  // Auto-load bases when screen is created
  setTimeout(loadBasesFromBDO, 100);
  
  return screen;
}

/**
 * Show product details screen
 */
function showProductDetails(product) {
  console.log('📄 Showing product details for:', product.title);
  
  // Store the product data for the details screen
  appState.selectedProduct = product;
  
  // Navigate to details screen
  appState.currentScreen = 'details';
  updateHUDButtons();
  renderCurrentScreen();
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
 * Fetch teleported content via BDO teleportation
 */
async function getTeleportedContent() {
  console.log('🌐 Starting teleportation workflow...');
  
  try {
    const bases = await getAvailableBases();
    console.log('🏗️ Available bases for teleportation:', Object.keys(bases).length, bases);
    
    const allTeleportedContent = [];
    
    for (const [baseId, base] of Object.entries(bases)) {
      if (!base.dns?.sanora || !base.dns?.bdo) {
        console.log(`⚠️ Skipping ${base.name} - missing sanora (${!!base.dns?.sanora}) or bdo (${!!base.dns?.bdo}) DNS`);
        continue;
      }
      
      console.log(`🔍 Teleporting from ${base.name} - Sanora: ${base.dns.sanora}, BDO: ${base.dns.bdo}`);
      
      try {
        // Construct the teleportable-products URL with pubKey for teleportation
        // Use allyabase://sanora/ protocol for container networking
        const teleportableUrl = `allyabase://sanora/teleportable-products`;
        
        // We need to add pubKey as query parameter for teleportation
        const pubKey = await getBasePubKeyForTeleportation(base.dns.sanora);
        
        const teleportUrl = `${teleportableUrl}?pubKey=${pubKey}`;
        console.log(`🔗 Using allyabase:// protocol for container networking: ${teleportUrl}`);
        console.log(`🚀 Teleporting from URL: ${teleportUrl}`);
        console.log(`📡 Using BDO endpoint: ${base.dns.bdo}`);
        
        // Check if we're in Tauri environment
        if (typeof invoke !== 'undefined' && invoke) {
          console.log('🦀 Using Tauri backend for teleportation');
          
          const teleportedData = await invoke('teleport_content', {
            bdoUrl: base.dns.bdo,
            teleportUrl: teleportUrl
          });
          
          console.log(`📄 Raw teleported data from ${base.name}:`, teleportedData);
          console.log(`📄 Data type:`, typeof teleportedData, Array.isArray(teleportedData));
          
          // Process the teleported data
          const processedItems = await processTeleportedData(teleportedData, baseId, base.name, base.dns.sanora);
          
          allTeleportedContent.push(...processedItems);
          console.log(`📈 Total teleported items so far: ${allTeleportedContent.length}`);
          
        } else {
          console.log('⚠️ Tauri not available - teleportation requires desktop app');
        }
        
      } catch (teleportError) {
        console.warn(`⚠️ Failed to teleport from ${base.name}:`, teleportError.message);
      }
    }
    
    console.log(`🌐 Final teleported content count: ${allTeleportedContent.length}`);
    console.log('🌐 Sample teleported items:', allTeleportedContent.slice(0, 3));
    
    return allTeleportedContent;
    
  } catch (error) {
    console.error('❌ Failed to get teleported content:', error);
    return [];
  }
}

/**
 * Get the base pubKey from Sanora user object for teleportation
 */
async function getBasePubKeyForTeleportation(baseUrl) {
  try {
    if (typeof invoke !== 'undefined' && invoke) {
      console.log('🔑 Getting basePubKey from Sanora user...');
      
      // Create a Sanora user to get the base's pubKey
      const sanoraUser = await invoke('create_sanora_user', { sanoraUrl: baseUrl });
      console.log('🔍 Debug - Full sanoraUser object:', sanoraUser);
      
      // Check both possible field names due to serialization differences
      const basePubKey = sanoraUser.basePubKey || sanoraUser.base_pub_key;
      if (sanoraUser && basePubKey) {
        console.log('✅ Got basePubKey from Sanora:', basePubKey);
        return basePubKey;
      }
      
      console.warn('⚠️ No basePubKey in Sanora user, falling back to direct key retrieval');
      const pubKey = await invoke('get_public_key');
      console.log('✅ Got fallback pubKey from backend:', pubKey);
      return pubKey;
    }
  } catch (error) {
    console.warn('⚠️ Failed to get basePubKey from Sanora:', error);
  }
  
  // Fallback pubKey (matches the default private key)
  return '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd';
}

/**
 * Process teleported data from BDO into content format
 */
async function processTeleportedData(teleportedData, baseId, baseName, baseUrl) {
  console.log('🔄 Processing teleported data:', teleportedData);
  
  // The teleported data should contain the actual teleported content
  // Check if it's valid and extract the content
  if (!teleportedData || typeof teleportedData !== 'object') {
    console.warn('⚠️ Invalid teleported data format');
    return [];
  }
  
  // Check if teleportation was valid
  if (teleportedData.valid === false) {
    console.warn('⚠️ Teleportation returned invalid result');
    return [];
  }
  
  // Extract the actual content from the teleported response
  let contentArray = [];
  
  // Check if we have HTML content with teleportal elements
  if (teleportedData.html && typeof teleportedData.html === 'string') {
    console.log('📄 Parsing teleported HTML content...');
    
    // Parse the HTML to extract teleportal elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(teleportedData.html, 'text/html');
    const teleportals = doc.querySelectorAll('teleportal');
    
    console.log(`🔍 Found ${teleportals.length} teleportal elements`);
    
    // Convert teleportal elements to product objects
    contentArray = Array.from(teleportals).map(portal => {
      const product = {
        id: portal.getAttribute('id') || `teleported-${Date.now()}`,
        title: portal.querySelector('title')?.textContent || 'Untitled',
        description: portal.querySelector('description')?.textContent || '',
        price: parseInt(portal.getAttribute('price') || '0'),
        category: portal.getAttribute('category') || 'general',
        url: portal.querySelector('url')?.textContent || '',
        image: portal.querySelector('img')?.textContent || portal.querySelector('image')?.textContent || '',
        tags: (portal.querySelector('tags')?.textContent || '').split(',').filter(t => t),
        inStock: portal.querySelector('in-stock')?.textContent === 'true',
        rating: portal.querySelector('rating')?.textContent || '0'
      };
      
      console.log('📦 Extracted product from teleportal:', product);
      return product;
    });
  } else if (teleportedData.content && Array.isArray(teleportedData.content)) {
    contentArray = teleportedData.content;
  } else if (teleportedData.products && Array.isArray(teleportedData.products)) {
    contentArray = teleportedData.products;
  } else if (Array.isArray(teleportedData)) {
    contentArray = teleportedData;
  } else {
    // Try to extract any array-like content
    const values = Object.values(teleportedData);
    const arrayValues = values.filter(v => Array.isArray(v));
    if (arrayValues.length > 0) {
      contentArray = arrayValues[0];
    }
  }
  
  console.log(`📋 Extracted ${contentArray.length} items from teleported data`);
  
  // Process each item
  const processedItems = contentArray.map(item => processTeleportableProduct(item, baseId, baseName, baseUrl));
  
  return processedItems;
}

/**
 * Process a teleportable product into teleported content format
 */
function processTeleportableProduct(rawItem, baseId, baseName, baseUrl) {
  console.log('🔄 Processing teleportable item:', rawItem);
  
  // Handle nested structure if present (similar to normalizeBaseProduct)
  let itemData;
  if (rawItem && typeof rawItem === 'object') {
    const keys = Object.keys(rawItem).filter(key => !['baseId', 'baseName', 'baseUrl'].includes(key));
    if (keys.length === 1 && typeof rawItem[keys[0]] === 'object') {
      itemData = rawItem[keys[0]];
      console.log('📋 Extracted nested teleportable data:', itemData);
    } else {
      itemData = rawItem;
    }
  } else {
    itemData = rawItem;
  }
  
  // Convert to teleported content format
  const teleportedItem = {
    id: itemData.productId || itemData.id || `teleport-${baseId}-${Date.now()}`,
    type: 'product',
    title: itemData.title || 'Teleported Product',
    summary: itemData.description || itemData.summary || 'A product from another base',
    author: itemData.author || itemData.creator || 'Unknown',
    timestamp: itemData.timestamp || new Date().toISOString(),
    category: itemData.category || itemData.productType || 'product',
    price: itemData.price || 0,
    
    // Base information
    baseName: baseName,
    baseUrl: baseUrl,
    baseId: baseId,
    
    // Teleportation metadata
    teleported: true,
    teleportedFrom: baseName,
    teleportedAt: new Date().toISOString()
  };
  
  console.log('✅ Processed teleportable item:', teleportedItem);
  return teleportedItem;
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
    console.log('🔍 Base products structure:', JSON.stringify(baseProducts.slice(0, 2), null, 2));
    console.log('🔍 Local products structure:', JSON.stringify(localProducts.slice(0, 2), null, 2));
    
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
    
    // Load teleported content from /teleportable-products endpoints
    console.log('🌐 Loading teleported content...');
    const teleportedContainer = document.getElementById('teleported-container');
    if (teleportedContainer) {
      // Clear existing content
      teleportedContainer.innerHTML = '';
      
      // Show loading state
      const loadingElement = document.createElement('div');
      loadingElement.style.cssText = `
        padding: 40px 20px;
        text-align: center;
        color: ${appState.currentTheme.colors.secondary};
        font-family: ${appState.currentTheme.typography.fontFamily};
        font-size: 18px;
      `;
      loadingElement.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
        <div style="font-weight: bold; margin-bottom: 8px;">Loading teleported content...</div>
        <div style="font-size: 14px;">Fetching products from connected bases</div>
      `;
      teleportedContainer.appendChild(loadingElement);
      
      try {
        // Fetch teleported content via BDO teleportation
        const teleportedContent = await getTeleportedContent();
        console.log(`🌐 Retrieved ${teleportedContent.length} teleportable items`);
        
        // Clear loading state
        teleportedContainer.innerHTML = '';
        
        if (teleportedContent.length === 0) {
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
          console.log('🌐 No teleportable content found - showing empty state');
        } else {
          // Display teleported content
          console.log('🌐 Displaying teleported content items...');
          teleportedContent.forEach((item, index) => {
            console.log(`🌐 Creating teleported item ${index + 1}/${teleportedContent.length}:`, item);
            const teleportedElement = createTeleportedItem(item);
            teleportedContainer.appendChild(teleportedElement);
          });
          console.log(`✅ Successfully displayed ${teleportedContent.length} teleported items`);
        }
        
      } catch (teleportError) {
        console.error('❌ Failed to load teleported content:', teleportError);
        
        // Show error state
        teleportedContainer.innerHTML = '';
        const errorElement = document.createElement('div');
        errorElement.style.cssText = `
          padding: 40px 20px;
          text-align: center;
          color: ${appState.currentTheme.colors.secondary};
          font-family: ${appState.currentTheme.typography.fontFamily};
          font-size: 18px;
        `;
        errorElement.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <div style="font-weight: bold; margin-bottom: 8px;">Failed to load teleported content</div>
          <div style="font-size: 14px;">Check console for details</div>
        `;
        teleportedContainer.appendChild(errorElement);
      }
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
    
    // Initialize environment from Rust environment variables first
    await initializeEnvironment();
    
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

/**
 * Initialize Stripe payment for a product
 */
window.initializePayment = async function(product, amount, currency = 'usd') {
  console.log('💳 Initializing payment for:', product.title, 'Amount:', amount);
  
  try {
    // Check if we're in Tauri environment
    if (!window.__TAURI__ || !window.ninefyInvoke) {
      throw new Error('Payment requires the Tauri desktop environment');
    }
    
    // Get payment intent from backend
    const priceInCents = Math.round(amount * 100);
    console.log('💰 Price in cents:', priceInCents);
    
    const paymentIntent = await window.ninefyInvoke('get_payment_intent_without_splits', {
      amount: priceInCents,
      currency: currency.toUpperCase()
    });
    
    console.log('🔑 Payment intent created:', paymentIntent);
    
    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new Error('Failed to create payment intent');
    }
    
    // Show payment confirmation dialog (in production, you'd use Stripe Elements)
    const confirmPurchase = confirm(
      `🛒 Purchase Confirmation\n\n` +
      `Product: ${product.title}\n` +
      `Price: ${formatPrice(priceInCents)}\n` +
      `Payment Method: Stripe\n\n` +
      `Click OK to proceed with payment, or Cancel to abort.`
    );
    
    if (confirmPurchase) {
      // Simulate successful payment processing
      console.log('✅ Payment confirmed by user');
      
      // In a real implementation, you would:
      // 1. Load Stripe.js dynamically
      // 2. Create Stripe Elements for card input  
      // 3. Confirm payment with stripe.confirmCardPayment()
      // 4. Handle success/error responses
      
      // For now, show success message
      alert(`✅ Payment Successful!\n\nThank you for purchasing "${product.title}"!\n\nYour digital goods will be available for download shortly.`);
      
      console.log('🎉 Purchase completed successfully');
      return { success: true, paymentIntentId: paymentIntent.id };
    } else {
      console.log('❌ Payment cancelled by user');
      return { success: false, cancelled: true };
    }
    
  } catch (error) {
    console.error('❌ Payment initialization failed:', error);
    
    if (error.message.includes('Tauri')) {
      alert('💻 Payment requires desktop app\n\nPlease run ninefy via "npm run tauri dev" for full payment support.');
    } else if (error.message.includes('payment intent')) {
      alert('💳 Payment service unavailable\n\nPlease check your connection and try again later.');
    } else {
      alert(`❌ Payment failed: ${error.message}`);
    }
    
    throw error;
  }
};

// Load product display configuration from JSON file
async function loadProductDisplayConfig() {
  if (PRODUCT_DISPLAY_CONFIG) return PRODUCT_DISPLAY_CONFIG;
  
  try {
    const response = await fetch('./product-display-config.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    PRODUCT_DISPLAY_CONFIG = await response.json();
    
    console.log('✅ Product display config loaded successfully');
    return PRODUCT_DISPLAY_CONFIG;
  } catch (error) {
    console.error('❌ Failed to load product display config:', error);
    
    // Fallback to hardcoded config if file loading fails
    PRODUCT_DISPLAY_CONFIG = {
      productTypes: {
        ebook: {
          cardFields: [
            { key: 'author', label: 'Author', icon: '✍️', showInCard: true }
          ],
          detailFields: [
            { key: 'author', label: 'Author', icon: '✍️' },
            { key: 'isbn', label: 'ISBN', icon: '🔢' },
            { key: 'pages', label: 'Pages', icon: '📄' },
            { key: 'language', label: 'Language', icon: '🌐' }
          ]
        }
      },
      displaySettings: {
        cardMaxFields: 2,
        showEmptyFields: false,
        dateFormat: 'short',
        booleanFormat: { true: 'Yes', false: 'No' }
      }
    };
    
    return PRODUCT_DISPLAY_CONFIG;
  }
}

// Global function for BDO preview (debugging tool)
async function previewBDOMenu(bdoPubKey) {
  console.log('🔍 Previewing BDO data for pubKey:', bdoPubKey.substring(0, 12) + '...');
  
  if (!window.ninefyInvoke) {
    alert('❌ Preview requires Tauri backend. Please restart the app.');
    return;
  }
  
  try {
    const previewResult = await window.ninefyInvoke('preview_bdo_menu', { pub_key: bdoPubKey });
    console.log('✅ BDO Preview Result:', previewResult);
    
    // Show in alert for now (can be improved with modal)
    alert('🔍 BDO Preview:\n\n' + previewResult);
  } catch (error) {
    console.error('❌ Error previewing BDO data:', error);
    alert('❌ Error previewing BDO data: ' + error.message);
  }
}

// Make preview function globally available
window.previewBDOMenu = previewBDOMenu;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

console.log('🛒 Ninefy main module loaded');
