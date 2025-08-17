/**
 * Simple Theme Integration for The Nullary
 * 
 * Easy ways to use the simple Planet Nine theme in your apps.
 */

import { SIMPLE_THEME, SIMPLE_DARK_THEME, getColor, getGradient, createCSSVariables } from '../themes/simple-theme.js';

/**
 * Initialize theme in your app
 * Call this once when your app starts
 */
export function initializeTheme(isDark = false) {
  const theme = isDark ? SIMPLE_DARK_THEME : SIMPLE_THEME;
  createCSSVariables(theme);
  console.log(`🎨 ${theme.name} initialized`);
  return theme;
}

/**
 * Quick access to colors
 * Usage: color('primary') returns '#9b59b6'
 */
export function color(colorName) {
  return getColor(colorName);
}

/**
 * Quick access to gradients
 * Usage: gradient('primarySecondary') returns the gradient CSS
 */
export function gradient(gradientName) {
  return getGradient(gradientName);
}

/**
 * Create a button with Planet Nine styling
 */
export function createThemedButton(text, type = 'primary') {
  const button = document.createElement('button');
  button.textContent = text;
  
  // Base button styles
  button.style.padding = '12px 24px';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.fontSize = '16px';
  button.style.fontWeight = '500';
  button.style.cursor = 'pointer';
  button.style.transition = 'all 0.2s ease';
  
  // Type-specific styles
  switch (type) {
    case 'primary':
      button.style.backgroundColor = color('primary');
      button.style.color = color('white');
      break;
    case 'secondary':
      button.style.backgroundColor = color('secondary');
      button.style.color = color('white');
      break;
    case 'tertiary':
      button.style.backgroundColor = color('tertiary');
      button.style.color = color('white');
      break;
    case 'quaternary':
      button.style.backgroundColor = color('quaternary');
      button.style.color = color('black');
      break;
    case 'cancel':
      button.style.backgroundColor = color('cancel');
      button.style.color = color('white');
      break;
    case 'inactive':
      button.style.backgroundColor = color('inactive');
      button.style.color = color('white');
      button.style.cursor = 'not-allowed';
      break;
    case 'gradient':
      button.style.background = gradient('primarySecondary');
      button.style.color = color('white');
      break;
    default:
      button.style.backgroundColor = color('lightGray');
      button.style.color = color('black');
  }
  
  // Hover effects (except for inactive)
  if (type !== 'inactive') {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });
  }
  
  return button;
}

/**
 * Create a themed card/container
 */
export function createThemedCard() {
  const card = document.createElement('div');
  
  card.style.backgroundColor = color('white');
  card.style.border = `1px solid ${color('lightGray')}`;
  card.style.borderRadius = '12px';
  card.style.padding = '24px';
  card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  
  return card;
}

/**
 * Create themed text with color
 */
export function createThemedText(text, colorName = 'black', size = '16px') {
  const span = document.createElement('span');
  span.textContent = text;
  span.style.color = color(colorName);
  span.style.fontSize = size;
  return span;
}

/**
 * Apply theme colors to SVG elements
 */
export function applySVGTheme(svgElement, colorScheme = 'primary') {
  const fills = svgElement.querySelectorAll('[fill]');
  const strokes = svgElement.querySelectorAll('[stroke]');
  
  fills.forEach(element => {
    if (element.getAttribute('fill') !== 'none') {
      element.setAttribute('fill', color(colorScheme));
    }
  });
  
  strokes.forEach(element => {
    if (element.getAttribute('stroke') !== 'none') {
      element.setAttribute('stroke', color(colorScheme));
    }
  });
}

/**
 * Create a simple themed form input
 */
export function createThemedInput(placeholder = '', type = 'text') {
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  
  input.style.padding = '12px';
  input.style.border = `1px solid ${color('lightGray')}`;
  input.style.borderRadius = '8px';
  input.style.fontSize = '16px';
  input.style.fontFamily = SIMPLE_THEME.typography.fontFamily;
  input.style.backgroundColor = color('white');
  input.style.color = color('black');
  input.style.outline = 'none';
  input.style.transition = 'border-color 0.2s ease';
  
  // Focus styles
  input.addEventListener('focus', () => {
    input.style.borderColor = color('primary');
  });
  
  input.addEventListener('blur', () => {
    input.style.borderColor = color('lightGray');
  });
  
  return input;
}

/**
 * Simple theme switcher
 */
export function createThemeSwitcher() {
  const switcher = document.createElement('button');
  switcher.textContent = '🌙';
  switcher.style.position = 'fixed';
  switcher.style.top = '20px';
  switcher.style.right = '20px';
  switcher.style.width = '50px';
  switcher.style.height = '50px';
  switcher.style.borderRadius = '50%';
  switcher.style.border = 'none';
  switcher.style.backgroundColor = color('primary');
  switcher.style.color = color('white');
  switcher.style.fontSize = '20px';
  switcher.style.cursor = 'pointer';
  switcher.style.zIndex = '1000';
  
  let isDark = false;
  
  switcher.addEventListener('click', () => {
    isDark = !isDark;
    switcher.textContent = isDark ? '☀️' : '🌙';
    initializeTheme(isDark);
  });
  
  return switcher;
}

/**
 * Get theme for specific app types
 */
export function getAppTheme(appType) {
  const baseTheme = SIMPLE_THEME;
  
  switch (appType) {
    case 'blog':
      return {
        ...baseTheme,
        typography: {
          ...baseTheme.typography,
          fontFamily: baseTheme.typography.fontFamilySerif,
          fontSize: '18px',
          lineHeight: '1.7'
        }
      };
      
    case 'marketplace':
      return {
        ...baseTheme,
        primaryColor: color('tertiary') // Pink for marketplace
      };
      
    case 'social':
      return {
        ...baseTheme,
        primaryColor: color('secondary') // Green for social
      };
      
    default:
      return baseTheme;
  }
}

/**
 * Example: Complete app theming
 */
export function setupAppTheme(appType = 'default', addSwitcher = true) {
  console.log(`🎨 Setting up ${appType} theme...`);
  
  // Initialize theme
  const theme = getAppTheme(appType);
  initializeTheme();
  
  // Apply to body
  document.body.style.fontFamily = theme.typography.fontFamily;
  document.body.style.fontSize = theme.typography.fontSize;
  document.body.style.lineHeight = theme.typography.lineHeight;
  document.body.style.backgroundColor = color('white');
  document.body.style.color = color('black');
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  
  // Add theme switcher if requested
  if (addSwitcher) {
    document.body.appendChild(createThemeSwitcher());
  }
  
  console.log('✅ App theme setup complete');
  return theme;
}

/**
 * Export commonly used functions
 */
export {
  SIMPLE_THEME,
  SIMPLE_DARK_THEME,
  initializeTheme,
  color,
  gradient,
  createThemedButton,
  createThemedCard,
  createThemedText,
  createThemedInput,
  setupAppTheme
};