/**
 * Form Utilities for SVG-based Forms
 * Handles HTML form elements embedded in SVG via foreignObject
 */

import { 
  createSVGElement, 
  createSVGContainer, 
  addSVGStyles, 
  generateSVGId 
} from './svg-utils.js';

/**
 * Create a foreignObject element for embedding HTML in SVG
 * @param {Object} config - Configuration for the foreignObject
 * @returns {SVGElement} foreignObject element
 */
export function createForeignObject(config = {}) {
  const {
    x = 0,
    y = 0,
    width = 200,
    height = 40,
    className = 'nullary-foreign-object'
  } = config;
  
  return createSVGElement('foreignObject', {
    x: x,
    y: y,
    width: width,
    height: height,
    class: className
  });
}

/**
 * Create HTML input element for embedding in SVG
 * @param {Object} config - Input configuration
 * @returns {HTMLElement} Input element
 */
export function createHTMLInput(config = {}) {
  const {
    type = 'text',
    placeholder = '',
    value = '',
    required = false,
    maxLength = null,
    pattern = null,
    className = 'nullary-input',
    id = generateSVGId('input')
  } = config;
  
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.required = required;
  input.className = className;
  input.id = id;
  
  if (maxLength) input.maxLength = maxLength;
  if (pattern) input.pattern = pattern;
  
  return input;
}

/**
 * Create HTML textarea element for embedding in SVG
 * @param {Object} config - Textarea configuration
 * @returns {HTMLElement} Textarea element
 */
export function createHTMLTextarea(config = {}) {
  const {
    placeholder = '',
    value = '',
    required = false,
    maxLength = null,
    rows = 3,
    className = 'nullary-textarea',
    id = generateSVGId('textarea')
  } = config;
  
  const textarea = document.createElement('textarea');
  textarea.placeholder = placeholder;
  textarea.value = value;
  textarea.required = required;
  textarea.rows = rows;
  textarea.className = className;
  textarea.id = id;
  
  if (maxLength) textarea.maxLength = maxLength;
  
  return textarea;
}

/**
 * Create HTML label element
 * @param {Object} config - Label configuration
 * @returns {HTMLElement} Label element
 */
export function createHTMLLabel(config = {}) {
  const {
    text = '',
    htmlFor = '',
    required = false,
    className = 'nullary-label',
    id = generateSVGId('label')
  } = config;
  
  const label = document.createElement('label');
  label.textContent = text + (required ? ' *' : '');
  label.htmlFor = htmlFor;
  label.className = className;
  label.id = id;
  
  return label;
}

/**
 * Create a complete form field with label and input in foreignObject
 * @param {Object} config - Field configuration
 * @returns {Object} Object containing SVG and HTML elements
 */
export function createFormField(config = {}) {
  const {
    label = '',
    type = 'text',
    placeholder = '',
    value = '',
    required = false,
    width = 300,
    height = 80,
    x = 0,
    y = 0,
    theme = {},
    id = generateSVGId('field')
  } = config;
  
  // Create foreignObject
  const foreignObject = createForeignObject({
    x: x,
    y: y,
    width: width,
    height: height,
    className: 'nullary-form-field'
  });
  
  // Create container div
  const container = document.createElement('div');
  container.className = 'field-container';
  container.style.cssText = `
    width: 100%;
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 6px;
  `;
  
  // Create label
  const labelElement = createHTMLLabel({
    text: label,
    htmlFor: `${id}-input`,
    required: required
  });
  
  // Create input based on type
  let inputElement;
  if (type === 'textarea') {
    inputElement = createHTMLTextarea({
      placeholder: placeholder,
      value: value,
      required: required,
      id: `${id}-input`
    });
  } else {
    inputElement = createHTMLInput({
      type: type,
      placeholder: placeholder,
      value: value,
      required: required,
      id: `${id}-input`
    });
  }
  
  // Assemble container
  container.appendChild(labelElement);
  container.appendChild(inputElement);
  foreignObject.appendChild(container);
  
  return {
    foreignObject: foreignObject,
    container: container,
    label: labelElement,
    input: inputElement,
    getValue: () => inputElement.value,
    setValue: (val) => { inputElement.value = val; },
    focus: () => inputElement.focus(),
    validate: () => inputElement.checkValidity()
  };
}

/**
 * Generate CSS for form elements
 * @param {Object} theme - Theme configuration
 * @returns {string} CSS string
 */
