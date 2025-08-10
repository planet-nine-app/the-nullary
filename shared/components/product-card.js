/**
 * Product Card Components for The Nullary
 * Shared product/content card system for marketplace and content applications
 */

/**
 * Create a product card (used in ninefy for marketplace products)
 * @param {Object} product - Product data
 * @param {Object} config - Configuration options
 * @param {Object} theme - Theme configuration
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} The product card element
 */
export function createProductCard(product, config = {}, theme = {}, onClick = null) {
  const {
    width = '100%',
    height = 'auto',
    showPrice = true,
    showStats = true,
    showCategory = true
  } = config;

  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.cssText = `
    width: ${width};
    height: ${height};
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    cursor: ${onClick ? 'pointer' : 'default'};
    transition: all 0.3s ease;
    border: 1px solid ${theme.colors?.border || '#e1e5e9'};
    font-family: ${theme.typography?.fontFamily || 'system-ui'};
  `;
  
  // Hover effects
  if (onClick) {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    });
    
    card.addEventListener('click', () => onClick(product));
  }
  
  // Product image
  const imageContainer = document.createElement('div');
  imageContainer.style.cssText = `
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  `;
  
  if (product.featuredImage && product.featuredImage.startsWith('http')) {
    // Real image
    const img = document.createElement('img');
    img.src = product.featuredImage;
    img.alt = product.title || 'Product image';
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    img.onerror = () => {
      // Fallback to icon
      imageContainer.innerHTML = `
        <span style="font-size: 4rem; color: white;">${getCategoryIcon(product.category)}</span>
      `;
    };
    imageContainer.appendChild(img);
  } else if (product.featuredImage && product.featuredImage.startsWith('data:')) {
    // SVG data URL
    imageContainer.style.backgroundImage = `url(${product.featuredImage})`;
    imageContainer.style.backgroundSize = 'cover';
    imageContainer.style.backgroundPosition = 'center';
  } else {
    // Fallback icon
    imageContainer.innerHTML = `
      <span style="font-size: 4rem; color: white;">${getCategoryIcon(product.category)}</span>
    `;
  }
  
  // Category badge (if enabled)
  if (showCategory && product.category) {
    const categoryBadge = document.createElement('div');
    categoryBadge.style.cssText = `
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    `;
    categoryBadge.textContent = product.category;
    imageContainer.appendChild(categoryBadge);
  }
  
  // Product details
  const details = document.createElement('div');
  details.style.cssText = `
    padding: 20px;
  `;
  
  // Title
  const title = document.createElement('h3');
  title.style.cssText = `
    font-size: 1.4rem;
    margin: 0 0 10px 0;
    color: ${theme.colors?.primary || '#2c3e50'};
    font-weight: bold;
    line-height: 1.3;
  `;
  title.textContent = product.title || 'Untitled Product';
  
  // Author (if available)
  if (product.author) {
    const author = document.createElement('div');
    author.style.cssText = `
      font-size: 0.9rem;
      color: ${theme.colors?.secondary || '#7f8c8d'};
      margin-bottom: 8px;
    `;
    author.textContent = `by ${product.author}`;
    details.appendChild(author);
  }
  
  // Description
  const description = document.createElement('p');
  description.style.cssText = `
    color: ${theme.colors?.secondary || '#7f8c8d'};
    line-height: 1.5;
    margin: 0 0 15px 0;
    font-size: 0.95rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;
  description.textContent = product.description || 'No description available';
  
  details.appendChild(title);
  details.appendChild(description);
  
  // Stats row (downloads, rating, etc.)
  if (showStats && (product.downloads || product.rating)) {
    const stats = document.createElement('div');
    stats.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      font-size: 0.85rem;
      color: ${theme.colors?.secondary || '#7f8c8d'};
    `;
    
    if (product.downloads) {
      const downloadsSpan = document.createElement('span');
      downloadsSpan.innerHTML = `📥 ${product.downloads}`;
      stats.appendChild(downloadsSpan);
    }
    
    if (product.rating) {
      const ratingSpan = document.createElement('span');
      const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
      ratingSpan.innerHTML = `${stars} (${product.rating})`;
      stats.appendChild(ratingSpan);
    }
    
    if (product.fileSize) {
      const sizeSpan = document.createElement('span');
      sizeSpan.innerHTML = `💾 ${product.fileSize}`;
      stats.appendChild(sizeSpan);
    }
    
    details.appendChild(stats);
  }
  
  // Price (if enabled)
  if (showPrice) {
    const priceContainer = document.createElement('div');
    priceContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    const price = document.createElement('div');
    price.style.cssText = `
      font-size: 1.5rem;
      font-weight: bold;
      color: ${theme.colors?.accent || '#27ae60'};
    `;
    
    if (product.price === 0) {
      price.textContent = 'Free';
      price.style.color = theme.colors?.success || '#27ae60';
    } else {
      price.textContent = formatPrice(product.price);
    }
    
    priceContainer.appendChild(price);
    
    // Add base info if available
    if (product.baseName) {
      const baseInfo = document.createElement('div');
      baseInfo.style.cssText = `
        font-size: 0.8rem;
        color: ${theme.colors?.secondary || '#7f8c8d'};
        text-align: right;
      `;
      baseInfo.innerHTML = `from<br><strong>${product.baseName}</strong>`;
      priceContainer.appendChild(baseInfo);
    }
    
    details.appendChild(priceContainer);
  }
  
  card.appendChild(imageContainer);
  card.appendChild(details);
  
  return card;
}

