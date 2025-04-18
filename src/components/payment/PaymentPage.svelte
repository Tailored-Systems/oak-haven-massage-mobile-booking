<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { navigationStore } from '$lib/stores/navigation';
  import { ChevronLeft, Lock, CreditCard, Calendar, Clock, MapPin, User } from 'lucide-svelte';
  import { bookingStore } from '$lib/stores/booking';
  import { format } from 'date-fns';

  const dispatch = createEventDispatcher<{
    back: void;
    paymentComplete: void;
  }>();

  // Get the booking session data
  $: bookingSession = $bookingStore;

  // Format date for display
  $: formattedDate = bookingSession.selectedDate 
    ? format(bookingSession.selectedDate, 'EEEE, MMMM d') 
    : '';

  // Format time for display
  $: formattedTime = bookingSession.selectedTimeSlot 
    ? bookingSession.selectedTimeSlot.time 
    : '';

  // Format service type for display
  $: serviceTypeDisplay = bookingSession.serviceType === 'in-office' 
    ? 'In-Office' 
    : bookingSession.serviceType === 'in-home' 
      ? 'In-Home' 
      : '';

  // Format massage type for display
  $: massageTypeDisplay = bookingSession.massageType 
    ? bookingSession.massageType.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') 
    : '';

  // Format duration for display
  $: durationDisplay = bookingSession.duration 
    ? `${bookingSession.duration} minutes` 
    : '';

  // Format location for display
  $: locationDisplay = bookingSession.location 
    ? bookingSession.location.name || bookingSession.location.address 
    : '';

  // Payment form fields
  let cardNumber = '';
  let expiryDate = '';
  let cvv = '';
  let nameOnCard = '';
  
  // Payment processing state
  let isProcessing = false;
  let paymentComplete = false;

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: true,
      showNext: false,
      stepName: 'Secure Payment',
      onBack: () => dispatch('back'),
      showBookButton: false
    });
  }

  function handleSubmit() {
    isProcessing = true;
    
    // Simulate payment processing
    setTimeout(() => {
      isProcessing = false;
      paymentComplete = true;
      
      // Automatically proceed to confirmation after a short delay
      setTimeout(() => {
        dispatch('paymentComplete');
      }, 1500);
    }, 2000);
  }
</script>

<div class="space-y-8 mt-20">
  <div class="text-center mb-8">
    <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-4 rounded-full inline-block mx-auto">
      <Lock class="w-8 h-8 text-white" />
    </div>
    <h2 class="text-2xl font-semibold text-gray-900 mt-4">Secure Payment</h2>
    <p class="text-gray-600 mt-2 px-4">Your payment information is encrypted and secure</p>
  </div>

  <div class="max-w-md mx-auto">
    <!-- Order Summary -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div class="p-4 bg-gray-50 border-b border-gray-200">
        <h3 class="font-medium text-gray-900">Order Summary</h3>
      </div>
      
      <div class="p-4 space-y-4">
        <!-- Service Details -->
        <div class="flex items-start">
          <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-2 rounded-full mr-3">
            <Calendar class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{massageTypeDisplay}</p>
            <p class="text-sm text-gray-500">{durationDisplay}</p>
          </div>
        </div>
        
        <!-- Date & Time -->
        <div class="flex items-start">
          <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-2 rounded-full mr-3">
            <Clock class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{formattedDate}</p>
            <p class="text-sm text-gray-500">{formattedTime}</p>
          </div>
        </div>

        <!-- Therapist -->
        <div class="flex items-start">
          <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-2 rounded-full mr-3">
            <User class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-900">Therapist</p>
            <p class="text-sm text-gray-500">{bookingSession.selectedTimeSlot?.therapist.name}</p>
            <p class="text-sm text-gray-500">Tier {bookingSession.selectedTimeSlot?.therapist.tier}</p>
          </div>
        </div>
        
        <!-- Location -->
        <div class="flex items-start">
          <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-2 rounded-full mr-3">
            <MapPin class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{locationDisplay}</p>
            <p class="text-sm text-gray-500">{serviceTypeDisplay} Service</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 bg-gray-50 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-900">Total</span>
          <span class="font-medium text-gray-900">$120.00</span>
        </div>
      </div>
    </div>
    
    <!-- Payment Form -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="p-4 bg-gray-50 border-b border-gray-200">
        <h3 class="font-medium text-gray-900">Payment Information</h3>
      </div>
      
      <form on:submit|preventDefault={handleSubmit} class="p-4 space-y-4">
        <!-- Card Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              class="input-field pl-10"
              placeholder="1234 5678 9012 3456"
              bind:value={cardNumber}
              disabled={isProcessing || paymentComplete}
              required
            />
          </div>
        </div>
        
        <!-- Expiry and CVV -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="text"
              class="input-field"
              placeholder="MM/YY"
              bind:value={expiryDate}
              disabled={isProcessing || paymentComplete}
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input
              type="text"
              class="input-field"
              placeholder="123"
              bind:value={cvv}
              disabled={isProcessing || paymentComplete}
              required
            />
          </div>
        </div>
        
        <!-- Name on Card -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
          <input
            type="text"
            class="input-field"
            placeholder="Name as it appears on card"
            bind:value={nameOnCard}
            disabled={isProcessing || paymentComplete}
            required
          />
        </div>
        
        <!-- Payment Button -->
        <div class="mt-6">
          {#if paymentComplete}
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p class="text-green-700 font-medium">Payment Successful!</p>
              <p class="text-green-600 text-sm mt-1">Redirecting to confirmation...</p>
            </div>
          {:else}
            <button
              type="submit"
              class="btn-primary w-full"
              disabled={isProcessing}
            >
              {#if isProcessing}
                <span class="inline-block animate-spin mr-2">⟳</span>
                Processing...
              {:else}
                Pay $120.00
              {/if}
            </button>
          {/if}
        </div>
      </form>
    </div>
    
    <!-- Back Button -->
    <div class="mt-4 text-center">
      <button
        class="text-[rgb(var(--color-primary))] font-medium hover:underline inline-flex items-center"
        on:click={() => dispatch('back')}
        disabled={isProcessing || paymentComplete}
      >
        <ChevronLeft class="w-4 h-4 mr-1" />
        Back
      </button>
    </div>
  </div>
</div> 