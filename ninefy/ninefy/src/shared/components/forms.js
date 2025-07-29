/**
 * Form Components for The Nullary
 * SVG-based form components using foreignObject for HTML input elements
 */

import { 
  createSVGContainer, 
  createSVGElement, 
  addSVGStyles, 
  generateSVGId,
  makeResponsive 
} from '../utils/svg-utils.js';

import {
  createFormField,
  generateFormCSS,
  collectFormData,
  validateForm,
  clearForm,
  setFormData,
  addFormEventListeners
} from '../utils/form-utils.js';

/**
 * Default configuration for form components
 */
const DEFAULT_FORM_CONFIG = {
  // Container
  width: 400,
  height: 'auto',
  padding: 20,
  
  // Styling
  backgroundColor: '#ffffff',
  borderColor: '#e0e0e0',
  borderWidth: 1,
  borderRadius: 8,
  
  // Typography
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
  labelSize: 12,
  
  // Colors
  colors: {
    primary: '#3498db',
    text: '#333333',
    border: '#e0e0e0',
    danger: '#ef4444',
    inputBackground: '#ffffff'
  },
  
  // Layout
  fieldSpacing: 20,
  
  // Behavior
  responsive: true,
  className: 'nullary-form'
};

/**
 * Create a text input form component
 * @param {Object} config - Configuration object
 * @returns {Object} Form component with methods
 */
export function createTextInputForm(config = {}) {
  const finalConfig = { ...DEFAULT_FORM_CONFIG, ...config };
  
  // Calculate dimensions
  const fieldHeight = 80;
  const totalHeight = finalConfig.height === 'auto' 
    ? (finalConfig.padding * 2) + fieldHeight
    : finalConfig.height;
  
  // Create SVG container
  const svg = createSVGContainer({
    width: finalConfig.width,
    height: totalHeight,
    className: finalConfig.className
  });
  
  // Generate unique IDs
  const containerId = generateSVGId('text-form');
  const fieldId = generateSVGId('text-field');
  
  // Create background
  const background = createSVGElement('rect', {
    id: `${containerId}-bg`,
    x: 0,
    y: 0,
    width: finalConfig.width,
    height: totalHeight,
    fill: finalConfig.backgroundColor,
    stroke: finalConfig.borderColor,
    'stroke-width': finalConfig.borderWidth,
    rx: finalConfig.borderRadius
  });
  svg.appendChild(background);
  
  // Create form field
  const formField = createFormField({
    label: finalConfig.label || 'Text Input',
    type: finalConfig.inputType || 'text',
    placeholder: finalConfig.placeholder || 'Enter your text...',
    value: finalConfig.value || '',
    required: finalConfig.required || false,
    width: finalConfig.width - (finalConfig.padding * 2),
    height: fieldHeight,
    x: finalConfig.padding,
    y: finalConfig.padding,
    id: fieldId,
    theme: finalConfig
  });
  
  svg.appendChild(formField.foreignObject);
  
  // Add embedded CSS
  const css = `
    .${finalConfig.className} {
      font-family: ${finalConfig.fontFamily};
    }
    
    ${generateFormCSS(finalConfig)}
    
    #${containerId}-bg {
      transition: all 0.2s ease;
    }
    
    .${finalConfig.className}:hover #${containerId}-bg {
      stroke: ${finalConfig.colors.primary};
    }
  `;
  
  addSVGStyles(svg, css);
  
  // Make responsive if requested
  if (finalConfig.responsive) {
    makeResponsive(svg);
  }
  
  // Return component object with methods
  return {
    element: svg,
    field: formField,
    
    getValue() {
      return formField.getValue();
    },
    
    setValue(value) {
      formField.setValue(value);
    },
    
    clear() {
      formField.setValue('');
    },
    
    focus() {
      formField.focus();
    },
    
    validate() {
      return formField.validate();
    },
    
    getData() {
      return {
        [finalConfig.name || 'text']: formField.getValue()
      };
    },
    
    // Convert form data to post configuration
    toPostConfig() {
      const text = formField.getValue();
      if (!text.trim()) return null;
      
      return {
        text: text,
        fontSize: finalConfig.postFontSize || 16,
        fontFamily: finalConfig.postFontFamily || finalConfig.fontFamily,
        color: finalConfig.postColor || finalConfig.colors.text,
        width: finalConfig.postWidth || 600,
        height: 'auto',
        padding: 20,
        className: 'generated-post-text'
      };
    }
  };
}

