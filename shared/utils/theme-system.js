/**
 * Theme System for The Nullary
 * Shared theming system used across all Nullary applications
 */

/**
 * Default theme configuration
 */
export const DEFAULT_THEME = {
  name: 'Default',
  colors: {
    // Primary colors
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    accent: '#3498db',
    
    // Backgrounds
    background: '#fafafa',
    surface: '#ffffff',
    backgroundHover: '#f8f9fa',
    
    // Text colors
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    textInverted: '#ffffff',
    
    // Status colors
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
    
    // UI elements
    border: '#e1e5e9',
    borderHover: '#bdc3c7',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Accent variations
    accentLight: '#5dade2',
    accentDark: '#2980b9'
  },
  
  typography: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 16,
    lineHeight: 1.6,
    
    // Sizes
    headerSize: 32,
    subHeaderSize: 24,
    titleSize: 20,
    bodySize: 16,
    smallSize: 14,
    tinySize: 12,
    
    // Weights
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  spacing: {
    tiny: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
    xxlarge: '48px'
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    rounded: '50%'
  },
  
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 15px rgba(0, 0, 0, 0.1)',
    large: '0 10px 30px rgba(0, 0, 0, 0.15)',
    focus: '0 0 0 3px rgba(52, 152, 219, 0.3)'
  }
};

/**
 * Marketplace theme (for ninefy)
 */
export const MARKETPLACE_THEME = {
  ...DEFAULT_THEME,
  name: 'Marketplace',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#2c3e50',
    accent: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12'
  },
  typography: {
    ...DEFAULT_THEME.typography,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};

/**
 * Blog theme (for rhapsold)
 */
export const BLOG_THEME = {
  ...DEFAULT_THEME,
  name: 'Blog',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#2c3e50',
    accent: '#3498db',
    background: '#f8f9fa'
  },
  typography: {
    ...DEFAULT_THEME.typography,
    fontFamily: 'Georgia, "Times New Roman", serif',
    lineHeight: 1.7
  }
};

/**
 * Dark theme
 */
export const DARK_THEME = {
  ...DEFAULT_THEME,
  name: 'Dark',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#ecf0f1',
    secondary: '#bdc3c7',
    accent: '#3498db',
    
    background: '#2c3e50',
    surface: '#34495e',
    backgroundHover: '#3a4a5c',
    
    text: '#ecf0f1',
    textSecondary: '#bdc3c7',
    textInverted: '#2c3e50',
    
    border: '#4a5568',
    borderHover: '#5a6578',
    shadow: 'rgba(0, 0, 0, 0.3)'
  }
};

/**
 * High contrast theme for accessibility
 */
export const HIGH_CONTRAST_THEME = {
  ...DEFAULT_THEME,
  name: 'High Contrast',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#000000',
    secondary: '#666666',
    accent: '#0066cc',
    
    background: '#ffffff',
    surface: '#ffffff',
    backgroundHover: '#f0f0f0',
    
    text: '#000000',
    textSecondary: '#333333',
    textInverted: '#ffffff',
    
    border: '#000000',
    borderHover: '#333333',
    shadow: 'rgba(0, 0, 0, 0.5)'
  }
};

/**
 * Available themes
 */
export const THEMES = {
  default: DEFAULT_THEME,
  marketplace: MARKETPLACE_THEME,
  blog: BLOG_THEME,
  dark: DARK_THEME,
  'high-contrast': HIGH_CONTRAST_THEME
};

/**
 * Create a theme manager
 * @param {string} initialTheme - Initial theme name
 * @returns {Object} Theme manager
 */
