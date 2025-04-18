<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { navigationStore } from '$lib/stores/navigation';
  import { bookingStore } from '$lib/stores/booking';
  import { format } from 'date-fns';
  import { CheckCircle, Calendar, Clock, MapPin, User, FileText } from 'lucide-svelte';

  const dispatch = createEventDispatcher<{
    back: void;
    complete: void;
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

  // Format therapist name for display
  $: therapistName = bookingSession.selectedTimeSlot 
    ? bookingSession.selectedTimeSlot.therapist.name 
    : '';

  // Format therapist tier for display
  $: therapistTier = bookingSession.selectedTimeSlot 
    ? `Tier ${bookingSession.selectedTimeSlot.therapist.tier}` 
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

  // Legal disclosure state
  let showLegalDisclosure = false;
  let legalDisclosureAccepted = false;

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: false,
      showNext: false,
      stepName: 'Booking Confirmed',
      showBookButton: false
    });
  }

  function toggleLegalDisclosure() {
    showLegalDisclosure = !showLegalDisclosure;
  }

  function acceptLegalDisclosure() {
    legalDisclosureAccepted = true;
    showLegalDisclosure = false;
    
    // Automatically complete after accepting
    setTimeout(() => {
      dispatch('complete');
    }, 1000);
  }

  function handleComplete() {
    if (legalDisclosureAccepted) {
      dispatch('complete');
    } else {
      showLegalDisclosure = true;
    }
  }
</script>

<div class="space-y-8 mt-20">
  <div class="text-center mb-8">
    <div class="bg-green-100 p-4 rounded-full inline-block mx-auto">
      <CheckCircle class="w-8 h-8 text-green-500" />
    </div>
    <h2 class="text-2xl font-semibold text-gray-900 mt-4">Booking Confirmed!</h2>
    <p class="text-gray-600 mt-2 px-4">Your appointment has been successfully scheduled</p>
  </div>

  <div class="max-w-md mx-auto">
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
        
        <!-- Therapist -->
        <div class="flex items-start">
          <div class="bg-[rgb(var(--color-primary))] bg-opacity-10 p-2 rounded-full mr-3">
            <User class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{therapistName}</p>
            <p class="text-sm text-gray-500">{therapistTier}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 bg-gray-50 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-900">Total Paid</span>
          <span class="font-medium text-gray-900">$120.00</span>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Message -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <p class="text-blue-700">
        A confirmation email has been sent to your email address with all the details of your booking.
        Please check your inbox (and spam folder) for the confirmation.
      </p>
    </div>
    
    <!-- Legal Disclosure Toggle -->
    <div class="text-center">
      <button
        class="text-[rgb(var(--color-primary))] font-medium hover:underline inline-flex items-center gap-1"
        on:click={toggleLegalDisclosure}
      >
        <FileText class="w-4 h-4" />
        View Legal Disclosure
      </button>
    </div>
    
    <!-- Legal Disclosure Modal -->
    {#if showLegalDisclosure}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-medium text-gray-900">Legal Disclosure</h3>
          </div>
          
          <div class="p-4 space-y-4">
            <p class="text-gray-700">
              By booking a massage therapy session with Oak Haven Massage Therapy, you acknowledge and agree to the following terms and conditions:
            </p>
            
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">1. Cancellation Policy</h4>
              <p class="text-gray-700 text-sm">
                Cancellations made less than 24 hours before your scheduled appointment will result in a charge of 50% of the service fee. No-shows will be charged the full service fee.
              </p>
              
              <h4 class="font-medium text-gray-900">2. Health Considerations</h4>
              <p class="text-gray-700 text-sm">
                Massage therapy is not a substitute for professional medical treatment. If you have any health concerns, please consult your healthcare provider before receiving massage therapy.
              </p>
              
              <h4 class="font-medium text-gray-900">3. Privacy Policy</h4>
              <p class="text-gray-700 text-sm">
                Your personal information will be kept confidential and will not be shared with third parties without your consent, except as required by law.
              </p>
              
              <h4 class="font-medium text-gray-900">4. Liability</h4>
              <p class="text-gray-700 text-sm">
                Oak Haven Massage Therapy is not liable for any injury or harm that may occur during or after your massage session, except in cases of gross negligence.
              </p>
            </div>
          </div>
          
          <div class="p-4 border-t border-gray-200 flex justify-end">
            <button
              class="btn-primary"
              on:click={acceptLegalDisclosure}
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Complete Button -->
    <div class="mt-6">
      <button
        class="btn-primary w-full"
        on:click={handleComplete}
      >
        Complete Booking
      </button>
    </div>
  </div>
</div> 