/**
 * Create a textarea form component for longer text
 * @param {Object} config - Configuration object
 * @returns {Object} Form component with methods
 */
export function createTextareaForm(config = {}) {
  const finalConfig = { 
    ...DEFAULT_FORM_CONFIG, 
    inputType: 'textarea',
    ...config 
  };
  
  // Textarea needs more height
  const fieldHeight = 120;
  const totalHeight = finalConfig.height === 'auto' 
    ? (finalConfig.padding * 2) + fieldHeight
    : finalConfig.height;
  
  // Create using text input form but with textarea
  const textForm = createTextInputForm({
    ...finalConfig,
    height: totalHeight
  });
  
  // Override toPostConfig for multiline text
  const originalToPostConfig = textForm.toPostConfig;
  textForm.toPostConfig = function() {
    const text = textForm.getValue();
    if (!text.trim()) return null;
    
    return {
      text: text,
      fontSize: finalConfig.postFontSize || 16,
      fontFamily: finalConfig.postFontFamily || finalConfig.fontFamily,
      color: finalConfig.postColor || finalConfig.colors.text,
      lineHeight: finalConfig.postLineHeight || 1.6,
      width: finalConfig.postWidth || 600,
      height: 'auto',
      padding: 20,
      maxLines: finalConfig.maxLines || 10,
      wordWrap: true,
      className: 'generated-post-text-multiline'
    };
  };
  
  return textForm;
}

/**
 * Create a complete blog post form
 * @param {Object} config - Configuration object
 * @returns {Object} Blog form component with methods
 */
