import gestures from './input/gestures.js';
import getTeleportal from './layouts/components/svgs/teleportal.js';
import animations from './layouts/components/animations.js';
import getForm from './layouts/components/svgs/the-form-engine.js';

const addressFormJSON = {
  name: "text",
  address1: "text",
  address2: "text",
  city: "text",
  state: "text",
  zipCode: "number"
};

const mockProducts = [
  {
    uuid: '1',
    images: ['./assets/igotoeleven.png'],
    price: 500
  },
  {
    uuid: '2',
    images: ['./assets/ABHoT_front_cover.png'],
    price: 600
  },
  {
    uuid: '3',
    images: ['./assets/wizach.png'],
    price: 700
  }
];

function constructTeleported(product) {
  const svg = `<image x="0" y="0" width="100%" href=${product.images[0]}></image>`;

  return svg;
};

function createProductElement(product, onClick) {
  const div = document.createElement('div');
//    div.setAttribute('width', '280');
//    div.setAttribute('height', '280');
//    div.setAttribute('style', 'position: relative;');
  div.classList.add('post-cell');
  div.style.width = '100%';
  div.classList.add('vertical-post');

//  const productContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const productContainer = document.createElement('div');
  productContainer.classList.add('post-container');

  const teleported = constructTeleported(product);
  const teleportal = getTeleportal(teleported, onClick);

  productContainer.appendChild(teleportal);
  
  div.appendChild(productContainer);

  return div;
};

function teleportEmIn() {
//  window.alertt('Products are implemented, but I broke their layout and need to rebuild it.');
//  return;
  const container = document.getElementById('main');
  container.innerHTML = '';
  Array.from(container.classList).forEach($ => {
    if($.indexOf('ontainer') !== -1) {
      container.classList.remove($);
    }
  });
  container.classList.add('feed-container');

  mockProducts.forEach((product, index) => {
    const divsX = window.innerWidth / 2 - 140;
    const divsY = window.innerHeight / 2 - 140;
    const div = createProductElement(product, (evt) => {
console.log('product clicked', product);
      Array.from(container.children).forEach(elem => {
        if(elem === div) {
          const rect = {x: `${divsX}`, y: `${divsY}`, width: 280, height: 280};
          const fromToAnimations = animations.fromToSVG(elem, rect, {x: 600, y: 50, width: 150, height: 150}, 250, false);
console.log('fromToAnimations', fromToAnimations);

          const addressForm = getForm(addressFormJSON, (formValues) => {
console.log('onSubmit called with,', formValues);
             window.updateConfirmPayment(product.uuid, formValues);
             window.getPaymentIntentWithoutSplits(500, 'USD')
              .then((intent) => {
console.log('should have intent', intent);
                document.getElementById("payment-form").setAttribute("style", "display: visible;");
              })
              .catch(console.warn);
          });
          const addressRect = {x: '400', y: '170', width: '800', height: '0'};
          const addressToRect = JSON.parse(JSON.stringify(addressRect));
          addressToRect.height = '600';
          addressForm.setAttribute('x', addressRect.x);
          addressForm.setAttribute('y', addressRect.y);
          addressForm.setAttribute('width', addressRect.width);
          addressForm.setAttribute('height', addressRect.height);

          const formFromToAnimations = animations.fromToSVG(addressForm, addressRect, addressToRect, 300, false);
          formFromToAnimations.forEach($ => {
            addressForm.appendChild($);
            $.beginElement();
          });

          container.appendChild(addressForm);

          fromToAnimations.forEach($ => {
            div.appendChild($);
            $.beginElement();
          });
        } else {
          if(Array.from(elem.classList).indexOf('teleportal') !== -1) {
	    const fadeOut = animations.fade(1, 0, 250);
	    elem.appendChild(fadeOut);
	    fadeOut.beginElement();
          }
        }
      });
    });
    div.setAttribute('x', `${divsX}`);
    div.setAttribute('y', `${divsY}`);
    container.appendChild(div);
  });

};

export default teleportEmIn;
