/**
 * Common UI Utilities for The Nullary
 * Shared UI patterns and utilities used across all Nullary applications
 */

/**
 * Create a loading spinner
 * @param {Object} config - Configuration options
 * @returns {HTMLElement} Loading spinner element
 */
export function createLoadingSpinner(config = {}) {
  const {
    size = '40px',
    color = '#3498db',
    text = 'Loading...',
    showText = true
  } = config;
  
  const container = document.createElement('div');
  container.className = 'loading-spinner';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  `;
  
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: ${size};
    height: ${size};
    border: 3px solid #f3f3f3;
    border-top: 3px solid ${color};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  // Add CSS animation if not already present
  if (!document.querySelector('#spinner-styles')) {
    const styles = document.createElement('style');
    styles.id = 'spinner-styles';
    styles.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styles);
  }
  
  container.appendChild(spinner);
  
  if (showText) {
    const textElement = document.createElement('div');
    textElement.style.cssText = `
      color: ${color};
      font-size: 14px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    textElement.textContent = text;
    container.appendChild(textElement);
  }
  
  return container;
}

/**
 * Create an empty state display
 * @param {Object} config - Configuration options
 * @returns {HTMLElement} Empty state element
 */
export function createEmptyState(config = {}) {
  const {
    icon = '📦',
    title = 'Nothing here yet',
    description = 'Content will appear here when available',
    actionText = null,
    onAction = null,
    theme = {}
  } = config;
  
  const container = document.createElement('div');
  container.className = 'empty-state';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    color: ${theme.colors?.secondary || '#7f8c8d'};
    font-family: ${theme.typography?.fontFamily || 'system-ui'};
  `;
  
  // Icon
  const iconElement = document.createElement('div');
  iconElement.style.cssText = `
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.7;
  `;
  iconElement.textContent = icon;
  
  // Title
  const titleElement = document.createElement('h3');
  titleElement.style.cssText = `
    font-size: 1.5rem;
    margin: 0 0 10px 0;
    color: ${theme.colors?.primary || '#2c3e50'};
  `;
  titleElement.textContent = title;
  
  // Description
  const descriptionElement = document.createElement('p');
  descriptionElement.style.cssText = `
    font-size: 1rem;
    margin: 0 0 20px 0;
    max-width: 400px;
    line-height: 1.5;
  `;
  descriptionElement.textContent = description;
  
  container.appendChild(iconElement);
  container.appendChild(titleElement);
  container.appendChild(descriptionElement);
  
  // Action button (optional)
  if (actionText && onAction) {
    const button = document.createElement('button');
    button.textContent = actionText;
    button.style.cssText = `
      background: ${theme.colors?.accent || '#3498db'};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-family: ${theme.typography?.fontFamily || 'system-ui'};
      transition: background-color 0.2s ease;
    `;
    
    button.addEventListener('click', onAction);
    button.addEventListener('mouseenter', () => {
      button.style.background = theme.colors?.accentDark || '#2980b9';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = theme.colors?.accent || '#3498db';
    });
    
    container.appendChild(button);
  }
  
  return container;
}

/**
 * Create a status message
 * @param {Object} config - Configuration options
 * @returns {HTMLElement} Status message element
 */
export function createStatusMessage(config = {}) {
  const {
    type = 'info', // success, error, warning, info
    message = 'Status message',
    dismissible = true,
    autoHide = false,
    hideDelay = 3000,
    theme = {}
  } = config;
  
  const colors = {
    success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
    error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
    warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
    info: { bg: '#cce7ff', border: '#bee5ff', text: '#0c5460' }
  };
  
  const color = colors[type] || colors.info;
  
  const container = document.createElement('div');
  container.className = `status-message status-${type}`;
  container.style.cssText = `
    background: ${color.bg};
    border: 1px solid ${color.border};
    color: ${color.text};
    padding: 12px 16px;
    border-radius: 6px;
    font-family: ${theme.typography?.fontFamily || 'system-ui'};
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px 0;
  `;
  
  const messageText = document.createElement('span');
  messageText.textContent = message;
  container.appendChild(messageText);
  
  if (dismissible) {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: ${color.text};
      font-size: 18px;
      cursor: pointer;
      margin-left: 10px;
      opacity: 0.7;
    `;
    
    closeButton.addEventListener('click', () => {
      container.remove();
    });
    
    container.appendChild(closeButton);
  }
  
  if (autoHide) {
    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, hideDelay);
  }
  
  return container;
}

