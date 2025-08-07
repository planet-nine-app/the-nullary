// Viewary - Short-form Video Feed Application
// No-modules approach for Tauri compatibility


// Environment configuration for viewary
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
window.viewaryEnv = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(`❌ Unknown environment: ${env}. Available: dev, test, local`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(`🔄 viewary environment switched to ${env}. Refresh app to apply changes.`);
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
    console.log('🌍 Available environments for viewary:');
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
    videoPosts: [],
    bases: [],
    sessionless: null,
    loading: false
};

// Video Feed Component (inline from shared/feeds/video-feed.js)
let isGloballyMuted = true; // Start muted by default for autoplay compatibility

// Swipe gesture thresholds
const swipeThresholds = {
    minX: 30,
    maxX: 30,
    minY: 50,
    maxY: 60
};

// Gesture handling utility
const Gestures = {
    addSwipeGestureListener: (element, callback) => {
        const swipeWatcher = {};
        window.swipeMoved = false;

        element.addEventListener('touchstart', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            swipeWatcher.startX = touch.screenX;
            swipeWatcher.startY = touch.screenY;
            window.swipeMoved = false;
        });

        element.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            swipeWatcher.endX = touch.screenX;
            swipeWatcher.endY = touch.screenY;
            
            // Check if movement is significant enough to be considered a swipe
            const xDiff = Math.abs(swipeWatcher.endX - swipeWatcher.startX);
            const yDiff = Math.abs(swipeWatcher.endY - swipeWatcher.startY);
            if (xDiff > 10 || yDiff > 10) {
                window.swipeMoved = true;
            }
        });

        element.addEventListener('touchend', (event) => {
            event.preventDefault();
            const xDiff = swipeWatcher.endX - swipeWatcher.startX;
            const yDiff = swipeWatcher.endY - swipeWatcher.startY;
            
            if(Math.abs(yDiff) > swipeThresholds.minY && yDiff > 0) {
                callback('up');
            } else if(Math.abs(yDiff) > swipeThresholds.minY && yDiff < 0) {
                callback('down');
            }
            
            // Reset swipe movement flag after a short delay
            setTimeout(() => {
                window.swipeMoved = false;
            }, 50);
        });
    },

    addMouseSwipeListener: (element, callback) => {
        const swipeWatcher = {};
        window.swipeMoved = false;

        element.addEventListener('mousedown', (event) => {
            swipeWatcher.startX = event.clientX;
            swipeWatcher.startY = event.clientY;
            window.swipeMoved = false;
        });

        element.addEventListener('mousemove', (event) => {
            if (event.buttons === 1) { // Only track if mouse button is pressed
                swipeWatcher.endX = event.clientX;
                swipeWatcher.endY = event.clientY;
                
                // Check if movement is significant enough to be considered a swipe
                const xDiff = Math.abs(swipeWatcher.endX - swipeWatcher.startX);
                const yDiff = Math.abs(swipeWatcher.endY - swipeWatcher.startY);
                if (xDiff > 10 || yDiff > 10) {
                    window.swipeMoved = true;
                }
            }
        });

        element.addEventListener('mouseup', (event) => {
            const xDiff = swipeWatcher.endX - swipeWatcher.startX;
            const yDiff = swipeWatcher.endY - swipeWatcher.startY;
            
            if(Math.abs(yDiff) > swipeThresholds.minY && yDiff > 0) {
                callback('up');
            } else if(Math.abs(yDiff) > swipeThresholds.minY && yDiff < 0) {
                callback('down');
            }
            
            // Reset swipe movement flag after a short delay
            setTimeout(() => {
                window.swipeMoved = false;
            }, 50);
        });
    }
};

