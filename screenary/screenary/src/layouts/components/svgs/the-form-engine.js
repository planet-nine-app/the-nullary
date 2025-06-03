function getBackgroundAndGradients() {
  const svg = `<rect width="500" height="600" fill="transparent"/>
  
  <!-- Form Container with Metallic Background -->
  <linearGradient id="metallicBackground" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#2a2a2e"/>
    <stop offset="50%" stop-color="#323236"/>
    <stop offset="100%" stop-color="#2a2a2e"/>
  </linearGradient>
  <rect x="50" y="50" width="400" height="600" rx="15" fill="url(#metallicBackground)" 
	stroke="#444" stroke-width="1"/>
  
  <!-- Subtle Metallic Highlight -->
  <line x1="51" y1="52" x2="449" y2="52" stroke="#555" stroke-width="1" opacity="0.5"/>
  
  <!-- Form Header -->
  <text x="250" y="85" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
	fill="#ffffff" text-anchor="middle">US SHIPPING ADDRESS</text>
  
  <!-- Define the gradient for active input borders -->
  <linearGradient id="inputGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="purple"/>
    <stop offset="100%" stop-color="green"/>
  </linearGradient>
  
  <!-- Button Gradient -->
  <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop id="submitButtonGradientStart" offset="0%" stop-color="green"/>
    <stop id="submitButtonGradientEnd" offset="100%" stop-color="purple"/>
  </linearGradient>

  <linearGradient id="buttonPressedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="purple"/>
    <stop offset="100%" stop-color="green"/>
  </linearGradient>`;

  return svg;
};

function getInput(x, y, text, inputType) {
  const borderId = `${text}Border`;
  const inputId = `${text}Input`;

  const svg = `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">${text}</text>
      <!-- Field Background -->
      <rect id="${borderId}" x="${x}" y="${y}" width="340" height="40" rx="8" fill="#1c1c20" 
            stroke="#444" stroke-width="2" class="input-field"/>
      <!-- Inset shadow effect -->
      <rect x="${x + 2}" y="${y + 8}" width="338" height="36" rx="6" fill="none" 
            stroke="#000" stroke-width="0" opacity="0.3"/>
      <!-- HTML Input Field -->
      <foreignObject x="${x}" y="${y + 10}" width="340" height="40">
        <input xmlns="http://www.w3.org/1999/xhtml" id="${inputId}" type="text" placeholder="${name}" class="svg-input" data-field="name" spellcheck="false" style="width:90%; height: 95%; background-color: transparent; color: white;"/>
      </foreignObject>`;

  return svg;
};

function getSubmitButton(x, y) {
  return `<rect id="submitButton" x="${x}" y="${y}" width="300" height="45" rx="22.5" fill="url(#buttonGradient)">
    </rect>
    <text x="${x + (300 / 2)}" y="${y + 23}" font-family="Arial, sans-serif" font-size="16" font-weight: "bold" fill="white" text-anchor="middle" dominant-baseline="middle">SUBMIT</text>
`;
};

function getForm(formJSON, onSubmit) {
  const keys = Object.keys(formJSON);
  const inputs = keys.map(($, index) => $ === "form" ? '' : getInput(80, 70 * index + 130, $, formJSON[$]));
  
  const svg = getBackgroundAndGradients() + inputs.join('') + getSubmitButton(100, 70 * (keys.length) + 130);

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', `0 0 500 600`);
  newElement.innerHTML = svg;

  container.appendChild(newElement);

setTimeout(() => {
  Object.keys(formJSON).map(($, index) => {
    if($ === 'form') {
      return;
    }

    const borderId = `${$}Border`;
    const inputId = `${$}Input`;
console.log('trying to get inputId: ', inputId);
console.log('and that input is: ', document.getElementById(inputId));
    document.getElementById(inputId).addEventListener('change', (evt) => {
console.log(evt);
      document.getElementById(borderId).setAttribute('stroke', 'url(#inputGradient)');
    });
  });

  document.getElementById('submitButton').addEventListener('click', () => {
console.log('this is getting clicked');
    const animation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animation.setAttribute("attributeName", "offset");
    animation.setAttribute("values", "-0.5; 2.5");
    animation.setAttribute("dur", "300");
    animation.setAttribute("repeatCount", "0");

    const secondAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animation.setAttribute("attributeName", "offset");
    animation.setAttribute("values", "0.5; 3.5");
    animation.setAttribute("dur", "300");
    animation.setAttribute("repeatCount", "0");

    document.getElementById('submitButtonGradientStart').appendChild(animation);
    document.getElementById('submitButtonGradientEnd').appendChild(secondAnimation);

    animation.beginElement();

    const formValues = {};
    Object.keys(formJSON).map(($, index) => {
      if($ === 'form') {
	return;
      }

      const inputId = `${$}Input`;
      formValues[$] = document.getElementById(inputId).value;
    });

    onSubmit(formValues);
  });
}, 10);

  return container;
};

