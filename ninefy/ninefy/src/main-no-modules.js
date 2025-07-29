/**
 * Ninefy - Main Application Entry Point (No ES6 Modules)
 * A minimalist digital goods marketplace using SVG components
 */

// Product category SVG data URLs (URL-encoded)
const PRODUCT_IMAGES = {
  ebook: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%234a90e2'/%3E%3Crect x='80' y='50' width='240' height='150' fill='%23ffffff' rx='8'/%3E%3Cline x1='100' y1='80' x2='280' y2='80' stroke='%234a90e2' stroke-width='2'/%3E%3Cline x1='100' y1='100' x2='280' y2='100' stroke='%234a90e2' stroke-width='2'/%3E%3Cline x1='100' y1='120' x2='250' y2='120' stroke='%234a90e2' stroke-width='2'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3EE-Book%3C/text%3E%3C/svg%3E",
  
  music: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%23e74c3c'/%3E%3Ccircle cx='200' cy='125' r='60' fill='%23ffffff'/%3E%3Ccircle cx='200' cy='125' r='15' fill='%23e74c3c'/%3E%3Crect x='190' y='65' width='20' height='60' fill='%23e74c3c'/%3E%3Cpath d='M210 65 Q230 60 230 80 L230 100 Q230 120 210 115 Z' fill='%23e74c3c'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3EMusic%3C/text%3E%3C/svg%3E",
  
  software: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%2334495e'/%3E%3Crect x='50' y='60' width='300' height='130' fill='%23ffffff' rx='10'/%3E%3Crect x='60' y='70' width='280' height='20' fill='%2334495e'/%3E%3Ccircle cx='70' cy='80' r='5' fill='%23e74c3c'/%3E%3Ccircle cx='85' cy='80' r='5' fill='%23f39c12'/%3E%3Ccircle cx='100' cy='80' r='5' fill='%2327ae60'/%3E%3Ctext x='60' y='110' fill='%2334495e' font-family='monospace' font-size='12'%3E%3C/html%3E%3C%3C/text%3E%3Ctext x='60' y='125' fill='%2334495e' font-family='monospace' font-size='12'%3E  function() {%3C/text%3E%3Ctext x='60' y='140' fill='%2334495e' font-family='monospace' font-size='12'%3E    return true;%3C/text%3E%3Ctext x='60' y='155' fill='%2334495e' font-family='monospace' font-size='12'%3E  }%3C/text%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ESoftware%3C/text%3E%3C/svg%3E",
  
  course: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%23f39c12'/%3E%3Crect x='50' y='70' width='300' height='110' fill='%23ffffff' rx='5'/%3E%3Crect x='60' y='80' width='120' height='90' fill='%23f39c12' rx='3'/%3E%3Ctext x='120' y='130' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='36' font-weight='bold'%3E▶%3C/text%3E%3Cline x1='200' y1='90' x2='330' y2='90' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='110' x2='320' y2='110' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='130' x2='310' y2='130' stroke='%23f39c12' stroke-width='2'/%3E%3Cline x1='200' y1='150' x2='300' y2='150' stroke='%23f39c12' stroke-width='2'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ECourse%3C/text%3E%3C/svg%3E",
  
  template: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%239b59b6'/%3E%3Crect x='50' y='50' width='120' height='150' fill='%23ffffff' rx='8'/%3E%3Crect x='180' y='50' width='120' height='150' fill='%23ffffff' rx='8'/%3E%3Crect x='310' y='50' width='40' height='150' fill='%23ffffff' rx='8'/%3E%3Crect x='60' y='60' width='100' height='20' fill='%239b59b6'/%3E%3Crect x='60' y='90' width='80' height='8' fill='%23ecf0f1'/%3E%3Crect x='60' y='105' width='90' height='8' fill='%23ecf0f1'/%3E%3Crect x='60' y='120' width='70' height='8' fill='%23ecf0f1'/%3E%3Crect x='190' y='60' width='100' height='20' fill='%239b59b6'/%3E%3Crect x='190' y='90' width='80' height='8' fill='%23ecf0f1'/%3E%3Crect x='190' y='105' width='90' height='8' fill='%23ecf0f1'/%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ETemplate%3C/text%3E%3C/svg%3E",
  
  ticket: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%2327ae60'/%3E%3Crect x='60' y='80' width='280' height='90' fill='%23ffffff' rx='8'/%3E%3Cpath d='M190 80 Q200 90 190 100 Q200 110 190 120 Q200 130 190 140 Q200 150 190 160 Q200 170 190 170 L210 170 Q200 170 210 160 Q200 150 210 140 Q200 130 210 120 Q200 110 210 100 Q200 90 210 80 Z' fill='%2327ae60'/%3E%3Ctext x='125' y='105' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='12' font-weight='bold'%3EEVENT%3C/text%3E%3Ctext x='125' y='125' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='20' font-weight='bold'%3ETICKET%3C/text%3E%3Ctext x='125' y='145' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='10'%3EADMIT ONE%3C/text%3E%3Ctext x='275' y='115' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='10'%3E$50.00%3C/text%3E%3Ctext x='275' y='135' text-anchor='middle' fill='%2327ae60' font-family='Arial' font-size='8'%3E#001234%3C/text%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='18' font-weight='bold'%3ETicket%3C/text%3E%3C/svg%3E"
};

