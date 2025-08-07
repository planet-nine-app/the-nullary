/**
 * Photary - Photo Feed Application
 * Part of The Nullary ecosystem
 */

import { invoke } from '@tauri-apps/api/core';

// Environment configuration for photary
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
window.photaryEnv = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(`❌ Unknown environment: ${env}. Available: dev, test, local`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(`🔄 photary environment switched to ${env}. Refresh app to apply changes.`);
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
    console.log('🌍 Available environments for photary:');
    console.log('• dev - https://dev.*.allyabase.com (production dev server)');
    console.log('• test - localhost:5111-5122 (3-base test ecosystem)');
    console.log('• local - localhost:3000-3007 (local development)');
  }
};

// Make functions globally available
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;


// Application state
const appState = {
    currentScreen: 'feed',
    photoFeed: [],
    bases: [],
    sessionless: null,
    loading: false
};

// Initialize shared components (inline for no-modules compatibility)
const sharedComponents = {
    // Photo row component
    createPhotaryRow(text, images = [], options = {}) {
        const IMAGE_DIMENSION = options.imageDimension || 552;
        const MORE_THAN_ONE_IMAGE = images && images.length > 1;

        const textHeight = text ? Math.floor((text.length / 32) * 27) : 0;
        const totalHeight = IMAGE_DIMENSION + textHeight + (16 * (images && images.length > 0 ? 3 : 2));

        const gradientId = 'frameGradient-' + Math.random().toString(36).substr(2, 9);

        const svg = `
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="purple"/>
                <stop offset="100%" stop-color="green"/>
            </linearGradient>
           
            ${images && images.length > 0 ? `
            <rect x="16" y="16" width="${IMAGE_DIMENSION}" height="${IMAGE_DIMENSION}" rx="8" fill="#252529" stroke="url(#${gradientId})" stroke-width="2"/>
            
            <g class="image-container">
              <image x="24" y="24" width="${IMAGE_DIMENSION - 16}" height="${IMAGE_DIMENSION - 16}" rx="8" href="${images[0].fullsize || images[0]}" style="cursor: grab;"></image>
            </g>

            ${MORE_THAN_ONE_IMAGE ? `
            <g class="nav-arrow prev" style="cursor: pointer;">
              <circle cx="75" cy="${IMAGE_DIMENSION/2 + 16}" r="25" fill="#252529" stroke="#444" stroke-width="1" opacity="0.8"/>
              <path d="M85,${IMAGE_DIMENSION/2 + 16} L65,${IMAGE_DIMENSION/2 + 16} M75,${IMAGE_DIMENSION/2 + 6} L65,${IMAGE_DIMENSION/2 + 16} L75,${IMAGE_DIMENSION/2 + 26}" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            
            <g class="nav-arrow next" style="cursor: pointer;">
              <circle cx="${IMAGE_DIMENSION - 59}" cy="${IMAGE_DIMENSION/2 + 16}" r="25" fill="#252529" stroke="#444" stroke-width="1" opacity="0.8"/>
              <path d="M${IMAGE_DIMENSION - 69},${IMAGE_DIMENSION/2 + 16} L${IMAGE_DIMENSION - 49},${IMAGE_DIMENSION/2 + 16} M${IMAGE_DIMENSION - 59},${IMAGE_DIMENSION/2 + 6} L${IMAGE_DIMENSION - 49},${IMAGE_DIMENSION/2 + 16} L${IMAGE_DIMENSION - 59},${IMAGE_DIMENSION/2 + 26}" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            
            <g class="nav-dots" transform="translate(${IMAGE_DIMENSION/2 + 16}, ${IMAGE_DIMENSION - 30})">
              ${images.map((_, index) => `
                <circle cx="${(index - Math.floor(images.length / 2)) * 40}" cy="0" r="8" fill="${index === 0 ? '#3eda82' : '#555555'}" class="nav-dot" data-index="${index}" style="cursor: pointer;"/>
                ${index === 0 ? `
                  <circle cx="${(index - Math.floor(images.length / 2)) * 40}" cy="0" r="12" fill="none" stroke="#3eda82" stroke-width="2" opacity="0.5">
                    <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
                  </circle>
                ` : ''}
              `).join('')}
            </g>
            
            <g opacity="0.4">
              <path d="M${IMAGE_DIMENSION/2 - 20},${IMAGE_DIMENSION/2 + 16} C${IMAGE_DIMENSION/2 + 10},${IMAGE_DIMENSION/2 + 6} ${IMAGE_DIMENSION/2 + 30},${IMAGE_DIMENSION/2 + 6} ${IMAGE_DIMENSION/2 + 60},${IMAGE_DIMENSION/2 + 16}" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,4" fill="none">
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
              </path>
              <path d="M${IMAGE_DIMENSION/2 + 50},${IMAGE_DIMENSION/2 + 11} L${IMAGE_DIMENSION/2 + 60},${IMAGE_DIMENSION/2 + 16} L${IMAGE_DIMENSION/2 + 50},${IMAGE_DIMENSION/2 + 21}" stroke="#ffffff" stroke-width="2" fill="none"/>
            </g>` : ''}` : ''}

            ${text ? `
            <rect x="16" y="${IMAGE_DIMENSION + 32}" width="568" height="${textHeight + 32}" rx="8" fill="#252529" stroke="url(#${gradientId})" stroke-width="2"></rect>
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

        // Add interactivity
        this.addPhotoInteractions(container, images);

        return container;
    },

    // Add photo interactions
    addPhotoInteractions(container, images) {
        if (!images || images.length <= 1) return;

        let currentIndex = 0;
        const imageElement = container.querySelector('.image-container image');
        const dots = container.querySelectorAll('.nav-dot');
        
        const updateImage = (index) => {
            if (index >= 0 && index < images.length) {
                currentIndex = index;
                imageElement.setAttribute('href', images[currentIndex].fullsize || images[currentIndex]);
                
                // Update dots
                dots.forEach((dot, i) => {
                    dot.setAttribute('fill', i === currentIndex ? '#3eda82' : '#555555');
                    
                    // Remove existing glow
                    const existingGlow = dot.parentNode.querySelector('circle[stroke="#3eda82"]:not(.nav-dot)');
                    if (existingGlow) {
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
                        dot.parentNode.appendChild(glow);
                    }
                });
            }
        };

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
            dot.addEventListener('click', () => {
                updateImage(index);
            });
        });
    },

    // Planet Nine SVG logo
    createPlanetNineLogo() {
        const svg = `
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="planetGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#667eea"/>
                        <stop offset="50%" stop-color="#764ba2"/>
                        <stop offset="100%" stop-color="#f093fb"/>
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- Planet -->
                <circle cx="100" cy="100" r="60" fill="url(#planetGradient)" filter="url(#glow)"/>
                
                <!-- Orbital rings -->
                <ellipse cx="100" cy="100" rx="80" ry="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2">
                    <animateTransform attributeName="transform" type="rotate" values="0 100 100;360 100 100" dur="8s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="100" cy="100" rx="95" ry="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1">
                    <animateTransform attributeName="transform" type="rotate" values="0 100 100;-360 100 100" dur="12s" repeatCount="indefinite"/>
                </ellipse>
                
                <!-- Stars -->
                <circle cx="50" cy="30" r="2" fill="white" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="170" cy="50" r="1.5" fill="white" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="30" cy="150" r="1" fill="white" opacity="0.7">
                    <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="180" cy="170" r="1.5" fill="white" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite"/>
                </circle>
                
                <!-- Planet Nine text -->
                <text x="100" y="180" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="12" font-weight="bold" opacity="0.8">PLANET NINE</text>
            </svg>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = svg;
        return div.firstElementChild;
    }
};

// Utility functions
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

function setLoading(loading) {
    appState.loading = loading;
}

// Screen management
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
        
        // Update navigation
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const navBtn = document.querySelector(`[data-screen="${screenName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
        
        // Load screen data
        loadScreenData(screenName);
    }
}

