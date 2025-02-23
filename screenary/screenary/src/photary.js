import gestures from './input/gestures.js';

function createImageElement(imageURL, uuid, imageData) {
  const div = document.createElement('div');
  div.classList.add('image-cell');

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container');

  const image = document.createElement('img');
  image.classList.add('image');

  indictor = loadingIndicator(); 
};
