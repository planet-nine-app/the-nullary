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

  const postContainer = document.createElement('div');
  postContainer.classList.add('post-container');

  const photaryRow = getPhotaryRow(description, images);
  
  postContainer.style.width = '100%';
  postContainer.style.aspectRatio = photaryRow.aspectRatio;
  
  postContainer.appendChild(photaryRow);

  return postContainer;
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.style.display = 'inline';
      if(!entry.target.posted && entry.target.post) {
console.log('it adds the post here', entry.target.post);
        const postContainer = createImageElement(entry.target.post);
        entry.target.appendChild(postContainer);
        entry.target.posted = true;
      }
    }
  });
}, {
  root: null,
  rootMargin: '1000px',
  threshold: 0.1
});

function appendPhotary(posts) {
console.log('photary posts', posts);
  const filteredPosts = posts.filter($ => $.images);
console.log('filteredPosts', filteredPosts);
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

  filteredPosts.forEach((post, index) => {
console.log('creating an image app with', post);
    const div = document.createElement('div');
    div.classList.add('image-cell');
//    div.style.display = 'none';
 
    if(index < 6) {
      const imageContainer = createImageElement(post);
      div.appendChild(imageContainer); 
      div.style.display = 'inline';
      div.posted = true;
    }

    div.post = post;
  
    container.appendChild(div);

    observer.observe(div);
  });
};

export default appendPhotary;
