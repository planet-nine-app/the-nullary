// Lexary - Text/Blog Feed Application
// No-modules approach for Tauri compatibility


// Environment configuration for lexary
function getEnvironmentConfig() {
  const env = localStorage.getItem('nullary-env') || 'dev';
  
  const configs = {
    dev: {
      sanora: 'https://dev.sanora.allyabase.com/',
      bdo: 'https://dev.bdo.allyabase.com/',
      dolores: 'https://dev.dolores.allyabase.com/',
      fount: 'https://dev.fount.allyabase.com/',
      addie: 'https://dev.addie.allyabase.com/',
      pref: 'https://dev.pref.allyabase.com/',
      julia: 'https://dev.julia.allyabase.com/',
      continuebee: 'https://dev.continuebee.allyabase.com/',
      joan: 'https://dev.joan.allyabase.com/',
      aretha: 'https://dev.aretha.allyabase.com/',
      minnie: 'https://dev.minnie.allyabase.com/',
      covenant: 'https://dev.covenant.allyabase.com/'
    },
    test: {
      sanora: 'http://localhost:5121/',
      bdo: 'http://localhost:5114/',
      dolores: 'http://localhost:5118/',
      fount: 'http://localhost:5117/',
      addie: 'http://localhost:5116/',
      pref: 'http://localhost:5113/',
      julia: 'http://localhost:5111/',
      continuebee: 'http://localhost:5112/',
      joan: 'http://localhost:5115/',
      aretha: 'http://localhost:5120/',
      minnie: 'http://localhost:5119/',
      covenant: 'http://localhost:5122/'
    },
    local: {
      sanora: 'http://localhost:7243/',
      bdo: 'http://localhost:3003/',
      dolores: 'http://localhost:3005/',
      fount: 'http://localhost:3002/',
      addie: 'http://localhost:3005/',
      pref: 'http://localhost:3004/',
      julia: 'http://localhost:3000/',
      continuebee: 'http://localhost:2999/',
      joan: 'http://localhost:3004/',
      aretha: 'http://localhost:7277/',
      minnie: 'http://localhost:2525/',
      covenant: 'http://localhost:3011/'
    }
  };
  
  const config = configs[env] || configs.dev;
  return { env, services: config, name: env };
}

function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  return config.services[serviceName] || config.services.sanora;
}

// Environment switching functions for browser console
window.lexaryEnv = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(`❌ Unknown environment: ${env}. Available: dev, test, local`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(`🔄 lexary environment switched to ${env}. Refresh app to apply changes.`);
    console.log(`Run: location.reload() to refresh`);
    return true;
  },
  current: () => {
    const config = getEnvironmentConfig();
    console.log(`🌐 Current environment: ${config.env}`);
    console.log(`📍 Services:`, config.services);
    return config;
  },
  list: () => {
    console.log('🌍 Available environments for lexary:');
    console.log('• dev - https://dev.*.allyabase.com (production dev server)');
    console.log('• test - localhost:5111-5122 (3-base test ecosystem)');
    console.log('• local - localhost:3000-3007 (local development)');
  }
};

// Make functions globally available
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;

const { invoke } = window.__TAURI__.core;

// Global app state
const appState = {
    currentScreen: 'feed',
    textPosts: [],
    bases: [],
    sessionless: null,
    loading: false
};

