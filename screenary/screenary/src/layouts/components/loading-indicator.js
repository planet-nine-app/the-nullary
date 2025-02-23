function loadingIndicator() {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.classList.add('loading-indicator');
  loadingIndicator.textContent = 'Loading video...';
  loadingIndicator.style.display = 'block';
  return loadingIndicator;
};

export default loadingIndicator;