// Teleported content data (marketplace-focused)
const TELEPORTED_CONTENT = [
  {
    id: 'tp-1',
    type: 'link',
    title: 'Digital Commerce Trends 2025',
    description: 'Latest insights on selling digital products in the decentralized web',
    url: 'https://planet-nine.org/digital-commerce',
    source: 'planet-nine.org',
    timestamp: '2025-01-28T08:00:00Z'
  },
  {
    id: 'tp-2', 
    type: 'image',
    title: 'Sanora Marketplace Architecture',
    description: 'How digital products are stored and distributed on allyabase',
    imageUrl: "data:image/svg+xml,%3Csvg width='400' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='250' fill='%234a90e2'/%3E%3Crect x='50' y='50' width='80' height='40' fill='%23ffffff' opacity='0.9' rx='5'/%3E%3Crect x='160' y='70' width='80' height='40' fill='%23ffffff' opacity='0.9' rx='5'/%3E%3Crect x='270' y='50' width='80' height='40' fill='%23ffffff' opacity='0.9' rx='5'/%3E%3Ctext x='90' y='75' text-anchor='middle' fill='%234a90e2' font-family='Arial' font-size='10' font-weight='bold'%3ESanora%3C/text%3E%3Ctext x='200' y='95' text-anchor='middle' fill='%234a90e2' font-family='Arial' font-size='10' font-weight='bold'%3EAddie%3C/text%3E%3Ctext x='310' y='75' text-anchor='middle' fill='%234a90e2' font-family='Arial' font-size='10' font-weight='bold'%3EBDO%3C/text%3E%3Ctext x='200' y='200' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='16' font-weight='bold'%3EMarketplace%3C/text%3E%3C/svg%3E",
    source: 'engineering.allyabase.com',
    timestamp: '2025-01-27T15:30:00Z'
  },
  {
    id: 'tp-3',
    type: 'video',
    title: 'Creating Your First Product on Ninefy',
    description: '10-minute walkthrough of the product creation process',
    videoUrl: 'https://example.com/ninefy-tutorial.mp4',
    thumbnail: "data:image/svg+xml,%3Csvg width='400' height='225' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='225' fill='%239b59b6'/%3E%3Ccircle cx='200' cy='112' r='30' fill='%23ffffff' opacity='0.9'/%3E%3Cpolygon points='190,102 190,122 210,112' fill='%239b59b6'/%3E%3Ctext x='200' y='180' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='14' font-weight='bold'%3ETutorial%3C/text%3E%3C/svg%3E",
    source: 'learn.ninefy.com',
    duration: '10:34',
    timestamp: '2025-01-26T12:45:00Z'
  },
  {
    id: 'tp-4',
    type: 'link',
    title: 'MAGIC Payment Integration Guide',
    description: 'How to accept payments for digital goods using MAGIC protocol',
    url: 'https://magic.planet-nine.org/payments',
    source: 'magic.planet-nine.org',
    timestamp: '2025-01-25T14:20:00Z'
  },
  {
    id: 'tp-5',
    type: 'code',
    title: 'Product Upload API Example',
    description: 'JavaScript code for uploading products to Sanora',
    codePreview: 'const product = await invoke("add_product", {\n  uuid: sanoraUser.uuid,\n  sanoraUrl: "http://localhost:7243",\n  title: "My Digital Product",\n  description: "Product description...",\n  price: 2999  // $29.99\n});',
    source: 'github.com/planet-nine-app',
    language: 'javascript',
    timestamp: '2025-01-24T16:15:00Z'
  }
];

