/**
 * Theme Configuration for Rhapsold
 * Defines the visual styling and typography
 */

/**
 * Default theme configuration
 */
export const defaultTheme = {
  name: 'Default',
  typography: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 16,
    lineHeight: 1.6,
    headerFont: 'Georgia, "Times New Roman", serif',
    headerSize: 32,
    subtitleSize: 16,
    postTitleSize: 28,
    letterSpacing: 'normal'
  },
  colors: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    accent: '#3498db',
    text: '#2c3e50',
    muted: '#95a5a6',
    background: '#ffffff',
    surface: '#fafafa',
    border: '#ecf0f1'
  },
  layout: {
    maxWidth: 800,
    padding: 20,
    spacing: 30,
    borderRadius: 8
  },
  components: {
    buttons: {
      style: 'minimal',
      borderRadius: 4
    },
    posts: {
      borderStyle: 'left',
      borderWidth: 4,
      backgroundColor: '#fafafa'
    }
  }
};

/**
 * Dark theme configuration
 */
export const darkTheme = {
  name: 'Dark',
  typography: {
    ...defaultTheme.typography
  },
  colors: {
    primary: '#ecf0f1',
    secondary: '#bdc3c7',
    accent: '#3498db',
    text: '#ecf0f1',
    muted: '#7f8c8d',
    background: '#1a1a1a',
    surface: '#2a2a2a',
    border: '#404040'
  },
  layout: {
    ...defaultTheme.layout
  },
  components: {
    ...defaultTheme.components,
    posts: {
      borderStyle: 'left',
      borderWidth: 4,
      backgroundColor: '#2a2a2a'
    }
  }
};

/**
 * Minimal theme configuration
 */
export const minimalTheme = {
  name: 'Minimal',
  typography: {
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
    fontSize: 16,
    lineHeight: 1.5,
    headerFont: 'Arial, "Helvetica Neue", sans-serif',
    headerSize: 28,
    subtitleSize: 14,
    postTitleSize: 24,
    letterSpacing: '0.5px'
  },
  colors: {
    primary: '#333333',
    secondary: '#666666',
    accent: '#000000',
    text: '#333333',
    muted: '#999999',
    background: '#ffffff',
    surface: '#ffffff',
    border: '#e0e0e0'
  },
  layout: {
    maxWidth: 700,
    padding: 40,
    spacing: 40,
    borderRadius: 0
  },
  components: {
    buttons: {
      style: 'borderless',
      borderRadius: 0
    },
    posts: {
      borderStyle: 'bottom',
      borderWidth: 1,
      backgroundColor: 'transparent'
    }
  }
};

/**
 * Available themes
 */
export const themes = {
  default: defaultTheme,
  dark: darkTheme,
  minimal: minimalTheme
};

/**
 * Load theme from preferences or return default
 * @returns {Promise<Object>} Theme configuration
 */
export async function loadTheme() {
  try {
    // Try to load from allyabase preferences
    if (window.allyabase && window.allyabase.getPref) {
      const savedTheme = await window.allyabase.getPref('rhapsold-theme');
      if (savedTheme && themes[savedTheme]) {
        console.log(`🎨 Loaded saved theme: ${savedTheme}`);
        return themes[savedTheme];
      }
    }
    
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      console.log('🌙 Using dark theme based on system preference');
      return darkTheme;
    }
    
    console.log('🎨 Using default theme');
    return defaultTheme;
    
  } catch (error) {
    console.warn('⚠️ Could not load theme preferences:', error);
    return defaultTheme;
  }
}

/**
 * Save theme preference
 * @param {string} themeName - Name of theme to save
 */
export async function saveTheme(themeName) {
  try {
    if (window.allyabase && window.allyabase.savePref) {
      await window.allyabase.savePref('rhapsold-theme', themeName);
      console.log(`💾 Saved theme preference: ${themeName}`);
    } else {
      // Skip localStorage to avoid quota issues
      console.log(`⚠️ Theme not saved - service unavailable and localStorage disabled`);
    }
  } catch (error) {
    console.error('❌ Could not save theme preference:', error);
  }
}

/**
 * Get theme by name
 * @param {string} name - Theme name
 * @returns {Object} Theme configuration
 */
export function getTheme(name) {
  return themes[name] || defaultTheme;
}

/**
 * Create custom theme configuration
 * @param {Object} customConfig - Custom theme properties
 * @param {Object} baseTheme - Base theme to extend (default: defaultTheme)
 * @returns {Object} Custom theme configuration
 */
export function createCustomTheme(customConfig, baseTheme = defaultTheme) {
  return {
    ...baseTheme,
    ...customConfig,
    name: customConfig.name || 'Custom',
    typography: {
      ...baseTheme.typography,
      ...(customConfig.typography || {})
    },
    colors: {
      ...baseTheme.colors,
      ...(customConfig.colors || {})
    },
    layout: {
      ...baseTheme.layout,
      ...(customConfig.layout || {})
    },
    components: {
      ...baseTheme.components,
      ...(customConfig.components || {})
    }
  };
}

/**
 * Apply theme to SVG component configuration
 * @param {Object} componentConfig - Component configuration
 * @param {Object} theme - Theme to apply
 * @returns {Object} Updated component configuration
 */
export function applyThemeToComponent(componentConfig, theme) {
  return {
    ...componentConfig,
    fontFamily: componentConfig.fontFamily || theme.typography.fontFamily,
    fontSize: componentConfig.fontSize || theme.typography.fontSize,
    color: componentConfig.color || theme.colors.text,
    backgroundColor: componentConfig.backgroundColor || theme.colors.surface,
    borderColor: componentConfig.borderColor || theme.colors.border,
    lineHeight: componentConfig.lineHeight || theme.typography.lineHeight
  };
}

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    console.log(`🎨 System theme changed to: ${e.matches ? 'dark' : 'light'}`);
    // Could trigger theme reload here if desired
  });
}