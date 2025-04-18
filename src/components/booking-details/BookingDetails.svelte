<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { bookingStore } from '$lib/stores/booking';
  import type { Gender, TherapistTier, Therapist } from '$lib/stores/booking';
  import { navigationStore } from '$lib/stores/navigation';
  import { format, addDays, isSameDay, subDays, startOfDay } from 'date-fns';
  import { Calendar, ChevronUp, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-svelte';
  import CalendarComponent from './Calendar.svelte';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let showBackButton = true;
  
  const dispatch = createEventDispatcher<{
    back: void;
    complete: void;
  }>();

  // Define TimeSlot type locally since we're modifying its structure
  type TimeSlot = {
    time: string;
    therapist: Therapist;
  };

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: showBackButton,
      showNext: false,
      stepName: 'Select Date & Time',
      onBack: () => dispatch('back'),
      showBookButton: !!selectedTimeSlotId,
      onBook: handleBooking
    });
  }

  // Get the booking session data
  $: bookingSession = $bookingStore;

  // Date selection
  let selectedDate = new Date();
  let showCalendar = false;
  
  // Generate week of dates
  $: weekDates = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - selectedDate.getDay()));

  // Mock data for available time slots
  // In a real app, this would come from an API call based on the selected date
  const mockTherapists: Record<string, Therapist> = {
    emily: { id: 'emily', name: 'Emily', tier: 'I', gender: 'female' },
    mike: { id: 'mike', name: 'Mike', tier: 'II', gender: 'male' },
    sarah: { id: 'sarah', name: 'Sarah', tier: 'III', gender: 'female' },
    john: { id: 'john', name: 'John', tier: 'II', gender: 'male' }
  };

  const timeSlots = {
    morning: [
      { time: '9:15', therapist: mockTherapists.emily },
      { time: '10:45', therapist: mockTherapists.mike },
      { time: '11:30', therapist: mockTherapists.sarah },
    ],
    afternoon: [
      { time: '1:00', therapist: mockTherapists.emily },
      { time: '2:15', therapist: mockTherapists.john },
      { time: '3:30', therapist: mockTherapists.mike },
    ],
    evening: [
      { time: '5:00', therapist: mockTherapists.sarah },
      { time: '6:30', therapist: mockTherapists.emily },
    ]
  };

  // Preferences
  $: genderPreference = $bookingStore.preferences.gender;
  $: therapistPreference = $bookingStore.preferences.therapist;
  $: tierPreference = $bookingStore.preferences.tier;

  function navigateDates(direction: 'prev' | 'next') {
    const offset = direction === 'next' ? 7 : -7;
    const newDate = addDays(weekDates[0], offset);
    
    // Only prevent navigating to dates before today
    if (direction === 'prev' && newDate < startOfDay(new Date())) {
      selectedDate = new Date();
      return;
    }
    
    selectedDate = newDate;
  }

  function handleDateSelect(date: Date) {
    // Allow selecting today, but not past dates
    if (date < startOfDay(new Date())) return;
    selectedDate = date;
    showCalendar = false;
    bookingStore.setSelectedDate(date);
    // In a real app, this would trigger an API call to fetch available slots for the selected date
  }

  // Time slot sections state
  let expandedSections = {
    morning: false,
    afternoon: true,
    evening: false,
  };

  // Selected time slot tracking
  let selectedTimeSlotId: string | null = null;

  function handleTimeSlotSelect(slot: TimeSlot) {
    selectedTimeSlotId = `${slot.time}-${slot.therapist.id}`;
    bookingStore.setSelectedTimeSlot(slot);
  }

  function handleGenderPreferenceChange(gender: Gender) {
    bookingStore.setPreferences({ gender });
  }

  function handleTherapistPreferenceChange(therapistId: string | null) {
    bookingStore.setPreferences({ therapist: therapistId });
  }

  function handleTierPreferenceChange(tier: TherapistTier | null) {
    bookingStore.setPreferences({ tier });
  }

  function selectNextAvailableDate() {
    // This would normally come from an API call
    const nextDate = addDays(new Date(), 7); // Mock next available date
    handleDateSelect(nextDate);
  }

  // Preferences panel state
  let isPreferencesPanelOpen = false;
  let preferencesPanel: HTMLElement;

  // Handle click outside
  function handleClickOutside(event: MouseEvent) {
    if (preferencesPanel && !preferencesPanel.contains(event.target as Node)) {
      isPreferencesPanelOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  function handleBooking() {
    console.log('Booking button clicked, dispatching complete event');
    dispatch('complete');
  }
</script>

<div class="space-y-8 mt-20">
  <!-- Location and Service Details -->
  <div class="space-y-6">

    <!-- Date Selection -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Select Date & Time</h2>
        <button
          class="text-[rgb(var(--color-primary))] flex items-center text-sm hover:opacity-80 border border-[rgb(var(--color-primary))] rounded-lg px-2 py-1"
          on:click={() => showCalendar = !showCalendar}
        >
          <Calendar class="w-4 h-4 mr-1" />
          Calendar
        </button>
      </div>

      <!-- Date Pills -->
      <div class="relative flex items-center">
        <!-- Previous week button -->
        <button
          class="absolute left-0 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent z-10"
          on:click={() => navigateDates('prev')}
          disabled={isSameDay(weekDates[0], new Date()) || weekDates[0] < new Date()}
        >
          <ChevronLeft class="w-5 h-5" />
        </button>

        <!-- Date squares -->
        <div class="flex flex-col w-full px-8">
          <!-- Month display -->
          <div class="text-sm font-bold text-gray-600 mb-2 px-1 text-center">
            {format(weekDates[0], 'MMMM')}
            {weekDates[6].getMonth() !== weekDates[0].getMonth() 
              ? `- ${format(weekDates[6], 'MMMM')}` 
              : ''}
          </div>
          <div class="flex justify-between">
            {#each weekDates as date}
              <button
                class="flex flex-col items-center justify-center w-12 h-12 rounded-lg border-2 transition-colors text-center
                  {isSameDay(date, selectedDate) ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] bg-opacity-10 text-white' : 'border-gray-200 hover:border-gray-300'}
                  {date < startOfDay(new Date()) ? 'opacity-50 cursor-not-allowed' : ''}"
                disabled={date < startOfDay(new Date())}
                on:click={() => handleDateSelect(date)}
              >
                <span class="text-xs font-medium">{format(date, 'EEE')}</span>
                <span class="text-sm">{format(date, 'd')}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Next week button -->
        <button
          class="absolute right-0 p-1 rounded-full hover:bg-gray-100"
          on:click={() => navigateDates('next')}
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <!-- Next Available Date -->
      <button 
        class="w-full flex items-center justify-between px-4 py-3 bg-[rgb(var(--color-primary))] bg-opacity-5 rounded-lg text-sm text-white hover:bg-opacity-10 transition-colors"
        on:click={selectNextAvailableDate}
      >
        <span>Next available date is Friday, 04/25</span>
        <ChevronRight class="w-4 h-4" />
      </button>

      <!-- Time Slots -->
      <div class="space-y-4">
        <!-- Morning -->
        <div class="border rounded-lg overflow-hidden">
          <button
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            on:click={() => expandedSections.morning = !expandedSections.morning}
          >
            <h3 class="text-sm font-medium text-gray-700">Morning (9am-12pm)</h3>
            <ChevronDown class="w-4 h-4 transition-transform {expandedSections.morning ? 'rotate-180' : ''}" />
          </button>
          {#if expandedSections.morning}
            <div 
              class="grid grid-cols-2 gap-2 p-2"
              transition:slide={{duration: 200, easing: quintOut}}
            >
              {#each timeSlots.morning as slot}
                <div class="relative">
                  <button
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all duration-200
                      hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-5
                      {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]' : 'border-gray-200'}"
                    on:click={() => handleTimeSlotSelect(slot)}
                  >
                    <div class="flex-1">
                      <div class="text-lg font-medium {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white' : ''}">{slot.time}</div>
                      <div class="flex items-center justify-center gap-2">
                        <div class="font-medium {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white' : ''}">{slot.therapist.name}</div>
                        <div class="text-sm {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white text-opacity-80' : 'text-gray-500'}">Tier {slot.therapist.tier}</div>
                      </div>
                    </div>
                    <div class="absolute right-3 top-3">
                      <div class="w-5 h-5 border-2 rounded-full flex items-center justify-center
                        {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'border-white bg-transparent' : 'border-gray-300'}">
                        {#if selectedTimeSlotId === `${slot.time}-${slot.therapist.id}`}
                          <div class="w-2 h-2 bg-white rounded-full"></div>
                        {/if}
                      </div>
                    </div>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Afternoon -->
        <div class="border rounded-lg overflow-hidden">
          <button
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            on:click={() => expandedSections.afternoon = !expandedSections.afternoon}
          >
            <h3 class="text-sm font-medium text-gray-700">Afternoon (12pm-4pm)</h3>
            <ChevronDown class="w-4 h-4 transition-transform {expandedSections.afternoon ? 'rotate-180' : ''}" />
          </button>
          {#if expandedSections.afternoon}
            <div 
              class="grid grid-cols-2 gap-2 p-2"
              transition:slide={{duration: 200, easing: quintOut}}
            >
              {#each timeSlots.afternoon as slot}
                <div class="relative">
                  <button
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all duration-200
                      hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-5
                      {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]' : 'border-gray-200'}"
                    on:click={() => handleTimeSlotSelect(slot)}
                  >
                    <div class="flex-1">
                      <div class="text-lg font-medium {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white' : ''}">{slot.time}</div>
                      <div class="flex items-center justify-center gap-2">
                        <div class="font-medium {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white' : ''}">{slot.therapist.name}</div>
                        <div class="text-sm {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white text-opacity-80' : 'text-gray-500'}">Tier {slot.therapist.tier}</div>
                      </div>
                    </div>
                    <div class="absolute right-3 top-3">
                      <div class="w-5 h-5 border-2 rounded-full flex items-center justify-center
                        {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'border-white bg-transparent' : 'border-gray-300'}">
                        {#if selectedTimeSlotId === `${slot.time}-${slot.therapist.id}`}
                          <div class="w-2 h-2 bg-white rounded-full"></div>
                        {/if}
                      </div>
                    </div>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Evening -->
        <div class="border rounded-lg overflow-hidden">
          <button
            class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            on:click={() => expandedSections.evening = !expandedSections.evening}
          >
            <h3 class="text-sm font-medium text-gray-700">Evening (4pm-8pm)</h3>
            <ChevronDown class="w-4 h-4 transition-transform {expandedSections.evening ? 'rotate-180' : ''}" />
          </button>
          {#if expandedSections.evening}
            <div 
              class="grid grid-cols-2 gap-2 p-2"
              transition:slide={{duration: 200, easing: quintOut}}
            >
              {#each timeSlots.evening as slot}
                <div class="relative">
                  <button
                    class="w-full flex items-center justify-between p-3 border rounded-lg transition-all duration-200
                      hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-5
                      {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]' : 'border-gray-200'}"
                    on:click={() => handleTimeSlotSelect(slot)}
                  >
                    <div class="flex-1">
                      <div class="text-lg font-medium {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white' : ''}">{slot.time}</div>
                      <div class="flex items-center justify-center gap-2">
                        <div class="font-medium {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white' : ''}">{slot.therapist.name}</div>
                        <div class="text-sm {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'text-white text-opacity-80' : 'text-gray-500'}">Tier {slot.therapist.tier}</div>
                      </div>
                    </div>
                    <div class="absolute right-3 top-3">
                      <div class="w-5 h-5 border-2 rounded-full flex items-center justify-center
                        {selectedTimeSlotId === `${slot.time}-${slot.therapist.id}` ? 'border-white bg-transparent' : 'border-gray-300'}">
                        {#if selectedTimeSlotId === `${slot.time}-${slot.therapist.id}`}
                          <div class="w-2 h-2 bg-white rounded-full"></div>
                        {/if}
                      </div>
                    </div>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </section>

    <!-- Preferences Panel -->
    <div 
      class="fixed bottom-0 left-0 right-0 bg-white z-50"
      bind:this={preferencesPanel}
      style="transform: translateZ(0)"
    >
      <!-- Tab -->
      <button
        class="absolute -top-8 left-1/2 -translate-x-1/2 bg-[rgb(var(--color-primary))] text-white rounded-t-lg px-12 py-1.5 shadow-md border border-b-0 flex items-center gap-1.5 min-w-[200px] justify-center"
        on:click|stopPropagation={() => isPreferencesPanelOpen = !isPreferencesPanelOpen}
      >
        <ChevronUp class="w-4 h-4 transition-transform {isPreferencesPanelOpen ? 'rotate-180' : ''}" />
        <span class="text-sm font-medium whitespace-nowrap">Therapist Preferences</span>
      </button>

      <!-- Panel Content -->
      {#if isPreferencesPanelOpen}
        <div 
          class="border-t shadow-lg px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto"
          transition:slide={{duration: 300, easing: quintOut}}
        >
          <h2 class="text-lg font-medium text-gray-900 sr-only">Preferences</h2>
          <div class="space-y-4">
            <!-- Gender Preference -->
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Gender Preference</label>
              <div class="flex space-x-2">
                <button
                  class="px-4 py-2 rounded-full border-2 transition-colors
                    {genderPreference === 'any' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}"
                  on:click={() => handleGenderPreferenceChange('any')}
                >
                  No Preference
                </button>
                <button
                  class="px-4 py-2 rounded-full border-2 transition-colors
                    {genderPreference === 'female' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}"
                  on:click={() => handleGenderPreferenceChange('female')}
                >
                  Female
                </button>
                <button
                  class="px-4 py-2 rounded-full border-2 transition-colors
                    {genderPreference === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}"
                  on:click={() => handleGenderPreferenceChange('male')}
                >
                  Male
                </button>
              </div>
            </div>

            <!-- Therapist Preference -->
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Specific Therapist</label>
              <select
                bind:value={therapistPreference}
                on:change={(e) => handleTherapistPreferenceChange(e.currentTarget.value || null)}
                class="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="none">No Preference</option>
                {#each Object.values(mockTherapists) as therapist}
                  <option value={therapist.id}>{therapist.name}</option>
                {/each}
              </select>
            </div>

            <!-- Tier Preference -->
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Therapist Tier</label>
              <select
                bind:value={tierPreference}
                on:change={(e) => handleTierPreferenceChange(e.currentTarget.value as TherapistTier || null)}
                class="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="none">No Preference</option>
                <option value="I">Tier I</option>
                <option value="II">Tier II</option>
                <option value="III">Tier III</option>
                <option value="IV">Tier IV</option>
              </select>
            </div>
          </div>
        </div>
      {/if}
    </div>

  </div>
</div>

<!-- Add padding at the bottom to account for the preferences panel -->
<div class="h-16"></div>

{#if showCalendar}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg p-4 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Select Date</h3>
        <button
          class="text-gray-400 hover:text-gray-500"
          on:click={() => showCalendar = false}
        >
          ✕
        </button>
      </div>
      <CalendarComponent
        {selectedDate}
        on:select={(e) => handleDateSelect(e.detail)}
      />
    </div>
  </div>
{/if}

<style>
  /* Remove slideIn animation as it's no longer needed */
</style> 