// Text Feed Component (inline from shared/feeds/text-feed.js)
const TextFeed = {
    createTextRow(text, images = [], options = {}) {
        const {
            width = 600,
            backgroundColor = '#252529',
            textColor = '#ffffff',
            borderColor = 'url(#frameGradient)',
            fontFamily = 'Georgia, serif',
            fontSize = 24
        } = options;

        // Calculate dimensions
        const IMAGE_DIMENSION = images && images.length > 0 ? 552 : 0;
        const MORE_THAN_ONE_IMAGE = images && images.length > 1;
        const textHeight = text ? Math.floor((text.length / 32) * 27) : 0;
        const totalHeight = textHeight + (images && images.length > 0 ? IMAGE_DIMENSION : 0) + (16 * (images && images.length > 0 ? 3 : 2)) + 10;

        const svg = `
            <!-- Gradient definitions -->
            <defs>
                <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="purple"/>
                    <stop offset="100%" stop-color="green"/>
                </linearGradient>
            </defs>
            
            <!-- Text Area -->
            <rect x="16" y="0" width="568" height="${textHeight + 16}" rx="8" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"></rect>
            <foreignObject x="24" y="8" width="552" height="${textHeight}">
                <div style="margin: 16px; font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${textColor};">
                    <p>${text}</p>
                </div>
            </foreignObject>

            ${images && images.length > 0 ? `
            <!-- Image Display Area -->
            <rect x="16" y="${textHeight + 32}" width="568" height="${IMAGE_DIMENSION + 32}" rx="8" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"/>
            
            <!-- Current Image Display -->
            <g>
                ${images ? `<image id="image" x="24" y="${textHeight + 40}" width="${IMAGE_DIMENSION}" height="${IMAGE_DIMENSION}" rx="8" stroke="${borderColor}" stroke-width="2" href="${images[0].fullsize || images[0]}"></image>` : ''}
            </g>

            ${MORE_THAN_ONE_IMAGE ? `
            <!-- Navigation Arrows -->
            <g class="nav-arrow prev" style="cursor: pointer;">
                <circle cx="75" cy="${textHeight + 40 + IMAGE_DIMENSION/2}" r="25" fill="${backgroundColor}" stroke="#444" stroke-width="1" opacity="0.8"/>
                <path d="M85,${textHeight + 40 + IMAGE_DIMENSION/2} L65,${textHeight + 40 + IMAGE_DIMENSION/2} M75,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} L65,${textHeight + 40 + IMAGE_DIMENSION/2} L75,${textHeight + 40 + IMAGE_DIMENSION/2 + 10}" stroke="${textColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            
            <g class="nav-arrow next" style="cursor: pointer;">
                <circle cx="525" cy="${textHeight + 40 + IMAGE_DIMENSION/2}" r="25" fill="${backgroundColor}" stroke="#444" stroke-width="1" opacity="0.8"/>
                <path d="M515,${textHeight + 40 + IMAGE_DIMENSION/2} L535,${textHeight + 40 + IMAGE_DIMENSION/2} M525,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} L535,${textHeight + 40 + IMAGE_DIMENSION/2} L525,${textHeight + 40 + IMAGE_DIMENSION/2 + 10}" stroke="${textColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            
            <!-- Navigation Dots -->
            <g class="nav-dots" transform="translate(300, ${textHeight + IMAGE_DIMENSION + 70})">
                ${images.map((_, index) => `
                    <circle cx="${(index - Math.floor(images.length/2)) * 40}" cy="0" r="8" fill="${index === 0 ? '#3eda82' : '#555555'}"/>
                    ${index === 0 ? `<circle cx="${(index - Math.floor(images.length/2)) * 40}" cy="0" r="12" fill="none" stroke="#3eda82" stroke-width="2" opacity="0.5">
                        <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
                    </circle>` : ''}
                `).join('')}
            </g>

            <!-- Swipe Gesture Indicator -->
            <g opacity="0.4">
                <path d="M280,${textHeight + 40 + IMAGE_DIMENSION/2} C310,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} 330,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} 360,${textHeight + 40 + IMAGE_DIMENSION/2}" stroke="${textColor}" stroke-width="2" stroke-dasharray="4,4" fill="none">
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
                </path>
                <path d="M350,${textHeight + 40 + IMAGE_DIMENSION/2 - 5} L360,${textHeight + 40 + IMAGE_DIMENSION/2} L350,${textHeight + 40 + IMAGE_DIMENSION/2 + 5}" stroke="${textColor}" stroke-width="2" fill="none"/>
            </g>` : ''}` : ''}
        `;

        const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        container.setAttribute('width', '100%');
        container.setAttribute('height', '100%');

        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
        svgElement.innerHTML = svg;

        // Add image navigation functionality
        if (images && images.length > 1) {
            let currentIndex = 0;
            
            const imageElement = svgElement.querySelector('#image');
            const dots = svgElement.querySelectorAll('.nav-dots circle');
            const prevButton = svgElement.querySelector('.nav-arrow.prev');
            const nextButton = svgElement.querySelector('.nav-arrow.next');

            function updateImage(index) {
                currentIndex = index;
                if (imageElement) {
                    imageElement.setAttribute('href', images[currentIndex].fullsize || images[currentIndex]);
                }
                
                // Update dots
                dots.forEach((dot, i) => {
                    dot.setAttribute('fill', i === currentIndex ? '#3eda82' : '#555555');
                    const glowCircle = dot.nextElementSibling;
                    if (glowCircle && glowCircle.tagName === 'circle') {
                        glowCircle.style.display = i === currentIndex ? 'block' : 'none';
                    }
                });
            }

            function showPreviousImage() {
                updateImage(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
            }

            function showNextImage() {
                updateImage(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
            }

            // Add event listeners
            if (prevButton) prevButton.addEventListener('click', showPreviousImage);
            if (nextButton) nextButton.addEventListener('click', showNextImage);

            // Touch/swipe support
            let touchStartX = 0;
            svgElement.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            svgElement.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                
                if (diff > 50) { 
                    showNextImage();
                } else if (diff < -50) { 
                    showPreviousImage();
                }
            });
        }

        container.appendChild(svgElement);
        
        // Set aspect ratio and dimensions for layout
        const windowWidth = Math.min(window.innerWidth, width);
        container.aspectRatio = width / totalHeight;
        container.totalHeight = totalHeight * (windowWidth / width);

        return container;
    },

    createEmptyState(onRefresh) {
        const width = 600;
        const height = 400;
        
        const svg = `
            <defs>
                <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="purple"/>
                    <stop offset="100%" stop-color="green"/>
                </linearGradient>
            </defs>
            
            <rect width="${width}" height="${height}" fill="#252529" rx="12" stroke="url(#emptyGradient)" stroke-width="2"/>
            
            <!-- Empty state icon -->
            <g transform="translate(${width/2}, ${height/2 - 60})">
                <circle r="40" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                <path d="M-20,-10 L-10,0 L-20,10 M-10,0 L20,0" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.5"/>
            </g>
            
            <!-- Empty state text -->
            <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
                No text posts available
            </text>
            <text x="${width/2}" y="${height/2 + 25}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" opacity="0.7">
                Check back later or try refreshing
            </text>
            
            <!-- Refresh button -->
            <g class="refresh-button" style="cursor: pointer;" transform="translate(${width/2 - 40}, ${height/2 + 50})">
                <rect x="0" y="0" width="80" height="35" rx="18" fill="#4CAF50" opacity="0.8"/>
                <text x="40" y="23" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
                    Refresh
                </text>
            </g>
        `;

        const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        container.setAttribute('width', '100%');
        container.setAttribute('height', '100%');
        container.setAttribute('viewBox', `0 0 ${width} ${height}`);
        container.innerHTML = svg;

        // Add refresh functionality
        const refreshButton = container.querySelector('.refresh-button');
        if (refreshButton && onRefresh) {
            refreshButton.addEventListener('click', onRefresh);
        }

        return container;
    }
};

