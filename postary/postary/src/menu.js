function parseMenuCSV(csvContent) {
  const lines = csvContent.split('\n').map(line => {
    // Simple CSV parsing - handles quoted fields with commas
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });

  const menuItems = [];
  let currentItem = null;
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const [col1, col2, col3] = lines[i];
    
    // Skip empty lines
    if (!col1 && !col2 && !col3) continue;
    
    // Detect section headers
    if (col1 && !col2 && !col3) {
      currentSection = col1;
      continue;
    }
    
    // Skip section descriptions
    if (col1.includes('All orders come with') || col1.includes('No substitutions')) {
      continue;
    }
    
    // Handle "Build Your Own" section
    if (currentSection === 'Build Your Own') {
      if (col1 === 'Starting Price:') {
        const buildYourOwnItem = {
          name: 'Build Your Own Chilaquiles',
          section: currentSection,
          description: 'Customize your own chilaquiles',
          startingPrice: parsePrice(col2),
          options: []
        };
        
        // Parse the steps that follow
        let j = i + 2; // Skip "Steps:" line
        while (j < lines.length && lines[j][0]) {
          const [stepName, , stepConfig] = lines[j];
          if (stepName && stepConfig) {
            const option = parseOptionConfig(stepName, stepConfig);
            if (option) {
              buildYourOwnItem.options.push(option);
            }
          }
          j++;
        }
        
        menuItems.push(buildYourOwnItem);
        break; // End of file typically
      }
      continue;
    }
    
    // Start new menu item
    if (col1 === 'Name') {
      // Save previous item if exists
      if (currentItem) {
        menuItems.push(currentItem);
      }
      
      // Start new item
      currentItem = {
        name: col2,
        section: currentSection,
        description: '',
        price: null,
        options: []
      };
    }
    
    // Parse item properties
    if (currentItem) {
      if (col1 === 'Description') {
        currentItem.description = col2;
      }
      else if (col1 === 'Price') {
        currentItem.price = parsePrice(col2);
      }
      else if (col1.startsWith('Option:')) {
        const optionName = col1.replace('Option: ', '');
        const option = parseOptionConfig(optionName, col3);
        if (option) {
          currentItem.options.push(option);
        }
      }
    }
  }
  
  // Don't forget the last item
  if (currentItem) {
    menuItems.push(currentItem);
  }
  
  return menuItems;
}

function parsePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.match(/\$?(\d+(?:\.\d{2})?)/);
  return match ? Math.round(parseFloat(match[1]) * 100) : null; // Multiply by 100 for cents
}

function parseOptionConfig(optionName, configStr) {
  if (!configStr) return null;
  
  const isRequired = configStr.includes('*Required');
  const chooseOne = configStr.includes('Choose one');
  const chooseMany = configStr.includes('Choose as many as you like');
  
  return {
    name: optionName,
    required: isRequired, // Simple boolean - true for required, false for optional
    maxSelections: 0 // Set to 0 for now as requested
  };
}

// Example usage:
const csvContent = `Los Frikis Chilaquiles,,*Configurations
,,
,,
Set Menu,,
"All orders come with fried tortillas, crema mexicana, cheese, queso fresco, onions, cilantro, avocado, and a side of salsa macha. No substitutions.",,
,,
Name,Chilaquiles Verdes,
Description,"Salsa Verde, Chicken, Egg",
Option: Egg Preference,,"*Required, Choose one"
Option: Topping Exclusions,,"*Required, Choose as many as you like"
Price,$17,
,,
Name,Chilaquiles Rojos,
Description,"Salsa Roja, Arrachera, Egg",
Option: Egg Preference,,"*Required, Choose one"
Option: Topping Exclusions,,"*Optional, Choose as many as you like"
Price,$18,
,,
Name,Chilaquiles Encacahuajados,
Description,"Peanut Salsa, Pollo, Egg",
Option: Egg Preference,,"*Required, Choose one"
Option: Topping Exclusions,,"*Optional, Choose as many as you like"
Price,$17,
,,
Name,Chilaquiles Campechanos,
Description,"Salsa Verde, Salsa Roja, Arrachera, Chorizo, Egg",
Option: Egg Preference,,"*Required, Choose one"
Option: Topping Exclusions,,"*Optional, Choose as many as you like"
Price,$21,
,,
,,
Build Your Own,,
"All orders come with fried tortillas, crema mexicana, cheese, queso fresco, onions, cilantro, avocado, and a side of salsa macha. No substitutions.",,
,,
Starting Price:,$12,
Steps:,,
Choose Your Salsas,,"*Required, Choose as many as you like"
Choose Your Proteins,,"*Required, Choose as many as you like"
Option: Egg Preference,,"*Required, Choose one"
Option: Topping Exclusions,,"*Optional, Choose as many as you like"`;

// Parse the menu
const menuItems = parseMenuCSV(csvContent);

console.log('Parsed Menu Items:');
console.log(JSON.stringify(menuItems, null, 2));

export { parseMenuCSV, parsePrice, parseOptionConfig };