// Create a video element with full TikTok-style functionality
function createVideoElement(post, options = {}) {
    const {
        autoplay = true,
        loop = true,
        showControls = true,
        enableGestures = true
    } = options;

    const videoURL = post.url;
    const uuid = post.uuid;
    const description = post.description || post.title || 'No description';

    const div = document.createElement('div');
    div.classList.add('video-cell');
    div.style.position = 'relative';
    div.style.width = '100%';
    div.style.height = '100vh';
    div.style.backgroundColor = '#000';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.scrollSnapAlign = 'start';
    div.style.scrollSnapStop = 'always';
    
    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.classList.add('progress-container');
    progressContainer.style.position = 'absolute';
    progressContainer.style.top = '0';
    progressContainer.style.left = '0';
    progressContainer.style.width = '100%';
    progressContainer.style.height = '3px';
    progressContainer.style.backgroundColor = 'rgba(255,255,255,0.3)';
    progressContainer.style.zIndex = '1000';
    
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#ff0050';
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 0.1s ease';
    progressContainer.appendChild(progressBar);
    
    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');
    videoContainer.style.position = 'relative';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.display = 'flex';
    videoContainer.style.alignItems = 'center';
    videoContainer.style.justifyContent = 'center';
    
    const video = document.createElement('video');
    video.classList.add('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.crossOrigin = 'anonymous';
    video.muted = isGloballyMuted;
    video.loop = loop;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';
    
    // Create tap area for play/pause
    const tapArea = document.createElement('div');
    tapArea.classList.add('tap-area');
    tapArea.style.position = 'absolute';
    tapArea.style.top = '0';
    tapArea.style.left = '0';
    tapArea.style.width = '100%';
    tapArea.style.height = '100%';
    tapArea.style.zIndex = '100';
    tapArea.style.cursor = 'pointer';
    
    // Create video controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('video-controls');
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.bottom = '20px';
    controlsContainer.style.right = '20px';
    controlsContainer.style.zIndex = '200';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexDirection = 'column';
    controlsContainer.style.gap = '15px';
    
    // Create mute button
    const muteButton = document.createElement('button');
    muteButton.classList.add('mute-button');
    muteButton.innerHTML = isGloballyMuted ? '🔇' : '🔊';
    muteButton.style.background = 'rgba(0,0,0,0.6)';
    muteButton.style.border = 'none';
    muteButton.style.borderRadius = '50%';
    muteButton.style.width = '50px';
    muteButton.style.height = '50px';
    muteButton.style.fontSize = '20px';
    muteButton.style.cursor = 'pointer';
    muteButton.style.display = showControls ? 'block' : 'none';
    muteButton.style.transition = 'transform 0.2s ease';
    
    // Handle mute button click
    const toggleMute = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isGloballyMuted = !isGloballyMuted;
        
        // Update all videos with new mute state
        document.querySelectorAll('video').forEach(v => {
            v.muted = isGloballyMuted;
        });
        
        // Update all mute buttons
        document.querySelectorAll('.mute-button').forEach(btn => {
            btn.innerHTML = isGloballyMuted ? '🔇' : '🔊';
        });
    };

    muteButton.addEventListener('click', toggleMute);
    muteButton.addEventListener('touchstart', toggleMute, { passive: false });
    
    // Create video overlay elements
    const overlayContainer = document.createElement('div');
    overlayContainer.classList.add('video-overlay');
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.bottom = '20px';
    overlayContainer.style.left = '20px';
    overlayContainer.style.right = '80px';
    overlayContainer.style.zIndex = '200';
    overlayContainer.style.color = 'white';
    overlayContainer.style.textShadow = '0 1px 2px rgba(0,0,0,0.8)';
    
    // Add title and description
    const videoInfo = document.createElement('div');
    videoInfo.classList.add('video-info');
    videoInfo.style.fontSize = '14px';
    videoInfo.style.lineHeight = '1.4';
    videoInfo.style.pointerEvents = 'none';
    videoInfo.innerHTML = `<p>${description}</p>`;
    
    // Add author info if available
    if (post.author) {
        const authorInfo = document.createElement('div');
        authorInfo.style.fontSize = '12px';
        authorInfo.style.opacity = '0.8';
        authorInfo.style.marginTop = '5px';
        authorInfo.textContent = `@${post.author}`;
        videoInfo.appendChild(authorInfo);
    }
    
    // Add tags if available
    if (post.tags && post.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.style.marginTop = '8px';
        tagsContainer.style.display = 'flex';
        tagsContainer.style.flexWrap = 'wrap';
        tagsContainer.style.gap = '5px';
        
        post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.style.fontSize = '10px';
            tagElement.style.backgroundColor = 'rgba(255, 0, 80, 0.3)';
            tagElement.style.color = '#ff6b9d';
            tagElement.style.padding = '2px 6px';
            tagElement.style.borderRadius = '8px';
            tagElement.textContent = `#${tag}`;
            tagsContainer.appendChild(tagElement);
        });
        
        videoInfo.appendChild(tagsContainer);
    }
    
    // Create loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.textContent = 'Loading video...';
    loadingIndicator.style.position = 'absolute';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.fontSize = '16px';
    loadingIndicator.style.zIndex = '300';
    loadingIndicator.style.display = 'block';
    
    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.style.position = 'absolute';
    errorMessage.style.top = '50%';
    errorMessage.style.left = '50%';
    errorMessage.style.transform = 'translate(-50%, -50%)';
    errorMessage.style.color = '#ff4444';
    errorMessage.style.fontSize = '14px';
    errorMessage.style.textAlign = 'center';
    errorMessage.style.zIndex = '300';
    errorMessage.style.display = 'none';
    errorMessage.style.padding = '20px';
    errorMessage.style.backgroundColor = 'rgba(0,0,0,0.8)';
    errorMessage.style.borderRadius = '10px';
    errorMessage.style.maxWidth = '80%';
    
    // Create play button
    const playButton = document.createElement('button');
    playButton.classList.add('play-button');
    playButton.innerHTML = '▶️';
    playButton.style.position = 'absolute';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    playButton.style.background = 'rgba(0,0,0,0.6)';
    playButton.style.border = 'none';
    playButton.style.borderRadius = '50%';
    playButton.style.width = '70px';
    playButton.style.height = '70px';
    playButton.style.fontSize = '24px';
    playButton.style.cursor = 'pointer';
    playButton.style.zIndex = '400';
    playButton.style.display = 'none';
    playButton.style.transition = 'transform 0.2s ease';
    
    // Add video event listeners
    video.addEventListener('loadedmetadata', () => {
        loadingIndicator.style.display = 'none';
        console.log(`Video ${uuid} metadata loaded`);
    });
    
    video.addEventListener('error', (e) => {
        loadingIndicator.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Error loading video: ${e.target.error?.message || 'Unknown error'}`;
        console.error(`Video ${uuid} error:`, e.target.error);
    });
    
    video.addEventListener('canplay', () => {
        loadingIndicator.style.display = 'none';
        console.log(`Video ${uuid} can play`);
    });
    
    // Handle tap for play/pause
    const togglePlayPause = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (video.paused) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        playButton.style.display = 'none';
                    })
                    .catch(error => {
                        console.error(`Video ${uuid} play error:`, error);
                        errorMessage.style.display = 'block';
                        errorMessage.textContent = 'Error playing video. Please try again.';
                    });
            }
        } else {
            video.pause();
            playButton.style.display = 'block';
        }
    };
    
    // Add tap area events
    tapArea.addEventListener('click', togglePlayPause);
    tapArea.addEventListener('touchend', (e) => {
        if (!window.swipeMoved) {
            togglePlayPause(e);
        }
    });
    
    // Show/hide play button based on video state
    video.addEventListener('play', () => {
        playButton.style.display = 'none';
    });
    
    video.addEventListener('pause', () => {
        playButton.style.display = 'block';
    });
    
    // Set video source
    video.setAttribute('data-src', videoURL);
    
    // Add progress update listener
    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });

    // Reset progress bar when video ends
    video.addEventListener('ended', () => {
        progressBar.style.width = '0%';
        // Auto-advance to next video
        const nextCell = div.nextElementSibling;
        if (nextCell && nextCell.classList.contains('video-cell')) {
            nextCell.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });

    // Reset progress bar when video is seeked
    video.addEventListener('seeked', () => {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;
    });
    
    // Assemble the components
    videoContainer.appendChild(video);
    videoContainer.appendChild(tapArea);
    overlayContainer.appendChild(videoInfo);
    overlayContainer.appendChild(playButton);
    overlayContainer.appendChild(loadingIndicator);
    overlayContainer.appendChild(errorMessage);
    
    if (showControls) {
        controlsContainer.appendChild(muteButton);
    }
    
    div.appendChild(progressContainer);
    div.appendChild(videoContainer);
    div.appendChild(overlayContainer);
    div.appendChild(controlsContainer);
    
    // Add gesture support if enabled
    if (enableGestures) {
        // Touch swipe support
        Gestures.addSwipeGestureListener(div, (direction) => {
            let targetVideo;
            if (direction === 'up') {
                targetVideo = div.nextElementSibling;
            } else if (direction === 'down') {
                targetVideo = div.previousElementSibling;
            }
            
            if (targetVideo && targetVideo.classList.contains('video-cell')) {
                targetVideo.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });

        // Mouse swipe support
        Gestures.addMouseSwipeListener(div, (direction) => {
            let targetVideo;
            if (direction === 'up') {
                targetVideo = div.nextElementSibling;
            } else if (direction === 'down') {
                targetVideo = div.previousElementSibling;
            }
            
            if (targetVideo && targetVideo.classList.contains('video-cell')) {
                targetVideo.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    return div;
}

// Create empty state for video feed
function createVideoFeedEmptyState(onRefresh) {
    const emptyState = document.createElement('div');
    emptyState.style.display = 'flex';
    emptyState.style.flexDirection = 'column';
    emptyState.style.alignItems = 'center';
    emptyState.style.justifyContent = 'center';
    emptyState.style.height = '100vh';
    emptyState.style.backgroundColor = '#000';
    emptyState.style.color = 'white';
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '40px';

    emptyState.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">📹</div>
        <h3 style="margin-bottom: 10px; font-size: 20px;">No videos available</h3>
        <p style="margin-bottom: 30px; opacity: 0.7; font-size: 14px;">Check back later or try refreshing</p>
        <button class="refresh-button" style="
            background: #ff0050;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.3s ease;
        ">Refresh</button>
    `;

    const refreshButton = emptyState.querySelector('.refresh-button');
    if (refreshButton && onRefresh) {
        refreshButton.addEventListener('click', onRefresh);
        refreshButton.addEventListener('mouseenter', () => {
            refreshButton.style.background = '#e6004a';
        });
        refreshButton.addEventListener('mouseleave', () => {
            refreshButton.style.background = '#ff0050';
        });
    }

    return emptyState;
}

// Planet Nine SVG Logo Component
function createPlanetNineLogo() {
    const svg = `
        <defs>
            <radialGradient id="planetGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ff0050" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#ff6b9d" stop-opacity="0.9"/>
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
        <circle cx="75" cy="75" r="25" fill="url(#planetGradient)" filter="url(#glow)">
            <animate attributeName="r" values="23;27;23" dur="4s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Orbital rings -->
        <circle cx="75" cy="75" r="45" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1">
            <animate attributeName="stroke-opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1">
            <animate attributeName="stroke-opacity" values="0.2;0.05;0.2" dur="4s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Orbiting objects -->
        <g transform-origin="75 75">
            <animateTransform attributeName="transform" type="rotate" values="0 75 75;360 75 75" dur="8s" repeatCount="indefinite"/>
            <circle cx="120" cy="75" r="2.5" fill="#ffffff" opacity="0.8"/>
            <circle cx="30" cy="75" r="2" fill="#ffffff" opacity="0.6"/>
        </g>
        
        <g transform-origin="75 75">
            <animateTransform attributeName="transform" type="rotate" values="180 75 75;540 75 75" dur="12s" repeatCount="indefinite"/>
            <circle cx="75" cy="135" r="2" fill="#ffffff" opacity="0.7"/>
            <circle cx="75" cy="15" r="1.5" fill="#ffffff" opacity="0.5"/>
        </g>
    `;

    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.setAttribute('width', '150');
    container.setAttribute('height', '150');
    container.setAttribute('viewBox', '0 0 150 150');
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
            await loadVideoFeed();
            break;
        case 'bases':
            await loadBases();
            break;
        case 'planet-nine':
            loadPlanetNineContent();
            break;
    }
}

