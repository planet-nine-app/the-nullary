/**
 * Ninefy Stripe Payment Integration
 * Adapted from screenary pattern for digital marketplace
 */

// Use the global invoke from main.js or create a local reference
//let invoke = window.ninefyInvoke || (async () => { 
  //throw new Error('Tauri not available'); 
//});

let stripe;
let elements;
let currentProduct = null;

/**
 * Initialize payment intent for product purchase
 */
window.initializePayment = async (product, amount, currency = 'usd') => {
  try {
    console.log('🔄 Initializing payment for:', product.title, 'Amount:', amount);
    currentProduct = product;
    
    // Check if Stripe is available
    if (typeof Stripe === 'undefined') {
      throw new Error('Stripe library not loaded');
    }
    
    // Use payment without splits for simple marketplace purchases
    // Could be extended to use splits for marketplace commission
    const response = await invoke("get_payment_intent_without_splits", {
      amount: amount, // Amount in cents
      currency: currency
    });
    
    console.log('💳 Payment intent response:', response);
    
    if (!response.publishableKey || !response.paymentIntent) {
      throw new Error('Invalid payment response from server');
    }
    
    // Initialize Stripe
    stripe = Stripe(response.publishableKey);
    elements = stripe.elements({
      clientSecret: response.paymentIntent,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#e74c3c',
          colorBackground: '#ffffff',
          colorText: '#2c3e50',
          colorDanger: '#e74c3c',
          borderRadius: '6px'
        }
      }
    });

    // Create and mount payment element
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
    
    // Update payment UI with product details
    updatePaymentUI(product, amount);
    
    // Show payment overlay
    showPaymentOverlay();
    
    return response;
    
  } catch (error) {
    console.error('❌ Payment initialization failed:', error);
    showPaymentError('Failed to initialize payment. Please try again.');
    throw error;
  }
};

/**
 * Initialize payment with splits (for future marketplace commission)
 */
window.initializePaymentWithSplits = async (product, amount, payees, currency = 'usd') => {
  try {
    console.log('🔄 Initializing split payment for:', product.title);
    currentProduct = product;
    
    const response = await invoke("get_payment_intent_with_splits", {
      amount: amount,
      currency: currency,
      payees: payees
    });
    
    console.log('💳 Split payment response:', response);
    
    stripe = Stripe(response.publishableKey);
    elements = stripe.elements({
      clientSecret: response.paymentIntent,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#e74c3c',
          colorBackground: '#ffffff',
          colorText: '#2c3e50',
          colorDanger: '#e74c3c',
          borderRadius: '6px'
        }
      }
    });

    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
    
    updatePaymentUI(product, amount);
    showPaymentOverlay();
    
    return response;
    
  } catch (error) {
    console.error('❌ Split payment initialization failed:', error);
    showPaymentError('Failed to initialize payment. Please try again.');
    throw error;
  }
};

/**
 * Update payment UI with product information
 */
function updatePaymentUI(product, amount) {
  const title = document.getElementById('payment-title');
  const description = document.getElementById('payment-description');
  
  if (title) {
    title.textContent = `Purchase: ${product.title}`;
  }
  
  if (description) {
    const formattedAmount = (amount / 100).toFixed(2);
    description.textContent = `$${formattedAmount} • Secure payment powered by Stripe`;
  }
}

/**
 * Show payment overlay
 */
function showPaymentOverlay() {
  const overlay = document.getElementById('payment-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }
}

/**
 * Hide payment overlay
 */
function hidePaymentOverlay() {
  const overlay = document.getElementById('payment-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scroll
  }
  
  // Reset payment state
  currentProduct = null;
  stripe = null;
  elements = null;
  
  // Clear any errors
  hidePaymentError();
  hidePaymentLoading();
}

/**
 * Process the payment
 */
async function processPayment() {
  if (!stripe || !elements) {
    showPaymentError('Payment system not initialized');
    return;
  }
  
  showPaymentLoading();
  
  try {
    // Construct return URL for successful payment
    const returnUrl = `${window.location.origin}${window.location.pathname}?payment=success&product=${currentProduct.id}`;
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      console.error('💳 Payment confirmation error:', error);
      showPaymentError(error.message);
    } else {
      // Payment succeeded - the user will be redirected to return_url
      console.log('✅ Payment confirmed successfully');
    }
    
  } catch (error) {
    console.error('💳 Payment processing error:', error);
    showPaymentError('An unexpected error occurred during payment processing.');
  } finally {
    hidePaymentLoading();
  }
}

/**
 * Show payment error message
 */
function showPaymentError(message) {
  const errorElement = document.getElementById('payment-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      hidePaymentError();
    }, 5000);
  }
}

/**
 * Hide payment error message
 */
function hidePaymentError() {
  const errorElement = document.getElementById('payment-error');
  if (errorElement) {
    errorElement.style.display = 'none';
    errorElement.textContent = '';
  }
}

/**
 * Show payment loading state
 */
function showPaymentLoading() {
  const loadingElement = document.getElementById('payment-loading');
  const submitButton = document.getElementById('submit-button');
  
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
  
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
  }
}

/**
 * Hide payment loading state
 */
function hidePaymentLoading() {
  const loadingElement = document.getElementById('payment-loading');
  const submitButton = document.getElementById('submit-button');
  
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = 'Pay Now';
  }
}

/**
 * Set up event listeners when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('payment-form');
  const cancelButton = document.getElementById('cancel-button');
  
  // Payment form submission
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await processPayment();
    });
  }
  
  // Cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      hidePaymentOverlay();
    });
  }
  
  // Close overlay when clicking outside
  const overlay = document.getElementById('payment-overlay');
  if (overlay) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        hidePaymentOverlay();
      }
    });
  }
  
  // Handle successful payment return
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment') === 'success') {
    const productId = urlParams.get('product');
    console.log('✅ Payment successful for product:', productId);
    
    // Show success message and clean up URL
    alert('Payment successful! Thank you for your purchase.');
    
    // Remove payment params from URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
});

console.log('💳 Ninefy Stripe integration loaded');