// Sample product data
const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'The Complete JavaScript Handbook',
    description: 'A comprehensive guide to modern JavaScript development, covering ES6+, async programming, and best practices.',
    price: 4999, // $49.99 in cents
    category: 'ebook',
    author: 'Sarah Johnson',
    timestamp: '2025-01-28T10:30:00Z',
    downloadCount: 1247,
    rating: 4.8,
    tags: ['javascript', 'programming', 'web-development'],
    featuredImage: PRODUCT_IMAGES.ebook,
    previewContent: `# Chapter 1: Introduction to Modern JavaScript

JavaScript has evolved tremendously over the past decade. What started as a simple scripting language for web pages has become a powerful, versatile programming language used for:

- **Frontend Development**: Building interactive user interfaces
- **Backend Development**: Server-side applications with Node.js  
- **Mobile Apps**: React Native and other frameworks
- **Desktop Apps**: Electron and Tauri applications

## Key Features of ES6+

Modern JavaScript includes many powerful features:

\`\`\`javascript
// Arrow functions
const sum = (a, b) => a + b;

// Destructuring
const { name, age } = user;

// Template literals
const message = \`Hello, \${name}!\`;
\`\`\`

This handbook will take you through each concept step by step...`,
    fileSize: '2.4 MB',
    fileType: 'PDF'
  },
  {
    id: 'prod-2',
    title: 'Ambient Focus - Productivity Soundtrack',
    description: 'A carefully curated collection of ambient tracks designed to enhance focus and creativity during work sessions.',
    price: 1999, // $19.99
    category: 'music',
    author: 'Harmony Studios',
    timestamp: '2025-01-27T14:15:00Z',
    downloadCount: 892,
    rating: 4.9,
    tags: ['ambient', 'focus', 'productivity', 'instrumental'],
    featuredImage: PRODUCT_IMAGES.music,
    previewContent: '🎵 **Track Listing:**\n\n1. Morning Flow (6:42)\n2. Deep Concentration (8:15)\n3. Creative Spark (5:28)\n4. Mindful Pause (4:33)\n5. Evening Wind Down (7:12)\n\n**Total Runtime:** 32 minutes\n\n*"These tracks have transformed my work sessions. Perfect background music that doesn\'t distract but somehow makes everything flow better."* - Alex M.\n\nAll tracks are available in high-quality 320kbps MP3 and lossless FLAC formats.',
    fileSize: '156 MB',
    fileType: 'ZIP (MP3 + FLAC)'
  },
  {
    id: 'prod-3',
    title: 'React Component Library Starter',
    description: 'A professional-grade starter template for building and publishing React component libraries with TypeScript, Storybook, and automated testing.',
    price: 7999, // $79.99
    category: 'software',
    author: 'DevTools Pro',
    timestamp: '2025-01-26T09:45:00Z',
    downloadCount: 456,
    rating: 4.7,
    tags: ['react', 'typescript', 'components', 'storybook'],
    featuredImage: PRODUCT_IMAGES.software,
    previewContent: `# React Component Library Starter

## What's Included

✅ **TypeScript Setup** - Fully configured with strict typing  
✅ **Storybook Integration** - Interactive component documentation  
✅ **Jest & Testing Library** - Comprehensive testing setup  
✅ **Rollup Build System** - Optimized bundling for distribution  
✅ **ESLint & Prettier** - Code quality and formatting  
✅ **GitHub Actions** - Automated testing and publishing  

## Quick Start

\`\`\`bash
npm install
npm run storybook  # Start component playground
npm test          # Run test suite
npm run build     # Build for distribution
\`\`\`

Perfect for teams looking to build reusable component libraries!`,
    fileSize: '45 MB',
    fileType: 'ZIP'
  },
  {
    id: 'prod-4',
    title: 'Mastering SVG Animations',
    description: 'Learn to create stunning, performant animations using SVG and CSS. Includes 50+ examples and hands-on projects.',
    price: 8999, // $89.99
    category: 'course',
    author: 'Animation Academy',
    timestamp: '2025-01-25T11:20:00Z',
    downloadCount: 234,
    rating: 4.9,
    tags: ['svg', 'animation', 'css', 'design'],
    featuredImage: PRODUCT_IMAGES.course,
    previewContent: `# Course Overview

**Duration:** 6 hours of video content + exercises  
**Level:** Intermediate  
**Prerequisites:** Basic HTML, CSS, and SVG knowledge  

## What You'll Learn

### Module 1: SVG Fundamentals
- Understanding the SVG coordinate system
- Path elements and Bezier curves
- Viewports and responsive SVG

### Module 2: CSS Animation Techniques  
- Transforms and transitions
- Keyframe animations
- Timing functions and easing

### Module 3: Advanced Projects
- Interactive data visualizations
- Logo animations
- Loading spinners and UI elements

**Bonus:** Access to private Discord community and monthly Q&A sessions!`,
    fileSize: '3.2 GB',
    fileType: 'Video Course'
  },
  {
    id: 'prod-5',
    title: 'Minimalist Landing Page Templates',
    description: 'A collection of 15 clean, conversion-optimized landing page templates built with modern CSS and vanilla JavaScript.',
    price: 2999, // $29.99
    category: 'template',
    author: 'Design Collective',
    timestamp: '2025-01-24T16:45:00Z',
    downloadCount: 678,
    rating: 4.6,
    tags: ['templates', 'landing-pages', 'css', 'responsive'],
    featuredImage: PRODUCT_IMAGES.template,
    previewContent: `# Template Collection

## 15 Professional Templates

**Included Styles:**
- SaaS Product Launch
- App Download Page  
- Course Sales Page
- Portfolio Showcase
- Agency Services
- E-commerce Product
- Event Registration
- Newsletter Signup
- And 7 more...

## Features
✅ Fully responsive design  
✅ Cross-browser compatibility  
✅ SEO optimized structure  
✅ Fast loading performance  
✅ Easy customization  
✅ Comprehensive documentation  

Perfect for marketers, developers, and small businesses!`,
    fileSize: '28 MB',
    fileType: 'HTML/CSS/JS'
  },
  {
    id: 'prod-6',
    title: 'Planet Nine Developer Conference 2025',
    description: 'Two-day virtual conference featuring talks on decentralized web development, sessionless authentication, and the future of digital ownership.',
    price: 12999, // $129.99
    category: 'ticket',
    author: 'Planet Nine Foundation',
    timestamp: '2025-01-23T09:00:00Z',
    downloadCount: 89,
    rating: 5.0,
    tags: ['conference', 'blockchain', 'web3', 'development'],
    featuredImage: PRODUCT_IMAGES.ticket,
    previewContent: `# Conference Schedule

## Day 1: Foundations
**10:00 AM** - Keynote: The Future of Decentralized Web  
**11:30 AM** - sessionless Authentication Deep Dive  
**1:00 PM** - Building with allyabase Services  
**2:30 PM** - MAGIC Protocol Workshop  
**4:00 PM** - Community Roundtable  

## Day 2: Advanced Topics
**10:00 AM** - Scaling Decentralized Applications  
**11:30 AM** - Privacy-First Development  
**1:00 PM** - Economic Models for Web3  
**2:30 PM** - Case Studies: Real-World Implementations  
**4:00 PM** - Closing & Networking  

**Includes:** All recordings, slides, and exclusive access to speaker Discord!`,
    fileSize: 'Digital Event',
    fileType: 'Conference Ticket'
  }
];

// Application state
const appState = {
  currentScreen: 'main',
  currentTheme: {
    colors: {
      primary: '#2c3e50',
      secondary: '#7f8c8d', 
      accent: '#e74c3c',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#2c3e50',
      border: '#ecf0f1',
      success: '#27ae60',
      warning: '#f39c12',
      info: '#3498db'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.6,
      headerSize: 32,
      productTitleSize: 24
    }
  },
  currentProduct: null,
  products: [],
  isLoading: true
};

/**
 * Create teleported content item (reused from rhapsold)
 */
function createTeleportedItem(item) {
  const container = document.createElement('div');
  container.className = 'teleported-item';
  container.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border-left: 4px solid ${appState.currentTheme.colors.accent};
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  // Type indicator
  const typeIcon = {
    'link': '🔗',
    'image': '🖼️', 
    'video': '📹',
    'code': '💻'
  };

  // Header with type and source
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  header.innerHTML = `
    <span>${typeIcon[item.type] || '📄'} ${item.type}</span>
    <span>${new Date(item.timestamp).toLocaleDateString()}</span>
  `;

  // Title
  const title = document.createElement('h4');
  title.textContent = item.title;
  title.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: bold;
    color: ${appState.currentTheme.colors.primary};
    line-height: 1.3;
  `;

  // Description
  const description = document.createElement('p');
  description.textContent = item.description;
  description.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 12px;
    color: ${appState.currentTheme.colors.text};
    line-height: 1.4;
  `;

  // Source
  const source = document.createElement('div');
  source.textContent = item.source;
  source.style.cssText = `
    font-size: 11px;
    color: ${appState.currentTheme.colors.secondary};
    font-style: italic;
  `;

  // Add special content based on type
  if (item.type === 'image' && item.imageUrl) {
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.style.cssText = `
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
      margin: 8px 0;
    `;
    container.appendChild(img);
  }

  if (item.type === 'video' && item.thumbnail) {
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      position: relative;
      margin: 8px 0;
    `;
    
    const thumbnail = document.createElement('img');
    thumbnail.src = item.thumbnail;
    thumbnail.style.cssText = `
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    `;
    
    const playButton = document.createElement('div');
    playButton.innerHTML = '▶️';
    playButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    `;
    
    if (item.duration) {
      const duration = document.createElement('div');
      duration.textContent = item.duration;
      duration.style.cssText = `
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
      `;
      videoContainer.appendChild(duration);
    }
    
    videoContainer.appendChild(thumbnail);
    videoContainer.appendChild(playButton);
    container.appendChild(videoContainer);
  }

  if (item.type === 'code' && item.codePreview) {
    const codeBlock = document.createElement('pre');
    codeBlock.textContent = item.codePreview;
    codeBlock.style.cssText = `
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 8px;
      margin: 8px 0;
      font-size: 10px;
      font-family: 'Courier New', monospace;
      overflow-x: auto;
      white-space: pre;
    `;
    container.appendChild(codeBlock);
  }

  // Hover effects
  container.addEventListener('mouseenter', () => {
    container.style.transform = 'translateY(-2px)';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });

  container.addEventListener('mouseleave', () => {
    container.style.transform = 'translateY(0)';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });

  // Click handler
  container.addEventListener('click', () => {
    console.log('Teleported item clicked:', item.title);
    if (item.url) {
      alert(`Would open: ${item.url}`);
    }
  });

  container.appendChild(header);
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(source);

  return container;
}

