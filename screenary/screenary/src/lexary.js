import gestures from './input/gestures.js';
import loadingIndicator from './layouts/components/loading-indicator.js';
import imageSelector from './layouts/components/image-selector.js';
import video from './layouts/components/video.js';

const mockPosts = [
  {
        uuid: '1',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        title: 'Big Buck Bunny',
        description: 'A sample video for testing'
    },
    {
        uuid: '2',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        title: 'Elephants Dream',
        mediaType: 'image',
        description: 'Another sample video'
    },
    {
        uuid: '3',
        url: './gil.mp4',
        title: 'For Bigger Blazes',
        mediaType: 'video',
        description: 'One more sample video'
    }
];

function createPostElement(mediaURL, uuid, postData) {
  const div = document.createElement('div');
  div.classList.add('post-cell');

  const postContainer = document.createElement('div');
  postContainer.classList.add('post-container');

  const textContainer = document.createElement('div');
  textContainer.classList.add('post-text-container');
  textContainer.innerHTML = `<p>${postData.description}</p>`;

  postContainer.appendChild(textContainer);

  if(mediaURL) {
    const mediaContainer = document.createElement('div');
    mediaContainer.classList.add('media-container');

    if(postData.mediaType === 'video') {
      video(mediaContainer, mediaURL);
    } else if(postData.mediaType === 'image') {
      imageSelector(mediaContainer, mediaURL);
    }

    postContainer.appendChild(mediaContainer);
  }

  div.appendChild(postContainer);

  return div;  
};

function appendLexary() {
  const container = document.getElementById('main');
  container.classList.add('lexary-container');
  container.classList.remove('container');
  mockPosts.forEach((post) => {
    const div = createPostElement(post.url, post.uuid, post);
    container.appendChild(div);
  });
};

export default appendLexary;
