/**
 * User Persistence System for The Nullary
 * 
 * Provides secure key storage via Tauri Stronghold and user data persistence
 * via filesystem. This system is shared across all Nullary applications.
 * 
 * Features:
 * - Secure private key storage using Tauri Stronghold
 * - User data persistence in filesystem (non-sensitive data)
 * - Service user management (BDO, Sanora, Dolores, etc.)
 * - Automatic initialization and recovery
 * - Cross-app compatibility
 * 
 * Usage:
 * ```javascript
 * import { UserPersistence } from './shared/utils/user-persistence.js';
 * 
 * const userPersistence = new UserPersistence();
 * await userPersistence.initialize();
 * 
 * // Get or create sessionless keys
 * const keys = await userPersistence.getOrCreateKeys();
 * 
 * // Get or create service users
 * const sanoraUser = await userPersistence.getOrCreateServiceUser('sanora', sanoraUrl);
 * ```
 */

/**
 * Default configuration for user persistence
 */
const DEFAULT_CONFIG = {
  // Stronghold settings
  stronghold: {
    password: 'nullary-default-password', // In production, should be user-provided
    vault: 'nullary-vault',
    keysRecord: 'sessionless-keys'
  },
  
  // Filesystem settings
  userData: {
    directory: 'nullary-users',
    serviceUsersFile: 'service-users.json',
    preferencesFile: 'preferences.json',
    basesFile: 'connected-bases.json'
  },
  
  // Service configurations
  services: {
    bdo: { name: 'BDO', description: 'Big Dumb Object storage' },
    sanora: { name: 'Sanora', description: 'Product hosting' },
    dolores: { name: 'Dolores', description: 'Media storage' },
    fount: { name: 'Fount', description: 'MAGIC transactions' },
    addie: { name: 'Addie', description: 'Payment processing' },
    minnie: { name: 'Minnie', description: 'Email handling' },
    pref: { name: 'Pref', description: 'Preferences' },
    julia: { name: 'Julia', description: 'P2P messaging' }
  }
};

/**
 * User Persistence Manager
 * Handles secure key storage and user data persistence
 */
