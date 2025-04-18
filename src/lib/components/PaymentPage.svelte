<script lang="ts">
  import { navigationStore } from '$lib/stores/navigation';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let cardNumber = '';
  let expiryDate = '';
  let cvv = '';
  let nameOnCard = '';

  function handleSubmit() {
    // Here you would typically integrate with a payment processor
    // For now, we'll just simulate a successful payment
    dispatch('paymentComplete', {
      success: true,
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
    });
    navigationStore.setCurrentView('final-confirmation');
  }
</script>

<div class="payment-page">
  <h2>Payment Details</h2>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="cardNumber">Card Number</label>
      <input
        type="text"
        id="cardNumber"
        bind:value={cardNumber}
        placeholder="1234 5678 9012 3456"
        required
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="expiryDate">Expiry Date</label>
        <input
          type="text"
          id="expiryDate"
          bind:value={expiryDate}
          placeholder="MM/YY"
          required
        />
      </div>

      <div class="form-group">
        <label for="cvv">CVV</label>
        <input
          type="text"
          id="cvv"
          bind:value={cvv}
          placeholder="123"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <label for="nameOnCard">Name on Card</label>
      <input
        type="text"
        id="nameOnCard"
        bind:value={nameOnCard}
        placeholder="John Doe"
        required
      />
    </div>

    <button type="submit" class="submit-button">Pay Now</button>
  </form>
</div>

<style>
  .payment-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  h2 {
    margin-bottom: 2rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .submit-button {
    width: 100%;
    padding: 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .submit-button:hover {
    background-color: #45a049;
  }
</style>