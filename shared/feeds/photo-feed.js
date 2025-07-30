/**
 * Shared Photo Feed Component
 * Reusable photo feed functionality for photary and screenary
 */

import { createSVGContainer, createSVGElement, generateSVGId } from '../utils/svg-utils.js';

/**
 * Create a photo row SVG component
 * @param {string} text - Description text for the photo
 * @param {Array} images - Array of image objects with fullsize URLs
 * @param {Object} options - Configuration options
 * @returns {SVGElement} Photo row SVG element
 */
export function createPhotaryRow(text, images = [], options = {}) {
  const IMAGE_DIMENSION = options.imageDimension || 552;
  const MORE_THAN_ONE_IMAGE = images && images.length > 1;

  const textHeight = text ? Math.floor((text.length / 32) * 27) : 0;
  const totalHeight = IMAGE_DIMENSION + textHeight + (16 * (images && images.length > 0 ? 3 : 2));

  const svg = `
    <!-- Dark Background -->
    <linearGradient id="frameGradient-${generateSVGId()}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="purple"/>
        <stop offset="100%" stop-color="green"/>
    </linearGradient>
   
    ${images && images.length > 0 ? `
    <!-- Image Display Area -->
    <rect x="16" y="16" width="${IMAGE_DIMENSION}" height="${IMAGE_DIMENSION}" rx="8" fill="#252529" stroke="url(#frameGradient-${generateSVGId()})" stroke-width="2"/>
    
    <!-- Main Image -->
    <g class="image-container">
      ${images ? `<image x="24" y="24" width="${IMAGE_DIMENSION - 16}" height="${IMAGE_DIMENSION - 16}" rx="8" href="${images[0].fullsize || images[0]}"></image>` : ''}
    </g>

    ${MORE_THAN_ONE_IMAGE ? `
    <!-- Navigation Arrows -->
    <g class="nav-arrow prev" style="cursor: pointer;">
      <circle cx="75" cy="270" r="25" fill="#252529" stroke="#444" stroke-width="1" opacity="0.8"/>
      <path d="M85,270 L65,270 M75,260 L65,270 L75,280" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    
    <g class="nav-arrow next" style="cursor: pointer;">
      <circle cx="525" cy="270" r="25" fill="#252529" stroke="#444" stroke-width="1" opacity="0.8"/>
      <path d="M515,270 L535,270 M525,260 L535,270 L525,280" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    
    <!-- Navigation Dots -->
    <g class="nav-dots" transform="translate(300, ${IMAGE_DIMENSION - 30})">
      ${images.map((_, index) => `
        <circle cx="${(index - Math.floor(images.length / 2)) * 40}" cy="0" r="8" fill="${index === 0 ? '#3eda82' : '#555555'}" class="nav-dot" data-index="${index}"/>
        ${index === 0 ? `
          <circle cx="${(index - Math.floor(images.length / 2)) * 40}" cy="0" r="12" fill="none" stroke="#3eda82" stroke-width="2" opacity="0.5">
            <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
          </circle>
        ` : ''}
      `).join('')}
    </g>
    
    <!-- Swipe Gesture Indicator -->
    <g opacity="0.4">
      <path d="M280,270 C310,260 330,260 360,270" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,4" fill="none">
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M350,265 L360,270 L350,275" stroke="#ffffff" stroke-width="2" fill="none"/>
    </g>` : ''}` : ''}

    <!-- Text Area -->
    ${text ? `
    <rect x="16" y="${IMAGE_DIMENSION + 32}" width="568" height="${textHeight + 32}" rx="8" fill="#252529" stroke="url(#frameGradient-${generateSVGId()})" stroke-width="2"></rect>
    <foreignObject x="32" y="${IMAGE_DIMENSION + 48}" width="536" height="${textHeight}">
      <div style="font-family: Georgia, serif; font-size: 18px; color: white; line-height: 1.4;">
        <p style="margin: 0;">${text}</p>
      </div>
    </foreignObject>` : ''}
  `;

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  container.setAttribute('width', '100%');
  container.setAttribute('height', '100%');
  container.setAttribute('viewBox', `0 0 600 ${totalHeight}`);
  container.innerHTML = svg;

  // Add interaction functionality
  addPhotoInteractions(container, images);

  container.aspectRatio = 600 / totalHeight;
  return container;
}

/**
 * Add interactive functionality to photo row
 * @param {SVGElement} container - The SVG container
 * @param {Array} images - Array of images
 */
