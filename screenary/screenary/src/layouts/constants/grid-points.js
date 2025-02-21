console.log('importing grid points');

const smallSize = {width: 128, height: 128};
const bigSize = {width: 512, height: 512};

const gridPoints = {
  topLeft: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '5%', y: '5%', ...bigSize} : {x: '5%', y: '5%', ...smallSize},
  middleLeft: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '5%', y: '45%', ...bigSize} : {x: '5%', y: '45%', ...bigSize},
  bottomLeft: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '5%', y: '85%', ...bigSize} : {x: '5%', y: '85%', ...smallSize},
  bottomCenter: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '45%', y: '85%', ...bigSize} : {x: '45%', y: '85%', ...bigSize},
  bottomRight: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '85%', y: '85%', ...bigSize} : {x: '90%', y: '90%', ...smallSize},
  middleRight: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '85%', y: '45%', ...bigSize} : {x: '90%', y: '87%', ...smallSize},
  topRight: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '85%', y: '5%', ...bigSize} : {x: '90%', y: '5%', ...smallSize},
  topCenter: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '47%', y: '5%', ...smallSize} : {x: '47%', y: '5%', ...smallSize},
  middleCenter: (layoutDirection) => layoutDirection === 'horizontal' ? {x: '45%', y: '45%', ...bigSize} : {x: '45%', y: '45%', ...bigSize},
};

console.log('exporting grid points');

export default gridPoints;