async function loadScreenData(screenName) {
    switch (screenName) {
        case 'feed':
            await loadPhotoFeed();
            break;
        case 'bases':
            await loadBases();
            break;
        case 'planet-nine':
            // Planet Nine screen is static
            break;
    }
}

// Photo feed management
async function loadPhotoFeed() {
    try {
        setLoading(true);
        const result = await invoke('get_feed');
        
        if (result.success && result.data) {
            appState.photoFeed = result.data.image_posts || [];
            displayPhotoFeed(appState.photoFeed);
        } else {
            showMessage('Failed to load photo feed: ' + (result.error || 'Unknown error'), 'error');
            displayEmptyPhotoFeed();
        }
    } catch (error) {
        console.error('Failed to load photo feed:', error);
        showMessage('Error loading photo feed: ' + error.message, 'error');
        displayEmptyPhotoFeed();
    } finally {
        setLoading(false);
    }
}

function displayPhotoFeed(posts) {
    const container = document.getElementById('photo-feed-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (posts.length === 0) {
        displayEmptyPhotoFeed();
        return;
    }

    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.classList.add('photo-post');
        
        // Create photo row using shared component
        const photoRow = sharedComponents.createPhotaryRow(
            post.description || post.title, 
            post.images || [], 
            { imageDimension: 552 }
        );
        
        postElement.appendChild(photoRow);
        container.appendChild(postElement);
        
        // Add lazy loading observer
        if (index > 5) {
            postElement.style.display = 'none';
            
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.display = 'block';
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '200px' });
            
            observer.observe(postElement);
        }
    });
}

