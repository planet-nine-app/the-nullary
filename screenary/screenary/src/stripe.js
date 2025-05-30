const { invoke } = window.__TAURI__.core;
let stripe;
let elements;
let response;

window.getPaymentIntentWithoutSplits = async (amount, currency) => {
  try {
    response = await invoke("get_payment_intent_without_splits", {amount, currency});
console.log('response is', response);
    
    stripe = Stripe(response.publishableKey);
    elements = stripe.elements({
      clientSecret: response.paymentIntent
    });

    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
  } catch(err) {
console.warn(err);
  }
};

window.getPaymentIntentWithSplits = async (amount, currency, payees) => {
  try {
    response = await invoke("get_payment_intent_with_splits", {amount, currency, payees});
console.log('response is', response);
    
    stripe = Stripe(response.publishableKey);
    elements = stripe.elements({
      clientSecret: response.paymentIntent
    });

    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
  } catch(err) {
console.warn(err);
  }
};

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const errorMessage = document.getElementById('error-message');
const loadingMessage = document.getElementById('loading');


window.updateConfirmPayment = (productUUID, formValues) => {
  window.confirmPayment = async () => {
  let encodedFormValues = '';
  for(let value in formValues) {
    encodedFormValues += `&${value}=${encodeURIComponent(formValues[value])}`;
  }
  const redirect = `${window.location.origin}?product=${productUUID}${encodedFormValues}`;
    try {
      const { error } = await stripe.confirmPayment({
	  elements,
	  confirmParams: {
	      return_url: redirect,
	  },
      });

      if(error) {
	showError(error.message);
      }
    } catch(err) {
      showError('An unexpected error occurred.');
  console.warn('Payment error:', error);
    }
  };
};


form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!stripe || !elements) {
    return;
  }

  // Disable form submission while processing
  setLoading(true);

  await window.confirmPayment();

  setLoading(false);
});

const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  setTimeout(() => {
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
  }, 5000);
}

const setLoading = (isLoading) => {
  submitButton.disabled = isLoading;
  loadingMessage.style.display = isLoading ? 'block' : 'none';
}
