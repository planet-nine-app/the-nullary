console.log('importing grid points');

const small = Math.min(window.innerWidth * 0.08, window.innerHeight * 0.08);
const big = Math.min(window.innerWidth * 0.25, window.innerHeight * 0.25);

const smallSize = {width: small, height: small};
const bigSize = {width: big, height: big};

const fiveX = Math.floor(window.innerWidth * 0.05);
const fiveY = Math.floor(window.innerHeight * 0.05);

const eightyFiveX = Math.floor(window.innerWidth * 0.85);
const eightyFiveY = Math.floor(window.innerHeight * 0.85);

const fortyFiveX = Math.floor(window.innerWidth * 0.45);
const fortyFiveY = Math.floor(window.innerHeight * 0.45);

const ninetyX = Math.floor(window.innerWidth * 0.90);
const ninetyY = Math.floor(window.innerHeight * 0.90);

const gridPoints = {
  topLeft: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${fiveX}`, y: `${fiveY}`, ...bigSize} : {x: `${fiveX}`, y: `${fiveY}`, ...smallSize},
  middleLeft: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${fiveX}`, y: `${fortyFiveY}`, ...bigSize} : {x: `${fiveX}`, y: `${fortyFiveY}`, ...bigSize},
  bottomLeft: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${fiveX}`, y: `${eightyFiveY}`, ...bigSize} : {x: `${fiveX}`, y: `${eightyFiveY}`, ...smallSize},
  bottomCenter: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${fortyFiveX}`, y: `${eightyFiveY}`, ...bigSize} : {x: `${fortyFiveX}`, y: `${eightyFiveY}`, ...bigSize},
  bottomRight: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${eightyFiveX}`, y: `${eightyFiveY}`, ...bigSize} : {x: `${ninetyX}`, y: `${ninetyY}`, ...smallSize},
  middleRight: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${eightyFiveX}`, y: `${fortyFiveY}`, ...bigSize} : {x: `${ninetyX}`, y: `${ninetyY}`, ...smallSize},
  topRight: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${eightyFiveX}`, y: `${fiveY}`, ...bigSize} : {x: `${ninetyX}`, y: `${fiveY}`, ...smallSize},
  topCenter: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${fortyFiveX}`, y: `${fiveY}`, ...smallSize} : {x: `${fortyFiveX}`, y: `${fiveY}`, ...smallSize},
  middleCenter: (layoutDirection) => layoutDirection === 'horizontal' ? {x: `${fortyFiveX}`, y: `${fortyFiveY}`, ...bigSize} : {x: `${fortyFiveX}`, y: `${fortyFiveY}`, ...bigSize},
};

console.log('exporting grid points');

export default gridPoints;