/**
 * Create a blog post card (used in rhapsold for blog content)
 * @param {Object} post - Blog post data
 * @param {Object} config - Configuration options
 * @param {Object} theme - Theme configuration
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} The blog post card element
 */
export function createBlogPostCard(post, config = {}, theme = {}, onClick = null) {
  const {
    width = '100%',
    height = 'auto',
    showDate = true,
    showReadTime = true,
    showAuthor = true
  } = config;

  const card = document.createElement('div');
  card.className = 'blog-post-card';
  card.style.cssText = `
    width: ${width};
    height: ${height};
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    cursor: ${onClick ? 'pointer' : 'default'};
    transition: all 0.3s ease;
    border: 1px solid ${theme.colors?.border || '#e1e5e9'};
    font-family: ${theme.typography?.fontFamily || 'system-ui'};
  `;
  
  // Hover effects
  if (onClick) {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    });
    
    card.addEventListener('click', () => onClick(post));
  }
  
  // Header image or gradient
  const header = document.createElement('div');
  header.style.cssText = `
    height: 150px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  `;
  
  if (post.image) {
    header.style.backgroundImage = `url(${post.image})`;
    header.style.backgroundSize = 'cover';
    header.style.backgroundPosition = 'center';
  } else {
    header.innerHTML = `
      <span style="font-size: 3rem; color: white;">📝</span>
    `;
  }
  
  // Content
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 20px;
  `;
  
  // Title
  const title = document.createElement('h3');
  title.style.cssText = `
    font-size: 1.4rem;
    margin: 0 0 10px 0;
    color: ${theme.colors?.primary || '#2c3e50'};
    font-weight: bold;
    line-height: 1.3;
  `;
  title.textContent = post.title || 'Untitled Post';
  
  // Meta info (author, date, read time)
  const meta = document.createElement('div');
  meta.style.cssText = `
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    font-size: 0.85rem;
    color: ${theme.colors?.secondary || '#7f8c8d'};
  `;
  
  if (showAuthor && post.author) {
    const authorSpan = document.createElement('span');
    authorSpan.textContent = `by ${post.author}`;
    meta.appendChild(authorSpan);
  }
  
  if (showDate && post.date) {
    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatDate(post.date);
    meta.appendChild(dateSpan);
  }
  
  if (showReadTime && post.readTime) {
    const readTimeSpan = document.createElement('span');
    readTimeSpan.innerHTML = `⏱️ ${post.readTime} min read`;
    meta.appendChild(readTimeSpan);
  }
  
  // Excerpt
  const excerpt = document.createElement('p');
  excerpt.style.cssText = `
    color: ${theme.colors?.text || '#2c3e50'};
    line-height: 1.6;
    margin: 0;
    font-size: 0.95rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;
  excerpt.textContent = post.excerpt || post.description || 'No excerpt available';
  
  content.appendChild(title);
  if (meta.children.length > 0) content.appendChild(meta);
  content.appendChild(excerpt);
  
  card.appendChild(header);
  card.appendChild(content);
  
  return card;
}

/**
 * Format price in cents to dollars
 */
function formatPrice(priceInCents) {
  if (typeof priceInCents !== 'number') {
    return '$0.00';
  }
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Get category icon for product types
 */
function getCategoryIcon(category) {
  const icons = {
    ebook: '📚',
    course: '🎓', 
    ticket: '🎫',
    shippable: '📦',
    sodoto: '✅',
    music: '🎵',
    software: '💻',
    template: '📋',
    blog: '📝',
    video: '🎥',
    photo: '📸',
    default: '📄'
  };
  
  return icons[category?.toLowerCase()] || icons.default;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

/**
 * Create a grid container for cards
 * @param {Object} config - Configuration options
 * @returns {HTMLElement} Grid container
 */
export function createCardGrid(config = {}) {
  const {
    minCardWidth = '350px',
    gap = '20px',
    padding = '20px'
  } = config;
  
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(${minCardWidth}, 1fr));
    gap: ${gap};
    padding: ${padding};
  `;
  
  return grid;
}