// Planet Nine SVG Logo Component
function createPlanetNineLogo() {
    const svg = `
        <defs>
            <radialGradient id="planetGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#667eea" stop-opacity="0.9"/>
            </radialGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <!-- Central planet -->
        <circle cx="100" cy="100" r="30" fill="url(#planetGradient)" filter="url(#glow)">
            <animate attributeName="r" values="28;32;28" dur="4s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Orbital rings -->
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1">
            <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1">
            <animate attributeName="stroke-opacity" values="0.2;0.05;0.2" dur="4s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Orbiting objects -->
        <g transform-origin="100 100">
            <animateTransform attributeName="transform" type="rotate" values="0 100 100;360 100 100" dur="10s" repeatCount="indefinite"/>
            <circle cx="160" cy="100" r="3" fill="#ffffff" opacity="0.8"/>
            <circle cx="40" cy="100" r="2" fill="#ffffff" opacity="0.6"/>
        </g>
        
        <g transform-origin="100 100">
            <animateTransform attributeName="transform" type="rotate" values="180 100 100;540 100 100" dur="15s" repeatCount="indefinite"/>
            <circle cx="100" cy="180" r="2.5" fill="#ffffff" opacity="0.7"/>
            <circle cx="100" cy="20" r="1.5" fill="#ffffff" opacity="0.5"/>
        </g>
    `;

    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.setAttribute('width', '200');
    container.setAttribute('height', '200');
    container.setAttribute('viewBox', '0 0 200 200');
    container.innerHTML = svg;

    return container;
}

// Screen Management
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.screen === screenName) {
            button.classList.add('active');
        }
    });
    
    // Show requested screen
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
        loadScreenData(screenName);
    }
}

// Load screen-specific data
async function loadScreenData(screenName) {
    switch (screenName) {
        case 'feed':
            await loadTextFeed();
            break;
        case 'bases':
            await loadBases();
            break;
        case 'planet-nine':
            loadPlanetNineContent();
            break;
    }
}

