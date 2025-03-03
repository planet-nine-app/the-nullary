import gestures from './input/gestures.js';
import getBaseRow from './layouts/components/svgs/base-row.js';

const mockBases = [
  {
    name: 'FOO',
    description: 'here is the first description',
    location: {
      latitude: 10.50900,
      longitude: 133.90483,
      postalCode: '12345'
    },
    soma: {
      lexary: [
        'parties'
      ],
      photary: [
        'music'
      ],
      viewary: [
        'rip the system'
      ]
    },
    dns: {
      dolores: 'https://dev.dolores.allyabase.com'
    },
    joined: true
  },
  {
    name: 'Here is another base',
    description: 'gonna have another base here',
    location: {
      latitude: 33.0030,
      longitude: 112.6263,
      postalCode: 'MVZ T78'
    },
    soma: {
      lexary: [
        'food'
      ],
      photary: [
        'recipes'
      ],
      viewary: [
        'concerts'
      ]
    },
    dns: {
      dolores: 'https://dev.dolores.allyabase.com'
    },
    joined: false
  },
  {
    name: 'Third base',
    description: 'Here is a third base',
    location: {
      latitude: 32.4564,
      longitude: 54.8090,
      postalCode: '97213'
    },
    soma: {
      lexary: [
        'topiaries'
      ],
      photary: [
        'estuaries'
      ],
      viewary: [
        'geography'
      ]
    },
    dns: {
      dolores: 'https://dev.dolores.allyabase.com'
    },
    joined: false
  }
];

function createBaseElement(base) {
//  const div = document.createElement('div');
//  div.classList.add('base-cell');

  const baseContainer = document.createElement('div');
  baseContainer.classList.add('base-container');

/*  const textContainer = document.createElement('div');
  textContainer.classList.add('base-text-container');
  textContainer.innerHTML = `<p>${base.description}</p>`;

  const joinContainer = document.createElement('div');
  joinContainer.classList.add('join-container');
  joinContainer.innerHTML = `<p>${base.joined ? 'JOIN' : 'LEAVE'}</p>`;

  joinContainer.addEventListener('click', (e) => {
    console.log('here is where you join');
  });

  baseContainer.appendChild(textContainer);
  baseContainer.appendChild(joinContainer); */

  const baseRow = getBaseRow(base.name, base.description, base.soma, () => {});
  baseContainer.appendChild(baseRow);
  
  return baseContainer;

//  div.appendChild(baseContainer);

//  return div;
};

function appendDiscoverBases() {
  const container = document.getElementById('main');
  container.classList.add('discover-bases-container');
  container.classList.remove('container');
  mockBases.forEach((base) => {
    const div = createBaseElement(base);
    container.appendChild(div);
  });
};

export default appendDiscoverBases;
