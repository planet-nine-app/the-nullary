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
  const name = base.name;
  const description = base.description;
  const soma = base.soma;
  const joined = base.joined;

  const div = document.createElement('div');
  div.classList.add('post-cell');
  div.classList.add('base-cell');

  const baseContainer = document.createElement('div');
  baseContainer.classList.add('post-container');

  const baseRow = getBaseRow(name, description, soma, joined, () => {
    base.joined = !base.joined;
    if(base.joined) {
      baseCommand.leaveBase(base);
    } else {
      baseCommand.joinBase(base);
    }
  });
  baseContainer.appendChild(baseRow);

  div.appendChild(baseContainer);

  return div;
};

function appendDiscoverBases(bases) {
  const container = document.getElementById('main');
  container.innerHTML = '';
  Array.from(container.classList).forEach($ => {
    if($.indexOf('ontainer') !== -1) {
      container.classList.remove($);
    }
  });   
  container.classList.add('feed-container');

  bases.forEach((base) => {
console.log('HEre is what a base looks like yo', base);
    const div = createBaseElement(base);
console.log('base dive looks like', div);
    container.appendChild(div);
  });
};

export default appendDiscoverBases;
