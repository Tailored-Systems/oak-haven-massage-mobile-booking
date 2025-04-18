<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { navigationStore } from '$lib/stores/navigation';
  import { CheckCircle, Calendar, Clock, MapPin, Mail, Phone } from 'lucide-svelte';
  import { bookingStore } from '$lib/stores/booking';
  import { format } from 'date-fns';

  const dispatch = createEventDispatcher<{
    done: void;
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

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: false,
      showNext: false,
      stepName: '',
      onBack: () => {},
      showBookButton: false
    });
  }

  // Generate a random booking reference
  $: bookingReference = 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
</script>

<div class="space-y-8 mt-20">
  <div class="text-center mb-8">
    <div class="bg-green-100 p-4 rounded-full inline-block mx-auto">
      <CheckCircle class="w-12 h-12 text-green-500" />
    </div>
    <h2 class="text-2xl font-semibold text-gray-900 mt-4">Booking Confirmed!</h2>
    <p class="text-gray-600 mt-2 px-4">Your appointment has been successfully booked</p>
  </div>

  <div class="max-w-md mx-auto">
    <!-- Booking Reference -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div class="p-4 bg-gray-50 border-b border-gray-200">
        <h3 class="font-medium text-gray-900">Booking Reference</h3>
      </div>
      <div class="p-4 text-center">
        <p class="text-2xl font-mono font-bold text-[rgb(var(--color-primary))]">{bookingReference}</p>
        <p class="text-sm text-gray-500 mt-1">Please keep this reference for your records</p>
      </div>
    </div>

    <!-- Booking Details -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div class="p-4 bg-gray-50 border-b border-gray-200">
        <h3 class="font-medium text-gray-900">Booking Details</h3>
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
    </div>

    <!-- Confirmation Message -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div class="p-4 space-y-4">
        <div class="flex items-start">
          <div class="bg-blue-50 p-2 rounded-full mr-3">
            <Mail class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p class="font-medium text-gray-900">Confirmation Email</p>
            <p class="text-sm text-gray-500">We've sent a confirmation email with all the details to your inbox</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="bg-blue-50 p-2 rounded-full mr-3">
            <Phone class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p class="font-medium text-gray-900">SMS Reminder</p>
            <p class="text-sm text-gray-500">You'll receive a reminder 24 hours before your appointment</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Done Button -->
    <div class="mt-6">
      <button
        class="btn-primary w-full"
        on:click={() => dispatch('done')}
      >
        Done
      </button>
    </div>
  </div>
</div> 