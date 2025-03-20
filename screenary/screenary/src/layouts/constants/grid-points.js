console.log('importing grid points');

let gridPoints = {};

gridPoints.recalculate = () => {
  const small = Math.floor(window.innerWidth * 0.12);
  const big = Math.floor(window.innerWidth * 0.24);
  const padding = Math.floor(window.innerWidth * 0.05);

  const smallSize = {width: small, height: small};
  const bigSize = {width: big, height: big};

  const layoutDirection = window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical';

  const left = padding;
  const right = window.innerWidth - big - padding;
  const center = window.innerWidth / 2 - (big / 2);
  const top = padding;
  const middle = window.innerHeight / 2 - (big / 2);
  const bottom = window.innerHeight - big -(big / 2) - padding;

  gridPoints = {
    topLeft: {x: left, y: top, ...bigSize},
    middleLeft: {x: left, y: middle, ...bigSize},
    bottomLeft: {x: left, y: bottom, ...bigSize},
    bottomCenter: {x: center, y: bottom, ...bigSize},
    bottomRight: {x: right, y: bottom, ...bigSize},
    middleRight: {x: right, y: middle, ...bigSize},
    topRight: {x: right, y: top, ...bigSize},
    topCenter: {x: center, y: top, ...bigSize},
    middleCenter: {x: center, y: middle, ...bigSize},
    ...gridPoints
  };
};

gridPoints.recalculate();

console.log('exporting grid points');

export default gridPoints;
