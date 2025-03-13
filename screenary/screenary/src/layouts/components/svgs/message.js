function getDefs() {
  return `<defs>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="25" result="blur" />
      <feFlood flood-color="green" flood-opacity="0.9" result="glow-color" />
      <feComposite in="glow-color" in2="blur" operator="in" result="glow-blur" />
      <feMerge>
        <feMergeNode in="glow-blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>`;
};

function getLine(x, y, line) {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="36" text-anchor="middle"
        fill="green" filter="url(#glow)">
    ${line}
  </text>`;
}

function getMessage(msg) {
  const CHARACTERS_PER_LINE = 32;
  const LINE_HEIGHT = 48;

  const lines = [];
  for(var i = 0; i < msg.length; i += CHARACTERS_PER_LINE) {
    lines.push(msg.slice(i * CHARACTERS_PER_LINE, (i + 1) * CHARACTERS_PER_LINE));
  }

  let x = 16;
  let y = 16;
  
  let svg = getDefs();
  lines.forEach(line => {
    svg += getLine(x, y, line);
    y += LINE_HEIGHT;
  });

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', '0 0 600 300');
  newElement.innerHTML = svg;

  container.appendChild(newElement);

  return container;
};
