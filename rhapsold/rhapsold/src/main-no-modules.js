/**
 * Rhapsold - Main Application Entry Point (No ES6 Modules)
 * A minimalist blogging platform using SVG components
 */

// Wait for environment configuration to load, then initialize app-specific controls
document.addEventListener('DOMContentLoaded', async () => {
  // Check if shared environment functions are available
  if (typeof window.PlanetNineEnvironment !== 'undefined') {
    console.log('✅ Shared environment configuration loaded');
    
    // Use the shared environment functions
    window.getEnvironmentConfig = window.PlanetNineEnvironment.getEnvironmentConfig;
    window.getServiceUrl = window.PlanetNineEnvironment.getServiceUrl;
    
    // Initialize Rhapsold-specific environment controls
    window.PlanetNineEnvironment.initializeEnvironmentControls('rhapsold');
    
  } else {
    console.error('❌ Shared environment configuration not available');
    
    // Fallback basic functions
    window.getEnvironmentConfig = () => ({
      env: 'dev',
      services: {
        sanora: 'https://dev.sanora.allyabase.com/',
        bdo: 'https://dev.bdo.allyabase.com/',
        dolores: 'https://dev.dolores.allyabase.com/'
      }
    });
    window.getServiceUrl = (service) => window.getEnvironmentConfig().services[service];
  }
  
  // Initialize environment from backend first
  await initializeEnvironmentFromBackend();
  
  console.log(`📝 Rhapsold initialized with environment: ${getEnvironmentConfig().env}`);
  
  // Debug: Show current environment configuration
  const envConfig = getEnvironmentConfig();
  console.log('🌍 Frontend Environment Config:', {
    env: envConfig.env,
    services: envConfig.services
  });
  
  // Debug: Call backend to show backend environment info
  if (typeof window.__TAURI__ !== 'undefined') {
    console.log('🔧 Tauri detected, calling backend for environment info...');
    window.__TAURI__.core.invoke('get_environment_info')
      .then(backendInfo => {
        console.log('🎭 Backend Environment Info:', backendInfo);
      })
      .catch(err => {
        console.error('❌ Failed to get backend environment info:', err);
      });
    
    // Also test a Sanora call with current environment
    const sanoraUrl = getServiceUrl('sanora');
    console.log(`🔗 Testing Sanora connection to: ${sanoraUrl}`);
    
    window.__TAURI__.core.invoke('create_sanora_user', { sanoraUrl })
      .then(user => {
        console.log('✅ Sanora user creation successful:', user);
        
        // Now try to get the user data 
        return window.__TAURI__.core.invoke('get_sanora_user', { 
          uuid: user.uuid, 
          sanoraUrl 
        });
      })
      .then(userData => {
        console.log('✅ Sanora user data retrieved:', userData);
      })
      .catch(err => {
        console.error('❌ Sanora connection failed:', err);
        console.log('💡 This is expected if Sanora service is not running');
      });
      
  } else {
    console.log('🌐 Running in web mode, Tauri backend not available');
  }
  
  // After environment setup, initialize the app with real data loading
  initializeRhapsoldApp();
});

// Initialize environment from backend RHAPSOLD_ENV variable (like ninefy pattern)
async function initializeEnvironmentFromBackend() {
  try {
    if (typeof window.__TAURI__ !== 'undefined') {
      console.log('🔧 Getting environment from backend...');
      const envFromBackend = await window.__TAURI__.core.invoke('get_env_config');
      if (envFromBackend && ['dev', 'test', 'local'].includes(envFromBackend)) {
        console.log(`🌍 Environment from backend: ${envFromBackend}`);
        localStorage.setItem('nullary-env', envFromBackend);
        return envFromBackend;
      } else {
        console.log(`⚠️ Unknown environment from backend: ${envFromBackend}, using default`);
      }
    }
  } catch (error) {
    console.log('⚠️ Could not get environment from backend, using localStorage/default');
    console.error('Backend environment error:', error);
  }
  
  return localStorage.getItem('nullary-env') || 'dev';
}

// Get home base URL based on current environment
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

// Base Management Functions (adapted from ninefy pattern)
async function connectToHomeBase() {
  try {
    const homeBaseUrl = getHomeBaseUrl();
    console.log('🏠 Connecting to home base:', homeBaseUrl);
    
    // Create BDO user on home base
    const bdoUser = await window.__TAURI__.core.invoke('create_bdo_user');
    console.log('✅ BDO user created:', bdoUser);
    
    return {
      name: 'DEV',
      description: 'Development base for Rhapsold blog reader',
      dns: {
        bdo: homeBaseUrl,
        sanora: getServiceUrl('sanora'),
        dolores: getServiceUrl('dolores'),
        addie: getServiceUrl('addie'),
        fount: getServiceUrl('fount')
      },
      users: { bdo: bdoUser },
      joined: true,
      uuid: bdoUser.uuid || 'home-base-uuid'
    };
  } catch (err) {
    console.error('❌ Failed to connect to home base:', err);
    return null;
  }
}

