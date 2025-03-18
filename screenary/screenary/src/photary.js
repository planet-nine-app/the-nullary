import gestures from './input/gestures.js';
import getImageSelector from './layouts/components/image-selector.js';
import loadingIndicator from './layouts/components/loading-indicator.js';
import getEmptyState from './layouts/components/svgs/empty-state.js';
import getPhotaryRow from './layouts/components/svgs/photary-row.js';


// https://cdn.bsky.app/img/feed_thumbnail/plain/[POST AUTHOR DID]/[CID of $link]@[format]
const mockPhotos = [
    {
        uuid: '1',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        images: ['https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg', 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg'],
        title: 'Big Buck Bunny',
        description: 'A sample video for testing'
    },
    {
        uuid: '2',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        title: 'Elephants Dream',
        description: 'Another sample video'
    },
    {
        uuid: '3',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        title: 'For Bigger Blazes',
        description: 'One more sample video'
    }
];

function createImageElement(post) {
  const description = post.description;
  const images = post.images;
console.log('it should render these images', images);

  const div = document.createElement('div');
  div.classList.add('image-cell');

  const postContainer = document.createElement('div');
  postContainer.classList.add('post-container');

  const photaryRow = getPhotaryRow(description, images);
  
  postContainer.appendChild(photaryRow);

  div.appendChild(postContainer);;

  return div;
};

function appendPhotary(posts) {
  const filteredPosts = posts.filter($ => $.images);
  const container = document.getElementById('main');
  container.innerHTML = '';
  Array.from(container.classList).forEach($ => {
    if($.indexOf('ontainer') !== -1) {
      container.classList.remove($);
    }
  });
  container.classList.add('feed-container');

  if(filteredPosts.length === 0) {
    const div = document.createElement('div');
    div.classList.add('post-cell');
    div.classList.add('vertical-post');

    const emptyState = getEmptyState(() => {
console.log('here is where you will refresh');
    });

    div.appendChild(emptyState);

    container.appendChild(div);
  }

  filteredPosts.forEach(post => {
    const div = createImageElement(post);
    container.appendChild(div);
  });
};

export default appendPhotary;
