/**
 * Base Discovery Utilities for The Nullary
 * Shared base server discovery and management utilities
 */

/**
 * Base configuration constants
 */
export const BASE_CONFIG = {
  HOME_BASE_BDO: 'https://dev.bdo.allyabase.com',
  BASE_CACHE_TIMEOUT: 10 * 60 * 1000, // 10 minutes
  PRODUCT_CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  DISCOVERY_TIMEOUT: 5000, // 5 seconds
  MAX_RETRIES: 3
};

/**
 * Cache for base data
 */
let basesCache = {};
let lastBasesRefresh = 0;

/**
 * Cache for products data
 */
let productsCache = [];
let lastProductsRefresh = 0;

/**
 * Get available bases from BDO
 * @param {Object} options - Discovery options
 * @returns {Promise<Object>} Object with base data
 */
export async function getAvailableBases(options = {}) {
  const {
    useCache = true,
    timeout = BASE_CONFIG.DISCOVERY_TIMEOUT,
    homeBdo = BASE_CONFIG.HOME_BASE_BDO
  } = options;
  
  const now = new Date().getTime();
  
  // Return cached data if valid
  if (useCache && Object.keys(basesCache).length > 0 && (now - lastBasesRefresh < BASE_CONFIG.BASE_CACHE_TIMEOUT)) {
    console.log('📋 Using cached bases data');
    return basesCache;
  }
  
  console.log(`🔍 Discovering bases from ${homeBdo}...`);
  
  try {
    // Check if we have Tauri invoke available
    if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.core?.invoke) {
      try {
        const invoke = window.__TAURI__.core.invoke;
        const bases = await invoke('get_bases', {
          uuid: 'discovery-user',
          bdoUrl: homeBdo
        });
        
        if (bases && typeof bases === 'object') {
          basesCache = bases;
          lastBasesRefresh = now;
          console.log('✅ Retrieved bases via Tauri:', Object.keys(bases).length);
          return bases;
        }
      } catch (tauriError) {
        console.log('⚠️ Tauri discovery failed, falling back to HTTP:', tauriError.message);
      }
    }
    
    // HTTP fallback - discover bases via public endpoints
    const discoveredBases = await discoverBasesViaHTTP(options);
    
    basesCache = discoveredBases;
    lastBasesRefresh = now;
    
    console.log('✅ Base discovery completed:', Object.keys(discoveredBases).length, 'bases found');
    return discoveredBases;
    
  } catch (error) {
    console.error('❌ Base discovery failed:', error);
    
    // Return empty cache or fallback data
    if (Object.keys(basesCache).length > 0) {
      console.log('📋 Using stale cached bases due to error');
      return basesCache;
    }
    
    // Return minimal fallback data
    return getFallbackBases();
  }
}

/**
 * Discover bases via HTTP endpoints
 * @param {Object} options - Discovery options
 * @returns {Promise<Object>} Discovered bases
 */