// Text Feed Functions
async function loadTextFeed() {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    // Show loading state
    content.innerHTML = '<div class="loading-posts">Loading text posts...</div>';
    appState.loading = true;

    try {
        const result = await invoke('get_text_feed', { 
            doloresUrl: null, 
            tags: ['text', 'blogs', 'programming'] 
        });
        
        if (result.success && result.data) {
            appState.textPosts = result.data.text_posts;
            displayTextPosts();
        } else {
            displayTextFeedError(result.error || 'Failed to load text feed');
        }
    } catch (error) {
        console.error('Error loading text feed:', error);
        displayTextFeedError('Failed to connect to text feed service');
    } finally {
        appState.loading = false;
    }
}

function displayTextPosts() {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    if (appState.textPosts.length === 0) {
        const emptyState = TextFeed.createEmptyState(() => loadTextFeed());
        content.innerHTML = '';
        content.appendChild(emptyState);
        return;
    }

    content.innerHTML = '';
    
    appState.textPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'text-post';
        
        // Create post header
        const header = document.createElement('div');
        header.className = 'post-header';
        
        const leftInfo = document.createElement('div');
        
        const title = document.createElement('div');
        title.className = 'post-title';
        title.textContent = post.title || 'Untitled Post';
        
        const meta = document.createElement('div');
        meta.className = 'post-meta';
        const timestamp = new Date(post.timestamp).toLocaleDateString();
        meta.textContent = `by ${post.author} • ${timestamp}`;
        
        leftInfo.appendChild(title);
        leftInfo.appendChild(meta);
        header.appendChild(leftInfo);
        
        // Create post content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'post-content';
        
        // Show description or truncated content
        const text = post.description || post.content || '';
        const maxLength = 300;
        contentDiv.textContent = text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
        
        postDiv.appendChild(header);
        postDiv.appendChild(contentDiv);
        
        // Add tags if available
        if (post.tags && post.tags.length > 0) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'post-tags';
            
            post.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsDiv.appendChild(tagSpan);
            });
            
            postDiv.appendChild(tagsDiv);
        }
        
        // Add images if available using SVG component
        if (post.images && post.images.length > 0) {
            const svgPost = TextFeed.createTextRow(text, post.images);
            const svgContainer = document.createElement('div');
            svgContainer.style.marginTop = '15px';
            svgContainer.appendChild(svgPost);
            postDiv.appendChild(svgContainer);
        }
        
        content.appendChild(postDiv);
    });
}

function displayTextFeedError(error) {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Feed</h3>
            <p>${error}</p>
            <button class="base-button primary" onclick="loadTextFeed()">Retry</button>
        </div>
    `;
}

// Base Management Functions
async function loadBases() {
    const content = document.querySelector('#bases-screen .content');
    if (!content) return;

    try {
        const result = await invoke('get_bases');
        
        if (result.success && result.data) {
            appState.bases = result.data;
            displayBases();
        } else {
            displayBasesError(result.error || 'Failed to load bases');
        }
    } catch (error) {
        console.error('Error loading bases:', error);
        displayBasesError('Failed to connect to base service');
    }
}

function displayBases() {
    const content = document.querySelector('#bases-screen .content');
    if (!content) return;

    content.innerHTML = '';
    
    appState.bases.forEach(base => {
        const baseCard = document.createElement('div');
        baseCard.className = 'base-card';
        
        // Base header
        const header = document.createElement('div');
        header.className = 'base-header';
        
        const name = document.createElement('div');
        name.className = 'base-name';
        name.textContent = base.name;
        
        const status = document.createElement('div');
        status.className = `base-status ${base.joined ? 'joined' : 'not-joined'}`;
        status.textContent = base.joined ? 'Joined' : 'Available';
        
        header.appendChild(name);
        header.appendChild(status);
        
        // Base description
        const description = document.createElement('div');
        description.className = 'base-description';
        description.textContent = base.description;
        
        // Base tags (lexary-specific)
        if (base.soma && base.soma.lexary) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'post-tags';
            tagsDiv.style.marginBottom = '15px';
            
            base.soma.lexary.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsDiv.appendChild(tagSpan);
            });
            
            baseCard.appendChild(header);
            baseCard.appendChild(description);
            baseCard.appendChild(tagsDiv);
        } else {
            baseCard.appendChild(header);
            baseCard.appendChild(description);
        }
        
        // Base actions
        const actions = document.createElement('div');
        actions.className = 'base-actions';
        
        if (base.joined) {
            const leaveButton = document.createElement('button');
            leaveButton.className = 'base-button danger';
            leaveButton.textContent = 'Leave Base';
            leaveButton.onclick = () => leaveBase(base.name);
            actions.appendChild(leaveButton);
        } else {
            const joinButton = document.createElement('button');
            joinButton.className = 'base-button primary';
            joinButton.textContent = 'Join Base';
            joinButton.onclick = () => joinBase(base.name);
            actions.appendChild(joinButton);
        }
        
        baseCard.appendChild(actions);
        content.appendChild(baseCard);
    });
}

function displayBasesError(error) {
    const content = document.querySelector('#bases-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <h3>Error Loading Bases</h3>
            <p>${error}</p>
            <button class="base-button primary" onclick="loadBases()">Retry</button>
        </div>
    `;
}