/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600">
  <!-- Background -->
  <rect width="500" height="600" fill="#0f0f12"/>
  
  <!-- Form Container with Metallic Background -->
  <linearGradient id="metallicBackground" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#2a2a2e"/>
    <stop offset="50%" stop-color="#323236"/>
    <stop offset="100%" stop-color="#2a2a2e"/>
  </linearGradient>
  <rect x="50" y="50" width="400" height="500" rx="15" fill="url(#metallicBackground)" 
        stroke="#444" stroke-width="1"/>
  
  <!-- Subtle Metallic Highlight -->
  <line x1="51" y1="52" x2="449" y2="52" stroke="#555" stroke-width="1" opacity="0.5"/>
  
  <!-- Form Header -->
  <text x="250" y="85" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        fill="#ffffff" text-anchor="middle">US SHIPPING ADDRESS</text>
  
  <!-- Form Fields -->
  
  <!-- Name Field -->
  <text x="80" y="130" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">Name</text>
  <rect x="80" y="140" width="340" height="40" rx="8" fill="#1c1c20" 
        stroke="#444" stroke-width="2"/>
  <!-- Inset shadow effect -->
  <rect x="82" y="142" width="336" height="36" rx="6" fill="none" 
        stroke="#000" stroke-width="1" opacity="0.3"/>
  <foreignObject
  
  <!-- Address 1 Field -->
  <text x="80" y="200" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">Address 1</text>
  <rect x="80" y="210" width="340" height="40" rx="8" fill="#1c1c20" 
        stroke="#444" stroke-width="2"/>
  <rect x="82" y="212" width="336" height="36" rx="6" fill="none" 
        stroke="#000" stroke-width="1" opacity="0.3"/>
  
  <!-- Address 2 Field -->
  <text x="80" y="270" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">Address 2</text>
  <!-- This field has user input, so it gets the gradient border -->
  <linearGradient id="inputGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#3eda82"/>
    <stop offset="100%" stop-color="#9c42f5"/>
  </linearGradient>
  <rect x="80" y="280" width="340" height="40" rx="8" fill="#1c1c20" 
        stroke="url(#inputGradient)" stroke-width="2"/>
  <rect x="82" y="282" width="336" height="36" rx="6" fill="none" 
        stroke="#000" stroke-width="1" opacity="0.3"/>
  <text x="95" y="305" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">Suite 404</text>
  
  <!-- City Field -->
  <text x="80" y="340" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">City</text>
  <rect x="80" y="350" width="340" height="40" rx="8" fill="#1c1c20" 
        stroke="#444" stroke-width="2"/>
  <rect x="82" y="352" width="336" height="36" rx="6" fill="none" 
        stroke="#000" stroke-width="1" opacity="0.3"/>
  
  <!-- Two-Column Layout for State and Zip -->
  <!-- State Field -->
  <text x="80" y="410" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">State</text>
  <rect x="80" y="420" width="160" height="40" rx="8" fill="#1c1c20" 
        stroke="#444" stroke-width="2"/>
  <rect x="82" y="422" width="156" height="36" rx="6" fill="none" 
        stroke="#000" stroke-width="1" opacity="0.3"/>
  
  <!-- Zip Code Field - has user input so gets gradient -->
  <text x="260" y="410" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">Zip Code</text>
  <rect x="260" y="420" width="160" height="40" rx="8" fill="#1c1c20" 
        stroke="url(#inputGradient)" stroke-width="2"/>
  <rect x="262" y="422" width="156" height="36" rx="6" fill="none" 
        stroke="#000" stroke-width="1" opacity="0.3"/>
  <text x="275" y="445" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">94103</text>
  
  <!-- Submit Button -->
  <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#3eda82"/>
    <stop offset="100%" stop-color="#9c42f5"/>
  </linearGradient>
  <rect x="100" y="490" width="300" height="45" rx="22.5" fill="url(#buttonGradient)"/>
  <text x="250" y="520" font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
        fill="white" text-anchor="middle">SUBMIT</text>
        
  <!-- Input Field Placeholders -->
  <text x="95" y="165" font-family="Arial, sans-serif" font-size="14" fill="#666666">Enter your name</text>
  <text x="95" y="235" font-family="Arial, sans-serif" font-size="14" fill="#666666">Street address</text>
  <text x="95" y="375" font-family="Arial, sans-serif" font-size="14" fill="#666666">Enter city</text>
  <text x="95" y="445" font-family="Arial, sans-serif" font-size="14" fill="#666666">CA</text>
</svg>*/

export default getForm;
