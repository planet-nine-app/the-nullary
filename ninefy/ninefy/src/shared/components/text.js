/**
 * Text SVG Component for The Nullary
 * Creates configurable text elements with embedded styling
 */

import { 
  createSVGContainer, 
  createSVGElement, 
  addSVGStyles, 
  getTextMetrics,
  generateSVGId 
} from '../utils/svg-utils.js';

/**
 * Default configuration for text components
 */
const DEFAULT_CONFIG = {
  // Content
  text: 'Sample Text',
  
  // Dimensions
  width: 'auto',
  height: 'auto',
  padding: 8,
  
  // Typography
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  lineHeight: 1.2,
  letterSpacing: 'normal',
  
  // Colors
  color: '#333333',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  borderWidth: 0,
  
  // Alignment
  textAlign: 'left', // left, center, right
  verticalAlign: 'top', // top, middle, bottom
  
  // Effects
  textShadow: null,
  opacity: 1,
  
  // Responsive
  responsive: false,
  maxWidth: null,
  
  // Styling
  className: 'nullary-text',
  customCSS: ''
};

/**
 * Create a text SVG component
 * @param {Object} config - Configuration object
 * @returns {SVGElement} Complete SVG text component
 */
export function createTextComponent(config = {}) {
  // Merge with defaults
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Calculate text metrics
  const textMetrics = getTextMetrics(finalConfig.text, {
    fontFamily: finalConfig.fontFamily,
    fontSize: finalConfig.fontSize,
    fontWeight: finalConfig.fontWeight
  });
  
  // Calculate dimensions
  let width = finalConfig.width;
  let height = finalConfig.height;
  
  if (width === 'auto') {
    width = textMetrics.width + (finalConfig.padding * 2);
  }
  
  if (height === 'auto') {
    height = (finalConfig.fontSize * finalConfig.lineHeight) + (finalConfig.padding * 2);
  }
  
  // Create SVG container
  const svg = createSVGContainer({
    width: width,
    height: height,
    className: finalConfig.className
  });
  
  // Generate unique IDs
  const textId = generateSVGId('text');
  const bgId = generateSVGId('bg');
  
  // Create background rectangle if needed
  if (finalConfig.backgroundColor !== 'transparent' || finalConfig.borderWidth > 0) {
    const background = createSVGElement('rect', {
      id: bgId,
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: finalConfig.backgroundColor,
      stroke: finalConfig.borderColor,
      'stroke-width': finalConfig.borderWidth,
      rx: finalConfig.borderRadius || 0
    });
    svg.appendChild(background);
  }
  
  // Calculate text position
  let textX, textY;
  
  switch (finalConfig.textAlign) {
    case 'center':
      textX = width / 2;
      break;
    case 'right':
      textX = width - finalConfig.padding;
      break;
    default: // left
      textX = finalConfig.padding;
  }
  
  switch (finalConfig.verticalAlign) {
    case 'middle':
      textY = (height / 2) + (textMetrics.ascent / 2);
      break;
    case 'bottom':
      textY = height - finalConfig.padding;
      break;
    default: // top
      textY = finalConfig.padding + textMetrics.ascent;
  }
  
  // Create text element
  const textElement = createSVGElement('text', {
    id: textId,
    x: textX,
    y: textY,
    'text-anchor': getTextAnchor(finalConfig.textAlign),
    'dominant-baseline': getDominantBaseline(finalConfig.verticalAlign),
    opacity: finalConfig.opacity
  }, finalConfig.text);
  
  svg.appendChild(textElement);
  
  // Create embedded CSS
  const css = generateCSS(finalConfig, textId, bgId);
  addSVGStyles(svg, css);
  
  // Make responsive if requested
  if (finalConfig.responsive) {
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    
    if (finalConfig.maxWidth) {
      svg.style.maxWidth = finalConfig.maxWidth + 'px';
    }
  }
  
  return svg;
}

/**
 * Create a multiline text component
 * @param {Object} config - Configuration object with additional multiline options
 * @returns {SVGElement} Complete SVG multiline text component
 */
