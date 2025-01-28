console.log('heyoooo')

const { invoke } = window.__TAURI__.core;
const { create, mkdir, readTextFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs;
import gestures from './gestures.js';

console.log('heereklrjljrlj');

const baseURL = 'https://dev.dolores.allyabase.com/';

let fountUser;
let doloresUser;

try {
  const fountUserString = await readTextFile('fount/user.json', {
    baseDir: BaseDirectory.AppLocalData,
  });
console.log('contents', fountUserString);
  fountUser = JSON.parse(fountUserString);
} catch(err) {
console.log('problem', err);
  try {
    fountUser = await invoke("create_fount_user");
    await mkdir('', {baseDir: BaseDirectory.AppLocalData});
    await mkdir('fount', {baseDir: BaseDirectory.AppLocalData});
//    await create('fount/user', { baseDir: BaseDirectory.AppLocalData })
    await writeTextFile('fount/user.json', JSON.stringify(fountUser), {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch(err) {
console.warn(err);
  }
}

try {
  const doloresUserString = await readTextFile('dolores/user.json', {
    baseDir: BaseDirectory.AppLocalData,
  });
console.log('dolores contents', doloresUserString);
  doloresUser = JSON.parse(doloresUserString);
} catch(err) {
console.log('dolores problem', err);
  try {
    doloresUser = await invoke("create_dolores_user");
    await mkdir('', {baseDir: BaseDirectory.AppLocalData});
    await mkdir('dolores', {baseDir: BaseDirectory.AppLocalData});
    await writeTextFile('dolores/user.json', JSON.stringify(fountUser), {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch(err) {
console.warn(err);
  }
}

try {
const feed = await invoke("get_feed", {uuid: doloresUser.uuid, tags: ""});

console.log(feed.videos);

/*const uuid = feed.videos[0].uuid;
const videoURL = `${baseURL}user/${doloresUser.uuid}/short-form/video/${uuid}`;

const video = document.createElement('video');
video.setAttribute('style', 'height: 100vh; width: auto; max-width: 100%; object-fit: contain;');
video.setAttribute('src', videoURL);
video.setAttribute('autoplay', true);*/

feed.videos.forEach(vid => {
  const uuid = vid.uuid;
  const videoURL = `${baseURL}user/${doloresUser.uuid}/short-form/video/${uuid}`;

  const div = document.createElement('div');
  div.classList.add('video-cell');

  const video = document.createElement('video');
  video.classList.add('video');
  video.setAttribute('src', videoURL);
  video.setAttribute('playsinline', ''); // Important for iOS
  video.setAttribute('webkit-playsinline', ''); // For older iOS versions
  video.setAttribute('preload', 'metadata');
  video.setAttribute('poster', ''); // You might want to add a poster image
  
  // Add play button overlay
  const playButton = document.createElement('button');
  playButton.classList.add('play-button');
  playButton.innerHTML = '▶️';
  playButton.style.position = 'absolute';
  playButton.style.top = '50%';
  playButton.style.left = '50%';
  playButton.style.transform = 'translate(-50%, -50%)';
  playButton.style.fontSize = '48px';
  playButton.style.background = 'none';
  playButton.style.border = 'none';
  playButton.style.cursor = 'pointer';
  playButton.style.zIndex = '2';
  
  // Make container relative for absolute positioning of play button
  div.style.position = 'relative';

  // Handle play button click
  playButton.addEventListener('click', () => {
    if (video.paused) {
      video.play()
        .then(() => {
          playButton.style.display = 'none';
        })
        .catch(error => {
          console.error('Playback failed:', JSON.stringify(error));
        });
    } else {
      video.pause();
      playButton.style.display = 'block';
    }
  });

  div.appendChild(video);
  div.appendChild(playButton);
  document.getElementById('container').appendChild(div);

  // Show/hide play button based on video state
  video.addEventListener('play', () => {
    playButton.style.display = 'none';
  });

  video.addEventListener('pause', () => {
    playButton.style.display = 'block';
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const vid = entry.target;
    const playButton = vid.parentElement.querySelector('.play-button');

    if (entry.isIntersecting) {
      // On Android, we'll wait for user interaction
      if (!vid.paused) {
        vid.play()
          .catch(error => {
            console.log('Auto-play failed:', error);
            // Show play button if autoplay fails
            if (playButton) playButton.style.display = 'block';
          });
      }
    } else {
      vid.pause();
      if (playButton) playButton.style.display = 'block';
    }
  });
}, { threshold: 0.5 });



/*feed.videos.forEach(vid => {
  const uuid = vid.uuid;
  const videoURL = `${baseURL}user/${doloresUser.uuid}/short-form/video/${uuid}`;

  const div = document.createElement('div');
  div.classList.add('video-cell');

  const video = document.createElement('video');
  video.classList.add('video');
  video.setAttribute('src', videoURL);
  video.setAttribute('autoplay', false);
//  video.setAttribute('loop', true);

  div.appendChild(video);

  document.getElementById('container').appendChild(div);
});

try {
  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
	  const vid = entry.target;

	  if (entry.isIntersecting) {
	      vid.play();
	  } else {
	      vid.pause();
	  }
      });
  }, { threshold: 0.5 });*/

  document.querySelectorAll('video').forEach(video => {
console.log('video selector got ', video);
      observer.observe(video);
      
console.log('should add ended event listener');
      video.addEventListener('ended', () => {
console.log('ended is being clled');
        const nextVideo = video.parentElement.nextElementSibling;
        
        if (nextVideo) {
	  nextVideo.scrollIntoView({
	    behavior: 'smooth',
	    block: 'start'
	  });
	}
      });
console.log('should have added ended event listener');
  });

  document.querySelectorAll('div').forEach(videoCell => {
    gestures.addSwipeGestureListener(videoCell, (direction) => {
      console.log('in callback', direction);
      let nextVideo;

      if(direction === 'up') {
	nextVideo = videoCell.previousElementSibling;
      } else if(direction === 'down') {
	nextVideo = videoCell.nextElementSibling;
      }

      if (nextVideo) {
	nextVideo.scrollIntoView({
	  behavior: 'smooth',
	  block: 'start'
	});
      }
    });

    gestures.addMouseSwipeListener(videoCell, (direction) => {
      console.log('in callback', direction);
      let nextVideo;
        nextVideo = videoCell.nextElementSibling
      if(direction === 'up') {
	nextVideo = videoCell.previousElementSibling;
      } else if(direction === 'down') {
	nextVideo = videoCell.nextElementSibling;
      }

      if (nextVideo) {
	nextVideo.scrollIntoView({
	  behavior: 'smooth',
	  block: 'start'
	});
      }
    });
  });

} catch(err) {
console.log('bigg ERROR');
console.log(err);
}
//document.getElementById('container').appendChild(video);