async function joinBase(baseName) {
    try {
        const result = await invoke('join_base', { baseName });
        if (result.success) {
            await loadBases(); // Refresh the bases list
            await loadTextFeed(); // Refresh the feed with new base content
        } else {
            alert(`Failed to join base: ${result.error}`);
        }
    } catch (error) {
        console.error('Error joining base:', error);
        alert('Failed to join base');
    }
}

async function leaveBase(baseName) {
    try {
        const result = await invoke('leave_base', { baseName });
        if (result.success) {
            await loadBases(); // Refresh the bases list
            await loadTextFeed(); // Refresh the feed
        } else {
            alert(`Failed to leave base: ${result.error}`);
        }
    } catch (error) {
        console.error('Error leaving base:', error);
        alert('Failed to leave base');
    }
}

// Planet Nine Content
function loadPlanetNineContent() {
    const content = document.querySelector('#planet-nine-screen .content');
    if (!content) return;

    const logo = createPlanetNineLogo();
    
    content.innerHTML = `
        <div class="planet-nine-content">
            <h1 class="planet-nine-title">Planet Nine</h1>
            <p class="planet-nine-description">
                Welcome to the Planet Nine ecosystem - a decentralized network of interoperable services 
                designed for privacy, user control, and freedom from traditional social media constraints.
            </p>
            <div class="planet-nine-logo"></div>
            <p class="planet-nine-description">
                Lexary connects you to text and blog content across the network, 
                allowing you to discover and share written content without algorithmic manipulation 
                or advertising interference.
            </p>
        </div>
    `;
    
    const logoContainer = content.querySelector('.planet-nine-logo');
    if (logoContainer) {
        logoContainer.appendChild(logo);
    }
}

// App Structure Creation
function createAppStructure() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <!-- Feed Screen -->
        <div id="feed-screen" class="screen active">
            <nav class="nav-bar">
                <div class="nav-title">📖 Lexary</div>
                <div class="nav-buttons">
                    <button class="nav-button active" data-screen="feed">Feed</button>
                    <button class="nav-button" data-screen="bases">Bases</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading text posts...</div>
            </div>
        </div>

        <!-- Bases Screen -->
        <div id="bases-screen" class="screen">
            <nav class="nav-bar">
                <div class="nav-title">🏗️ Base Management</div>
                <div class="nav-buttons">
                    <button class="nav-button" data-screen="feed">Feed</button>
                    <button class="nav-button active" data-screen="bases">Bases</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading bases...</div>
            </div>
        </div>

        <!-- Planet Nine Screen -->
        <div id="planet-nine-screen" class="screen">
            <nav class="nav-bar">
                <div class="nav-title">🪐 Planet Nine</div>
                <div class="nav-buttons">
                    <button class="nav-button" data-screen="feed">Feed</button>
                    <button class="nav-button" data-screen="bases">Bases</button>
                    <button class="nav-button active" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading Planet Nine info...</div>
            </div>
        </div>
    `;
    
    // Add navigation event listeners
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const screenName = button.dataset.screen;
            if (screenName) {
                showScreen(screenName);
            }
        });
    });
}

// Global function for window object
window.showScreen = showScreen;
window.loadTextFeed = loadTextFeed;
window.loadBases = loadBases;
window.joinBase = joinBase;
window.leaveBase = leaveBase;

// Initialize the application
async function initApp() {
    try {
        // Get sessionless info
        const sessionlessResult = await invoke('get_sessionless_info');
        if (sessionlessResult.success) {
            appState.sessionless = sessionlessResult.data;
        }

        // Create app structure
        createAppStructure();

        // Load initial screen data
        await loadScreenData(appState.currentScreen);

    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="loading">
                <h2>Failed to initialize Lexary</h2>
                <p>Please check your connection and try again.</p>
                <button onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);