// Video Feed Functions
async function loadVideoFeed() {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    // Show loading state
    content.innerHTML = '<div class="loading-posts">Loading videos...</div>';
    appState.loading = true;

    try {
        const result = await invoke('get_video_feed', { 
            doloresUrl: null, 
            tags: ['videos', 'entertainment', 'comedy'] 
        });
        
        if (result.success && result.data) {
            appState.videoPosts = result.data.video_posts;
            displayVideoFeed();
        } else {
            displayVideoFeedError(result.error || 'Failed to load video feed');
        }
    } catch (error) {
        console.error('Error loading video feed:', error);
        displayVideoFeedError('Failed to connect to video feed service');
    } finally {
        appState.loading = false;
    }
}

function displayVideoFeed() {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    if (appState.videoPosts.length === 0) {
        const emptyState = createVideoFeedEmptyState(() => loadVideoFeed());
        content.innerHTML = '';
        content.appendChild(emptyState);
        return;
    }

    // Create video feed container
    const feedContainer = document.createElement('div');
    feedContainer.className = 'video-feed-container';
    feedContainer.style.height = '100%';
    feedContainer.style.overflowY = 'auto';
    feedContainer.style.scrollSnapType = 'y mandatory';
    feedContainer.style.scrollbarWidth = 'none';
    feedContainer.style.msOverflowStyle = 'none';
    
    // Hide scrollbar
    const style = document.createElement('style');
    style.textContent = `
        .video-feed-container::-webkit-scrollbar {
            display: none;
        }
    `;
    document.head.appendChild(style);

    content.innerHTML = '';
    
    appState.videoPosts.forEach((post, index) => {
        const videoElement = createVideoElement(post);
        feedContainer.appendChild(videoElement);
    });

    content.appendChild(feedContainer);

    // Setup video intersection observers for autoplay
    setupVideoObservers();
    
    // Add keyboard controls
    setupKeyboardControls();
}