async function discoverBasesViaHTTP(options = {}) {
  const { homeBdo = BASE_CONFIG.HOME_BASE_BDO } = options;
  
  // Try to get bases from home BDO
  try {
    const response = await fetch(`${homeBdo}/discover/bases`, {
      timeout: BASE_CONFIG.DISCOVERY_TIMEOUT
    });
    
    if (response.ok) {
      const bases = await response.json();
      console.log('🌐 Retrieved bases via HTTP from BDO');
      return bases;
    }
  } catch (error) {
    console.log('⚠️ BDO discovery failed:', error.message);
  }
  
  // Try known base endpoints
  const knownBases = getKnownBases();
  const discoveredBases = {};
  
  for (const [baseId, base] of Object.entries(knownBases)) {
    try {
      // Try to ping the sanora endpoint to verify it's alive
      if (base.dns?.sanora) {
        const response = await fetch(`${base.dns.sanora}/products/base`, {
          method: 'HEAD',
          timeout: 2000
        });
        
        if (response.ok) {
          discoveredBases[baseId] = base;
          console.log(`✅ Verified base: ${base.name}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Base ${base.name} not available:`, error.message);
    }
  }
  
  return discoveredBases;
}

/**
 * Get known base configurations
 * @returns {Object} Known bases
 */
function getKnownBases() {
  return {
    'dev-base': {
      name: 'Planet Nine Dev',
      description: 'Development base server',
      dns: {
        sanora: 'https://dev.sanora.allyabase.com',
        bdo: 'https://dev.bdo.allyabase.com',
        dolores: 'https://dev.dolores.allyabase.com',
        addie: 'https://dev.addie.allyabase.com',
        fount: 'https://dev.fount.allyabase.com'
      },
      tags: ['lexary', 'photary', 'viewary', 'blogary', 'ninefy']
    },
    'local-base': {
      name: 'Local Development',
      description: 'Local development base',
      dns: {
        sanora: 'http://127.0.0.1:7243',
        bdo: 'http://127.0.0.1:3003',
        dolores: 'http://127.0.0.1:3002',
        addie: 'http://127.0.0.1:3005',
        fount: 'http://127.0.0.1:3006'
      },
      tags: ['lexary', 'photary', 'viewary', 'blogary', 'ninefy']
    }
  };
}

/**
 * Get fallback base data when discovery fails
 * @returns {Object} Fallback bases
 */
function getFallbackBases() {
  console.log('📦 Using fallback base data');
  return {
    'fallback-base': {
      name: 'Development Base',
      description: 'Default development environment',
      dns: {
        sanora: 'https://dev.sanora.allyabase.com',
        bdo: 'https://dev.bdo.allyabase.com'
      },
      tags: ['lexary', 'photary', 'viewary']
    }
  };
}

/**
 * Get products from all available bases
 * @param {Object} options - Options for product discovery
 * @returns {Promise<Array>} Array of normalized products
 */
export async function getProductsFromBases(options = {}) {
  const {
    useCache = true,
    normalize = true
  } = options;
  
  const now = new Date().getTime();
  
  // Return cached data if valid
  if (useCache && productsCache.length > 0 && (now - lastProductsRefresh < BASE_CONFIG.PRODUCT_CACHE_TIMEOUT)) {
    console.log('📦 Using cached products');
    return productsCache;
  }
  
  console.log('🔄 Refreshing products from all bases...');
  
  const bases = await getAvailableBases();
  const allProducts = [];
  
  for (const [baseId, base] of Object.entries(bases)) {
    if (!base.dns?.sanora) continue;
    
    try {
      console.log(`🔍 Fetching products from ${base.name} at ${base.dns.sanora}`);
      
      // Try Tauri first
      let products = null;
      
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.core?.invoke) {
        try {
          const invoke = window.__TAURI__.core.invoke;
          products = await invoke('get_all_base_products', {
            sanoraUrl: base.dns.sanora
          });
        } catch (tauriError) {
          console.log(`⚠️ Tauri product fetch failed for ${base.name}, trying HTTP`);
        }
      }
      
      // HTTP fallback
      if (!products) {
        try {
          const response = await fetch(`${base.dns.sanora}/products/base`, {
            timeout: BASE_CONFIG.DISCOVERY_TIMEOUT
          });
          
          if (response.ok) {
            products = await response.json();
          }
        } catch (httpError) {
          console.warn(`⚠️ HTTP product fetch failed for ${base.name}:`, httpError.message);
          continue;
        }
      }
      
      console.log(`📦 Raw products from ${base.name}:`, products);
      
      // Normalize products
      if (Array.isArray(products)) {
        const normalizedProducts = normalize ? 
          products.map(p => normalizeBaseProduct(p, baseId, base.name, base.dns.sanora)) :
          products;
        allProducts.push(...normalizedProducts);
        console.log(`✅ Added ${products.length} products from ${base.name}`);
      } else if (products && typeof products === 'object') {
        const productArray = Object.values(products);
        const normalizedProducts = normalize ?
          productArray.map(p => normalizeBaseProduct(p, baseId, base.name, base.dns.sanora)) :
          productArray;
        allProducts.push(...normalizedProducts);
        console.log(`✅ Added ${productArray.length} products from ${base.name}`);
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
 * Normalize a product from a base server
 * @param {Object} productData - Raw product data
 * @param {string} baseId - Base identifier
 * @param {string} baseName - Base display name
 * @param {string} baseUrl - Base URL
 * @returns {Object} Normalized product
 */
export function normalizeBaseProduct(productData, baseId, baseName, baseUrl) {
  const normalizedProduct = {
    // Core product info
    id: productData.productId || productData.id || `product-${Date.now()}`,
    title: productData.title || 'Untitled Product',
    description: productData.description || 'No description available',
    price: productData.price || 0,
    
    // Categories and types
    category: productData.category || productData.type || 'general',
    type: productData.type || productData.category || 'general',
    
    // Author and metadata
    author: productData.author || productData.creator || 'Unknown',
    downloads: productData.downloads || 0,
    rating: productData.rating || 0,
    
    // Image handling
    featuredImage: (() => {
      if (productData.image) {
        return `${baseUrl.replace(/\/$/, '')}/images/${productData.image}`;
      } else if (productData.preview_image) {
        return `${baseUrl.replace(/\/$/, '')}/images/${productData.preview_image}`;
      } else if (productData.previewImage) {
        return `${baseUrl.replace(/\/$/, '')}/images/${productData.previewImage}`;
      }
      return null;
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
    
    // Keep original data
    artifacts: productData.artifacts || [],
    uuid: productData.uuid,
    tags: productData.tags || []
  };
  
  return normalizedProduct;
}

/**
 * Clear discovery caches
 */
export function clearDiscoveryCache() {
  basesCache = {};
  lastBasesRefresh = 0;
  productsCache = [];
  lastProductsRefresh = 0;
  console.log('🗑️ Discovery cache cleared');
}

/**
 * Get cache status
 * @returns {Object} Cache status information
 */
export function getCacheStatus() {
  const now = new Date().getTime();
  
  return {
    bases: {
      count: Object.keys(basesCache).length,
      lastRefresh: lastBasesRefresh,
      age: now - lastBasesRefresh,
      isStale: (now - lastBasesRefresh) > BASE_CONFIG.BASE_CACHE_TIMEOUT
    },
    products: {
      count: productsCache.length,
      lastRefresh: lastProductsRefresh,
      age: now - lastProductsRefresh,
      isStale: (now - lastProductsRefresh) > BASE_CONFIG.PRODUCT_CACHE_TIMEOUT
    }
  };
}

/**
 * Force refresh of discovery data
 * @returns {Promise<Object>} Fresh discovery data
 */
export async function forceRefreshDiscovery() {
  console.log('🔄 Force refreshing discovery data...');
  clearDiscoveryCache();
  
  const bases = await getAvailableBases({ useCache: false });
  const products = await getProductsFromBases({ useCache: false });
  
  return { bases, products };
}