console.log('importing animations');

const animations = {
  fromTo: (elem, fromRect, toRect, duration, onEnd) => {
    const animation = elem.animate([
      { 
        x: fromRect.x,
        y: fromRect.y,
        width: fromRect.width,
        height: fromRect.height
      },
      {
        x: toRect.x,
        y: toRect.y,
        width: toRect.width,
        height: toRect.height
      }
    ], {
      duration: duration,
      easing: 'ease-in-out',
      iterations: 1
    });

    animation.addEventListener('finish', onEnd);

    return animation;
  }
};

console.log('exporting animations');

export default animations;
