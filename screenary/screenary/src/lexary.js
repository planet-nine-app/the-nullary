import gestures from './input/gestures.js';
import loadingIndicator from './layouts/components/loading-indicator.js';
import imageSelector from './layouts/components/image-selector.js';
import video from './layouts/components/video.js';
import getLexaryRow from './layouts/components/svgs/lexary-row.js';
import getEmptyState from './layouts/components/svgs/empty-state.js';

const mockPosts = [
  {
        uuid: '1',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        images: ['https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg'],
        isVertical: true,
        title: 'Big Buck Bunny',
        description: 'A sample video for testing'
    },
    {
        uuid: '2',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        title: 'Elephants Dream',
        isVertical: false,
        mediaType: 'image',
        description: 'Another sample video'
    },
    {
        uuid: '3',
        url: './gil.mp4',
        title: 'For Bigger Blazes',
        images: ['https://wallpapercave.com/wp/wp9329705.jpg'],
        isVertical: 'false',
        mediaType: 'image',
        description: 'One more sample video'
    }
];

function createPostElement(post) {
  const mediaURL = post.url;
  const description = post.description;
  const images = post.images;
  const uuid = post.uuid; 

  const div = document.createElement('div');
  div.classList.add('post-cell');
  div.classList.add('vertical-post');
//  div.classList.add('horizontal-post');

  const postContainer = document.createElement('div');
  postContainer.classList.add('post-container');

/*  const textContainer = document.createElement('div');
  textContainer.classList.add('post-text-container');
  textContainer.innerHTML = `<p>${postData.description}</p>`;

  postContainer.appendChild(textContainer);

  if(mediaURL || images) {
    const mediaContainer = document.createElement('div');
    mediaContainer.classList.add('media-container');

    if(!images) {
      video(mediaContainer, mediaURL);
    } else {
      imageSelector(mediaContainer, images);
    }

    postContainer.appendChild(mediaContainer);
  }

  div.appendChild(postContainer);

  return div; */

  if(mediaURL) {
    //TODO: handle video posts
  } else {
    const lexaryRow = getLexaryRow(description, images);
  console.log(postContainer);
    postContainer.appendChild(lexaryRow);
  }
//  return postContainer;
  div.appendChild(postContainer);
  return div;
};

function appendLexary(posts) {
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
console.log(post);
    const div = createPostElement(post);
    container.appendChild(div);
  });
/*  mockPosts.forEach((post) => {
    const div = createPostElement(post.url, post.uuid, post);
    container.appendChild(div);
  });*/
};

export default appendLexary;
