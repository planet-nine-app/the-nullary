/**
 * User Persistence Integration Examples for The Nullary
 * 
 * This file provides practical examples of how to integrate the user persistence
 * system into existing Nullary applications.
 */

/**
 * Example 1: Basic Integration in App Initialization
 * 
 * Replace the manual sessionless key generation and user creation
 * with the persistent user system.
 */
export async function initializeAppWithPersistence() {
  console.log('🚀 Initializing app with user persistence...');
  
  try {
    // Import the user persistence system
    const { getGlobalUserPersistence } = await import('./user-persistence.js');
    
    // Get or create the global persistence instance
    const userPersistence = await getGlobalUserPersistence();
    
    // Get persistent sessionless keys
    const sessionlessKeys = await userPersistence.getOrCreateKeys();
    console.log('🔑 Sessionless keys ready:', sessionlessKeys.address);
    
    // Get or create service users for common services
    const services = await Promise.allSettled([
      userPersistence.getOrCreateServiceUser('bdo', 'http://127.0.0.1:5114/'),
      userPersistence.getOrCreateServiceUser('sanora', 'http://127.0.0.1:5121/'),
      userPersistence.getOrCreateServiceUser('dolores', 'http://127.0.0.1:5118/')
    ]);
    
    console.log('👥 Service users ready:', services.filter(s => s.status === 'fulfilled').length);
    
    return {
      userPersistence,
      sessionlessKeys,
      serviceUsers: {
        bdo: services[0].status === 'fulfilled' ? services[0].value : null,
        sanora: services[1].status === 'fulfilled' ? services[1].value : null,
        dolores: services[2].status === 'fulfilled' ? services[2].value : null
      }
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize user persistence:', error);
    throw error;
  }
}

/**
 * Example 2: Rhapsold Integration
 * 
 * Show how to integrate user persistence into Rhapsold's existing code.
 */
export async function integrateRhapsoldUserPersistence() {
  console.log('📝 Integrating user persistence into Rhapsold...');
  
  // Get user persistence
  const { getGlobalUserPersistence } = await import('./user-persistence.js');
  const userPersistence = await getGlobalUserPersistence();
  
  // Replace existing sessionless key generation
  const sessionlessKeys = await userPersistence.getOrCreateKeys();
  
  // Get Sanora user for blog management
  const sanoraUser = await userPersistence.getOrCreateServiceUser('sanora', getServiceUrl('sanora'));
  
  // Load user preferences
  const preferences = userPersistence.getPreferences();
  
  // Apply theme preferences if they exist
  if (preferences.theme) {
    console.log('🎨 Applying saved theme:', preferences.theme);
    // Apply theme to app
  }
  
  return {
    userPersistence,
    sessionlessKeys,
    sanoraUser,
    preferences
  };
}

/**
 * Example 3: Service User Management
 * 
 * Show how to properly manage service users across different environments.
 */
export async function manageServiceUsers() {
  const { getGlobalUserPersistence } = await import('./user-persistence.js');
  const userPersistence = await getGlobalUserPersistence();
  
  // Get current environment configuration
  const { getEnvironmentConfig } = await import('./environment-integration.js');
  const envConfig = getEnvironmentConfig();
  
  console.log(`🌍 Managing service users for ${envConfig.env} environment`);
  
  // Create users for all services in current environment
  const servicePromises = Object.entries(envConfig.services).map(async ([service, url]) => {
    try {
      const user = await userPersistence.getOrCreateServiceUser(service, url);
      return { service, url, user, success: true };
    } catch (error) {
      console.warn(`⚠️ Failed to create ${service} user:`, error);
      return { service, url, user: null, success: false, error };
    }
  });
  
  const results = await Promise.all(servicePromises);
  
  // Log results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ ${successful.length} service users ready`);
  if (failed.length > 0) {
    console.warn(`⚠️ ${failed.length} service users failed:`, failed.map(f => f.service));
  }
  
  return {
    successful: successful.map(s => ({ service: s.service, user: s.user })),
    failed: failed.map(f => ({ service: f.service, error: f.error }))
  };
}

/**
 * Example 4: Preferences Management
 * 
 * Show how to use the user persistence system for app preferences.
 */
export async function manageUserPreferences() {
  const { getGlobalUserPersistence } = await import('./user-persistence.js');
  const userPersistence = await getGlobalUserPersistence();
  
  // Get current preferences
  let preferences = userPersistence.getPreferences();
  
  // Set default preferences if none exist
  if (Object.keys(preferences).length === 0) {
    console.log('🔧 Setting default preferences');
    
    const defaultPreferences = {
      theme: 'light',
      environment: 'dev',
      autoSave: true,
      enableAnimations: true,
      showHelpTips: true,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    await userPersistence.setPreferences(defaultPreferences);
    preferences = defaultPreferences;
  }
  
  console.log('⚙️ Current preferences:', preferences);
  
  // Example: Update specific preference
  const updatePreference = async (key, value) => {
    console.log(`🔧 Updating preference ${key}:`, value);
    await userPersistence.setPreferences({ [key]: value });
  };
  
  // Example: Toggle theme
  const toggleTheme = async () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    await updatePreference('theme', newTheme);
    console.log('🎨 Theme toggled to:', newTheme);
  };
  
  return {
    preferences,
    updatePreference,
    toggleTheme
  };
}

/**
 * Example 5: Base Management Integration
 * 
 * Show how to integrate with the base discovery and connection system.
 */
export async function manageConnectedBases() {
  const { getGlobalUserPersistence } = await import('./user-persistence.js');
  const userPersistence = await getGlobalUserPersistence();
  
  // Get currently connected bases
  const connectedBases = userPersistence.getConnectedBases();
  console.log(`🌐 Currently connected to ${connectedBases.length} bases`);
  
  // Example: Add a new base
  const addBase = async (baseConfig) => {
    console.log('🔗 Connecting to new base:', baseConfig.name);
    
    // Add to persistent storage
    await userPersistence.addConnectedBase(baseConfig);
    
    // Create service users for this base
    const servicePromises = Object.entries(baseConfig.services || {}).map(async ([service, url]) => {
      try {
        return await userPersistence.getOrCreateServiceUser(service, url);
      } catch (error) {
        console.warn(`⚠️ Failed to create ${service} user for base ${baseConfig.name}:`, error);
        return null;
      }
    });
    
    const serviceUsers = await Promise.all(servicePromises);
    console.log(`✅ Base ${baseConfig.name} connected with ${serviceUsers.filter(u => u).length} service users`);
    
    return serviceUsers;
  };
  
  // Example: Remove a base
  const removeBase = async (baseId) => {
    console.log('🗑️ Disconnecting from base:', baseId);
    await userPersistence.removeConnectedBase(baseId);
    
    // Note: Service users remain in cache for potential reconnection
    // They can be manually cleared if needed with clearServiceUser()
  };
  
  return {
    connectedBases,
    addBase,
    removeBase
  };
}

/**
 * Example 6: Error Handling and Fallbacks
 * 
 * Show how to handle errors gracefully with fallback behavior.
 */
export async function robustUserPersistenceInit() {
  console.log('🛡️ Initializing user persistence with robust error handling...');
  
  try {
    // Try to initialize user persistence
    const { getGlobalUserPersistence } = await import('./user-persistence.js');
    const userPersistence = await getGlobalUserPersistence();
    
    // Test basic functionality
    const keys = await userPersistence.getOrCreateKeys();
    console.log('✅ User persistence fully functional');
    
    return {
      userPersistence,
      keys,
      fallbackMode: false
    };
    
  } catch (error) {
    console.warn('⚠️ User persistence failed, using fallback mode:', error);
    
    // Fallback to localStorage and generated keys
    const fallbackKeys = {
      privateKey: 'b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496',
      publicKey: '04a5a4e6ed1c7d6ad6d3c1e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4',
      address: 'fallback-address-' + Math.random().toString(36).slice(2)
    };
    
    // Create a minimal fallback persistence object
    const fallbackPersistence = {
      getOrCreateKeys: () => fallbackKeys,
      getOrCreateServiceUser: (service, url) => ({
        uuid: `${service}-fallback-` + Math.random().toString(36).slice(2),
        service,
        serviceUrl: url,
        fallback: true
      }),
      getPreferences: () => JSON.parse(localStorage.getItem('nullary-preferences') || '{}'),
      setPreferences: (prefs) => {
        const current = JSON.parse(localStorage.getItem('nullary-preferences') || '{}');
        localStorage.setItem('nullary-preferences', JSON.stringify({ ...current, ...prefs }));
      },
      getConnectedBases: () => JSON.parse(localStorage.getItem('nullary-bases') || '[]'),
      addConnectedBase: (base) => {
        const bases = JSON.parse(localStorage.getItem('nullary-bases') || '[]');
        bases.push(base);
        localStorage.setItem('nullary-bases', JSON.stringify(bases));
      },
      removeConnectedBase: (baseId) => {
        const bases = JSON.parse(localStorage.getItem('nullary-bases') || '[]');
        const filtered = bases.filter(b => b.id !== baseId);
        localStorage.setItem('nullary-bases', JSON.stringify(filtered));
      }
    };
    
    return {
      userPersistence: fallbackPersistence,
      keys: fallbackKeys,
      fallbackMode: true
    };
  }
}

/**
 * Example 7: Complete App Integration Template
 * 
 * A complete template showing how to integrate user persistence into a Nullary app.
 */
export async function completeAppIntegration() {
  console.log('🚀 Complete app integration starting...');
  
  // Step 1: Initialize user persistence with fallback
  const { userPersistence, keys, fallbackMode } = await robustUserPersistenceInit();
  
  if (fallbackMode) {
    console.warn('⚠️ Running in fallback mode - data will not persist securely');
  }
  
  // Step 2: Load user preferences and apply them
  const preferences = userPersistence.getPreferences();
  
  // Step 3: Set up environment based on preferences
  if (preferences.environment) {
    // Switch to saved environment
    const { getEnvironmentConfig } = await import('./environment-integration.js');
    // Environment switching logic would go here
  }
  
  // Step 4: Initialize service users for current environment
  const serviceUsers = await manageServiceUsers();
  
  // Step 5: Load connected bases
  const baseManagement = await manageConnectedBases();
  
  // Step 6: Set up preference management
  const preferenceManagement = await manageUserPreferences();
  
  console.log('✅ Complete app integration finished');
  
  return {
    userPersistence,
    sessionlessKeys: keys,
    serviceUsers: serviceUsers.successful,
    connectedBases: baseManagement.connectedBases,
    preferences,
    fallbackMode,
    
    // Utility functions
    updatePreference: preferenceManagement.updatePreference,
    addBase: baseManagement.addBase,
    removeBase: baseManagement.removeBase
  };
}

/**
 * Export convenience functions for common use cases
 */
export {
  initializeAppWithPersistence,
  integrateRhapsoldUserPersistence,
  manageServiceUsers,
  manageUserPreferences,
  manageConnectedBases,
  robustUserPersistenceInit,
  completeAppIntegration
};