<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { bookingStore } from '$lib/stores/booking';
  import { navigationStore } from '$lib/stores/navigation';
  import { format } from 'date-fns';
  import { MapPin, Calendar, Clock, User, Edit2, CheckCircle } from 'lucide-svelte';
  import type { ServiceType, MassageType, Duration, TherapistTier, Gender } from '$lib/stores/booking';

  const dispatch = createEventDispatcher<{
    back: void;
    editLocation: void;
    editService: void;
    editDateTime: void;
    editTherapist: void;
    finalize: void;
  }>();

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: true,
      showNext: false,
      stepName: 'Confirm Booking',
      onBack: () => dispatch('back'),
      showBookButton: false
    });
  }

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

  // Health questions state
  let isPregnant = false;
  let isUnder16 = false;
  let pregnancyMonths: number | null = null;
  let age: number | null = null;

  // Generate arrays for dropdowns
  const pregnancyMonthsOptions = Array.from({ length: 9 }, (_, i) => i + 1);
  const ageOptions = Array.from({ length: 16 }, (_, i) => i + 1);

  // Check if all required fields are filled
  $: isComplete = 
    bookingSession.serviceType && 
    bookingSession.location && 
    bookingSession.duration && 
    bookingSession.massageType && 
    bookingSession.selectedDate && 
    bookingSession.selectedTimeSlot &&
    (!isPregnant || (isPregnant && pregnancyMonths !== null)) &&
    (!isUnder16 || (isUnder16 && age !== null));
</script>

<div class="space-y-8 mt-20">
  <div class="text-center mb-8">
    <h2 class="text-gray-600 mt-2 px-4">Please review your booking details before finalizing</h2>
  </div>

  <!-- Booking Summary -->
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <!-- Location Section -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-start">
        <div class="flex items-start">
          <div class="bg-blue-50 p-2 rounded-full mr-4">
            <MapPin class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Location</h3>
            <p class="text-gray-600 mt-1">{locationDisplay}</p>
            <p class="text-sm text-gray-500 mt-1">{serviceTypeDisplay} Service</p>
          </div>
        </div>
        <button 
          class="text-[rgb(var(--color-primary))] flex items-center text-sm hover:opacity-80"
          on:click={() => dispatch('editLocation')}
        >
          <Edit2 class="w-4 h-4 mr-1" />
          Edit
        </button>
      </div>
    </div>

    <!-- Service Section -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-start">
        <div class="flex items-start">
          <div class="bg-green-50 p-2 rounded-full mr-4">
            <CheckCircle class="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Service</h3>
            <p class="text-gray-600 mt-1">{massageTypeDisplay}</p>
            <p class="text-sm text-gray-500 mt-1">{durationDisplay}</p>
          </div>
        </div>
        <button 
          class="text-[rgb(var(--color-primary))] flex items-center text-sm hover:opacity-80"
          on:click={() => dispatch('editService')}
        >
          <Edit2 class="w-4 h-4 mr-1" />
          Edit
        </button>
      </div>
    </div>

    <!-- Date & Time Section -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-start">
        <div class="flex items-start">
          <div class="bg-purple-50 p-2 rounded-full mr-4">
            <Calendar class="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Date & Time</h3>
            <p class="text-gray-600 mt-1">{formattedDate}</p>
            <p class="text-sm text-gray-500 mt-1">{formattedTime}</p>
          </div>
        </div>
        <button 
          class="text-[rgb(var(--color-primary))] flex items-center text-sm hover:opacity-80"
          on:click={() => dispatch('editDateTime')}
        >
          <Edit2 class="w-4 h-4 mr-1" />
          Edit
        </button>
      </div>
    </div>

    <!-- Therapist Section -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-start">
        <div class="flex items-start">
          <div class="bg-amber-50 p-2 rounded-full mr-4">
            <User class="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Therapist</h3>
            <p class="text-gray-600 mt-1">{therapistName}</p>
            <p class="text-sm text-gray-500 mt-1">{therapistTier}</p>
          </div>
        </div>
        <button 
          class="text-[rgb(var(--color-primary))] flex items-center text-sm hover:opacity-80"
          on:click={() => dispatch('editTherapist')}
        >
          <Edit2 class="w-4 h-4 mr-1" />
          Edit
        </button>
      </div>
    </div>

    <!-- Health Questions -->
    <div class="p-6">
      <h3 class="font-medium text-gray-900 mb-4">Health Questions</h3>
      <div class="space-y-4">
        <!-- Pregnancy Question -->
        <div>
          <label class="flex items-start space-x-3">
            <input
              type="checkbox"
              class="mt-1"
              bind:checked={isPregnant}
            >
            <span class="text-gray-700">Are You Pregnant?</span>
          </label>
          {#if isPregnant}
            <div class="mt-2 ml-7">
              <select
                class="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                bind:value={pregnancyMonths}
              >
                <option value={null}>Select months...</option>
                {#each pregnancyMonthsOptions as month}
                  <option value={month}>{month} {month === 1 ? 'month' : 'months'}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>

        <!-- Age Question -->
        <div>
          <label class="flex items-start space-x-3">
            <input
              type="checkbox"
              class="mt-1"
              bind:checked={isUnder16}
            >
            <span class="text-gray-700">Are You 16 or Younger?</span>
          </label>
          {#if isUnder16}
            <div class="mt-2 ml-7">
              <select
                class="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                bind:value={age}
              >
                <option value={null}>Select age...</option>
                {#each ageOptions as ageOption}
                  <option value={ageOption}>{ageOption} years old</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Finalize Button -->
  <div class="mt-8">
    <button 
      class="w-full bg-[rgb(var(--color-primary))] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={() => dispatch('finalize')}
      disabled={!isComplete}
    >
      Finalize Booking
    </button>
    {#if !isComplete}
      <p class="text-sm text-red-500 mt-2 text-center">
        Please complete all required fields before finalizing
      </p>
    {/if}
  </div>
</div> 