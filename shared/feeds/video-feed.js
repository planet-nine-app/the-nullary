// Video Feed Component for The Nullary Ecosystem
// Based on screenary's viewary implementation

// Global video state management
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
    videoInfo.style.fontSize = '16px';
    videoInfo.style.lineHeight = '1.4';
    videoInfo.innerHTML = `<p>${description}</p>`;
    
    // Add author info if available
    if (post.author) {
        const authorInfo = document.createElement('div');
        authorInfo.style.fontSize = '14px';
        authorInfo.style.opacity = '0.8';
        authorInfo.style.marginTop = '5px';
        authorInfo.textContent = `@${post.author}`;
        videoInfo.appendChild(authorInfo);
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
    loadingIndicator.style.fontSize = '18px';
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
    errorMessage.style.fontSize = '16px';
    errorMessage.style.textAlign = 'center';
    errorMessage.style.zIndex = '300';
    errorMessage.style.display = 'none';
    errorMessage.style.padding = '20px';
    errorMessage.style.backgroundColor = 'rgba(0,0,0,0.8)';
    errorMessage.style.borderRadius = '10px';
    
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
    playButton.style.width = '80px';
    playButton.style.height = '80px';
    playButton.style.fontSize = '30px';
    playButton.style.cursor = 'pointer';
    playButton.style.zIndex = '400';
    playButton.style.display = 'none';
    
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
            const event = new CustomEvent('videoSwipe', { 
                detail: { direction, element: div }
            });
            div.dispatchEvent(event);
        });

        // Mouse swipe support
        Gestures.addMouseSwipeListener(div, (direction) => {
            const event = new CustomEvent('videoSwipe', { 
                detail: { direction, element: div }
            });
            div.dispatchEvent(event);
        });
    }
    
    return div;
}

// Create video feed with multiple videos and intersection observer
function createVideoFeed(posts, container, options = {}) {
    const {
        autoplay = true,
        preloadCount = 2, // Number of videos to preload
        enableKeyboardControls = true
    } = options;

    // Clear existing content
    container.innerHTML = '';
    container.classList.add('video-feed-container');
    container.style.height = '100vh';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';

    if (posts.length === 0) {
        const emptyState = createVideoFeedEmptyState(() => {
            console.log('Refresh video feed');
            const event = new CustomEvent('refreshVideoFeed');
            container.dispatchEvent(event);
        });
        container.appendChild(emptyState);
        return;
    }

    posts.forEach(post => {
        const videoElement = createVideoElement(post, options);
        container.appendChild(videoElement);
    });

    // Video intersection observer for autoplay
    const startVideo = (entry) => {
        const videoCell = entry.target.closest('.video-cell');
        const video = videoCell.querySelector('video');
        const playButton = videoCell.querySelector('.play-button');
        const progressBar = videoCell.querySelector('.progress-bar');

        if (entry.isIntersecting) {
            if (video.paused && autoplay) {
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
        } else if (index < preloadCount) {
            // Preload next few videos
            video.src = video.dataset.src;
            observer.observe(video);
        } else {
            // Lazy load the rest
            observer.observe(video);
            loadObserver.observe(video);
        }
        
        // Auto-advance to next video when current ends
        video.addEventListener('ended', () => {
            const currentCell = video.closest('.video-cell');
            const nextCell = currentCell.nextElementSibling;
            if (nextCell) {
                nextCell.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add swipe navigation
    document.querySelectorAll('.video-cell').forEach(videoCell => {
        videoCell.addEventListener('videoSwipe', (e) => {
            const direction = e.detail.direction;
            let targetVideo;
            
            if (direction === 'up') {
                targetVideo = videoCell.nextElementSibling;
            } else if (direction === 'down') {
                targetVideo = videoCell.previousElementSibling;
            }
            
            if (targetVideo) {
                targetVideo.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard controls if enabled
    if (enableKeyboardControls) {
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
                    if (prevVideo) {
                        prevVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    break;
                case 'ArrowDown':
                    const nextVideo = currentVideoCell.nextElementSibling;
                    if (nextVideo) {
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

        document.addEventListener('keydown', keydownHandler);
        
        // Store reference to remove listener later if needed
        container._keydownHandler = keydownHandler;
    }
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
        <h3 style="margin-bottom: 10px; font-size: 24px;">No videos available</h3>
        <p style="margin-bottom: 30px; opacity: 0.7; font-size: 16px;">Check back later or try refreshing</p>
        <button class="refresh-button" style="
            background: #ff0050;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
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

// Utility functions
function setGlobalMute(muted) {
    isGloballyMuted = muted;
    document.querySelectorAll('video').forEach(v => {
        v.muted = isGloballyMuted;
    });
    document.querySelectorAll('.mute-button').forEach(btn => {
        btn.innerHTML = isGloballyMuted ? '🔇' : '🔊';
    });
}

function getCurrentVideoIndex() {
    const currentVideoCell = Array.from(document.querySelectorAll('.video-cell'))
        .find(cell => {
            const rect = cell.getBoundingClientRect();
            return rect.top >= 0 && rect.top < window.innerHeight / 2;
        });
    
    if (currentVideoCell) {
        return Array.from(document.querySelectorAll('.video-cell')).indexOf(currentVideoCell);
    }
    return -1;
}

function navigateToVideo(index) {
    const videos = document.querySelectorAll('.video-cell');
    if (index >= 0 && index < videos.length) {
        videos[index].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Export functions for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        createVideoElement,
        createVideoFeed,
        createVideoFeedEmptyState,
        setGlobalMute,
        getCurrentVideoIndex,
        navigateToVideo,
        Gestures
    };
} else if (typeof window !== 'undefined') {
    // Browser environment - attach to window for global access
    window.VideoFeed = {
        createVideoElement,
        createVideoFeed,
        createVideoFeedEmptyState,
        setGlobalMute,
        getCurrentVideoIndex,
        navigateToVideo,
        Gestures
    };
}