/**
 * Format price in cents to dollars
 */
function formatPrice(priceInCents) {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
  const icons = {
    'ebook': '📚',
    'music': '🎵',
    'software': '💻',
    'course': '🎓',
    'template': '🎨',
    'ticket': '🎫'
  };
  return icons[category] || '📦';
}

/**
 * Simple markdown parser (reused from rhapsold)
 */
function parseMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;">');
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3 style="color: #2c3e50; margin: 20px 0 10px 0; font-size: 18px;">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="color: #2c3e50; margin: 24px 0 12px 0; font-size: 20px;">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 style="color: #2c3e50; margin: 28px 0 14px 0; font-size: 24px;">$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 12px; margin: 12px 0; overflow-x: auto; font-family: \'Courier New\', monospace; font-size: 14px; line-height: 1.4;"><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-family: \'Courier New\', monospace; font-size: 0.9em;">$1</code>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #e74c3c; margin: 12px 0; padding: 8px 16px; background: #f8f9fa; font-style: italic; color: #555;">$1</blockquote>');
  
  // Lists
  html = html.replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul style="margin: 12px 0; padding-left: 20px;">$1</ul>');
  
  // Checkboxes
  html = html.replace(/^✅ (.*$)/gm, '<div style="margin: 4px 0;"><span style="color: #27ae60;">✅</span> $1</div>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6;">');
  html = '<p style="margin: 12px 0; line-height: 1.6;">' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/g, '');
  
  return html;
}

/**
 * Create product card
 */
function createProductCard(product) {
  const cardContainer = document.createElement('div');
  cardContainer.className = 'product-card';
  cardContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 0;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
  `;
  
  // Featured image
  if (product.featuredImage) {
    const imageElement = document.createElement('img');
    imageElement.src = product.featuredImage;
    imageElement.style.cssText = `
      width: 100%;
      height: 200px;
      object-fit: cover;
    `;
    cardContainer.appendChild(imageElement);
  }
  
  // Card content
  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    padding: 20px;
  `;
  
  // Product metadata header
  const metaHeader = document.createElement('div');
  metaHeader.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  
  const categoryAuthor = document.createElement('span');
  categoryAuthor.textContent = `${getCategoryIcon(product.category)} ${product.category} • by ${product.author}`;
  
  const priceElement = document.createElement('span');
  priceElement.textContent = formatPrice(product.price);
  priceElement.style.cssText = `
    font-weight: bold;
    font-size: 16px;
    color: ${appState.currentTheme.colors.accent};
  `;
  
  metaHeader.appendChild(categoryAuthor);
  metaHeader.appendChild(priceElement);
  
  // Product title
  const titleElement = document.createElement('h3');
  titleElement.textContent = product.title;
  titleElement.style.cssText = `
    margin: 0 0 12px 0;
    color: ${appState.currentTheme.colors.primary};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.productTitleSize}px;
    line-height: 1.3;
  `;
  
  // Product description
  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = product.description;
  descriptionElement.style.cssText = `
    color: ${appState.currentTheme.colors.text};
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
  `;
  
  // Product stats
  const statsContainer = document.createElement('div');
  statsContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  
  const leftStats = document.createElement('div');
  leftStats.innerHTML = `
    ⭐ ${product.rating} • 💾 ${product.downloadCount.toLocaleString()} downloads
  `;
  
  const rightStats = document.createElement('div');
  rightStats.innerHTML = `
    📁 ${product.fileSize} • ${product.fileType}
  `;
  
  statsContainer.appendChild(leftStats);
  statsContainer.appendChild(rightStats);
  
  // Tags
  if (product.tags && product.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;
    
    product.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.textContent = `#${tag}`;
      tagElement.style.cssText = `
        background: ${appState.currentTheme.colors.background};
        color: ${appState.currentTheme.colors.accent};
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      `;
      tagsContainer.appendChild(tagElement);
    });
    
    contentContainer.appendChild(tagsContainer);
  }
  
  // Add click handler to view product details
  cardContainer.addEventListener('click', () => {
    appState.currentProduct = product;
    navigateToScreen('details');
  });
  
  cardContainer.addEventListener('mouseenter', () => {
    cardContainer.style.transform = 'translateY(-4px)';
    cardContainer.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
  });
  
  cardContainer.addEventListener('mouseleave', () => {
    cardContainer.style.transform = 'translateY(0)';
    cardContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  });
  
  contentContainer.appendChild(metaHeader);
  contentContainer.appendChild(titleElement);
  contentContainer.appendChild(descriptionElement);
  contentContainer.appendChild(statsContainer);
  
  cardContainer.appendChild(contentContainer);
  
  return cardContainer;
}

/**
 * Create HUD Navigation (adapted from rhapsold)
 */
