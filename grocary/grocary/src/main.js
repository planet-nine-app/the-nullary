// Grocary App - Main JavaScript
// Connects to grocery service and provides grocery pickup functionality

// State management

// Environment configuration for grocary
function getEnvironmentConfig() {
  const env = localStorage.getItem('nullary-env') || 'dev';
  
  const configs = {
    dev: {
      sanora: 'https://dev.sanora.allyabase.com/',
      bdo: 'https://dev.bdo.allyabase.com/',
      dolores: 'https://dev.dolores.allyabase.com/',
      fount: 'https://dev.fount.allyabase.com/',
      addie: 'https://dev.addie.allyabase.com/',
      pref: 'https://dev.pref.allyabase.com/',
      julia: 'https://dev.julia.allyabase.com/',
      continuebee: 'https://dev.continuebee.allyabase.com/',
      joan: 'https://dev.joan.allyabase.com/',
      aretha: 'https://dev.aretha.allyabase.com/',
      minnie: 'https://dev.minnie.allyabase.com/',
      covenant: 'https://dev.covenant.allyabase.com/'
    },
    test: {
      sanora: 'http://localhost:5121/',
      bdo: 'http://localhost:5114/',
      dolores: 'http://localhost:5118/',
      fount: 'http://localhost:5117/',
      addie: 'http://localhost:5116/',
      pref: 'http://localhost:5113/',
      julia: 'http://localhost:5111/',
      continuebee: 'http://localhost:5112/',
      joan: 'http://localhost:5115/',
      aretha: 'http://localhost:5120/',
      minnie: 'http://localhost:5119/',
      covenant: 'http://localhost:5122/'
    },
    local: {
      sanora: 'http://localhost:7243/',
      bdo: 'http://localhost:3003/',
      dolores: 'http://localhost:3005/',
      fount: 'http://localhost:3002/',
      addie: 'http://localhost:3005/',
      pref: 'http://localhost:3004/',
      julia: 'http://localhost:3000/',
      continuebee: 'http://localhost:2999/',
      joan: 'http://localhost:3004/',
      aretha: 'http://localhost:7277/',
      minnie: 'http://localhost:2525/',
      covenant: 'http://localhost:3011/'
    }
  };
  
  const config = configs[env] || configs.dev;
  return { env, services: config, name: env };
}

function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  return config.services[serviceName] || config.services.sanora;
}

// Environment switching functions for browser console
window.grocaryEnv = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(`❌ Unknown environment: ${env}. Available: dev, test, local`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(`🔄 grocary environment switched to ${env}. Refresh app to apply changes.`);
    console.log(`Run: location.reload() to refresh`);
    return true;
  },
  current: () => {
    const config = getEnvironmentConfig();
    console.log(`🌐 Current environment: ${config.env}`);
    console.log(`📍 Services:`, config.services);
    return config;
  },
  list: () => {
    console.log('🌍 Available environments for grocary:');
    console.log('• dev - https://dev.*.allyabase.com (production dev server)');
    console.log('• test - localhost:5111-5122 (3-base test ecosystem)');
    console.log('• local - localhost:3000-3007 (local development)');
  }
};

// Make functions globally available
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;

let grocaryState = {
  user: null,
  groceryServiceConnected: false,
  krogerConnected: false,
  stores: [],
  searchResults: []
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🛒 Grocary app starting...');
  
  // Check grocery service connection
  await checkGroceryServiceStatus();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load saved state
  loadState();
});

// Check if grocery service is running
async function checkGroceryServiceStatus() {
  const statusElement = document.getElementById('service-status');
  const statusDot = document.querySelector('.status-dot');
  
  try {
    // Try to connect to grocery service on localhost:3007
    const response = await fetch('http://localhost:3007/health', {
      method: 'GET',
      mode: 'cors'
    }).catch(() => null);
    
    if (response && response.ok) {
      grocaryState.groceryServiceConnected = true;
      statusElement.textContent = 'Connected';
      statusDot.classList.add('connected');
      enableGroceryFeatures();
    } else {
      throw new Error('Service not available');
    }
  } catch (error) {
    grocaryState.groceryServiceConnected = false;
    statusElement.textContent = 'Offline (Start grocery service on port 3007)';
    statusDot.classList.add('error');
    disableGroceryFeatures();
  }
}

