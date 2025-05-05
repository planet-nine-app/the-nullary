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

/*  if(post.images && post.images.length > 0) {
    div.classList.add('vertical-post');
  } else {
    div.classList.add('horizontal-post');
  }*/

  

  const postContainer = document.createElement('div');
  postContainer.classList.add('post-container');

  if(mediaURL) {
    //TODO: handle video posts
  } else {
    const lexaryRow = getLexaryRow(description, images);
  console.log('total height', lexaryRow.totalHeight);
    postContainer.style.width = '100%';
    postContainer.style.aspectRatio = lexaryRow.aspectRatio;
    postContainer.style.height = lexaryRow.totalHeight + 'px';
    postContainer.style.backgroundColor = 'blue';
    postContainer.appendChild(lexaryRow);
  }
  return postContainer;
//  div.appendChild(postContainer);
//  return div;
};

function attachObserver() {
  const lazyImages = document.querySelectorAll('image');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      const image = entry.target;

      image.href = image.foo;
  
      observer.unobserve(image);
    });
  }, {
    rootMargin: '2000px 0px',
    threshold: 0.01
  });

  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.style.display = 'inline';
      if(!entry.target.posted && entry.target.post) {
console.log('it adds the post here');
        const postContainer = createPostElement(entry.target.post);
 
        const dividingLine = document.createElement('div');
        dividingLine.innerHTML = `
          <svg width="100%" height="10" xmlns="http://www.w3.org/2000/svg">
	    <line x1="0" y1="5" x2="100%" y2="5" stroke="#333" stroke-width="2" />
	  </svg>
        `;

        entry.target.appendChild(postContainer);
        entry.target.appendChild(dividingLine);
        entry.target.posted = true;
      }
    }
  });
}, {
  root: null,
  rootMargin: '1000px',
  threshold: 0.1
});

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

  const postMap = {};

  const filteredPosts = posts.filter($ => !$.url);

  filteredPosts.forEach((post, index) => {
console.log('looking at post with post uuid', post.uuid);
    if(postMap[post.uuid]) {
console.log('is this always returning or something?');
      return;
    }

    postMap[post.uuid] = true;
//console.log(postMap);

console.log(index);
    const div = document.createElement('div');
    div.classList.add('post-cell');
//    div.style.display = 'none';

    if(index < 16) {
console.log('index is less than six so it should be inline');
      const postContainer = createPostElement(post);
      div.appendChild(postContainer);
      div.style.display = 'inline';
      div.posted = true;
    } 

    div.post = post;

    container.appendChild(div);

//    observer.observe(div);
  });
};

export default appendLexary;