function createHUD() {
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${appState.currentTheme.colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    z-index: 1000;
    font-family: ${appState.currentTheme.typography.fontFamily};
  `;
  
  // Left side - Logo
  const logo = document.createElement('div');
  logo.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    color: ${appState.currentTheme.colors.primary};
  `;
  logo.textContent = '🛒 Ninefy';
  
  // Center - Navigation buttons
  const nav = document.createElement('div');
  nav.style.cssText = `
    display: flex;
    gap: 10px;
  `;
  
  const screens = [
    { id: 'main', label: '🏪 Shop', title: 'Browse Products' },
    { id: 'details', label: '📄 Details', title: 'Product Details' },
    { id: 'upload', label: '📤 Upload', title: 'Upload Product' },
    { id: 'base', label: '🌐 Base', title: 'Server Management' }
  ];
  
  screens.forEach(screen => {
    const button = document.createElement('button');
    button.id = `nav-${screen.id}`;
    button.textContent = screen.label;
    button.title = screen.title;
    button.style.cssText = `
      padding: 8px 16px;
      border: 1px solid ${appState.currentTheme.colors.border};
      border-radius: 4px;
      background: ${appState.currentScreen === screen.id ? appState.currentTheme.colors.accent : 'white'};
      color: ${appState.currentScreen === screen.id ? 'white' : appState.currentTheme.colors.text};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    button.addEventListener('click', () => navigateToScreen(screen.id));
    nav.appendChild(button);
  });
  
  // Right side - Status
  const status = document.createElement('div');
  status.id = 'hud-status';
  status.style.cssText = `
    font-size: 12px;
    color: ${appState.currentTheme.colors.secondary};
  `;
  status.textContent = 'Ready';
  
  hud.appendChild(logo);
  hud.appendChild(nav);
  hud.appendChild(status);
  
  return hud;
}

/**
 * Navigate to a specific screen
 */
function navigateToScreen(screenId) {
  console.log(`🧭 Navigating to screen: ${screenId}`);
  appState.currentScreen = screenId;
  updateHUDButtons();
  renderCurrentScreen();
}

/**
 * Update HUD button states
 */
function updateHUDButtons() {
  const screens = ['main', 'details', 'upload', 'base'];
  
  screens.forEach(screen => {
    const button = document.getElementById(`nav-${screen}`);
    if (button) {
      const isActive = appState.currentScreen === screen;
      button.style.background = isActive ? appState.currentTheme.colors.accent : 'white';
      button.style.color = isActive ? 'white' : appState.currentTheme.colors.text;
    }
  });
}

/**
 * Create Main Screen (Product Marketplace)
 */
function createMainScreen() {
  const screen = document.createElement('div');
  screen.id = 'main-screen';
  screen.className = 'screen';
  screen.style.cssText = `
    display: flex;
    gap: 20px;
    height: calc(100vh - 80px);
    overflow: hidden;
  `;
  
  // Left column - Products (2/3 width)
  const productsColumn = document.createElement('div');
  productsColumn.className = 'products-column';
  productsColumn.style.cssText = `
    flex: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Products header
  const productsHeader = document.createElement('div');
  productsHeader.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid ${appState.currentTheme.colors.background};
  `;
  productsHeader.innerHTML = `
    <h1 style="
      margin: 0 0 8px 0;
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 2rem;
      font-weight: 600;
    ">Digital Marketplace</h1>
    <p style="
      margin: 0;
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
    ">Discover and purchase digital goods from creators worldwide</p>
  `;
  
  // Products container with scrolling
  const productsContainer = document.createElement('div');
  productsContainer.id = 'products-container';
  productsContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  `;
  
  // Custom scrollbar styling
  const scrollbarStyle = document.createElement('style');
  scrollbarStyle.textContent = `
    #products-container::-webkit-scrollbar {
      width: 8px;
    }
    #products-container::-webkit-scrollbar-track {
      background: ${appState.currentTheme.colors.background};
      border-radius: 4px;
    }
    #products-container::-webkit-scrollbar-thumb {
      background: ${appState.currentTheme.colors.secondary};
      border-radius: 4px;
    }
    #products-container::-webkit-scrollbar-thumb:hover {
      background: ${appState.currentTheme.colors.primary};
    }
  `;
  document.head.appendChild(scrollbarStyle);
  
  productsColumn.appendChild(productsHeader);
  productsColumn.appendChild(productsContainer);
  
  // Right column - Teleported content (1/3 width)
  const teleportedColumn = document.createElement('div');
  teleportedColumn.className = 'teleported-column';
  teleportedColumn.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    background: ${appState.currentTheme.colors.background};
    border-radius: 12px;
    padding: 20px;
    overflow: hidden;
  `;
  
  // Teleported header
  const teleportedHeader = document.createElement('div');
  teleportedHeader.style.cssText = `
    margin-bottom: 20px;
    padding-bottom: 15px;  
    border-bottom: 2px solid ${appState.currentTheme.colors.border};
  `;
  teleportedHeader.innerHTML = `
    <h2 style="
      margin: 0 0 8px 0;
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 1.5rem;
      font-weight: 600;
    ">🌐 Teleported</h2>
    <p style="
      margin: 0;
      color: ${appState.currentTheme.colors.secondary};
      font-size: 14px;
    ">Latest from the marketplace network</p>
  `;
  
  // Teleported container with scrolling
  const teleportedContainer = document.createElement('div');
  teleportedContainer.id = 'teleported-container';
  teleportedContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  `;
  
  teleportedColumn.appendChild(teleportedHeader);
  teleportedColumn.appendChild(teleportedContainer);
  
  screen.appendChild(productsColumn);
  screen.appendChild(teleportedColumn);
  
  return screen;
}

/**
 * Create Product Details Screen
 */
function createDetailsScreen() {
  const screen = document.createElement('div');
  screen.id = 'details-screen';
  screen.className = 'screen';
  
  if (appState.currentProduct) {
    const product = appState.currentProduct;
    
    // Display the selected product
    const productContainer = document.createElement('div');
    productContainer.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.8;
    `;
    
    // Product image
    if (product.featuredImage) {
      const imageElement = document.createElement('img');
      imageElement.src = product.featuredImage;
      imageElement.style.cssText = `
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 12px;
        margin-bottom: 30px;
      `;
      productContainer.appendChild(imageElement);
    }
    
    // Product header
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
    `;
    
    const titlePriceContainer = document.createElement('div');
    titlePriceContainer.style.cssText = `
      flex: 1;
    `;
    
    // Product title
    const title = document.createElement('h1');
    title.textContent = product.title;
    title.style.cssText = `
      color: ${appState.currentTheme.colors.primary};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: ${appState.currentTheme.typography.headerSize}px;
      margin: 0 0 10px 0;
      line-height: 1.3;
    `;
    
    // Price and category
    const priceCategory = document.createElement('div');
    priceCategory.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    `;
    
    const price = document.createElement('span');
    price.textContent = formatPrice(product.price);
    price.style.cssText = `
      font-size: 28px;
      font-weight: bold;
      color: ${appState.currentTheme.colors.accent};
    `;
    
    const category = document.createElement('span');
    category.textContent = `${getCategoryIcon(product.category)} ${product.category}`;
    category.style.cssText = `
      background: ${appState.currentTheme.colors.background};
      color: ${appState.currentTheme.colors.secondary};
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
    `;
    
    priceCategory.appendChild(price);
    priceCategory.appendChild(category);
    
    // Author and stats
    const authorStats = document.createElement('div');
    authorStats.style.cssText = `
      color: ${appState.currentTheme.colors.secondary};
      font-size: 14px;
      margin-bottom: 20px;
    `;
    authorStats.innerHTML = `
      by <strong>${product.author}</strong> • 
      ⭐ ${product.rating} • 
      💾 ${product.downloadCount.toLocaleString()} downloads • 
      📁 ${product.fileSize}
    `;
    
    titlePriceContainer.appendChild(title);
    titlePriceContainer.appendChild(priceCategory);
    titlePriceContainer.appendChild(authorStats);
    
    // Buy button
    const buyButton = document.createElement('button');
    buyButton.textContent = `Buy for ${formatPrice(product.price)}`;
    buyButton.style.cssText = `
      background: ${appState.currentTheme.colors.accent};
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: 20px;
    `;
    
    buyButton.addEventListener('mouseenter', () => {
      buyButton.style.transform = 'translateY(-2px)';
      buyButton.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.3)';
    });
    
    buyButton.addEventListener('mouseleave', () => {
      buyButton.style.transform = 'translateY(0)';
      buyButton.style.boxShadow = 'none';
    });
    
    buyButton.addEventListener('click', () => {
      alert(`Would process payment for ${product.title} (${formatPrice(product.price)})`);
    });
    
    headerContainer.appendChild(titlePriceContainer);
    headerContainer.appendChild(buyButton);
    
    // Product description
    const description = document.createElement('div');
    description.innerHTML = parseMarkdown(product.previewContent);
    description.style.cssText = `
      color: ${appState.currentTheme.colors.text};
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 30px;
    `;
    
    // Tags
    if (product.tags && product.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 30px;
      `;
      
      product.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = `#${tag}`;
        tagElement.style.cssText = `
          background: ${appState.currentTheme.colors.background};
          color: ${appState.currentTheme.colors.accent};
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
        `;
        tagsContainer.appendChild(tagElement);
      });
      
      productContainer.appendChild(tagsContainer);
    }
    
    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back to Shop';
    backButton.style.cssText = `
      background: ${appState.currentTheme.colors.secondary};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-family: ${appState.currentTheme.typography.fontFamily};
      font-size: 16px;
    `;
    backButton.addEventListener('click', () => {
      appState.currentProduct = null;
      navigateToScreen('main');
    });
    
    productContainer.appendChild(headerContainer);
    productContainer.appendChild(description);
    productContainer.appendChild(backButton);
    screen.appendChild(productContainer);
  } else {
    // No product selected
    screen.innerHTML = `
      <div style="
        text-align: center;
        padding: 100px 20px;
        color: ${appState.currentTheme.colors.secondary};
      ">
        <h1 style="
          color: ${appState.currentTheme.colors.primary};
          margin-bottom: 20px;
          font-size: 2rem;
        ">📄 Product Details</h1>
        <p>Select a product from the Shop to view its details here.</p>
      </div>
    `;
  }
  
  return screen;
}