export function createThemeManager(initialTheme = 'default') {
  let currentTheme = THEMES[initialTheme] || DEFAULT_THEME;
  let listeners = [];
  
  return {
    getCurrentTheme: () => currentTheme,
    
    setTheme: (themeName) => {
      const theme = THEMES[themeName];
      if (theme) {
        currentTheme = theme;
        console.log(`🎨 Theme changed to: ${theme.name}`);
        
        // Update CSS custom properties
        updateCSSVariables(theme);
        
        // Notify listeners
        listeners.forEach(listener => listener(theme));
        
        return true;
      } else {
        console.warn(`Theme not found: ${themeName}`);
        return false;
      }
    },
    
    addTheme: (name, theme) => {
      THEMES[name] = theme;
      console.log(`🎨 Added custom theme: ${name}`);
    },
    
    onThemeChange: (listener) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    
    getAvailableThemes: () => Object.keys(THEMES),
    
    createCustomTheme: (baseTheme, overrides) => {
      const base = THEMES[baseTheme] || DEFAULT_THEME;
      return {
        ...base,
        ...overrides,
        colors: { ...base.colors, ...(overrides.colors || {}) },
        typography: { ...base.typography, ...(overrides.typography || {}) },
        spacing: { ...base.spacing, ...(overrides.spacing || {}) }
      };
    }
  };
}

/**
 * Update CSS custom properties based on theme
 * @param {Object} theme - Theme object
 */
function updateCSSVariables(theme) {
  const root = document.documentElement;
  
  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Typography
  Object.entries(theme.typography).forEach(([key, value]) => {
    if (typeof value === 'string') {
      root.style.setProperty(`--font-${key}`, value);
    } else if (typeof value === 'number') {
      root.style.setProperty(`--font-${key}`, `${value}px`);
    }
  });
  
  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
}

/**
 * Apply theme to an element
 * @param {HTMLElement} element - Element to apply theme to
 * @param {Object} theme - Theme object
 * @param {Object} overrides - Style overrides
 */
export function applyTheme(element, theme, overrides = {}) {
  const styles = {
    fontFamily: theme.typography.fontFamily,
    fontSize: `${theme.typography.fontSize}px`,
    lineHeight: theme.typography.lineHeight,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    ...overrides
  };
  
  Object.entries(styles).forEach(([property, value]) => {
    element.style[property] = value;
  });
}

/**
 * Create themed button styles
 * @param {Object} theme - Theme object
 * @param {string} variant - Button variant (primary, secondary, success, error)
 * @returns {Object} CSS styles object
 */
export function createButtonStyles(theme, variant = 'primary') {
  const variants = {
    primary: {
      background: theme.colors.accent,
      color: theme.colors.textInverted,
      border: `1px solid ${theme.colors.accent}`
    },
    secondary: {
      background: 'transparent',
      color: theme.colors.accent,
      border: `1px solid ${theme.colors.accent}`
    },
    success: {
      background: theme.colors.success,
      color: theme.colors.textInverted,
      border: `1px solid ${theme.colors.success}`
    },
    error: {
      background: theme.colors.error,
      color: theme.colors.textInverted,
      border: `1px solid ${theme.colors.error}`
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`
    }
  };
  
  const baseStyles = {
    padding: `${theme.spacing.small} ${theme.spacing.medium}`,
    borderRadius: theme.borderRadius.medium,
    fontFamily: theme.typography.fontFamily,
    fontSize: `${theme.typography.bodySize}px`,
    fontWeight: theme.typography.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.small
  };
  
  return {
    ...baseStyles,
    ...variants[variant]
  };
}

/**
 * Create themed input styles
 * @param {Object} theme - Theme object
 * @returns {Object} CSS styles object
 */
export function createInputStyles(theme) {
  return {
    padding: theme.spacing.small,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.medium,
    fontFamily: theme.typography.fontFamily,
    fontSize: `${theme.typography.bodySize}px`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    
    // Focus styles
    ':focus': {
      borderColor: theme.colors.accent,
      boxShadow: theme.shadows.focus
    }
  };
}

/**
 * Get contrast color (black or white) based on background
 * @param {string} backgroundColor - Background color
 * @returns {string} Contrast color
 */
export function getContrastColor(backgroundColor) {
  // Remove # if present
  const color = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Lighten or darken a color
 * @param {string} color - Color to modify
 * @param {number} percent - Percent to lighten (positive) or darken (negative)
 * @returns {string} Modified color
 */
export function adjustColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

/**
 * Initialize theme system CSS variables
 */
export function initializeThemeSystem() {
  updateCSSVariables(DEFAULT_THEME);
  console.log('🎨 Theme system initialized with default theme');
}