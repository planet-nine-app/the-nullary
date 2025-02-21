console.log('importing gestures');
const swipeThresholds = {
  minX: 30,
  maxX: 30,
  minY: 50,
  maxY: 60
};

const gestures = {
  addSwipeGestureListener: (element, callback) => {
    const swipeWatcher = {};
    window.swipeMoved = false;

    element.addEventListener('touchstart', (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      swipeWatcher.startX = touch.screenX;
      swipeWatcher.startY = touch.screenY;
      window.swipeMoved = false;
    });

    element.addEventListener('touchmove', (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      swipeWatcher.endX = touch.screenX;
      swipeWatcher.endY = touch.screenY;
      
      // Check if movement is significant enough to be considered a swipe
      const xDiff = Math.abs(swipeWatcher.endX - swipeWatcher.startX);
      const yDiff = Math.abs(swipeWatcher.endY - swipeWatcher.startY);
      if (xDiff > 10 || yDiff > 10) {
        window.swipeMoved = true;
      }
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
      
      // Reset swipe movement flag after a short delay
      setTimeout(() => {
        window.swipeMoved = false;
      }, 50);
    });
  },

  addMouseSwipeListener: (element, callback) => {
    const swipeWatcher = {};
    window.swipeMoved = false;

    element.addEventListener('mousedown', (event) => {
      swipeWatcher.startX = event.clientX;
      swipeWatcher.startY = event.clientY;
      window.swipeMoved = false;
    });

    element.addEventListener('mousemove', (event) => {
      if (event.buttons === 1) { // Only track if mouse button is pressed
        swipeWatcher.endX = event.clientX;
        swipeWatcher.endY = event.clientY;
        
        // Check if movement is significant enough to be considered a swipe
        const xDiff = Math.abs(swipeWatcher.endX - swipeWatcher.startX);
        const yDiff = Math.abs(swipeWatcher.endY - swipeWatcher.startY);
        if (xDiff > 10 || yDiff > 10) {
          window.swipeMoved = true;
        }
      }
    });

    element.addEventListener('mouseup', (event) => {
      const xDiff = swipeWatcher.endX - swipeWatcher.startX;
      const yDiff = swipeWatcher.endY - swipeWatcher.startY;
      
      if(Math.abs(yDiff) > swipeThresholds.minY && yDiff > 0) {
        callback('up');
      } else if(Math.abs(yDiff) > swipeThresholds.minY && yDiff < 0) {
        callback('down');
      }
      
      // Reset swipe movement flag after a short delay
      setTimeout(() => {
        window.swipeMoved = false;
      }, 50);
    });
  },
};

console.log('exporting gestures');

export default gestures;
