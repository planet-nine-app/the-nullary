/**
 * Navigation and HUD Components for The Nullary
 * Shared navigation system used across all Nullary applications
 */

/**
 * Create a navigation HUD overlay
 * @param {Object} config - Configuration object
 * @param {string} config.appName - Name of the application
 * @param {string} config.logoIcon - Logo icon/emoji
 * @param {Array} config.screens - Array of screen definitions
 * @param {Object} config.theme - Theme configuration
 * @param {string} config.currentScreen - Currently active screen
 * @param {Function} config.onNavigate - Callback for navigation events
 * @returns {HTMLElement} The HUD element
 */
export function createNavigationHUD(config = {}) {
  const {
    appName = 'The Nullary',
    logoIcon = '🌌',
    screens = [],
    theme = {},
    currentScreen = 'main',
    onNavigate = () => {}
  } = config;

  const hud = document.createElement('div');
  hud.id = 'navigation-hud';
  hud.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    border-bottom: 1px solid ${theme.colors?.border || '#e1e5e9'};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    font-family: ${theme.typography?.fontFamily || 'system-ui'};
  `;
  
  // Left side - App logo/name
  const logo = document.createElement('div');
  logo.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: bold;
    color: ${theme.colors?.primary || '#2c3e50'};
  `;
  logo.innerHTML = `
    <span style="font-size: 24px;">${logoIcon}</span>
    <span>${appName}</span>
  `;
  
  // Center - Navigation buttons
  const nav = document.createElement('div');
  nav.style.cssText = `
    display: flex;
    gap: 10px;
  `;
  
  screens.forEach(screen => {
    const button = document.createElement('button');
    button.id = `nav-${screen.id}`;
    button.textContent = screen.label;
    button.title = screen.title;
    button.style.cssText = `
      padding: 8px 16px;
      border: 1px solid ${theme.colors?.border || '#e1e5e9'};
      border-radius: 4px;
      background: ${currentScreen === screen.id ? (theme.colors?.accent || '#3498db') : 'white'};
      color: ${currentScreen === screen.id ? 'white' : (theme.colors?.text || '#2c3e50')};
      font-family: ${theme.typography?.fontFamily || 'system-ui'};
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    button.addEventListener('click', () => {
      onNavigate(screen.id);
    });
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
      if (currentScreen !== screen.id) {
        button.style.background = theme.colors?.backgroundHover || '#f8f9fa';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (currentScreen !== screen.id) {
        button.style.background = 'white';
      }
    });
    
    nav.appendChild(button);
  });
  
  // Right side - Status indicator
  const status = document.createElement('div');
  status.id = 'hud-status';
  status.style.cssText = `
    font-size: 12px;
    color: ${theme.colors?.secondary || '#7f8c8d'};
  `;
  status.textContent = 'Ready';
  
  hud.appendChild(logo);
  hud.appendChild(nav);
  hud.appendChild(status);
  
  return hud;
}

/**
 * Update navigation button states
 * @param {string} currentScreen - The currently active screen
 * @param {Array} screens - Array of screen definitions
 * @param {Object} theme - Theme configuration
 */
export function updateNavigationButtons(currentScreen, screens = [], theme = {}) {
  screens.forEach(screen => {
    const button = document.getElementById(`nav-${screen.id}`);
    if (button) {
      const isActive = currentScreen === screen.id;
      button.style.background = isActive ? (theme.colors?.accent || '#3498db') : 'white';
      button.style.color = isActive ? 'white' : (theme.colors?.text || '#2c3e50');
    }
  });
}

/**
 * Update status indicator text
 * @param {string} statusText - The status text to display
 * @param {string} statusType - Type of status (success, error, warning, info)
 */
export function updateStatusIndicator(statusText, statusType = 'info') {
  const statusElement = document.getElementById('hud-status');
  if (statusElement) {
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#7f8c8d'
    };
    
    statusElement.textContent = statusText;
    statusElement.style.color = colors[statusType] || colors.info;
  }
}

/**
 * Create a simple navigation manager
 * @param {Object} config - Configuration object
 * @returns {Object} Navigation manager with methods
 */
export function createNavigationManager(config = {}) {
  let currentScreen = config.initialScreen || 'main';
  let screens = config.screens || [];
  
  return {
    getCurrentScreen: () => currentScreen,
    
    navigateTo: (screenId) => {
      const screen = screens.find(s => s.id === screenId);
      if (screen) {
        console.log(`🧭 Navigating to screen: ${screenId}`);
        currentScreen = screenId;
        updateNavigationButtons(currentScreen, screens, config.theme);
        if (config.onNavigate) {
          config.onNavigate(screenId);
        }
      } else {
        console.warn(`Screen not found: ${screenId}`);
      }
    },
    
    updateStatus: (text, type) => {
      updateStatusIndicator(text, type);
    },
    
    setScreens: (newScreens) => {
      screens = newScreens;
    },
    
    addScreen: (screen) => {
      screens.push(screen);
    }
  };
}