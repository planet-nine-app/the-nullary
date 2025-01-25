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
  }, { threshold: 0.5 });

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


console.log(feed);
} catch(err) {
console.log('here is the err', err);
}
