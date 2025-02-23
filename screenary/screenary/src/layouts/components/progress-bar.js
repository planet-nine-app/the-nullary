function progressBar() {
  const progressContainer = document.createElement('div');
  progressContainer.classList.add('progress-container');

  const progressBarDiv = document.createElement('div');
  progressBarDiv.classList.add('progress-bar');
  progressContainer.appendChild(progressBarDiv);

  return progressContainer;
};

export default progressBar;
