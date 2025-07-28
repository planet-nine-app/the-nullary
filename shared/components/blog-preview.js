/**
 * Blog Preview Component for The Nullary
 * Creates SVG-based blog post preview cards for Sanora integration
 */

import { createSVGContainer, createSVGElement, generateSVGId } from '../utils/svg-utils.js';

/**
 * Default blog preview configuration
 */
const DEFAULT_BLOG_PREVIEW_CONFIG = {
  // Card dimensions
  width: 400,
  height: 320,
  
  // Layout
  imageHeight: 200,
  padding: 20,
  spacing: 12,
  borderRadius: 12,
  
  // Typography
  titleFontSize: 18,
  descriptionFontSize: 14,
  metaFontSize: 12,
  titleLineHeight: 1.3,
  descriptionLineHeight: 1.5,
  
  // Colors
  backgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  titleColor: '#1a202c',
  descriptionColor: '#4a5568',
  metaColor: '#718096',
  hoverColor: '#f7fafc',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  
  // Interaction
  hoverEnabled: true,
  clickable: true,
  
  // External URL support
  showExternalIcon: true,
  externalIconSize: 16,
  
  // Animation
  transitionDuration: 200,
  
  className: 'blog-preview-card'
};

/**
 * Create blog preview card SVG component
 * @param {Object} blogPost - Blog post data
 * @param {Object} config - Configuration object
 * @param {Function} onClick - Click handler
 * @returns {SVGElement} Blog preview card SVG
 */