export function createBlogPostForm(config = {}) {
  const finalConfig = { ...DEFAULT_FORM_CONFIG, ...config };
  
  // Calculate dimensions for multiple fields
  const titleFieldHeight = 80;
  const contentFieldHeight = 150;
  const buttonHeight = 50;
  const totalHeight = finalConfig.height === 'auto' 
    ? (finalConfig.padding * 2) + titleFieldHeight + contentFieldHeight + buttonHeight + (finalConfig.fieldSpacing * 2)
    : finalConfig.height;
  
  // Create SVG container
  const svg = createSVGContainer({
    width: finalConfig.width,
    height: totalHeight,
    className: finalConfig.className
  });
  
  // Generate unique IDs
  const containerId = generateSVGId('blog-form');
  const titleFieldId = generateSVGId('title-field');
  const contentFieldId = generateSVGId('content-field');
  const buttonId = generateSVGId('submit-button');
  
  // Create background
  const background = createSVGElement('rect', {
    id: `${containerId}-bg`,
    x: 0,
    y: 0,
    width: finalConfig.width,
    height: totalHeight,
    fill: finalConfig.backgroundColor,
    stroke: finalConfig.borderColor,
    'stroke-width': finalConfig.borderWidth,
    rx: finalConfig.borderRadius
  });
  svg.appendChild(background);
  
  // Create title field
  const titleField = createFormField({
    label: 'Post Title',
    type: 'text',
    placeholder: 'Enter your post title...',
    required: true,
    width: finalConfig.width - (finalConfig.padding * 2),
    height: titleFieldHeight,
    x: finalConfig.padding,
    y: finalConfig.padding,
    id: titleFieldId,
    theme: finalConfig
  });
  svg.appendChild(titleField.foreignObject);
  
  // Create content field
  const contentField = createFormField({
    label: 'Post Content',
    type: 'textarea',
    placeholder: 'Write your post content here...',
    required: true,
    width: finalConfig.width - (finalConfig.padding * 2),
    height: contentFieldHeight,
    x: finalConfig.padding,
    y: finalConfig.padding + titleFieldHeight + finalConfig.fieldSpacing,
    id: contentFieldId,
    theme: finalConfig
  });
  svg.appendChild(contentField.foreignObject);
  
  // Create submit button using foreignObject
  const buttonY = finalConfig.padding + titleFieldHeight + contentFieldHeight + (finalConfig.fieldSpacing * 2);
  const buttonContainer = createSVGElement('foreignObject', {
    x: finalConfig.padding,
    y: buttonY,
    width: finalConfig.width - (finalConfig.padding * 2),
    height: buttonHeight,
    class: 'nullary-button-container'
  });
  
  const buttonDiv = document.createElement('div');
  buttonDiv.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
  `;
  
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Create Post';
  submitButton.className = 'nullary-submit-button';
  submitButton.type = 'button';
  
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.className = 'nullary-clear-button';
  clearButton.type = 'button';
  
  buttonDiv.appendChild(clearButton);
  buttonDiv.appendChild(submitButton);
  buttonContainer.appendChild(buttonDiv);
  svg.appendChild(buttonContainer);
  
  // Add embedded CSS
  const css = `
    .${finalConfig.className} {
      font-family: ${finalConfig.fontFamily};
    }
    
    ${generateFormCSS(finalConfig)}
    
    .nullary-submit-button,
    .nullary-clear-button {
      padding: 10px 20px;
      border: none;
      border-radius: ${finalConfig.borderRadius}px;
      font-family: ${finalConfig.fontFamily};
      font-size: ${finalConfig.fontSize}px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }
    
    .nullary-submit-button {
      background: ${finalConfig.colors.primary};
      color: white;
    }
    
    .nullary-submit-button:hover {
      background: ${finalConfig.colors.primary}dd;
      transform: translateY(-1px);
    }
    
    .nullary-submit-button:active {
      transform: translateY(0);
    }
    
    .nullary-clear-button {
      background: transparent;
      color: ${finalConfig.colors.text};
      border: 1px solid ${finalConfig.colors.border};
    }
    
    .nullary-clear-button:hover {
      background: ${finalConfig.colors.border};
    }
    
    #${containerId}-bg {
      transition: all 0.2s ease;
    }
    
    .${finalConfig.className}:hover #${containerId}-bg {
      stroke: ${finalConfig.colors.primary}88;
    }
  `;
  
  addSVGStyles(svg, css);
  
  // Make responsive if requested
  if (finalConfig.responsive) {
    makeResponsive(svg);
  }
  
  // Event handlers
  let onSubmitHandler = null;
  let onClearHandler = null;
  
  submitButton.addEventListener('click', () => {
    const validation = validateForm(svg);
    if (validation.isValid && onSubmitHandler) {
      const postConfig = componentInstance.toPostConfig();
      onSubmitHandler(postConfig);
    } else if (!validation.isValid) {
      console.warn('Form validation failed:', validation.errors);
      // Could show validation errors in UI
    }
  });
  
  clearButton.addEventListener('click', () => {
    componentInstance.clear();
    if (onClearHandler) {
      onClearHandler();
    }
  });
  
  // Component instance
  const componentInstance = {
    element: svg,
    titleField: titleField,
    contentField: contentField,
    
    getValue() {
      return {
        title: titleField.getValue(),
        content: contentField.getValue()
      };
    },
    
    setValue(data) {
      if (data.title) titleField.setValue(data.title);
      if (data.content) contentField.setValue(data.content);
    },
    
    clear() {
      clearForm(svg);
    },
    
    validate() {
      return validateForm(svg);
    },
    
    getData() {
      return collectFormData(svg);
    },
    
    // Convert form data to post configuration
    toPostConfig() {
      const data = this.getValue();
      if (!data.title.trim() || !data.content.trim()) return null;
      
      return {
        title: {
          text: data.title,
          fontSize: finalConfig.titleFontSize || 24,
          fontFamily: finalConfig.titleFontFamily || finalConfig.fontFamily,
          color: finalConfig.titleColor || finalConfig.colors.text,
          fontWeight: 'bold',
          width: finalConfig.postWidth || 600,
          height: 'auto',
          padding: 20,
          className: 'generated-post-title'
        },
        content: {
          text: data.content,
          fontSize: finalConfig.contentFontSize || 16,
          fontFamily: finalConfig.contentFontFamily || finalConfig.fontFamily,
          color: finalConfig.contentColor || finalConfig.colors.text,
          lineHeight: finalConfig.contentLineHeight || 1.6,
          width: finalConfig.postWidth || 600,
          height: 'auto',
          padding: 20,
          maxLines: finalConfig.maxLines || 20,
          wordWrap: true,
          className: 'generated-post-content'
        }
      };
    },
    
    // Event handlers
    onSubmit(handler) {
      onSubmitHandler = handler;
    },
    
    onClear(handler) {
      onClearHandler = handler;
    }
  };
  
  return componentInstance;
}

/**
 * Export default configurations
 */
export { DEFAULT_FORM_CONFIG as formComponentDefaults };