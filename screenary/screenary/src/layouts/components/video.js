let isMuted = true;

function createVideoElement(container, videoURL, videoData) {
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
    video.muted = isMuted;    
    // Create tap area for play/pause
    const tapArea = document.createElement('div');
    tapArea.classList.add('tap-area');
    
    // Create video controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('video-controls');
    
    // Create mute button
    const muteButton = document.createElement('button');
    muteButton.classList.add('mute-button');
    muteButton.innerHTML = true ? '🔇' : '🔊';
    
    // Handle mute button click with touchstart for mobile
    const toggleMute = (e) => {
        e.preventDefault(); // Prevent default behavior
        e.stopPropagation(); // Stop event propagation
        isMuted = !isMuted;
        // Update all videos with new mute state
        document.querySelectorAll('video').forEach(v => {
            v.muted = isMuted;
        });
        // Update all mute buttons
        document.querySelectorAll('.mute-button').forEach(btn => {
            btn.innerHTML = isMuted ? '🔇' : '🔊';
        });
    };

    // Add both click and touch events
    muteButton.addEventListener('click', toggleMute);
    muteButton.addEventListener('touchstart', toggleMute, { passive: false });
    
    // Create video overlay elements
    const overlayContainer = document.createElement('div');
    overlayContainer.classList.add('video-overlay');
    
    // Add title and description
    if(videoData) {
      const videoInfo = document.createElement('div');
      videoInfo.classList.add('video-info');
      videoInfo.innerHTML = `
          <h3>${videoData.title}</h3>
          <p>${videoData.description}</p>
      `;
    }
    
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
    });
    
    video.addEventListener('error', (e) => {
        loadingIndicator.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Error loading video: ${e.target.error?.message || 'Unknown error'}`;
    });
    
    video.addEventListener('canplay', () => {
        loadingIndicator.style.display = 'none';
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
    videoData && overlayContainer.appendChild(videoInfo);
    overlayContainer.appendChild(playButton);
    overlayContainer.appendChild(loadingIndicator);
    overlayContainer.appendChild(errorMessage);
    controlsContainer.appendChild(muteButton);
    
    div.appendChild(progressContainer);
    div.appendChild(videoContainer);
    div.appendChild(overlayContainer);
    div.appendChild(controlsContainer);
    
    container.appendChild(div);
};

export default createVideoElement;