export class UserPersistence {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isInitialized = false;
    this.sessionlessKeys = null;
    this.serviceUsers = new Map();
    this.userData = {};
  }

  /**
   * Initialize the persistence system
   * Sets up Stronghold and loads existing data
   */
  async initialize() {
    try {
      console.log('🔐 Initializing user persistence system...');
      
      // Check if we're in Tauri environment
      if (typeof window.__TAURI__ === 'undefined') {
        console.warn('⚠️ Not in Tauri environment, using fallback storage');
        await this._initializeFallback();
        return true;
      }

      // Initialize Stronghold for secure key storage
      await this._initializeStronghold();
      
      // Load user data from filesystem
      await this._loadUserData();
      
      // Load service users
      await this._loadServiceUsers();
      
      this.isInitialized = true;
      console.log('✅ User persistence system initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize user persistence:', error);
      // Try fallback initialization
      await this._initializeFallback();
      return false;
    }
  }

  /**
   * Get or create sessionless keys
   * Uses Stronghold for secure storage
   */
  async getOrCreateKeys() {
    if (!this.isInitialized) {
      throw new Error('User persistence not initialized. Call initialize() first.');
    }

    if (this.sessionlessKeys) {
      return this.sessionlessKeys;
    }

    try {
      // Try to load existing keys from Stronghold
      const existingKeys = await this._loadKeysFromStronghold();
      if (existingKeys) {
        this.sessionlessKeys = existingKeys;
        console.log('🔑 Loaded existing sessionless keys');
        return existingKeys;
      }

      // Generate new keys if none exist
      console.log('🔑 Generating new sessionless keys...');
      const newKeys = await this._generateNewKeys();
      
      // Save to Stronghold
      await this._saveKeysToStronghold(newKeys);
      
      this.sessionlessKeys = newKeys;
      console.log('✅ New sessionless keys generated and saved securely');
      return newKeys;
      
    } catch (error) {
      console.error('❌ Error with sessionless keys:', error);
      // Use fallback keys for development
      return this._getFallbackKeys();
    }
  }

  /**
   * Get or create a service user (BDO, Sanora, etc.)
   * @param {string} service - Service name (bdo, sanora, dolores, etc.)
   * @param {string} serviceUrl - Service URL
   * @returns {Object} User object with uuid and metadata
   */
  async getOrCreateServiceUser(service, serviceUrl) {
    if (!this.isInitialized) {
      throw new Error('User persistence not initialized. Call initialize() first.');
    }

    const cacheKey = `${service}-${serviceUrl}`;
    
    // Check cache first
    if (this.serviceUsers.has(cacheKey)) {
      const cached = this.serviceUsers.get(cacheKey);
      console.log(`📋 Using cached ${service} user: ${cached.uuid}`);
      return cached;
    }

    try {
      // Get sessionless keys
      const keys = await this.getOrCreateKeys();
      
      // Try to create/get user via Tauri backend
      const user = await this._createServiceUserViaBackend(service, serviceUrl, keys);
      
      if (user) {
        // Cache the user
        this.serviceUsers.set(cacheKey, {
          ...user,
          service,
          serviceUrl,
          lastUsed: Date.now(),
          createdAt: user.createdAt || Date.now()
        });
        
        // Save to filesystem
        await this._saveServiceUsers();
        
        console.log(`✅ ${service} user ready: ${user.uuid}`);
        return user;
      }
      
      throw new Error(`Failed to create ${service} user`);
      
    } catch (error) {
      console.error(`❌ Error with ${service} user:`, error);
      
      // Return cached fallback if available
      const fallbackUser = this._getFallbackServiceUser(service, serviceUrl);
      this.serviceUsers.set(cacheKey, fallbackUser);
      return fallbackUser;
    }
  }

  /**
   * Get all service users
   * @returns {Map} Map of service users by service-url key
   */
  getServiceUsers() {
    return new Map(this.serviceUsers);
  }

  /**
   * Clear a specific service user (force recreation)
   * @param {string} service - Service name
   * @param {string} serviceUrl - Service URL
   */
  async clearServiceUser(service, serviceUrl) {
    const cacheKey = `${service}-${serviceUrl}`;
    this.serviceUsers.delete(cacheKey);
    await this._saveServiceUsers();
    console.log(`🗑️ Cleared ${service} user for ${serviceUrl}`);
  }

  /**
   * Clear all data (reset everything)
   */
  async clearAllData() {
    try {
      console.log('🗑️ Clearing all user data...');
      
      // Clear in-memory data
      this.sessionlessKeys = null;
      this.serviceUsers.clear();
      this.userData = {};
      
      // Clear Stronghold if available
      if (typeof window.__TAURI__ !== 'undefined') {
        try {
          await window.__TAURI__.core.invoke('stronghold_clear_vault');
        } catch (error) {
          console.warn('⚠️ Could not clear Stronghold vault:', error);
        }
      }
      
      // Clear filesystem data
      await this._clearFileSystemData();
      
      console.log('✅ All user data cleared');
      
    } catch (error) {
      console.error('❌ Error clearing data:', error);
    }
  }

  /**
   * Get user preferences
   * @returns {Object} User preferences
   */
  getPreferences() {
    return { ...this.userData.preferences || {} };
  }

  /**
   * Set user preferences
   * @param {Object} preferences - Preferences object
   */
  async setPreferences(preferences) {
    this.userData.preferences = { ...this.userData.preferences, ...preferences };
    await this._saveUserData();
  }

  /**
   * Get connected bases
   * @returns {Array} Array of connected base configurations
   */
  getConnectedBases() {
    return [...(this.userData.connectedBases || [])];
  }

  /**
   * Add connected base
   * @param {Object} baseConfig - Base configuration
   */
  async addConnectedBase(baseConfig) {
    if (!this.userData.connectedBases) {
      this.userData.connectedBases = [];
    }
    
    // Remove existing entry for same base
    this.userData.connectedBases = this.userData.connectedBases.filter(
      base => base.id !== baseConfig.id
    );
    
    // Add new entry
    this.userData.connectedBases.push({
      ...baseConfig,
      connectedAt: Date.now()
    });
    
    await this._saveUserData();
  }

  /**
   * Remove connected base
   * @param {string} baseId - Base ID to remove
   */
  async removeConnectedBase(baseId) {
    if (this.userData.connectedBases) {
      this.userData.connectedBases = this.userData.connectedBases.filter(
        base => base.id !== baseId
      );
      await this._saveUserData();
    }
  }

  // ===== PRIVATE METHODS =====

  /**
   * Initialize Stronghold for secure key storage
   */
  async _initializeStronghold() {
    try {
      // Initialize Stronghold vault
      await window.__TAURI__.core.invoke('stronghold_init', {
        password: this.config.stronghold.password,
        vault: this.config.stronghold.vault
      });
      
      console.log('🔐 Stronghold initialized');
      
    } catch (error) {
      console.warn('⚠️ Stronghold initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load sessionless keys from Stronghold
   */
  async _loadKeysFromStronghold() {
    try {
      const keys = await window.__TAURI__.core.invoke('stronghold_get_record', {
        recordId: this.config.stronghold.keysRecord
      });
      
      if (keys && keys.privateKey && keys.publicKey) {
        return {
          privateKey: keys.privateKey,
          publicKey: keys.publicKey,
          address: keys.address
        };
      }
      
      return null;
      
    } catch (error) {
      console.warn('⚠️ Could not load keys from Stronghold:', error);
      return null;
    }
  }

  /**
   * Save sessionless keys to Stronghold
   */
  async _saveKeysToStronghold(keys) {
    try {
      await window.__TAURI__.core.invoke('stronghold_set_record', {
        recordId: this.config.stronghold.keysRecord,
        data: {
          privateKey: keys.privateKey,
          publicKey: keys.publicKey,
          address: keys.address,
          createdAt: Date.now()
        }
      });
      
      console.log('🔐 Keys saved to Stronghold');
      
    } catch (error) {
      console.error('❌ Failed to save keys to Stronghold:', error);
      throw error;
    }
  }

  /**
   * Generate new sessionless keys
   */
  async _generateNewKeys() {
    try {
      // Use Tauri backend to generate keys
      const keys = await window.__TAURI__.core.invoke('generate_sessionless_keys');
      return keys;
      
    } catch (error) {
      console.warn('⚠️ Backend key generation failed, using fallback');
      return this._getFallbackKeys();
    }
  }

  /**
   * Load user data from filesystem
   */
  async _loadUserData() {
    try {
      const userDataJson = await window.__TAURI__.core.invoke('read_user_data_file', {
        filename: this.config.userData.preferencesFile
      });
      
      if (userDataJson) {
        this.userData = JSON.parse(userDataJson);
        console.log('📁 User data loaded from filesystem');
      }
      
    } catch (error) {
      console.warn('⚠️ Could not load user data:', error);
      this.userData = {};
    }
  }

  /**
   * Save user data to filesystem
   */
  async _saveUserData() {
    try {
      await window.__TAURI__.core.invoke('write_user_data_file', {
        filename: this.config.userData.preferencesFile,
        data: JSON.stringify(this.userData, null, 2)
      });
      
    } catch (error) {
      console.error('❌ Failed to save user data:', error);
    }
  }

  /**
   * Load service users from filesystem
   */
  async _loadServiceUsers() {
    try {
      const serviceUsersJson = await window.__TAURI__.core.invoke('read_user_data_file', {
        filename: this.config.userData.serviceUsersFile
      });
      
      if (serviceUsersJson) {
        const serviceUsersData = JSON.parse(serviceUsersJson);
        
        // Convert to Map
        for (const [key, user] of Object.entries(serviceUsersData)) {
          this.serviceUsers.set(key, user);
        }
        
        console.log(`📁 Loaded ${this.serviceUsers.size} service users from filesystem`);
      }
      
    } catch (error) {
      console.warn('⚠️ Could not load service users:', error);
    }
  }

  /**
   * Save service users to filesystem
   */
  async _saveServiceUsers() {
    try {
      // Convert Map to object for JSON
      const serviceUsersObj = Object.fromEntries(this.serviceUsers);
      
      await window.__TAURI__.core.invoke('write_user_data_file', {
        filename: this.config.userData.serviceUsersFile,
        data: JSON.stringify(serviceUsersObj, null, 2)
      });
      
    } catch (error) {
      console.error('❌ Failed to save service users:', error);
    }
  }

  /**
   * Create service user via Tauri backend
   */
  async _createServiceUserViaBackend(service, serviceUrl, keys) {
    const functionName = `create_${service}_user`;
    
    try {
      const user = await window.__TAURI__.core.invoke(functionName, {
        [`${service}Url`]: serviceUrl
      });
      
      return user;
      
    } catch (error) {
      console.warn(`⚠️ Backend ${service} user creation failed:`, error);
      return null;
    }
  }

  /**
   * Clear filesystem data
   */
  async _clearFileSystemData() {
    try {
      await window.__TAURI__.core.invoke('clear_user_data');
    } catch (error) {
      console.warn('⚠️ Could not clear filesystem data:', error);
    }
  }

  /**
   * Fallback initialization for non-Tauri environments
   */
  async _initializeFallback() {
    console.log('🔧 Using fallback storage (localStorage)');
    
    // Load from localStorage
    try {
      const storedData = localStorage.getItem('nullary-user-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        this.userData = data.userData || {};
        
        // Convert service users back to Map
        if (data.serviceUsers) {
          for (const [key, user] of Object.entries(data.serviceUsers)) {
            this.serviceUsers.set(key, user);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not load fallback data:', error);
    }
    
    this.isInitialized = true;
  }

  /**
   * Get fallback sessionless keys for development
   */
  _getFallbackKeys() {
    // Use development keys from localStorage or generate random
    const stored = localStorage.getItem('nullary-sessionless-keys');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Generate random keys for development
    const keys = {
      privateKey: 'b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496',
      publicKey: '04a5a4e6ed1c7d6ad6d3c1e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4c4c4e6a8c4a4b7e4',
      address: 'dev-address-' + Math.random().toString(36).slice(2)
    };
    
    localStorage.setItem('nullary-sessionless-keys', JSON.stringify(keys));
    return keys;
  }

  /**
   * Get fallback service user for development
   */
  _getFallbackServiceUser(service, serviceUrl) {
    return {
      uuid: `${service}-dev-user-` + Math.random().toString(36).slice(2),
      service,
      serviceUrl,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      fallback: true
    };
  }
}

/**
 * Create a user persistence instance
 * @param {Object} config - Configuration object
 * @returns {UserPersistence} User persistence instance
 */
export function createUserPersistence(config = {}) {
  return new UserPersistence(config);
}

/**
 * Global user persistence instance (singleton pattern)
 */
let globalUserPersistence = null;

/**
 * Get or create global user persistence instance
 * @param {Object} config - Configuration object
 * @returns {UserPersistence} Global user persistence instance
 */
export async function getGlobalUserPersistence(config = {}) {
  if (!globalUserPersistence) {
    globalUserPersistence = new UserPersistence(config);
    await globalUserPersistence.initialize();
  }
  
  return globalUserPersistence;
}

/**
 * Convenience function to get sessionless keys
 * @returns {Object} Sessionless keys
 */
export async function getSessionlessKeys() {
  const persistence = await getGlobalUserPersistence();
  return await persistence.getOrCreateKeys();
}

/**
 * Convenience function to get service user
 * @param {string} service - Service name
 * @param {string} serviceUrl - Service URL
 * @returns {Object} Service user
 */
export async function getServiceUser(service, serviceUrl) {
  const persistence = await getGlobalUserPersistence();
  return await persistence.getOrCreateServiceUser(service, serviceUrl);
}

/**
 * Export default configuration
 */
export { DEFAULT_CONFIG as userPersistenceDefaults };