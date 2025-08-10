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
        localStorage.setItem('nullary-env', envFromRust);
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
    // Check if this has the nested structure like { "Foo": { actualProductData } }
    const keys = Object.keys(rawProduct).filter(key => !['baseId', 'baseName', 'baseUrl'].includes(key));
    if (keys.length === 1 && typeof rawProduct[keys[0]] === 'object') {
      // This is the nested format
      productData = rawProduct[keys[0]];
      console.log('📋 Extracted nested product data:', productData);
    } else {
      // This is already flat
      productData = rawProduct;
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
    'sodoto': '✅'
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
    'sodoto': '✅ SoDoTo Course Information'
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
    successMessage.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #155724;">Product Uploaded Successfully!</h3>
      <p style="margin: 0 0 10px 0; font-size: 15px;">Your ${typeConfig.label.toLowerCase()} has been uploaded to Sanora.</p>
      <p style="margin: 0; font-size: 13px; opacity: 0.8;">Form will reset automatically in 3 seconds...</p>
    `;
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
    
    // Step 1: Create product in Sanora FIRST
    console.log('📦 Creating product in Sanora...');
    
    const addProductParams = {
      uuid: userUuid,
      sanoraUrl: sanoraUrl,
      title: title,
      description: description,
      price: Math.round(parseFloat(price) * 100), // Ensure integer cents
      productType: productData.productType // Add the product type: 'ebook', 'course', 'ticket', 'shippable', 'sodoto'
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

console.log('🛒 Ninefy main module loaded');
