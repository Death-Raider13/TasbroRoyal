export const initializePaystackPayment = (email, amount, metadata, onSuccess, onClose) => {
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Convert to kobo
    currency: 'NGN',
    metadata,
    callback: (response) => {
      onSuccess(response);
    },
    onClose: () => {
      onClose();
    }
  });
  
  handler.openIframe();
};