/**
 * Create Product Upload Form
 */
function createProductUploadForm() {
  const formContainer = document.createElement('div');
  formContainer.className = 'product-form';
  formContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    margin: 20px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;
  
  // Title input
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Product title...';
  titleInput.id = 'product-title';
  titleInput.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.productTitleSize}px;
    font-weight: bold;
  `;
  
  // Category select
  const categorySelect = document.createElement('select');
  categorySelect.id = 'product-category';
  categorySelect.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    background: white;
  `;
  
  const categories = [
    { value: '', label: 'Select category...' },
    { value: 'ebook', label: '📚 E-Book' },
    { value: 'music', label: '🎵 Music' },
    { value: 'software', label: '💻 Software' },
    { value: 'course', label: '🎓 Course' },
    { value: 'template', label: '🎨 Template' },
    { value: 'ticket', label: '🎫 Ticket' }
  ];
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.label;
    if (!cat.value) option.disabled = true;
    categorySelect.appendChild(option);
  });
  
  // Price input
  const priceContainer = document.createElement('div');
  priceContainer.style.cssText = `
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  `;
  
  const priceLabel = document.createElement('span');
  priceLabel.textContent = '$';
  priceLabel.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    margin-right: 8px;
  `;
  
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.placeholder = '29.99';
  priceInput.id = 'product-price';
  priceInput.step = '0.01';
  priceInput.min = '0';
  priceInput.style.cssText = `
    flex: 1;
    padding: 12px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
  `;
  
  priceContainer.appendChild(priceLabel);
  priceContainer.appendChild(priceInput);
  
  // Description textarea
  const descriptionTextarea = document.createElement('textarea');
  descriptionTextarea.placeholder = 'Product description and details...\n\nMarkdown supported:\n• **bold** and *italic*\n• # Headers\n• ![Image](url)\n• `code` and ```code blocks```\n• > blockquotes\n• ✅ checkboxes';
  descriptionTextarea.id = 'product-description';
  descriptionTextarea.rows = 12;
  descriptionTextarea.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: ${appState.currentTheme.typography.fontSize}px;
    line-height: ${appState.currentTheme.typography.lineHeight};
    resize: vertical;
  `;
  
  // File upload section
  const fileSection = document.createElement('div');
  fileSection.style.cssText = `
    border: 2px dashed ${appState.currentTheme.colors.border};
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 20px;
    text-align: center;
    background: ${appState.currentTheme.colors.background};
  `;
  fileSection.innerHTML = `
    <div style="color: ${appState.currentTheme.colors.secondary}; margin-bottom: 15px;">
      📁 <strong>Upload Product Files</strong>
    </div>
    <div style="font-size: 14px; color: ${appState.currentTheme.colors.secondary};">
      Drag and drop files here or click to browse<br>
      <em>Supported: ZIP, PDF, MP3, MP4, and more</em>
    </div>
  `;
  
  // Tags input
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.placeholder = 'Tags (comma-separated): javascript, tutorial, beginner';
  tagsInput.id = 'product-tags';
  tagsInput.style.cssText = `
    width: 100%;
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid ${appState.currentTheme.colors.border};
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 14px;
  `;
  
  // Submit and Clear buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 15px;
  `;
  
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Upload Product';
  submitButton.style.cssText = `
    background: ${appState.currentTheme.colors.accent};
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    flex: 1;
  `;
  
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear Form';
  clearButton.style.cssText = `
    background: ${appState.currentTheme.colors.secondary};
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 6px;
    font-family: ${appState.currentTheme.typography.fontFamily};
    font-size: 16px;
    cursor: pointer;
    flex: 1;
  `;
  
  // Add event handlers
  submitButton.addEventListener('click', function() {
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const price = parseFloat(priceInput.value);
    const description = descriptionTextarea.value.trim();
    const tags = tagsInput.value.trim();
    
    if (!title || !category || !price || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create product data object
    const productData = {
      id: Date.now().toString(),
      title: title,
      description: description,
      price: Math.round(price * 100), // Convert to cents
      category: category,
      author: 'You',
      timestamp: new Date().toISOString(),
      downloadCount: 0,
      rating: 0,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featuredImage: PRODUCT_IMAGES[category] || PRODUCT_IMAGES.ebook,
      previewContent: description,
      fileSize: 'Unknown',
      fileType: 'Digital Product'
    };
    
    // Save to localStorage (in real app, would upload to Sanora)
    const currentProducts = JSON.parse(localStorage.getItem('ninefy-products') || '[]');
    currentProducts.unshift(productData);
    localStorage.setItem('ninefy-products', JSON.stringify(currentProducts));
    
    // Clear form
    titleInput.value = '';
    categorySelect.value = '';
    priceInput.value = '';
    descriptionTextarea.value = '';
    tagsInput.value = '';
    
    // Navigate back to main screen
    navigateToScreen('main');
    
    console.log('✅ Product uploaded:', productData);
    alert('Product uploaded successfully!');
  });
  
  clearButton.addEventListener('click', function() {
    titleInput.value = '';
    categorySelect.value = '';
    priceInput.value = '';
    descriptionTextarea.value = '';
    tagsInput.value = '';
  });
  
  buttonContainer.appendChild(submitButton);
  buttonContainer.appendChild(clearButton);
  
  // Append all elements
  formContainer.appendChild(titleInput);
  formContainer.appendChild(categorySelect);
  formContainer.appendChild(priceContainer);
  formContainer.appendChild(descriptionTextarea);
  formContainer.appendChild(fileSection);
  formContainer.appendChild(tagsInput);
  formContainer.appendChild(buttonContainer);
  
  return formContainer;
}

/**
 * Create Upload Screen
 */
function createUploadScreen() {
  const screen = document.createElement('div');
  screen.id = 'upload-screen';
  screen.className = 'screen';
  
  // Create header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1 style="
      text-align: center;
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 20px;
      font-size: 2rem;
    ">Upload Your Product</h1>
    <p style="
      text-align: center;
      color: ${appState.currentTheme.colors.secondary};
      margin-bottom: 30px;
    ">Share your digital goods with the Ninefy marketplace</p>
  `;
  
  // Create form
  const formContainer = createProductUploadForm();
  
  screen.appendChild(header);
  screen.appendChild(formContainer);
  
  return screen;
}

