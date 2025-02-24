import gestures from './input/gestures.js';
import loadingIndicator from './layouts/components/loading-indicator.js';


// https://cdn.bsky.app/img/feed_thumbnail/plain/[POST AUTHOR DID]/[CID of $link]@[format]
const mockPhotos = [
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
        description: 'Another sample video'
    },
    {
        uuid: '3',
        url: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg',
        title: 'For Bigger Blazes',
        description: 'One more sample video'
    }
];

function createImageElement(imageURL, uuid, imageData) {
  const div = document.createElement('div');
  div.classList.add('image-cell');

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container');

  const textContainer = document.createElement('div');
  textContainer.classList.add('text-container');
  textContainer.innerHTML = `<p>${imageData.text}</p>`;

  const image = document.createElement('img');
  image.classList.add('image');
  image.src = imageURL;

  console.log('image src is: ', image.src);

  const indicator = loadingIndicator(); 

  const errorMessage = document.createElement('div');
  errorMessage.classList.add('error-message');

  image.addEventListener('error', (e) => {
    loadingIndicator.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.textContent = `Error loading video: ${e.target.error?.message || 'Unknown error'}`;
    console.error(`image ${uuid} error:`, e.target.error);
  });

  image.addEventListener('onLoad', (e) => {
    indicator.removeFromParent();
  });

  imageContainer.appendChild(image);
  imageContainer.appendChild(indicator);
  
  div.appendChild(textContainer);
  div.appendChild(imageContainer);;

  return div;
};

function appendPhotary() {
  const container = document.getElementById('main');
  container.classList.add('photary-container');
  container.classList.remove('container');
  mockPhotos.forEach((photo) => {
    const div = createImageElement(photo.url, photo.uuid, photo);
    container.appendChild(div);
  });
};

export default appendPhotary;
