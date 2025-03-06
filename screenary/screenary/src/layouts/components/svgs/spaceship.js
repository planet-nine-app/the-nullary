function getSpaceship(x, y) {
  const svg = `
    <svg id="spaceship" x="${x}" y="${y}" width="200" height="80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80">
      <!-- Simple solid background -->
      <rect x="0" y="0" width="200" height="80" fill="#0F1729"/>
      
      <!-- Spaceship Body -->
      <ellipse cx="100" cy="40" rx="70" ry="25" fill="#3A506B"/>
      <path d="M30 40 L100 10 L170 40" fill="#3A506B"/>
      
      <!-- Cockpit -->
      <ellipse cx="100" cy="20" rx="25" ry="15" fill="#5BC0BE"/>
      
      <!-- Wing Accents -->
      <path d="M60 50 L40 70 L75 60 Z" fill="#1C2541"/>
      <path d="M140 50 L160 70 L125 60 Z" fill="#1C2541"/>
      
      <!-- Highlights -->
      <ellipse cx="100" cy="18" rx="15" ry="7" fill="white" opacity="0.3"/>
      <path d="M90 35 L100 38 L110 35" stroke="#5BC0BE" stroke-width="1" fill="none"/>
    </svg>`;

  return svg;
};

export default getSpaceship;