function displayEmptyPhotoFeed() {
    const container = document.getElementById('photo-feed-container');
    if (!container) return;
    
    container.innerHTML = `
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
            <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">
                Photos will appear here when they're available from your connected bases.
            </p>
            <button onclick="refreshPhotoFeed()" style="
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                Refresh Feed
            </button>
        </div>
    `;
}

async function refreshPhotoFeed() {
    try {
        setLoading(true);
        const result = await invoke('refresh_feed');
        
        if (result.success && result.data) {
            appState.photoFeed = result.data.image_posts || [];
            displayPhotoFeed(appState.photoFeed);
            showMessage('Photo feed refreshed!', 'success');
        } else {
            showMessage('Failed to refresh feed: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Failed to refresh photo feed:', error);
        showMessage('Error refreshing feed: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Bases management
async function loadBases() {
    try {
        setLoading(true);
        const result = await invoke('get_bases');
        
        if (result.success && result.data) {
            appState.bases = result.data;
            displayBases(appState.bases);
        } else {
            showMessage('Failed to load bases: ' + (result.error || 'Unknown error'), 'error');
            displayEmptyBases();
        }
    } catch (error) {
        console.error('Failed to load bases:', error);
        showMessage('Error loading bases: ' + error.message, 'error');
        displayEmptyBases();
    } finally {
        setLoading(false);
    }
}

function displayBases(bases) {
    const container = document.getElementById('bases-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (bases.length === 0) {
        displayEmptyBases();
        return;
    }

    bases.forEach(base => {
        const baseCard = document.createElement('div');
        baseCard.classList.add('base-card');
        if (base.joined) {
            baseCard.classList.add('joined');
        }
        
        const photaryTags = (base.soma && base.soma.photary) ? base.soma.photary : [];
        
        baseCard.innerHTML = `
            <div class="base-name">
                ${base.joined ? '🟢' : '⚪'} ${base.name}
            </div>
            <div class="base-description">${base.description}</div>
            ${photaryTags.length > 0 ? `
                <div class="base-tags">
                    <strong>Photo Tags:</strong>
                    ${photaryTags.map(tag => `<span class="base-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="base-actions">
                ${base.joined ? 
                    `<button class="base-button leave" onclick="leaveBase('${base.name}')">Leave Base</button>` :
                    `<button class="base-button join" onclick="joinBase('${base.name}')">Join Base</button>`
                }
            </div>
        `;
        
        container.appendChild(baseCard);
    });
}

function displayEmptyBases() {
    const container = document.getElementById('bases-container');
    if (!container) return;
    
    container.innerHTML = `
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
            <div style="font-size: 64px; margin-bottom: 20px;">🏠</div>
            <h2 style="margin-bottom: 10px;">No Bases Available</h2>
            <p style="color: rgba(255, 255, 255, 0.7);">
                Bases will appear here when they're discovered on the network.
            </p>
        </div>
    `;
}

async function joinBase(baseName) {
    try {
        setLoading(true);
        const result = await invoke('join_base', { baseName });
        
        if (result.success) {
            showMessage(`Successfully joined ${baseName}!`, 'success');
            await loadBases();
            await loadPhotoFeed(); // Refresh feed after joining new base
        } else {
            showMessage('Failed to join base: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Failed to join base:', error);
        showMessage('Error joining base: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function leaveBase(baseName) {
    if (!confirm(`Are you sure you want to leave ${baseName}?`)) {
        return;
    }
    
    try {
        setLoading(true);
        const result = await invoke('leave_base', { baseName });
        
        if (result.success) {
            showMessage(`Left ${baseName}`, 'info');
            await loadBases();
        } else {
            showMessage('Failed to leave base: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Failed to leave base:', error);
        showMessage('Error leaving base: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Planet Nine screen
function displayPlanetNine() {
    const container = document.querySelector('.planet-nine-content');
    if (!container) return;
    
    const logoContainer = container.querySelector('.planet-nine-logo');
    if (logoContainer && logoContainer.children.length === 0) {
        const logo = sharedComponents.createPlanetNineLogo();
        logoContainer.appendChild(logo);
    }
}

// Application initialization
async function initializeApp() {
    try {
        // Get sessionless info
        const sessionlessResult = await invoke('get_sessionless_info');
        if (sessionlessResult.success) {
            appState.sessionless = sessionlessResult.data;
            console.log('Sessionless UUID:', appState.sessionless.uuid);
        }
        
        // Create app structure
        createAppStructure();
        
        // Show initial screen
        showScreen('feed');
        
        console.log('Photary app initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showMessage('Failed to initialize app: ' + error.message, 'error');
    }
}

function createAppStructure() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- Navigation -->
        <div class="nav-bar">
            <div class="nav-title">📸 Photary</div>
            <div class="nav-buttons">
                <button class="nav-button active" data-screen="feed" onclick="showScreen('feed')">Feed</button>
                <button class="nav-button" data-screen="bases" onclick="showScreen('bases')">Bases</button>
                <button class="nav-button" data-screen="planet-nine" onclick="showScreen('planet-nine')">Planet Nine</button>
            </div>
        </div>
        
        <!-- Photo Feed Screen -->
        <div id="feed-screen" class="screen active">
            <div class="screen-content">
                <div class="photo-feed" id="photo-feed-container"></div>
            </div>
        </div>
        
        <!-- Bases Screen -->
        <div id="bases-screen" class="screen">
            <div class="screen-content">
                <div class="bases-container" id="bases-container"></div>
            </div>
        </div>
        
        <!-- Planet Nine Screen -->
        <div id="planet-nine-screen" class="screen">
            <div class="screen-content">
                <div class="planet-nine-container">
                    <div class="planet-nine-content">
                        <div class="planet-nine-logo"></div>
                        <div class="planet-nine-title">Planet Nine</div>
                        <div class="planet-nine-description">
                            Welcome to Planet Nine - a decentralized ecosystem for creative expression and community building. 
                            Photary connects you to photo feeds across the network, letting you discover and share visual stories 
                            without centralized control.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize Planet Nine display
    setTimeout(displayPlanetNine, 100);
}

// Global functions for HTML event handlers
window.showScreen = showScreen;
window.refreshPhotoFeed = refreshPhotoFeed;
window.joinBase = joinBase;
window.leaveBase = leaveBase;

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);