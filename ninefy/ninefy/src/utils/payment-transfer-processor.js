/**
 * Payment Transfer Processor
 *
 * Shared utility for processing Stripe transfers to payees after successful payment
 * Used by all BDO purchase flows (books, tickets, courses, memberships)
 */

/**
 * Process payment transfers to payees after successful payment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} addieUrl - Addie service URL
 * @returns {Object} Transfer processing result
 */
async function processPaymentTransfers(paymentIntentId, addieUrl) {
  try {
    console.log('💸 Processing transfers for payment:', paymentIntentId);

    // Use Tauri backend if available
    if (window.__TAURI__ && window.__TAURI__.core?.invoke) {
      const result = await window.__TAURI__.core.invoke('process_payment_transfers', {
        paymentIntentId: paymentIntentId,
        addieUrl: addieUrl
      });

      if (result.success) {
        console.log(`✅ Processed ${result.totalTransfers} transfers successfully`);
        if (result.failedTransfers > 0) {
          console.warn(`⚠️ ${result.failedTransfers} transfers failed`);
        }
      }

      return result;
    }

    // Fallback: direct HTTP call
    const response = await fetch(`${addieUrl}/payment/${paymentIntentId}/process-transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Transfer processing failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Processed ${result.totalTransfers} transfers successfully`);
      if (result.failedTransfers > 0) {
        console.warn(`⚠️ ${result.failedTransfers} transfers failed`);
      }
    }

    return result;

  } catch (error) {
    console.error('❌ Transfer processing error:', error);
    return {
      success: false,
      error: error.message,
      failedTransfers: 0,
      totalTransfers: 0
    };
  }
}

// Export function
if (typeof window !== 'undefined') {
  window.PaymentTransferProcessor = {
    processTransfers: processPaymentTransfers
  };
}

console.log('💸 Payment Transfer Processor utilities loaded');
