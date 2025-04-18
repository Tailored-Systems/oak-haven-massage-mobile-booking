<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { bookingStore } from '$lib/stores/booking';
  import { navigationStore } from '$lib/stores/navigation';
  import type { MassageType, Duration } from '$lib/stores/booking';

  export let showBackButton = true;
  
  const dispatch = createEventDispatcher<{
    back: void;
    complete: void;
  }>();

  // Set up navigation controls
  $: {
    navigationStore.setNavigation({
      showBack: showBackButton,
      showNext: true,
      stepName: 'Select Service',
      onBack: () => dispatch('back'),
      onNext: () => {
        if (selectedMassageType && selectedDuration) {
          dispatch('complete');
        }
      }
    });
  }

  // Get the booking session data
  $: bookingSession = $bookingStore;

  // Duration options
  const durations: Duration[] = [25, 50, 80, 110];
  let selectedDuration: Duration = 50;

  // Massage type data
  const standardMassages = [
    {
      id: 'relaxation',
      title: 'Relaxation Massage',
      description: 'A gentle, soothing massage that promotes relaxation and stress relief. Perfect for those seeking a calming experience.',
      isPopular: true
    },
    {
      id: 'deep-tissue',
      title: 'Deep Tissue Massage',
      description: 'A more intense massage that targets deeper layers of muscle and connective tissue. Ideal for chronic aches and tension.',
      isPopular: false
    },
    {
      id: 'therapeutic',
      title: 'Therapeutic Massage',
      description: 'A customized massage that addresses specific therapeutic needs and conditions. Combines various techniques for optimal results.',
      isPopular: false
    }
  ];

  const advancedMassages = [
    {
      id: 'ashiatsu',
      title: 'Ashiatsu Massage',
      description: 'A unique form of deep tissue massage performed with the therapist\'s feet, allowing for deeper pressure and broader coverage.',
      isPopular: false
    },
    {
      id: 'sports',
      title: 'Sports Massage',
      description: 'Specifically designed for athletes and active individuals, focusing on injury prevention and performance enhancement.',
      isPopular: false
    },
    {
      id: 'lymphatic',
      title: 'Lymphatic Drainage',
      description: 'A gentle massage technique that stimulates the lymphatic system to improve immune function and reduce swelling.',
      isPopular: false
    },
    {
      id: 'reflexology',
      title: 'Reflexology',
      description: 'A specialized massage focusing on pressure points in the feet, hands, and ears that correspond to different body systems.',
      isPopular: false
    },
    {
      id: 'targeted',
      title: 'Targeted Manual Therapy',
      description: 'A focused approach addressing specific areas of pain or dysfunction through precise manual techniques.',
      isPopular: false
    }
  ];

  let selectedMassageType: MassageType = 'relaxation';
  let showAdvancedMassages = false;
  let showStandardMassages = true;
  let expandedDescriptions: Record<string, boolean> = {};

  // Handle selections
  function handleDurationSelect(duration: Duration) {
    selectedDuration = duration;
    bookingStore.setDuration(duration);
  }

  function handleMassageTypeSelect(type: MassageType) {
    selectedMassageType = type;
    bookingStore.setMassageType(type);
  }

  function toggleDescription(id: string) {
    expandedDescriptions[id] = !expandedDescriptions[id];
  }

  // Initialize with default selections
  $: {
    if (!bookingSession.duration) {
      handleDurationSelect(50);
    }
    if (!bookingSession.massageType) {
      handleMassageTypeSelect('relaxation');
    }
  }
</script>

