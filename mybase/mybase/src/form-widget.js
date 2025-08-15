(function(window) {
  'use strict';

  // Traditional form functions (original widget)
  function calculateTextBlockHeight(text, width = 340, fontSize = 14, lineHeight = 1.4) {
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.width = `${width}px`;
    temp.style.fontSize = `${fontSize}px`;
    temp.style.lineHeight = `${lineHeight}`;
    temp.style.fontFamily = 'Arial, sans-serif';
    temp.style.padding = '12px';
    temp.innerHTML = text;
    
    document.body.appendChild(temp);
    const height = temp.offsetHeight;
    document.body.removeChild(temp);
    
    return height;
  }

  function calculateTextAreaHeight(charLimit = 500) {
    // Calculate height based on character limit
    // Roughly 80 characters per line, 20px per line, with padding
    const estimatedLines = Math.max(3, Math.ceil(charLimit / 80));
    return Math.min(estimatedLines * 20 + 40, 120); // Cap at 120px for UI
  }

  function calculateImageInputHeight() {
    return 120; // Fixed height for image upload area
  }

  function calculateFormHeight(formConfig) {
    const fields = Object.keys(formConfig).filter(key => key !== 'form');
    const headerHeight = 85;           
    const standardFieldHeight = 70;
    const submitButtonHeight = 45;     
    const bottomPadding = 30;
    
    let totalHeight = headerHeight;
    
    fields.forEach(key => {
      const fieldConfig = formConfig[key];
      
      if (fieldConfig.type === 'text-block') {
        const textHeight = calculateTextBlockHeight(fieldConfig.content || fieldConfig.text);
        totalHeight += textHeight + 20;
      } else if (fieldConfig.type === 'textarea') {
        const charLimit = fieldConfig.charLimit || 500;
        const textareaHeight = calculateTextAreaHeight(charLimit);
        totalHeight += textareaHeight + 50; // Label + textarea + padding
      } else if (fieldConfig.type === 'image') {
        const imageHeight = calculateImageInputHeight();
        totalHeight += imageHeight + 50; // Label + image area + padding
      } else {
        totalHeight += standardFieldHeight;
      }
    });
    
    return totalHeight + submitButtonHeight + bottomPadding;
  }

  function getBackgroundAndGradients(formConfig, title = 'CONTACT FORM') {
    const dynamicHeight = calculateFormHeight(formConfig);

    return `<rect width="100%" height="${dynamicHeight}" fill="transparent"/>
    
    <!-- Form Container with Metallic Background -->
    <linearGradient id="metallicBackground" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a2a2e"/>
      <stop offset="50%" stop-color="#323236"/>
      <stop offset="100%" stop-color="#2a2a2e"/>
    </linearGradient>
    <rect x="2.5%" y="50" width="95%" height="${dynamicHeight}" rx="15" fill="url(#metallicBackground)" 
      stroke="#444" stroke-width="0.15%"/>
    
    <!-- Subtle Metallic Highlight -->
    <line x1="2.6%" y1="52" x2="97.4%" y2="52" stroke="#555" stroke-width="0.15%" opacity="0.5"/>
    
    <!-- Form Header -->
    <text x="50%" y="85" font-family="Arial, sans-serif" font-size="1.5em" font-weight="bold" 
      fill="#ffffff" text-anchor="middle">${title}</text>
    
    <!-- Define the gradient for active input borders -->
    <linearGradient id="inputGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="purple"/>
      <stop offset="100%" stop-color="green"/>
    </linearGradient>
    
    <!-- Button Gradient -->
    <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop id="submitButtonGradientStart" offset="0%" stop-color="green"/>
      <stop id="submitButtonGradientEnd" offset="100%" stop-color="purple"/>
    </linearGradient>`;
  }

  function getInput(x, y, text, inputType, fieldConfig = {}) {
    const borderId = `${text.replace(/\s+/g, '')}Border`;
    const inputId = `${text.replace(/\s+/g, '')}Input`;
    const placeholder = fieldConfig.placeholder || `Enter ${text.toLowerCase()}`;

    return `<text x="${x}%" y="${y}" font-family="Arial, sans-serif" font-size="0.875em" fill="#bbbbbb">${text}${fieldConfig.required !== false ? ' *' : ''}</text>
      <!-- Field Background -->
      <rect id="${borderId}" x="${x}%" y="${y + 10}" width="90%" height="40" rx="8" fill="#1c1c20" 
            stroke="#444" stroke-width="0.25%" class="input-field"/>
      <!-- HTML Input Field -->
      <foreignObject x="${x + 0.5}%" y="${y + 15}" width="89%" height="30">
        <input xmlns="http://www.w3.org/1999/xhtml" id="${inputId}" type="${inputType}" placeholder="${placeholder}" data-field="${text}" spellcheck="false" style="width:100%; height: 100%; background-color: transparent; color: white; border: none; outline: none; padding: 8px 12px; font-size: 14px; font-family: Arial, sans-serif; border-radius: 6px;"/>
      </foreignObject>`;
  }

  function getTextArea(x, y, text, fieldConfig) {
    const borderId = `${text.replace(/\s+/g, '')}Border`;
    const textareaId = `${text.replace(/\s+/g, '')}Textarea`;
    const counterId = `${text.replace(/\s+/g, '')}Counter`;
    const charLimit = fieldConfig.charLimit || 500;
    const textareaHeight = calculateTextAreaHeight(charLimit);
    const placeholder = fieldConfig.placeholder || `Enter ${text.toLowerCase()}`;

    return `<text x="${x}%" y="${y}" font-family="Arial, sans-serif" font-size="0.875em" fill="#bbbbbb">${text}${fieldConfig.required !== false ? ' *' : ''}</text>
      <!-- Character Counter -->
      <text x="${x + 90}%" y="${y}" font-family="Arial, sans-serif" font-size="0.75em" fill="#888" text-anchor="end" id="${counterId}">0/${charLimit}</text>
      <!-- TextArea Background -->
      <rect id="${borderId}" x="${x}%" y="${y + 10}" width="90%" height="${textareaHeight}" rx="8" fill="#1c1c20" 
            stroke="#444" stroke-width="0.25%" class="input-field"/>
      <!-- HTML TextArea Field -->
      <foreignObject x="${x + 0.5}%" y="${y + 15}" width="89%" height="${textareaHeight - 10}">
        <textarea xmlns="http://www.w3.org/1999/xhtml" id="${textareaId}" placeholder="${placeholder}" data-field="${text}" maxlength="${charLimit}" spellcheck="false" style="width:100%; height: 100%; background-color: transparent; color: white; border: none; outline: none; padding: 8px 12px; font-size: 14px; font-family: Arial, sans-serif; border-radius: 6px; resize: none;"></textarea>
      </foreignObject>`;
  }

  function getSubmitButton(x, y, buttonText = 'SUBMIT') {
    return `<rect id="submitButton" x="${x}%" y="${y}" width="87%" height="45" rx="22.5" fill="#666666" style="cursor: not-allowed;">
        </rect>
        <text x="50%" y="${y + 28}" font-family="Arial, sans-serif" font-size="1em" font-weight="bold" fill="#999999" text-anchor="middle" dominant-baseline="middle" style="pointer-events: none;">${buttonText}</text>
    `;
  }

  function getForm(formJSON, onSubmit, title = 'CONTACT FORM') {
    // Store formJSON globally for validation access
    window.currentFormJSON = formJSON;
    
    const keys = Object.keys(formJSON);
    let currentY = 130;
    const inputs = [];
    
    keys.forEach((key, index) => {
      if (key === "form") return;
      
      const fieldConfig = formJSON[key];
      if (fieldConfig.type === 'textarea') {
        inputs.push(getTextArea(5, currentY, key, fieldConfig));
        const charLimit = fieldConfig.charLimit || 500;
        const textareaHeight = calculateTextAreaHeight(charLimit);
        currentY += textareaHeight + 50;
      } else {
        const inputType = fieldConfig.type === 'email' ? 'email' : 'text';
        inputs.push(getInput(5, currentY, key, inputType, fieldConfig));
        currentY += 70;
      }
    });
    
    // Get button text from form config
    const buttonText = formJSON.form?.submitText || 'SUBMIT';
    inputs.push(getSubmitButton(6.5, currentY + 20, buttonText));
    
    const svg = getBackgroundAndGradients(formJSON, title) + inputs.join('');
    const dynamicHeight = calculateFormHeight(formJSON);

    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.setAttribute('viewBox', `0 0 1000 ${dynamicHeight + 100}`);
    container.setAttribute('width', '100%');
    container.setAttribute('height', `${dynamicHeight + 100}px`);
    container.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    container.innerHTML = svg;

    setTimeout(() => {
      Object.keys(formJSON).forEach((key) => {
        if(key === 'form') return;
        
        const fieldConfig = formJSON[key];
        
        if (fieldConfig.type === 'textarea') {
          const textareaId = `${key.replace(/\s+/g, '')}Textarea`;
          const counterId = `${key.replace(/\s+/g, '')}Counter`;
          const borderId = `${key.replace(/\s+/g, '')}Border`;
          const textareaElement = document.getElementById(textareaId);
          const counterElement = document.getElementById(counterId);
          const borderElement = document.getElementById(borderId);
          const charLimit = fieldConfig.charLimit || 500;
          
          if (textareaElement && counterElement) {
            textareaElement.addEventListener('input', (evt) => {
              const currentLength = evt.target.value.length;
              counterElement.textContent = `${currentLength}/${charLimit}`;
              
              // Update border color when typing
              if (borderElement) {
                borderElement.setAttribute('stroke', 'url(#inputGradient)');
              }
              
              // Change counter color if approaching limit
              if (currentLength > charLimit * 0.9) {
                counterElement.setAttribute('fill', '#ff6b6b');
              } else if (currentLength > charLimit * 0.75) {
                counterElement.setAttribute('fill', '#ffa726');
              } else {
                counterElement.setAttribute('fill', '#888');
              }
            });
          }
        } else {
          const inputId = `${key.replace(/\s+/g, '')}Input`;
          const inputElement = document.getElementById(inputId);
          
          if (inputElement) {
            inputElement.addEventListener('input', (evt) => {
              const borderId = `${key.replace(/\s+/g, '')}Border`;
              const borderElement = document.getElementById(borderId);
              if (borderElement) {
                borderElement.setAttribute('stroke', 'url(#inputGradient)');
              }
            });
          }
        }
      });
    }, 100);

    // Add form validation after a short delay to ensure all inputs are set up
    setTimeout(() => {
      console.log('🔧 Setting up form validation and submit handler');
      validateFormAndUpdateSubmit(formJSON);
      
      // Add submit button click handler
      const submitButton = document.getElementById('submitButton');
      console.log('🔍 Submit button element:', submitButton);
      console.log('🔍 onSubmit callback provided:', typeof onSubmit, onSubmit);
      
      if (submitButton && onSubmit) {
        console.log('✅ Adding click handler to submit button');
        submitButton.addEventListener('click', (e) => {
          console.log('🖱️ Submit button clicked!');
          e.preventDefault();
          
          console.log('🔍 Button cursor style:', submitButton.style.cursor);
          console.log('🔍 Button fill attribute:', submitButton.getAttribute('fill'));
          
          // Only allow submission if button is enabled
          if (submitButton.style.cursor === 'pointer') {
            console.log('✅ Button is enabled, proceeding with submission');
            
            // Collect all form data
            console.log('📊 Collecting form data...');
            const formData = collectFormData(formJSON);
            console.log('📊 Collected form data:', formData);
            
            // Call the provided onSubmit callback
            if (typeof onSubmit === 'function') {
              console.log('🚀 Calling onSubmit callback with form data');
              onSubmit(formData);
            } else {
              console.error('❌ onSubmit is not a function:', typeof onSubmit);
            }
          } else {
            console.warn('⚠️ Submit button is disabled (cursor:', submitButton.style.cursor + ')');
          }
        });
      } else {
        console.error('❌ Cannot add submit handler:', {
          submitButton: !!submitButton,
          onSubmit: !!onSubmit,
          onSubmitType: typeof onSubmit
        });
      }
      
      // Add validation listeners to all inputs
      Object.keys(formJSON).forEach((key) => {
        if(key === 'form') return;
        
        const fieldConfig = formJSON[key];
        
        if (fieldConfig.type === 'textarea') {
          const textareaId = `${key.replace(/\s+/g, '')}Textarea`;
          const textareaElement = document.getElementById(textareaId);
          if (textareaElement) {
            textareaElement.addEventListener('input', () => validateFormAndUpdateSubmit(formJSON));
          }
        } else {
          const inputId = `${key.replace(/\s+/g, '')}Input`;
          const inputElement = document.getElementById(inputId);
          if (inputElement) {
            inputElement.addEventListener('input', () => validateFormAndUpdateSubmit(formJSON));
          }
        }
      });
    }, 200);

    return container;
  }

  // Form validation function
  function validateFormAndUpdateSubmit(formJSON) {
    console.log('🔍 Running form validation...');
    const submitButton = document.getElementById('submitButton');
    const submitText = submitButton?.nextElementSibling;
    
    if (!submitButton) {
      console.warn('⚠️ Submit button not found during validation');
      return;
    }
    
    // Check if all required fields are filled
    let allFieldsFilled = true;
    const fieldValidation = {};
    
    Object.keys(formJSON).forEach((key) => {
      if (key === 'form') return;
      
      const fieldConfig = formJSON[key];
      const isRequired = fieldConfig.required !== false; // Default to required unless explicitly false
      
      if (!isRequired) return;
      
      if (fieldConfig.type === 'textarea') {
        const textareaId = `${key.replace(/\s+/g, '')}Textarea`;
        const textareaElement = document.getElementById(textareaId);
        const hasValue = !!(textareaElement && textareaElement.value.trim());
        fieldValidation[key] = { type: 'textarea', required: isRequired, filled: hasValue, value: textareaElement?.value };
        if (isRequired && !hasValue) {
          allFieldsFilled = false;
        }
      } else {
        const inputId = `${key.replace(/\s+/g, '')}Input`;
        const inputElement = document.getElementById(inputId);
        const hasValue = !!(inputElement && inputElement.value.trim());
        fieldValidation[key] = { type: 'text', required: isRequired, filled: hasValue, value: inputElement?.value };
        if (isRequired && !hasValue) {
          allFieldsFilled = false;
        }
      }
    });
    
    console.log('📋 Field validation results:', fieldValidation);
    console.log('✅ All fields filled:', allFieldsFilled);
    
    // Update submit button appearance based on validation
    if (allFieldsFilled) {
      console.log('🟢 Enabling submit button');
      submitButton.setAttribute('fill', 'url(#buttonGradient)');
      submitButton.style.cursor = 'pointer';
      if (submitText) {
        submitText.setAttribute('fill', '#ffffff');
      }
    } else {
      console.log('🔴 Disabling submit button');
      submitButton.setAttribute('fill', '#666666');
      submitButton.style.cursor = 'not-allowed';
      if (submitText) {
        submitText.setAttribute('fill', '#999999');
      }
    }
  }

  // Function to collect all form data
  function collectFormData(formJSON) {
    console.log('📊 Starting form data collection...');
    const formData = {};
    
    Object.keys(formJSON).forEach((key) => {
      if (key === 'form') return;
      
      const fieldConfig = formJSON[key];
      
      if (fieldConfig.type === 'textarea') {
        // Get textarea value
        const textareaId = `${key.replace(/\s+/g, '')}Textarea`;
        const textareaElement = document.getElementById(textareaId);
        formData[key] = textareaElement ? textareaElement.value : '';
      } else {
        // Get regular input value
        const inputId = `${key.replace(/\s+/g, '')}Input`;
        const inputElement = document.getElementById(inputId);
        formData[key] = inputElement ? inputElement.value : '';
      }
    });
    
    console.log('📊 Form data collection complete:', formData);
    return formData;
  }

  // Export functions
  window.getForm = getForm;
  window.validateFormAndUpdateSubmit = validateFormAndUpdateSubmit;
  window.collectFormData = collectFormData;

})(window);