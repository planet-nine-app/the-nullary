import gestures from './gestures.js';

// Environment configuration for viewaris
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
window.viewarisEnv = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(`❌ Unknown environment: ${env}. Available: dev, test, local`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(`🔄 viewaris environment switched to ${env}. Refresh app to apply changes.`);
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
    console.log('🌍 Available environments for viewaris:');
    console.log('• dev - https://dev.*.allyabase.com (production dev server)');
    console.log('• test - localhost:5111-5122 (3-base test ecosystem)');
    console.log('• local - localhost:3000-3007 (local development)');
  }
};

// Make functions globally available
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;


// Global state
let isGloballyMuted = true; // Start muted by default

// Mock data for testing
const mockVideos = [
    {
        uuid: '1',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        title: 'Big Buck Bunny',
        description: 'A sample video for testing'
    },
    {
        uuid: '2',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        title: 'Elephants Dream',
        description: 'Another sample video'
    },
    {
        uuid: '3',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        title: 'For Bigger Blazes',
        description: 'One more sample video'
    }
];

function createVideoElement(videoURL, uuid, videoData) {
    const div = document.createElement('div');
    div.classList.add('video-cell');
    
    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.classList.add('progress-container');
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    progressContainer.appendChild(progressBar);
    
    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');
    
    const video = document.createElement('video');
    video.classList.add('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.crossOrigin = 'anonymous';
    video.muted = isGloballyMuted; // Use global mute state
    
    // Create tap area for play/pause
    const tapArea = document.createElement('div');
    tapArea.classList.add('tap-area');
    
    // Create video controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('video-controls');
    
    // Create mute button
    const muteButton = document.createElement('button');
    muteButton.classList.add('mute-button');
    muteButton.innerHTML = isGloballyMuted ? '🔇' : '🔊';
    
    // Handle mute button click with touchstart for mobile
    const toggleMute = (e) => {
        e.preventDefault(); // Prevent default behavior
        e.stopPropagation(); // Stop event propagation
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

    // Add both click and touch events
    muteButton.addEventListener('click', toggleMute);
    muteButton.addEventListener('touchstart', toggleMute, { passive: false });
    
    // Create video overlay elements
    const overlayContainer = document.createElement('div');
    overlayContainer.classList.add('video-overlay');
    
    // Add title and description
    const videoInfo = document.createElement('div');
    videoInfo.classList.add('video-info');
    videoInfo.innerHTML = `
        <h3>${videoData.title}</h3>
        <p>${videoData.description}</p>
    `;
    
    // Create loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.textContent = 'Loading video...';
    loadingIndicator.style.display = 'block';
    
    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    
    // Create play button
    const playButton = document.createElement('button');
    playButton.classList.add('play-button');
    playButton.innerHTML = '▶️';
    
    // Add event listeners
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
    
    // Add both click and touch events to tap area
    tapArea.addEventListener('click', togglePlayPause);
    tapArea.addEventListener('touchend', (e) => {
        // Only trigger if it's a tap (not a swipe)
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
    video.src = videoURL;
    
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
    videoContainer.appendChild(tapArea); // Add tap area to video container
    overlayContainer.appendChild(videoInfo);
    overlayContainer.appendChild(playButton);
    overlayContainer.appendChild(loadingIndicator);
    overlayContainer.appendChild(errorMessage);
    controlsContainer.appendChild(muteButton);
    
    div.appendChild(progressContainer);
    div.appendChild(videoContainer);
    div.appendChild(overlayContainer);
    div.appendChild(controlsContainer);
    
    return div;
}

// Initialize the app with mock data
const container = document.getElementById('container');
mockVideos.forEach(video => {
    const div = createVideoElement(video.url, video.uuid, video);
    container.appendChild(div);
});

// Set up intersection observer for autoplay
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const vid = entry.target;
        const playButton = vid.parentElement.querySelector('.play-button');
        const progressBar = vid.parentElement.parentElement.querySelector('.progress-bar');
        const elems = document.querySelectorAll('.error-message');

        if (entry.isIntersecting) {
            if (vid.paused) {
                vid.muted = isGloballyMuted;
                vid.play()
                    .catch(error => {
                        console.log('Auto-play failed:', error);
                        elems.forEach($ => $.textContent = 'Auto-play failed: ' + error);
                        if (playButton) playButton.style.display = 'block';
                    });
            }
            // Reset progress bar when video comes into view
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        } else {
            vid.pause();
            if (playButton) playButton.style.display = 'block';
            // Reset progress bar when video goes out of view
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
    });
}, { threshold: 0.5 });

// Observe all videos
document.querySelectorAll('video').forEach(video => {
    observer.observe(video);
    
    video.addEventListener('ended', () => {
        const nextVideo = video.parentElement.parentElement.nextElementSibling;
        if (nextVideo) {
            nextVideo.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add gesture support
document.querySelectorAll('.video-cell').forEach(videoCell => {
    // Touch swipe support
    gestures.addSwipeGestureListener(videoCell, (direction) => {
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

    // Mouse swipe support
    gestures.addMouseSwipeListener(videoCell, (direction) => {
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

// Add keyboard controls
document.addEventListener('keydown', (e) => {
    const currentVideo = document.querySelector('.video-cell:nth-child(1)');
    if (!currentVideo) return;

    switch(e.key) {
        case 'ArrowUp':
            const prevVideo = currentVideo.previousElementSibling;
            if (prevVideo) {
                prevVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            break;
        case 'ArrowDown':
            const nextVideo = currentVideo.nextElementSibling;
            if (nextVideo) {
                nextVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            break;
        case ' ': // Spacebar
            e.preventDefault();
            const video = currentVideo.querySelector('video');
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
            const muteButton = currentVideo.querySelector('.mute-button');
            if (muteButton) {
                muteButton.click();
            }
            break;
    }
});


