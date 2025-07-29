/**
 * New Post Screen Component for The Nullary
 * Dedicated full-screen interface for creating blog posts
 */

import { createLayeredUI } from '../utils/layered-ui.js';
import { createBlogCreationForm } from '../components/blog-creation-form.js';
import { createModalBlogViewer } from '../components/blog-viewer.js';

/**
 * Default new post screen configuration
 */
const DEFAULT_NEW_POST_SCREEN_CONFIG = {
  // Screen metadata
  title: 'Create New Post',
  description: 'Share your thoughts with the world',
  
  // Layout
  width: '100%',
  height: '100vh',
  
  // Theme
  theme: {
    colors: {
      background: '#f8fafc',
      surface: '#ffffff',
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      titleSize: 24,
      headerSize: 28
    }
  },
  
  // Features
  features: {
    showBackButton: true,
    showSaveButton: true,
    showPreviewButton: true,
    autoSave: false,
    confirmExit: true
  },
  
  // Form settings
  form: {
    width: 700,
    showImageUpload: true,
    showPricing: true,
    showExternalUrl: true,
    enableDragDrop: true,
    validateInputs: true
  }
};

/**
 * Create new post screen component
 * @param {Object} config - Configuration object
 * @returns {Object} New post screen component with methods
 */
export function createNewPostScreen(config = {}) {
  const finalConfig = { ...DEFAULT_NEW_POST_SCREEN_CONFIG, ...config };
  
  // Screen state
  const screenState = {
    formData: null,
    isDirty: false,
    isSubmitting: false,
    isSaving: false,
    layeredUI: null,
    blogForm: null,
    previewData: null
  };
  
  // Event handlers
  const eventHandlers = {
    onBack: null,
    onSubmit: null,
    onSave: null,
    onPreview: null,
    onChange: null
  };
  
  // Create layered UI
  function createUI() {
    screenState.layeredUI = createLayeredUI({
      className: 'new-post-screen-ui',
      width: finalConfig.width,
      height: finalConfig.height,
      layers: [
        {
          id: 'background',
          type: 'div',
          zIndex: 1,
          config: {
            backgroundColor: finalConfig.theme.colors.background
          }
        },
        {
          id: 'content-area',
          type: 'div',
          zIndex: 100,
          config: {
            backgroundColor: 'transparent',
            padding: '20px',
            overflowY: 'auto',
            height: '100%',
            boxSizing: 'border-box'
          }
        },
        {
          id: 'header-hud',
          type: 'hud',
          zIndex: 1000,
          config: {
            background: 'rgba(248, 250, 252, 0.95)',
            transparentZones: [
              {
                x: 20,
                y: 80,
                width: 'calc(100% - 40px)',
                height: 'calc(100% - 120px)',
                shape: 'rect'
              }
            ],
            elements: [
              {
                id: 'back-button',
                type: 'button',
                x: 20,
                y: 20,
                width: 100,
                height: 40,
                content: '← Back',
                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                borderColor: finalConfig.theme.colors.secondary,
                color: finalConfig.theme.colors.secondary,
                onClick: () => handleBack()
              },
              {
                id: 'screen-title',
                type: 'text',
                x: 140,
                y: 35,
                content: finalConfig.title,
                color: finalConfig.theme.colors.text,
                fontSize: finalConfig.theme.typography.headerSize,
                fontFamily: finalConfig.theme.typography.fontFamily
              },
              {
                id: 'save-button',
                type: 'button',
                x: 'calc(100% - 240px)',
                y: 20,
                width: 100,
                height: 40,
                content: '💾 Save',
                backgroundColor: finalConfig.theme.colors.accent,
                color: '#ffffff',
                onClick: () => handleSave()
              },
              {
                id: 'publish-button',
                type: 'button',
                x: 'calc(100% - 130px)',
                y: 20,
                width: 110,
                height: 40,
                content: '🚀 Publish',
                backgroundColor: finalConfig.theme.colors.primary,
                color: '#ffffff',
                onClick: () => handlePublish()
              },
              {
                id: 'status-text',
                type: 'text',
                x: 20,
                y: 'calc(100% - 20px)',
                content: 'Ready to create',
                color: finalConfig.theme.colors.textSecondary,
                fontSize: 12
              }
            ]
          }
        }
      ]
    });
    
    return screenState.layeredUI;
  }
  
  // Create and setup form
  function setupForm() {
    const contentLayer = screenState.layeredUI.getLayer('content-area');
    if (!contentLayer) return;
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.style.cssText = `
      max-width: ${finalConfig.form.width}px;
      margin: 80px auto 40px;
      padding: 0 20px;
    `;
    
    // Create blog creation form
    screenState.blogForm = createBlogCreationForm({
      ...finalConfig.form,
      theme: finalConfig.theme,
      showActionButtons: false // We'll use HUD buttons instead
    });
    
    // Setup form event handlers
    screenState.blogForm.onChange((field, value, data) => {
      screenState.isDirty = true;
      screenState.formData = data;
      updateStatus('Unsaved changes');
      
      if (eventHandlers.onChange) {
        eventHandlers.onChange(field, value, data);
      }
    });
    
    screenState.blogForm.onTypeChange((type) => {
      updateStatus(`Switched to ${type} mode`);
    });
    
    screenState.blogForm.onPreview((data, files) => {
      handlePreview(data, files);
    });
    
    formContainer.appendChild(screenState.blogForm.element);
    contentLayer.component.element.appendChild(formContainer);
  }
  
  // Handle back navigation
  function handleBack() {
    if (screenState.isDirty && finalConfig.features.confirmExit) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    
    if (eventHandlers.onBack) {
      eventHandlers.onBack();
    }
  }
  
  // Handle save (draft)
  async function handleSave() {
    if (screenState.isSaving || !screenState.blogForm) return;
    
    const formData = screenState.blogForm.getData();
    if (!formData.data.title.trim()) {
      showMessage('Please enter a title to save', 'warning');
      return;
    }
    
    screenState.isSaving = true;
    updateSaveButton('💾 Saving...');\n    updateStatus('Saving draft...');\n    \n    try {\n      // Save as draft (implement your draft saving logic here)\n      if (eventHandlers.onSave) {\n        await eventHandlers.onSave(formData, 'draft');\n      }\n      \n      screenState.isDirty = false;\n      showMessage('✅ Draft saved successfully', 'success');\n      updateStatus('Draft saved');\n      \n    } catch (error) {\n      console.error('❌ Error saving draft:', error);\n      showMessage(`❌ Error saving: ${error.message}`, 'error');\n      updateStatus('Save failed');\n    } finally {\n      screenState.isSaving = false;\n      updateSaveButton('💾 Save');\n    }\n  }\n  \n  // Handle publish\n  async function handlePublish() {\n    if (screenState.isSubmitting || !screenState.blogForm) return;\n    \n    // Validate form\n    if (!screenState.blogForm.validate()) {\n      const errors = screenState.blogForm.getErrors();\n      const errorMessages = Object.values(errors);\n      showMessage(`Please fix: ${errorMessages.join(', ')}`, 'error');\n      return;\n    }\n    \n    const formData = screenState.blogForm.getData();\n    \n    screenState.isSubmitting = true;\n    screenState.blogForm.setSubmitting(true);\n    updatePublishButton('🚀 Publishing...');\n    updateStatus('Publishing post...');\n    \n    try {\n      if (eventHandlers.onSubmit) {\n        await eventHandlers.onSubmit(formData);\n      }\n      \n      screenState.isDirty = false;\n      showMessage('✅ Post published successfully!', 'success');\n      updateStatus('Published successfully');\n      \n    } catch (error) {\n      console.error('❌ Error publishing post:', error);\n      showMessage(`❌ Error: ${error.message}`, 'error');\n      updateStatus('Publish failed');\n    } finally {\n      screenState.isSubmitting = false;\n      screenState.blogForm.setSubmitting(false);\n      updatePublishButton('🚀 Publish');\n    }\n  }\n  \n  // Handle preview\n  function handlePreview(data, files) {\n    console.log('👁️ Previewing post...');\n    \n    // Create preview data\n    const previewData = {\n      title: data.title || 'Untitled Post',\n      description: data.description || 'No description',\n      author: data.author || 'Anonymous',\n      publishDate: data.publishDate || new Date().toISOString(),\n      type: screenState.blogForm.getData().type || 'hosted',\n      externalUrl: data.externalUrl,\n      previewImage: files.previewImage ? URL.createObjectURL(files.previewImage) : null,\n      contentUrl: files.contentFile ? URL.createObjectURL(files.contentFile) : null,\n      price: data.price ? parseFloat(data.price) : null\n    };\n    \n    // Show preview in modal\n    const modalViewer = createModalBlogViewer(previewData, {\n      theme: finalConfig.theme\n    });\n    \n    if (eventHandlers.onPreview) {\n      eventHandlers.onPreview(previewData, modalViewer);\n    }\n  }\n  \n  // Update HUD buttons\n  function updateSaveButton(text) {\n    if (screenState.layeredUI) {\n      screenState.layeredUI.updateHUDElement('save-button', {\n        content: text\n      });\n    }\n  }\n  \n  function updatePublishButton(text) {\n    if (screenState.layeredUI) {\n      screenState.layeredUI.updateHUDElement('publish-button', {\n        content: text\n      });\n    }\n  }\n  \n  // Update status text\n  function updateStatus(text) {\n    if (screenState.layeredUI) {\n      screenState.layeredUI.updateHUDElement('status-text', {\n        content: text\n      });\n    }\n  }\n  \n  // Show message\n  function showMessage(text, type = 'info') {\n    const messageEl = document.createElement('div');\n    messageEl.style.cssText = `\n      position: fixed;\n      top: 20px;\n      left: 50%;\n      transform: translateX(-50%);\n      z-index: 3000;\n      padding: 12px 24px;\n      border-radius: 8px;\n      font-family: Arial, sans-serif;\n      font-size: 14px;\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n      opacity: 0;\n      transition: opacity 0.3s ease;\n      background: ${type === 'error' ? '#fef2f2' : type === 'success' ? '#f0fdf4' : type === 'warning' ? '#fffbeb' : '#eff6ff'};\n      color: ${type === 'error' ? '#991b1b' : type === 'success' ? '#166534' : type === 'warning' ? '#92400e' : '#1e40af'};\n      border: 1px solid ${type === 'error' ? '#fecaca' : type === 'success' ? '#bbf7d0' : type === 'warning' ? '#fed7aa' : '#dbeafe'};\n    `;\n    messageEl.textContent = text;\n    \n    document.body.appendChild(messageEl);\n    \n    setTimeout(() => messageEl.style.opacity = '1', 100);\n    setTimeout(() => {\n      messageEl.style.opacity = '0';\n      setTimeout(() => {\n        if (messageEl.parentNode) {\n          messageEl.parentNode.removeChild(messageEl);\n        }\n      }, 300);\n    }, 3000);\n  }\n  \n  // Handle keyboard shortcuts\n  function setupKeyboardShortcuts() {\n    const keyHandler = (e) => {\n      // Ctrl/Cmd + S for save\n      if ((e.ctrlKey || e.metaKey) && e.key === 's') {\n        e.preventDefault();\n        handleSave();\n      }\n      \n      // Ctrl/Cmd + Enter for publish\n      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {\n        e.preventDefault();\n        handlePublish();\n      }\n      \n      // Escape for back (with confirmation)\n      if (e.key === 'Escape') {\n        handleBack();\n      }\n    };\n    \n    document.addEventListener('keydown', keyHandler);\n    \n    // Return cleanup function\n    return () => {\n      document.removeEventListener('keydown', keyHandler);\n    };\n  }\n  \n  // Screen interface\n  const newPostScreen = {\n    element: null,\n    \n    // Initialization\n    initialize() {\n      console.log('🏗️ Initializing new post screen...');\n      \n      // Create UI\n      const ui = createUI();\n      this.element = ui.element;\n      \n      // Setup form\n      setupForm();\n      \n      // Setup keyboard shortcuts\n      this.cleanupKeyboard = setupKeyboardShortcuts();\n      \n      console.log('✅ New post screen initialized');\n      return this;\n    },\n    \n    // Data management\n    getFormData() {\n      return screenState.blogForm ? screenState.blogForm.getData() : null;\n    },\n    \n    setFormData(data) {\n      if (screenState.blogForm) {\n        screenState.blogForm.setData(data);\n        screenState.formData = data;\n        screenState.isDirty = false;\n      }\n    },\n    \n    resetForm() {\n      if (screenState.blogForm) {\n        screenState.blogForm.reset();\n        screenState.formData = null;\n        screenState.isDirty = false;\n        updateStatus('Ready to create');\n      }\n    },\n    \n    // State access\n    isDirty() {\n      return screenState.isDirty;\n    },\n    \n    isSubmitting() {\n      return screenState.isSubmitting;\n    },\n    \n    isSaving() {\n      return screenState.isSaving;\n    },\n    \n    // Event handlers\n    onBack(handler) {\n      eventHandlers.onBack = handler;\n    },\n    \n    onSubmit(handler) {\n      eventHandlers.onSubmit = handler;\n    },\n    \n    onSave(handler) {\n      eventHandlers.onSave = handler;\n    },\n    \n    onPreview(handler) {\n      eventHandlers.onPreview = handler;\n    },\n    \n    onChange(handler) {\n      eventHandlers.onChange = handler;\n    },\n    \n    // Actions\n    triggerSave() {\n      handleSave();\n    },\n    \n    triggerPublish() {\n      handlePublish();\n    },\n    \n    // Cleanup\n    destroy() {\n      if (this.cleanupKeyboard) {\n        this.cleanupKeyboard();\n      }\n      \n      if (this.element && this.element.parentNode) {\n        this.element.parentNode.removeChild(this.element);\n      }\n    }\n  };\n  \n  return newPostScreen;\n}\n\n/**\n * Export default configuration\n */\nexport { DEFAULT_NEW_POST_SCREEN_CONFIG as newPostScreenDefaults };