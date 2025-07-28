/**
 * SVG Utilities for The Nullary Shared Components
 * Helper functions for creating and manipulating SVG elements
 */

/**
 * Create an SVG element with specified attributes
 * @param {string} tagName - SVG element tag name (e.g., 'svg', 'text', 'rect')
 * @param {Object} attributes - Key-value pairs of attributes
 * @param {string} content - Inner content (for text elements)
 * @returns {SVGElement} Created SVG element
 */
export function createSVGElement(tagName, attributes = {}, content = '') {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  // Set content for text elements
  if (content && (tagName === 'text' || tagName === 'tspan')) {
    element.textContent = content;
  } else if (content) {
    element.innerHTML = content;
  }
  
  return element;
}

/**
 * Create a complete SVG container with viewBox and basic setup
 * @param {Object} config - Configuration object
 * @param {number} config.width - SVG width
 * @param {number} config.height - SVG height  
 * @param {string} config.viewBox - Custom viewBox (optional)
 * @param {string} config.className - CSS class name (optional)
 * @returns {SVGElement} Complete SVG container
 */
export function createSVGContainer(config) {
  const {
    width = 200,
    height = 100,
    viewBox = null,
    className = 'nullary-component'
  } = config;
  
  const svg = createSVGElement('svg', {
    width: width,
    height: height,
    viewBox: viewBox || `0 0 ${width} ${height}`,
    class: className,
    xmlns: 'http://www.w3.org/2000/svg'
  });
  
  return svg;
}

/**
 * Add embedded CSS styles to an SVG element
 * @param {SVGElement} svg - Target SVG element
 * @param {string} cssText - CSS rules as string
 */
export function addSVGStyles(svg, cssText) {
  const styleElement = createSVGElement('style', {
    type: 'text/css'
  });
  
  // Wrap in CDATA for compatibility
  styleElement.textContent = `<![CDATA[${cssText}]]>`;
  
  // Insert at beginning of SVG
  svg.insertBefore(styleElement, svg.firstChild);
}

/**
 * Calculate text metrics for proper positioning
 * @param {string} text - Text to measure
 * @param {Object} style - Text styling
 * @param {string} style.fontFamily - Font family
 * @param {number} style.fontSize - Font size in pixels
 * @param {string} style.fontWeight - Font weight
 * @returns {Object} Text dimensions
 */
export function getTextMetrics(text, style = {}) {
  const {
    fontFamily = 'Arial, sans-serif',
    fontSize = 16,
    fontWeight = 'normal'
  } = style;
  
  // Create temporary canvas for measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  
  const metrics = context.measureText(text);
  
  return {
    width: metrics.width,
    height: fontSize, // Approximate height
    ascent: metrics.fontBoundingBoxAscent || fontSize * 0.8,
    descent: metrics.fontBoundingBoxDescent || fontSize * 0.2
  };
}

/**
 * Generate unique IDs for SVG elements
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function generateSVGId(prefix = 'nullary') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Apply responsive scaling to SVG based on container
 * @param {SVGElement} svg - SVG element to make responsive
 * @param {number} aspectRatio - Width/height ratio to maintain
 */
export function makeResponsive(svg, aspectRatio = null) {
  const viewBox = svg.getAttribute('viewBox');
  if (!viewBox) return;
  
  const [x, y, width, height] = viewBox.split(' ').map(Number);
  const ratio = aspectRatio || (width / height);
  
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.style.maxWidth = '100%';
  svg.style.aspectRatio = ratio.toString();
}

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color string (#RGB or #RRGGBB)
 * @returns {Object} RGB values
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Create a gradient definition
 * @param {SVGElement} svg - Parent SVG element
 * @param {Object} config - Gradient configuration
 * @param {string} config.id - Gradient ID
 * @param {Array} config.stops - Array of {offset, color} objects
 * @param {string} config.type - 'linear' or 'radial'
 * @param {Object} config.direction - Direction for linear gradients
 * @returns {string} Gradient ID for use in fill/stroke
 */
export function createGradient(svg, config) {
  const {
    id = generateSVGId('gradient'),
    stops = [],
    type = 'linear',
    direction = { x1: 0, y1: 0, x2: 1, y2: 0 }
  } = config;
  
  // Create or get defs element
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = createSVGElement('defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  
  // Create gradient element
  const gradientTag = type === 'radial' ? 'radialGradient' : 'linearGradient';
  const gradient = createSVGElement(gradientTag, {
    id: id,
    ...(type === 'linear' ? direction : {})
  });
  
  // Add color stops
  stops.forEach(stop => {
    const stopElement = createSVGElement('stop', {
      offset: `${stop.offset * 100}%`,
      'stop-color': stop.color,
      ...(stop.opacity !== undefined && { 'stop-opacity': stop.opacity })
    });
    gradient.appendChild(stopElement);
  });
  
  defs.appendChild(gradient);
  return `url(#${id})`;
}

/**
 * Clone an SVG element deeply
 * @param {SVGElement} element - Element to clone
 * @returns {SVGElement} Cloned element
 */
export function cloneSVGElement(element) {
  return element.cloneNode(true);
}

/**
 * Export SVG as data URL
 * @param {SVGElement} svg - SVG element to export
 * @returns {string} Data URL string
 */
export function svgToDataURL(svg) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

/**
 * Create animation element
 * @param {Object} config - Animation configuration
 * @param {string} config.attributeName - Attribute to animate
 * @param {string} config.values - Animation values
 * @param {string} config.dur - Duration
 * @param {string} config.repeatCount - Repeat count
 * @returns {SVGElement} Animation element
 */
export function createAnimation(config) {
  const {
    attributeName,
    values,
    dur = '1s',
    repeatCount = 'indefinite',
    type = 'animate'
  } = config;
  
  return createSVGElement(type, {
    attributeName,
    values,
    dur,
    repeatCount,
    ...config
  });
}