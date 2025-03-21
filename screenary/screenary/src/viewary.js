import gestures from './input/gestures.js';
import getEmptyState from './layouts/components/svgs/empty-state.js';

// Global state
let isGloballyMuted = true; // Start muted by default

// Mock data for testing
const mockVideos = [
    {
        uuid: '1',
        url: './gil.mp4',
        title: 'Big Buck Bunny',
        description: 'A sample video for testing'
    },
    {
        uuid: '2',
        url: './gil.mp4',
        title: 'Elephants Dream',
        description: 'Another sample video'
    },
    {
        uuid: '3',
        url: './gil.mp4',
        title: 'For Bigger Blazes',
        description: 'One more sample video'
    }
];

function createVideoElement(post) {
    const videoURL = post.url;
    const uuid = post.uuid;
    const description = post.description;

    const div = document.createElement('div');
    div.classList.add('video-cell');
    div.style.backgroundColor = 'blue';
    
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
        <p>${description}</p>
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

const appendViewary = (_posts) => {
  const posts = _posts.filter($ => $.url);
  const container = document.getElementById('main');
  container.innerHTML = '';
  Array.from(container.classList).forEach($ => {
    if($.indexOf('ontainer') !== -1) {
      container.classList.remove($);
    }
  });
  container.classList.add('feed-container');

  if(posts.length === 0) {
    const div = document.createElement('div');
    div.classList.add('post-cell');
    div.classList.add('vertical-post');

    const emptyState = getEmptyState(() => {
console.log('here is where you will refresh');
    });

    div.appendChild(emptyState);

    container.appendChild(div);
  }

  posts.forEach(post => {
      const div = createVideoElement(post);
      container.appendChild(div);
  });

  const startVideo = (entry) => {
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
  };

  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
          startVideo(entry);      
      });
  }, { threshold: 0.5 });

  const loadObserver = new IntersectionObserver(
      function(entries, observer) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load the video when it's close to the viewport
            const video = entry.target;
            video.src = video.dataset.src;
            
            // Stop observing once we've loaded the video
            observer.unobserve(video);
          }
        });
      }, 
      {
        // 2000px margin around the viewport
        rootMargin: '2000px 0px 2000px 0px'
      }
    );

  document.querySelectorAll('video').forEach((video, index) => {
      if(index === 0) {
console.log('this 0th video is', video);
        video.onloadeddata = () => {
console.log('loadeddata', video.paused);
        }
        video.src = video.dataset.src;
        observer.observe(video);

      } else if(index === 1) {
        video.src = video.dataset.src;
        observer.observe(video);
      } else {
        observer.observe(video);
        loadObserver.observe(video);
      }
      
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
};

export default appendViewary;