export function createMultilineTextComponent(config = {}) {
  const finalConfig = { 
    ...DEFAULT_CONFIG, 
    maxLines: 3,
    wordWrap: true,
    ellipsis: true,
    ...config 
  };
  
  // Split text into lines
  const lines = wrapText(finalConfig.text, finalConfig);
  
  // Calculate dimensions for multiline
  const lineHeight = finalConfig.fontSize * finalConfig.lineHeight;
  const totalHeight = (lines.length * lineHeight) + (finalConfig.padding * 2);
  
  // Update height
  let height = finalConfig.height;
  if (height === 'auto') {
    height = totalHeight;
  }
  
  // Calculate width based on longest line
  let width = finalConfig.width;
  if (width === 'auto') {
    const longestLine = lines.reduce((max, line) => {
      const metrics = getTextMetrics(line, finalConfig);
      return Math.max(max, metrics.width);
    }, 0);
    width = longestLine + (finalConfig.padding * 2);
  }
  
  // Create SVG container
  const svg = createSVGContainer({
    width: width,
    height: height,
    className: finalConfig.className
  });
  
  // Generate unique IDs
  const textGroupId = generateSVGId('text-group');
  const bgId = generateSVGId('bg');
  
  // Create background if needed
  if (finalConfig.backgroundColor !== 'transparent' || finalConfig.borderWidth > 0) {
    const background = createSVGElement('rect', {
      id: bgId,
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: finalConfig.backgroundColor,
      stroke: finalConfig.borderColor,
      'stroke-width': finalConfig.borderWidth,
      rx: finalConfig.borderRadius || 0
    });
    svg.appendChild(background);
  }
  
  // Create text group
  const textGroup = createSVGElement('g', { id: textGroupId });
  
  // Add each line
  lines.forEach((line, index) => {
    const textY = finalConfig.padding + (finalConfig.fontSize * 0.8) + (index * lineHeight);
    let textX;
    
    switch (finalConfig.textAlign) {
      case 'center':
        textX = width / 2;
        break;
      case 'right':
        textX = width - finalConfig.padding;
        break;
      default: // left
        textX = finalConfig.padding;
    }
    
    const lineElement = createSVGElement('text', {
      x: textX,
      y: textY,
      'text-anchor': getTextAnchor(finalConfig.textAlign),
      opacity: finalConfig.opacity
    }, line);
    
    textGroup.appendChild(lineElement);
  });
  
  svg.appendChild(textGroup);
  
  // Create embedded CSS
  const css = generateMultilineCSS(finalConfig, textGroupId, bgId);
  addSVGStyles(svg, css);
  
  // Make responsive if requested
  if (finalConfig.responsive) {
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = 'auto';
  }
  
  return svg;
}

/**
 * Helper function to generate CSS for text component
 */
function generateCSS(config, textId, bgId) {
  return `
    .${config.className} {
      font-family: ${config.fontFamily};
    }
    
    #${textId} {
      font-size: ${config.fontSize}px;
      font-weight: ${config.fontWeight};
      font-style: ${config.fontStyle};
      fill: ${config.color};
      letter-spacing: ${config.letterSpacing};
      ${config.textShadow ? `filter: drop-shadow(${config.textShadow});` : ''}
    }
    
    ${bgId ? `
    #${bgId} {
      transition: all 0.2s ease;
    }
    
    .${config.className}:hover #${bgId} {
      opacity: 0.9;
    }
    ` : ''}
    
    ${config.customCSS || ''}
  `;
}

/**
 * Helper function to generate CSS for multiline text component
 */
function generateMultilineCSS(config, groupId, bgId) {
  return `
    .${config.className} {
      font-family: ${config.fontFamily};
    }
    
    #${groupId} text {
      font-size: ${config.fontSize}px;
      font-weight: ${config.fontWeight};
      font-style: ${config.fontStyle};
      fill: ${config.color};
      letter-spacing: ${config.letterSpacing};
      ${config.textShadow ? `filter: drop-shadow(${config.textShadow});` : ''}
    }
    
    ${bgId ? `
    #${bgId} {
      transition: all 0.2s ease;
    }
    ` : ''}
    
    ${config.customCSS || ''}
  `;
}

/**
 * Helper function to get SVG text-anchor value
 */
function getTextAnchor(textAlign) {
  switch (textAlign) {
    case 'center': return 'middle';
    case 'right': return 'end';
    default: return 'start';
  }
}

/**
 * Helper function to get SVG dominant-baseline value
 */
function getDominantBaseline(verticalAlign) {
  switch (verticalAlign) {
    case 'middle': return 'central';
    case 'bottom': return 'text-after-edge';
    default: return 'text-before-edge';
  }
}

/**
 * Helper function to wrap text into lines
 */
function wrapText(text, config) {
  if (!config.wordWrap) {
    return [text];
  }
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  const maxWidth = config.width - (config.padding * 2);
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = getTextMetrics(testLine, config);
    
    if (metrics.width <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Limit to maxLines if specified
  if (config.maxLines && lines.length > config.maxLines) {
    const truncatedLines = lines.slice(0, config.maxLines);
    if (config.ellipsis && truncatedLines.length > 0) {
      truncatedLines[truncatedLines.length - 1] += '...';
    }
    return truncatedLines;
  }
  
  return lines;
}

/**
 * Export default configuration for external use
 */
export { DEFAULT_CONFIG as textComponentDefaults };