/**
 * Create base server card (reused from rhapsold)
 */
function createBaseCard(base) {
  const card = document.createElement('div');
  card.className = 'base-card';
  card.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid ${getStatusColor(base.status)};
    transition: all 0.2s ease;
    cursor: pointer;
  `;
  
  // Status indicator
  const statusEmoji = {
    'connected': '🟢',
    'available': '🟡', 
    'limited': '🟠',
    'offline': '🔴'
  };
  
  // Type emoji
  const typeEmoji = {
    'development': '🛠️',
    'production': '🏭',
    'community': '👥',
    'privacy': '🔒',
    'research': '🔬'
  };
  
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">${typeEmoji[base.type] || '🌐'}</span>
        <div>
          <h3 style="
            margin: 0 0 4px 0;
            color: ${appState.currentTheme.colors.primary};
            font-size: 18px;
            font-weight: 600;
          ">${base.name}</h3>
          <p style="
            margin: 0;
            color: ${appState.currentTheme.colors.secondary};
            font-size: 12px;
            font-family: monospace;
          ">${base.url}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
          color: ${getStatusColor(base.status)};
        ">
          ${statusEmoji[base.status]} ${base.status.toUpperCase()}
        </div>
        <div style="
          font-size: 11px;
          color: ${appState.currentTheme.colors.secondary};
        ">
          ${base.users.toLocaleString()} users
        </div>
      </div>
    </div>
    
    <p style="
      margin: 0 0 16px 0;
      color: ${appState.currentTheme.colors.text};
      font-size: 14px;
      line-height: 1.4;
    ">${base.description}</p>
    
    <div style="
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    ">
      ${base.services.map(service => `
        <span style="
          background: ${appState.currentTheme.colors.background};
          color: ${appState.currentTheme.colors.accent};
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        ">${service}</span>
      `).join('')}
    </div>
    
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid ${appState.currentTheme.colors.background};
    ">
      <div style="
        font-size: 12px;
        color: ${appState.currentTheme.colors.secondary};
      ">
        Uptime: ${base.uptime}
      </div>
      <button style="
        background: ${base.status === 'connected' ? appState.currentTheme.colors.secondary : appState.currentTheme.colors.accent};
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
      ">
        ${base.status === 'connected' ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  `;
  
  // Hover effects
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  });
  
  // Click handler
  card.addEventListener('click', () => {
    console.log('Base clicked:', base.name);
    alert(`Would ${base.status === 'connected' ? 'disconnect from' : 'connect to'} ${base.name}`);
  });
  
  return card;
}