export function createBlogPreviewCard(blogPost, config = {}, onClick = null) {
  const finalConfig = { ...DEFAULT_BLOG_PREVIEW_CONFIG, ...config };
  
  // Extract blog post data
  const {
    title = 'Untitled Post',
    description = 'No description available',
    previewImage = null,
    publishDate = new Date().toISOString(),
    author = 'Anonymous',
    externalUrl = null,
    price = null,
    type = 'hosted' // 'hosted' or 'external'
  } = blogPost;
  
  // Create SVG container
  const svg = createSVGContainer({
    width: finalConfig.width,
    height: finalConfig.height,
    className: finalConfig.className,
    style: `cursor: ${finalConfig.clickable ? 'pointer' : 'default'};`
  });
  
  // Add definitions for gradients and filters
  const defs = createSVGElement('defs');
  
  // Card shadow filter
  const shadowFilter = createSVGElement('filter', {
    id: generateSVGId('card-shadow'),
    x: '-20%', y: '-20%', width: '140%', height: '140%'
  });
  shadowFilter.innerHTML = `
    <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${finalConfig.shadowColor}"/>
  `;
  
  // Hover glow filter
  const glowFilter = createSVGElement('filter', {
    id: generateSVGId('card-glow'),
    x: '-20%', y: '-20%', width: '140%', height: '140%'
  });
  glowFilter.innerHTML = `
    <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="${finalConfig.shadowColor}"/>
  `;
  
  // Image mask for rounded corners
  const imageMask = createSVGElement('mask', {
    id: generateSVGId('image-mask')
  });
  imageMask.innerHTML = `
    <rect x="0" y="0" width="${finalConfig.width}" height="${finalConfig.imageHeight}" 
          rx="${finalConfig.borderRadius}" ry="${finalConfig.borderRadius}" fill="white"/>
  `;
  
  defs.appendChild(shadowFilter);
  defs.appendChild(glowFilter);
  defs.appendChild(imageMask);
  svg.appendChild(defs);
  
  // Main card background
  const cardBg = createSVGElement('rect', {
    id: 'card-background',
    width: finalConfig.width,
    height: finalConfig.height,
    rx: finalConfig.borderRadius,
    ry: finalConfig.borderRadius,
    fill: finalConfig.backgroundColor,
    stroke: finalConfig.borderColor,
    'stroke-width': '1',
    filter: `url(#${shadowFilter.id})`
  });
  svg.appendChild(cardBg);
  
  // Preview image or placeholder\n  let imageElement;\n  if (previewImage) {\n    imageElement = createSVGElement('image', {\n      href: previewImage,\n      x: '0',\n      y: '0',\n      width: finalConfig.width,\n      height: finalConfig.imageHeight,\n      mask: `url(#${imageMask.id})`,\n      preserveAspectRatio: 'xMidYMid slice'\n    });\n  } else {\n    // Create placeholder image\n    const placeholderBg = createSVGElement('rect', {\n      x: '0',\n      y: '0',\n      width: finalConfig.width,\n      height: finalConfig.imageHeight,\n      fill: '#f7fafc',\n      mask: `url(#${imageMask.id})`\n    });\n    \n    const placeholderIcon = createSVGElement('text', {\n      x: finalConfig.width / 2,\n      y: finalConfig.imageHeight / 2,\n      'font-size': '48',\n      fill: '#cbd5e0',\n      'text-anchor': 'middle',\n      'dominant-baseline': 'central'\n    }, '📝');\n    \n    svg.appendChild(placeholderBg);\n    svg.appendChild(placeholderIcon);\n    imageElement = placeholderBg;\n  }\n  \n  if (previewImage) {\n    svg.appendChild(imageElement);\n  }\n  \n  // Content area\n  const contentY = finalConfig.imageHeight + finalConfig.padding;\n  \n  // Title (with word wrapping)\n  const titleLines = wrapText(title, finalConfig.width - (finalConfig.padding * 2), finalConfig.titleFontSize);\n  const titleGroup = createSVGElement('g', { id: 'title-group' });\n  \n  titleLines.slice(0, 2).forEach((line, index) => { // Limit to 2 lines\n    const titleText = createSVGElement('text', {\n      x: finalConfig.padding,\n      y: contentY + (index * finalConfig.titleFontSize * finalConfig.titleLineHeight),\n      'font-size': finalConfig.titleFontSize,\n      'font-weight': 'bold',\n      'font-family': 'Georgia, serif',\n      fill: finalConfig.titleColor\n    }, line + (index === 1 && titleLines.length > 2 ? '...' : ''));\n    titleGroup.appendChild(titleText);\n  });\n  svg.appendChild(titleGroup);\n  \n  // Description\n  const descriptionY = contentY + (titleLines.length * finalConfig.titleFontSize * finalConfig.titleLineHeight) + finalConfig.spacing;\n  const descriptionLines = wrapText(description, finalConfig.width - (finalConfig.padding * 2), finalConfig.descriptionFontSize);\n  const descriptionGroup = createSVGElement('g', { id: 'description-group' });\n  \n  descriptionLines.slice(0, 3).forEach((line, index) => { // Limit to 3 lines\n    const descText = createSVGElement('text', {\n      x: finalConfig.padding,\n      y: descriptionY + (index * finalConfig.descriptionFontSize * finalConfig.descriptionLineHeight),\n      'font-size': finalConfig.descriptionFontSize,\n      'font-family': 'Arial, sans-serif',\n      fill: finalConfig.descriptionColor\n    }, line + (index === 2 && descriptionLines.length > 3 ? '...' : ''));\n    descriptionGroup.appendChild(descText);\n  });\n  svg.appendChild(descriptionGroup);\n  \n  // Meta information (author, date, price)\n  const metaY = finalConfig.height - finalConfig.padding - finalConfig.metaFontSize;\n  \n  // Format date\n  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {\n    year: 'numeric',\n    month: 'short',\n    day: 'numeric'\n  });\n  \n  // Author and date\n  const authorText = createSVGElement('text', {\n    x: finalConfig.padding,\n    y: metaY,\n    'font-size': finalConfig.metaFontSize,\n    'font-family': 'Arial, sans-serif',\n    fill: finalConfig.metaColor\n  }, `By ${author} • ${formattedDate}`);\n  svg.appendChild(authorText);\n  \n  // Price or external indicator\n  if (price !== null) {\n    const priceText = createSVGElement('text', {\n      x: finalConfig.width - finalConfig.padding,\n      y: metaY,\n      'font-size': finalConfig.metaFontSize,\n      'font-weight': 'bold',\n      'font-family': 'Arial, sans-serif',\n      fill: finalConfig.titleColor,\n      'text-anchor': 'end'\n    }, `$${(price / 100).toFixed(2)}`);\n    svg.appendChild(priceText);\n  } else if (externalUrl && finalConfig.showExternalIcon) {\n    const externalIcon = createSVGElement('text', {\n      x: finalConfig.width - finalConfig.padding,\n      y: metaY,\n      'font-size': finalConfig.externalIconSize,\n      'font-family': 'Arial, sans-serif',\n      fill: finalConfig.metaColor,\n      'text-anchor': 'end'\n    }, '🔗');\n    svg.appendChild(externalIcon);\n  }\n  \n  // Type indicator\n  if (type === 'external') {\n    const typeIndicator = createSVGElement('rect', {\n      x: finalConfig.width - finalConfig.padding - 60,\n      y: finalConfig.padding,\n      width: 50,\n      height: 20,\n      rx: 10,\n      fill: 'rgba(59, 130, 246, 0.1)',\n      stroke: '#3b82f6',\n      'stroke-width': '1'\n    });\n    \n    const typeText = createSVGElement('text', {\n      x: finalConfig.width - finalConfig.padding - 35,\n      y: finalConfig.padding + 14,\n      'font-size': '10',\n      'font-family': 'Arial, sans-serif',\n      fill: '#3b82f6',\n      'text-anchor': 'middle'\n    }, 'External');\n    \n    svg.appendChild(typeIndicator);\n    svg.appendChild(typeText);\n  }\n  \n  // Hover effects\n  if (finalConfig.hoverEnabled) {\n    svg.addEventListener('mouseenter', () => {\n      cardBg.setAttribute('fill', finalConfig.hoverColor);\n      cardBg.setAttribute('filter', `url(#${glowFilter.id})`);\n      \n      if (finalConfig.clickable) {\n        svg.style.transform = 'translateY(-2px)';\n        svg.style.transition = `transform ${finalConfig.transitionDuration}ms ease`;\n      }\n    });\n    \n    svg.addEventListener('mouseleave', () => {\n      cardBg.setAttribute('fill', finalConfig.backgroundColor);\n      cardBg.setAttribute('filter', `url(#${shadowFilter.id})`);\n      \n      if (finalConfig.clickable) {\n        svg.style.transform = 'translateY(0)';\n      }\n    });\n  }\n  \n  // Click handler\n  if (onClick && finalConfig.clickable) {\n    svg.addEventListener('click', (e) => {\n      e.preventDefault();\n      onClick(blogPost, e);\n    });\n  }\n  \n  return svg;\n}\n\n/**\n * Simple text wrapping function\n * @param {string} text - Text to wrap\n * @param {number} maxWidth - Maximum width\n * @param {number} fontSize - Font size\n * @returns {Array} Array of text lines\n */\nfunction wrapText(text, maxWidth, fontSize) {\n  const words = text.split(' ');\n  const lines = [];\n  let currentLine = '';\n  \n  // Approximate character width (this is rough, but works for basic wrapping)\n  const charWidth = fontSize * 0.6;\n  const maxChars = Math.floor(maxWidth / charWidth);\n  \n  words.forEach(word => {\n    const testLine = currentLine + (currentLine ? ' ' : '') + word;\n    if (testLine.length <= maxChars) {\n      currentLine = testLine;\n    } else {\n      if (currentLine) {\n        lines.push(currentLine);\n      }\n      currentLine = word;\n    }\n  });\n  \n  if (currentLine) {\n    lines.push(currentLine);\n  }\n  \n  return lines.length > 0 ? lines : [text];\n}\n\n/**\n * Create blog preview grid layout\n * @param {Array} blogPosts - Array of blog post data\n * @param {Object} config - Configuration object\n * @param {Function} onCardClick - Card click handler\n * @returns {HTMLElement} Container with blog preview cards\n */\nexport function createBlogPreviewGrid(blogPosts, config = {}, onCardClick = null) {\n  const gridConfig = {\n    columns: 2,\n    gap: 20,\n    ...config\n  };\n  \n  const container = document.createElement('div');\n  container.className = 'blog-preview-grid';\n  container.style.cssText = `\n    display: grid;\n    grid-template-columns: repeat(${gridConfig.columns}, 1fr);\n    gap: ${gridConfig.gap}px;\n    padding: 20px;\n    max-width: 1200px;\n    margin: 0 auto;\n    \n    /* Responsive grid */\n    @media (max-width: 768px) {\n      grid-template-columns: 1fr;\n    }\n  `;\n  \n  blogPosts.forEach(post => {\n    const cardContainer = document.createElement('div');\n    const card = createBlogPreviewCard(post, config.cardConfig, onCardClick);\n    cardContainer.appendChild(card);\n    container.appendChild(cardContainer);\n  });\n  \n  return container;\n}\n\n/**\n * Create a loading state for blog preview cards\n * @param {Object} config - Configuration object\n * @returns {SVGElement} Loading skeleton SVG\n */\nexport function createBlogPreviewSkeleton(config = {}) {\n  const finalConfig = { ...DEFAULT_BLOG_PREVIEW_CONFIG, ...config };\n  \n  const svg = createSVGContainer({\n    width: finalConfig.width,\n    height: finalConfig.height,\n    className: 'blog-preview-skeleton'\n  });\n  \n  // Add CSS animation for shimmer effect\n  const defs = createSVGElement('defs');\n  const shimmerGradient = createSVGElement('linearGradient', {\n    id: generateSVGId('shimmer'),\n    x1: '0%', y1: '0%', x2: '100%', y2: '0%'\n  });\n  shimmerGradient.innerHTML = `\n    <stop offset=\"0%\" stop-color=\"#f0f0f0\" stop-opacity=\"0.6\">\n      <animate attributeName=\"stop-opacity\" values=\"0.6;1;0.6\" dur=\"2s\" repeatCount=\"indefinite\"/>\n    </stop>\n    <stop offset=\"50%\" stop-color=\"#e0e0e0\" stop-opacity=\"1\">\n      <animate attributeName=\"stop-opacity\" values=\"1;0.6;1\" dur=\"2s\" repeatCount=\"indefinite\"/>\n    </stop>\n    <stop offset=\"100%\" stop-color=\"#f0f0f0\" stop-opacity=\"0.6\">\n      <animate attributeName=\"stop-opacity\" values=\"0.6;1;0.6\" dur=\"2s\" repeatCount=\"indefinite\"/>\n    </stop>\n  `;\n  defs.appendChild(shimmerGradient);\n  svg.appendChild(defs);\n  \n  // Card background\n  const cardBg = createSVGElement('rect', {\n    width: finalConfig.width,\n    height: finalConfig.height,\n    rx: finalConfig.borderRadius,\n    fill: '#f8f9fa',\n    stroke: '#e9ecef',\n    'stroke-width': '1'\n  });\n  svg.appendChild(cardBg);\n  \n  // Image placeholder\n  const imagePlaceholder = createSVGElement('rect', {\n    x: '0', y: '0',\n    width: finalConfig.width,\n    height: finalConfig.imageHeight,\n    fill: `url(#${shimmerGradient.id})`\n  });\n  svg.appendChild(imagePlaceholder);\n  \n  // Title placeholders\n  const titleY = finalConfig.imageHeight + finalConfig.padding;\n  for (let i = 0; i < 2; i++) {\n    const titleLine = createSVGElement('rect', {\n      x: finalConfig.padding,\n      y: titleY + (i * 25),\n      width: i === 0 ? finalConfig.width - 40 : finalConfig.width - 80,\n      height: 18,\n      rx: 4,\n      fill: `url(#${shimmerGradient.id})`\n    });\n    svg.appendChild(titleLine);\n  }\n  \n  // Description placeholders\n  const descY = titleY + 60;\n  for (let i = 0; i < 3; i++) {\n    const descLine = createSVGElement('rect', {\n      x: finalConfig.padding,\n      y: descY + (i * 20),\n      width: i === 2 ? finalConfig.width - 60 : finalConfig.width - 40,\n      height: 14,\n      rx: 3,\n      fill: `url(#${shimmerGradient.id})`\n    });\n    svg.appendChild(descLine);\n  }\n  \n  // Meta placeholder\n  const metaY = finalConfig.height - finalConfig.padding - 12;\n  const metaPlaceholder = createSVGElement('rect', {\n    x: finalConfig.padding,\n    y: metaY - 6,\n    width: 150,\n    height: 12,\n    rx: 2,\n    fill: `url(#${shimmerGradient.id})`\n  });\n  svg.appendChild(metaPlaceholder);\n  \n  return svg;\n}\n\n/**\n * Export default configuration\n */\nexport { DEFAULT_BLOG_PREVIEW_CONFIG as blogPreviewDefaults };