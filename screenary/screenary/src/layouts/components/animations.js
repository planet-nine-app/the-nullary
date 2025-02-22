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
  },

  fromToSVG: (elem, fromRect, toRect, duration, isCircle, onEnd) => {
    const animateAttrs = isCircle 
    ? [
        { attr: 'cx', from: fromRect.x + fromRect.width/2, to: toRect.x + toRect.width/2 },
        { attr: 'cy', from: fromRect.y + fromRect.height/2, to: toRect.y + toRect.height/2 },
        { attr: 'r', from: Math.min(fromRect.width, fromRect.height)/2, to: Math.min(toRect.width, toRect.height)/2 }
      ]
    : [
        { attr: 'x', from: fromRect.x, to: toRect.x },
        { attr: 'y', from: fromRect.y, to: toRect.y },
        { attr: 'width', from: fromRect.width, to: toRect.width },
        { attr: 'height', from: fromRect.height, to: toRect.height }
      ];

    const animations = animateAttrs.map(({attr, from, to}) => {
      const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      animate.setAttribute("attributeName", attr);
      animate.setAttribute("from", from);
      animate.setAttribute("to", to);
      animate.setAttribute("dur", `${duration}ms`);
      animate.setAttribute("begin", "1ms");
      animate.setAttribute("fill", "freeze");
      return animate;
    });

    if (onEnd) {
      animations[animations.length - 1].addEventListener('endEvent', onEnd);
    }

    return animations;
  },

  fade: (out, duration, onEnd) => {
    const from = out ? 1 : 0;
    const to = out ? 0 : 1;

    const animation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animation.setAttribute("attributeName", "opacity");
    animation.setAttribute("from", from);
    animation.setAttribute("to", to);
    animation.setAttribute("dur", `${duration}ms`);
    animation.setAttribute("begin", "1ms");
    animation.setAttribute("fill", "freeze");

    if(onEnd) {
      animation.addEventListener('endEvent', onEnd);
    }

    return animation;
  }
};

console.log('exporting animations');

export default animations;