function setupVideoObservers() {
    // Video intersection observer for autoplay
    const startVideo = (entry) => {
        const videoCell = entry.target.closest('.video-cell');
        const video = videoCell.querySelector('video');
        const playButton = videoCell.querySelector('.play-button');
        const progressBar = videoCell.querySelector('.progress-bar');

        if (entry.isIntersecting) {
            if (video.paused) {
                video.muted = isGloballyMuted;
                video.play()
                    .catch(error => {
                        console.log('Auto-play failed:', error);
                        if (playButton) playButton.style.display = 'block';
                    });
            }
            // Reset progress bar when video comes into view
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        } else {
            video.pause();
            if (playButton) playButton.style.display = 'block';
            // Reset progress bar when video goes out of view
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            startVideo(entry);      
        });
    }, { threshold: 0.5 });

    // Lazy loading observer
    const loadObserver = new IntersectionObserver(
        function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.src = video.dataset.src;
                    observer.unobserve(video);
                }
            });
        }, 
        {
            rootMargin: '2000px 0px 2000px 0px'
        }
    );

    // Setup video observers
    document.querySelectorAll('.video-cell video').forEach((video, index) => {
        if (index === 0) {
            // First video loads immediately
            video.onloadeddata = () => {
                startVideo({target: video, isIntersecting: true});
            }
            video.src = video.dataset.src;
            observer.observe(video);
        } else if (index < 2) {
            // Preload next video
            video.src = video.dataset.src;
            observer.observe(video);
        } else {
            // Lazy load the rest
            observer.observe(video);
            loadObserver.observe(video);
        }
    });
}

