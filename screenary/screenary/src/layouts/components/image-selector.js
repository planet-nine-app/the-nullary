import loadingIndicator from './loading-indicator.js';

function imageSelector(container, imageURL) {
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
    console.error(`image ${imageURL} error:`, e.target.error);
  });

  image.addEventListener('onLoad', (e) => {
    indicator.removeFromParent();
  });

  container.appendChild(image);
};

export default imageSelector;