/**
 * Create a modal dialog
 * @param {Object} config - Configuration options
 * @returns {HTMLElement} Modal element
 */
export function createModal(config = {}) {
  const {
    title = 'Modal',
    content = '',
    showCloseButton = true,
    backdrop = true,
    theme = {}
  } = config;
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: ${theme.typography?.fontFamily || 'system-ui'};
  `;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;
  
  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.style.cssText = `
    padding: 20px;
    border-bottom: 1px solid ${theme.colors?.border || '#e1e5e9'};
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  
  const titleElement = document.createElement('h3');
  titleElement.style.cssText = `
    margin: 0;
    color: ${theme.colors?.primary || '#2c3e50'};
    font-size: 1.5rem;
  `;
  titleElement.textContent = title;
  header.appendChild(titleElement);
  
  if (showCloseButton) {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: ${theme.colors?.secondary || '#7f8c8d'};
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    closeButton.addEventListener('click', () => {
      overlay.remove();
    });
    
    header.appendChild(closeButton);
  }
  
  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.style.cssText = `
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  `;
  
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }
  
  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  
  // Close on backdrop click
  if (backdrop) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }
  
  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  return overlay;
}

/**
 * Show a toast notification
 * @param {Object} config - Configuration options
 */
export function showToast(config = {}) {
  const {
    message = 'Notification',
    type = 'info', // success, error, warning, info
    duration = 3000,
    position = 'bottom-right' // top-left, top-right, bottom-left, bottom-right
  } = config;
  
  const positions = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  };
  
  const colors = {
    success: { bg: '#27ae60', text: 'white' },
    error: { bg: '#e74c3c', text: 'white' },
    warning: { bg: '#f39c12', text: 'white' },
    info: { bg: '#3498db', text: 'white' }
  };
  
  const color = colors[type] || colors.info;
  const pos = positions[position] || positions['bottom-right'];
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    ${Object.entries(pos).map(([key, value]) => `${key}: ${value}`).join('; ')};
    background: ${color.bg};
    color: ${color.text};
    padding: 12px 20px;
    border-radius: 6px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  // Auto hide
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, duration);
}

/**
 * Create a confirmation dialog
 * @param {Object} config - Configuration options
 * @returns {Promise<boolean>} Promise resolving to user's choice
 */
export function showConfirmDialog(config = {}) {
  const {
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    theme = {}
  } = config;
  
  return new Promise((resolve) => {
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
      text-align: center;
      min-width: 300px;
    `;
    
    const messageElement = document.createElement('p');
    messageElement.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 16px;
      line-height: 1.5;
      color: ${theme.colors?.text || '#2c3e50'};
    `;
    messageElement.textContent = message;
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = cancelText;
    cancelButton.style.cssText = `
      padding: 10px 20px;
      border: 1px solid ${theme.colors?.border || '#e1e5e9'};
      background: white;
      color: ${theme.colors?.text || '#2c3e50'};
      border-radius: 6px;
      cursor: pointer;
      font-family: ${theme.typography?.fontFamily || 'system-ui'};
    `;
    
    const confirmButton = document.createElement('button');
    confirmButton.textContent = confirmText;
    confirmButton.style.cssText = `
      padding: 10px 20px;
      border: none;
      background: ${theme.colors?.accent || '#3498db'};
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-family: ${theme.typography?.fontFamily || 'system-ui'};
    `;
    
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);
    
    dialogContent.appendChild(messageElement);
    dialogContent.appendChild(buttonsContainer);
    
    const modal = createModal({
      title,
      content: dialogContent,
      showCloseButton: false,
      theme
    });
    
    cancelButton.addEventListener('click', () => {
      modal.remove();
      resolve(false);
    });
    
    confirmButton.addEventListener('click', () => {
      modal.remove();
      resolve(true);
    });
    
    document.body.appendChild(modal);
  });
}