<div class="space-y-8 mt-20">
  <!-- Duration Selection -->
  <section class="space-y-4">
    <h2 class="text-lg font-medium text-gray-900">Duration</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each durations as duration}
        <button
          class="p-4 rounded-lg border-2 text-center transition-colors relative
            {selectedDuration === duration
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'}"
          on:click={() => handleDurationSelect(duration)}
        >
          {#if duration === 50}
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                Most Popular
              </span>
            </div>
          {/if}
          <span class="block text-lg font-medium mt-1">{duration}</span>
          <span class="block text-sm text-gray-500">minutes</span>
        </button>
      {/each}
    </div>
  </section>

  <h2 class="text-lg font-medium text-gray-900">Massage Type</h2>
  <!-- Standard Massage Types -->
  <section class="space-y-4">
    <button
      class="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors
        {showStandardMassages ? 'border-gray-200' : 'border-gray-200'}"
      on:click={() => showStandardMassages = !showStandardMassages}
    >
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">Standard Massages</h2>
        <svg
          class="w-5 h-5 text-gray-500 transform transition-transform
            {showStandardMassages ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    {#if showStandardMassages}
      <div class="space-y-4 mt-4">
        {#each standardMassages as massage}
          <div class="relative">
            {#if massage.isPopular}
              <div class="absolute -top-3 left-4 z-10">
                <span class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              </div>
            {/if}
            <div
              role="button"
              tabindex="0"
              class="w-full text-left cursor-pointer"
              on:click={() => handleMassageTypeSelect(massage.id as MassageType)}
              on:keydown={(e) => e.key === 'Enter' && handleMassageTypeSelect(massage.id as MassageType)}
            >
              <div
                class="border rounded-lg overflow-hidden transition-colors
                  {selectedMassageType === massage.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'}"
              >
                <div class="p-4">
                  <div class="flex justify-between items-start">
                    <div class="flex-grow">
                      <h3 class="font-medium text-gray-900">{massage.title}</h3>
                      <button
                        class="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        on:click|stopPropagation={() => toggleDescription(massage.id)}
                      >
                        <span>{expandedDescriptions[massage.id] ? 'Hide details' : 'Learn more'}</span>
                        <svg
                          class="w-4 h-4 transform transition-transform
                            {expandedDescriptions[massage.id] ? 'rotate-180' : ''}"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {#if expandedDescriptions[massage.id]}
                        <p class="text-sm text-gray-600 mt-2">{massage.description}</p>
                      {/if}
                    </div>
                    <div class="flex-shrink-0 ml-4">
                      <div class="w-5 h-5 rounded-full border-2
                        {selectedMassageType === massage.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'}">
                        {#if selectedMassageType === massage.id}
                          <div class="w-full h-full flex items-center justify-center">
                            <div class="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Advanced Massages -->
  <section class="space-y-4">
    <button
      class="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors
        {showAdvancedMassages ? 'border-gray-200' : 'border-gray-200'}"
      on:click={() => showAdvancedMassages = !showAdvancedMassages}
    >
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">Advanced Massages</h2>
        <svg
          class="w-5 h-5 text-gray-500 transform transition-transform
            {showAdvancedMassages ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    {#if showAdvancedMassages}
      <div class="space-y-4 mt-4">
        {#each advancedMassages as massage}
          <div
            role="button"
            tabindex="0"
            class="w-full text-left cursor-pointer"
            on:click={() => handleMassageTypeSelect(massage.id as MassageType)}
            on:keydown={(e) => e.key === 'Enter' && handleMassageTypeSelect(massage.id as MassageType)}
          >
            <div
              class="border rounded-lg overflow-hidden transition-colors
                {selectedMassageType === massage.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'}"
            >
              <div class="p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-grow">
                    <h3 class="font-medium text-gray-900">{massage.title}</h3>
                    <button
                      class="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      on:click|stopPropagation={() => toggleDescription(massage.id)}
                    >
                      <span>{expandedDescriptions[massage.id] ? 'Hide details' : 'Learn more'}</span>
                      <svg
                        class="w-4 h-4 transform transition-transform
                          {expandedDescriptions[massage.id] ? 'rotate-180' : ''}"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {#if expandedDescriptions[massage.id]}
                      <p class="text-sm text-gray-600 mt-2">{massage.description}</p>
                    {/if}
                  </div>
                  <div class="flex-shrink-0 ml-4">
                    <div class="w-5 h-5 rounded-full border-2
                      {selectedMassageType === massage.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'}">
                      {#if selectedMassageType === massage.id}
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div> 