// Enable grocery features when service is available
function enableGroceryFeatures() {
  document.getElementById('create-user-btn').disabled = false;
  document.getElementById('find-stores-btn').disabled = false;
  document.getElementById('search-btn').disabled = false;
}

// Disable grocery features when service is unavailable
function disableGroceryFeatures() {
  document.getElementById('create-user-btn').disabled = true;
  document.getElementById('connect-kroger-btn').disabled = true;
  document.getElementById('find-stores-btn').disabled = true;
  document.getElementById('search-btn').disabled = true;
  
  updateAccountStatus('Grocery service offline. Please start the service.', 'error');
}

// Setup event listeners for buttons and inputs
function setupEventListeners() {
  // Create user button
  document.getElementById('create-user-btn').addEventListener('click', createGroceryUser);
  
  // Connect Kroger button
  document.getElementById('connect-kroger-btn').addEventListener('click', connectKroger);
  
  // Find stores button
  document.getElementById('find-stores-btn').addEventListener('click', findStores);
  
  // Search button and input
  document.getElementById('search-btn').addEventListener('click', searchProducts);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchProducts();
    }
  });
}

// Create grocery user account
async function createGroceryUser() {
  if (!grocaryState.groceryServiceConnected) {
    updateAccountStatus('Grocery service not available', 'error');
    return;
  }
  
  const button = document.getElementById('create-user-btn');
  const originalText = button.textContent;
  button.innerHTML = '<span class="loading"></span> Creating...';
  button.disabled = true;
  
  try {
    // TODO: Implement sessionless key generation
    // For now, use a mock public key
    const mockPubKey = 'mock_public_key_' + Date.now();
    const timestamp = Date.now();
    const mockSignature = 'mock_signature';
    
    const response = await fetch('http://localhost:3007/user/create', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pubKey: mockPubKey,
        timestamp: timestamp,
        signature: mockSignature
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.uuid) {
      grocaryState.user = result;
      saveState();
      updateAccountStatus(`Account created! UUID: ${result.uuid}`, 'success');
      document.getElementById('connect-kroger-btn').disabled = false;
      button.textContent = 'Account Created ✓';
    } else {
      updateAccountStatus(`Error: ${result.error || 'Unknown error'}`, 'error');
      button.textContent = originalText;
      button.disabled = false;
    }
  } catch (error) {
    console.error('Error creating user:', error);
    updateAccountStatus('Error creating account. Check console for details.', 'error');
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Connect to Kroger via OAuth
async function connectKroger() {
  if (!grocaryState.user) {
    updateAccountStatus('Please create an account first', 'error');
    return;
  }
  
  const button = document.getElementById('connect-kroger-btn');
  const originalText = button.textContent;
  button.innerHTML = '<span class="loading"></span> Connecting...';
  button.disabled = true;
  
  try {
    const response = await fetch(`http://localhost:3007/user/${grocaryState.user.uuid}/oauth/kroger/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        signature: 'mock_signature' // TODO: Real sessionless signature
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.authURL) {
      // Open Kroger OAuth URL in external browser
      window.open(result.authURL, '_blank');
      updateAccountStatus('Redirected to Kroger. Complete authorization in browser.', 'success');
      button.textContent = 'Connecting to Kroger...';
      
      // TODO: Implement OAuth callback handling
      // For now, just reset button after delay
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 5000);
    } else {
      updateAccountStatus(`Error: ${result.error || 'Unknown error'}`, 'error');
      button.textContent = originalText;
      button.disabled = false;
    }
  } catch (error) {
    console.error('Error connecting to Kroger:', error);
    updateAccountStatus('Error connecting to Kroger. Check console for details.', 'error');
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Find stores near user location
async function findStores() {
  const button = document.getElementById('find-stores-btn');
  const storesList = document.getElementById('stores-list');
  const originalText = button.textContent;
  
  button.innerHTML = '<span class="loading"></span> Finding stores...';
  button.disabled = true;
  storesList.innerHTML = 'Getting your location...';
  
  try {
    // Get user location
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true
      });
    });
    
    const { latitude, longitude } = position.coords;
    storesList.innerHTML = `Location found: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}<br>Searching for stores...`;
    
    // TODO: Call Kroger store locator API via grocery service
    // For now, show mock stores
    setTimeout(() => {
      const mockStores = [
        { name: 'Kroger Store #1234', address: '123 Main St', distance: '0.5 miles' },
        { name: 'Kroger Store #5678', address: '456 Oak Ave', distance: '1.2 miles' },
        { name: 'Kroger Store #9012', address: '789 Pine Rd', distance: '2.1 miles' }
      ];
      
      grocaryState.stores = mockStores;
      displayStores(mockStores);
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('Error finding stores:', error);
    storesList.innerHTML = 'Error getting location. Please enable location services.';
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Display stores in the UI
function displayStores(stores) {
  const storesList = document.getElementById('stores-list');
  
  if (stores.length === 0) {
    storesList.innerHTML = 'No stores found nearby.';
    return;
  }
  
  const storeHTML = stores.map(store => `
    <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 8px; border: 1px solid #ecf0f1;">
      <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">${store.name}</h4>
      <p style="color: #7f8c8d; margin-bottom: 0.25rem;">${store.address}</p>
      <p style="color: #27ae60; font-weight: 500;">${store.distance}</p>
    </div>
  `).join('');
  
  storesList.innerHTML = storeHTML;
}

// Search for products
async function searchProducts() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-btn');
  const searchResults = document.getElementById('search-results');
  const query = searchInput.value.trim();
  
  if (!query) {
    searchResults.innerHTML = 'Please enter a search term.';
    return;
  }
  
  const originalText = searchButton.textContent;
  searchButton.innerHTML = '<span class="loading"></span> Searching...';
  searchButton.disabled = true;
  searchResults.innerHTML = 'Searching for products...';
  
  try {
    // TODO: Call Kroger product search API via grocery service
    // For now, show mock results
    setTimeout(() => {
      const mockResults = [
        { name: 'Bananas', price: '$1.99/lb', brand: 'Fresh' },
        { name: 'Milk (1 Gallon)', price: '$3.49', brand: 'Store Brand' },
        { name: 'Bread (Whole Wheat)', price: '$2.79', brand: 'Nature\'s Bakery' }
      ];
      
      grocaryState.searchResults = mockResults;
      displaySearchResults(mockResults, query);
      searchButton.textContent = originalText;
      searchButton.disabled = false;
    }, 1500);
    
  } catch (error) {
    console.error('Error searching products:', error);
    searchResults.innerHTML = 'Error searching products. Please try again.';
    searchButton.textContent = originalText;
    searchButton.disabled = false;
  }
}

// Display search results
function displaySearchResults(results, query) {
  const searchResults = document.getElementById('search-results');
  
  if (results.length === 0) {
    searchResults.innerHTML = `No products found for "${query}".`;
    return;
  }
  
  const resultsHTML = `
    <h4 style="color: #2c3e50; margin-bottom: 1rem;">Results for "${query}":</h4>
    ${results.map(product => `
      <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 8px; border: 1px solid #ecf0f1;">
        <h5 style="color: #2c3e50; margin-bottom: 0.5rem;">${product.name}</h5>
        <p style="color: #7f8c8d; margin-bottom: 0.25rem;">Brand: ${product.brand}</p>
        <p style="color: #27ae60; font-weight: 500;">${product.price}</p>
      </div>
    `).join('')}
  `;
  
  searchResults.innerHTML = resultsHTML;
}

// Update account status display
function updateAccountStatus(message, type = '') {
  const statusElement = document.getElementById('account-status');
  statusElement.textContent = message;
  statusElement.className = `account-status ${type}`;
}

// Save app state to localStorage
function saveState() {
  localStorage.setItem('grocary-state', JSON.stringify(grocaryState));
}

// Load app state from localStorage
function loadState() {
  const saved = localStorage.getItem('grocary-state');
  if (saved) {
    try {
      const parsedState = JSON.parse(saved);
      grocaryState = { ...grocaryState, ...parsedState };
      
      // Update UI based on loaded state
      if (grocaryState.user) {
        updateAccountStatus(`Loaded account: ${grocaryState.user.uuid}`, 'success');
        document.getElementById('create-user-btn').textContent = 'Account Loaded ✓';
        if (grocaryState.groceryServiceConnected) {
          document.getElementById('connect-kroger-btn').disabled = false;
        }
      }
      
      if (grocaryState.stores.length > 0) {
        displayStores(grocaryState.stores);
      }
      
      if (grocaryState.searchResults.length > 0) {
        displaySearchResults(grocaryState.searchResults, 'previous search');
      }
    } catch (error) {
      console.warn('Error loading saved state:', error);
    }
  }
}

// Export for debugging
window.grocaryState = grocaryState;