/**
 * Get status color
 */
function getStatusColor(status) {
  const colors = {
    'connected': '#10b981',
    'available': '#f59e0b',
    'limited': '#f97316', 
    'offline': '#ef4444'
  };
  return colors[status] || '#6b7280';
}

/**
 * Create Base Screen (Server Management) - reused from rhapsold
 */
function createBaseScreen() {
  const screen = document.createElement('div');
  screen.id = 'base-screen';
  screen.className = 'screen';
  screen.style.cssText = `
    padding: 20px;
    overflow-y: auto;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 40px;
  `;
  header.innerHTML = `
    <h1 style="
      color: ${appState.currentTheme.colors.primary};
      margin-bottom: 12px;
      font-size: 2rem;
      font-family: ${appState.currentTheme.typography.fontFamily};
    ">🌐 Base Server Management</h1>
    <p style="
      color: ${appState.currentTheme.colors.secondary};
      font-size: 16px;
      margin: 0;
    ">Connect to allyabase servers across the decentralized network</p>
  `;
  
  // Bases container
  const basesContainer = document.createElement('div');
  basesContainer.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    gap: 20px;
  `;
  
  // Placeholder base data (same as rhapsold)
  const placeholderBases = [
    {
      name: 'Local Development',
      url: 'http://localhost:7243',
      status: 'connected',
      type: 'development',
      services: ['sanora', 'bdo', 'dolores', 'addie', 'fount'],
      description: 'Local development environment for testing',
      users: 1,
      uptime: '99.9%'
    },
    {
      name: 'Planet Nine Alpha',
      url: 'https://alpha.allyabase.com',
      status: 'connected', 
      type: 'production',
      services: ['sanora', 'bdo', 'dolores', 'addie', 'fount', 'julia'],
      description: 'Main Planet Nine production cluster',
      users: 15420,
      uptime: '99.8%'
    },
    {
      name: 'Community Beta',
      url: 'https://beta.community.allyabase.com',
      status: 'available',
      type: 'community',
      services: ['sanora', 'bdo', 'dolores'],
      description: 'Community-run server for beta testing',
      users: 892,
      uptime: '98.5%'
    },
    {
      name: 'Privacy-First Base',
      url: 'https://privacy.allyabase.org',
      status: 'available',
      type: 'privacy',
      services: ['sanora', 'bdo', 'julia'],
      description: 'Enhanced privacy and encryption focus',
      users: 3241,
      uptime: '99.2%'
    },
    {
      name: 'Academic Research',
      url: 'https://research.edu.allyabase.net',
      status: 'limited',
      type: 'research', 
      services: ['bdo', 'dolores'],
      description: 'University research cluster (restricted access)',
      users: 156,
      uptime: '97.1%'
    }
  ];
  
  placeholderBases.forEach(base => {
    const baseCard = createBaseCard(base);
    basesContainer.appendChild(baseCard);
  });
  
  screen.appendChild(header);
  screen.appendChild(basesContainer);
  
  return screen;
}

/**
 * Render the current screen
 */
function renderCurrentScreen() {
  const contentContainer = document.getElementById('screen-content');
  if (!contentContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  
  // Create the appropriate screen
  let screen;
  switch (appState.currentScreen) {
    case 'main':
      screen = createMainScreen();
      // Load products after screen is added to DOM
      setTimeout(() => {
        loadProducts();
      }, 10);
      break;
    case 'details':
      screen = createDetailsScreen();
      break;
    case 'upload':
      screen = createUploadScreen();
      break;
    case 'base':
      screen = createBaseScreen();
      break;
    default:
      screen = createMainScreen();
      appState.currentScreen = 'main';
  }
  
  contentContainer.appendChild(screen);
}

/**
 * Load products and teleported content
 */
function loadProducts() {
  console.log('🛒 Loading products and teleported content...');
  
  try {
    // Load products (use sample data + localStorage)
    const localProducts = JSON.parse(localStorage.getItem('ninefy-products') || '[]');
    const allProducts = [...localProducts, ...SAMPLE_PRODUCTS];
    
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
      // Clear existing content
      productsContainer.innerHTML = '';
      
      allProducts.forEach(productData => {
        const productElement = createProductCard(productData);
        productsContainer.appendChild(productElement);
      });
      
      console.log(`🛒 Loaded ${allProducts.length} products (${localProducts.length} user + ${SAMPLE_PRODUCTS.length} sample)`);
    }
    
    // Load teleported content
    const teleportedContainer = document.getElementById('teleported-container');
    if (teleportedContainer) {
      // Clear existing content
      teleportedContainer.innerHTML = '';
      
      TELEPORTED_CONTENT.forEach(item => {
        const teleportedElement = createTeleportedItem(item);
        teleportedContainer.appendChild(teleportedElement);
      });
      
      console.log(`🌐 Loaded ${TELEPORTED_CONTENT.length} teleported items`);
    }
    
  } catch (error) {
    console.warn('⚠️ Could not load content:', error);
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
      appState.isLoading = false;
    }, 500);
  }
}

/**
 * Initialize the application
 */
async function init() {
  try {
    console.log('🛒 Initializing Ninefy...');
    
    // Get the main app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }
    
    // Clear existing content
    appContainer.innerHTML = '';
    
    // Create HUD
    const hud = createHUD();
    document.body.appendChild(hud);
    
    // Create main layout with screen system
    const mainLayout = document.createElement('div');
    mainLayout.style.cssText = `
      max-width: 1200px;
      margin: 80px auto 20px auto;
      padding: 20px;
      font-family: ${appState.currentTheme.typography.fontFamily};
    `;
    
    // Create screen content container
    const screenContent = document.createElement('div');
    screenContent.id = 'screen-content';
    screenContent.className = 'screen-content';
    
    mainLayout.appendChild(screenContent);
    appContainer.appendChild(mainLayout);
    
    // Initialize with main screen
    renderCurrentScreen();
    
    // Hide loading screen
    hideLoadingScreen();
    
    console.log('✅ Ninefy initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Ninefy:', error);
    
    // Hide loading screen even on error
    hideLoadingScreen();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

console.log('🛒 Ninefy main module loaded');