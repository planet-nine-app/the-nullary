const swipeThresholds = {
  minX: 30,
  maxX: 30,
  minY: 50,
  maxY: 60
};

const gestures = {
  addSwipeGestureListener: (element, callback) => {
    const swipeWatcher = {};

    element.addEventListener('touchstart', (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      swipeWatcher.startX = touch.screenX;
      swipeWatcher.startY = touch.screenY;
    });

    element.addEventListener('touchmove', (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      swipeWatcher.endX = touch.screenX;
      swipeWatcher.endY = touch.screenY;
    });

    element.addEventListener('touchend', (event) => {
      event.preventDefault();
      const xDiff = swipeWatcher.endX - swipeWatcher.startX;
      const yDiff = swipeWatcher.endY - swipeWatcher.startY;
      
      if(Math.abs(yDiff) > swipeThresholds.minY && yDiff > 0) {
        callback('up');
      } else if(Math.abs(yDiff) > swipeThresholds.minY && yDiff < 0) {
        callback('down');
      } 
    });
  },

  addMouseSwipeListener: (element, callback) => {
    const swipeWatcher = {};

    element.addEventListener('mousedown', (event) => {
      swipeWatcher.startX = event.clientX;
      swipeWatcher.startY = event.clientY;
    });

    element.addEventListener('mousemove', (event) => {
      swipeWatcher.endX = event.clientX;
      swipeWatcher.endY = event.clientY;
    });

    element.addEventListener('mouseup', (event) => {
      const xDiff = swipeWatcher.endX - swipeWatcher.startX;
      const yDiff = swipeWatcher.endY - swipeWatcher.startY;
      
      if(Math.abs(yDiff) > swipeThresholds.minY && yDiff > 0) {
        callback('up');
      } else if(Math.abs(yDiff) > swipeThresholds.minY && yDiff < 0) {
        callback('down');
      } 
    });
  },
};

export default gestures;