function setupKeyboardControls() {
    const keydownHandler = (e) => {
        const currentVideoCell = Array.from(document.querySelectorAll('.video-cell'))
            .find(cell => {
                const rect = cell.getBoundingClientRect();
                return rect.top >= 0 && rect.top < window.innerHeight / 2;
            });
            
        if (!currentVideoCell) return;

        switch(e.key) {
            case 'ArrowUp':
                const prevVideo = currentVideoCell.previousElementSibling;
                if (prevVideo && prevVideo.classList.contains('video-cell')) {
                    prevVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                break;
            case 'ArrowDown':
                const nextVideo = currentVideoCell.nextElementSibling;
                if (nextVideo && nextVideo.classList.contains('video-cell')) {
                    nextVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                break;
            case ' ': // Spacebar
                e.preventDefault();
                const video = currentVideoCell.querySelector('video');
                if (video) {
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
                break;
            case 'm':
            case 'M':
                const muteButton = currentVideoCell.querySelector('.mute-button');
                if (muteButton) {
                    muteButton.click();
                }
                break;
        }
    };

    // Remove existing listener if any
    if (window._viewaryKeydownHandler) {
        document.removeEventListener('keydown', window._viewaryKeydownHandler);
    }
    
    document.addEventListener('keydown', keydownHandler);
    window._viewaryKeydownHandler = keydownHandler;
}

function displayVideoFeedError(error) {
    const content = document.querySelector('#feed-screen .content');
    if (!content) return;

    content.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h3>Error Loading Videos</h3>
            <p>${error}</p>
            <button class="base-button primary" onclick="loadVideoFeed()">Retry</button>
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
    content.style.padding = '0';
    content.style.overflowY = 'auto';
    
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
        
        baseCard.appendChild(header);
        baseCard.appendChild(description);
        
        // Base tags (viewary-specific)
        if (base.soma && base.soma.viewary) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'base-tags';
            
            base.soma.viewary.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsDiv.appendChild(tagSpan);
            });
            
            baseCard.appendChild(tagsDiv);
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
            await loadVideoFeed(); // Refresh the feed with new base content
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
            await loadVideoFeed(); // Refresh the feed
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
                designed for privacy, user control, and freedom from traditional social media algorithms.
            </p>
            <div class="planet-nine-logo"></div>
            <p class="planet-nine-description">
                Viewary brings you short-form video content from across the network, 
                featuring creators and communities without platform manipulation or advertising interference.
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
        <!-- Video Feed Screen -->
        <div id="feed-screen" class="screen active">
            <nav class="nav-bar">
                <div class="nav-title">📱 Viewary</div>
                <div class="nav-buttons">
                    <button class="nav-button active" data-screen="feed">Feed</button>
                    <button class="nav-button" data-screen="bases">Bases</button>
                    <button class="nav-button" data-screen="planet-nine">Planet Nine</button>
                </div>
            </nav>
            <div class="content">
                <div class="loading-posts">Loading videos...</div>
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

// Global functions for window object
window.showScreen = showScreen;
window.loadVideoFeed = loadVideoFeed;
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
                <h2>Failed to initialize Viewary</h2>
                <p>Please check your connection and try again.</p>
                <button onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);