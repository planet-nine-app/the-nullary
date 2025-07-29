/**
 * Application Components for Rhapsold
 * Additional app-specific functionality
 */

/**
 * Initialize application-specific components
 * @returns {Promise<void>}
 */
export async function initializeApp() {
  console.log('🎭 Initializing Rhapsold application components...');
  
  // Add any app-specific initialization here
  // For now, this is just a placeholder
  
  return Promise.resolve();
}

/**
 * Application lifecycle hooks
 */
export const appHooks = {
  onPostCreated: [],
  onPostSaved: [],
  onThemeChanged: [],
  
  // Add hook
  add(event, callback) {
    if (this[event]) {
      this[event].push(callback);
    }
  },
  
  // Trigger hooks
  trigger(event, data) {
    if (this[event]) {
      this[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} hook:`, error);
        }
      });
    }
  }
};

/**
 * Application utilities
 */
export const appUtils = {
  // Format date for display
  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },
  
  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};