async function fetchBasesFromBDO() {
  try {
    const homeBase = await connectToHomeBase();
    if (!homeBase) return {};
    
    const bdoUser = homeBase.users.bdo;
    const updatedBases = await window.__TAURI__.core.invoke('get_bases', {
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
  const CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  
  if (basesCache && (now - lastBaseRefresh < CACHE_TIMEOUT)) {
    console.log('📦 Using cached bases');
    return basesCache;
  }
  
  console.log('🔄 Refreshing bases cache...');
  const bases = await fetchBasesFromBDO();
  
  basesCache = bases;
  lastBaseRefresh = now;
  
  return bases;
}

// Initialize the main Rhapsold application with real data loading
async function initializeRhapsoldApp() {
  console.log('🚀 Initializing Rhapsold application...');
  
  if (typeof window.__TAURI__ !== 'undefined') {
    console.log('🔗 Tauri mode: Loading real blog data from bases');
    await loadBlogPostsFromBases();
  } else {
    console.log('🌐 Web mode: Using sample blog data');
    // Initialize with sample data for web mode
  }
}

// Load blog posts from all available bases (like ninefy's getProductsFromBases)
async function loadBlogPostsFromBases() {
  console.log('📚 Loading blog posts from all available bases...');
  
  try {
    // Get available bases using the proper bootstrapping pattern
    const bases = await getAvailableBases();
    console.log('🏗️ Available bases:', Object.keys(bases).length, bases);
    
    if (!bases || Object.keys(bases).length === 0) {
      console.log('⚠️ No bases available, using sample data');
      return;
    }
    
    // Load blog posts from each base
    const allBlogPosts = [];
    
    for (const [baseId, base] of Object.entries(bases)) {
      if (!base.dns?.sanora) {
        console.log(`⚠️ Base ${base.name} has no sanora service, skipping`);
        continue;
      }
      
      try {
        console.log(`📖 Fetching blog posts from ${base.name} at ${base.dns.sanora}`);
        
        // Use the new get_all_base_products function to get blog posts
        const products = await window.__TAURI__.core.invoke('get_all_base_products', {
          sanoraUrl: base.dns.sanora
        });
        
        console.log(`📄 Raw products/blogs from ${base.name}:`, products);
        
        if (Array.isArray(products)) {
          // Convert products to blog post format
          const blogPosts = products.map(p => normalizeBlogPost(p, baseId, base.name, base.dns.sanora));
          allBlogPosts.push(...blogPosts);
          console.log(`✅ Added ${products.length} blog posts from ${base.name}`);
        } else if (products && typeof products === 'object') {
          const productArray = Object.values(products);
          const blogPosts = productArray.map(p => normalizeBlogPost(p, baseId, base.name, base.dns.sanora));
          allBlogPosts.push(...blogPosts);
          console.log(`✅ Added ${productArray.length} blog posts from ${base.name}`);
        } else {
          console.log(`⚠️ No blog posts or unknown format from ${base.name}:`, products);
        }
      } catch (err) {
        console.warn(`⚠️ Failed to get blog posts from ${base.name}:`, err);
      }
    }
    
    console.log(`📚 Total blog posts loaded: ${allBlogPosts.length}`);
    
    if (allBlogPosts.length > 0) {
      // Replace the sample data with real blog posts
      replaceSampleBlogPosts(allBlogPosts);
    } else {
      console.log('📝 No blog posts found, keeping sample data');
      // Still fetch teleported content even if no blogs found
      console.log('🔄 Fetching teleported content anyway...');
      fetchTeleportedContentFromBases();
    }
    
  } catch (error) {
    console.error('❌ Failed to load blog posts from bases:', error);
    console.log('📝 Continuing with sample data');
    // Still try to fetch teleported content
    console.log('🔄 Attempting teleported content fetch despite blog loading error...');
    fetchTeleportedContentFromBases();
  }
}

// Convert a Sanora product to blog post format
function normalizeBlogPost(product, baseId, baseName, baseUrl) {
  return {
    id: product.uuid || product.id || `${baseId}-${Date.now()}`,
    title: product.title || 'Untitled Post',
    excerpt: product.description ? product.description.substring(0, 200) + '...' : 'No description available',
    description: product.description || 'No description available',
    author: product.author || baseName,
    date: product.created_at || product.date || new Date().toISOString(),
    readTime: Math.max(1, Math.floor((product.description || '').length / 250)), // Estimate reading time
    image: product.image || product.preview_image || null,
    content: product.content || product.description || 'Content not available',
    tags: product.tags || ['blog'],
    published: true,
    baseId: baseId,
    baseName: baseName,
    baseUrl: baseUrl,
    originalProduct: product // Keep original for reference
  };
}

// Replace the sample blog posts with real ones loaded from bases
function replaceSampleBlogPosts(realBlogPosts) {
  console.log('🔄 Replacing sample blog posts with real data...');
  
  // Store the real blog posts globally
  window.realBlogPosts = realBlogPosts;
  console.log('📚 Real blog posts ready:', realBlogPosts);
  
  // Update the UI with real blog posts
  updateBlogPostsInUI(realBlogPosts);
  
  // Also fetch teleported content from all bases
  console.log('🔄 Triggering teleported content fetch...');
  fetchTeleportedContentFromBases();
}

// Update the blog posts UI with real data
function updateBlogPostsInUI(blogPosts) {
  const postsContainer = document.getElementById('posts-container');
  if (!postsContainer) return;
  
  console.log('🎨 Updating blog posts UI with real data...');
  postsContainer.innerHTML = '';
  
  blogPosts.forEach(post => {
    const postElement = createBlogPost(post);
    postsContainer.appendChild(postElement);
  });
  
  console.log(`✅ Updated UI with ${blogPosts.length} real blog posts`);
}

/**
 * Get the base pubKey from Sanora user object for teleportation
 */
async function getBasePubKeyForTeleportation(baseUrl) {
  try {
    if (typeof window.__TAURI__ !== 'undefined') {
      console.log('🔑 Getting basePubKey from Sanora user...');
      
      // Create a Sanora user to get the base's pubKey
      const sanoraUser = await window.__TAURI__.core.invoke('create_sanora_user', { sanoraUrl: baseUrl });
      console.log('🔍 Debug - Full sanoraUser object:', sanoraUser);
      
      // Check both possible field names due to serialization differences
      const basePubKey = sanoraUser.basePubKey || sanoraUser.base_pub_key;
      if (sanoraUser && basePubKey) {
        console.log('✅ Got basePubKey from Sanora:', basePubKey);
        return basePubKey;
      }
      
      console.warn('⚠️ No basePubKey in Sanora user, falling back to direct key retrieval');
      // Note: rhapsold doesn't have get_public_key function, so we use fallback
    }
  } catch (error) {
    console.warn('⚠️ Failed to get basePubKey from Sanora:', error);
  }
  
  // Fallback pubKey (matches the default private key)
  return '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd';
}

// Fetch teleported content from all available bases (following ninefy pattern)
async function fetchTeleportedContentFromBases() {
  console.log('🌐 Fetching teleported content from all bases...');
  
  try {
    if (typeof window.__TAURI__ === 'undefined') {
      console.log('⚠️ Tauri not available, using dummy teleported content');
      return;
    }
    
    const bases = await getAvailableBases();
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
        if (typeof window.__TAURI__ !== 'undefined') {
          console.log('🦀 Using Tauri backend for teleportation');
          
          const teleportedData = await window.__TAURI__.core.invoke('teleport_content', {
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
    
    if (allTeleportedContent.length > 0) {
      updateTeleportedContentInUI(allTeleportedContent);
    } else {
      console.log('📄 No teleported content found, keeping placeholder data');
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch teleported content:', error);
  }
}

/**
 * Process teleported data from BDO (following ninefy pattern)
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
    
    // Convert teleportal elements to content objects (adapted for blog context)
    contentArray = Array.from(teleportals).map(portal => {
      const item = {
        id: portal.getAttribute('id') || `teleported-${Date.now()}`,
        type: portal.getAttribute('category') || 'product',
        title: portal.querySelector('title')?.textContent || 'Untitled',
        description: portal.querySelector('description')?.textContent || 'No description',
        url: portal.querySelector('url')?.textContent || '#',
        price: portal.getAttribute('price') ? `$${(parseInt(portal.getAttribute('price')) / 100).toFixed(2)}` : null,
        image: portal.querySelector('img')?.textContent || portal.querySelector('image')?.textContent || null,
        tags: (portal.querySelector('tags')?.textContent || '').split(',').filter(t => t.trim()),
        inStock: portal.querySelector('in-stock')?.textContent === 'true',
        rating: portal.querySelector('rating')?.textContent || '0',
        source: baseName,
        baseName: baseName,
        baseId: baseId,
        baseUrl: baseUrl,
        timestamp: new Date().toISOString()
      };
      
      console.log('📦 Extracted item from teleportal:', item);
      return item;
    });
  } else if (teleportedData.content && Array.isArray(teleportedData.content)) {
    contentArray = teleportedData.content;
  } else if (teleportedData.products && Array.isArray(teleportedData.products)) {
    contentArray = teleportedData.products;
  } else {
    console.warn('⚠️ No recognized content format in teleported data');
  }
  
  console.log(`✅ Processed ${contentArray.length} teleported items from ${baseName}`);
  return contentArray;
}

// Parse teleportable HTML content to extract teleport items
function parseTeleportableHTML(html, baseId, baseName) {
  const items = [];
  
  try {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Look for teleportable elements (Sanora uses <teleportal> elements)
    const teleportElements = tempDiv.querySelectorAll('teleportal, [data-teleport], .teleportable, teleport');
    console.log(`🔎 Found ${teleportElements.length} teleportable elements:`, teleportElements);
    
    teleportElements.forEach((element, index) => {
      let title = 'Untitled';
      let description = 'No description';
      let url = '#';
      let price = null;
      
      // Parse <teleportal> elements (Sanora format)
      if (element.tagName === 'TELEPORTAL') {
        title = element.querySelector('title')?.textContent || element.dataset.title || title;
        description = element.querySelector('description')?.textContent || element.dataset.description || description;
        url = element.querySelector('url')?.textContent || element.dataset.url || url;
        price = element.getAttribute('price') || element.dataset.price;
      } else {
        // Fallback for other formats
        title = element.dataset.title || element.querySelector('h1, h2, h3, title')?.textContent || title;
        description = element.dataset.description || element.querySelector('p, description')?.textContent || description;
        url = element.dataset.url || element.querySelector('url')?.textContent || element.href || url;
        price = element.dataset.price;
      }
      
      const item = {
        id: element.id || `${baseId}-teleport-${index}`,
        type: element.getAttribute('category') || element.dataset.type || 'product',
        title: title,
        description: description,
        url: url,
        price: price ? `$${(parseInt(price) / 100).toFixed(2)}` : null,
        source: baseName,
        baseName: baseName,
        baseId: baseId,
        timestamp: new Date().toISOString()
      };
      items.push(item);
    });
    
    // If no structured teleport elements found, try to extract product-like content
    if (items.length === 0) {
      const productElements = tempDiv.querySelectorAll('[data-product], .product, .blog-post');
      productElements.forEach((element, index) => {
        const item = {
          id: `${baseId}-product-${index}`,
          type: 'product',
          title: element.dataset.title || element.querySelector('h1, h2, h3')?.textContent || `Content from ${baseName}`,
          description: element.dataset.description || element.querySelector('p')?.textContent || 'Discovered content',
          url: element.dataset.url || '#',
          source: baseName,
          baseName: baseName,
          baseId: baseId,
          timestamp: new Date().toISOString()
        };
        items.push(item);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to parse teleportable HTML:', error);
  }
  
  return items;
}

// Update teleported content UI with real data
function updateTeleportedContentInUI(teleportedItems) {
  const teleportedContainer = document.getElementById('teleported-container');
  if (!teleportedContainer) return;
  
  console.log('🎨 Updating teleported content UI with real data...');
  teleportedContainer.innerHTML = '';
  
  teleportedItems.forEach(item => {
    const teleportedElement = createTeleportedItem(item);
    teleportedContainer.appendChild(teleportedElement);
  });
  
  console.log(`✅ Updated UI with ${teleportedItems.length} real teleported items`);
}

// Simple SVG data URLs (URL-encoded instead of base64 to avoid btoa issues)
const SVG_IMAGES = {
  decentralizedNetwork: "data:image/svg+xml,%3Csvg width='600' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233498db;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%232980b9;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='300' fill='url(%23grad1)'/%3E%3Ccircle cx='150' cy='100' r='30' fill='%23ffffff' opacity='0.8'/%3E%3Ccircle cx='450' cy='80' r='25' fill='%23ffffff' opacity='0.8'/%3E%3Ccircle cx='300' cy='150' r='35' fill='%23ffffff' opacity='0.9'/%3E%3Cline x1='150' y1='100' x2='300' y2='150' stroke='%23ffffff' stroke-width='2' opacity='0.6'/%3E%3Ctext x='300' y='250' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='24' font-weight='bold'%3EDecentralized Network%3C/text%3E%3C/svg%3E",
  
  blogFeatured: "data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='200' fill='%233498db'/%3E%3Cpolygon points='100,50 150,100 100,150 50,100' fill='%23ffffff' opacity='0.9'/%3E%3Cpolygon points='300,40 360,100 300,160 240,100' fill='%23ffffff' opacity='0.8'/%3E%3Crect x='180' y='80' width='40' height='40' fill='%23ffffff' opacity='0.7' rx='5'/%3E%3Ccircle cx='200' cy='100' r='15' fill='%233498db'/%3E%3Ctext x='200' y='180' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='16' font-weight='bold'%3EBlog%3C/text%3E%3C/svg%3E",
  
  cryptoKeys: "data:image/svg+xml,%3Csvg width='600' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='600' height='300' fill='%23e74c3c'/%3E%3Crect x='100' y='100' width='80' height='60' fill='%23ffffff' opacity='0.9' rx='8'/%3E%3Crect x='420' y='120' width='80' height='60' fill='%23ffffff' opacity='0.9' rx='8'/%3E%3Ctext x='140' y='135' text-anchor='middle' fill='%23e74c3c' font-family='Arial' font-size='12' font-weight='bold'%3EPrivate%3C/text%3E%3Ctext x='460' y='155' text-anchor='middle' fill='%23e74c3c' font-family='Arial' font-size='12' font-weight='bold'%3EPublic%3C/text%3E%3Ctext x='300' y='250' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='24' font-weight='bold'%3ECryptographic Keys%3C/text%3E%3C/svg%3E",
  
  authFeatured: "data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='200' fill='%23e74c3c'/%3E%3Ccircle cx='120' cy='100' r='30' fill='%23ffffff' opacity='0.8'/%3E%3Crect x='250' y='70' width='100' height='60' fill='%23ffffff' opacity='0.9' rx='10'/%3E%3Ctext x='200' y='170' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='16' font-weight='bold'%3ESecure Auth%3C/text%3E%3C/svg%3E",
  
  svgGraphics: "data:image/svg+xml,%3Csvg width='600' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='600' height='300' fill='%23f39c12'/%3E%3Crect x='50' y='50' width='120' height='80' fill='%23ffffff' opacity='0.9' rx='15'/%3E%3Ccircle cx='380' cy='100' r='45' fill='%23ffffff' opacity='0.9'/%3E%3Cpolygon points='450,60 500,90 500,130 450,160 400,130 400,90' fill='%23ffffff' opacity='0.8'/%3E%3Ctext x='300' y='270' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='24' font-weight='bold'%3ESVG Interface Design%3C/text%3E%3C/svg%3E",
  
  svgFeatured: "data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='200' fill='%23f39c12'/%3E%3Crect x='50' y='40' width='60' height='60' fill='%23ffffff' opacity='0.9' rx='10'/%3E%3Ccircle cx='180' cy='70' r='30' fill='%23ffffff' opacity='0.8'/%3E%3Cpolygon points='280,40 320,60 320,100 280,120 240,100 240,60' fill='%23ffffff' opacity='0.9'/%3E%3Ctext x='200' y='180' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='16' font-weight='bold'%3ESVG UI%3C/text%3E%3C/svg%3E"
};

// Teleported content data
const TELEPORTED_CONTENT = [
  {
    id: 'tp-1',
    type: 'link',
    title: 'Planet Nine Ecosystem Overview',
    description: 'Comprehensive guide to the decentralized web infrastructure',
    url: 'https://planet-nine.org/overview',
    source: 'planet-nine.org',
    timestamp: '2025-01-28T08:00:00Z'
  },
  {
    id: 'tp-2', 
    type: 'image',
    title: 'Allyabase Architecture Diagram',
    description: 'Visual representation of the microservices ecosystem',
    imageUrl: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%233498db'/%3E%3Crect x='50' y='50' width='80' height='40' fill='%23ffffff' opacity='0.9' rx='5'/%3E%3Crect x='160' y='70' width='80' height='40' fill='%23ffffff' opacity='0.9' rx='5'/%3E%3Crect x='270' y='50' width='80' height='40' fill='%23ffffff' opacity='0.9' rx='5'/%3E%3Ctext x='90' y='75' text-anchor='middle' fill='%233498db' font-family='Arial' font-size='10' font-weight='bold'%3EBDO%3C/text%3E%3Ctext x='200' y='95' text-anchor='middle' fill='%233498db' font-family='Arial' font-size='10' font-weight='bold'%3ESanora%3C/text%3E%3Ctext x='310' y='75' text-anchor='middle' fill='%233498db' font-family='Arial' font-size='10' font-weight='bold'%3EDolores%3C/text%3E%3Ctext x='200' y='200' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='16' font-weight='bold'%3EAllyabase%3C/text%3E%3C/svg%3E",
    source: 'engineering.allyabase.com',
    timestamp: '2025-01-27T15:30:00Z'
  },
  {
    id: 'tp-3',
    type: 'video',
    title: 'Sessionless Demo: Authentication Without Passwords',
    description: '5-minute technical demonstration',
    videoUrl: 'https://example.com/sessionless-demo.mp4',
    thumbnail: "data:image/svg+xml,%3Csvg width='400' height='225' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='225' fill='%23e74c3c'/%3E%3Ccircle cx='200' cy='112' r='30' fill='%23ffffff' opacity='0.9'/%3E%3Cpolygon points='190,102 190,122 210,112' fill='%23e74c3c'/%3E%3Ctext x='200' y='180' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='14' font-weight='bold'%3EVideo Demo%3C/text%3E%3C/svg%3E",
    source: 'tech.sessionless.org',
    duration: '5:23',
    timestamp: '2025-01-26T12:45:00Z'
  },
  {
    id: 'tp-4',
    type: 'link',
    title: 'SVG Animation Techniques',
    description: 'Advanced techniques for smooth SVG animations',
    url: 'https://svg-tricks.dev/animations',
    source: 'svg-tricks.dev',
    timestamp: '2025-01-25T14:20:00Z'
  },
  {
    id: 'tp-5',
    type: 'code',
    title: 'Rust + Tauri Boilerplate',
    description: 'Starter template for cross-platform apps',
    codePreview: 'fn main() {\n    tauri::Builder::default()\n        .run(tauri::generate_context!())\n        .expect("error while running tauri application");\n}',
    source: 'github.com/tauri-apps',
    language: 'rust',
    timestamp: '2025-01-24T16:15:00Z'
  }
];

// Mock data removed - now using real Sanora service calls for blog posts

// Application state
const appState = {
  currentScreen: 'main',
  currentTheme: {
    colors: {
      primary: '#2c3e50',
      secondary: '#7f8c8d', 
      accent: '#3498db',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#2c3e50',
      border: '#ecf0f1'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.6,
      headerSize: 32,
      postTitleSize: 24
    }
  },
  currentPost: null,
  posts: [],
  isLoading: true
};

/**
 * Create teleported content item
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
  
  // Price (if available)
  let priceElement = null;
  if (item.price) {
    priceElement = document.createElement('div');
    priceElement.textContent = item.price;
    priceElement.style.cssText = `
      font-size: 14px;
      font-weight: bold;
      color: ${appState.currentTheme.colors.accent};
      margin-bottom: 8px;
    `;
  }

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
  if (priceElement) {
    container.appendChild(priceElement);
  }
  container.appendChild(source);

  return container;
}

/**
 * Simple markdown parser
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
  html = html.replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #3498db; margin: 12px 0; padding: 8px 16px; background: #f8f9fa; font-style: italic; color: #555;">$1</blockquote>');
  
  // Lists
  html = html.replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul style="margin: 12px 0; padding-left: 20px;">$1</ul>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6;">');
  html = '<p style="margin: 12px 0; line-height: 1.6;">' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/g, '');
  
  return html;
}

/**
 * Create blog post card with enhanced metadata
 */
function createBlogPost(post) {
  const postContainer = document.createElement('div');
  postContainer.className = 'blog-post';
  postContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  // Post metadata header
  const metaHeader = document.createElement('div');
  metaHeader.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  
  const authorDate = document.createElement('span');
  authorDate.textContent = `by ${post.author} • ${new Date(post.timestamp).toLocaleDateString()}`;
  
  const readTime = document.createElement('span');
  readTime.textContent = post.readTime;
  
  metaHeader.appendChild(authorDate);
  metaHeader.appendChild(readTime);
  
  // Create title
  const titleElement = document.createElement('h2');
  titleElement.textContent = post.title;
  titleElement.style.cssText = `
    margin: 0 0 12px 0;
    color: ${appState.currentTheme.colors.primary};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.postTitleSize}px;
    line-height: 1.3;
  `;
  
  // Featured image if available
  if (post.featuredImage) {
    const imageElement = document.createElement('img');
    imageElement.src = post.featuredImage;
    imageElement.style.cssText = `
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    `;
    postContainer.appendChild(imageElement);
  }
  
  // Create content preview (first 150 characters, strip markdown)
  const strippedContent = post.content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/[#*`>\-]/g, '').trim();
  const contentPreview = strippedContent.length > 150 
    ? strippedContent.substring(0, 150) + '...'
    : strippedContent;
    
  const contentElement = document.createElement('div');
  contentElement.textContent = contentPreview;
  contentElement.style.cssText = `
    color: ${appState.currentTheme.colors.text};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 12px;
  `;
  
  // Tags
  if (post.tags && post.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;
    
    post.tags.forEach(tag => {
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
    
    postContainer.appendChild(tagsContainer);
  }
  
  // Add click handler to view in reading mode
  postContainer.addEventListener('click', () => {
    appState.currentPost = post;
    navigateToScreen('reading');
  });
  
  postContainer.addEventListener('mouseenter', () => {
    postContainer.style.transform = 'translateY(-2px)';
    postContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });
  
  postContainer.addEventListener('mouseleave', () => {
    postContainer.style.transform = 'translateY(0)';
    postContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });
  
  postContainer.appendChild(metaHeader);
  postContainer.appendChild(titleElement);
  postContainer.appendChild(contentElement);
  
  return postContainer;
}

/**
 * Create HUD Navigation
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
  logo.textContent = '🎭 Rhapsold';
  
  // Center - Navigation buttons
  const nav = document.createElement('div');
  nav.style.cssText = `
    display: flex;
    gap: 10px;
  `;
  
  const screens = [
    { id: 'main', label: '📄 Main', title: 'Blog List' },
    { id: 'reading', label: '📖 Reading', title: 'Reading Mode' },
    { id: 'new-post', label: '✏️ New Post', title: 'Create Post' },
    { id: 'base', label: '🌐 Base', title: 'Server Management' }
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
  const screens = ['main', 'new-post', 'reading', 'base'];
  
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
 * Create Main Screen (Blog List with Teleported Column)
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
  
  // Left column - Blog posts (2/3 width)
  const postsColumn = document.createElement('div');
  postsColumn.className = 'posts-column';
  postsColumn.style.cssText = `
    flex: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Posts header
  const postsHeader = document.createElement('div');
  postsHeader.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid ${appState.currentTheme.colors.background};
  `;
  postsHeader.innerHTML = `
    <h1 style="
      margin: 0 0 8px 0;
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 2rem;
      font-weight: 600;
    ">Latest Posts</h1>
    <p style="
      margin: 0;
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
    ">Discover the latest thoughts and insights from the community</p>
  `;
  
  // Posts container with scrolling
  const postsContainer = document.createElement('div');
  postsContainer.id = 'posts-container';
  postsContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  `;
  
  // Custom scrollbar styling
  const scrollbarStyle = document.createElement('style');
  scrollbarStyle.textContent = `
    #posts-container::-webkit-scrollbar {
      width: 8px;
    }
    #posts-container::-webkit-scrollbar-track {
      background: ${appState.currentTheme.colors.background};
      border-radius: 4px;
    }
    #posts-container::-webkit-scrollbar-thumb {
      background: ${appState.currentTheme.colors.secondary};
      border-radius: 4px;
    }
    #posts-container::-webkit-scrollbar-thumb:hover {
      background: ${appState.currentTheme.colors.primary};
    }
  `;
  document.head.appendChild(scrollbarStyle);
  
  postsColumn.appendChild(postsHeader);
  postsColumn.appendChild(postsContainer);
  
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
    ">Content discovered across the network</p>
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
  
  screen.appendChild(postsColumn);
  screen.appendChild(teleportedColumn);
  
  return screen;
}

/**
 * Create simple blog form
 */
function createBlogForm() {
  const formContainer = document.createElement('div');
  formContainer.className = 'blog-form';
  formContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 30px;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  // Title input
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Post title...';
  titleInput.id = 'post-title';
  titleInput.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.postTitleSize}px;
    font-weight: bold;
  `;
  
  // Content textarea
  const contentTextarea = document.createElement('textarea');
  contentTextarea.placeholder = 'Write your post content here...\n\nMarkdown supported:\n• **bold** and *italic*\n• # Headers\n• ![Image](url)\n• `code` and ```code blocks```\n• > blockquotes\n• - lists';
  contentTextarea.id = 'post-content';
  contentTextarea.rows = 10;
  contentTextarea.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.fontSize}px;
    line-height: ${appState.currentTheme.typography.lineHeight};
    resize: vertical;
  `;
  
  // Markdown help text
  const markdownHelp = document.createElement('div');
  markdownHelp.style.cssText = `
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
    margin-bottom: 15px;
    font-style: italic;
  `;
  markdownHelp.innerHTML = `
    💡 <strong>Markdown supported:</strong> **bold**, *italic*, # headers, ![images](url), \`code\`, > quotes, - lists
  `;
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Create Post';
  submitButton.style.cssText = `
    background: ${appState.currentTheme.colors.accent};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    cursor: pointer;
    margin-right: 10px;
  `;
  
  // Clear button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.style.cssText = `
    background: ${appState.currentTheme.colors.secondary};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    cursor: pointer;
  `;
  
  // Add event handlers
  submitButton.addEventListener('click', function() {
    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();
    
    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }
    
    // Create post data object
    const postData = {
      id: Date.now().toString(),
      title: title,
      content: content,
      author: 'You',
      timestamp: new Date().toISOString(),
      readTime: Math.ceil(content.split(' ').length / 200) + ' min read',
      tags: ['user-generated']
    };
    
    // Save to localStorage
    const currentPosts = JSON.parse(localStorage.getItem('rhapsold-posts') || '[]');
    currentPosts.unshift(postData);
    localStorage.setItem('rhapsold-posts', JSON.stringify(currentPosts));
    
    // Clear form
    titleInput.value = '';
    contentTextarea.value = '';
    
    // Navigate back to main screen (this will reload the posts)
    navigateToScreen('main');
    
    console.log('✅ Post created:', postData);
  });
  
  clearButton.addEventListener('click', function() {
    titleInput.value = '';
    contentTextarea.value = '';
  });
  
  // Append elements
  formContainer.appendChild(titleInput);
  formContainer.appendChild(contentTextarea);
  formContainer.appendChild(markdownHelp);
  formContainer.appendChild(submitButton);
  formContainer.appendChild(clearButton);
  
  return formContainer;
}

/**
 * Create New Post Screen
 */
function createNewPostScreen() {
  const screen = document.createElement('div');
  screen.id = 'new-post-screen';
  screen.className = 'screen';
  
  // Create header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1 style="
      text-align: center;
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 20px;
      font-size: 2rem;
    ">Create New Post</h1>
    <p style="
      text-align: center;
      color: ${appState.currentTheme.colors.secondary};
      margin-bottom: 30px;
    ">Write and publish your blog post (Markdown supported)</p>
  `;
  
  // Create form
  const formContainer = createBlogForm();
  
  screen.appendChild(header);
  screen.appendChild(formContainer);
  
  return screen;
}

/**
 * Create Reading Screen
 */
function createReadingScreen() {
  const screen = document.createElement('div');
  screen.id = 'reading-screen';
  screen.className = 'screen';
  
  if (appState.currentPost) {
    // Display the selected post
    const postContainer = document.createElement('div');
    postContainer.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.8;
    `;
    
    // Post title
    const title = document.createElement('h1');
    title.textContent = appState.currentPost.title;
    title.style.cssText = `
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: ${appState.currentTheme.typography.headerSize}px;
      margin-bottom: 30px;
      line-height: 1.3;
    `;
    
    // Post content (with markdown parsing)
    const content = document.createElement('div');
    content.innerHTML = parseMarkdown(appState.currentPost.content);
    content.style.cssText = `
      color: ${appState.currentTheme.colors.text};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 18px;
      line-height: 1.8;
      margin-bottom: 30px;
    `;
    
    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back to Main';
    backButton.style.cssText = `
      background: ${appState.currentTheme.colors.secondary};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 16px;
      margin-top: 20px;
    `;
    backButton.addEventListener('click', () => {
      appState.currentPost = null;
      navigateToScreen('main');
    });
    
    postContainer.appendChild(title);
    postContainer.appendChild(content);
    postContainer.appendChild(backButton);
    screen.appendChild(postContainer);
  } else {
    // No post selected
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
        ">📖 Reading Mode</h1>
        <p>Select a post from the Main screen to read it here.</p>
      </div>
    `;
  }
  
  return screen;
}

/**
 * Create base server card
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
 * Create Base Screen (Server Management)
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
  
  // Load real base data using shared base-command pattern
  loadBasesIntoContainer(basesContainer);
  
  screen.appendChild(header);
  screen.appendChild(basesContainer);
  
  return screen;
}

/**
 * Load real base data into container (following shared base-command pattern)
 */
async function loadBasesIntoContainer(container) {
  try {
    console.log('🏗️ Loading real base data...');
    
    // Try to get bases from Tauri backend first  
    let bases = [];
    
    if (typeof window.__TAURI__ !== 'undefined') {
      try {
        console.log('🔗 Getting bases from backend...');
        
        // Try to get real bases from backend
        bases = await window.__TAURI__.core.invoke('get_bases');
        
        if (bases && bases.length > 0) {
          console.log(`✅ Loaded ${bases.length} bases from backend`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to get bases from backend:', error);
      }
    }
    
    // Fallback to environment-based base configuration
    if (!bases || bases.length === 0) {
      const envConfig = getEnvironmentConfig();
      bases = [
        {
          name: `${envConfig.env.toUpperCase()} Environment`,
          description: `Current environment: ${envConfig.env}`,
          connected: true,
          services: {
            sanora: getServiceUrl('sanora'),
            bdo: getServiceUrl('bdo'),
            dolores: getServiceUrl('dolores')
          }
        }
      ];
      console.log(`📋 Using fallback base configuration for ${envConfig.env} environment`);
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (bases.length === 0) {
      // Show professional empty state
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; color: #4a5568;">
          <div style="font-size: 64px; margin-bottom: 20px;">🌐</div>
          <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 24px;">No Base Servers Found</h3>
          <p style="margin: 0; color: #718096; line-height: 1.6; max-width: 400px; margin: 0 auto;">
            Base servers will appear here when connected to the Planet Nine network.
          </p>
          <div style="margin-top: 30px; padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
            <small style="color: #4a5568;">💡 <strong>Tip:</strong> Make sure you're connected to the Planet Nine network and services are running.</small>
          </div>
        </div>
      `;
      return;
    }
    
    // Render base cards
    bases.forEach(base => {
      // Convert backend format to UI format
      const baseData = {
        name: base.name || 'Unknown Base',
        url: base.services?.sanora || base.url || '#',
        status: base.connected ? 'connected' : 'available',
        type: base.type || 'unknown',
        services: Array.isArray(base.services) ? base.services : Object.keys(base.services || {}),
        description: base.description || 'Planet Nine base server',
        users: base.users || 1,
        uptime: base.uptime || '99.9%'
      };
      
      const baseCard = createBaseCard(baseData);
      container.appendChild(baseCard);
    });
    
    console.log(`🎨 Rendered ${bases.length} base cards`);
    
  } catch (error) {
    console.error('❌ Failed to load bases:', error);
    
    // Show error state
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 40px; color: #e53e3e;">
        <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
        <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 24px;">Error Loading Base Servers</h3>
        <p style="margin: 0; color: #718096; line-height: 1.6; max-width: 400px; margin: 0 auto;">
          Unable to load base server information. Please check your connection and try again.
        </p>
      </div>
    `;
  }
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
      // Load posts after screen is added to DOM
      setTimeout(async () => {
        await loadPosts();
        // Also try to load teleported content directly 
        console.log('🌐 Loading teleported content from main screen...');
        fetchTeleportedContentFromBases();
      }, 10);
      break;
    case 'new-post':
      screen = createNewPostScreen();
      break;
    case 'reading':
      screen = createReadingScreen();
      break;
    case 'base':
      screen = createBaseScreen();
      break;
    default:
      screen = createMainScreen();
      appState.currentScreen = 'main';
  }
  
  contentContainer.appendChild(screen);
}

/**
 * Load posts from real Sanora service and localStorage
 */
async function loadPosts() {
  console.log('📄 Loading posts from real Sanora service...');
  
  try {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    // Clear existing content
    postsContainer.innerHTML = '';
    
    // Load blog posts from both localStorage and real Sanora service
    const localPosts = JSON.parse(localStorage.getItem('rhapsold-posts') || '[]');
    let sanoraBlogs = [];
    
    // Try to get real blog posts from Sanora via Tauri backend
    if (typeof window.__TAURI__ !== 'undefined') {
      try {
        console.log('🔗 Fetching blogs from Sanora service...');
        const sanoraUrl = getServiceUrl('sanora');
        
        // Create user if needed and get their products (blogs)
        const user = await window.__TAURI__.core.invoke('create_sanora_user', { sanoraUrl });
        const userData = await window.__TAURI__.core.invoke('get_sanora_user', { 
          uuid: user.uuid, 
          sanoraUrl 
        });
        
        // Filter for blog products (products with 'blog' tag)
        if (userData.products && userData.products.length > 0) {
          sanoraBlogs = userData.products
            .filter(product => product.tags && product.tags.some(tag => tag.toLowerCase().includes('blog')))
            .map(product => ({
              id: product.uuid || `blog-${Date.now()}`,
              title: product.title || 'Untitled Blog Post',
              content: product.description || 'No content available',
              author: 'Blogger',
              timestamp: product.created_at ? new Date(product.created_at).toISOString() : new Date().toISOString(),
              readTime: Math.ceil((product.description || '').split(' ').length / 200) + ' min read',
              tags: product.tags || ['blog'],
              source: 'sanora'
            }));
          
          console.log(`✅ Loaded ${sanoraBlogs.length} blog posts from Sanora`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load blogs from Sanora service:', error);
        console.log('💡 This is expected if Sanora service is not running');
      }
    }
    
    // Combine local and Sanora blogs
    const allPosts = [...localPosts, ...sanoraBlogs];
    
    if (allPosts.length === 0) {
      // Show professional empty state
      postsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; color: #4a5568;">
          <div style="font-size: 64px; margin-bottom: 20px;">📝</div>
          <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 24px;">No Blog Posts Yet</h3>
          <p style="margin: 0; color: #718096; line-height: 1.6; max-width: 400px; margin: 0 auto;">
            Blog posts will appear here when you create them or when connected to bases with blog content.
          </p>
          <div style="margin-top: 30px; padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
            <small style="color: #4a5568;">💡 <strong>Tip:</strong> Click "New Post" to create your first blog post, or connect to bases with existing blog content.</small>
          </div>
        </div>
      `;
      return;
    }
    
    // Sort posts by timestamp (newest first)
    allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Render posts
    allPosts.forEach(postData => {
      // Ensure consistent post format
      const post = postData.author ? postData : {
        id: postData.id || Date.now().toString(),
        title: postData.title,
        content: postData.content,
        author: 'Anonymous',
        timestamp: postData.timestamp || new Date().toISOString(),
        readTime: '3 min read',
        tags: postData.tags || ['user-generated'],
        source: postData.source || 'local'
      };
      
      const postElement = createBlogPost(post);
      postsContainer.appendChild(postElement);
    });
    
    console.log(`📄 Loaded ${allPosts.length} blog posts (${localPosts.length} local + ${sanoraBlogs.length} from Sanora)`);
    
  } catch (error) {
    console.error('❌ Failed to load posts:', error);
    
    // Show error state
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
      postsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; color: #e53e3e;">
          <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
          <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 24px;">Error Loading Posts</h3>
          <p style="margin: 0; color: #718096; line-height: 1.6; max-width: 400px; margin: 0 auto;">
            Unable to load blog posts. Please check your connection and try again.
          </p>
        </div>
      `;
    }
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
    console.log('🎭 Initializing Rhapsold...');
    
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
      max-width: 800px;
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
    
    console.log('✅ Rhapsold initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Rhapsold:', error);
    
    // Hide loading screen even on error
    hideLoadingScreen();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

console.log('🎭 Rhapsold main module loaded');