function addPhotoInteractions(container, images) {
  if (!images || images.length <= 1) return;

  let currentIndex = 0;
  const imageElement = container.querySelector('.image-container image');
  const dots = container.querySelectorAll('.nav-dot');
  
  function updateImage(index) {
    if (index >= 0 && index < images.length) {
      currentIndex = index;
      imageElement.setAttribute('href', images[currentIndex].fullsize || images[currentIndex]);
      
      // Update dots
      dots.forEach((dot, i) => {
        dot.setAttribute('fill', i === currentIndex ? '#3eda82' : '#555555');
        
        // Remove existing glow
        const existingGlow = dot.parentNode.querySelector('circle[stroke="#3eda82"]');
        if (existingGlow && existingGlow !== dot) {
          existingGlow.remove();
        }
        
        // Add glow to current dot
        if (i === currentIndex) {
          const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          glow.setAttribute('cx', dot.getAttribute('cx'));
          glow.setAttribute('cy', dot.getAttribute('cy'));
          glow.setAttribute('r', '12');
          glow.setAttribute('fill', 'none');
          glow.setAttribute('stroke', '#3eda82');
          glow.setAttribute('stroke-width', '2');
          glow.setAttribute('opacity', '0.5');
          
          const animate1 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
          animate1.setAttribute('attributeName', 'r');
          animate1.setAttribute('values', '12;16;12');
          animate1.setAttribute('dur', '2s');
          animate1.setAttribute('repeatCount', 'indefinite');
          
          const animate2 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
          animate2.setAttribute('attributeName', 'opacity');
          animate2.setAttribute('values', '0.5;0.2;0.5');
          animate2.setAttribute('dur', '2s');
          animate2.setAttribute('repeatCount', 'indefinite');
          
          glow.appendChild(animate1);
          glow.appendChild(animate2);
          dot.parentNode.insertBefore(glow, dot.nextSibling);
        }
      });
    }
  }

  // Navigation arrows
  const prevArrow = container.querySelector('.nav-arrow.prev');
  const nextArrow = container.querySelector('.nav-arrow.next');

  if (prevArrow) {
    prevArrow.addEventListener('click', () => {
      updateImage(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', () => {
      updateImage(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
    });
  }

  // Touch/swipe support
  let touchStartX = 0;
  const imageContainer = container.querySelector('.image-container');
  
  if (imageContainer) {
    imageContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    imageContainer.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (diff > 50) {
        updateImage(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
      } else if (diff < -50) {
        updateImage(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
      }
    });

    // Mouse drag support
    let mouseStartX = 0;
    let isDragging = false;

    imageContainer.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      isDragging = true;
      imageContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      // Optional: Add visual feedback during drag
    });

    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      imageContainer.style.cursor = 'grab';
      
      const diff = mouseStartX - e.clientX;
      if (diff > 50) {
        updateImage(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
      } else if (diff < -50) {
        updateImage(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
      }
    });
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => {
      updateImage(index);
    });
  });
}

/**
 * Create a photo feed container
 * @param {Array} posts - Array of photo posts
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} Photo feed container
 */
export function createPhotoFeed(posts = [], options = {}) {
  const container = document.createElement('div');
  container.classList.add('photo-feed-container');
  
  const style = `
    .photo-feed-container {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    .photo-post {
      width: 100%;
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
    }
    
    .photo-post-content {
      max-width: 600px;
      width: 100%;
    }
  `;
  
  // Add styles
  if (!document.getElementById('photo-feed-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'photo-feed-styles';
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
  }

  return container;
}

/**
 * Populate photo feed with posts
 * @param {HTMLElement} container - Feed container
 * @param {Array} posts - Array of photo posts
 * @param {Object} options - Configuration options
 */
export function populatePhotoFeed(container, posts = [], options = {}) {
  container.innerHTML = '';
  
  // Filter posts that have images
  const photoPosts = posts.filter(post => post.images && post.images.length > 0);
  
  if (photoPosts.length === 0) {
    container.innerHTML = createEmptyPhotoState(options);
    return;
  }

  // Create intersection observer for lazy loading
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.loaded) {
        const post = entry.target.postData;
        const photoRow = createPhotaryRow(post.description || post.title, post.images, options);
        entry.target.appendChild(photoRow);
        entry.target.loaded = true;
      }
    });
  }, {
    root: null,
    rootMargin: '200px',
    threshold: 0.1
  });

  photoPosts.forEach((post, index) => {
    const postElement = document.createElement('div');
    postElement.classList.add('photo-post');
    postElement.postData = post;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('photo-post-content');
    postElement.appendChild(contentWrapper);
    
    container.appendChild(postElement);
    observer.observe(postElement);
  });
}

/**
 * Create empty state for photo feed
 * @param {Object} options - Configuration options
 * @returns {string} Empty state HTML
 */
function createEmptyPhotoState(options = {}) {
  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
      color: white;
      font-family: Georgia, serif;
    ">
      <div style="font-size: 64px; margin-bottom: 20px;">📸</div>
      <h2 style="margin-bottom: 10px;">No Photos Yet</h2>
      <p style="color: rgba(255, 255, 255, 0.7);">
        ${options.emptyMessage || 'Photos will appear here when they are available.'}
      </p>
    </div>
  `;
}

export default {
  createPhotaryRow,
  createPhotoFeed,
  populatePhotoFeed
};