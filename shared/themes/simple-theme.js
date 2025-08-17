/**
 * Simple Planet Nine Theme System
 * 
 * Just the essential colors we actually need across all apps.
 * No design tokens, no complexity - just simple, usable colors.
 */

/**
 * Core Planet Nine Colors
 */
export const PLANET_NINE_COLORS = {
  // Main brand colors
  primary: '#9b59b6',       // Purple
  secondary: '#27ae60',     // Green  
  tertiary: '#e91e63',      // Pink
  quaternary: '#f1c40f',    // Yellow
  
  // Utility colors
  cancel: '#e74c3c',        // Red for cancel/delete actions
  inactive: '#95a5a6',      // Gray for disabled/inactive states
  
  // Basic colors
  white: '#ffffff',
  black: '#2c3e50',         // Dark blue-gray instead of pure black
  lightGray: '#ecf0f1',
  darkGray: '#34495e'
};

/**
 * Simple gradients using the main colors
 */
export const PLANET_NINE_GRADIENTS = {
  // Primary combinations
  primarySecondary: `linear-gradient(135deg, ${PLANET_NINE_COLORS.primary} 0%, ${PLANET_NINE_COLORS.secondary} 100%)`,
  primaryTertiary: `linear-gradient(135deg, ${PLANET_NINE_COLORS.primary} 0%, ${PLANET_NINE_COLORS.tertiary} 100%)`,
  primaryQuaternary: `linear-gradient(135deg, ${PLANET_NINE_COLORS.primary} 0%, ${PLANET_NINE_COLORS.quaternary} 100%)`,
  
  // Secondary combinations  
  secondaryTertiary: `linear-gradient(135deg, ${PLANET_NINE_COLORS.secondary} 0%, ${PLANET_NINE_COLORS.tertiary} 100%)`,
  secondaryQuaternary: `linear-gradient(135deg, ${PLANET_NINE_COLORS.secondary} 0%, ${PLANET_NINE_COLORS.quaternary} 100%)`,
  
  // Tertiary combinations
  tertiaryQuaternary: `linear-gradient(135deg, ${PLANET_NINE_COLORS.tertiary} 0%, ${PLANET_NINE_COLORS.quaternary} 100%)`,
  
  // Multi-color gradients
  rainbow: `linear-gradient(135deg, ${PLANET_NINE_COLORS.primary} 0%, ${PLANET_NINE_COLORS.secondary} 25%, ${PLANET_NINE_COLORS.tertiary} 50%, ${PLANET_NINE_COLORS.quaternary} 100%)`,
  sunset: `linear-gradient(135deg, ${PLANET_NINE_COLORS.tertiary} 0%, ${PLANET_NINE_COLORS.quaternary} 100%)`,
  ocean: `linear-gradient(135deg, ${PLANET_NINE_COLORS.primary} 0%, ${PLANET_NINE_COLORS.secondary} 100%)`
};

/**
 * Simple theme object
 */
export const SIMPLE_THEME = {
  name: 'Planet Nine Simple',
  
  // Colors
  colors: PLANET_NINE_COLORS,
  
  // Gradients
  gradients: PLANET_NINE_GRADIENTS,
  
  // Basic typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilySerif: 'Georgia, "Times New Roman", serif',
    fontSize: '16px',
    lineHeight: '1.5'
  },
  
  // Basic spacing (just a few sizes)
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px'
  },
  
  // Simple border radius
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  },
  
  // Basic shadows
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
    large: '0 8px 16px rgba(0, 0, 0, 0.2)'
  }
};

/**
 * Dark version - just flip the colors
 */
export const SIMPLE_DARK_THEME = {
  ...SIMPLE_THEME,
  name: 'Planet Nine Simple Dark',
  
  colors: {
    ...PLANET_NINE_COLORS,
    white: PLANET_NINE_COLORS.black,
    black: PLANET_NINE_COLORS.white,
    lightGray: PLANET_NINE_COLORS.darkGray,
    darkGray: PLANET_NINE_COLORS.lightGray
  }
};

/**
 * Get color by name - convenience function
 */
export function getColor(colorName) {
  return PLANET_NINE_COLORS[colorName] || colorName;
}

/**
 * Get gradient by name - convenience function  
 */
export function getGradient(gradientName) {
  return PLANET_NINE_GRADIENTS[gradientName] || gradientName;
}

/**
 * Apply simple theme to an element
 */
export function applySimpleTheme(element, theme = SIMPLE_THEME) {
  element.style.fontFamily = theme.typography.fontFamily;
  element.style.fontSize = theme.typography.fontSize;
  element.style.lineHeight = theme.typography.lineHeight;
  element.style.color = theme.colors.black;
  element.style.backgroundColor = theme.colors.white;
}

/**
 * Create simple CSS variables for the theme
 */
export function createCSSVariables(theme = SIMPLE_THEME) {
  const root = document.documentElement;
  
  // Colors
  Object.entries(theme.colors).forEach(([name, color]) => {
    root.style.setProperty(`--color-${name}`, color);
  });
  
  // Gradients
  Object.entries(theme.gradients).forEach(([name, gradient]) => {
    root.style.setProperty(`--gradient-${name}`, gradient);
  });
  
  // Typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  root.style.setProperty('--font-family-serif', theme.typography.fontFamilySerif);
  root.style.setProperty('--font-size', theme.typography.fontSize);
  root.style.setProperty('--line-height', theme.typography.lineHeight);
  
  // Spacing
  Object.entries(theme.spacing).forEach(([name, size]) => {
    root.style.setProperty(`--spacing-${name}`, size);
  });
  
  // Border radius
  Object.entries(theme.borderRadius).forEach(([name, radius]) => {
    root.style.setProperty(`--radius-${name}`, radius);
  });
  
  // Shadows
  Object.entries(theme.shadows).forEach(([name, shadow]) => {
    root.style.setProperty(`--shadow-${name}`, shadow);
  });
}

/**
 * Export everything for easy imports
 */
export default SIMPLE_THEME;