export function generateFormCSS(theme = {}) {
  const colors = theme.colors || {};
  const typography = theme.typography || {};
  
  return `
    .nullary-input,
    .nullary-textarea {
      width: 100%;
      padding: 8px 12px;
      border: 2px solid ${colors.border || '#e0e0e0'};
      border-radius: ${theme.borderRadius || '6px'};
      background: ${colors.inputBackground || '#ffffff'};
      color: ${colors.text || '#333333'};
      font-family: ${typography.fontFamily || 'Arial, sans-serif'};
      font-size: ${typography.fontSize || '14px'};
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
      resize: vertical;
    }
    
    .nullary-input:focus,
    .nullary-textarea:focus {
      border-color: ${colors.primary || '#3498db'};
      box-shadow: 0 0 0 2px ${colors.primary || '#3498db'}33;
    }
    
    .nullary-input:invalid,
    .nullary-textarea:invalid {
      border-color: ${colors.danger || '#ef4444'};
    }
    
    .nullary-label {
      display: block;
      font-family: ${typography.fontFamily || 'Arial, sans-serif'};
      font-size: ${typography.labelSize || '12px'};
      font-weight: 600;
      color: ${colors.text || '#333333'};
      margin-bottom: 4px;
    }
    
    .field-container {
      font-family: ${typography.fontFamily || 'Arial, sans-serif'};
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .nullary-input,
      .nullary-textarea {
        background: ${colors.inputBackgroundDark || '#2a2a2a'};
        border-color: ${colors.borderDark || '#404040'};
        color: ${colors.textDark || '#e0e0e0'};
      }
      
      .nullary-label {
        color: ${colors.textDark || '#e0e0e0'};
      }
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
      .nullary-input,
      .nullary-textarea {
        border-width: 3px;
        border-color: #000000;
        background: #ffffff;
        color: #000000;
      }
      
      .nullary-input:focus,
      .nullary-textarea:focus {
        border-color: #0000ff;
        box-shadow: 0 0 0 3px #0000ff;
      }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .nullary-input,
      .nullary-textarea {
        transition: none;
      }
    }
  `;
}

/**
 * Collect form data from SVG form
 * @param {SVGElement} formSvg - Form SVG container
 * @returns {Object} Form data
 */
export function collectFormData(formSvg) {
  const data = {};
  
  // Find all form fields
  const foreignObjects = formSvg.querySelectorAll('foreignObject');
  
  foreignObjects.forEach(fo => {
    const inputs = fo.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.name || input.id) {
        const key = input.name || input.id.replace(/-input$/, '');
        data[key] = input.value;
      }
    });
  });
  
  return data;
}

/**
 * Validate form fields
 * @param {SVGElement} formSvg - Form SVG container
 * @returns {Object} Validation result
 */
export function validateForm(formSvg) {
  const errors = [];
  let isValid = true;
  
  const foreignObjects = formSvg.querySelectorAll('foreignObject');
  
  foreignObjects.forEach(fo => {
    const inputs = fo.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        isValid = false;
        errors.push({
          field: input.name || input.id,
          message: input.validationMessage
        });
      }
    });
  });
  
  return {
    isValid: isValid,
    errors: errors
  };
}

/**
 * Clear form data
 * @param {SVGElement} formSvg - Form SVG container
 */
export function clearForm(formSvg) {
  const foreignObjects = formSvg.querySelectorAll('foreignObject');
  
  foreignObjects.forEach(fo => {
    const inputs = fo.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  });
}

/**
 * Set form data
 * @param {SVGElement} formSvg - Form SVG container
 * @param {Object} data - Data to set
 */
export function setFormData(formSvg, data) {
  const foreignObjects = formSvg.querySelectorAll('foreignObject');
  
  foreignObjects.forEach(fo => {
    const inputs = fo.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const key = input.name || input.id.replace(/-input$/, '');
      if (data.hasOwnProperty(key)) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = !!data[key];
        } else {
          input.value = data[key];
        }
      }
    });
  });
}

/**
 * Add event listeners to form
 * @param {SVGElement} formSvg - Form SVG container
 * @param {Object} events - Event handlers
 */
export function addFormEventListeners(formSvg, events = {}) {
  const foreignObjects = formSvg.querySelectorAll('foreignObject');
  
  foreignObjects.forEach(fo => {
    const inputs = fo.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (events.onChange) {
        input.addEventListener('change', events.onChange);
      }
      if (events.onInput) {
        input.addEventListener('input', events.onInput);
      }
      if (events.onFocus) {
        input.addEventListener('focus', events.onFocus);
      }
      if (events.onBlur) {
        input.addEventListener('blur', events.onBlur);
      }
    });
  });
}